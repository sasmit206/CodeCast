import { GoogleGenAI } from '@google/genai';

let _ai = null;

function getClient() {
  if (!_ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY is not set. Add it to your .env file.'
      );
    }
    _ai = new GoogleGenAI({ apiKey });
  }
  return _ai;
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
    .replace(/^```json\s*/i, '') // strip opening ```json
    .replace(/^```\s*/i, '')     // strip opening ``` (no language tag)
    .replace(/\s*```$/i, '')     // strip closing ```
    .trim();
}

export async function generateExercises(transcript) {
  if (!transcript || transcript.trim().length === 0) {
    throw new Error('Cannot generate exercises from an empty transcript.');
  }

  const prompt = buildPrompt(transcript);

  let rawText;

  try {
    const ai = getClient();
    const result = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });
    rawText = result.text;
  } catch (err) {
    throw new Error(
      `Gemini API call failed: ${err.message}. ` +
      `Check that your GEMINI_API_KEY is valid and has not exceeded its quota.`
    );
  }

  let parsed;
  try {
    const cleaned = sanitiseResponse(rawText);
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(
      `Gemini returned a response that could not be parsed as JSON. ` +
      `Raw response: "${rawText.slice(0, 200)}..."`
    );
  }

  if (!parsed.exercises || !Array.isArray(parsed.exercises)) {
    throw new Error(
      `Gemini response was valid JSON but missing the "exercises" array.`
    );
  }

  return parsed.exercises;
}
