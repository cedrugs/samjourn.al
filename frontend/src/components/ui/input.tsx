import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
	return (
		<input
			type={type}
			className={cn(
				"h-10 w-full rounded border border-border bg-bg-secondary px-3 text-text placeholder:text-text-muted outline-none focus:border-accent transition-colors",
				className
			)}
			{...props}
		/>
	);
}

export { Input };
