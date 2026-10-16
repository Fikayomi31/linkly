import { useState } from "react";
import "./App.css";

const simpleUrls = [
  {
    id: 1,
    shortCode: "abc123",
    originalUrl: "https://www.example.com",
    clicks: 10,
    active: true,
    date: "2023-06-01"
},
{
  id: 2,
  shortCode: "def456",
  originalUrl: "https://www.example.org",
  clicks: 5,
  active: false,
  date: "2023-06-02"
},
{
  id: 3,
  shortCode: "ghi789",
  originalUrl: "https://www.x.net",
  clicks: 20,
  active: true,
  date: "2023-06-03"

},
];

function App() {
  const [urls, setUrls] = useState(simpleUrls);
  const [originalUrl, setOriginalUrl] = useState("");
  const [darkTheme, setDarkTheme] = useState(true);
  const [message, setMessage] = useState("");

  function handleShorten(event) {
    event.preventDefault();

    if (!originalUrl.trim()) {
      setMessage("Please enter a valid URL.");
      return;
    }

    setMessage(
      "The interface is ready! Next, we'll connect it to Flask"
    );
  }

  return (
    <main className={darkTheme ? "app dark" : "app light"}>
      <header className="nav">
        <div>
          <a className="logo" href="/">
            Linkly<span>®</span>
          </a>
        </div>
        <div>
          <nav className="nav-actions">
            <a className="login-link" href="/login">
              Login ↗
            </a>
            <a className="register-button" href="/register">
              Register Now
            </a>
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
          <button className="theme-toggle" onClick={() => setDarkTheme(!darkTheme)}>
            {darkTheme ? "* Light theme" : "☾ Dark theme"}
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
  )


}


export default App;