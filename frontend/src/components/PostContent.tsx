import { generateHTML } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface PostContentProps {
	content: string;
}

export function PostContent({ content }: PostContentProps) {
	const html = generateHTML(JSON.parse(content), [StarterKit]);

	return (
		<div
			className="leading-relaxed
				[&_p]:mb-4
				[&_h1]:font-semibold [&_h1]:mt-6 [&_h1]:mb-3
				[&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-3
				[&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2
				[&_blockquote]:border-l-2 [&_blockquote]:border-accent [&_blockquote]:pl-4 [&_blockquote]:my-4 [&_blockquote]:text-text-muted [&_blockquote]:italic
				[&_ul]:my-3 [&_ul]:pl-5 [&_ul]:list-disc
				[&_ol]:my-3 [&_ol]:pl-5 [&_ol]:list-decimal
				[&_li]:my-1
				[&_code]:bg-bg-secondary [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded
				[&_pre]:bg-bg-secondary [&_pre]:p-3 [&_pre]:rounded [&_pre]:overflow-x-auto [&_pre]:my-4
				[&_a]:text-accent [&_a]:underline [&_a]:hover:text-accent-hover"
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	);
}
