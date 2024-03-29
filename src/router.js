import { createRouter, createWebHistory } from 'vue-router'
import { store } from './store'
import firebase from './plugins/firebase'
import { auth } from './plugins/auth'

import Signin from './components/Signin.vue'
import Home from './components/Home.vue'
import Profile from './components/Profile.vue'
import NotFound from './components/NotFound.vue'

const db = firebase.database()

export const router=createRouter({
  history:createWebHistory(),
  routes:[
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404',
    },
    {
      path: '/404',
      name: 'NotFound',
      component: NotFound
    },
    {
      path: '/',
      name: 'Home',
      component: Home,
      meta: { requiresAuth: true }
    },
    {
      path: '/signin',
      name: 'Signin',
      component: Signin,
      meta: { logginedThrough: true }
    },
    {
      path: '/profile/:prmUid',
      name: 'Profile',
      component: Profile,
      props: true,
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  let user = store.state.uid
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const logginedThrough = to.matched.some(record => record.meta.logginedThrough)
  if(!user){
    user = await auth()
    if(user){
      db.ref('users/'+ user.uid).once('value', (snapshot)=> {
        const user_data = snapshot.val()
        user_data.uid = user.uid
        store.dispatch("auth", user_data)
      })
    }
  }
  if(requiresAuth && !user){
    next({ path: '/signin', query: { redirect: to.fullPath } })
  }else if(logginedThrough && user){
    next({ path: '/' })
  }else{
    next()
  }
})
