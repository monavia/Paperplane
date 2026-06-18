const fs = require("fs");

async function testEmbed(id, type) {
  const url = `https://open.spotify.com/embed/${type}/${id}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });
  const html = await res.text();
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
  if (!match) {
    console.log(`${type}/${id}: No __NEXT_DATA__`);
    return;
  }
  const data = JSON.parse(match[1]);
  const entity = data.props?.pageProps?.state?.data?.entity;
  if (!entity) {
    console.log(`${type}/${id}: No entity`);
    return;
  }
  console.log(`${type}/${id}: type=${entity.type}, name="${entity.name}"`);
  if (entity.trackList && Array.isArray(entity.trackList)) {
    console.log(`  trackList: ${entity.trackList.length} tracks`);
    console.log(`  First: "${entity.trackList[0].title}" - ${entity.trackList[0].subtitle}`);
  } else if (entity.type === "track") {
    console.log(`  Single track: "${entity.title}" - ${entity.subtitle}`);
  }
  console.log();
}

(async () => {
  await testEmbed("37i9dQZF1DXcBWIGoYBM5M", "playlist");
  await testEmbed("4LfCY65LvojKjWEnU7fNN4", "track");
  await testEmbed("5UcwpF7BQwM1GegjK3bDGN", "album");
})().catch(console.error);
