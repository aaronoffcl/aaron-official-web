# Aaron Official リンクページ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** TikTok/Instagramのプロフィールに貼る、モバイル最優先の1ページ・リンクページを構築する。YouTubeチャンネルへの導線を最も目立たせ、YouTube Data API v3でチャンネルの最新動画を自動表示する。

**Architecture:** ビルドツールなしの素のHTML/CSS/JS単一ページ(`index.html`)。`script.js` にリンク・動画のデータ定義とレンダリング関数、YouTube Data API連携をまとめる。`style.css` はモバイル幅(375px前後)を主軸にしたダーク/モノクロ系の1カラムレイアウト。

**Tech Stack:** HTML5, CSS3(CSS変数, Flexbox/Grid, `prefers-reduced-motion`), Vanilla JS(`fetch`, `localStorage`), Google Fonts(Bebas Neue / Inter), YouTube Data API v3, YouTubeサムネイル静的URL(`i.ytimg.com`)

**Spec:** [docs/superpowers/specs/2026-09-20-aaron-official-linkpage-design.md](../specs/2026-09-20-aaron-official-linkpage-design.md)

## Global Constraints

- モバイル幅(375px前後)を主軸にデザイン・検証する。デスクトップ幅でも崩れないこと
- YouTubeへの導線を他のリンクより明確に大きく・上位に配置する(メインCTA)
- サブリンクは今回 Instagram のみ(`LINKS` 配列で管理。後から1行追加するだけで拡張可能)
- 動画セクションは埋め込みiframeではなく、サムネイル+タップでYouTubeへ遷移する軽量方式
- YouTube Data APIキーはクライアントに埋め込むため、**HTTPリファラー制限の設定が必須**。この手順はREADMEに明記し、キー発行自体はユーザー(Googleアカウント保有者)が行う
- API取得に失敗した場合は `FALLBACK_VIDEOS` を表示し、ページが壊れないこと
- 実送信フォーム・バックエンド・CMSは範囲外
- **テスト方針の注記:** 本プロジェクトは静的サイトでありユニットテストフレームワークを持たないため、各タスクの「テスト」は `mcp__Claude_Browser__*` ツール(`navigate` → `read_page` / `javascript_tool` でDOM・挙動を確認、`resize_window` でモバイル幅、`computer screenshot` で目視確認)による検証に置き換える。赤→緑は「実装前はDOM/挙動が存在しない・失敗する」→「実装後は存在し意図通り動く」の対比で満たす。

---

## ファイル構成

```
Aaron_Official_Web/
├── index.html          # 1ページ構成のリンクページ
├── style.css           # 全体スタイル
├── script.js           # データ定義 + レンダリング + YouTube API連携
├── assets/
│   └── favicon.svg     # モノクロの簡易ロゴ(丸背景+"A")
├── README.md           # APIキー発行手順・リンク/動画の更新方法・ドメイン設定メモ
└── docs/superpowers/{specs,plans}/...
```

---

### Task 1: グローバルトークン・ベースリセット(モバイル最優先)

**Files:**
- Create: `style.css`
- Test: 一時ファイル `_verify-task1.html`(検証後に削除)

**Interfaces:**
- Produces: CSS変数 `--bg, --bg-elev, --text, --text-dim, --text-mute, --border, --accent-youtube, --ease, --display, --body`。以降の全タスクはこれらの変数名をそのまま使う。

- [ ] **Step 1: `style.css` に基盤を書く**

