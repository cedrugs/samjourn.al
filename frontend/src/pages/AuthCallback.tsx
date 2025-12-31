import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export function AuthCallback() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	useEffect(() => {
		const code = searchParams.get("code");
		if (code) {
			fetch("/api/auth/callback/google?" + searchParams.toString(), {
				credentials: "include",
			}).then(() => {
				navigate("/admin");
			});
		}
	}, [searchParams, navigate]);

	return (
		<div className="flex justify-center items-center h-screen text-text-muted">
			Authenticating...
		</div>
	);
}
