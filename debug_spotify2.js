const fs = require("fs");

(async () => {
  const res = await fetch("https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M", {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });
  const html = await res.text();
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
  if (!match) {
    console.log("No __NEXT_DATA__ found");
    // save html to inspect
    fs.writeFileSync("embed_page.html", html);
    console.log("Saved embed_page.html");
    return;
  }

  const data = JSON.parse(match[1]);
  const state = data.props?.pageProps?.state?.data;
  console.log("Entity type:", state?.entity?.type);
  console.log("Entity name:", state?.entity?.name);

  // Try to find tracks
  if (state?.entity) {
    console.log("Entity keys:", Object.keys(state.entity));
    if (state.entity.items) {
      console.log("Items length:", Array.isArray(state.entity.items) ? state.entity.items.length : "not array");
    }
  }

  // Search for items in the full state
  const allKeys = [];
  function findTracks(obj, path) {
    if (!obj || typeof obj !== "object") return;
    if (Array.isArray(obj)) {
      obj.forEach((item, i) => {
        if (item && typeof item === "object" && (item.name || item.title)) {
          if (path) allKeys.push(path);
        }
        findTracks(item, path + "[" + i + "]");
      });
      return;
    }
    for (const key of Object.keys(obj)) {
      if (key === "items" && Array.isArray(obj[key]) && obj[key].length > 0 && obj[key][0]?.name) {
        console.log("Found items at", path + "." + key, "length:", obj[key].length);
        console.log("  Sample:", JSON.stringify(obj[key][0]).substring(0, 300));
      }
      findTracks(obj[key], path ? path + "." + key : key);
    }
  }
  findTracks(state, "state");

  // Also dump the full state structure
  console.log("\n=== Full state keys (first level) ===");
  if (state) console.log(Object.keys(state));
  if (state?.entity) console.log("Entity keys:", Object.keys(state.entity));
  if (state?.entity?.tracks) console.log("tracks:", Object.keys(state.entity.tracks));

  // Write full JSON for inspection
  fs.writeFileSync("embed_state.json", JSON.stringify(state, null, 2));
  console.log("\nSaved embed_state.json");
})().catch(console.error);
