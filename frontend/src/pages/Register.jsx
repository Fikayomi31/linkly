import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordInput from "../components/common/PasswordInput";
import api from "../services/api";

import { useThemeStore } from "../stores/themeStore";

import "./Auth.css"

function Register() {
    const navigate = useNavigate();
    
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("")
    const [loading, setLoading] = useState(false);

    const theme = useThemeStore((state) => state.theme);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        // Check that both password match.
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        // Match the minimum password length
        if (password.length < 8) {
            setError("Password must contain at least 8 characters.")
            return;
        }
        setLoading(true);

        try {
            await api.post("/register", {
                username: username.trim(),
                email: email.trim(),
                password,
            });
            setSuccess("Registration successful! Redirecting to login...");

            setTimeout(() => {
                navigate("/login");

            }, 1200);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }

    };

    return (
        <main className={`auth-page ${theme}`}>
            <section className="auth-card">
                <h1>Create your Linkly account</h1>
                <p>Sign up to shorten and manage your links.</p>

                {error && (
                    <p className="auth-error">
                        {error}
                    </p>
                )}
                {success && (
                    <p className="auth-success">
                        {success}
                    </p>
                )}

                <form onSubmit={handleSubmit}>
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoComplete="username"
                        required
                    />
                    <label htmlFor="email">Email</label>
                    <input 
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                    />
                    <label htmlFor="password">Password</label>
                    <PasswordInput
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a password"
                        name="password"
                        id="password"
                    />
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <PasswordInput
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Enter password again"
                        name="confirmPassword"
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? "Creating account..." : "Create Account"}
                    </button>
                    

                </form>
                <p className="auth-footer">
                    Already have an account? <Link to="/login">Login</Link>
                </p>

            </section>

        </main>
    )
}

export default Register;
