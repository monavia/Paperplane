const fs = require("fs");

async function testMainPageAlbum(id) {
  const url = `https://open.spotify.com/album/${id}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });
  const html = await res.text();
  console.log("Main album page length:", html.length);
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
  if (match) {
    console.log("Has __NEXT_DATA__ on main page!");
  }
  // Look for any data
  const scripts = html.match(/<script[^>]*>([A-Za-z0-9+/=]{200,})<\/script>/g) || [];
  for (const s of scripts) {
    const content = s.replace(/<script[^>]*>/, "").replace(/<\/script>/, "");
    try {
      const decoded = Buffer.from(content, "base64").toString("utf-8");
      if (decoded.includes("track") || decoded.includes("album")) {
        console.log("Found data in base64 script:", decoded.substring(0, 500));
      }
    } catch {}
  }

  // Check track entity artists structure
  const trackRes = await fetch("https://open.spotify.com/embed/track/4LfCY65LvojKjWEnU7fNN4", {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });
  const trackHtml = await trackRes.text();
  const trackMatch = trackHtml.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
  if (trackMatch) {
    const data = JSON.parse(trackMatch[1]);
    const entity = data.props?.pageProps?.state?.data?.entity;
    console.log("\nTrack entity artists:", JSON.stringify(entity.artists, null, 2));
  }
}

testMainPageAlbum("5UcwpF7BQwM1GegjK3bDGN").catch(console.error);
