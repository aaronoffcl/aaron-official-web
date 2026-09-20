const LINKS = [
  { label: "Instagram", url: "https://instagram.com/aaronsta6ram", icon: "instagram" },
];

const FALLBACK_VIDEOS = [
  { id: "xOtNTlCKPvU", title: "アーロンの助手席はこんな感じ" },
  { id: "npFVvUjYvIQ", title: "もう限界なので実家に帰ります" },
  { id: "nbnTclJGsDA", title: "アンチコメントについて本音を語ります" },
  { id: "9mTq7xlF4vo", title: "最初で最後の自己紹介します" },
];

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

document.addEventListener("DOMContentLoaded", () => {
  const sublinksEl = document.getElementById("sublinks");
  if (sublinksEl) renderLinks(LINKS, sublinksEl);

  const videosEl = document.getElementById("videos-grid");
  if (videosEl) renderVideos(FALLBACK_VIDEOS, videosEl);
});
