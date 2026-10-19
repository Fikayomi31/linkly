import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordInput from "../components/common/PasswordInput";
import useAuthStore from "../stores/authStore";
import { useThemeStore } from "../stores/themeStore";
import "./Auth.css";

function Login() {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const loading = useAuthStore((state) => state.loading);
    const error = useAuthStore((state) => state.error);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const theme = useThemeStore((state) => state.theme);    

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const result = await login(email, password);

        if (result.success) {
            navigate("/dashboard", {replace: true});
        }
        console
    };

    return (
        <main className={`auth-page ${theme}`}>
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
                        placeholder="Enter your password"
                        name="password"
                        autoComplete="current-password"
                        required
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Log in"}
                    </button>
                </form>

                <p>
                    Don't have an account? <Link to="/register">Register</Link>
                </p>
            </section>
        </main>
    );
}

export default Login;