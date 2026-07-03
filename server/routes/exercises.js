import { Router } from 'express';
import { getTranscript } from '../services/transcriptService.js';
import { generateExercises } from '../services/aiService.js';

const router = Router();

const MAX_TRANSCRIPT_LENGTH = 8000;

router.post('/', async (req, res) => {
  
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({
      error: 'Missing required field: url',
      hint: 'Send a JSON body with a "url" property containing a YouTube link.',
    });
  }

  try {

    const fullTranscript = await getTranscript(url);

    const transcript = fullTranscript.slice(0, MAX_TRANSCRIPT_LENGTH);

    if (fullTranscript.length > MAX_TRANSCRIPT_LENGTH) {
      console.warn(
        `Transcript truncated: ${fullTranscript.length} → ${MAX_TRANSCRIPT_LENGTH} chars`
      );
    }

    const exercises = await generateExercises(transcript);

    return res.status(200).json({
      url,
      transcriptLength: transcript.length,
      exercises,
    });
  } catch (err) {

    const isClientError =
      err.message.includes('Invalid URL') ||
      err.message.includes('Could not extract a video ID') ||
      err.message.includes('captions disabled');

    const statusCode = isClientError ? 400 : 500;

    return res.status(statusCode).json({
      error: err.message,
    });
  }
});

export default router;
