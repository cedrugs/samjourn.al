import type { Post } from "../types";

const API_BASE = "/api";

export class ApiError extends Error {
	constructor(public status: number, message: string) {
		super(message);
	}
}

export async function getPosts(status?: "published" | "draft"): Promise<Post[]> {
	const params = status ? `?status=${status}` : "";
	const res = await fetch(`${API_BASE}/posts${params}`, { credentials: "include" });
	return res.json();
}

export async function getPost(category: string, date: string): Promise<Post | null> {
	const res = await fetch(`${API_BASE}/posts/${category}/${date}`, { credentials: "include" });
	if (!res.ok) return null;
	return res.json();
}

export async function getPostById(id: string): Promise<Post | null> {
	const res = await fetch(`${API_BASE}/posts/${id}`, { credentials: "include" });
	if (!res.ok) return null;
	return res.json();
}

export async function createPost(data: {
	category: "journal" | "quiet-time";
	date: string;
	title?: string;
	content?: string;
	status?: "draft" | "published";
}): Promise<Post> {
	const res = await fetch(`${API_BASE}/posts`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(data),
	});
	if (!res.ok) {
		const error = await res.json();
		if (res.status === 409) {
			throw new ApiError(409, `A ${data.category} post already exists for ${data.date}`);
		}
		throw new ApiError(res.status, error.message || "Failed to create post");
	}
	return res.json();
}

export async function updatePost(
	id: string,
	data: Partial<{
		title: string;
		content: string;
		status: "draft" | "published";
	}>
): Promise<Post> {
	const res = await fetch(`${API_BASE}/posts/${id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(data),
	});
	if (!res.ok) {
		const error = await res.json();
		throw new ApiError(res.status, error.message || "Failed to update post");
	}
	return res.json();
}

export async function deletePost(id: string): Promise<void> {
	await fetch(`${API_BASE}/posts/${id}`, {
		method: "DELETE",
		credentials: "include",
	});
}

export async function uploadAudio(postId: string, file: File): Promise<Post> {
	const formData = new FormData();
	formData.append("file", file);

	const res = await fetch(`${API_BASE}/posts/${postId}/audio`, {
		method: "POST",
		credentials: "include",
		body: formData,
	});
	if (!res.ok) {
		const error = await res.json();
		throw new ApiError(res.status, error.error || "Failed to upload audio");
	}
	return res.json();
}
