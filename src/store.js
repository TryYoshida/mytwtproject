import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
// import * as commonJS from './plugins/common'

export const store = createStore({
  state() {
    return{
      uid: '',
      //email: '',
      displayName: '',
      photoURL: '',
      follow: null,
      followed: null
    }
  },
  mutations: {
    updateUser(state, user) {
      if(user.uid!==undefined){state.uid = user.uid}
      //if(user.email!==undefined){state.email = user.email}
      if(user.displayName!==undefined){state.displayName = user.displayName}
      if(user.photoURL!==undefined){state.photoURL = user.photoURL}
      if(user.follow!==undefined){state.follow = user.follow}
      if(user.followed!==undefined){state.followed = user.followed}
      // state.photoURL = user.photoURL===null ? commonJS.PHOTO_URL_DFT : user.photoURL
    },
    updateUserFollow(state, follow) {
      state.follow = follow
    }
  },
  actions: {
    auth(context, user) {
      context.commit('updateUser', user)
    },
    authFollow(context, follow) {
      context.commit('updateUserFollow', follow)
    }
  },
  modules: {},
  plugins: [createPersistedState({storage: window.sessionStorage})]
})
