import Vue from "vue"
import VueRouter from "vue-router"
import firebase from 'firebase'

import Login from '@/views/Login'
import Dashboard from '@/views/Dashboard'
import Settings from '@/views/Settings'

Vue.use(VueRouter);

const routes = [
  {
    // Catch-all route to handle incorrect routes
    path: '*',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: {
      requiresAuth: true
    }
  }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const currentUser = firebase.auth().currentUser

  if (requiresAuth && !currentUser) {
    next('/login')
  }
  else if (requiresAuth && currentUser) {
    next()
  }
  else {
    next()
  }
})

export default router
