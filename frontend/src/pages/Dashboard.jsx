
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import useAuthStore  from "../stores/authStore";
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
  
   useEffect(() => {
    api.get("/urls").then((res) => {
        setUrls(res.data)
    })
   })


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
            <Link to="/login" className="login-link">Login ↗</Link>
            
            <Link to="/register" className="register-button">Register Now</Link>
            
            
          </nav>
        </div>

      </header>

      <section className="hero">
        <h1>Shorten Your Links</h1>
        <p>
          Linkly is an efficient and easy to use URL shortrning
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
          />
          <button type="submit">
            Shorten Now!
          </button>

        </form>
        {message && <p className="message">{message}</p>}

        <p className="usage-note">
          You can create <strong>05</strong> more links.{" "}
          <a href="/register" className="register-link">
            Register now
          </a> to enjoy unlimited usage

        </p>
      </section>
      <section className="list-section">
        <div className="table-heading">
          <h2>Your Links</h2>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === "dark" ? "☀ Light theme" : "☾ Dark theme"}
          </button>
        </div>

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
              {urls.map((url) => (
                <tr key={url.id}>
                  <td>
                    <div className="short-link">
                      <a href={`http://127.0.01:5000/${url.shortCode}`} target="_blank" rel="noopener noreferrer">
                        linkly.co/{url.shortCode}
                      </a>
                      <button className="copy-button"
                        title="Copy short link"
                        onClick={() => 
                          navigator.clipboard.writeText(
                            `http://127.0.01:5000/${url.shortCode}`
                          )
                        }
                      >
                        ▢
                      </button>
                    </div>
                  </td>
                  <td className="original-link">
                    <a className="original-link" href={url.originalUrl} target="_blank">
                      {url.originalUrl}
                    </a>
                  </td>
                  <td>
                    <span className="qr-placeholder">▦</span>
                  </td>
                  <td>{url.clicks}</td>
                  <td>
                    <span className={url.active ? "status active" : "status inactive"}

                    >
                      {url.active ? "● Active" : "● Inactive"}
                      
                    </span>
                  </td>
                  <td>{url.date}</td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>

      </section>

    </main>
  );
}

export default Dashboard;
