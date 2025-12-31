import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getPost } from "../lib/api";
import { AudioPlayer } from "../components/AudioPlayer";
import { PostContent } from "../components/PostContent";
import type { Post } from "../types";

function formatTimestamp(createdAt: string): string {
    const date = new Date(createdAt);
    return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getExcerpt(content: string | null): string {
    if (!content) return "";
    return content.replace(/<[^>]*>/g, "").slice(0, 160);
}

export function PostPage() {
    const { date } = useParams<{ date: string }>();
    const location = useLocation();
    const category = location.pathname.startsWith("/journal") ? "journal" : "quiet-time";

    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (date) {
            getPost(category, date)
                .then(setPost)
                .finally(() => setLoading(false));
        }
    }, [category, date]);

    if (loading) {
        return <div className="text-text-muted">Loading...</div>;
    }

    if (!post) {
        return <div className="text-text-muted">Post not found.</div>;
    }

    const title = post.title || `${category} - ${post.date}`;
    const description = getExcerpt(post.content);
    const url = `https://samjourn.al/${category}/${post.date}`;

    return (
        <article>
            <Helmet>
                <title>{title} | samjourn.al</title>
                <meta name="description" content={description} />
                <link rel="canonical" href={url} />
                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:url" content={url} />
                <meta property="og:type" content="article" />
                <meta name="twitter:title" content={title} />
                <meta name="twitter:description" content={description} />
            </Helmet>
            <header className="mb-6">
                {post.title && (
                    <h1 className="font-medium mb-1 text-base">{post.title}</h1>
                )}
                <p className="text-text-muted">
                    {formatTimestamp(post.createdAt)}
                </p>
            </header>

            {post.audioUrl && <AudioPlayer src={post.audioUrl} />}

            {post.content && <PostContent content={post.content} />}
        </article>
    );
}