```css
:root {
  --bg: #0b0b0c;
  --bg-elev: #16161a;
  --text: #f5f5f2;
  --text-dim: rgba(245, 245, 242, 0.66);
  --text-mute: rgba(245, 245, 242, 0.4);
  --border: rgba(255, 255, 255, 0.1);
  --accent-youtube: #ff2f2f;
  --ease: cubic-bezier(0.16, 1, 0.3, 1);
  --display: "Bebas Neue", "Impact", sans-serif;
  --body: "Inter", "Hiragino Sans", sans-serif;
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  background: var(--bg);
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--body);
  font-size: 16px;
  line-height: 1.6;
  min-height: 100svh;
}

img { max-width: 100%; display: block; }
a { color: inherit; text-decoration: none; }
button { font-family: inherit; color: inherit; }

.page {
  width: min(480px, 100%);
  margin: 0 auto;
  padding: 40px 20px 64px;
  display: grid;
  gap: 32px;
}

@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

- [ ] **Step 2: `_verify-task1.html` を作って読み込み確認**

```html
<!DOCTYPE html>
<html lang="ja"><head><meta charset="UTF-8">
<link rel="stylesheet" href="style.css">
</head><body>
<div class="page"><p id="probe">test</p></div>
</body></html>
```

Browserツールで `file:///Users/aaronkuwamoto/Desktop/Aaron_Official_Web/_verify-task1.html` を開き、`javascript_tool` で確認する:

```js
getComputedStyle(document.body).backgroundColor
```

Expected: `"rgb(11, 11, 12)"`(`--bg` の値と一致)。

- [ ] **Step 3: 検証ファイルを削除してコミット**

```bash
cd /Users/aaronkuwamoto/Desktop/Aaron_Official_Web
rm _verify-task1.html
git add style.css
git commit -m "feat: add design tokens and mobile-first base reset"
```

---

### Task 2: ページ骨格・プロフィールヘッダー

**Files:**
- Create: `index.html`
- Create: `assets/favicon.svg`
- Modify: `style.css`(`.profile` 関連)

**Interfaces:**
- Consumes: Task 1の変数
- Produces: `.profile`, `.avatar-placeholder`, `.name`, `.tagline` クラス。ページ全体の `<section id="links">` / `<section id="videos">` の空コンテナ(Task 3・4で中身を追加)。

- [ ] **Step 1: `assets/favicon.svg` を作成(モノクロの簡易マーク)**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="32" fill="#0b0b0c"/>
  <text x="32" y="42" font-family="Georgia, serif" font-size="34" fill="#f5f5f2" text-anchor="middle">A</text>
</svg>
```

- [ ] **Step 2: `index.html` を作成**

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aaron / アーロン</title>
  <meta name="description" content="Aaron / アーロン 公式リンクページ。YouTube・Instagramはこちら。">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="page">
    <header class="profile">
      <div class="avatar-placeholder" aria-hidden="true">A</div>
      <h1 class="name">Aaron / アーロン</h1>
      <p class="tagline">毎日更新中</p>
    </header>

    <section class="links" aria-label="リンク">
      <!-- Task 3で中身を追加 -->
    </section>

    <section class="videos" aria-label="最新動画">
      <h2 class="section-heading">最新動画</h2>
      <div class="video-grid" id="videos-grid">
        <!-- Task 4で中身を追加 -->
      </div>
    </section>

    <footer class="site-footer">
      <p class="copy">&copy; Aaron</p>
    </footer>
  </main>
  <script src="script.js"></script>
</body>
</html>
```

- [ ] **Step 3: `style.css` に追記**

```css
.profile {
  display: grid;
  justify-items: center;
  gap: 10px;
  text-align: center;
}

.avatar-placeholder {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  font-family: var(--display);
  font-size: 40px;
  color: var(--text-dim);
}

.name {
  font-family: var(--display);
  font-size: 28px;
  letter-spacing: 0.02em;
}

.tagline {
  font-size: 13px;
  color: var(--text-mute);
  letter-spacing: 0.04em;
}

.section-heading {
  font-family: var(--display);
  font-size: 18px;
  letter-spacing: 0.04em;
  color: var(--text-dim);
  margin-bottom: 14px;
}

.site-footer {
  text-align: center;
  padding-top: 16px;
}

.copy {
  font-size: 11px;
  color: var(--text-mute);
}
```

- [ ] **Step 4: ブラウザ確認**

