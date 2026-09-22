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

## プロフィール写真・名前・プロフィール情報の変更方法

- プロフィール写真: `assets/profile-photo.jpg` を差し替える(同じファイル名で上書きすればHTML側の変更は不要。ファイル名を変える場合は `index.html` 内の `.profile-photo img` の `src` も合わせて変更する)
- 名前: `index.html` 内の `.info-name` クラスが付いた見出し(`<h1 class="info-name">Aaron Kuwamoto</h1>`)のテキストを直接編集する
- 生年月日・出身地・メール・肩書き: `index.html` 内の `.info-lines` 内にある `.info-line` 各行を直接編集する

## YouTube Data API キーの発行手順(最新動画の自動取得に必要)

1. https://console.cloud.google.com/ にアクセスし、新しいプロジェクトを作成する
2. 「APIとサービス」→「ライブラリ」で **YouTube Data API v3** を検索して有効化する
3. 「APIとサービス」→「認証情報」→「認証情報を作成」→「APIキー」でキーを発行する
4. 発行したキーの「アプリケーションの制限」を **HTTPリファラー** にし、公開予定のドメイン(例: `https://aaronofficial.com/*` や `https://<ユーザー名>.github.io/*`)を許可リストに追加する(これを設定しないと誰でもキーを使えてしまうため必須)
5. 同じキーの「APIの制限」を **キーを制限** にし、**YouTube Data API v3** のみを許可する。HTTPリファラー制限は `curl -H "Referer: ..."` のようなブラウザ以外のクライアントからは簡単に偽装できるため、リファラー制限だけでは不十分。API制限を併用することで、万が一キーが漏れても同じGoogle Cloudプロジェクト内の他のAPIには使えないようにする
6. Google Cloud Consoleで使用量/割り当てのアラートを設定しておく(想定外の大量アクセスやキー漏洩に気づけるようにするため)
7. `script.js` の `YOUTUBE_API_KEY` の値を、発行したキーに書き換える

**警告:** このサイトは無料のGitHub Pagesで公開するため、リポジトリ(したがって `script.js` に書き込むAPIキー)は**公開(public)**になる。また、キーを後からファイルから削除しても、git履歴には残り続ける。もしキーが漏洩・悪用された場合、`script.js` を編集するだけでは不十分で、**Google Cloud Consoleでそのキー自体を削除・再発行(ローテーション)する**必要がある。

## SNSリンク・News・動画の更新方法

- **SNSリンク(ヘッダーのアイコン)**: `index.html` 内の `.site-nav-icons` にある `<a>` を編集・追加する(YouTube・Instagramの2つが現状)
- **News**: `script.js` 先頭付近の `NEWS` 配列に `{ date: "YYYY MM/DD", text: "お知らせ本文", url: "news/連番.html" }` を1行追加する(配列の先頭に足せば新しいお知らせが一番上に表示される)。`url` で指定したファイルは `news/1.html` などをコピーして新しく作成し、日付・タイトル・本文を書き換える
- **動画**: `script.js` の `FALLBACK_VIDEOS` 配列を編集する。YouTube APIが失敗した場合に表示される動画リストなので、たまに手動で最新の動画IDに更新しておくと安心

## キャッシュについての注意

`index.html` / `news/*.html` から読み込む `style.css` と `script.js` には `?v=1` のようなバージョン番号を付けている。ブラウザはCSS/JSファイルを積極的にキャッシュするため、`style.css` や `script.js` を編集したのにブラウザ上で反映されない(前のデザインのまま/古いレイアウトのまま)場合は、この番号を1つ増やす(`?v=1` → `?v=2`)と、ブラウザが新しいファイルとして再取得してくれる。該当箇所は `index.html`・`news/1.html`・`news/2.html`(今後 `news/` に記事を追加した場合はそのファイルも)にある。反映されないときはまずブラウザの強制再読み込み(Mac: Cmd+Shift+R)を試し、それでも直らなければこの番号を上げる。
