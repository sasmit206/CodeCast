import fetch from 'node-fetch';

async function testInvidious(videoId) {
  try {
    console.log("Fetching active Invidious instances...");
    const res = await fetch('https://api.invidious.io/instances?sort_by=type,health');
    const instancesData = await res.json();
    
    // Extract public HTTPS instances with health > 90%
    const instances = instancesData
      .filter(item => item[1].type === 'https' && item[1].monitor && item[1].monitor.dailyRatios[0] > 90)
      .map(item => item[1].uri);
      
    console.log(`Found ${instances.length} active HTTPS instances.`);
    
    for (const uri of instances.slice(0, 10)) {
      try {
        console.log(`Trying Invidious instance: ${uri}...`);
        // Invidious captions API: /api/v1/captions/VIDEO_ID?label=English or just /api/v1/captions/VIDEO_ID
        const capRes = await fetch(`${uri}/api/v1/captions/${videoId}`);
        if (!capRes.ok) {
          throw new Error(`HTTP status ${capRes.status}`);
        }
        const data = await capRes.json();
        console.log("Captions info found:", data.captionTracks ? "Tracks list available" : "No tracks list");
        if (data.captionTracks && data.captionTracks.length > 0) {
          console.log("Available tracks:", data.captionTracks.map(t => t.name));
          // Let's fetch the first track (srt or vtt format)
          const track = data.captionTracks.find(t => t.langCode === 'en') || data.captionTracks[0];
          console.log("Selected track:", track.name, "URL:", track.url);
          
          // The url might be relative to the instance or absolute
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
  } catch (err) {
    console.error("Error fetching instances:", err.message);
  }
}

testInvidious('RSDzvlXmQi4');
