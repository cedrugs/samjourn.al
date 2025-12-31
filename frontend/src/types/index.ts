export interface Post {
    id: string;
    category: "journal" | "quiet-time";
    date: string;
    title: string | null;
    content: string | null;
    audioUrl: string | null;
    status: "draft" | "published";
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface User {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
}

export interface Session {
    user: User;
    expires: string;
}
