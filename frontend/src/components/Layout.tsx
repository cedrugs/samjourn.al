import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Layout() {
    const { session } = useAuth();

    return (
        <div className="max-w-2xl mx-auto px-8 py-16">
            <header className="flex justify-between items-center mb-12">
                <Link to="/" className="font-medium text-accent text-base">
                    sam's journal
                </Link>
                {session && (
                    <Link to="/admin" className="text-text-muted hover:text-text transition-colors">
                        Admin
                    </Link>
                )}
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
