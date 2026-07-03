import { useState } from 'react';
import Editor from '@monaco-editor/react';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function CodingExercise({ exercise, number, currentCode, onCodeChange, onCodeExecute }) {
  const code = currentCode !== undefined ? currentCode : (exercise.starterCode || '');
  const [output, setOutput] = useState(null);
  const [running, setRunning] = useState(false);

  const language = exercise.language?.toLowerCase() || (exercise.starterCode?.includes('def ') ? 'python' : 'javascript');

  async function handleRun() {
    setRunning(true);
    setOutput(null);

    try {
      const res = await fetch(`${API_BASE}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      });

      if (res.ok) {
        const data = await res.json();
        
        const lowerOut = data.output.toLowerCase();
        const isError = 
          lowerOut.includes('error:') || 
          lowerOut.includes('exception') || 
          lowerOut.includes('sys.exit') ||
          lowerOut.includes('stderr');
        
        setOutput({ text: data.output, isError });
        if (onCodeExecute) {
          onCodeExecute(!isError);
        }
      } else {
        const data = await res.json().catch(() => ({}));
        setOutput({ text: data.error || 'Failed to connect to execution sandbox.', isError: true });
        if (onCodeExecute) {
          onCodeExecute(false);
        }
      }
    } catch (err) {
      setOutput({ text: `Failed to run code: ${err.message}`, isError: true });
      if (onCodeExecute) {
        onCodeExecute(false);
      }
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="exercise-card">
      <div className="exercise-header">
        <span className="exercise-badge coding">Coding</span>
        <span className="exercise-num">Exercise {number}</span>
      </div>

      <p className="exercise-question">{exercise.question}</p>

      <div className="monaco-wrapper">
        <div className="monaco-toolbar">
          <div className="monaco-dots">
            <span style={{ background: '#ff5f57' }} />
            <span style={{ background: '#febc2e' }} />
            <span style={{ background: '#28c840' }} />
          </div>
          <span className="monaco-lang">{language}</span>
        </div>
        <Editor
          height="220px"
          language={language}
          value={code}
          onChange={(val) => onCodeChange(val || '')}
          theme="vs-dark"
          options={{
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            renderLineHighlight: 'line',
            padding: { top: 14, bottom: 14 },
            scrollbar: { verticalScrollbarSize: 4 },
            overviewRulerBorder: false,
          }}
        />
      </div>

      <button
        id={`run-btn-${number}`}
        className="btn-run"
        onClick={handleRun}
        disabled={running}
      >
        {running ? '⏳ Running…' : '▶ Run Code'}
      </button>

      {output && (
        <div className={`run-output ${output.isError ? 'error-output' : ''}`}>
          {output.text}
        </div>
      )}
    </div>
  );
}
