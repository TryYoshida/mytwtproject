<template>
  <ul class="list-group text-left">
    <li v-for="(item, key) in data.board_data" :key="key" class="list-group-item">
      <div class="h5">{{item.msg}}</div>
      <div class="small text-right"><router-link :to="{name:'Profile',params:{prmUid:item.user}}">{{item.displayName}}</router-link> ({{item.posted}})</div>
      <span @click="toggle_like" class="btn-like" :class="{on:item.likeOn}" :data-id="item.key"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"/></svg></span>
      <span v-if="item.like" class="like-cnt">{{Object.keys(item.like).length}}</span>
      <span v-else class="like-cnt">0</span>
    </li>
  </ul>
</template>

<script>
import { onMounted, ref, reactive } from 'vue'
import firebase from '../plugins/firebase'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

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
      default: 10
    }
  },
  setup(props) {
    const data = reactive({
      board_data: {},
      router: useRouter(),
      store: useStore()
    })

    // 初期表示
    const init = ()=> {
      let set_db
      let arr = []
      let xMkBoardArr = (snapshot)=>{
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
      }

      if(props.equalToObj){
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
          set_db = db_board.orderByKey().limitToLast(props.numPerPage)
        }else{
          set_db = db_board.orderByChild(props.orderBy).equalTo(props.equalTo).limitToLast(props.numPerPage)
        }
        set_db.on('value', (snapshot)=> {
          arr = []
          xMkBoardArr(snapshot)
          data.board_data = arr
          setName()
        })
      }
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

    onMounted(()=> {
      init()
    })
    return { props, data, init, toggle_like }
  },
}
</script>
