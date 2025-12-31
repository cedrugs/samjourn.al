import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export function NotFound() {
	return (
		<div className="text-center py-16">
			<Helmet>
				<title>404 | samjourn.al</title>
			</Helmet>
			<h1 className="text-accent text-lg mb-4">404</h1>
			<p className="text-text-muted mb-8">Page not found</p>
			<Link to="/" className="text-text-muted hover:text-text transition-colors">
				← Back to home
			</Link>
		</div>
	);
}
