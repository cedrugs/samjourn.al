import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { db } from "../db";
import { posts } from "../db/schema";
import type { Category, Status } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getSession } from "../lib/auth";
import { uploadAudio } from "../lib/s3";

interface PostBody {
	category: Category;
	date: string;
	title?: string;
	content?: string;
	status?: Status;
}

interface PostParams {
	id: string;
}

async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
	const session = await getSession(request);
	if (!session) {
		reply.status(401).send({ error: "Unauthorized" });
		return null;
	}
	return session;
}

export async function postRoutes(fastify: FastifyInstance) {
	fastify.get("/api/posts", async (request: FastifyRequest, reply: FastifyReply) => {
		const { category, status } = request.query as { category?: Category; status?: Status };

		let query = db.select().from(posts).orderBy(desc(posts.date));

		if (category) {
			query = query.where(eq(posts.category, category)) as typeof query;
		}

		if (status) {
			query = query.where(eq(posts.status, status)) as typeof query;
		}

		const result = await query;
		return result;
	});

	fastify.get(
		"/api/posts/:id",
		async (
			request: FastifyRequest<{ Params: { id: string } }>,
			reply: FastifyReply
		) => {
			const { id } = request.params;

			// Check if it's a UUID (post by ID) or category (post by category/date)
			if (!id.includes("-")) {
				return reply.callNotFound();
			}

			const post = await db.query.posts.findFirst({
				where: eq(posts.id, id),
			});

			if (!post) {
				return reply.status(404).send({ error: "Post not found" });
			}

			return post;
		}
	);

	fastify.get(
		"/api/posts/:category/:date",
		async (
			request: FastifyRequest<{ Params: { category: Category; date: string } }>,
			reply: FastifyReply
		) => {
			const { category, date } = request.params;

			const post = await db.query.posts.findFirst({
				where: and(eq(posts.category, category), eq(posts.date, date)),
			});

			if (!post) {
				return reply.status(404).send({ error: "Post not found" });
			}

			return post;
		}
	);

	fastify.post(
		"/api/posts",
		async (request: FastifyRequest<{ Body: PostBody }>, reply: FastifyReply) => {
			const session = await requireAuth(request, reply);
			if (!session) return;

			const { category, date, title, content, status } = request.body;

			try {
				const [post] = await db
					.insert(posts)
					.values({
						category,
						date,
						title,
						content,
						status: status || "draft",
						publishedAt: status === "published" ? new Date() : null,
					})
					.returning();

				return post;
			} catch (err) {
				const error = err as { code?: string };
				if (error.code === "23505") {
					return reply.status(409).send({ error: `A ${category} post already exists for ${date}` });
				}
				throw err;
			}
		}
	);

	fastify.put(
		"/api/posts/:id",
		async (
			request: FastifyRequest<{ Params: PostParams; Body: Partial<PostBody> }>,
			reply: FastifyReply
		) => {
			const session = await requireAuth(request, reply);
			if (!session) return;

			const { id } = request.params;
			const { title, content, status } = request.body;

			const updateData: Record<string, unknown> = {
				updatedAt: new Date(),
			};

			if (title !== undefined) updateData.title = title;
			if (content !== undefined) updateData.content = content;
			if (status !== undefined) {
				updateData.status = status;
				if (status === "published") {
					updateData.publishedAt = new Date();
				}
			}

			const [post] = await db
				.update(posts)
				.set(updateData)
				.where(eq(posts.id, id))
				.returning();

			if (!post) {
				return reply.status(404).send({ error: "Post not found" });
			}

			return post;
		}
	);

	fastify.delete(
		"/api/posts/:id",
		async (request: FastifyRequest<{ Params: PostParams }>, reply: FastifyReply) => {
			const session = await requireAuth(request, reply);
			if (!session) return;

			const { id } = request.params;

			const [deleted] = await db.delete(posts).where(eq(posts.id, id)).returning();

			if (!deleted) {
				return reply.status(404).send({ error: "Post not found" });
			}

			return { success: true };
		}
	);

	fastify.post(
		"/api/posts/:id/audio",
		async (request: FastifyRequest<{ Params: PostParams }>, reply: FastifyReply) => {
			const session = await requireAuth(request, reply);
			if (!session) return;

			const { id } = request.params;
			const file = await request.file();

			if (!file) {
				return reply.status(400).send({ error: "No file uploaded" });
			}

			try {
				const buffer = await file.toBuffer();
				const audioUrl = await uploadAudio(buffer, file.filename);

				const [post] = await db
					.update(posts)
					.set({ audioUrl, updatedAt: new Date() })
					.where(eq(posts.id, id))
					.returning();

				return post;
			} catch (error) {
				const err = error as { message?: string; Code?: string };
				return reply.status(500).send({ 
					error: "Failed to upload audio file", 
					details: err.message || err.Code || "Unknown error"
				});
			}
		}
	);
}
