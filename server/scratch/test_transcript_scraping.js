import fetch from 'node-fetch';

async function testScraping(videoId) {
  try {
    const res = await fetch(`https://youtubetranscript.com/?v=${videoId}`);
    const text = await res.text();
    console.log("Response length:", text.length);
    console.log("Includes transcript XML URL:", text.includes('xmlUrl') || text.includes('transcript'));
    // Print the first 500 chars
    console.log("\nSample content:\n", text.slice(0, 800));
  } catch (err) {
    console.error("Error:", err.message);
  }
}

testScraping('SqcY0GlETPk');
