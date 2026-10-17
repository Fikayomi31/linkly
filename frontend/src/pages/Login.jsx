import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordInput from "../components/common/PasswordInput";
import api from "../services/api";
import useAuthStore  from "../stores/authStore";

function Login() {
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth)

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        setError("");
        setLoading(true);

        try {
            const res = await api.post("/login", {email, password});

            const data = res.data;

            // Save the token and user info
            setAuth(data.access_token, data.user);

            navigate("/dashboard");

        } catch (err) {
            setError(
                err.res?.data?.message ||
                err.res?.data?.error ||
                "Login failed. Check your email and password"
            );
        } finally {
            setLoading(false);
        }

        
    };

    return (
        <main className="auth-page">
            <section className="auth-card">
                <h1>Welcome back</h1>
                <p>Log in to manage your Linkly links.</p>

                {error && <p className="auth-error">{error}</p>}
                
                <form onSubmit={handleSubmit}>
                    <label htmlFor="email">Email address</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@example.com"
                        autoComplete="email"
                        required
                    />
                    <label htmlFor="password">Password</label>
                    <PasswordInput
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter ypur password"
                        name="password"
                        autoComplete="current-password"
                        required
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Log in"}
                    </button>
                </form>

                <p>
                    Don't have an account? <Link to="/register"><Register></Register></Link>
                </p>
            </section>

        </main>
    )
}

export default Login