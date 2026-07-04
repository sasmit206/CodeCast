import Groq from 'groq-sdk';

let _groq = null;

function getClient() {
  if (!_groq) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not set. Add it to your .env file.');
    }
    _groq = new Groq({ apiKey });
  }
  return _groq;
}

async function callWithRetry(apiCallFn, retries = 4, delayMs = 800) {
  try {
    return await apiCallFn();
  } catch (err) {
    const isRateLimit = err.status === 429 || err.message?.includes('429') || err.message?.includes('rate_limit');
    if (retries > 0 && isRateLimit) {
      console.warn(`[Groq Rate Limit] 429 hit. Retrying in ${delayMs}ms... (${retries} retries left)`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return callWithRetry(apiCallFn, retries - 1, delayMs * 1.5);
    }
    throw err;
  }
}

function buildPrompt(transcript) {
  return `
You are an expert programming educator who creates high-quality coding exercises
from educational video transcripts.

Given the following video transcript, generate exactly 3 coding exercises that
test the viewer's understanding of the concepts discussed.

TRANSCRIPT:
"""
${transcript}
"""

INSTRUCTIONS:
- Generate exactly 3 exercises.
- Use a mix of types: prefer 1 "multiple_choice" and 2 "coding" exercises,
  but adapt based on the content.
- Each "coding" exercise must include realistic starter code.
- Answers and explanations must be grounded in the transcript content.
- Do NOT invent concepts not present in the transcript.

RESPONSE FORMAT:
Respond with ONLY a valid JSON object. No markdown. No prose. No code fences.
The JSON must follow this exact schema:

{
  "exercises": [
    {
      "id": 1,
      "type": "multiple_choice",
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "answer": "string (must match one of the options exactly)",
      "explanation": "string"
    },
    {
      "id": 2,
      "type": "coding",
      "question": "string",
      "starterCode": "string",
      "answer": "string",
      "explanation": "string"
    }
  ]
}
`.trim();
}

function sanitiseResponse(rawText) {
  return rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

/**
 * Calls the Groq API with the given transcript and returns
 * a structured array of coding exercises.
 *
 * Model: llama-3.3-70b-versatile
 *   — Groq's best instruction-following model, ideal for structured JSON output.
 *   — Responds in ~300ms on Groq's LPU hardware.
 *
 * @param {string} transcript - Plain-text transcript from Silo 1.
 * @returns {Promise<Array>} Array of exercise objects.
 * @throws {Error} If the API call fails or response cannot be parsed.
 */
export async function generateExercises(transcript) {
  if (!transcript || transcript.trim().length === 0) {
    throw new Error('Cannot generate exercises from an empty transcript.');
  }

  const prompt = buildPrompt(transcript);
  let rawText;

  // Step 1: Call the Groq API with automatic retry wrapper.
  try {
    const runCall = () => {
      const groq = getClient();
      return groq.chat.completions.create({
        model: 'openai/gpt-oss-120b',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
        max_tokens: 4096,
      });
    };

    const completion = await callWithRetry(runCall, 4, 800);
    rawText = completion.choices[0]?.message?.content;

    if (!rawText) {
      throw new Error('Groq returned an empty response.');
    }
  } catch (err) {
    throw new Error(
      `Groq API call failed: ${err.message}. ` +
      `Check that your GROQ_API_KEY is valid.`
    );
  }

  // Step 2: Sanitise and parse the response.
  let parsed;
  try {
    const cleaned = sanitiseResponse(rawText);
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(
      `AI returned a response that could not be parsed as JSON. ` +
      `Raw response: "${rawText.slice(0, 200)}..."`
    );
  }

  // Step 3: Validate the shape.
  if (!parsed.exercises || !Array.isArray(parsed.exercises)) {
    throw new Error(
      `AI response was valid JSON but missing the "exercises" array.`
    );
  }

  return parsed.exercises;
}

/**
 * Builds the prompt for a single chapter's content generation.
 * Asks Groq for both a chapter title and 3 exercises (1 MCQ + 2 coding).
 *
 * @param {string} chapterText - Plain text content of this chapter.
 * @param {string} timeRange   - Human-readable time range, e.g. "0:00–5:00".
 * @returns {string} The fully constructed prompt.
 */
function buildChapterPrompt(chapterText, timeRange) {
  return `
You are an expert programming educator creating structured learning content
from a section of a coding tutorial video transcript.

This section covers the time range: ${timeRange}

TRANSCRIPT SECTION:
"""
${chapterText}
"""

INSTRUCTIONS:
- Generate a short, descriptive chapter title (max 5 words) that captures
  the main concept covered in this transcript section.
- Generate exactly 5 exercises: 3 "multiple_choice" and 2 "coding".
- All questions and answers must be grounded in this transcript section.
- Detect the programming language discussed in the transcript (e.g., python, javascript, cpp, java). If no specific language is mentioned, default to javascript.
- For each coding exercise, write it in the detected language.
- For C++ (cpp) coding exercises:
  - You MUST include \`using namespace std;\` at the top of both the starterCode and the answer.
  - You MUST include appropriate \`#include\` statements at the top (e.g. \`<vector>\`, \`<algorithm>\`, \`<iostream>\`).
  - You MUST append a boilerplate \`int main() { ... }\` function at the bottom of both the starterCode and the answer, containing simple test data, a call to the student's function, and standard output printing statements, so the code compiles and executes out-of-the-box.
- All code properties ("starterCode" and "answer") MUST use literal escaped newline characters (\\n) to split statements onto separate lines. Do NOT write all code on a single line.
- Each coding exercise must include starter code with ONLY the function
  signature, parameter names, a docstring hint, and a pass/return statement appropriate for the language (plus any imports/main boilerplate described above).
  NEVER include any implementation logic in the starter code — the student
  must write that themselves.
- Do NOT invent concepts not present in this transcript section.

RESPONSE FORMAT:
Respond with ONLY a valid JSON object. No markdown. No prose. No code fences.

{
  "title": "string (max 5 words)",
  "exercises": [
    {
      "id": 1,
      "type": "multiple_choice",
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "answer": "string (must match one of the options exactly)",
      "explanation": "string"
    },
    {
      "id": 2,
      "type": "multiple_choice",
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "answer": "string (must match one of the options exactly)",
      "explanation": "string"
    },
    {
      "id": 3,
      "type": "multiple_choice",
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "answer": "string (must match one of the options exactly)",
      "explanation": "string"
    },
    {
      "id": 4,
      "type": "coding",
      "language": "string (e.g., 'python', 'javascript', 'cpp', 'java')",
      "question": "string",
      "starterCode": "string",
      "answer": "string",
      "explanation": "string"
    },
    {
      "id": 5,
      "type": "coding",
      "language": "string (e.g., 'python', 'javascript', 'cpp', 'java')",
      "question": "string",
      "starterCode": "string",
      "answer": "string",
      "explanation": "string"
    }
  ]
}
`.trim();
}

export async function generateChapterContent(chapterText, timeRange) {
  if (!chapterText || chapterText.trim().length === 0) {

    return {
      title: `${timeRange}`,
      exercises: [],
    };
  }

  const prompt = buildChapterPrompt(chapterText, timeRange);
  let rawText;

  try {
    const runCall = () => {
      const groq = getClient();
      return groq.chat.completions.create({
        model: 'openai/gpt-oss-120b',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        response_format: { type: 'json_object' },
        max_tokens: 4096,
      });
    };

    const completion = await callWithRetry(runCall, 4, 800);
    rawText = completion.choices[0]?.message?.content;
    if (!rawText) throw new Error('Groq returned an empty response.');
  } catch (err) {
    throw new Error(`Groq API call failed for chapter "${timeRange}": ${err.message}`);
  }

  let parsed;
  try {
    const cleaned = sanitiseResponse(rawText);
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(
      `AI returned unparseable JSON for chapter "${timeRange}". ` +
      `Raw: "${rawText.slice(0, 200)}..."`
    );
  }

  if (!parsed.title || !Array.isArray(parsed.exercises)) {
    throw new Error(`AI response for chapter "${timeRange}" is missing title or exercises.`);
  }

  return {
    title: parsed.title,
    exercises: parsed.exercises,
  };
}

export async function generateSyntheticChapters(videoTitle) {
  const prompt = `
You are an expert programming educator. We could not extract the transcript for this video: "${videoTitle}".
Generate a structured learning curriculum with exactly 4 distinct chapters that logically match this video topic.

For each chapter, provide:
1. A descriptive title.
2. A timeRange string representing a logical progression, starting from "0:00 - 5:00" and progressing forward.
3. An array containing exactly 1 coding exercise of type "multiple_choice" or "coding" (coding exercises must include: question, starterCode, answer, explanation).

Format your output as a single JSON object matching this structure:
{
  "chapters": [
    {
      "title": "Chapter Title",
      "timeRange": "0:00 - 5:00",
      "exercises": [
        {
          "type": "coding",
          "title": "Exercise Title",
          "question": "Exercise instructions and question prompt...",
          "starterCode": "starter code...",
          "answer": "correct solution code...",
          "explanation": "why this is the correct solution..."
        }
      ]
    }
  ]
}
`.trim();

  let rawText;
  try {
    const runCall = () => {
      const groq = getClient();
      return groq.chat.completions.create({
        model: 'openai/gpt-oss-120b',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        response_format: { type: 'json_object' },
        max_tokens: 4096,
      });
    };

    const completion = await callWithRetry(runCall, 4, 800);
    rawText = completion.choices[0]?.message?.content;
    if (!rawText) throw new Error('Groq returned an empty response.');
  } catch (err) {
    throw new Error(`Synthetic AI generation failed: ${err.message}`);
  }

  try {
    const cleaned = sanitiseResponse(rawText);
    return JSON.parse(cleaned);
  } catch {
    throw new Error(`Unparseable JSON from synthetic AI. Raw: "${rawText.slice(0, 200)}..."`);
  }
}
