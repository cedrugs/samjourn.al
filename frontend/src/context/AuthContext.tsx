import { createContext, useContext, type ReactNode } from "react";
import { authClient } from "../lib/auth-client";

interface User {
	id: string;
	email: string;
	name: string;
	image?: string | null;
}

interface AuthContextType {
	session: { user: User } | null;
	loading: boolean;
	login: () => void;
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const { data, isPending: loading } = authClient.useSession();
	const session = data ? { user: data.user as User } : null;

	const login = () => {
		authClient.signIn.social({
			provider: "google",
			callbackURL: `${window.location.origin}/admin`,
		});
	};

	const logout = async () => {
		await authClient.signOut();
	};

	return (
		<AuthContext.Provider value={{ session, loading, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within AuthProvider");
	}
	return context;
}
