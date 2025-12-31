import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { getPosts, deletePost } from "../../lib/api";
import type { Post } from "../../types";
import { Input } from "../../components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../components/ui/select";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "../../components/ui/alert-dialog";

type SortOption = "latest" | "oldest";
type FilterOption = "all" | "journal" | "quiet-time";
type StatusOption = "all" | "draft" | "published";

export function AdminPosts() {
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [filter, setFilter] = useState<FilterOption>("all");
	const [statusFilter, setStatusFilter] = useState<StatusOption>("all");
	const [sort, setSort] = useState<SortOption>("latest");

	const loadPosts = () => {
		getPosts()
			.then(setPosts)
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		loadPosts();
	}, []);

	const filteredPosts = useMemo(() => {
		let result = posts;

		if (filter !== "all") {
			result = result.filter((post) => post.category === filter);
		}

		if (statusFilter !== "all") {
			result = result.filter((post) => post.status === statusFilter);
		}

		if (search) {
			const query = search.toLowerCase();
			result = result.filter((post) => {
				const title = (post.title || post.date).toLowerCase();
				return title.includes(query);
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
	}, [posts, search, filter, statusFilter, sort]);

	const handleDelete = async (id: string) => {
		try {
			await deletePost(id);
			toast.success("Post deleted");
			loadPosts();
		} catch {
			toast.error("Failed to delete post");
		}
	};

	if (loading) {
		return <div className="text-text-muted">Loading...</div>;
	}

	return (
		<div>
			<div className="flex justify-between items-center mb-6">
				<h1 className="font-medium">Posts</h1>
				<Link
					to="/admin/new"
					className="bg-accent text-white px-4 py-2 rounded hover:bg-accent-hover transition-colors"
				>
					New Post
				</Link>
			</div>

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
							<SelectItem value="all">All Categories</SelectItem>
							<SelectItem value="journal">Journal</SelectItem>
							<SelectItem value="quiet-time">Quiet Time</SelectItem>
						</SelectContent>
					</Select>
					<Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusOption)}>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Status</SelectItem>
							<SelectItem value="draft">Draft</SelectItem>
							<SelectItem value="published">Published</SelectItem>
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

			<div className="space-y-4">
				{filteredPosts.map((post) => (
					<div
						key={post.id}
						className="flex justify-between items-center p-4 border border-border rounded hover:bg-bg-secondary transition-colors"
					>
						<Link
							to={`/admin/edit/${post.id}`}
							className="flex-1"
						>
							<span className="font-medium text-accent">
								{post.title || post.date}
							</span>
							<div className="flex gap-4 mt-1 text-text-muted">
								<span>{post.category}</span>
								<span>{post.date}</span>
								<span className={post.status === "published" ? "text-accent" : ""}>
									{post.status}
								</span>
							</div>
						</Link>
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<button className="text-red-300 hover:text-white transition-colors">
									Delete
								</button>
							</AlertDialogTrigger>
							<AlertDialogContent className="bg-bg-secondary border-border">
								<AlertDialogHeader>
									<AlertDialogTitle>Delete post?</AlertDialogTitle>
									<AlertDialogDescription>
										This action cannot be undone.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel className="border-border text-text-muted hover:bg-bg hover:text-text">
										Cancel
									</AlertDialogCancel>
									<AlertDialogAction
										onClick={() => handleDelete(post.id)}
										className="bg-red-900 text-red-100 hover:bg-red-800"
									>
										Delete
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				))}
				{filteredPosts.length === 0 && (
					<p className="text-text-muted">No posts found.</p>
				)}
			</div>
		</div>
	);
}
