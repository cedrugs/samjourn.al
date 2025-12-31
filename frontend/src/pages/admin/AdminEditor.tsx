import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Editor } from "../../components/Editor";
import { createPost, updatePost, uploadAudio, getPostById, deletePost, ApiError } from "../../lib/api";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";
import { DatePicker } from "../../components/DatePicker";

export function AdminEditor() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [category, setCategory] = useState<"journal" | "quiet-time">("journal");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0] || "");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [status, setStatus] = useState<"draft" | "published">("draft");
    const [postId, setPostId] = useState<string | null>(id || null);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(isEditing);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [audioFilename, setAudioFilename] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [originalTitle, setOriginalTitle] = useState("");
    const [originalContent, setOriginalContent] = useState("");

    const hasChanges = title !== originalTitle || content !== originalContent || !!audioFile;

    useEffect(() => {
        if (id) {
            getPostById(id).then((post) => {
                if (post) {
                    setCategory(post.category);
                    setDate(post.date);
                    setTitle(post.title || "");
                    setContent(post.content || "");
                    setStatus(post.status);
                    if (post.audioUrl) {
                        const filename = post.audioUrl.split("/").pop() || "audio.mp3";
                        setAudioFilename(filename);
                    }
                    setOriginalTitle(post.title || "");
                    setOriginalContent(post.content || "");
                }
                setLoading(false);
            });
        }
    }, [id]);

    const handleSave = async (newStatus?: "draft" | "published") => {
        setSaving(true);
        try {
            const finalStatus = newStatus || status;
            let currentPostId = postId;

            if (currentPostId) {
                await updatePost(currentPostId, {
                    title: title || undefined,
                    content: content || undefined,
                    status: finalStatus,
                });
            } else {
                const post = await createPost({
                    category,
                    date,
                    title: title || undefined,
                    content: content || undefined,
                    status: finalStatus,
                });
                currentPostId = post.id;
                setPostId(post.id);
            }

            if (audioFile && currentPostId) {
                await uploadAudio(currentPostId, audioFile);
                setAudioFilename(audioFile.name);
                setAudioFile(null);
            }

            setStatus(finalStatus);
            setOriginalTitle(title);
            setOriginalContent(content);

            if (newStatus === "published") {
                toast.success("Post published");
            } else {
                toast.success("Post saved");
            }
        } catch (err) {
            if (err instanceof ApiError) {
                toast.error(err.message);
            } else {
                toast.error("An unexpected error occurred");
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!postId) return;
        try {
            await deletePost(postId);
            toast.success("Post deleted");
            navigate("/admin");
        } catch {
            toast.error("Failed to delete post");
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAudioFile(file);
        }
    };

    if (loading) {
        return <div className="text-text-muted">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="font-medium">
                    {isEditing ? "Edit Post" : "New Post"}
                </h1>
                <div className="flex gap-2">
                    {isEditing && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <button className="border border-red-900 text-red-400 px-4 py-2 rounded hover:bg-red-900/20 transition-all">
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
                                        onClick={handleDelete}
                                        className="bg-red-900 text-red-100 hover:bg-red-800"
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                    <button
                        onClick={() => handleSave()}
                        disabled={saving || !hasChanges}
                        className={`border px-4 py-2 rounded transition-all disabled:opacity-50 ${hasChanges
                            ? "border-accent text-accent hover:bg-accent hover:text-white"
                            : "border-border text-text-muted"
                            }`}
                    >
                        {saving ? "Saving..." : "Save"}
                    </button>
                    {status !== "published" && (
                        <button
                            onClick={() => handleSave("published")}
                            disabled={saving}
                            className="bg-accent text-white px-4 py-2 rounded hover:bg-accent-hover transition-colors disabled:opacity-50"
                        >
                            {saving ? "Publishing..." : "Publish"}
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-text-muted mb-2">Category</label>
                    <Select
                        value={category}
                        onValueChange={(v) => setCategory(v as "journal" | "quiet-time")}
                        disabled={isEditing || !!postId}
                    >
                        <SelectTrigger className="w-full h-10 bg-bg-secondary border-border text-text">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-bg-secondary border-border">
                            <SelectItem value="journal" className="text-text hover:bg-border focus:bg-border focus:text-text">Journal</SelectItem>
                            <SelectItem value="quiet-time" className="text-text hover:bg-border focus:bg-border focus:text-text">Quiet Time</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="block text-text-muted mb-2">Date</label>
                    <DatePicker
                        value={date}
                        onChange={setDate}
                        disabled={isEditing || !!postId}
                    />
                </div>
            </div>

            <div>
                <label className="block text-text-muted mb-2">Title (optional)</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Leave empty to use date"
                    className="w-full h-10 bg-bg-secondary border border-border rounded px-3 text-text placeholder:text-text-muted"
                />
            </div>

            <div>
                <label className="block text-text-muted mb-2">Content</label>
                <Editor content={content} onChange={setContent} />
            </div>

            <div>
                <label className="block text-text-muted mb-2">Audio (optional)</label>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-border text-text-muted px-4 py-2 rounded hover:border-text-muted hover:text-text transition-all"
                >
                    {audioFile ? audioFile.name : audioFilename || "Choose File"}
                </button>
            </div>

            <button
                onClick={() => navigate("/admin")}
                className="text-text-muted hover:text-text transition-colors"
            >
                ← Back to posts
            </button>
        </div>
    );
}
