<template>
  <p class="link-arrow"><router-link to="/" class="btn btn-primary">ホームへ</router-link></p>
  <div class="profile__column" v-if="data.user_data">
    <div class="profile__box">
      <h1 class="_name">{{ data.user_data.displayName }}</h1>
      <div class="_image"><img :src="data.user_data.photoURL" alt="" width="100"></div>
      <p v-if="data.myFlg" class="profile__button -edit"><button @click="toggleEditWindow" class="_button">プロフィールを編集</button></p>
      <p v-else class="profile__button -follow"><button @click="toggle_follow" :data-user="props.prmUid" class="_button" :class="{'is-on':data.followFlg}">フォロー<span class="_off-text">する</span><span class="_on-text">済 ✓</span></button></p>
      <h2 class="profile__title">プロフィール</h2>
      <p v-if="data.user_data.place" class="profile__text -place">{{ data.user_data.place }}</p>
      <p v-if="data.user_data.siteURL" class="profile__text -url"><a :href="data.user_data.siteURL" target="_blank" rel="noopener noreferrer">{{ data.user_data.siteURL }}</a></p>
      <pre class="profile__text -profile">{{ data.user_data.profile }}</pre>
      <p class="profile__text -follow">{{ data.user_data.follow!=null?Object.keys(data.user_data.follow).length:0 }} フォロー中、　{{ data.user_data.followed!=null?Object.keys(data.user_data.followed).length:0 }} フォロワー</p>
    </div>
    <div class="profile__boad">
      <BoadList orderBy="user" :equalTo="props.prmUid" />
    </div>
  </div>
  <teleport to="body">
    <div v-if="data.modalOpen" class="modal">
      <div class="modal__inner">
        <div class="upload">
          <p v-if="data.uploadImageUrl" class="photo"><img :src="data.uploadImageUrl" alt="" width="100"></p>
          <p v-else class="photo"><img :src="data.mdUser_data.photoURL" alt="" width="100"></p>
          <div class="form-file"><span class="_text">投稿する画像を選択</span><input type="file" accept="image/*" name="inputProfileFile" show-size @change="onImagePicked" class="_button"></div>
          <input type="button" value="画像をクリア" @click="clearFileInput" class="form-file-clear">
        </div>
        <dl class="profile__modal-list">
          <dt class="_title">名前（必須）</dt>
          <dd class="_data"><input type="text" v-model="data.mdUser_data.displayName" class="form-text" required></dd>
          <dt class="_title">自己紹介</dt>
          <dd class="_data"><textarea rows="5" v-model="data.mdUser_data.profile" class="form-textarea"></textarea></dd>
          <dt class="_title">場所</dt>
          <dd class="_data"><input type="text" v-model="data.mdUser_data.place" class="form-text"></dd>
          <dt class="_title">WebサイトURL</dt>
          <dd class="_data"><input type="url" v-model="data.mdUser_data.siteURL" class="form-text"></dd>
        </dl>
        <button @click="toggleEditWindow" type="button" class="form-submit -reset">閉じる</button>
        <button @click="editProfile" type="button" class="form-submit">保存</button>
      </div>
      <div class="modal__bg" @click="toggleEditWindow"></div>
    </div>
  </teleport>
</template>

<script>
import { onMounted, ref, reactive, computed } from 'vue'
import firebase from '../plugins/firebase'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import * as commonJS from '../plugins/common'
import { attachImage } from '../plugins/auth'

import BoadList from './BoadList.vue'

const db = firebase.database()
const storage = firebase.storage()
const htmlElement = document.documentElement

