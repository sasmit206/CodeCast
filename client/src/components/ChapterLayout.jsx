import MultipleChoice from './MultipleChoice.jsx';
import CodingExercise from './CodingExercise.jsx';

export default function ChapterSidebar({ chapters, activeId, onSelect, onSubmitAssessment }) {
  return (
    <aside className="chapter-sidebar">
      <div className="chapter-list">
        <p className="sidebar-heading">Chapters</p>
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
            <span className="chapter-number">Chapter {chapter.id}</span>
            <span className="chapter-title">{chapter.title}</span>
            <span className="chapter-time">{chapter.startLabel} – {chapter.endLabel}</span>
          </div>
        ))}
      </div>
      <div className="sidebar-footer">
        <button
          id="submit-assessment-btn"
          className="btn-submit-assessment"
          onClick={onSubmitAssessment}
        >
          🎓 Submit Assessment
        </button>
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
