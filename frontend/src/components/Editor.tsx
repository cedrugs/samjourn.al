import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";

interface EditorProps {
	content: string;
	onChange: (content: string) => void;
}

function ToolbarButton({
	onClick,
	active,
	children,
}: {
	onClick: () => void;
	active?: boolean;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`px-2 py-1 rounded text-sm transition-colors ${
				active ? "bg-accent text-white" : "text-text-muted hover:text-text hover:bg-bg"
			}`}
		>
			{children}
		</button>
	);
}

export function Editor({ content, onChange }: EditorProps) {
	const editor = useEditor({
		extensions: [
			StarterKit,
			Placeholder.configure({
				placeholder: "Start writing...",
			}),
		],
		content: content ? JSON.parse(content) : { type: "doc", content: [] },
		onUpdate: ({ editor }) => {
			onChange(JSON.stringify(editor.getJSON()));
		},
	});

	useEffect(() => {
		if (editor && content) {
			const currentContent = JSON.stringify(editor.getJSON());
			if (currentContent !== content) {
				editor.commands.setContent(JSON.parse(content));
			}
		}
	}, [content, editor]);

	if (!editor) return null;

	return (
		<div className="border border-border rounded bg-bg-secondary">
			<div className="flex flex-wrap gap-1 p-2 border-b border-border">
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleBold().run()}
					active={editor.isActive("bold")}
				>
					B
				</ToolbarButton>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleItalic().run()}
					active={editor.isActive("italic")}
				>
					I
				</ToolbarButton>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleStrike().run()}
					active={editor.isActive("strike")}
				>
					S
				</ToolbarButton>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleCode().run()}
					active={editor.isActive("code")}
				>
					{"<>"}
				</ToolbarButton>
				<div className="w-px bg-border mx-1" />
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
					active={editor.isActive("heading", { level: 1 })}
				>
					H1
				</ToolbarButton>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
					active={editor.isActive("heading", { level: 2 })}
				>
					H2
				</ToolbarButton>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
					active={editor.isActive("heading", { level: 3 })}
				>
					H3
				</ToolbarButton>
				<div className="w-px bg-border mx-1" />
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleBulletList().run()}
					active={editor.isActive("bulletList")}
				>
					•
				</ToolbarButton>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleOrderedList().run()}
					active={editor.isActive("orderedList")}
				>
					1.
				</ToolbarButton>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleBlockquote().run()}
					active={editor.isActive("blockquote")}
				>
					"
				</ToolbarButton>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleCodeBlock().run()}
					active={editor.isActive("codeBlock")}
				>
					{"{ }"}
				</ToolbarButton>
				<div className="w-px bg-border mx-1" />
				<ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()}>
					—
				</ToolbarButton>
			</div>
			<EditorContent
				editor={editor}
				className="min-h-[300px] p-4
					[&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[280px]
					[&_.ProseMirror_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child]:before:text-text-muted [&_.ProseMirror_p.is-editor-empty:first-child]:before:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child]:before:float-left [&_.ProseMirror_p.is-editor-empty:first-child]:before:h-0
					[&_.ProseMirror_p]:mb-4
					[&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-semibold [&_.ProseMirror_h1]:mt-6 [&_.ProseMirror_h1]:mb-3
					[&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:mt-6 [&_.ProseMirror_h2]:mb-3
					[&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:mt-6 [&_.ProseMirror_h3]:mb-3
					[&_.ProseMirror_blockquote]:border-l-2 [&_.ProseMirror_blockquote]:border-accent [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:my-4 [&_.ProseMirror_blockquote]:text-text-muted
					[&_.ProseMirror_code]:bg-bg [&_.ProseMirror_code]:px-1.5 [&_.ProseMirror_code]:py-0.5 [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:text-sm
					[&_.ProseMirror_pre]:bg-bg [&_.ProseMirror_pre]:p-4 [&_.ProseMirror_pre]:rounded [&_.ProseMirror_pre]:overflow-x-auto
					[&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_ul]:my-4
					[&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_ol]:my-4
					[&_.ProseMirror_li]:my-1
					[&_.ProseMirror_hr]:border-border [&_.ProseMirror_hr]:my-6"
			/>
		</div>
	);
}
