import { useState } from 'react';

export default function UrlForm({ onSubmit, loading }) {
  const [url, setUrl] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (url.trim()) onSubmit(url.trim());
  }

  return (
    <section className="hero">
      <p className="hero-eyebrow">AI-Powered Learning</p>
      <h1 className="hero-title">
        Turn any YouTube tutorial<br />
        into <span>coding exercises</span>
      </h1>
      <p className="hero-sub">
        Paste a programming video URL. CodeCast splits it into chapters
        and generates exercises with an in-browser code editor.
      </p>

      <form className="url-form" onSubmit={handleSubmit} id="url-form">
        <input
          id="youtube-url-input"
          className="url-input"
          type="url"
          placeholder="https://youtube.com/watch?v=..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
          required
          aria-label="YouTube video URL"
        />
        <button
          id="generate-btn"
          className="btn-generate"
          type="submit"
          disabled={loading || !url.trim()}
        >
          {loading ? (
            <>
              <span className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
              Generating…
            </>
          ) : (
            <>Generate Exercise</>
          )}
        </button>
      </form>
    </section>
  );
}
