import fetch from 'node-fetch';

async function findXmlUrl(videoId) {
  try {
    const res = await fetch(`https://youtubetranscript.com/?v=${videoId}`);
    const text = await res.text();
    
    // Find lines containing xmlUrl or transcript
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.includes('xmlUrl') || line.includes('transcript')) {
        console.log("MATCHING LINE:", line.trim().slice(0, 300));
      }
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

findXmlUrl('SqcY0GlETPk');
