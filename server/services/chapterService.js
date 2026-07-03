

function getChapterCount(durationSeconds) {
  const minutes = durationSeconds / 60;
  if (minutes < 10)  return 3;
  if (minutes < 30)  return 4;
  if (minutes < 60)  return 5;
  if (minutes < 90)  return 6;
  if (minutes < 120) return 7;
  return 8;
}

function formatTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);

  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function splitIntoChapters(segments) {
  if (!segments || segments.length === 0) {
    throw new Error('Cannot split empty segments into chapters.');
  }

  const lastSegment = segments[segments.length - 1];
  const totalDurationSeconds = (lastSegment.offset + lastSegment.duration) / 1000;

  const chapterCount = getChapterCount(totalDurationSeconds);
  const chapterDuration = totalDurationSeconds / chapterCount;

  const buckets = Array.from({ length: chapterCount }, (_, i) => ({
    id: i + 1,
    startTime: Math.round(i * chapterDuration),
    endTime: Math.round((i + 1) * chapterDuration),
    segments: [],
  }));

  for (const segment of segments) {
    const segmentSeconds = segment.offset / 1000;
    
    const bucketIndex = Math.min(
      Math.floor(segmentSeconds / chapterDuration),
      chapterCount - 1 
    );
    buckets[bucketIndex].segments.push(segment);
  }

  return buckets.map((bucket) => ({
    id: bucket.id,
    startTime: bucket.startTime,
    endTime: bucket.endTime,
    startLabel: formatTime(bucket.startTime),
    endLabel: formatTime(bucket.endTime),
    
    text: bucket.segments.map((s) => s.text).join(' ').trim(),
  }));
}
