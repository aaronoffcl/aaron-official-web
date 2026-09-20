const FALLBACK_VIDEOS = [
  { id: "xOtNTlCKPvU", title: "アーロンの助手席はこんな感じ" },
  { id: "npFVvUjYvIQ", title: "もう限界なので実家に帰ります" },
  { id: "nbnTclJGsDA", title: "アンチコメントについて本音を語ります" },
  { id: "9mTq7xlF4vo", title: "最初で最後の自己紹介します" },
];

const YOUTUBE_CHANNEL_HANDLE = "aaron.youtube.official"; // "@"は付けない
const YOUTUBE_API_KEY = "YOUR_YOUTUBE_API_KEY_HERE"; // Google Cloud Consoleで発行し、HTTPリファラー制限を設定すること(README参照)
const VIDEO_CACHE_KEY = "aaron-official:videos-cache";
const VIDEO_CACHE_TTL_MS = 60 * 60 * 1000; // 1時間

function parseVideoCacheEntry(raw) {
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object") return null;
  const { videos, savedAt } = parsed;
  if (!Array.isArray(videos) || typeof savedAt !== "number") return null;
  const validVideos = videos.filter((video) => video && video.id && video.title);
  if (!validVideos.length) return null;
  return { videos: validVideos, savedAt };
}

// キャッシュの生データを読み込む(TTLは考慮しない)。壊れたエントリはnullを返す
function readRawVideoCache() {
  try {
    const raw = localStorage.getItem(VIDEO_CACHE_KEY);
    if (!raw) return null;
    return parseVideoCacheEntry(raw);
  } catch (error) {
    return null;
  }
}

// TTL内の有効なキャッシュのみ返す
function readVideoCache() {
  const entry = readRawVideoCache();
  if (!entry) return null;
  if (Date.now() - entry.savedAt > VIDEO_CACHE_TTL_MS) return null;
  return entry.videos;
}

// TTLが切れていても、動画が残っていればそのまま返す(ライブ取得が失敗したときの最終手段)
function readStaleVideoCache() {
  const entry = readRawVideoCache();
  if (!entry) return null;
  return entry.videos;
}

function writeVideoCache(videos) {
  try {
    localStorage.setItem(VIDEO_CACHE_KEY, JSON.stringify({ videos, savedAt: Date.now() }));
  } catch (error) {
    // localStorageが使えない環境では何もしない
  }
}

async function fetchLatestVideos() {
  const cached = readVideoCache();
  if (cached) return cached;

  try {
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forHandle=${YOUTUBE_CHANNEL_HANDLE}&key=${YOUTUBE_API_KEY}`
    );
    if (!channelRes.ok) throw new Error(`channels API failed: ${channelRes.status}`);
    const channelData = await channelRes.json();
    const uploadsPlaylistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsPlaylistId) throw new Error("uploads playlist not found");

    const itemsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=4&playlistId=${uploadsPlaylistId}&key=${YOUTUBE_API_KEY}`
    );
    if (!itemsRes.ok) throw new Error(`playlistItems API failed: ${itemsRes.status}`);
    const itemsData = await itemsRes.json();
    const videos = (itemsData.items || [])
      .map((item) => ({
        id: item.snippet?.resourceId?.videoId,
        title: item.snippet?.title,
      }))
      .filter((video) => video.id && video.title);

    if (!videos.length) throw new Error("no videos returned");

    writeVideoCache(videos);
    return videos;
  } catch (error) {
    console.warn("YouTube video fetch failed, using fallback:", error);
    const stale = readStaleVideoCache();
    if (stale && stale.length) return stale;
    return null;
  }
}

function youtubeThumbnailUrl(id) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

function renderVideos(videos, container) {
  container.innerHTML = "";
  videos.forEach((video) => {
    const a = document.createElement("a");
    a.className = "video-card";
    a.href = `https://www.youtube.com/watch?v=${video.id}`;
    a.target = "_blank";
    a.rel = "noopener";

    const thumbWrap = document.createElement("div");
    thumbWrap.className = "video-thumb";
    const img = document.createElement("img");
    img.src = youtubeThumbnailUrl(video.id);
    img.alt = "";
    img.loading = "lazy";
    const playIcon = document.createElement("span");
    playIcon.className = "video-play";
    playIcon.setAttribute("aria-hidden", "true");
    playIcon.textContent = "▶";
    thumbWrap.append(img, playIcon);

    const title = document.createElement("p");
    title.className = "video-title";
    title.textContent = video.title;

    a.append(thumbWrap, title);
    container.appendChild(a);
  });
}

function initHeroVideo() {
  const video = document.querySelector(".hero-video");
  if (!video) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    video.removeAttribute("autoplay");
    video.pause();
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  initHeroVideo();

  const videosEl = document.getElementById("videos-grid");
  if (videosEl) {
    const cached = readVideoCache();
    if (cached && cached.length) {
      renderVideos(cached, videosEl);
    } else {
      renderVideos(FALLBACK_VIDEOS, videosEl);
      const liveVideos = await fetchLatestVideos();
      if (liveVideos && liveVideos.length) renderVideos(liveVideos, videosEl);
    }
  }
});
