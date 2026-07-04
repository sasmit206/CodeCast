import { useState } from 'react';

export default function UrlForm({ onSubmit, loading }) {
  const [url, setUrl] = useState('');
  const [focused, setFocused] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (url.trim()) onSubmit(url.trim());
  }

  return (
    <section className="hero">
      <div className="hero-gradient-1" />
      <div className="hero-gradient-2" />

      <h1 className="hero-title">
        your solution to<br />
        <span>tutorial hell</span>
      </h1>

      <p className="hero-sub">
        Turn tutorials into practice.<br />
        Paste a YouTube link to generate MCQs and coding challenges.
      </p>

      <form className="url-form" onSubmit={handleSubmit} id="url-form">
        <input
          id="youtube-url-input"
          className="url-input"
          type="url"
          placeholder="https://youtube.com/watch?v=..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
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
            <>Generate</>
          )}
        </button>
      </form>
    </section>
  );
}
