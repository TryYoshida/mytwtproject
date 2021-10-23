import firebase from 'firebase'

export function login (email, password) {
   return firebase.auth().signInWithEmailAndPassword(email, password)
}

export function logout() {
  return firebase.auth().signOut()
}

export function reAuth(email, password) {
  return firebase.auth.EmailAuthProvider.credential(email, password)
}

export function auth () {
  return new Promise(resolve => {
    firebase.auth().onAuthStateChanged(user => {
      resolve(user || false)
    })
  })
}

/**
 * 画像をアップロードします
 * @param inputFile ファイル
 * @param directory ディレクトリ
 */
export function attachImage(inputFile, directory) {
  const file = inputFile
  if(!file || !directory) {
    return;
  }
  console.log(`file.name= ${file.name}`)

  const uploadTask = firebase.storage().ref().child(`${directory}${file.name}`).put(file)
  uploadTask.on('state_changed',
    (snapshot) => {
      // 成功時の処理
    },
    (error) => {
      // エラー
      console.log('err', error)
    },
    () => {
      uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
        // ファイルアップロードして使えるようになったときの処理
      })
    }
  )
}

// 画像をStorageから取得
export function download (title) {
  const imageURL = `tmp/${title}`
  return firebase.storage().ref().child(imageURL).getDownloadURL(
    function(error) {
      if (!error) {
        alert('画像のダウンロードに失敗しました');
        console.log(error)
      } else {
        console.log("Download URL successfully!")
      }
    }
  )
}