`navigate` で `file:///Users/aaronkuwamoto/Desktop/Aaron_Official_Web/index.html` を開く。`resize_window`(`preset: "mobile"`)にしてから `read_page` で「Aaron / アーロン」と「毎日更新中」のテキストが存在することを確認し、`computer screenshot` で見た目を確認する。続けて `resize_window`(`preset: "desktop"`)に戻し、横スクロールが出ていないことを `javascript_tool` で `document.documentElement.scrollWidth <= window.innerWidth` を確認する。

- [ ] **Step 5: コミット**

```bash
git add index.html style.css assets/favicon.svg
git commit -m "feat: add page shell and profile header"
```

---

### Task 3: メインCTA(YouTube)とサブリンク(Instagram)

**Files:**
- Modify: `index.html`(`<section class="links">` の中身)
- Create: `script.js`
- Modify: `style.css`(`.cta-youtube`, `.sublinks`, `.link-btn`)

**Interfaces:**
- Consumes: Task 2の `#links` セクション(現在は空)
- Produces: `LINKS` 配列、`renderLinks(links, container)` 関数。以降のタスク(動画セクション)も同じ「データ配列→レンダリング関数」のパターンを踏襲する。

- [ ] **Step 1: `index.html` の `<section class="links">` の中身を置き換える**

```html
<section class="links" aria-label="リンク">
  <a class="cta-youtube" href="https://www.youtube.com/@aaron.youtube.official" target="_blank" rel="noopener">
    <span class="cta-icon" aria-hidden="true">▶</span>
    <span class="cta-label">YouTubeを見る</span>
  </a>
  <div class="sublinks" id="sublinks"></div>
</section>
```

- [ ] **Step 2: ブラウザで「まだ空」の状態を確認(赤)**

`navigate` で `index.html` を再読み込みし、`javascript_tool` で確認する:

```js
document.getElementById('sublinks').children.length
```

Expected: `0`(まだ `script.js` を読み込んでいないため何も描画されていない)。

- [ ] **Step 3: `script.js` を作成**

```js
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
```

- [ ] **Step 4: ブラウザで描画結果を確認(緑)**

`index.html` を再読み込みし、`javascript_tool` で確認する:

```js
const btn = document.querySelector('#sublinks .link-btn');
[document.querySelectorAll('#sublinks .link-btn').length, btn?.href, document.querySelector('.cta-youtube')?.href]
```

Expected: `[1, "https://instagram.com/aaronsta6ram", "https://www.youtube.com/@aaron.youtube.official"]`

- [ ] **Step 5: `style.css` にボタンスタイルを追記(YouTubeを明確に主役にする)**

```css
.links {
  display: grid;
  gap: 12px;
}

.cta-youtube {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 56px;
  border-radius: 12px;
  background: var(--accent-youtube);
  color: #fff;
  font-family: var(--display);
  font-size: 18px;
  letter-spacing: 0.04em;
  transition: transform 0.2s var(--ease), filter 0.2s;
}

.cta-youtube:hover, .cta-youtube:active {
  transform: translateY(-1px);
  filter: brightness(1.08);
}

.cta-icon { font-size: 14px; }

.sublinks {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.link-btn {
  height: 40px;
  padding: 0 18px;
  border-radius: 999px;
  border: 1px solid var(--border);
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  color: var(--text-dim);
  transition: border-color 0.2s, color 0.2s;
}

.link-btn:hover {
  border-color: var(--text-dim);
  color: var(--text);
}
```

- [ ] **Step 6: 見た目を確認**

`resize_window`(`preset: "mobile"`)で `computer screenshot` を撮り、YouTubeボタンがInstagramボタンより明確に大きく・目立つ配色になっていることを目視確認する。`resize_window`(`preset: "desktop"`)に戻す。

- [ ] **Step 7: コミット**

```bash
git add index.html script.js style.css
git commit -m "feat: add YouTube CTA and data-driven sublinks"
```

---

### Task 4: 動画セクション(フォールバックデータで描画)

**Files:**
- Modify: `script.js`(`FALLBACK_VIDEOS`, `youtubeThumbnailUrl`, `renderVideos`)
- Modify: `style.css`(`.video-grid`, `.video-card`)

