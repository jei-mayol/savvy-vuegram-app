import Vue from 'vue'
import Vuex from 'vuex'
const firebase = require('../firebaseConfig')

Vue.use(Vuex)

firebase.auth.onAuthStateChanged(user => {
  if (user) {
    console.log('store/index.js onAuthStateChanged(), with logged in user')

    store.commit('setCurrentUser', user)
    store.dispatch('fetchUserProfile')

    firebase.postsCollection
      .orderBy('createdOn', 'desc')
      .onSnapshot(querySnapShot => {
        let posts = []

        querySnapShot.forEach(doc => {
          let post = doc.data()
          post.id = doc.id
          posts.push(post)
        })

        store.commit('setPosts', posts)
      })
  }
})

export const store = new Vuex.Store({
  state: {
    currentUser: null,
    userProfile: {},
    posts: []
  },
  mutations: {
    setCurrentUser(state, val) {
      state.currentUser = val
    },
    setUserProfile(state, val) {
      state.userProfile = val
    },
    setPosts(state, val) {
      state.posts = val
    }
  },
  actions: {
    clearData({ commit }) {
      commit('setCurrentUser', null)
      commit('setUserProfile', {})
      commit('setPosts', [])
    },
    fetchUserProfile({ commit, state }) {
      firebase.usersCollection
        .doc(state.currentUser.uid)
        .get()
        .then(res => {
          commit('setUserProfile', res.data())
        })
        .catch(err => {
          console.log(err)
        })
    }
  },
  modules: {}
})
