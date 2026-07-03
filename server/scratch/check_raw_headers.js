import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const apiKey = process.env.GROQ_API_KEY;

async function checkHeaders(modelId) {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1
      })
    });

    console.log(`\nModel: ${modelId}`);
    console.log(`- Status: ${res.status}`);
    console.log(`- TPM Limit: ${res.headers.get('x-ratelimit-limit-tokens')}`);
    console.log(`- TPD Limit: ${res.headers.get('x-ratelimit-limit-tokens_day')}`);
  } catch (err) {
    console.error(`Error for ${modelId}:`, err.message);
  }
}

async function main() {
  await checkHeaders('openai/gpt-oss-20b');
  await checkHeaders('openai/gpt-oss-120b');
  await checkHeaders('qwen/qwen3.6-27b');
}
main();
