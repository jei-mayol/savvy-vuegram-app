<template>
  <div id="dashboard">
    <section>
      <div class="col1">
        <div class="profile">
          <h5>{{ userProfile.name }}</h5>
          <p>{{ userProfile.title }}</p>
          <div class="create-post">
            <p>Create a post</p>
            <form @submit.prevent>
              <textarea v-model.trim="post.content"></textarea>
              <button
                @click="createPost"
                :disabled="post.content == ''"
                class="button"
              >
                post
              </button>
            </form>
          </div>
        </div>
      </div>
      <div class="col2">
        <transition name="fade">
          <div v-if="hiddenPosts.length" @click="showNewPosts" class="hidden-posts">
            <p>
              Click to show <span class="new-posts">{{ hiddenPosts.length }}</span>
              new <span v-if="hiddenPosts.length > 1" >posts</span><span v-else>post</span>
            </p>
          </div>
        </transition>
        <div v-if="posts.length">
          <div v-for="post in posts" :key="post.id" class="post">
            <h5>{{ post.userName }}</h5>
            <span>{{ post.createdOn | formatDate }}</span>
            <p>{{ post.content | trimLength }}</p>
            <ul>
              <li><a @click="openCommentModal(post)">Comments {{ post.comments }}</a></li>
              <li><a @click="likePost(post.id, post.likes)">Likes {{ post.likes }}</a></li>
              <li><a @click="viewPost(post)">View full post</a></li>
            </ul>
          </div>
        </div>
        <div v-else>
          <p>There are currently no posts.</p>
        </div>
      </div>
    </section>

    <!-- comment modal -->
    <transition name="fade">
      <div v-if="showCommentModal" class="c-modal">
        <div class="c-container">
          <a @click="closeCommentModal">X</a>
          <p>Add a comment</p>
          <form @submit.prevent>
            <textarea v-model.trim="comment.content"></textarea>
            <button
              @click="addComment"
              :disabled="comment.content == ''"
              class="button"
            >
              Add comment
            </button>
          </form>
        </div>
      </div>
    </transition>

    <!-- post modal -->
    <transition name="fade">
      <div v-if="showPostModal" class="p-modal">
        <div class="p-container">
          <a @click="closePostModal" class="close">X</a>
          <div class="post">
            <h5>{{ fullPost.userName }}</h5>
            <span>{{ fullPost.createdOn | formatDate }}</span>
            <p>{{ fullPost.content }}</p>
            <ul>
              <li><a>Comments {{ fullPost.comments }}</a></li>
              <li><a>Likes {{ fullPost.likes }}</a></li>
            </ul>
          </div>
          <div v-show="postComments.length" class="comments">
            <div v-for="comment in postComments" :key="comment.id" class="comment">
              <p>{{ comment.userName }}</p>
              <span>{{ comment.createdOn | formatDate }}</span>
              <p>{{ comment.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapState } from 'vuex'
const firebase = require('../firebaseConfig')
import moment from 'moment'

export default {
  name: 'Dashboard',
  data() {
    return {
      post: {
        content: ''
      },
      comment: {
        postId: '',
        userId: '',
        content: '',
        postComments: 0
      },
      showCommentModal: false,
      showPostModal: false,
      fullPost: {},
      postComments: []
    }
  },
  computed: {
    ...mapState(['userProfile', 'currentUser', 'posts', 'hiddenPosts'])
  },
  methods: {
    createPost() {
      firebase.postsCollection.add({
        createdOn: new Date(),
        content: this.post.content,
        userId: this.currentUser.uid,
        userName: this.userProfile.name,
        comments: 0,
        likes: 0
      })
      .then(ref => {
        this.post.content = ''
      })
      .catch(err => {
        console.log(err)
      })
    },
    showNewPosts() {
      let updatedPosts = this.hiddenPosts.concat(this.posts)

      // clear hiddenPosts array and update (visible) posts array
      this.$store.commit('setHiddenPosts', null)
      this.$store.commit('setPosts', updatedPosts)
    },
    addComment() {
      let postId = this.comment.postId
      let postComments = this.comment.postComments

      firebase.commentsCollection.add({
        createdOn: new Date(),
        content: this.comment.content,
        postId: postId,
        userId: this.currentUser.uid,
        userName: this.userProfile.name
      })
      .then(doc => {
        firebase.postsCollection.doc(postId).update({
          comments: postComments + 1
        })
        .then(() => {
          this.closeCommentModal()
        })
      })
      .catch(err => {
        console.log(err)
      })
    },
    openCommentModal(post) {
      this.comment.postId = post.id
      this.comment.userId = post.userId
      this.comment.postComments = post.comments
      this.showCommentModal = true
    },
    closeCommentModal() {
      this.comment.postId = ''
      this.comment.userId = ''
      this.comment.content = ''
      this.showCommentModal = false
    },
    likePost(postId, postLikes) {
      let docId = `${this.currentUser.uid}_${postId}`

      firebase.likesCollection
        .doc(docId)
        .get()
        .then(doc => {

          if (doc.exists) {
            return
          }

          firebase.likesCollection.doc(docId).set({
            postId: postId,
            userId: this.currentUser.uid
          })
          .then(() => {
            firebase.postsCollection.doc(postId).update({
              likes: postLikes + 1
            })
          })
        })
        .catch(err => {
          console.log(err)
        })
    },
    viewPost(post) {
      firebase.commentsCollection
        .where('postId', '==', post.id)
        // NOTE: This wasn't part of the tutorial, but I created
        // a composite index for this in the Firebase console (under Database):
        // fields indexed: 'postId' asc and 'createdOn' desc in 'comments' collection
        // This makes the comments appear newest first, as opposed to the more random
        // order if we only queried the matching postId
        //
        // Without this composite index, Firestore couldn't sort on the "where '=='" query.
        .orderBy('createdOn', 'desc')
        .get()
        .then(docs => {
          let commentsArray = []

          docs.forEach(doc => {
            let comment = doc.data()
            comment.id = doc.id
            commentsArray.push(comment)
          })

          this.postComments = commentsArray
          this.fullPost = post
          this.showPostModal = true
        })
        .catch(err => {
          console.log(err)
        })
    },
    closePostModal() {
      this.postComments = []
      this.showPostModal = false
    }
  },
  filters: {
    formatDate(val) {
      if (!val) {
        return '-'
      }
      let date = val.toDate()
      return moment(date).fromNow()
    },
    trimLength(val) {
      if (val.length < 200) {
        return val
      }
      return `${val.substring(0, 200)}...`
    }
  }
}
</script>