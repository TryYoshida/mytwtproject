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
        <button @click="add" :disabled="addBtn_disabled" class="btn btn-primary">投稿</button>
      </div>
      <h3 class="my-3">Messages</h3>
      <ul class="list-group text-left">
        <li v-for="(item, key) in data.board_data" :key="key" class="list-group-item">
          <div class="h5">{{item.msg}}</div>
          <div class="small text-right"><router-link :to="{name:'Profile',params:{prmUid:item.user}}">{{setName(item.user)}}</router-link> ({{item.posted}})</div>
          <span @click="toggle_like" class="btn-like" :class="{on:item.likeOn}" :data-id="item.key"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"/></svg></span>
          <span v-if="item.like" class="like-cnt">{{Object.keys(item.like).length}}</span>
          <span v-else class="like-cnt">0</span>
        </li>
      </ul>
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

const provider = new firebase.auth.GoogleAuthProvider()
const db = firebase.database()
const db_board = db.ref('board/')

export default {
  setup(props) {
    const data = reactive({
      message: 'ミニ伝言板。最新の投稿を表示します。',
      user: null,
      msg: '',
      msg_maxlength: 128,
      num_per_page: 10, //取り出すデータ数
      board_data: {},
      router: useRouter(),
      store: useStore(),
    })

    // 初期表示
    const init = ()=> {
      data.message = 'ログインしました。'
      db_board.orderByKey().limitToLast(data.num_per_page)
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

    //uidからユーザー名を返す
    const setName = (uidStr)=> {
      let data
      db.ref('users/' + uidStr + '/displayName').on('value', (snapshot) => {
        data = snapshot.val()
        //console.log(data) //(1)
      })
      //console.log(data)   //(2)
      return data
    }

    // ログアウト処理
    const doLogout = ()=> {
      logout().then(() => {
        data.board_data = {}
        data.store.dispatch("auth", {
          uid: '',
          email: '',
          displayName: '',
          photoURL: ''
        })
        data.message = 'ログアウトしました。'
        data.router.push('/signin')
      })
      .catch((error) => {
        // エラー処理をここで行う
        console.log(error)
      })
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
      db_board.push(obj)
      data.msg = ''
      data.message = '投稿しました。'
    }

    // メッセージが入力されたとき
    const addBtn_disabled=computed(()=>{
      return data.msg.length===0 || data.msg.length>data.msg_maxlength?true:false
    }) 
    const msg_cntOver=computed(()=>{
      return data.msg.length>data.msg_maxlength?true:false
    })

    // いいねボタン
    const toggle_like=(e)=>{
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
    return { data, init, setName, doLogout, add, addBtn_disabled, msg_cntOver, toggle_like }
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
