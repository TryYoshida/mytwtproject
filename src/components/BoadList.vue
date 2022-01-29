<template>
  <div v-if="data.message">
    <p>{{data.message}}</p>
  </div>
  <ul v-else class="list-group text-left">
    <li v-for="(item, key) in data.board_data" :key="key" class="list-group-item">
      <div class="h5">{{item.msg}}</div>
      <div class="image"><img :src="item.photoURL" alt="" width="100"></div>
      <div class="small text-right"><router-link :to="{name:'Profile',params:{prmUid:item.user}}">{{item.displayName}}</router-link> ({{item.posted}})</div>
      <span @click="toggle_like" class="btn-like" :class="{on:item.likeOn}" :data-id="item.key"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"/></svg></span>
      <span v-if="item.like" class="like-cnt">{{Object.keys(item.like).length}}</span>
      <span v-else class="like-cnt">0</span>
    </li>
  </ul>
  <button v-if="data.infinitLoadNext" @click="loadMore">もっと見る</button>
</template>

<script>
import { onMounted, ref, reactive, nextTick } from 'vue'
import firebase from '../plugins/firebase'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import * as commonJS from '../plugins/common'

const db = firebase.database()
const db_board = db.ref('board/')

export default {
  props:{
    orderBy: {
      type: String,
      default: 'key'
    },
    equalTo: {
      type: String
    },
    equalToObj: {
      type: Object
    },
    numPerPage: {
      type: Number,
      default: commonJS.NUM_PER_PAGE
    },
    infinitLoad: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const data = reactive({
      board_data: {},
      message: "",
      infinitLoadNext: false,
      infinitLoadLastKey: "",
      router: useRouter(),
      store: useStore()
    })

    // 表示のための設定?
    let set_db
    let arr = []
    let xMkBoardArr = (snapshot)=>{
      let result = snapshot.val()
      let resulArr = []
      for(let item in result){
        result[item].key=item
        let like=result[item].like
        if(like && like[data.store.state.uid]){
          result[item].likeOn=true
        }else{
          result[item].likeOn=false
        }
        resulArr.unshift(result[item])
      }
      arr = arr.concat(resulArr)
    }

    // 初期表示
    const init = ()=> {
      if(props.infinitLoad){
        data.infinitLoadNext = true
      }

      if(props.equalToObj!==undefined){
        // フォローしているユーザーの投稿
        console.log("BoadList1")
        if(!props.equalToObj){
          data.message="フォローしているユーザーがいません"
          return
        }
        arr = []
        Object.keys(props.equalToObj).forEach(function (key) {
          set_db = db_board.orderByChild(props.orderBy).equalTo(key).limitToLast(props.numPerPage)
          set_db.on('value', (snapshot)=> {
            xMkBoardArr(snapshot)
            data.board_data = arr
            setName()
          })
        })
      }else{
        if(props.orderBy==='key'){
          // 全投稿
          console.log("BoadList2")
          set_db = db_board.orderByKey().limitToLast(props.numPerPage)
        }else{
          // 特定の1ユーザーの投稿
          if(!props.equalTo){
            data.message="ユーザーが読み込めませんでした"
            return
          }
          console.log("BoadList3")
          console.log(props.equalToObj)
          set_db = db_board.orderByChild(props.orderBy).equalTo(props.equalTo).limitToLast(props.numPerPage)
        }
        setBoadDateAll(set_db)
      }
    }

    //メッセージを出力
    const setBoadDateAll = (_db)=>{
      _db.on('value', (snapshot)=> {
        xMkBoardArr(snapshot)
        if(data.infinitLoadNext){
          if(arr.length === props.numPerPage){
            data.infinitLoadLastKey = arr[arr.length - 1].key
          }else{
            data.infinitLoadNext = false
          }
        }
        data.board_data = arr
        setName()
      })
    }

    //もっと見る
    const loadMore = ()=>{
      set_db = db_board.orderByKey().endAt(data.infinitLoadLastKey).limitToLast(props.numPerPage)
      setBoadDateAll(set_db)
    }

    //ユーザー名を表示
    const setName = ()=>{
      data.board_data.forEach(elem => {
        db.ref('users/' + elem.user + '/displayName').once('value', (snapshot) => {
          elem.displayName = snapshot.val()
        })
      })
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

    nextTick(()=> {
      init()
    })
    return { props, data, init, loadMore, toggle_like }
  },
}
</script>
