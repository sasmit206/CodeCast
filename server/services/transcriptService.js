import { YoutubeTranscript } from 'youtube-transcript';

export function extractVideoId(rawUrl) {
  let parsed;

  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error(`Invalid URL: "${rawUrl}"`);
  }

  const { hostname, pathname, searchParams } = parsed;

  if (hostname === 'youtu.be') {
    const id = pathname.slice(1); 
    if (!id) throw new Error('No video ID found in short URL.');
    return id;
  }

  if (hostname === 'youtube.com' || hostname === 'www.youtube.com') {
    
    const vParam = searchParams.get('v');
    if (vParam) return vParam;

    if (pathname.startsWith('/embed/')) {
      const id = pathname.split('/embed/')[1];
      if (id) return id;
    }
  }

  throw new Error(
    `Could not extract a video ID from the URL: "${rawUrl}". ` +
    `Please provide a valid YouTube link.`
  );
}

export async function getTranscript(url) {

  const videoId = extractVideoId(url);

  let segments;

  try {
    segments = await YoutubeTranscript.fetchTranscript(videoId);
  } catch (err) {
    
    throw new Error(
      `Could not fetch transcript for video ID "${videoId}". ` +
      `The video may not exist, may be private, or may have captions disabled. ` +
      `Original error: ${err.message}`
    );
  }

  const plainText = segments
    .map((segment) => segment.text)
    .join(' ');

  return plainText;
}

export async function getSegments(url) {
  const videoId = extractVideoId(url);

  try {
    const segments = await YoutubeTranscript.fetchTranscript(videoId);
    return segments;
  } catch (err) {
    throw new Error(
      `Could not fetch transcript for video ID "${videoId}". ` +
      `The video may not exist, may be private, or may have captions disabled. ` +
      `Original error: ${err.message}`
    );
  }
}
