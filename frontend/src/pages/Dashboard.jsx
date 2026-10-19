import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import useAuthStore from "../stores/authStore";
import { useThemeStore } from "../stores/themeStore";
import "./Auth.css";

function Dashboard() {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { theme, toggleTheme } = useThemeStore();

  const [originalUrl, setOriginalUrl] = useState("");
  const [message, setMessage] = useState("");

  // Fetch URLs from Flask backend on mount
  useEffect(() => {
    let cancelled = false;

    async function fetchUrls() {
      try {
        const response = await api.get("/urls");

        if (!cancelled) {
          const data = response.data;
          setUrls(Array.isArray(data) ? data : data.urls || []);
        }
      } catch (err) {
        if (!cancelled) {
          if (err.response?.status === 401 || err.response?.status === 422) {
            logout();
            navigate("/login", { replace: true });
            return;
          }

          setError(
            err.response?.data?.message ||
              "Could not load your links. Please try again."
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

  // Handle creating a new short link
  async function handleShorten(e) {
    e.preventDefault();
    if (!originalUrl) return;

    try {
      await api.post("/urls", { original_url: originalUrl });
      setOriginalUrl("");
      setMessage("Link shortened successfully!");

      // Refresh URL list
      const response = await api.get("/urls");
      const data = response.data;
      setUrls(Array.isArray(data) ? data : data.urls || []);
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Failed to shorten link. Try again."
      );
    }
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <main className={`app ${theme}`}>
      <header className="nav">
        <div>
          <a className="logo" href="/">
            Linkly<span>®</span>
          </a>
        </div>
        <div>
          <nav className="nav-actions">
            {user ? (
              <button onClick={handleLogout} className="login-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                Log out
              </button>
            ) : (
              <>
                <Link to="/login" className="login-link">Login ↗</Link>
                <Link to="/register" className="register-button">Register Now</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <section className="hero">
        <h1>Shorten Your Links</h1>
        <p>
          Linkly is an efficient and easy to use URL shortening
          service that streamlines your online experience.
        </p>
        <form className="shorten-form" onSubmit={handleShorten}>
          <span className="link-icon">↗</span>
          <input
            type="url"
            placeholder="Enter your link here"
            value={originalUrl}
            onChange={(event) => {
              setOriginalUrl(event.target.value);
              setMessage("");
            }}
            aria-label="Enter your link here"
            required
          />
          <button type="submit">
            Shorten Now!
          </button>
        </form>
        {message && <p className="message">{message}</p>}

        <p className="usage-note">
          Welcome back, <strong>{user?.username || "User"}</strong>!
        </p>
      </section>

      <section className="list-section">
        <div className="table-heading">
          <h2>Your Links</h2>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === "dark" ? "☀ Light theme" : "☾ Dark theme"}
          </button>
        </div>

        {loading && <p className="dashboard-message">Loading your links...</p>}
        {error && <p className="auth-error">{error}</p>}

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Short Link</th>
                <th>Original Link</th>
                <th>QR Code</th>
                <th>Clicks</th>
                <th>Status</th>
                <th>Date Created</th>
              </tr>
            </thead>

            <tbody>
              {!loading && urls.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                    No links found. Create your first short link above!
                  </td>
                </tr>
              )}

              {urls.map((url) => {
                const shortCode = url.short_code || url.shortCode;
                const originalLink = url.original_url || url.originalUrl;
                const dateCreated = url.created_at || url.date || "N/A";
                const isActive = url.active !== undefined ? url.active : true;

                return (
                  <tr key={url.id}>
                    <td>
                      <div className="short-link">
                        <a href={`http://127.0.0.1:5000/${shortCode}`} target="_blank" rel="noopener noreferrer">
                          linkly.co/{shortCode}
                        </a>
                        <button className="copy-button"
                          title="Copy short link"
                          onClick={() => 
                            navigator.clipboard.writeText(
                              `http://127.0.0.1:5000/${shortCode}`
                            )
                          }
                        >
                          ▢
                        </button>
                      </div>
                    </td>
                    <td className="original-link">
                      <a className="original-link" href={originalLink} target="_blank" rel="noopener noreferrer">
                        {originalLink}
                      </a>
                    </td>
                    <td>
                      <span className="qr-placeholder">▦</span>
                    </td>
                    <td>{url.clicks ?? 0}</td>
                    <td>
                      <span className={isActive ? "status active" : "status inactive"}>
                        {isActive ? "● Active" : "● Inactive"}
                      </span>
                    </td>
                    <td>{dateCreated}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default Dashboard;