# mytwtproject
メッセージ投稿アプリ

## 公開URL
[https://mytwtproject.web.app/](https://mytwtproject.web.app/)
Demo User: test@example.com

## 今やっていること
- ↓のためにデータベースから値の取得をon→onceに（もっと読み込み後メッセージを投稿したとき等に変になるため）。親コンポーネントから子コンポーネントのメソッドを実行してメッセージ投稿時に投稿内容を追加できるかテスト
- メッセージを指定個数ずつ読み込む（初期値10）を実装中。全ユーザーの最新の投稿のみ設置済み（まだ自動じゃなくて手動）

## バグ
- ログアウトボタンをクリックでエラー（deployしたやつは「No redirect URL has been found. You must either specify a signInSuccessUrl in the configuration, pass in a redirect URL to the widget URL, or return false from the callback.  >Dismiss」というエラーメッセージが/signinに移動後にポップアップされる）
- ~~ログイン後、初期表示時（ブラウザの更新時はでない）に、Homeの`<BoadList orderBy="user" :equalToObj="data.store.state.follow" />`のequalToObjがundefinedになる。（BoadListをonMounted→nextTickにしたら途中で止まらなくなるけど、undefinedにはなるまま）症状いま↓に~~
- ~~フォロー中のユーザーの投稿の表示がログイン後読み込めない（BoadList.vueでprops.equalToObjがnullになる、undefinedではない）、再読み込みだといけるを要修正~~
- 画像を変更したときやフォローを追加解除したときなど、Signin.vue:66,67のログが出力されている？意図せずSigninを読みにいっている？？

## 追加したいこと
- 画像の投稿：投稿中のローディングつける
- 画像の投稿：複数投稿できるようにする
- 画像の投稿：ファイル名がかぶると無理？ランダムなファイル名になるようにする
- どういうタイミングでデータベースから取得している情報を更新するか考える
- ログインのセッション？の期間の設定（今無期限？？）
- 読み込むメッセージをスクロールで取得に
- メッセージの削除・編集ができるように
- 見た目を整える（Vuetifyを試せたら使ってみる）
- フォロワー、フォロー中の一覧表示
- フォローをポップアップ（hoverで表示）でできるように？
- 変数名等、命名ルールがバラバラなので整える
- JSDocを追加
- ストレージにアップするファイルで、サイズを縮小できるならする。それかアップロードできるファイルサイズの上限をつける？
- ドキュメントの作成
