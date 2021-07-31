<template>
  <section v-if="data.user_data">
    <p><router-link to="/" class="btn btn-primary">ホームへ</router-link></p>
    <h2><img :src="data.user_data.photoURL" alt="" width="100"> {{ data.user_data.displayName }}</h2>
    <p v-if="data.myFlg"><button @click="toggle_editWin">プロフィールを編集</button></p>
    <p v-else><button @click="toggle_follow" :data-user="props.prmUid" class="btnFollow" :class="{on:data.followFlg}">フォロー<i class="icon far fa-check-circle"></i></button></p>
    <div class="alert alert-primary">
      <h3 class="my-3">プロフィール</h3>
      <p v-if="data.user_data.place"><i class="fas fa-map-marker-alt"></i>{{ data.user_data.place }}</p>
      <p v-if="data.user_data.siteURL"><a :href="data.user_data.siteURL" target="_blank" rel="noopener noreferrer"><i class="fas fa-link"></i>{{ data.user_data.siteURL }}</a></p>
      <pre style="min-height:3em">{{ data.user_data.profile }}</pre>
      <p></p>
      <h4>投稿</h4>
      <ul class="list-group text-left">
        <li v-for="(item, key) in data.board_data" :key="key" class="list-group-item">
          <div class="h5">{{item.msg}}</div>
          <div class="small text-right">{{setName(item.user)}} ({{item.posted}})</div>
          <span @click="toggle_like" class="btn-like" :class="{on:item.likeOn}" :data-id="item.key"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"/></svg></span>
          <span v-if="item.like" class="like-cnt">{{Object.keys(item.like).length}}</span>
          <span v-else class="like-cnt">0</span>
        </li>
      </ul>
    </div>
  </section>
  <div v-else class="loading"><span class="fas fa-spinner fa-pulse"></span></div>
  <teleport to="body">
    <div v-if="data.modalOpen" class="modal">
      <div>
        <form action="" @submit="editProfile">
          <p class="photo"><img :src="data.mdUser_data.photoURL" alt="" width="100"></p>
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

const provider = new firebase.auth.GoogleAuthProvider()
const db = firebase.database()
const db_board = db.ref('board/')

export default {
  props:{
    prmUid: String
  },
  setup(props) {
    const data = reactive({
      user_data: null,
      mdUser_data: null,
      myFlg: false, //自身のプロフィールページかどうか
      followFlg: false, //フォローしているかどうか
      num_per_page: 10, //☆取り出すデータ数
      board_data: {},
      router: useRouter(),
      store: useStore(),
      modalOpen: false
    })

    // 初期表示
    const init = ()=> {
      data.myFlg = props.prmUid===data.store.state.uid ? true:false
      db.ref('users/'+ props.prmUid).on('value', (snapshot)=> {
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

      db_board.orderByChild('user').equalTo(props.prmUid).limitToLast(data.num_per_page)
      .on('value', (snapshot)=> {
        let arr = []
        let result = snapshot.val()
        for(let item in result){
          result[item].key=item
          let like=result[item].like
          if(like && like[data.store.state.uid]){
            result[item].likeOn=true
          }else{
            result[item].likeOn=false
          }
          arr.unshift(result[item])
        }
        data.board_data = arr
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
    //プロフィールの編集　保存
    const editProfile = ()=> {

      data.store.state.photoURL = data.user_data.photoURL = data.mdUser_data.photoURL ? data.mdUser_data.photoURL : commonJS.photoURL_dft
      data.store.state.displayName = data.user_data.displayName = data.mdUser_data.displayName
      data.user_data.profile = data.mdUser_data.profile
      data.user_data.place = data.mdUser_data.place
      data.user_data.siteURL = data.mdUser_data.siteURL
      console.log(data.user_data)
      db.ref('users/'+data.store.state.uid).update(data.user_data, (error) => {
        if (!error) {
          console.log('プロフィールを更新しました')
        }
      })

      data.modalOpen = false
      data.mdUser_data = null
      return false
    }

    //フォロー
    const toggle_follow = (e)=> {
      let _elm=e.currentTarget
      if(_elm.classList.contains('on')){
        db.ref('users/').update({
          [data.store.state.uid+'/follow/'+_elm.getAttribute('data-user')]: null,
          [_elm.getAttribute('data-user')+'/followed/'+data.store.state.uid]: null,
        }, (error) => {
          if (!error) {
            _elm.classList.remove('on')
          }
        })
      }else{
        db.ref('users/').update({
          [data.store.state.uid+'/follow/'+_elm.getAttribute('data-user')]: 1,
          [_elm.getAttribute('data-user')+'/followed/'+data.store.state.uid]: 1,
        }, (error) => {
          if (!error) {
            _elm.classList.add('on')
          }
        })
      }
    }

    //uidからユーザー名を返す
    const setName = (uidStr)=> {
      let data
      db.ref('users/' + uidStr + '/displayName').on('value', (snapshot) => {
        data = snapshot.val();
      })
      return data
    }

    // いいねボタン
    const toggle_like = (e)=> {
      let _elm=e.currentTarget
      if(_elm.classList.contains('on')){
        db.ref('board/'+_elm.getAttribute('data-id')+'/like').update({
          [data.store.state.uid]: null,
        }, (error) => {
          if (!error) {
            _elm.classList.remove('on')
          }
        })
      }else{
        db.ref('board/'+_elm.getAttribute('data-id')+'/like').update({
          [data.store.state.uid]: 1,
        }, (error) => {
          if (!error) {
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
    return { props, data, init, toggle_editWin, editProfile, toggle_follow, setName, toggle_like }
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
.modal div {
  background-color: #fff;
  box-sizing: border-box;
  width: 500px;
  max-width: 98%;
  padding: 15px;
}
.btnFollow:hover{background-color: #ffe;}
.btnFollow .icon{display: none;}
.btnFollow.on{background-color: #64c1ff;}
.btnFollow.on .icon{display: inline-block;}
</style>
