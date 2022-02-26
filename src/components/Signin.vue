<template>
  <div class="signin">
    <h2>ログイン／新規登録</h2>
    <div id="firebaseui-auth-container"></div>
    <div id="loader">Loading...</div>
    <p>Demo User: test@example.com</p>
    <p>投稿なしユーザー: test0@example.com</p>
  </div>
</template>

<script>
import { onMounted, reactive } from 'vue'
import firebase from '../plugins/firebase'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import * as commonJS from '../plugins/common'
import * as firebaseui from 'firebaseui'
import styles from 'firebaseui/dist/firebaseui.css'

const ui = new firebaseui.auth.AuthUI(firebase.auth())
const db = firebase.database()
const db_users = db.ref('users/')

export default {
  setup(props) {
    const data = reactive({
      router: useRouter(),
      route: useRoute(),
      store: useStore()
    })

    onMounted(()=> {
      const uiConfig = {
        callbacks: {
          signInSuccess: () => false,
          signInSuccessWithAuthResult: function(authResult, redirectUrl) {
            // console.log(authResult.additionalUserInfo.isNewUser)
            // console.log(authResult.getUser())
            // User successfully signed in.
            // Return type determines whether we continue the redirect automatically
            // or whether we leave that to developer to handle.

            const user = authResult.user
            const reUid = user.uid
            const obj = {
              //email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL
            }
            if(obj.photoURL===null){
              obj.photoURL=commonJS.PHOTO_URL_DFT
            }
            // 新規登録時の処理
            if(authResult.additionalUserInfo.isNewUser){
              db_users.update({[reUid]: obj})
              obj.uid=reUid
              data.store.dispatch("auth", obj)
            }else{
              db.ref('users/' + reUid).on('value', (snapshot) => {
                let result = snapshot.val()
                //obj.email = result.email
                obj.displayName = result.displayName
                obj.photoURL = result.photoURL===null ? obj.photoURL : result.photoURL
                obj.follow = result.follow===null ? {} : result.follow
                obj.followed = result.followed===null ? {} : result.followed

                console.log(result)
                console.log(obj)
                obj.uid=reUid
                data.store.dispatch("auth", obj)
              })
            }

            // リダイレクト前のページに戻る、上手くいかない いってる??
            data.router.push(data.route.query.redirect || '/')

            return false
          },
          uiShown: function() {
            // The widget is rendered.
            // Hide the loader.
            document.getElementById('loader').style.display = 'none';
          }
        },
        // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
        signInFlow: 'redirect',　// popup または redirect
        signInSuccessUrl: '',
        signInOptions: [
          // Leave the lines as is for the providers you want to offer your users.
          firebase.auth.EmailAuthProvider.PROVIDER_ID,
          firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        ],
        // Terms of service url.
        tosUrl: '',
        // Privacy policy url.
        privacyPolicyUrl: ''
      }

      ui.start('#firebaseui-auth-container', uiConfig)
    })
    return { data }
  },
}
</script>
