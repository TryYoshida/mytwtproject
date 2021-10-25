# mytwtproject
メッセージ投稿アプリ

## 公開URL
[https://mytwtproject.web.app/](https://mytwtproject.web.app/)  
Demo User: test@example.com / 1234

## 今やっていること
- プロフィールの画像をアップ、取得、ファイル名をprofile.xxxに変更してアップしたい
- FirebaseのDBルール変えたので何か変になったら確認（個人情報になるemailはDBに保存しないことにする）

## バグ
- ログアウトボタンをクリックでエラー（deployしたやつは普通にいける？？ローカルだけ？）
- ログイン後、初期表示時（ブラウザの更新時はでない）に、Homeの`<BoadList orderBy="user" :equalToObj="data.store.state.follow" />`のequalToObjがundefinedになる。（BoadListをonMounted→nextTickにしたら途中で止まらなくなるけど、undefinedにはなるまま）症状いま↓に
- フォロー中のユーザーの投稿の表示がログイン後読み込めない（BoadList.vueでprops.equalToObjがnullになる、undefinedではない）、再読み込みだといけるを要修正

## 追加したいこと
- 写真を投稿できる
- どういうタイミングでデータベースから取得している情報を更新するか考える
- ログインのセッション？の期間の設定（今無期限？？）
- 読み込むメッセージをスクロールで取得に
- メッセージの削除・編集ができるように
- 見た目を整える
- フォロワー、フォロー中の一覧表示
- フォローをポップアップ（hoverで表示）でできるように？
- 変数名等、命名ルールがバラバラなので整える
