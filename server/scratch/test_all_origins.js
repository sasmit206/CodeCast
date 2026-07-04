import fetch from 'node-fetch';

async function testAllOrigins(videoId) {
  try {
    const targetUrl = encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`);
    console.log("Fetching watch page through allorigins...");
    const res = await fetch(`https://api.allorigins.win/get?url=${targetUrl}`);
    if (!res.ok) {
      throw new Error(`HTTP status ${res.status}`);
    }
    const data = await res.json();
    const html = data.contents;
    console.log("Response HTML length:", html.length);
    console.log("Is captcha triggered:", html.includes('captcha') || html.includes('recaptcha'));
    console.log("Is playercfg present:", html.includes('ytInitialPlayerResponse'));
  } catch (err) {
    console.error("Error:", err.message);
  }
}

testAllOrigins('SqcY0GlETPk');
