import { useEffect, useState } from "react";
import { Link, replace, useNavigate } from "react-router-dom";
import api from "../services/api";
import useAuthStore from "../stores/authStore";
import { useThemeStore } from "../stores/themeStore";

import "./Auth.css";


function Dashboard() {

    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const theme = useThemeStore((state) => state.theme);

    const [url, setUrl] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function fetchUrls() {
            try {
                const response = await api.get("/urls")

                if (!cancelled) {
                    const data = response.data;
                    setUrls(Array.isArray(data) ? data : data.urld || [])
                }
            } catch (err) {
                if (!cancelled) {
                    if (err.response?.status === 402) {
                        logout();
                        navigate("/login", { replace: true });
                        return;
                    }

                    setError(
                        err.response?.data?.message ||
                          "Could not load your links. Please try again"
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchUrls();

        return () => {
            cancelled = true;
        };
    }, [logout, navigate]);

    function handleLogout() {
        logout();
        navigate("/login", { replace: true });
    }

    return (
        <main className={`dashboard-page ${theme}`}>
            <section className="auth card dashboard-card">
                <h1>Linkly Dashboard</h1>

                <p>
                    Welcome, {user?.username ? `, ${user.username}` : ""}!
                    Manage your shortened links here.
                </p>

                <div className="dashboard-actions">
                    <Link to="/" className="dashboard-link">Home</Link>
        
                    <button onClick={handleLogout}>Log out

                    </button>
                </div>

                <h2>Your links</h2>
                    {loading && <p>loading your links...</p>}

                    {error && (
                        <p className="auth-error">{error}</p>
                    )}

                    {!loading && !error && url.length === 0 && (
                        <p>You have no links yet. Start by shortening a link on the <Link to="/">home page</Link>.</p>
                    )}

                    {!loading && !error && url.length > 0 && (
                        <ul className="dashboard-url-list">
                            {urls.map((url) => (
                                <li key={url.id}>
                                    <strong>{url.short_code || url.shortCode}</strong>
                                    <p>{url.original_url || url.originalUrl}</p>
                                </li>
                            ))}

                        </ul>
                    )}
            </section>
        </main>
    )
}


export default Dashboard;