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
