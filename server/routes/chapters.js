import { Router } from 'express';
import { getSegments, extractVideoId } from '../services/transcriptService.js';
import { splitIntoChapters } from '../services/chapterService.js';
import { generateChapterContent } from '../services/aiService.js';
import { getCached, setCached } from '../services/redisService.js';

const router = Router();

const MAX_CHAPTER_TEXT_LENGTH = 3000;

const INTER_CALL_DELAY_MS = 500;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const activeJobs = {};

router.get('/status/:videoId', async (req, res) => {
  const { videoId } = req.params;

  try {
    const cachedData = await getCached(`codecast:${videoId}`);
    if (cachedData) {
      return res.status(200).json({
        status: 'complete',
        videoId,
        totalChapters: cachedData.chapters?.length || 0,
        chapters: cachedData.chapters || [],
      });
    }
  } catch (cacheErr) {
    console.error(`[Redis Read Warning] Failed to query cache: ${cacheErr.message}`);
  }

  const job = activeJobs[videoId];
  if (!job) {
    return res.status(404).json({
      error: 'No active generation job found for this video ID.',
    });
  }

  return res.status(200).json({
    status: job.status,
    progress: job.progress,
    total: job.total,
    error: job.error || null,
    chapters: job.chapters || [],
  });
});

router.post('/', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({
      error: 'Missing required field: url',
      hint: 'Send a JSON body with a "url" property containing a YouTube link.',
    });
  }

  try {
    const videoId = extractVideoId(url);

    const cachedData = await getCached(`codecast:${videoId}`);
    if (cachedData) {
      console.log(`[Cache Hit] Serving cached exercises for video ${videoId} from Redis.`);
      return res.status(200).json({
        status: 'complete',
        videoId,
        totalChapters: cachedData.chapters?.length || 0,
        chapters: cachedData.chapters || [],
      });
    }

    if (activeJobs[videoId]) {
      console.log(`[Job Watch] Client re-requested active job for video ${videoId}.`);
      return res.status(200).json({
        status: activeJobs[videoId].status,
        videoId,
      });
    }

    console.log(`[Cache Miss] Starting background generation job for video ${videoId}...`);

    activeJobs[videoId] = {
      status: 'fetching_transcript',
      progress: 0,
      total: 0,
      chapters: [],
      error: null,
    };

    (async () => {
      try {
        
        const segments = await getSegments(url);
        activeJobs[videoId].status = 'splitting_chapters';

        const rawChapters = splitIntoChapters(segments);
        activeJobs[videoId].total = rawChapters.length;
        activeJobs[videoId].status = 'generating_exercises';

        console.log(
          `[Background Job] Video ${videoId}: Processing ${rawChapters.length} chapters ` +
          `sequentially (using openai/gpt-oss-120b).`
        );

        const chapters = [];

        for (let i = 0; i < rawChapters.length; i++) {
          const chapter = rawChapters[i];
          const timeRange = `${chapter.startLabel}–${chapter.endLabel}`;

          console.log(`[Background Job] Video ${videoId}: Generating chapter ${i + 1}/${rawChapters.length}`);

          const chapterText = chapter.text.slice(0, MAX_CHAPTER_TEXT_LENGTH);

          const { title, exercises } = await generateChapterContent(chapterText, timeRange);

          chapters.push({
            id: chapter.id,
            title,
            startTime: chapter.startTime,
            endTime: chapter.endTime,
            startLabel: chapter.startLabel,
            endLabel: chapter.endLabel,
            exercises,
          });

          activeJobs[videoId].progress = i + 1;
          activeJobs[videoId].chapters = chapters;

          if (i < rawChapters.length - 1) {
            await delay(INTER_CALL_DELAY_MS);
          }
        }

        const responsePayload = {
          url,
          totalChapters: chapters.length,
          chapters,
        };
        await setCached(`codecast:${videoId}`, responsePayload, 86400); 
        console.log(`[Background Job] Saved exercises for video ${videoId} to Redis cache.`);

        activeJobs[videoId].status = 'complete';
      } catch (err) {
        console.error(`[Background Job Failure] Video ${videoId} crashed: ${err.stack}`);
        activeJobs[videoId].status = 'failed';
        activeJobs[videoId].error = err.message;
      }
    })();

    return res.status(200).json({
      status: 'fetching_transcript',
      videoId,
    });

  } catch (err) {
    const isClientError =
      err.message.includes('Invalid URL') ||
      err.message.includes('Could not extract a video ID') ||
      err.message.includes('captions disabled');

    return res.status(isClientError ? 400 : 500).json({
      error: err.message,
    });
  }
});

export default router;
