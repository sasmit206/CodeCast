import fetch from 'node-fetch';

async function testHardcodedInvidious(videoId) {
  const instances = [
    'https://yewtu.be',
    'https://invidious.projectsegfaut.im',
    'https://invidious.privacydev.net',
    'https://invidious.lunar.icu',
    'https://iv.melmac.space',
    'https://invidious.flokinet.to',
    'https://invidious.nerdvpn.de',
    'https://invidious.slipfox.xyz'
  ];

  for (const uri of instances) {
    try {
      console.log(`Trying Invidious instance: ${uri}...`);
      // Invidious captions API: /api/v1/captions/VIDEO_ID
      const capRes = await fetch(`${uri}/api/v1/captions/${videoId}`);
      if (!capRes.ok) {
        throw new Error(`HTTP status ${capRes.status}`);
      }
      const data = await capRes.json();
      console.log("Captions info found:", data.captionTracks ? "Tracks list available" : "No tracks list");
      if (data.captionTracks && data.captionTracks.length > 0) {
        console.log("Available tracks:", data.captionTracks.map(t => t.name));
        const track = data.captionTracks.find(t => t.langCode === 'en') || data.captionTracks[0];
        console.log("Selected track:", track.name, "URL:", track.url);
        
        const trackUrl = track.url.startsWith('http') ? track.url : `${uri}${track.url}`;
        const trackRes = await fetch(trackUrl);
        const trackText = await trackRes.text();
        console.log("\nCaptions Content Sample:\n", trackText.slice(0, 500));
        return; // Success!
      }
    } catch (err) {
      console.error(`Failed for ${uri}:`, err.message);
    }
  }
}

testHardcodedInvidious('RSDzvlXmQi4');
