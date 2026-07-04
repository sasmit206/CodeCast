import fetch from 'node-fetch';

async function testPublicApi(videoId) {
  // Let's test a public scraper microservice instance that proxies the youtube-transcript-api.
  // There are some open-source serverless instances on the web.
  const apiUrls = [
    `https://youtube-transcript-api.vercel.app/api/transcript?videoId=${videoId}`,
    `https://yt-transcript-api.vercel.app/api/${videoId}`,
    `https://api.copilot.live/api/youtube/transcript?v=${videoId}`
  ];

  for (const url of apiUrls) {
    try {
      console.log(`Testing API URL: ${url}`);
      const res = await fetch(url);
      if (res.ok) {
        const text = await res.text();
        console.log("Success! Length:", text.length);
        console.log("Sample:", text.slice(0, 500));
        return;
      } else {
        console.log(`Failed status: ${res.status}`);
      }
    } catch (err) {
      console.log("Error:", err.message);
    }
  }
}

testPublicApi('SqcY0GlETPk');
