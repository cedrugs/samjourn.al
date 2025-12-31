import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function AdminLayout() {
    const { session, loading, login, logout } = useAuth();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-text-muted">
                Loading...
            </div>
        );
    }

    if (!session) {
        return (
            <div className="max-w-2xl mx-auto px-8 py-16">
                <header className="flex justify-between items-center mb-12">
                    <Link to="/" className="font-medium text-accent text-base">
                        sam's journal
                    </Link>
                </header>
                <main className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                    <p className="text-text-muted">Sign in to access admin</p>
                    <button
                        onClick={login}
                        className="border border-border text-text-muted px-4 py-2 rounded hover:border-text-muted hover:text-text transition-all"
                    >
                        Login with Google
                    </button>
                </main>
                <footer className="mt-16 pt-8 border-t border-border text-center text-text-muted text-xs">
                    © {new Date().getFullYear()} samjourn.al. all rights reserved.
                </footer>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-8 py-16">
            <header className="flex justify-between items-center mb-12">
                <Link to="/" className="font-medium text-accent text-base">
                    sam's journal
                </Link>
                <nav className="flex gap-4 items-center">
                    <button
                        onClick={logout}
                        className="text-red-300 hover:text-text transition-colors cursor-pointer"
                    >
                        Logout
                    </button>
                </nav>
            </header>
            <main>
                <Outlet />
            </main>
            <footer className="mt-16 pt-8 border-t border-border text-center text-text-muted text-xs">
                © {new Date().getFullYear()} samjourn.al. all rights reserved.
            </footer>
        </div>
    );
}
