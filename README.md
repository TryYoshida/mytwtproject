# mytwtproject
メッセージ投稿アプリ

## 公開URL
[https://mytwtproject.web.app/](https://mytwtproject.web.app/)
Demo User: test@example.com

## 今やっていること
- バグの解消
- コードのブラッシュアップ

## バグ（優先度高）
- ログイン直後タブをクリックしても動かない（再読み込みすると解消）
- ログイン直後ヘッダーのログアウトボタンが表示されない（再読み込みすると解消）
- 全ユーザーのメッセージの読み込みが一部重複している（最後のもっと見るブロックが2回出力されている？）

## バグ
- ログイン・ログアウト時に出るエラー　Error: Missing required param "prmUid"
- 画像を変更したときやフォローを追加解除したときなど、Signin.vue:66,67のログが出力されている？意図せずSigninを読みにいっている？？

## 修正済みバグ
- ログアウトボタンをクリックでエラー（deployしたやつは「No redirect URL has been found. You must either specify a signInSuccessUrl in the configuration, pass in a redirect URL to the widget URL, or return false from the callback.  >Dismiss」というエラーメッセージが/signinに移動後にポップアップされる）
- ログイン後、初期表示時（ブラウザの更新時はでない）に、Homeの`<BoadList orderBy="user" :equalToObj="data.store.state.follow" />`のequalToObjがundefinedになる。（BoadListをonMounted→nextTickにしたら途中で止まらなくなるけど、undefinedにはなるまま）症状いま↓に
- フォロー中のユーザーの投稿の表示がログイン後読み込めない（BoadList.vueでprops.equalToObjがnullになる、undefinedではない）、再読み込みだといけるを要修正

## 追加したいこと
- 画像の投稿：投稿中のローディングつける
- 画像の投稿：複数投稿できるようにする
- 画像の投稿：ファイル名がかぶると無理？ランダムなファイル名になるようにする
- どういうタイミングでデータベースから取得している情報を更新するか考える
- ログインのセッション？の期間の設定（今無期限？？）
- メッセージの削除・編集ができるように
- フォロワー、フォロー中の一覧表示
- フォローをポップアップ（hoverで表示）でできるように？
- 変数名等、命名ルールがバラバラなので整える
- JSDocを追加
- ストレージにアップするファイルで、サイズを縮小できるならする。それかアップロードできるファイルサイズの上限をつける？
- ドキュメントの作成

## 追加完了
- 見た目を整える（Vuetifyを試せたら使ってみる）
- 指定個数ずつ読み込むメッセージをスクロールで取得に
