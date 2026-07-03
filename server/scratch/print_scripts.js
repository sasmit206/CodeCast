import fetch from 'node-fetch';

async function printScripts(videoId) {
  try {
    const res = await fetch(`https://youtubetranscript.com/?v=${videoId}`);
    const text = await res.text();
    
    // Find all <script> blocks
    const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gm;
    let match;
    let count = 0;
    while ((match = scriptRegex.exec(text)) !== null) {
      const content = match[1].trim();
      if (content.length > 0 && !content.includes('gtm') && !content.includes('google')) {
        console.log(`\n--- SCRIPT BLOCK ${++count} ---`);
        console.log(content.slice(0, 1500));
      }
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

printScripts('SqcY0GlETPk');
