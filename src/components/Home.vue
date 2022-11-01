<template>
  <!-- <h1 class="page-title">Home</h1> -->
  <template v-if="$store.state.uid">
    <div class="home-header">
      <div class="display-profile">
        <router-link :to="{name:'Profile',params:{prmUid:$store.state.uid}}">
          <p class="_name">Hello!<br><span class="_large">{{ $store.state.displayName }}</span> さん</p>
          <div class="_image"><img :src="$store.state.photoURL" alt="" width="100"></div>
        </router-link>
      </div>
      <div class="message-form" :class={count_exceeded:msg_cntOver}>
        <p class="_title">メッセージを投稿しよう！</p>
        <textarea v-model.trim="data.msg" rows="5" placeholder="What’s happening"></textarea>
        <p class="_counter"><span>{{data.msg.length}}</span>/{{data.msg_maxlength}}</p>
        <div class="_button-set">
          <div class="_upload">
            <div class="_photo"><img :src="data.uploadImageUrl" alt="" width="100"></div>
            <div class="_button-file"><span class="_text">投稿する画像を選択</span><input type="file" accept="image/*" name="inputProfileFile" show-size @change="onImagePicked"></div>
            <input type="button" value="画像をクリア" @click="clearFileInput" class="_file-clear">
          </div>
          <button @click="add" :disabled="addBtn_disabled" class="_submit">投稿</button>
        </div>
        <p class="_text-done">{{data.message}}</p>
      </div>
    </div>
    <h3 class="my-3">フォロー中のユーザーの投稿</h3>
    <BoadList orderBy="user" :equalToObj="data.store.state.follow" />
    <h3 class="my-3">全ユーザーの最新の投稿</h3>
    <BoadList orderBy="key" ref="bordAll" />
  </template>
  <template v-else>
    <div class="alert alert-warning">
      ※現在、ログインされていません。
    </div>
  </template>
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
      message: '',
      msg: '',
      msg_maxlength: commonJS.MESSAGE_MAX_LENGTH,
      uploadImageUrl: "",
      input_image:null,
      router: useRouter(),
      store: useStore()
    })

    //子実行テスト
    const bordAll = ref(null)

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
            bordAll.value.addNew()
          }
        })
      }else{
        db_board.push(obj)
        data.msg = ''
        data.message = '投稿しました。'
        bordAll.value.addNew()
      }
    }

    // メッセージが入力されたとき
    const addBtn_disabled=computed(()=>{
      return (data.msg.length===0 && !data.input_image) || data.msg.length>data.msg_maxlength?true:false
    }) 
    const msg_cntOver=computed(()=>{
      return data.msg.length>data.msg_maxlength?true:false
    })

    onMounted(()=> {
      if (!data.store.state.uid){
        data.router.push('/signin')
      }
    })
    return { data, onImagePicked, clearFileInput, add, addBtn_disabled, msg_cntOver, bordAll }
  },
}
</script>
