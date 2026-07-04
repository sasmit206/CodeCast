import { useState, useEffect } from 'react';

export default function MultipleChoice({ exercise, number, selectedOption, revealed, onSelect }) {
  const [showConfetti, setShowConfetti] = useState(false);

  function handleSelect(option) {
    if (revealed) return;
    onSelect(option);

    // Show confetti if answer is correct
    if (option === exercise.answer) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
    }
  }

  function getOptionClass(option) {
    if (!revealed) return selectedOption === option ? 'selected' : '';
    if (option === exercise.answer) return 'correct';
    if (option === selectedOption && option !== exercise.answer) return 'wrong';
    return '';
  }

  function getOptionIcon(option) {
    if (!revealed) return null;
    if (option === exercise.answer) return '✓';
    if (option === selectedOption && option !== exercise.answer) return '✗';
    return null;
  }

  return (
    <>
      {showConfetti && (
        <div className="confetti-container">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="confetti" />
          ))}
        </div>
      )}

      <div className="exercise-card">
        <div className="exercise-header">
          <span className="exercise-badge mcq">Multiple Choice</span>
          <span className="exercise-num">Exercise {number}</span>
        </div>

        <p className="exercise-question">{exercise.question}</p>

        <div className="mcq-options">
          {exercise.options.map((option, i) => (
            <button
              key={i}
              id={`option-${number}-${i}`}
              className={`mcq-option ${getOptionClass(option)}`}
              onClick={() => handleSelect(option)}
              disabled={revealed}
            >
              <span className="option-dot">
                {getOptionIcon(option)}
              </span>
              {option}
            </button>
          ))}
        </div>

        {revealed && (
          <div className="mcq-explanation">
            💡 {exercise.explanation}
          </div>
        )}
      </div>
    </>
  );
}
