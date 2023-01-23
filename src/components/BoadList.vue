<template>
  <div v-if="data.message">
    <p>{{data.message}}</p>
  </div>
  <ul v-else class="message-list">
    <li v-for="(item, key) in data.board_data" :key="key" class="message-list__item">
      <p class="message-list__user"><router-link :to="{name:'Profile',params:{prmUid:item.user}}">{{item.displayName}}</router-link>　<span class="_posted">({{item.posted}})</span></p>
      <div class="message-list__body">{{item.msg}}</div>
      <div v-if="item.photoURL" class="message-list__image"><img :src="item.photoURL" alt=""></div>
      <div class="like-button">
        <span @click="toggle_like" class="_button" :class="{'is-on':item.likeOn}" :data-id="item.key"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"/></svg></span>
        <span v-if="item.like" class="_count">{{Object.keys(item.like).length}}</span>
        <span v-else class="_count">0</span>
      </div>
    </li>
  </ul>
  <button v-if="data.infinitLoadNext" class="more-button">もっと見る</button>
</template>

<script>
import { onMounted, ref, reactive, nextTick } from 'vue'
import firebase from '../plugins/firebase'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import * as commonJS from '../plugins/common'
import scrollTrigger from '../plugins/ScrollTrigger'

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
    }
  },
  setup(props) {
    const data = reactive({
      board_data: {},
      message: "",
      infinitLoadNext: true,
      infinitLoadLastKey: "",
      router: useRouter(),
      store: useStore()
    })

    // 表示のための設定?
    let set_db
    let arr = []
    let xMkBoardArr = (snapshot)=>{
      let resulArr = setLike(snapshot.val())
      if(data.infinitLoadNext){
        if(resulArr.length === props.numPerPage){
          data.infinitLoadLastKey = resulArr[resulArr.length - 1].key
        }else{
          data.infinitLoadNext = false
        }
      }
      arr = arr.concat(resulArr)
    }

    // 初期表示
    const init = ()=> {
      if(props.equalToObj!==undefined){
        // フォローしているユーザーの投稿
        if(!props.equalToObj){
          data.infinitLoadNext=false
          data.message="フォローしているユーザーがいません"
          return
        }
        Object.keys(props.equalToObj).forEach((key) => {
          set_db = db_board.orderByChild(props.orderBy).equalTo(key)
          setBoadDateFollowAll(set_db)
        })
      } else if(props.orderBy==='key'){
        // 全投稿
        set_db = db_board.orderByKey().limitToLast(props.numPerPage)
        setBoadDate(set_db)
      }else{
        // 特定の1ユーザーの投稿
        if(!props.equalTo){
          data.infinitLoadNext=false
          data.message="ユーザーが読み込めませんでした"
          return
        }
        set_db = db_board.orderByChild(props.orderBy).equalTo(props.equalTo)
        setBoadDateSingleUserAll(set_db)
      }
    }

    //メッセージを出力（全投稿）
    const setBoadDate = (_db)=>{
      _db.once('value', (snapshot)=> {
        let resulArr = setLike(snapshot.val())
        if(data.infinitLoadNext){
          if(resulArr.length === props.numPerPage){
            data.infinitLoadLastKey = resulArr[resulArr.length - 1].key
          }else{
            data.infinitLoadNext = false
          }
        }
        arr = arr.concat(resulArr)
        data.board_data = arr
        setName()
        setLoadMore()
      })
    }

    //メッセージを出力（フォローしているユーザーの投稿用）
    let followArr = []
    let followInfinitLoadLastNum = props.numPerPage
    const setBoadDateFollow = (followArr)=>{
      arr = followArr.slice(0, followInfinitLoadLastNum)
      if(data.infinitLoadNext){
        if(arr.length === followArr.length){
          data.infinitLoadNext = false
        }
      }
      data.board_data = arr
      setName()
      setLoadMore()
    }
    const setBoadDateFollowAll = (_db)=>{
      _db.once('value', (snapshot)=> {
        let resulArr = setLike(snapshot.val())
        followArr = followArr.concat(resulArr).sort((a, b)=>{
          if (a.key < b.key) {
            return 1
          }
          if (a.key > b.key) {
            return -1
          }
          return 0
        })
        setBoadDateFollow(followArr)
      })
    }

    //メッセージを出力（特定の1ユーザーの投稿）
    let singleUserArr = []
    let singleUserInfinitLoadLastNum = props.numPerPage
    const setBoadDateSingleUser = (singleUserArr)=>{
      arr = singleUserArr.slice(0, singleUserInfinitLoadLastNum)
      if(data.infinitLoadNext){
        if(arr.length === singleUserArr.length){
          data.infinitLoadNext = false
        }
      }
      data.board_data = arr
      setName()
      setLoadMore()
    }
    const setBoadDateSingleUserAll = (_db)=>{
      _db.once('value', (snapshot)=> {
        singleUserArr = setLike(snapshot.val())
        setBoadDateSingleUser(singleUserArr)
      })
    }

    //もっと見る
    const setLoadMore = ()=>{
      const loadMore = ()=>{
        setTimeout(() => {
          // フォローしているユーザーの投稿
          if(props.equalToObj){
            followInfinitLoadLastNum += props.numPerPage
            setBoadDateFollow(followArr)
          }else if(props.orderBy==='key'){
            // 全投稿
            set_db = db_board.orderByKey().endBefore(data.infinitLoadLastKey).limitToLast(props.numPerPage)
            setBoadDate(set_db)
          }else{
            // 特定の1ユーザーの投稿
            singleUserInfinitLoadLastNum += props.numPerPage
            setBoadDateSingleUser(singleUserArr)
          }
        }, 200)
      }
      const buttonElements = document.querySelectorAll('.more-button')
      scrollTrigger(buttonElements, {
        root: null,
        rootMargin: '0px',
        threshold: 0
      }, loadMore)
    }

    //ユーザー名を表示
    const setName = ()=>{
      data.board_data.forEach(elem => {
        db.ref('users/' + elem.user + '/displayName').once('value', (snapshot) => {
          elem.displayName = snapshot.val()
        })
      })
    }

    // いいねボタンの表示
    const setLike = (items)=>{
      let resulArr = []
      for(let item in items){
        items[item].key=item
        let like=items[item].like
        if(like && like[data.store.state.uid]){
          items[item].likeOn=true
        }else{
          items[item].likeOn=false
        }
        resulArr.unshift(items[item])
      }
      return resulArr
    }
    
    // いいねボタンクリック時の処理
    const toggle_like = (e)=> {
      const _elm=e.currentTarget
      const _cntElm=_elm.nextElementSibling
      if(_elm.classList.contains('is-on')){
        db.ref('board/'+_elm.getAttribute('data-id')+'/like').update({
          [data.store.state.uid]: null,
        }, (error) => {
          if (!error) {
            _elm.classList.remove('is-on')
            _cntElm.textContent = Number(_cntElm.textContent)-1
          }
        })
      }else{
        db.ref('board/'+_elm.getAttribute('data-id')+'/like').update({
          [data.store.state.uid]: 1,
        }, (error) => {
          if (!error) {
            _elm.classList.add('is-on')
            _cntElm.textContent = Number(_cntElm.textContent)+1
          }
        })
      }
    }

    // メッセージが投稿されたとき（親から実行）
    const addNew = ()=>{
      if(props.orderBy==='key'){
        // 全投稿
        db_board.orderByKey().limitToLast(1).once('value', (snapshot)=> {
          let resulArr = setLike(snapshot.val())
          arr = resulArr.concat(arr)
          data.board_data = arr
          setName()
        })
      }
    }

    nextTick(()=> {
      init()
    })
    return { props, data, init, toggle_like, addNew }
  },
}
</script>
