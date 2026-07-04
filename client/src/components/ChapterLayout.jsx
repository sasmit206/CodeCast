import MultipleChoice from './MultipleChoice.jsx';
import CodingExercise from './CodingExercise.jsx';

export default function ChapterSidebar({ chapters, activeId, onSelect, onSubmitAssessment, userAnswers }) {
  const calculateProgress = () => {
    let mcqAttempted = 0;
    let codingAttempted = 0;
    let mcqTotal = 0;
    let codingTotal = 0;

    chapters.forEach((chapter) => {
      chapter.exercises.forEach((exercise) => {
        const key = `${chapter.id}-${exercise.id}`;
        const answered = !!userAnswers[key];

        if (exercise.type === 'multiple_choice') {
          mcqTotal++;
          if (answered) mcqAttempted++;
        } else if (exercise.type === 'coding') {
          codingTotal++;
          if (answered) codingAttempted++;
        }
      });
    });

    return { mcqAttempted, mcqTotal, codingAttempted, codingTotal };
  };

  const progress = calculateProgress();
  const totalAttempted = progress.mcqAttempted + progress.codingAttempted;
  const totalExercises = progress.mcqTotal + progress.codingTotal;
  const progressPercent = totalExercises > 0 ? (totalAttempted / totalExercises) * 100 : 0;

  return (
    <aside className="chapter-sidebar">
      <div className="progress-section">
        <div className="progress-header">
          <h3 className="progress-title">Progress</h3>
          <span className="progress-count">{totalAttempted} / {totalExercises}</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="progress-details">
          <div className="progress-item">
            <span className="progress-label">MCQ</span>
            <span className="progress-value">{progress.mcqAttempted} / {progress.mcqTotal}</span>
          </div>
          <div className="progress-item">
            <span className="progress-label">Coding</span>
            <span className="progress-value">{progress.codingAttempted} / {progress.codingTotal}</span>
          </div>
        </div>
      </div>

      <div className="chapter-list">
        <h3 className="sidebar-heading">Chapters</h3>
        {chapters.map((chapter) => (
          <div
            key={chapter.id}
            id={`chapter-item-${chapter.id}`}
            className={`chapter-item ${chapter.id === activeId ? 'active' : ''}`}
            onClick={() => onSelect(chapter.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelect(chapter.id)}
            aria-label={`Chapter ${chapter.id}: ${chapter.title}`}
          >
            <div className="chapter-content">
              <div className="chapter-header">
                <span className="chapter-number">Chapter {chapter.id}</span>
                <span className="chapter-time">{chapter.startLabel} – {chapter.endLabel}</span>
              </div>
              <span className="chapter-title">{chapter.title}</span>
            </div>
          </div>
        ))}
      </div>

    </aside>
  );
}

export function ExercisePanel({ chapter, userAnswers, onMcqSelect, onCodeChange, onCodeExecute }) {
  if (!chapter) return null;

  return (
    <main className="exercise-panel">
      <div>
        <h2 className="panel-chapter-title">{chapter.title}</h2>
        <p className="panel-chapter-meta">
          {chapter.startLabel} – {chapter.endLabel} · {chapter.exercises.length} exercises
        </p>
      </div>

      {chapter.exercises.map((exercise, i) => {
        const key = `${chapter.id}-${exercise.id}`;
        const answerState = userAnswers[key] || {};

        return exercise.type === 'multiple_choice' ? (
          <MultipleChoice
            key={key}
            exercise={exercise}
            number={i + 1}
            selectedOption={answerState.answer || null}
            revealed={!!answerState.revealed}
            onSelect={(opt) => onMcqSelect(chapter.id, exercise.id, opt)}
          />
        ) : (
          <CodingExercise
            key={key}
            exercise={exercise}
            number={i + 1}
            currentCode={answerState.code}
            onCodeChange={(codeVal) => onCodeChange(chapter.id, exercise.id, codeVal)}
            onCodeExecute={(isSuccess) => onCodeExecute(chapter.id, exercise.id, isSuccess)}
          />
        );
      })}
    </main>
  );
}
