import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import { readFileSync } from "fs";
import { join } from "path";
import { authHandler } from "./lib/auth";
import { postRoutes } from "./routes/posts";
import { db } from "./db";
import { posts } from "./db/schema";
import { eq } from "drizzle-orm";

const fastify = Fastify({ logger: true });
const isProd = process.env.NODE_ENV === "production";
const distPath = isProd ? "/app/frontend/dist" : join(import.meta.dir, "../../frontend/dist");

let indexHtml = "";
if (isProd) {
	indexHtml = readFileSync(join(distPath, "index.html"), "utf-8");
}

const s3Domain = new URL(process.env.S3_ENDPOINT!).origin;

const securityHeaders = {
	"Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
	"X-Content-Type-Options": "nosniff",
	"X-Frame-Options": "SAMEORIGIN",
	"Referrer-Policy": "strict-origin-when-cross-origin",
	"Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
	"Content-Security-Policy": `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self' ${s3Domain}; media-src 'self' blob: data: ${s3Domain}; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'`,
};

await fastify.register(cors, {
	origin: true,
	credentials: true,
});

await fastify.register(cookie);
await fastify.register(multipart, { limits: { fileSize: 50 * 1024 * 1024 } });

fastify.route({
	method: ["GET", "POST"],
	url: "/api/auth/*",
	handler: authHandler,
});

fastify.get("/api/auth/error", async (request, reply) => {
	const error = (request.query as { error?: string }).error || "unknown";
	reply.redirect(`${process.env.FRONTEND_URL}/auth/error?error=${error}`);
});

await fastify.register(postRoutes);

fastify.get("/sitemap.xml", async (_, reply) => {
	const published = await db.select().from(posts).where(eq(posts.status, "published"));
	const urls = published.map(p => `
  <url>
    <loc>https://samjourn.al/${p.category}/${p.date}</loc>
    <lastmod>${new Date(p.updatedAt).toISOString().split("T")[0]}</lastmod>
  </url>`).join("");
	
	reply.header("Content-Type", "application/xml");
	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://samjourn.al</loc>
  </url>${urls}
</urlset>`;
});

if (isProd) {
	await fastify.register(fastifyStatic, {
		root: join(distPath, "assets"),
		prefix: "/assets/",
	});

	function serveIndex(reply: any) {
		Object.entries(securityHeaders).forEach(([k, v]) => reply.header(k, v));
		return reply.type("text/html").send(indexHtml);
	}

	fastify.get("/", async (_, reply) => serveIndex(reply));
	fastify.get("/favicon.svg", async (_, reply) => reply.type("image/svg+xml").send(readFileSync(join(distPath, "favicon.svg"))));
	fastify.get("/robots.txt", async (_, reply) => reply.type("text/plain").send(readFileSync(join(distPath, "robots.txt"))));
	fastify.get("/og-image.svg", async (_, reply) => reply.type("image/svg+xml").send(readFileSync(join(distPath, "og-image.svg"))));

	fastify.setNotFoundHandler(async (request, reply) => {
		if (request.url.startsWith("/api/")) {
			return reply.status(404).send({ error: "Not found" });
		}
		return serveIndex(reply);
	});
}

fastify.listen({ port: 3000, host: "0.0.0.0" }, (err) => {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}
});
