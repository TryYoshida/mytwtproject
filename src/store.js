import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
// import * as commonJS from './plugins/common'

export const store = createStore({
  state() {
    return{
      uid: '',
      email: '',
      displayName: '',
      photoURL: '',
      follow: null,
      followed: null
    }
  },
  mutations: {
    updateUser(state, user) {
      state.uid = user.uid
      state.email = user.email
      state.displayName = user.displayName
      state.photoURL = user.photoURL
      state.follow = user.follow
      state.followed = user.followed
      // state.photoURL = user.photoURL===null ? commonJS.PHOTO_URL_DFT : user.photoURL
    }
  },
  actions: {
    auth(context, user) {
      context.commit('updateUser', user)
    }
  },
  modules: {},
  plugins: [createPersistedState({storage: window.sessionStorage})]
})
