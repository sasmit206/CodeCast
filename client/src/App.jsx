import { useState } from 'react';
import Header from './components/Header.jsx';
import UrlForm from './components/UrlForm.jsx';
import ChapterSidebar, { ExercisePanel } from './components/ChapterLayout.jsx';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function App() {
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [chapters, setChapters] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [progress, setProgress] = useState({ step: '', current: 0, total: 0 });

  async function pollStatus(videoId) {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/chapters/status/${videoId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch generation progress.');
        }

        if (data.status === 'complete') {
          clearInterval(interval);
          setChapters(data.chapters);
          setActiveId(data.chapters[0]?.id ?? null);
          setLoading(false);
        } else if (data.status === 'failed') {
          clearInterval(interval);
          setError(data.error || 'Exercise generation failed.');
          setLoading(false);
        } else {
          setProgress({
            step: data.status,
            current: data.progress || 0,
            total: data.total || 0,
          });
        }
      } catch (err) {
        clearInterval(interval);
        setError(err.message);
        setLoading(false);
      }
    }, 1000);
  }

  async function handleGenerate(url) {
    setLoading(true);
    setError(null);
    setChapters(null);
    setUserAnswers({});
    setShowResults(false);
    setProgress({ step: 'fetching_transcript', current: 0, total: 0 });

    try {
      const res = await fetch(`${API_BASE}/chapters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong.');
      }

      if (data.status === 'complete') {
        setChapters(data.chapters);
        setActiveId(data.chapters[0]?.id ?? null);
        setLoading(false);
      } else {
        pollStatus(data.videoId);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  const handleMcqSelect = (chapterId, exerciseId, option) => {
    const key = `${chapterId}-${exerciseId}`;
    setUserAnswers((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        type: 'multiple_choice',
        answer: option,
        revealed: true,
      },
    }));
  };

  const handleCodeChange = (chapterId, exerciseId, codeVal) => {
    const key = `${chapterId}-${exerciseId}`;
    setUserAnswers((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        type: 'coding',
        code: codeVal,
      },
    }));
  };

  const handleCodeExecute = (chapterId, exerciseId, isSuccess) => {
    const key = `${chapterId}-${exerciseId}`;
    setUserAnswers((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        executed: isSuccess,
      },
    }));
  };

  const getScoreDetails = () => {
    let mcqCorrect = 0;
    let mcqTotal = 0;
    let codingCorrect = 0;
    let codingTotal = 0;

    if (!chapters) return { mcqCorrect, mcqTotal, codingCorrect, codingTotal };

    chapters.forEach((chapter) => {
      chapter.exercises.forEach((exercise) => {
        const key = `${chapter.id}-${exercise.id}`;
        const userAns = userAnswers[key];

        if (exercise.type === 'multiple_choice') {
          mcqTotal++;
          if (userAns && userAns.answer === exercise.answer) {
            mcqCorrect++;
          }
        } else if (exercise.type === 'coding') {
          codingTotal++;
          if (userAns && userAns.executed) {
            codingCorrect++;
          }
        }
      });
    });

    return { mcqCorrect, mcqTotal, codingCorrect, codingTotal };
  };

  const scores = getScoreDetails();
  const activeChapter = chapters?.find((c) => c.id === activeId) ?? null;

  return (
    <div className="app">
      <Header
        showBackButton={!!chapters && !loading}
        onNewVideo={() => {
          setChapters(null);
          setActiveId(null);
          setUserAnswers();
        }}
      />

      {!chapters && !loading && (
        <UrlForm onSubmit={handleGenerate} loading={loading} />
      )}

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner" />
          <div className="loading-steps">
            <p className={`loading-step ${progress.step === 'fetching_transcript' ? 'active' : 'completed'}`}>
              Fetching transcript from YouTube… {progress.step === 'fetching_transcript' ? '⏳' : '✓'}
            </p>
            <p className={`loading-step ${progress.step === 'splitting_chapters' ? 'active' : (progress.step === 'fetching_transcript' ? '' : 'completed')}`}>
              Analyzing video chapters… {progress.step === 'splitting_chapters' ? '⏳' : (progress.step === 'fetching_transcript' ? '' : '✓')}
            </p>
            <p className={`loading-step ${progress.step === 'generating_exercises' ? 'active' : ''}`}>
              Generating exercises with AI… {progress.step === 'generating_exercises' ? `(${progress.current} of ${progress.total}) ⏳` : ''}
            </p>
            {progress.step === 'generating_exercises' && progress.total > 0 && (
              <div className="progress-bar-wrapper">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${(progress.current / progress.total) * 100}%` }} 
                />
              </div>
            )}
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="error-box" role="alert">
          ⚠️ {error}
        </div>
      )}

      {chapters && !loading && (
        <div className="chapter-layout">
          <ChapterSidebar
            chapters={chapters}
            activeId={activeId}
            onSelect={setActiveId}
            onSubmitAssessment={() => setShowResults(true)}
          />
          <ExercisePanel
            key={activeId}
            chapter={activeChapter}
            userAnswers={userAnswers}
            onMcqSelect={handleMcqSelect}
            onCodeChange={handleCodeChange}
            onCodeExecute={handleCodeExecute}
          />
        </div>
      )}

      {showResults && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Assessment Results</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Here is your performance breakdown across all chapters:
            </p>

            <div className="score-summary">
              <div className="score-row">
                <span className="score-label">Multiple Choice Questions</span>
                <span className="score-value mcq-val">
                  {scores.mcqCorrect} / {scores.mcqTotal}
                </span>
              </div>
              <div className="score-row">
                <span className="score-label">Coding Exercises (Direct match check)</span>
                <span className="score-value coding-val">
                  {scores.codingCorrect} / {scores.codingTotal}
                </span>
              </div>
              <div className="score-row score-total">
                <span className="score-label" style={{ color: '#fff' }}>Total Score</span>
                <span className="score-value">
                  {scores.mcqCorrect + scores.codingCorrect} / {scores.mcqTotal + scores.codingTotal}
                </span>
              </div>
            </div>

            <button className="btn-close-modal" onClick={() => setShowResults(false)}>
              Close & Review
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
