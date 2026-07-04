import fetch from 'node-fetch';

async function testPiped(videoId) {
  // List of public piped API instances
  const instances = [
    'https://pipedapi.kavin.rocks',
    'https://pipedapi.tokhmi.xyz',
    'https://pipedapi.moomoo.me',
    'https://api.piped.yt'
  ];

  for (const instance of instances) {
    try {
      console.log(`Trying Piped instance: ${instance}...`);
      const res = await fetch(`${instance}/streams/${videoId}`);
      if (!res.ok) {
        throw new Error(`HTTP status ${res.status}`);
      }
      const data = await res.json();
      console.log("Subtitles list found:", data.subtitles?.length || 0);
      if (data.subtitles && data.subtitles.length > 0) {
        console.log("First subtitle details:", data.subtitles[0]);
        // Fetch the subtitle content
        const subRes = await fetch(data.subtitles[0].url);
        const subText = await subRes.text();
        console.log("\nSubtitle Content Sample:\n", subText.slice(0, 500));
        return; // Success!
      }
    } catch (err) {
      console.error(`Failed for ${instance}:`, err.message);
    }
  }
}

testPiped('RSDzvlXmQi4');
