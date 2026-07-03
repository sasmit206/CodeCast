import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import os from 'os';

const TEMP_BASE_DIR = path.join(os.tmpdir(), 'codecast-sandbox');

function ensureTempDirExists() {
  if (!fs.existsSync(TEMP_BASE_DIR)) {
    fs.mkdirSync(TEMP_BASE_DIR, { recursive: true });
  }
}

function getLanguageConfig(language, tempDir) {
  const configs = {
    python: {
      fileName: 'main.py',
      image: 'python:3.10-alpine',

      runCmd: 'python3 -u /app/main.py',
    },
    javascript: {
      fileName: 'main.js',
      image: 'node:18-alpine',
      runCmd: 'node /app/main.js',
    },
    cpp: {
      fileName: 'main.cpp',
      image: 'gcc:12',
      
      runCmd: 'g++ -O3 /app/main.cpp -o /app/run_binary && /app/run_binary',
    },
    java: {
      fileName: 'Main.java', 
      image: 'openjdk:17-alpine',
      runCmd: 'javac /app/Main.java && java -cp /app Main',
    },
  };

  const config = configs[language.toLowerCase()];
  if (!config) {
    throw new Error(`Unsupported programming language: "${language}"`);
  }
  return config;
}

export async function executeCode(code, language) {
  
  if (process.env.EXECUTION_MODE === 'piston') {
    console.log(`[Piston Sandbox] Executing ${language} code via Serverless API...`);
    try {
      const pistonLangs = {
        python: { language: 'python3', version: '3.10.0', file: 'main.py' },
        javascript: { language: 'js', version: '18.15.0', file: 'main.js' },
        cpp: { language: 'cpp', version: '10.2.0', file: 'main.cpp' },
        java: { language: 'java', version: '15.0.2', file: 'Main.java' }
      };

      const spec = pistonLangs[language.toLowerCase()];
      if (!spec) {
        return `Unsupported serverless runtime: ${language}`;
      }

      const res = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: spec.language,
          version: spec.version,
          files: [{ name: spec.file, content: code }]
        })
      });

      if (!res.ok) {
        throw new Error(`Piston API returned status ${res.status}`);
      }

      const data = await res.json();
      const output = (data.run?.stdout || '') + (data.run?.stderr || '');
      return output || 'Code executed successfully with no output.';
    } catch (err) {
      return `Serverless Execution Sandbox Error: ${err.message}`;
    }
  }

  return new Promise((resolve, reject) => {
    ensureTempDirExists();

    const runId = crypto.randomBytes(8).toString('hex');
    const runDir = path.join(TEMP_BASE_DIR, runId);
    fs.mkdirSync(runDir);

    const config = getLanguageConfig(language, runDir);
    const sourceFilePath = path.join(runDir, config.fileName);

    fs.writeFileSync(sourceFilePath, code, 'utf-8');

    const containerName = `codecast-run-${runId}`;

    const dockerCmd = [
      'docker run --rm',
      `--name "${containerName}"`,
      '--network none',
      '-m 128m',
      '--cpus 0.5',
      `-v "${runDir}:/app"`,
      config.image,
      `sh -c "${config.runCmd}"`,
    ].join(' ');

    console.log(`[Docker Sandbox] Executing container ${containerName} (${language})...`);

    let didTimeout = false;

    const timeoutHandle = setTimeout(() => {
      didTimeout = true;
      console.warn(`[Docker Sandbox] Run ${runId} timed out. Issuing docker kill...`);
      exec(`docker kill "${containerName}"`, (killErr) => {
        if (killErr) {
          console.error(`[Docker Sandbox] Failed to kill ${containerName}: ${killErr.message}`);
        }
      });
    }, 5000);

    exec(dockerCmd, (execErr, stdout, stderr) => {
      
      clearTimeout(timeoutHandle);

      try {
        fs.rmSync(runDir, { recursive: true, force: true });
        console.log(`[Docker Sandbox] Cleaned up temp dir for run ${runId}`);
      } catch (cleanupErr) {
        console.error(`[Docker Sandbox] Cleanup warning: ${cleanupErr.message}`);
      }

      if (execErr) {
        if (didTimeout || execErr.signal === 'SIGKILL' || execErr.code === 137) {
          return resolve('⌛ Execution Timed Out (Max 5 seconds). Check for infinite loops.');
        }

        const runtimeError = stderr || execErr.message;
        return resolve(runtimeError);
      }

      resolve(stdout || stderr || 'Code completed successfully with no output.');
    });
  });
}
