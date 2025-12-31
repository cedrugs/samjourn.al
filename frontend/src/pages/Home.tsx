import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { getPosts } from "../lib/api";
import type { Post } from "../types";
import { Input } from "../components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";

function getExcerpt(content: string | null): string {
    if (!content) return "";
    try {
        const parsed = JSON.parse(content);
        const text = parsed.content
            ?.map((node: { content?: { text?: string }[] }) =>
                node.content?.map((c) => c.text).join("") || ""
            )
            .join(" ") || "";
        return text.slice(0, 150) + (text.length > 150 ? "..." : "");
    } catch {
        return "";
    }
}

type SortOption = "latest" | "oldest";
type FilterOption = "all" | "journal" | "quiet-time";

export function Home() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<FilterOption>("all");
    const [sort, setSort] = useState<SortOption>("latest");

    useEffect(() => {
        getPosts("published")
            .then(setPosts)
            .finally(() => setLoading(false));
    }, []);

    const filteredPosts = useMemo(() => {
        let result = posts;

        if (filter !== "all") {
            result = result.filter((post) => post.category === filter);
        }

        if (search) {
            const query = search.toLowerCase();
            result = result.filter((post) => {
                const title = (post.title || post.date).toLowerCase();
                const excerpt = getExcerpt(post.content).toLowerCase();
                return title.includes(query) || excerpt.includes(query);
            });
        }

        result = [...result].sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            if (sort === "latest") {
                return dateB - dateA;
            }
            return dateA - dateB;
        });

        return result;
    }, [posts, search, filter, sort]);

    if (loading) {
        return <div className="text-text-muted">Loading...</div>;
    }

    return (
        <div>
            <div className="flex flex-col gap-4 mb-6">
                <Input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <div className="flex gap-4">
                    <Select value={filter} onValueChange={(v) => setFilter(v as FilterOption)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="journal">Journal</SelectItem>
                            <SelectItem value="quiet-time">Quiet Time</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="latest">Latest</SelectItem>
                            <SelectItem value="oldest">Oldest</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2 mt-15">
                {filteredPosts.map((post) => (
                    <Link
                        key={post.id}
                        to={`/${post.category}/${post.date}`}
                        className="block hover:bg-bg-secondary p-4 -mx-4 rounded transition-colors"
                    >
                        <article>
                            <h2 className="font-medium text-accent">
                                {post.title || post.date}
                            </h2>
                            <p className="text-text-muted mt-1">
                                {getExcerpt(post.content)}
                            </p>
                            <div className="flex gap-3 mt-2 text-text-muted">
                                {post.audioUrl && (
                                    <span className="flex items-center gap-0.5 h-3 mt-1.5">
                                        {[0.4, 0.7, 1, 0.5, 0.8, 0.3, 0.9, 0.6].map((h, i) => (
                                            <span key={i} className="w-0.5 bg-accent" style={{ height: `${h * 100}%` }} />
                                        ))}
                                    </span>
                                )}
                                <span>{post.category}</span>
                                <span>{post.date}</span>
                            </div>
                        </article>
                    </Link>
                ))}
                {filteredPosts.length === 0 && (
                    <p className="text-text-muted">No posts found.</p>
                )}
            </div>
        </div>
    );
}