**Interfaces:**
- Consumes: Task 2の `#videos-grid` コンテナ、Task 3の「配列→レンダリング関数」パターン
- Produces: `FALLBACK_VIDEOS` 配列、`youtubeThumbnailUrl(id)`、`renderVideos(videos, container)` 関数。Task 5はこの `renderVideos` をそのまま呼び出す。

- [ ] **Step 1: `script.js` に追記(`LINKS` の下あたりに追加)**

```js
const FALLBACK_VIDEOS = [
  { id: "xOtNTlCKPvU", title: "アーロンの助手席はこんな感じ" },
  { id: "npFVvUjYvIQ", title: "もう限界なので実家に帰ります" },
  { id: "nbnTclJGsDA", title: "アンチコメントについて本音を語ります" },
  { id: "9mTq7xlF4vo", title: "最初で最後の自己紹介します" },
];

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
```

- [ ] **Step 2: `DOMContentLoaded` ハンドラに動画描画を追加**

`script.js` 内の既存の `document.addEventListener("DOMContentLoaded", () => { ... })` を以下に置き換える:

```js
document.addEventListener("DOMContentLoaded", () => {
  const sublinksEl = document.getElementById("sublinks");
  if (sublinksEl) renderLinks(LINKS, sublinksEl);

  const videosEl = document.getElementById("videos-grid");
  if (videosEl) renderVideos(FALLBACK_VIDEOS, videosEl);
});
```

- [ ] **Step 3: ブラウザで描画結果を確認**

`index.html` を再読み込みし、`javascript_tool` で確認する:

```js
const cards = document.querySelectorAll('#videos-grid .video-card');
[cards.length, cards[0]?.href, cards[0]?.querySelector('img')?.src]
```

Expected: `[4, "https://www.youtube.com/watch?v=xOtNTlCKPvU", "https://i.ytimg.com/vi/xOtNTlCKPvU/hqdefault.jpg"]`

- [ ] **Step 4: `style.css` に追記**

```css
.video-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

@media (min-width: 560px) {
  .video-grid { grid-template-columns: repeat(2, 1fr); }
}

.video-card {
  display: block;
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  background: var(--bg-elev);
}

.video-thumb {
  position: relative;
  aspect-ratio: 16 / 9;
}

.video-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-play {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #fff;
  font-size: 20px;
  background: rgba(0, 0, 0, 0.28);
}

.video-title {
  padding: 10px 12px;
  font-size: 13px;
  color: var(--text-dim);
}
```

- [ ] **Step 5: 見た目を確認**

`resize_window`(`preset: "mobile"`)で `screenshot` を撮り、動画カードが1カラムでサムネイル+タイトルが表示されることを確認。`resize_window` で幅600px程度にすると2カラムになることも確認し、最後に `preset: "desktop"` に戻す。

- [ ] **Step 6: コミット**

```bash
git add script.js style.css
git commit -m "feat: add video section rendering from fallback data"
```

---

### Task 5: YouTube Data API v3 連携(最新動画の自動取得)

**Files:**
- Modify: `script.js`(`fetchLatestVideos`, `readVideoCache`, `writeVideoCache`, `DOMContentLoaded` ハンドラ更新)

**Interfaces:**
- Consumes: Task 4の `renderVideos(videos, container)`, `FALLBACK_VIDEOS`
- Produces: `fetchLatestVideos()`(`Promise<Array|null>` を返す非同期関数)

- [ ] **Step 1: `script.js` の `FALLBACK_VIDEOS` の下に追記**

```js
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
```

- [ ] **Step 2: `DOMContentLoaded` ハンドラを更新(フォールバックを即表示→取得できたら差し替え)**

```js
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
```

- [ ] **Step 3: フォールバック経路をブラウザで確認(APIキー未設定時)**

`YOUTUBE_API_KEY` はまだ `"YOUR_YOUTUBE_API_KEY_HERE"` のプレースホルダーのため、実際のAPI呼び出しは失敗する。これを利用してエラーハンドリングを確認する。

