<template>
  <header class="app-header">
    <div class="page-inner">
      <p class="app-title">MESSAGE BOARD mini</p>
      <div class="app-header__logout" v-if="data.isLogin"><button @click="doLogout" class="_button">Logout</button></div>
    </div>
  </header>
</template>

<script>
import { onMounted, ref, reactive, computed } from 'vue'
import firebase from '../plugins/firebase'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { logout, auth } from '../plugins/auth'
import * as commonJS from '../plugins/common'

const provider = new firebase.auth.GoogleAuthProvider()
const db = firebase.database()
const db_board = db.ref('board/')

export default {
  setup(props) {
    const data = reactive({
      isLogin: false,
      router: useRouter(),
      store: useStore()
    })

    // ログアウト処理
    const doLogout = ()=> {
      logout().then(() => {
        data.store.dispatch("auth", {
          uid: '',
          //email: '',
          displayName: '',
          photoURL: '',
          follow: null,
          followed: null
        })
        data.router.push('/signin')
      })
      .catch((error) => {
        // エラー処理をここで行う
        console.log(error)
      })
    }

    onMounted(()=> {
      data.isLogin = Boolean(data.store.state.uid);
    })
    return { data, doLogout }
  },
}
</script>
