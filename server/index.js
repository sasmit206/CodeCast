import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import transcriptRouter from './routes/transcript.js';
import exercisesRouter from './routes/exercises.js';
import chaptersRouter from './routes/chapters.js';
import executeRouter from './routes/execute.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());

app.use('/transcript', transcriptRouter);
app.use('/exercises', exercisesRouter);
app.use('/chapters', chaptersRouter);
app.use('/execute', executeRouter);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`CodeCast backend running on http://localhost:${PORT}`);
});
