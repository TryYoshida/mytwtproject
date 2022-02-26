<template>
  <section>
    <div class="alert h6 text-right"><button @click="doLogout" class="btn btn-primary">ログアウト</button></div>
    <h2>ホーム<br>
      <router-link :to="{name:'Profile',params:{prmUid:$store.state.uid}}">{{ $store.state.displayName }} さん <img :src="$store.state.photoURL" alt="" width="100"></router-link></h2>
    <p class="h5">{{data.message}}</p>
    <div v-if="$store.state.uid" class="alert alert-primary">
      <div class="form-group text-left" :class={msgOver:msg_cntOver}>
        <label class="h5">Message</label>
        <textarea v-model.trim="data.msg" rows="5" class="form-control" placeholder="What’s happening"></textarea>
        <p class="msg-counter"><span>{{data.msg.length}}</span>/{{data.msg_maxlength}}</p>
        <div class="upload">
          <p class="photo"><img :src="data.uploadImageUrl" alt="" width="100"></p>
          <input type="file" accept="image/*" name="inputProfileFile" show-size @change="onImagePicked">
          <input type="button" value="クリア" @click="clearFileInput">
        </div>
        <button @click="add" :disabled="addBtn_disabled" class="btn btn-primary">投稿</button>
      </div>
      <h3 class="my-3">フォロー中のユーザーの投稿</h3>
      <BoadList orderBy="user" :equalToObj="data.store.state.follow" />
      <h3 class="my-3">全ユーザーの最新の投稿</h3>
      <BoadList orderBy="key" />
    </div>
    <div v-else>
      <div class="alert alert-warning">
        ※現在、ログインされていません。
      </div>
    </div>
  </section>
</template>

<script>
import { onMounted, ref, reactive, computed } from 'vue'
import firebase from '../plugins/firebase'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { logout, auth } from '../plugins/auth'
import * as commonJS from '../plugins/common'
import { attachImage } from '../plugins/auth'

import BoadList from './BoadList.vue'

const provider = new firebase.auth.GoogleAuthProvider()
const db = firebase.database()
const db_board = db.ref('board/')

export default {
  components: {
    BoadList
  },
  setup(props) {
    const data = reactive({
      message: 'ミニ伝言板。最新の投稿を表示します。',
      msg: '',
      msg_maxlength: commonJS.MESSAGE_MAX_LENGTH,
      uploadImageUrl: "",
      input_image:null,
      router: useRouter(),
      store: useStore()
    })

    // 初期表示
    const init = ()=> {
      data.message = 'ログインしました。'
    }

    // ログアウト処理
    const doLogout = ()=> {
      logout().then(() => {
        data.board_data = {}
        data.store.dispatch("auth", {
          uid: '',
          //email: '',
          displayName: '',
          photoURL: '',
          follow: null,
          followed: null
        })
        data.message = 'ログアウトしました。'
        data.router.push('/signin')
      })
      .catch((error) => {
        // エラー処理をここで行う
        console.log(error)
      })
    }
    
    //写真のアップロード
    const onImagePicked = (e)=>{
      const file = e.target.files[0]
      if (file !== undefined && file !== null) {
        if (file.name.lastIndexOf('.') < 0) {
          return
        }
        data.input_image = file
        const fr = new FileReader()
        fr.readAsDataURL(file)
        fr.addEventListener('load', () => {
          data.uploadImageUrl = fr.result
        })
      } else {
        data.uploadImageUrl = ''
        data.input_image = null
      }
    }
    //input:fileのクリアボタン
    const clearFileInput = ()=>{
      document.getElementsByName('inputProfileFile')[0].value = ''
      data.uploadImageUrl = ''
      data.input_image = null
    }

    // メッセージ追加
    const add = ()=> {
      if (!data.store.state.uid){
        data.message='ログイン情報が確認できませんでした'
        data.router.push('/signin')
        return
      }
      let d = new Date()
      let dstr = d.getFullYear() + '-' + (d.getMonth() + 1) + '-'
        + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes()
        + ':' + d.getSeconds()
      
      let obj = {
        msg: data.msg,
        user: data.store.state.uid,
        posted: dstr,
      }
      
      if(data.input_image){
        attachImage({
          inputFile: data.input_image,
          directory: data.store.state.uid + '/msg/',
          resultFnc: (downloadURL)=>{
            // console.log('File available at', downloadURL)
            obj.photoURL = downloadURL
            db_board.push(obj)
            data.msg = ''
            clearFileInput()
            data.message = '投稿しました。'
          }
        })
      }else{
        db_board.push(obj)
        data.msg = ''
        data.message = '投稿しました。'
      }
    }

    // メッセージが入力されたとき
    const addBtn_disabled=computed(()=>{
      return data.msg.length===0 || data.msg.length>data.msg_maxlength?true:false
    }) 
    const msg_cntOver=computed(()=>{
      return data.msg.length>data.msg_maxlength?true:false
    })

    onMounted(()=> {
      if (data.store.state.uid){
        init()
      }else{
        data.message='ログイン情報が確認できませんでした（onMounted）'
        data.router.push('/signin')
      }
    })
    return { data, init, doLogout, onImagePicked, clearFileInput, add, addBtn_disabled, msg_cntOver }
  },
}
</script>

<style>
.msgOver textarea,
.msgOver textarea:focus{
  color: #d33;
  background-color: #fafadf;
}
.msgOver .msg-counter>span{
  color: #d33;
  font-weight: bold;
}
.btn-like{
  display: inline-block;
  width: 20px;
  height: 20px;
  line-height: 1;
  cursor: pointer;
}
.btn-like path{
  fill: #d33;
  stroke-width:50;
  stroke: #d33;
  fill-opacity: 0;
  transform:scale(.9,.9);
  transform-origin: center center;
  transition: .3s;
}
.btn-like:hover path{
  fill-opacity: .2;
}
.btn-like.on path{
  fill-opacity: 1;
}
.like-cnt{
  line-height: 20px;
  display: inline-block;
  padding-left: 5px;
}
</style>
