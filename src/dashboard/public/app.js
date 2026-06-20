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
  const volInput = document.getElementById("volume-input");

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
    volInput.value = p.volume;
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

// Volume slider
document.getElementById("volume-slider").addEventListener("input", (e) => {
  document.getElementById("volume-input").value = e.target.value;
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

// Volume number input
document.getElementById("volume-input").addEventListener("input", (e) => {
  let v = Math.min(100, Math.max(1, Number(e.target.value) || 1));
  document.getElementById("volume-slider").value = v;
});

document.getElementById("volume-input").addEventListener("change", async (e) => {
  if (!selectedGuild) return;
  let v = Math.min(100, Math.max(1, Number(e.target.value) || 1));
  e.target.value = v;
  document.getElementById("volume-slider").value = v;
  try {
    await api(`/api/player/${selectedGuild}/volume`, {
      method: "POST",
      body: JSON.stringify({ volume: v }),
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
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 && !d) parts.push(`${s}s`);
  return parts.join(" ") || "0s";
}

let charts = { sources: null, tracks: null, users: null, commands: null };

function destroyCharts() {
  Object.values(charts).forEach(c => { if (c) { c.destroy(); } });
  charts = { sources: null, tracks: null, users: null, commands: null };
}

const CHART_COLORS = ["#e94560","#5865f2","#43b581","#faa61a","#9b59b6"];

function makeBarChart(ctxId, labels, values, color) {
  const ctx = document.getElementById(ctxId);
  if (!ctx) return null;
  return new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: color + "33",
        borderColor: color,
        borderWidth: 2,
        borderRadius: 4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#16213e",
          titleColor: "#eee",
          bodyColor: "#aaa",
          borderColor: "#0f3460",
          borderWidth: 1,
        },
      },
      scales: {
        x: { display: false },
        y: {
          display: false,
          beginAtZero: true,
          grid: { display: false },
        },
      },
    },
  });
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

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function renderList(elId, items, fmt) {
  const el = document.getElementById(elId);
  if (!el) return;
  if (!items.length) {
    el.innerHTML = '<div class="stat-empty">No data</div>';
    return;
  }
  el.innerHTML = items.map((item, i) => {
    const val = fmt ? fmt(item) : item.count;
    const label = item.title || item.username || item.command || item.source;
    return `<div class="stat-row"><span class="stat-rank">${i + 1}</span><span class="stat-title">${label}</span><span class="stat-value">${val}</span></div>`;
  }).join("");
}

function renderStats(data) {
  destroyCharts();

  // Sources — bar chart + list
  if (data.sourceBreakdown.length) {
    const labels = data.sourceBreakdown.map(s => capitalize(s.source));
    const values = data.sourceBreakdown.map(s => s.count);
    makeBarChart("chart-sources", labels, values, CHART_COLORS[0]);
    const total = values.reduce((a, b) => a + b, 0);
    renderList("stats-sources-list", data.sourceBreakdown, item => `${item.count} (${((item.count / total) * 100).toFixed(1)}%)`);
  } else {
    renderList("stats-sources-list", []);
  }

  // Tracks — bar chart + list
  if (data.topTracks.length) {
    const labels = data.topTracks.map(t => t.title.length > 22 ? t.title.slice(0, 20) + "..." : t.title);
    const values = data.topTracks.map(t => Math.round(t.totalPlayedMs / 1000));
    makeBarChart("chart-tracks", labels, values, CHART_COLORS[1]);
    renderList("stats-tracks-list", data.topTracks, item => fmtDurationShort(item.totalPlayedMs));
  } else {
    renderList("stats-tracks-list", []);
  }

  // Users — bar chart + list
  if (data.topUsers.length) {
    const labels = data.topUsers.map(u => u.username);
    const values = data.topUsers.map(u => Math.round(u.totalPlayedMs / 1000));
    makeBarChart("chart-users", labels, values, CHART_COLORS[2]);
    renderList("stats-users-list", data.topUsers, item => fmtDurationShort(item.totalPlayedMs));
  } else {
    renderList("stats-users-list", []);
  }

  // Commands — bar chart + list
  if (data.topCommands.length) {
    const labels = data.topCommands.map(c => c.command);
    const values = data.topCommands.map(c => c.count);
    makeBarChart("chart-commands", labels, values, CHART_COLORS[3]);
    renderList("stats-commands-list", data.topCommands, item => item.count);
  } else {
    renderList("stats-commands-list", []);
  }
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
//======================
// Created by monavia
// Don't change if you don't know
//======================
