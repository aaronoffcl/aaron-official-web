const LINKS = [
  { label: "Instagram", url: "https://instagram.com/aaronsta6ram", icon: "instagram" },
];

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

function readVideoCache() {
  try {
    const raw = localStorage.getItem(VIDEO_CACHE_KEY);
    if (!raw) return null;
    const { videos, savedAt } = JSON.parse(raw);
    if (!Array.isArray(videos) || Date.now() - savedAt > VIDEO_CACHE_TTL_MS) return null;
    return videos;
  } catch (error) {
    return null;
  }
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
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=6&playlistId=${uploadsPlaylistId}&key=${YOUTUBE_API_KEY}`
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
    return null;
  }
}

function renderLinks(links, container) {
  container.innerHTML = "";
  links.forEach((link) => {
    const a = document.createElement("a");
    a.className = "link-btn";
    a.href = link.url;
    a.target = "_blank";
    a.rel = "noopener";
    a.dataset.icon = link.icon;
    a.textContent = link.label;
    container.appendChild(a);
  });
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
    img.alt = video.title;
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

document.addEventListener("DOMContentLoaded", async () => {
  const sublinksEl = document.getElementById("sublinks");
  if (sublinksEl) renderLinks(LINKS, sublinksEl);

  const videosEl = document.getElementById("videos-grid");
  if (videosEl) {
    renderVideos(FALLBACK_VIDEOS, videosEl);
    const liveVideos = await fetchLatestVideos();
    if (liveVideos && liveVideos.length) renderVideos(liveVideos, videosEl);
  }
});
