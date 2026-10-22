
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import useAuthStore from "../stores/authStore";
import { useThemeStore } from "../stores/themeStore";
import "./Auth.css";

// Fetch analytics for each URL and attach its click count.
async function addClickCounts(urlList) {
  return Promise.all(
    urlList.map(async (url) => {
      try {
        const response = await api.get(`/urls/${url.id}/analytics`);
        const data = response.data;

        // Read the click count from common response formats.
        const rawCount =
          data.total_clicks ??
          data.total_click_count ??
          data.click_count ??
          data.clicks ??
          data.count ??
          0;

        const clickCount = Array.isArray(rawCount)
          ? rawCount.length
          : Number(rawCount) || 0;

        return {
          ...url,
          clicks: clickCount,
        };
      } catch (error) {
        console.error(
          `Could not fetch analytics for URL ${url.id}:`,
          error
        );

        return {
          ...url,
          clicks: Number(url.clicks ?? url.click_count ?? 0) || 0,
        };
      }
    })
  );
}

function Dashboard() {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { theme, toggleTheme } = useThemeStore();

  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [qrImage, setQrImage] = useState(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const [originalUrl, setOriginalUrl] = useState("");
  const [message, setMessage] = useState("");

  // Fetch URLs and their click counts.
  async function fetchUrls() {
    const response = await api.get("/urls");
    const data = response.data;
    const urlList = Array.isArray(data) ? data : data.urls || [];

    const urlsWithClicks = await addClickCounts(urlList);
    setUrls(urlsWithClicks);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const response = await api.get("/urls");
        const data = response.data;
        const urlList = Array.isArray(data) ? data : data.urls || [];

        const urlsWithClicks = await addClickCounts(urlList);

        if (!cancelled) {
          setUrls(urlsWithClicks);
        }
      } catch (err) {
        if (!cancelled) {
          if (
            err.response?.status === 401 ||
            err.response?.status === 422
          ) {
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

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [logout, navigate]);

  // Shorten a new link.
  async function handleShorten(event) {
    event.preventDefault();

    const trimmedUrl = originalUrl.trim();

    if (!trimmedUrl) {
      return;
    }

    setMessage("");

    try {
      await api.post("/urls", {
        original_url: trimmedUrl,
      });

      setOriginalUrl("");
      setMessage("Link shortened successfully!");

      await fetchUrls();
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          "Failed to shorten link. Please try again."
      );
    }
  }

  // Fetch and display a QR code.
  async function handleViewQr(urlId) {
    try {
      setQrImage(null);
      setIsQrModalOpen(true);

      const response = await api.get(`/urls/${urlId}/qrcode`, {
        responseType: "blob",
      });

      const imageUrl = URL.createObjectURL(response.data);
      setQrImage(imageUrl);
    } catch (err) {
      setIsQrModalOpen(false);

      console.error("Error fetching QR code:", err);

      setMessage(
        err.response?.data?.message ||
          "Could not load the QR code. Check the backend QR endpoint."
      );
    }
  }

  // Close the QR modal and release its image URL.
  function closeQrModal() {
    if (qrImage) {
      URL.revokeObjectURL(qrImage);
    }

    setQrImage(null);
    setIsQrModalOpen(false);
  }

  // Log out.
  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  // The short-link URL using the configured backend base URL.
  function getShortUrl(shortCode) {
    const apiBase =
      import.meta.env.VITE_API_BASE_URL ||
      "http://127.0.0.1:5000/api";

    const backendBase = apiBase.replace(/\/api\/?$/, "");

    return `${backendBase}/${shortCode}`;
  }

  return (
    <main className={`app ${theme}`}>
      <header className="nav">
        <div>
          <Link className="logo" to="/">
            Linkly<span>®</span>
          </Link>
        </div>

        <nav className="nav-actions">
          <Link to="/" className="login-link">
            Home
          </Link>

          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="login-link"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              Log out
            </button>
          ) : (
            <>
              <Link to="/login" className="login-link">
                Login ↗
              </Link>

              <Link to="/register" className="register-button">
                Register Now
              </Link>
            </>
          )}
        </nav>
      </header>

      <section className="hero">
        <h1>Shorten Your Links</h1>

        <p>
          Linkly is an efficient and easy-to-use URL shortening
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

          <button type="submit">Shorten Now!</button>
        </form>

        {message && (
          <p className="message" role="status">
            {message}
          </p>
        )}

        <p className="usage-note">
          Welcome back, <strong>{user?.username || "User"}</strong>!
        </p>
      </section>

      <section className="list-section">
        <div className="table-heading">
          <h2>Your Links</h2>

          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
          >
            {theme === "dark" ? "☀ Light theme" : "☾ Dark theme"}
          </button>
        </div>

        {loading && (
          <p className="dashboard-message">Loading your links...</p>
        )}

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && urls.length === 0 && (
          <p className="dashboard-message">
            No links found. Create your first short link above!
          </p>
        )}

        {!loading && urls.length > 0 && (
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
                {urls.map((url) => {
                  const shortCode =
                    url.short_code || url.shortCode;

                  const originalLink =
                    url.original_url || url.originalUrl;

                  const dateCreated =
                    url.created_at || url.date || "N/A";

                  const isActive =
                    url.is_active !== undefined
                      ? url.is_active
                      : url.active !== undefined
                        ? url.active
                        : true;

                  const shortUrl = shortCode
                    ? getShortUrl(shortCode)
                    : "";

                  return (
                    <tr key={url.id}>
                      <td>
                        <div className="short-link">
                          {shortUrl ? (
                            <a
                              href={shortUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {shortUrl}
                            </a>
                          ) : (
                            <span>Short link unavailable</span>
                          )}

                          {shortUrl && (
                            <button
                              type="button"
                              className="copy-button"
                              title="Copy short link"
                              aria-label="Copy short link"
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(
                                    shortUrl
                                  );
                                  setMessage("Short link copied!");
                                } catch {
                                  setMessage(
                                    "Could not copy the link. Please copy it manually."
                                  );
                                }
                              }}
                            >
                              ▢
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="original-link">
                        <a
                          className="original-link"
                          href={originalLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {originalLink}
                        </a>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="qr-placeholder"
                          title="View QR Code"
                          aria-label="View QR Code"
                          onClick={() => handleViewQr(url.id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          ▦
                        </button>
                      </td>

                      <td>
                        {Number(
                          url.clicks ?? url.click_count ?? 0
                        ) || 0}
                      </td>

                      <td>
                        <span
                          className={
                            isActive
                              ? "status active"
                              : "status inactive"
                          }
                        >
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
        )}
      </section>

      {isQrModalOpen && (
        <div
          className="qr-modal-overlay"
          onClick={closeQrModal}
        >
          <div
            className="qr-modal-content"
            onClick={(event) => event.stopPropagation()}
          >
            <h3>QR Code</h3>

            {qrImage ? (
              <img
                src={qrImage}
                alt="Generated QR Code"
                style={{
                  width: "200px",
                  height: "200px",
                  objectFit: "contain",
                }}
              />
            ) : (
              <p>Loading QR code...</p>
            )}

            <button type="button" onClick={closeQrModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default Dashboard;
