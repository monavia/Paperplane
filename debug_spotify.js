const fs = require("fs");

(async () => {
  const res = await fetch("https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M", {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });
  const html = await res.text();

  // Decode base64 tags
  const tags = html.match(/<script[^>]*>([A-Za-z0-9+/=]+)<\/script>/g) || [];
  for (const t of tags) {
    const content = t.replace(/<script[^>]*>/, "").replace(/<\/script>/, "");
    try {
      const decoded = Buffer.from(content, "base64").toString("utf-8");
      console.log("--- decoded JSON:", decoded.substring(0, 2000));
      console.log();
    } catch {}
  }

  // Check embed page too
  console.log("\n=== Checking embed page ===");
  const embedRes = await fetch("https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M", {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });
  const embedHtml = await embedRes.text();
  console.log("Embed page length:", embedHtml.length);
  const embedTags = embedHtml.match(/<script[\s\S]*?<\/script>/gi) || [];
  console.log("Embed script tags:", embedTags.length);
  for (let i = 0; i < embedTags.length; i++) {
    const t = embedTags[i];
    const idMatch = t.match(/id="([^"]+)"/);
    const typeMatch = t.match(/type="([^"]+)"/);
    const content = t.replace(/<script[^>]*>/, "").replace(/<\/script>/, "").trim();
    const clen = content.length;
    if (clen > 50) {
      console.log(
        i + ": id=" + (idMatch ? idMatch[1] : "none") +
        " type=" + (typeMatch ? typeMatch[1] : "none") +
        " len=" + clen + " isBase64=" + /^[A-Za-z0-9+/=]+$/.test(content)
      );
      if (!/^[A-Za-z0-9+/=]+$/.test(content)) {
        console.log("  text:", content.substring(0, 500));
      }
    }
  }
})().catch(console.error);
