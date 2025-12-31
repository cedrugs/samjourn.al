import { useSearchParams, Link } from "react-router-dom";

export function AuthError() {
	const [params] = useSearchParams();
	const error = params.get("error") || "Unknown error";

	return (
		<div className="text-center py-16">
			<h1 className="text-accent text-lg mb-4">Access Denied</h1>
			<p className="text-text-muted mb-8">{error.replace(/_/g, " ")}</p>
			<Link to="/" className="text-text-muted hover:text-text transition-colors">
				← Back to home
			</Link>
		</div>
	);
}