export default {
  props:{
    prmUid: String
  },
  components: {
    BoadList
  },
  setup(props) {
    const data = reactive({
      user_data: null,
      mdUser_data: null,
      myFlg: false, //自身のプロフィールページかどうか
      followFlg: false, //フォローしているかどうか
      router: useRouter(),
      store: useStore(),
      modalOpen: false,

      uploadImageUrl: "",
      input_image:null
    })

    // 初期表示
    const init = ()=> {
      data.myFlg = props.prmUid===data.store.state.uid ? true:false
      db.ref('users/'+ props.prmUid).once('value', (snapshot)=> {
        data.user_data = snapshot.val()
        if(!data.user_data){
          data.router.push('/404')
          return
        }
        if(data.myFlg){
          //自分のプロフィールページのときの処理
        }else{
          if(data.user_data.followed){
            data.followFlg = data.user_data.followed[data.store.state.uid]!==undefined ? true:false
          }
        }
      })
    }

    //プロフィールの編集　モーダルのON/OFF
    const toggleEditWindow = ()=> {
      if(!data.modalOpen){
        data.mdUser_data = {...data.user_data}
        data.modalOpen = true
        htmlElement.dataset.modalOpen = true
      }else{
        data.modalOpen = false
        data.mdUser_data = null
        data.uploadImageUrl = ""
        data.input_image = null
        delete htmlElement.dataset.modalOpen
      }
    }

    //プロフィール写真のアップロード
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

    //プロフィールの編集　保存
    const editProfile = ()=> {
      data.user_data.displayName = data.mdUser_data.displayName
      if(data.mdUser_data.profile !== undefined){
       data.user_data.profile = data.mdUser_data.profile
      }
      if(data.mdUser_data.place !== undefined){
        data.user_data.place = data.mdUser_data.place
      }
      if(data.mdUser_data.siteURL !== undefined){
        data.user_data.siteURL = data.mdUser_data.siteURL
      }

      if(data.input_image){
        attachImage({
          inputFile: data.input_image,
          directory: data.store.state.uid + '/profile/',
          fileName: 'profile',
          resultFnc: (downloadURL)=>{
            // console.log('File available at', downloadURL)
            data.user_data.photoURL = downloadURL
            db.ref('users/'+data.store.state.uid).update(data.user_data, (error) => {
              if (!error) {
                data.store.dispatch("auth", data.user_data)
                // console.log('プロフィールを更新しました_画像更新あり')
              }
            })
          }
        })
      }else{
        db.ref('users/'+data.store.state.uid).update(data.user_data, (error) => {
          if (!error) {
            data.store.dispatch("auth", data.user_data)
            // console.log('プロフィールを更新しました_画像更新なし')
          }
        })
      }
      toggleEditWindow()
      return false
    }

    //フォロー
    const toggle_follow = (e)=> {
      const targetElement=e.currentTarget
      const targetUser=targetElement.getAttribute('data-user')
      const myFollowData=data.store.state.follow?data.store.state.follow:{}
      // フォーロー済みのとき：フォローをやめる
      if(targetElement.classList.contains('is-on')){
        db.ref('users/').update({
          [data.store.state.uid+'/follow/'+targetUser]: null,
          [targetUser+'/followed/'+data.store.state.uid]: null,
        }, (error) => {
          if (error) {
            return
          }
          delete data.user_data.followed[targetUser]
          delete myFollowData[targetUser]
          data.store.dispatch("authFollow", myFollowData)
          targetElement.classList.remove('is-on')
        })
      // フォーローしていないとき：フォローする
      }else{
        db.ref('users/').update({
          [data.store.state.uid+'/follow/'+targetUser]: 1,
          [targetUser+'/followed/'+data.store.state.uid]: 1,
        }, (error) => {
          if (error) {
            return
          }
          if(data.user_data.followed===undefined){
            data.user_data.followed={}
          }
          data.user_data.followed[targetUser]=1
          myFollowData[targetUser]=1
          data.store.dispatch("authFollow", myFollowData)
          targetElement.classList.add('is-on')
        })
      }
    }

    onMounted(()=> {
      if (data.store.state.uid){
        init()
      }else{
        data.message='ログイン情報が確認できませんでした'
        data.router.push('/signin')
      }
    })
    return { props, data, init, toggleEditWindow, onImagePicked, clearFileInput, editProfile, toggle_follow }
  },
}
</script>
