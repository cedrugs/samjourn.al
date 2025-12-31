import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Select({
	...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
	return <SelectPrimitive.Root {...props} />;
}

function SelectValue({
	...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
	return <SelectPrimitive.Value {...props} />;
}

function SelectTrigger({
	className,
	children,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
	return (
		<SelectPrimitive.Trigger
			className={cn(
				"flex h-10 items-center justify-between gap-2 rounded border border-border bg-bg-secondary px-3 text-text outline-none focus:border-accent transition-colors",
				className
			)}
			{...props}
		>
			{children}
			<SelectPrimitive.Icon asChild>
				<ChevronDownIcon className="size-4 text-text-muted" />
			</SelectPrimitive.Icon>
		</SelectPrimitive.Trigger>
	);
}

function SelectContent({
	className,
	children,
	position = "popper",
	...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
	return (
		<SelectPrimitive.Portal>
			<SelectPrimitive.Content
				className={cn(
					"relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded border border-border bg-bg-secondary text-text shadow-md",
					position === "popper" && "translate-y-1",
					className
				)}
				position={position}
				{...props}
			>
				<SelectPrimitive.Viewport
					className={cn(
						"p-1",
						position === "popper" && "w-full min-w-[var(--radix-select-trigger-width)]"
					)}
				>
					{children}
				</SelectPrimitive.Viewport>
			</SelectPrimitive.Content>
		</SelectPrimitive.Portal>
	);
}

function SelectItem({
	className,
	children,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
	return (
		<SelectPrimitive.Item
			className={cn(
				"relative flex w-full cursor-pointer items-center rounded px-3 py-2 pr-8 text-text outline-none select-none hover:bg-bg focus:bg-bg",
				className
			)}
			{...props}
		>
			<span className="absolute right-2 flex size-4 items-center justify-center">
				<SelectPrimitive.ItemIndicator>
					<CheckIcon className="size-4 text-accent" />
				</SelectPrimitive.ItemIndicator>
			</span>
			<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
		</SelectPrimitive.Item>
	);
}

export {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
};
