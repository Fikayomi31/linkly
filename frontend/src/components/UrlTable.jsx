import { useState } from "react";


function UrlTable({ urls, onDelete, onToggleStatus }) {
    const [copiedId, setCopiedId] = useState(null);

    async function handleCopy(url) {
        const shortCode = url.short_code ?? url.shortCode;
        const shortUrl = `${window.location.origin}/${shortCode}`;

        try {
            await Navigate.clipboard.writeText(shortUrl);
            setCopiedId(url.id);

            setTimeout(() => {
                setCopiedId(null);
            }, 2000);
        } catch (err) {
            alert("Failed to copy the link. Please try again.");
        }
    }

    if (!urls || urls.length === 0) {
        return (
            <div className="url-empty-state">
                <h3>No links yet</h3>
                <p>Create your first short link to get started.</p>

            </div>
        );
    }

    return (
        <div className="table-scroll">
            <table className="url-table">
                <thead>
                    <tr>
                        <th>Short Link</th>
                        <th>Original Link</th>
                        <th>Clicks</th>
                        <th>QR Code</th>
                        <th>Status</th>
                        <th>Date Created</th>
                        
                    </tr>
                    
                </thead>

                <tbody>
                    {urls.map((url) => {
                        const shortCode = url.short_code ?? url.shortCode;
                        const originalUrl = url.original_url ?? url.originalUrl;

                        return (
                            <tr key={url.id}>
                                <td>
                                    <a
                                        href={`http://127.0.0.1:3000/${shortCode}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {shortCode}
                                    </a>
                                    <button
                                        className="copy-button"
                                        type="button"
                                        onClick={() => handleCopy(url)}
                                    >
                                        {copiedId === url.id ? "Copied!" : "Copy"}
                                    </button>
                                </td>
                                <td className="original-link">
                                    <a
                                        href={originalUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {originalUrl}
                                    </a>
                                </td>
                                <td>{url.clicks ?? url.click_count ?? 0}</td>
                                <td>
                                    <img
                                        src={`http://127.0.0.1:3000/qr/${shortCode}`}
                                        alt="QR Code"
                                        width="100"
                                        height="100"
                                    />
                                </td>
                                <td>
                                    <button
                                        className={`status-button ${url.is_active ? 'active' : 'inactive'}`}
                                        onClick={() => onToggleStatus(url.id)}
                                    >
                                        {url.is_active ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td>{new Date(url.created_at).toLocaleDateString()}</td>
                            </tr>
                        )
                    })}
                </tbody>

            </table>

        </div>
    )
}

export default UrlTable;