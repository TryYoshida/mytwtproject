<template>
  <section v-if="data.user_data">
    <p><router-link to="/" class="btn btn-primary">ホームへ</router-link></p>
    <h2><img :src="data.user_data.photoURL" alt="" width="100"> {{ data.user_data.displayName }}</h2>
    <p v-if="data.myFlg"><button @click="toggle_editWin">プロフィールを編集</button></p>
    <p v-else><button @click="toggle_follow" :data-user="props.prmUid" class="btnFollow" :class="{on:data.followFlg}">フォロー<span class="on">済<i class="icon far fa-check-circle"></i></span></button></p>
    <div class="alert alert-primary">
      <h3 class="my-3">プロフィール</h3>
      <p v-if="data.user_data.place"><i class="fas fa-map-marker-alt"></i>{{ data.user_data.place }}</p>
      <p v-if="data.user_data.siteURL"><a :href="data.user_data.siteURL" target="_blank" rel="noopener noreferrer"><i class="fas fa-link"></i>{{ data.user_data.siteURL }}</a></p>
      <pre style="min-height:3em">{{ data.user_data.profile }}</pre>
      <p>{{ data.user_data.follow!=null?Object.keys(data.user_data.follow).length:0 }} フォロー中、　{{ data.user_data.followed!=null?Object.keys(data.user_data.followed).length:0 }} フォロワー</p>
      <h4>投稿</h4>
      <BoadList orderBy="user" :equalTo="props.prmUid" />
    </div>
  </section>
  <div v-else class="loading"><span class="fas fa-spinner fa-pulse"></span></div>
  <teleport to="body">
    <div v-if="data.modalOpen" class="modal">
      <div>
        <form action="" @submit="editProfile">
          <div class="upload">
            <p v-if="data.uploadImageUrl" class="photo"><img :src="data.uploadImageUrl" alt="" width="100"></p>
            <p v-else class="photo"><img :src="data.mdUser_data.photoURL" alt="" width="100"></p>
            <input type="file" accept="image/*" show-size @change="onImagePicked">
          </div>
          <dl>
            <dt>名前（必須）</dt>
            <dd><input type="text" v-model="data.mdUser_data.displayName" class="form-control" required></dd>
            <dt>自己紹介</dt>
            <dd><textarea rows="5" v-model="data.mdUser_data.profile" class="form-control"></textarea></dd>
            <dt>場所</dt>
            <dd><input type="text" v-model="data.mdUser_data.place" class="form-control"></dd>
            <dt>WebサイトURL</dt>
            <dd><input type="url" v-model="data.mdUser_data.siteURL" class="form-control"></dd>
          </dl>
          <button @click="toggle_editWin" type="button" class="btn btn-primary">閉じる</button>
          <button class="btn btn-primary">保存</button>
        </form>
      </div>
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
    const toggle_editWin = ()=> {
      if(!data.modalOpen){
        data.mdUser_data = {...data.user_data}
        data.modalOpen = true
      }else{
        data.modalOpen = false
        data.mdUser_data = null
      }
    }

    //プロフィール写真のアップロード
    const submit = ()=> {
      
    }
    
    const onImagePicked = (e)=>{
      const file = e.target.files[0]
      // console.log(e.target.files[0].name)
      if (file !== undefined && file !== null) {
        if (file.name.lastIndexOf('.') <= 0) {
          return
        }
        data.input_image=file
        const fr = new FileReader()
        fr.readAsDataURL(file)
        fr.addEventListener('load', () => {
          data.uploadImageUrl = fr.result
        })
      } else {
        data.uploadImageUrl = ''
      }
    }


    //プロフィールの編集　保存
    const editProfile = ()=> {
      // upload(data.uploadImageUrl, 'test.png').then(() => {
      //   // 画像をアップロードしました
      // })
      const _directory = data.store.state.uid + "/"
      attachImage(data.input_image, _directory)

      data.user_data.photoURL = data.mdUser_data.photoURL ? data.mdUser_data.photoURL : commonJS.PHOTO_URL_DFT
      data.user_data.displayName = data.mdUser_data.displayName
      data.user_data.profile = data.mdUser_data.profile
      data.user_data.place = data.mdUser_data.place
      data.user_data.siteURL = data.mdUser_data.siteURL
      console.log(data.user_data)
      db.ref('users/'+data.store.state.uid).update(data.user_data, (error) => {
        if (!error) {
          console.log(data.store.state)
          data.store.dispatch("auth", data.user_data)
          console.log(data.store.state)
          console.log('プロフィールを更新しました')
        }
      })
      data.modalOpen = false
      data.mdUser_data = null
      return false
    }

    //フォロー
    const toggle_follow = (e)=> {
      const _elm=e.currentTarget
      const _elmUser=_elm.getAttribute('data-user')
      const _myFollow=data.store.state.follow?data.store.state.follow:{}
      // フォーロー済みのとき：フォローをやめる
      if(_elm.classList.contains('on')){
        db.ref('users/').update({
          [data.store.state.uid+'/follow/'+_elmUser]: null,
          [_elmUser+'/followed/'+data.store.state.uid]: null,
        }, (error) => {
          if (!error) {
            delete data.user_data.followed[_elmUser]
            delete _myFollow[_elmUser]
            data.store.dispatch("authFollow", _myFollow)
            _elm.classList.remove('on')
          }
        })
      // フォーローしていないとき：フォローする
      }else{
        db.ref('users/').update({
          [data.store.state.uid+'/follow/'+_elmUser]: 1,
          [_elmUser+'/followed/'+data.store.state.uid]: 1,
        }, (error) => {
          if (!error) {
            data.user_data.followed[_elmUser]=1
            _myFollow[_elmUser]=1
            data.store.dispatch("authFollow", _myFollow)
            _elm.classList.add('on')
          }
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
    return { props, data, init, toggle_editWin, onImagePicked, editProfile, toggle_follow }
  },
}
</script>

<style>
.modal {
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  background-color: rgba(0,0,0,.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.modal>div {
  background-color: #fff;
  box-sizing: border-box;
  width: 500px;
  max-width: 98%;
  padding: 15px;
}
.btnFollow:hover{background-color: #ffe;}
.btnFollow .on{display: none;}
.btnFollow.on{background-color: #64c1ff;}
.btnFollow.on .on{display: inline-block;}
</style>
