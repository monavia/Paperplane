const fs = require("fs");

async function debugEmbed(id, type) {
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
    fs.writeFileSync(`embed_${type}.html`, html);
    console.log(`  Saved embed_${type}.html`);
    return;
  }
  const data = JSON.parse(match[1]);
  const pageProps = data.props?.pageProps;
  if (!pageProps) {
    console.log(`${type}/${id}: No pageProps`);
    console.log("  Keys:", Object.keys(data));
    fs.writeFileSync(`embed_${type}_data.json`, JSON.stringify(data, null, 2));
    return;
  }
  console.log(`${type}/${id}: pageProps keys:`, Object.keys(pageProps));
  const state = pageProps.state;
  if (!state) {
    console.log(`  No state`);
    fs.writeFileSync(`embed_${type}_pageProps.json`, JSON.stringify(pageProps, null, 2));
    return;
  }
  console.log(`  state keys:`, Object.keys(state));
  const dataObj = state.data;
  if (!dataObj) {
    console.log(`  No data`);
    return;
  }
  console.log(`  data keys:`, Object.keys(dataObj));
  const entity = dataObj.entity;
  if (!entity) {
    console.log(`  No entity`);
    return;
  }
  console.log(`  entity keys:`, Object.keys(entity));
  console.log(`  entity type:`, entity.type);
  console.log(`  entity name:`, entity.name || entity.title);
  if (entity.trackList) console.log(`  trackList:`, entity.trackList.length);
  if (entity.subtitle) console.log(`  subtitle:`, entity.subtitle);
}

(async () => {
  await debugEmbed("4LfCY65LvojKjWEnU7fNN4", "track");
  console.log("---");
  await debugEmbed("5UcwpF7BQwM1GegjK3bDGN", "album");
})().catch(console.error);
