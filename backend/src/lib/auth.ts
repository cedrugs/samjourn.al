import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { FastifyRequest, FastifyReply } from "fastify";
import { db } from "../db";
import * as schema from "../db/schema";
import { eq } from "drizzle-orm";
import { APIError } from "better-auth/api";

export const auth = betterAuth({
	baseURL: process.env.FRONTEND_URL,
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {
			user: schema.users,
			account: schema.accounts,
			session: schema.sessions,
			verification: schema.verificationTokens,
		},
	}),
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		},
	},
	trustedOrigins: [process.env.FRONTEND_URL!, "http://localhost:5173"],
	account: {
		accountLinking: {
			enabled: true,
		},
	},
	databaseHooks: {
		user: {
			create: {
				before: async (user) => {
					const existingUser = await db.query.users.findFirst({
						where: eq(schema.users.email, user.email),
					});
					if (!existingUser) {
						throw new APIError("FORBIDDEN", { message: "User not allowed" });
					}
					return { data: user };
				},
			},
		},
	},
});

export async function authHandler(request: FastifyRequest, reply: FastifyReply) {
	const url = new URL(request.url, `http://${request.headers.host}`);

	const headers = new Headers();
	Object.entries(request.headers).forEach(([key, value]) => {
		if (value) headers.append(key, value.toString());
	});

	const req = new Request(url.toString(), {
		method: request.method,
		headers,
		body: request.body ? JSON.stringify(request.body) : undefined,
	});

	const response = await auth.handler(req);

	reply.status(response.status);
	response.headers.forEach((value, key) => reply.header(key, value));
	return reply.send(response.body ? await response.text() : null);
}

export async function getSession(request: FastifyRequest) {
	const url = new URL("/api/auth/get-session", `http://${request.headers.host}`);

	const headers = new Headers();
	Object.entries(request.headers).forEach(([key, value]) => {
		if (value) headers.append(key, value.toString());
	});

	const req = new Request(url.toString(), { headers });
	const response = await auth.handler(req);

	if (!response.ok) return null;

	const session = await response.json();
	return session?.user ? session : null;
}
