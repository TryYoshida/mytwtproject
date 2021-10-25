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
 * @param {Object} obj
 * @param obj.inputFile ファイル
 * @param {String} obj.directory ディレクトリ
 * @param {String} [obj.fileName] 登録するファイル名（任意）
 * @param {Function} [obj.resultFnc] アップロード成功後に実行する処理（任意）
 */
export function attachImage(obj) {
  const file = obj.inputFile
  if(!file || !obj.directory) {
    return
  }
  let _fileName = file.name
  if(obj.fileName && _fileName.lastIndexOf('.') > 0){
    _fileName = obj.fileName + '.' +  _fileName.split('.').pop()
  }
  const uploadTask = firebase.storage().ref().child(`${obj.directory}${_fileName}`).put(file)
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
        obj.resultFnc(downloadURL)
        //console.log('File available at', downloadURL)
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
