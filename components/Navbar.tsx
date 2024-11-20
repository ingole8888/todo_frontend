import { useRouter } from "next/router"
import { useEffect, useState } from "react";

export default function Navbar() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkToken = () => {
            const token = localStorage.getItem("logToken");
            const userId = localStorage.getItem("loguserId");
            setIsAuthenticated(!!token && !!userId);
        };
        checkToken();
        router.events.on("routeChangeComplete", checkToken);
        return () => {
            router.events.off("hashChangeComplete", checkToken);
        };
    }, [router.events]);

    const handleLogout = () => {
        localStorage.removeItem("logToken");
        localStorage.removeItem("loguserId");
        setIsAuthenticated(false);
        router.push('/login');
    }

    const handleLogin = () => {
        router.push('/login');
    }

    return (
        <nav className="bg-blue-500 text-white px-6 py-4">
            <div className="flex justify-between items-center">
                <div>
                    <button
                        onClick={() => router.push('/blog')}
                        className="text-xl font-bold hover:text-gray-200"
                    >
                        Blog App
                    </button>
                </div>
                <div className="space-x-4">
                    <button
                        onClick={() => router.push('/signup')}
                        className="hover:underline"
                    >
                        SignUp
                    </button>
                    <button
                        onClick={() => router.push('/blog')}
                        className="hover:underline"
                    >
                        Blog
                    </button>
                    {
                        isAuthenticated ? (
                            <button
                                onClick={handleLogout}
                                className="hover:underline"
                            >
                                Logout
                            </button>
                        ) : (
                            <button
                                onClick={handleLogin}
                                className="hover:underline"
                            >
                                Login
                            </button>
                        )
                    }
                </div>
            </div>
        </nav>
    )
}