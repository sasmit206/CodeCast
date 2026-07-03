import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function checkLimits(modelId) {
  try {
    const res = await groq.chat.completions.create({
      model: modelId,
      messages: [{ role: 'user', content: 'test' }],
      max_tokens: 1
    });
    // The sdk stores headers on the response object
    console.log(`\nModel: ${modelId}`);
    console.log(`- TPM Limit: ${res.headers?.get('x-ratelimit-limit-tokens')}`);
    console.log(`- TPM Remaining: ${res.headers?.get('x-ratelimit-remaining-tokens')}`);
    console.log(`- TPD Limit: ${res.headers?.get('x-ratelimit-limit-tokens_day') || 'No Daily Limit'}`);
  } catch (err) {
    console.error(`Error for ${modelId}:`, err.message);
  }
}

async function main() {
  await checkLimits('openai/gpt-oss-20b');
  await checkLimits('openai/gpt-oss-120b');
  await checkLimits('qwen/qwen3.6-27b');
}
main();
