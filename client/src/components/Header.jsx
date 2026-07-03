export default function Header({ onNewVideo, showBackButton }) {
  return (
    <header className="header">
      <div
        className="header-logo"
        onClick={showBackButton ? onNewVideo : undefined}
        style={{ cursor: showBackButton ? 'pointer' : 'default' }}
        role="button"
        tabIndex={showBackButton ? 0 : -1}
        onKeyDown={(e) => showBackButton && e.key === 'Enter' && onNewVideo()}
      >
        Code<span>Cast</span>
      </div>
      <span className="header-badge">v0 · Silo 3</span>
      
      {showBackButton && (
        <button
          className="btn-new-video"
          onClick={onNewVideo}
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Back
        </button>
      )}
    </header>
  );
}
