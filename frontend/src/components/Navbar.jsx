import { Link, useNavigate } from "react-router-dom";
import { Sun, Moon, Logout, Link2 } from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { useThemeStore } from "../stores/themeStore";


function Navbar() {
    const navigate = useNavigate();

    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const theme = useThemeStore((state) => state.theme);
    const toggleTheme = useThemeStore((state) => state.toggleTheme);

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <header className={`navbar ${theme}`}>
            <Link to="/" className="navbar-logo">
                <Link2 size={22} />
                <span>Linkly</span>
            </Link>
            <nav className="navbar-links">
                <Link to="/" className="navbar-link">
                    Home
                </Link>
                <Link to="/dashboard" className="navbar-link">
                    Dashboard
                </Link>
            </nav>
            <div className="navbar-actions">
                <button
                    type="button"
                    className="theme-toggle"
                    onClick={toggleTheme}
                    aria-label={`Switch to ${theme === "dark" ? "light" : "dark" } theme`}
                    title="Toggle theme"
                >
                    {theme === "dark" ? (
                        <Sun size={19} />
                    ) : (
                        <Moon size={19} />
                    )}

                </button>

                {user ? (
                    <div className="navbar-user">
                        <span className="navbar-greeting">
                            Hi, {user.username || user.email || "there"}
                        </span>
                        <button 
                            type="button"
                            className="navbar-logout"
                            onClick={handleLogout}
                            aria-label="Logout"
                        >
                            <Logout size={19} />
                            <span>Logout</span>
                        </button>
                    </div>
                ) : (
                    <div className="navbar-auth-links">
                        <Link to="/login" className="navbar-login">
                            Login
                        </Link>
                        <Link to="/register" className="navbar-register">
                            Register
                        </Link>
                    </div>
                )}

            </div>

        </header>
    )

}

export default Navbar;