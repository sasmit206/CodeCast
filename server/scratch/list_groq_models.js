import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
  try {
    const list = await groq.models.list();
    console.log("Supported Groq Models:");
    list.data.forEach(m => {
      console.log(`- ${m.id} (Developer: ${m.owned_by})`);
    });
  } catch (err) {
    console.error("Error listing models:", err.message);
  }
}
main();