`index.html` を再読み込みし、`read_console_messages` で `"YouTube video fetch failed, using fallback:"` を含む警告が出力されることを確認する。続けて `javascript_tool` で以下を実行し、フォールバック動画が表示され続けている(ページが壊れていない)ことを確認する:

```js
document.querySelectorAll('#videos-grid .video-card').length
```

Expected: `4`(`FALLBACK_VIDEOS` の件数のまま)。

- [ ] **Step 4: コミット**

```bash
git add script.js
git commit -m "feat: fetch latest videos via YouTube Data API with cache and fallback"
```

**Note:** ユーザーが実際のAPIキーを発行して `YOUTUBE_API_KEY` に設定した後は、Task 6のREADMEの手順に沿って再度ブラウザで動作確認し、`#videos-grid` の内容がチャンネルの実際の最新動画に置き換わることを確認する。

---

### Task 6: README(運用ガイド)・最終横断チェック

**Files:**
- Create: `README.md`
- Files: なし(最終チェックは検証のみ、問題があれば該当ファイルを修正)

- [ ] **Step 1: `README.md` を作成**

```markdown
# Aaron Official リンクページ

TikTok/Instagramのプロフィールに貼る、YouTubeチャンネル誘導用の1ページサイト。

## ローカルで見る

`index.html` をブラウザで直接開くだけで動作する(ビルド不要)。

## 公開(GitHub Pages)

1. このリポジトリをGitHubに作成しプッシュする
2. GitHubのリポジトリ設定 → Pages → Branch を `main` に設定
3. カスタムドメインを取得したら、`CNAME` という名前のファイル(拡張子なし)を作成し、中身にドメイン名(例: `aaronofficial.com`)だけを書いてリポジトリ直下に置く。ドメイン側のDNSにGitHub PagesのA/CNAMEレコードを設定する

## YouTube Data API キーの発行手順(最新動画の自動取得に必要)

1. https://console.cloud.google.com/ にアクセスし、新しいプロジェクトを作成する
2. 「APIとサービス」→「ライブラリ」で **YouTube Data API v3** を検索して有効化する
3. 「APIとサービス」→「認証情報」→「認証情報を作成」→「APIキー」でキーを発行する
4. 発行したキーの「アプリケーションの制限」を **HTTPリファラー** にし、公開予定のドメイン(例: `https://aaronofficial.com/*` や `https://<ユーザー名>.github.io/*`)を許可リストに追加する(これを設定しないと誰でもキーを使えてしまうため必須)
5. `script.js` の `YOUTUBE_API_KEY` の値を、発行したキーに書き換える

## リンク・動画の更新方法

`script.js` の先頭付近にある配列を編集するだけで反映される。

- `LINKS`: Instagram以外のSNSリンクを追加する場合、配列に `{ label: "表示名", url: "URL", icon: "アイコン名" }` を1行追加する
- `FALLBACK_VIDEOS`: YouTube APIが失敗した場合に表示される動画リスト。たまに手動で最新の動画IDに更新しておくと安心
```

- [ ] **Step 2: 全体の最終確認(モバイル/デスクトップ・コンソールエラー)**

`navigate` で `index.html` を開き、`resize_window`(`preset: "mobile"`)で `screenshot` を撮って、プロフィール→YouTube CTA→Instagram→動画一覧の順に自然に見えることを確認する。次に `read_console_messages`(`onlyErrors: true`)を実行し、`fetchLatestVideos` の警告以外のエラーが出ていないことを確認する。最後に `resize_window`(`preset: "desktop"`)に戻し、`javascript_tool` で `document.documentElement.scrollWidth <= window.innerWidth` を確認する。

- [ ] **Step 3: 問題があれば修正しコミット、なければREADME追加のみコミット**

```bash
git add README.md
git commit -m "docs: add setup and maintenance guide"
```

(横断チェックで修正が発生した場合は、該当ファイルもあわせて `git add -A` してから1つのコミットにまとめてよい)
