# Aaron Official リンクページ

TikTok/Instagramのプロフィールに貼る、YouTubeチャンネル誘導用の1ページサイト。

## ローカルで見る

`index.html` をブラウザで直接開くだけで動作する(ビルド不要)。

**注意:** `file://` で直接開いた場合、YouTube Data APIへのfetchはブラウザのセキュリティ制限により必ず失敗し、常にフォールバック動画(`FALLBACK_VIDEOS`)が表示される。最新動画の自動取得が実際に動いているかを確認したい場合は、ローカルではなく公開後のURL(GitHub Pagesのデプロイ先)で確認すること。

## 公開(GitHub Pages)

このサイトのドメインは **`aaron-official.com`**(Cloudflareで取得済み)。リポジトリ直下の `CNAME` ファイルにも設定済みなので、GitHub側は以下の手順だけでよい。

1. このリポジトリをGitHubに作成しプッシュする(`CNAME` ファイルも一緒にpushされる)
2. GitHubのリポジトリ設定 → Pages → Branch を `main`、フォルダを `/ (root)` に設定する
3. 同じPages設定画面の「Custom domain」欄に `aaron-official.com` と入力して Save する(すでにリポジトリに `CNAME` ファイルがあるので自動で認識されるはずだが、念のため手動でも設定する)
4. **Cloudflareダッシュボードで** DNSレコードを設定する(ドメインをCloudflareで取得しているため、DNS設定もCloudflareの管理画面 [dash.cloudflare.com](https://dash.cloudflare.com/) → 対象ドメイン → DNS で行う)
   - 頂点ドメイン `aaron-official.com` 用に、Aレコードを以下の4つすべて追加する(Name欄は `@`)
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`
   - `www.aaron-official.com` も使いたい場合は、CNAMEレコード(Name: `www`)を `<GitHubユーザー名>.github.io` に向ける
   - 各レコードの「Proxy status」は、最初は **DNS only(グレーの雲アイコン)** にしておく。オレンジの雲(Proxied)にするとCloudflare経由になり便利な機能も使えるが、GitHub PagesのSSL証明書発行と干渉して表示されなくなることがあるため、まずはDNS onlyで動作確認してから必要に応じて切り替える
5. GitHub Pages設定の「Enforce HTTPS」チェックボックスは、DNSの反映と証明書の発行が完了するまでグレーアウトしたままになる。反映には最大24時間程度かかることがあるので、すぐにチェックできなくても異常ではない

## プロフィール写真・名前・プロフィール情報の変更方法

- プロフィール写真: `assets/profile-photo.jpg` を差し替える(同じファイル名で上書きすればHTML側の変更は不要。ファイル名を変える場合は `index.html` 内の `.profile-photo img` の `src` も合わせて変更する)
- 名前: `index.html` 内の `.info-name` クラスが付いた見出し(`<h1 class="info-name">Aaron Kuwamoto</h1>`)のテキストを直接編集する
- 生年月日・出身地・メール・肩書き: `index.html` 内の `.info-lines` 内にある `.info-line` 各行を直接編集する

## YouTube Data API キーの発行手順(最新動画の自動取得に必要)

1. https://console.cloud.google.com/ にアクセスし、新しいプロジェクトを作成する
2. 「APIとサービス」→「ライブラリ」で **YouTube Data API v3** を検索して有効化する
3. 「APIとサービス」→「認証情報」→「認証情報を作成」→「APIキー」でキーを発行する
4. 発行したキーの「アプリケーションの制限」を **HTTPリファラー** にし、`https://aaron-official.com/*` と `https://<ユーザー名>.github.io/*`(念のため両方)を許可リストに追加する(これを設定しないと誰でもキーを使えてしまうため必須)
5. 同じキーの「APIの制限」を **キーを制限** にし、**YouTube Data API v3** のみを許可する。HTTPリファラー制限は `curl -H "Referer: ..."` のようなブラウザ以外のクライアントからは簡単に偽装できるため、リファラー制限だけでは不十分。API制限を併用することで、万が一キーが漏れても同じGoogle Cloudプロジェクト内の他のAPIには使えないようにする
6. Google Cloud Consoleで使用量/割り当てのアラートを設定しておく(想定外の大量アクセスやキー漏洩に気づけるようにするため)
7. `script.js` の `YOUTUBE_API_KEY` の値を、発行したキーに書き換える

**警告:** このサイトは無料のGitHub Pagesで公開するため、リポジトリ(したがって `script.js` に書き込むAPIキー)は**公開(public)**になる。また、キーを後からファイルから削除しても、git履歴には残り続ける。もしキーが漏洩・悪用された場合、`script.js` を編集するだけでは不十分で、**Google Cloud Consoleでそのキー自体を削除・再発行(ローテーション)する**必要がある。

## SNSリンク・News・動画の更新方法

- **SNSリンク(ヘッダーのアイコン)**: `index.html` 内の `.site-nav-icons` にある `<a>` を編集・追加する(YouTube・Instagramの2つが現状)
- **News**: `script.js` 先頭付近の `NEWS` 配列に `{ date: "YYYY MM/DD", text: "お知らせ本文", url: "news/連番.html" }` を1行追加する(配列の先頭に足せば新しいお知らせが一番上に表示される)。`url` で指定したファイルは `news/1.html` などをコピーして新しく作成し、日付・タイトル・本文を書き換える
- **動画**: `script.js` の `FALLBACK_VIDEOS` 配列を編集する。YouTube APIが失敗した場合に表示される動画リストなので、たまに手動で最新の動画IDに更新しておくと安心

## TikTok経由でYouTubeリンクが開けない場合について

TikTokアプリ内蔵ブラウザは、YouTubeなど一部の競合サービスへの直接リンクをブロックし、「ブラウザで開いてください」というエラーを表示することがある。この対策として、YouTubeへのリンク(ヘッダーアイコン・「YouTube」ボタン・動画サムネイル)はすべて `go.html` という中継ページを経由するようにしている(`go.html?to=channel` でチャンネルへ、`go.html?to=video&id=動画ID` で個別動画へ遷移する)。中継ページを挟むことで、TikTok側のブロックを回避できる可能性が高くなる。挙動を変える場合は `go.html` 内のJavaScriptと、リンク元(`index.html`・`news/*.html`・`script.js`)を合わせて編集すること。

## キャッシュについての注意

`index.html` / `news/*.html` から読み込む `style.css` と `script.js` には `?v=1` のようなバージョン番号を付けている。ブラウザはCSS/JSファイルを積極的にキャッシュするため、`style.css` や `script.js` を編集したのにブラウザ上で反映されない(前のデザインのまま/古いレイアウトのまま)場合は、この番号を1つ増やす(`?v=1` → `?v=2`)と、ブラウザが新しいファイルとして再取得してくれる。該当箇所は `index.html`・`news/1.html`・`news/2.html`(今後 `news/` に記事を追加した場合はそのファイルも)にある。反映されないときはまずブラウザの強制再読み込み(Mac: Cmd+Shift+R)を試し、それでも直らなければこの番号を上げる。
