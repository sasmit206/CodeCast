import { Router } from 'express';
import { executeCode } from '../services/dockerService.js';

const router = Router();

const SUPPORTED_LANGUAGES = ['python', 'javascript', 'cpp', 'java'];

router.post('/', async (req, res) => {
  const { code, language } = req.body;

  if (!code || !language) {
    return res.status(400).json({
      error: 'Missing required fields: "code" and "language" are required.',
    });
  }

  const normalizedLang = language.toLowerCase();

  if (!SUPPORTED_LANGUAGES.includes(normalizedLang)) {
    return res.status(400).json({
      error: `Unsupported language: "${language}". Supported runtimes: ${SUPPORTED_LANGUAGES.join(', ')}`,
    });
  }

  try {
    const output = await executeCode(code, normalizedLang);
    return res.status(200).json({ output });
  } catch (err) {
    console.error(`[Execution Error] ${err.stack}`);
    return res.status(500).json({
      error: `Internal sandbox execution failure: ${err.message}`,
    });
  }
});

export default router;
