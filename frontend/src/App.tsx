import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { PostPage } from "./pages/PostPage";
import { AuthCallback } from "./pages/AuthCallback";
import { AuthError } from "./pages/AuthError";
import { NotFound } from "./pages/NotFound";
import { AdminLayout } from "./components/AdminLayout";
import { AdminPosts } from "./pages/admin/AdminPosts";
import { AdminEditor } from "./pages/admin/AdminEditor";
import { Toaster } from "./components/ui/sonner";

export function App() {
	return (
		<AuthProvider>
			<Routes>
				<Route element={<Layout />}>
					<Route path="/" element={<Home />} />
					<Route path="/journal/:date" element={<PostPage />} />
					<Route path="/quiet-time/:date" element={<PostPage />} />
					<Route path="/auth/error" element={<AuthError />} />
					<Route path="*" element={<NotFound />} />
				</Route>
				<Route path="/auth/callback" element={<AuthCallback />} />
				<Route path="/admin" element={<AdminLayout />}>
					<Route index element={<AdminPosts />} />
					<Route path="new" element={<AdminEditor />} />
					<Route path="edit/:id" element={<AdminEditor />} />
				</Route>
			</Routes>
			<Toaster />
		</AuthProvider>
	);
}
