import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
	return (
		<Sonner
			theme="dark"
			position="bottom-right"
			toastOptions={{
				unstyled: true,
				classNames: {
					toast: "flex items-center gap-2 bg-bg-secondary border border-border text-text font-mono text-sm px-4 py-3 rounded",
					success: "border-accent text-accent",
					error: "border-red-900 text-red-400",
				},
			}}
			{...props}
		/>
	);
};

export { Toaster };
