import { Router } from 'express';
import { getTranscript } from '../services/transcriptService.js';

const router = Router();

router.post('/', async (req, res) => {

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({
      error: 'Missing required field: url',
      hint: 'Send a JSON body with a "url" property containing a YouTube link.',
    });
  }

  try {
    const transcript = await getTranscript(url);

    return res.status(200).json({
      url,
      transcript,
    });
  } catch (err) {

    const isClientError =
      err.message.includes('Invalid URL') ||
      err.message.includes('Could not extract a video ID');

    const statusCode = isClientError ? 400 : 500;

    return res.status(statusCode).json({
      error: err.message,
    });
  }
});

export default router;
