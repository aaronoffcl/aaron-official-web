const LINKS = [
  { label: "Instagram", url: "https://instagram.com/aaronsta6ram", icon: "instagram" },
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

document.addEventListener("DOMContentLoaded", () => {
  const sublinksEl = document.getElementById("sublinks");
  if (sublinksEl) renderLinks(LINKS, sublinksEl);
});
