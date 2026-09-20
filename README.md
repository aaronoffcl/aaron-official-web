# Aaron Official リンクページ

TikTok/Instagramのプロフィールに貼る、YouTubeチャンネル誘導用の1ページサイト。

## ローカルで見る

`index.html` をブラウザで直接開くだけで動作する(ビルド不要)。

**注意:** `file://` で直接開いた場合、YouTube Data APIへのfetchはブラウザのセキュリティ制限により必ず失敗し、常にフォールバック動画(`FALLBACK_VIDEOS`)が表示される。最新動画の自動取得が実際に動いているかを確認したい場合は、ローカルではなく公開後のURL(GitHub Pagesのデプロイ先)で確認すること。

## 公開(GitHub Pages)

1. このリポジトリをGitHubに作成しプッシュする
2. GitHubのリポジトリ設定 → Pages → Branch を `main`、フォルダを `/ (root)` に設定する
3. カスタムドメインを取得したら、`CNAME` という名前のファイル(拡張子なし)を作成し、中身にドメイン名(例: `aaronofficial.com`)だけを書いてリポジトリ直下に置く
4. ドメイン側のDNSを設定する
   - 頂点ドメイン(例: `aaronofficial.com`)を使う場合: Aレコードを以下の4つすべてに設定する
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`
   - `www` サブドメイン(例: `www.aaronofficial.com`)を使う場合: CNAMEレコードを `<GitHubユーザー名>.github.io` に向ける
5. GitHub Pages設定の「Enforce HTTPS」チェックボックスは、DNSの反映と証明書の発行が完了するまでグレーアウトしたままになる。反映には最大24時間程度かかることがあるので、すぐにチェックできなくても異常ではない

## プロフィール写真・名前・キャッチコピーの変更方法

- プロフィール写真: `index.html` 内の `<div class="avatar-placeholder" ...>A</div>` を、`assets/` に置いた画像ファイルを参照する `<img>` タグに置き換える(例: `<img src="assets/profile.jpg" alt="">`)
- 名前: `index.html` 内の `.name` クラスが付いた要素(`<h1 class="name">Aaron / アーロン</h1>`)のテキストを直接編集する
- キャッチコピー: `index.html` 内の `.tagline` クラスが付いた要素(`<p class="tagline">毎日更新中</p>`)のテキストを直接編集する

## YouTube Data API キーの発行手順(最新動画の自動取得に必要)

1. https://console.cloud.google.com/ にアクセスし、新しいプロジェクトを作成する
2. 「APIとサービス」→「ライブラリ」で **YouTube Data API v3** を検索して有効化する
3. 「APIとサービス」→「認証情報」→「認証情報を作成」→「APIキー」でキーを発行する
4. 発行したキーの「アプリケーションの制限」を **HTTPリファラー** にし、公開予定のドメイン(例: `https://aaronofficial.com/*` や `https://<ユーザー名>.github.io/*`)を許可リストに追加する(これを設定しないと誰でもキーを使えてしまうため必須)
5. 同じキーの「APIの制限」を **キーを制限** にし、**YouTube Data API v3** のみを許可する。HTTPリファラー制限は `curl -H "Referer: ..."` のようなブラウザ以外のクライアントからは簡単に偽装できるため、リファラー制限だけでは不十分。API制限を併用することで、万が一キーが漏れても同じGoogle Cloudプロジェクト内の他のAPIには使えないようにする
6. Google Cloud Consoleで使用量/割り当てのアラートを設定しておく(想定外の大量アクセスやキー漏洩に気づけるようにするため)
7. `script.js` の `YOUTUBE_API_KEY` の値を、発行したキーに書き換える

**警告:** このサイトは無料のGitHub Pagesで公開するため、リポジトリ(したがって `script.js` に書き込むAPIキー)は**公開(public)**になる。また、キーを後からファイルから削除しても、git履歴には残り続ける。もしキーが漏洩・悪用された場合、`script.js` を編集するだけでは不十分で、**Google Cloud Consoleでそのキー自体を削除・再発行(ローテーション)する**必要がある。

## リンク・動画の更新方法

`script.js` の先頭付近にある配列を編集するだけで反映される。

- `LINKS`: Instagram以外のSNSリンクを追加する場合、配列に `{ label: "表示名", url: "URL", icon: "アイコン名" }` を1行追加する
- `FALLBACK_VIDEOS`: YouTube APIが失敗した場合に表示される動画リスト。たまに手動で最新の動画IDに更新しておくと安心
