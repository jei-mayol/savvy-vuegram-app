import Vue from 'vue'
import Vuex from 'vuex'
const firebase = require('../firebaseConfig')

Vue.use(Vuex)

firebase.auth.onAuthStateChanged(user => {
  if (user) {

    store.commit('setCurrentUser', user)
    store.dispatch('fetchUserProfile')

    // updates our current user profile in the state whenever
    // the user updates his/her profile settings
    firebase.usersCollection.doc(user.uid).onSnapshot(doc => {
      store.commit('setUserProfile', doc.data())
    })

    // realtime updates from our posts collection
    firebase.postsCollection
      .orderBy('createdOn', 'desc')
      .onSnapshot(querySnapShot => {

        let createdByCurrentUser
        if (querySnapShot.docs.length) {
          createdByCurrentUser =
            store.state.currentUser.uid ==
            querySnapShot.docChanges()[0].doc.data().userId
              ? true
              : false
        }

        // add new posts to hiddenPosts array after initial load
        if (querySnapShot.docChanges().length !== querySnapShot.docs.length
            && querySnapShot.docChanges()[0].type == 'added' && !createdByCurrentUser) {

              let post = querySnapShot.docChanges()[0].doc.data()
              post.id = querySnapShot.docChanges()[0].doc.id

              store.commit('setHiddenPosts', post)
            }
            else {
              let posts = []

              querySnapShot.forEach(doc => {
                let post = doc.data()
                post.id = doc.id
                posts.push(post)
              })
      
              store.commit('setPosts', posts)
            }
      })
  }
})

export const store = new Vuex.Store({
  state: {
    currentUser: null,
    userProfile: {},
    posts: [],
    hiddenPosts: []
  },
  mutations: {
    setCurrentUser(state, val) {
      state.currentUser = val
    },
    setUserProfile(state, val) {
      state.userProfile = val
    },
    setPosts(state, val) {
      if (val) {
        state.posts = val
      }
      else {
        state.posts = []
      }
    },
    setHiddenPosts(state, val) {
      if (val) {
        // make sure not to add duplicates
        if (!state.hiddenPosts.some(x => x.id === val.id)) {
          state.hiddenPosts.unshift(val)
        }
      }
      else {
        state.hiddenPosts = []
      }
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
    },
    updateProfile({ commit, state }, data) {
      let name = data.name
      let title = data.title

      firebase.usersCollection
        .doc(state.currentUser.uid)
        .update({ name, title })
        .then(user => {
          // update all posts by user to reflect new name
          firebase.postsCollection
            .where('userId', '==', state.currentUser.uid)
            .get()
            .then(docs => {
              docs.forEach(doc => {
                firebase.postsCollection.doc(doc.id).update({
                  userName: name
                })
              })
            })

          // update all comments by user to reflect new name
          firebase.commentsCollection
            .where('userId', '==', state.currentUser.uid)
            .get()
            .then(docs => {
              docs.forEach(doc => {
                firebase.commentsCollection.doc(doc.id).update({
                  userName: name
                })
              })
            })
        })
        .catch(err => {
          console.log(err)
        })
    }
  },
  modules: {}
})
