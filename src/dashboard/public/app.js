let selectedGuild = null;
let pollTimer = null;
let queuePage = 0;
const QUEUE_PAGE_SIZE = 10;

async function api(path, opts = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  setTimeout(() => t.classList.add("hidden"), 3000);
}

function fmtTime(ms) {
  if (!ms || ms <= 0) return "0:00";
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function fmtDuration(ms) {
  if (!ms || ms <= 0) return "0:00";
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

async function init() {
  const { user } = await api("/api/me");

  if (!user) {
    document.getElementById("login-screen").classList.remove("hidden");
    return;
  }

  document.getElementById("dashboard-screen").classList.remove("hidden");
  const navUser = document.getElementById("nav-user");
  navUser.innerHTML = `<span>@${user.username}</span> <a href="/auth/logout" class="btn-logout">Logout</a>`;

  const guilds = await api("/api/guilds");
  renderGuilds(guilds);
}

function renderGuilds(guilds) {
  const container = document.getElementById("guilds");
  container.innerHTML = "";

  for (const g of guilds) {
    const div = document.createElement("div");
    div.className = "guild-item";
    div.dataset.id = g.id;

    const icon = document.createElement("div");
    icon.className = "guild-icon";
    if (g.icon) {
      icon.innerHTML = `<img src="https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png" alt="">`;
    } else {
      icon.textContent = g.name.charAt(0).toUpperCase();
      icon.style.display = "flex";
      icon.style.alignItems = "center";
      icon.style.justifyContent = "center";
      icon.style.color = "#888";
      icon.style.fontWeight = "700";
    }

    const name = document.createElement("div");
    name.className = "guild-name";
    name.textContent = g.name;

    div.appendChild(icon);
    div.appendChild(name);
    div.addEventListener("click", () => selectGuild(g.id));
    container.appendChild(div);
  }
}

async function selectGuild(id) {
  selectedGuild = id;
  document.querySelectorAll(".guild-item").forEach((el) => el.classList.remove("active"));
  document.querySelector(`.guild-item[data-id="${id}"]`)?.classList.add("active");
  document.getElementById("tabs").classList.remove("hidden");
  document.getElementById("player-content").classList.remove("hidden");
  document.getElementById("no-guild-selected").classList.add("hidden");
  await refreshPlayer();
  startPolling();
}

function startPolling() {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(refreshPlayer, 3000);
}

async function refreshPlayer() {
  if (!selectedGuild) return;
  try {
    const offset = queuePage * QUEUE_PAGE_SIZE;
    const state = await api(`/api/player/${selectedGuild}?offset=${offset}&limit=${QUEUE_PAGE_SIZE}`);
    renderPlayer(state);
  } catch {
    showToast("Failed to fetch player state");
  }
}

function renderPlayer(state) {
  const p = state.player;
  const npTitle = document.getElementById("np-title");
  const npAuthor = document.getElementById("np-author");
  const npThumb = document.getElementById("np-thumbnail");
  const npProgress = document.getElementById("np-progress-fill");
  const npTime = document.getElementById("np-time");
  const btnPP = document.getElementById("btn-play-pause");
  const volSlider = document.getElementById("volume-slider");
  const volLabel = document.getElementById("volume-label");

  if (p && p.nowPlaying) {
    npTitle.innerHTML = `<a href="${p.nowPlaying.uri}" target="_blank">${p.nowPlaying.title}</a>`;
    npAuthor.textContent = p.nowPlaying.author;
    npThumb.innerHTML = p.nowPlaying.thumbnail
      ? `<img src="${p.nowPlaying.thumbnail}" alt="">`
      : "";

    const dur = p.nowPlaying.duration || 1;
    const pct = Math.min((p.position / dur) * 100, 100);
    npProgress.style.width = `${pct}%`;
    npTime.textContent = `${fmtTime(p.position)} / ${fmtDuration(dur)}`;

    btnPP.textContent = p.paused ? "▶" : "⏸";
    btnPP.disabled = false;
  } else {
    npTitle.innerHTML = "No track playing";
    npAuthor.textContent = "";
    npThumb.innerHTML = "";
    npProgress.style.width = "0%";
    npTime.textContent = "0:00 / 0:00";
    btnPP.textContent = "▶";
    btnPP.disabled = true;
  }

  if (p) {
    volSlider.value = p.volume;
    volLabel.textContent = p.volume;
  }

  // Prefix
  const prefixInput = document.getElementById("prefix-input");
  if (state.guild?.prefix) {
    prefixInput.value = state.guild.prefix;
  }

  // Queue
  const queueList = document.getElementById("queue-list");
  if (state.queue.length) {
    queueList.innerHTML = state.queue
      .map(
        (t, i) =>
          `<div class="queue-item">
            <span class="queue-title">${state.queueOffset + i + 1}. ${t.title}</span>
            <span class="queue-duration">${fmtDuration(t.duration)}</span>
          </div>`
      )
      .join("");
  } else {
    queueList.innerHTML = '<div class="queue-empty">Queue is empty</div>';
  }

  // Queue pagination
  const pagination = document.getElementById("queue-pagination");
  const total = state.queueTotal || 0;
  const totalPages = Math.ceil(total / QUEUE_PAGE_SIZE) || 1;
  const currentPage = queuePage + 1;

  if (total > QUEUE_PAGE_SIZE) {
    pagination.classList.remove("hidden");
    document.getElementById("queue-page-info").textContent = `${currentPage}/${totalPages}`;
    document.getElementById("btn-queue-prev").disabled = queuePage === 0;
    document.getElementById("btn-queue-next").disabled = queuePage >= totalPages - 1;
  } else {
    pagination.classList.add("hidden");
  }
}

// Control buttons
document.getElementById("btn-play-pause").addEventListener("click", async () => {
  if (!selectedGuild) return;
  const p = document.getElementById("btn-play-pause");
  const action = p.textContent === "▶" ? "resume" : "pause";
  try {
    await api(`/api/player/${selectedGuild}/${action}`, { method: "POST" });
    await refreshPlayer();
  } catch (e) {
    showToast(e.message);
  }
});

document.getElementById("btn-skip").addEventListener("click", async () => {
  if (!selectedGuild) return;
  try {
    await api(`/api/player/${selectedGuild}/skip`, { method: "POST" });
    await refreshPlayer();
  } catch (e) {
    showToast(e.message);
  }
});

document.getElementById("btn-stop").addEventListener("click", async () => {
  if (!selectedGuild) return;
  try {
    await api(`/api/player/${selectedGuild}/stop`, { method: "POST" });
    await refreshPlayer();
  } catch (e) {
    showToast(e.message);
  }
});

document.getElementById("volume-slider").addEventListener("input", async (e) => {
  const vol = e.target.value;
  document.getElementById("volume-label").textContent = vol;
});

document.getElementById("volume-slider").addEventListener("change", async (e) => {
  if (!selectedGuild) return;
  try {
    await api(`/api/player/${selectedGuild}/volume`, {
      method: "POST",
      body: JSON.stringify({ volume: Number(e.target.value) }),
    });
  } catch (e) {
    showToast(e.message);
  }
});

// Queue pagination
document.getElementById("btn-queue-prev").addEventListener("click", () => {
  if (queuePage > 0) {
    queuePage--;
    refreshPlayer();
  }
});
document.getElementById("btn-queue-next").addEventListener("click", () => {
  queuePage++;
  refreshPlayer();
});

document.getElementById("btn-save-prefix").addEventListener("click", async () => {
  if (!selectedGuild) return;
  const prefix = document.getElementById("prefix-input").value.trim();
  if (!prefix) return showToast("Prefix cannot be empty");
  try {
    const data = await api(`/api/player/${selectedGuild}/prefix`, {
      method: "POST",
      body: JSON.stringify({ prefix }),
    });
    showToast(`Prefix changed to "${data.prefix}"`);
  } catch (e) {
    showToast(e.message);
  }
});

// Stats
function fmtDurationShort(ms) {
  if (!ms || ms <= 0) return "0s";
  const total = Math.floor(ms / 1000);
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const parts = [];
  if (d > 0) parts.push(`${d} day${d > 1 ? "s" : ""}`);
  if (h > 0) parts.push(`${h} hour${h > 1 ? "s" : ""}`);
  if (m > 0) parts.push(`${m} minute${m > 1 ? "s" : ""}`);
  if (s > 0 && !d) parts.push(`${s} second${s > 1 ? "s" : ""}`);
  return parts.join(" ") || "0s";
}

async function loadStats(days) {
  if (!selectedGuild) return;
  try {
    const data = await api(`/api/player/${selectedGuild}/stats?days=${days}`);
    renderStats(data);
  } catch {
    showToast("Failed to load statistics");
  }
}

function renderStats(data) {
  // Sources
  const sourcesEl = document.getElementById("stats-sources");
  const sourcesCard = document.getElementById("stats-overview");
  if (data.sourceBreakdown.length) {
    sourcesCard.classList.remove("hidden");
    const total = data.sourceBreakdown.reduce((s, x) => s + x.count, 0);
    sourcesEl.innerHTML = data.sourceBreakdown
      .map((s) => {
        const pct = ((s.count / total) * 100).toFixed(1);
        return `<div class="source-row"><span class="source-name">${capitalize(s.source)}</span><span class="source-count">${s.count} (${pct}%)</span></div>`;
      })
      .join("");
  } else {
    sourcesCard.classList.add("hidden");
  }

  // Tracks
  const tracksEl = document.getElementById("stats-tracks-list");
  const tracksCard = document.getElementById("stats-toptracks");
  if (data.topTracks.length) {
    tracksCard.classList.remove("hidden");
    tracksEl.innerHTML = data.topTracks
      .map(
        (t, i) =>
          `<div class="stat-row">
            <span class="stat-rank">${i + 1}</span>
            <span class="stat-title">${capitalize(t.source)} ${t.title}</span>
            <span class="stat-value">${fmtDurationShort(t.totalPlayedMs)}</span>
          </div>`
      )
      .join("");
  } else {
    tracksCard.classList.add("hidden");
  }

  // Users
  const usersEl = document.getElementById("stats-users-list");
  const usersCard = document.getElementById("stats-topusers");
  if (data.topUsers.length) {
    usersCard.classList.remove("hidden");
    usersEl.innerHTML = data.topUsers
      .map(
        (u, i) =>
          `<div class="stat-row">
            <span class="stat-rank">${i + 1}</span>
            <span class="stat-title">${u.username}</span>
            <span class="stat-value">${fmtDurationShort(u.totalPlayedMs)}</span>
          </div>`
      )
      .join("");
  } else {
    usersCard.classList.add("hidden");
  }

  // Commands
  const cmdsEl = document.getElementById("stats-commands-list");
  const cmdsCard = document.getElementById("stats-topcommands");
  if (data.topCommands.length) {
    cmdsCard.classList.remove("hidden");
    cmdsEl.innerHTML = data.topCommands
      .map(
        (c, i) =>
          `<div class="stat-row">
            <span class="stat-rank">${i + 1}</span>
            <span class="stat-title">${c.command}</span>
            <span class="stat-value">${c.count}</span>
          </div>`
      )
      .join("");
  } else {
    cmdsCard.classList.add("hidden");
  }
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Tab switching
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const tab = btn.dataset.tab;
    document.getElementById("player-content").classList.toggle("hidden", tab !== "player");
    document.getElementById("stats-content").classList.toggle("hidden", tab !== "stats");
    if (tab === "stats") {
      if (pollTimer) clearInterval(pollTimer);
      const days = Number(document.getElementById("stats-days").value);
      loadStats(days);
    } else {
      startPolling();
    }
  });
});

document.getElementById("stats-days").addEventListener("change", (e) => {
  if (document.querySelector('.tab-btn[data-tab="stats"].active')) {
    loadStats(Number(e.target.value));
  }
});

init();
