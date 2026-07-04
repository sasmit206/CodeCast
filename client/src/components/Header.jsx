import { LogOut } from 'lucide-react';

export default function Header({ onNewVideo, showBackButton, onSubmitAssessment }) {
  return (
    <header className="app-header">
      <div
        className="header-logo"
        onClick={showBackButton ? onNewVideo : undefined}
        style={{ cursor: showBackButton ? 'pointer' : 'default' }}
        role="button"
        tabIndex={showBackButton ? 0 : -1}
        onKeyDown={(e) => showBackButton && e.key === 'Enter' && onNewVideo()}
      >
        CodeCast
      </div>

      {showBackButton && (
        <div className="header-actions">
          {onSubmitAssessment && (
            <button
              className="header-btn header-submit"
              onClick={onSubmitAssessment}
            >
              Submit Assessment
            </button>
          )}
          <button
            className="header-btn header-exit"
            onClick={onNewVideo}
            title="Exit and go back"
          >
            <LogOut size={20} />
            Exit
          </button>
        </div>
      )}
    </header>
  );
}
