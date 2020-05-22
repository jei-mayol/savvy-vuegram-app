<template>
  <div id="login">
    <section>
      <div class="col1">
        <h1>Vuegram</h1>
        <p>
          Welcome to the
          <a href="https://savvyapps.com" target="_blank">Savvy Apps</a> sample
          social media app powered by Vue.js and Firebase. Build this project by
          checking out The Definitive Guide to Getting Started with Vue.js
        </p>
      </div>
      <div class="col2">
        <form @submit.prevent>
          <h1>Welcome Back</h1>

          <label for="email1">Email</label>
          <input
            v-model.trim="loginForm.email"
            type="text"
            placeholder="your@email.com"
            id="email1"
          />

          <label for="password1">Password</label>
          <input
            v-model.trim="loginForm.password"
            type="password"
            placeholder="******"
            id="password1"
          />

          <button @click="login" class="button">Log In</button>

          <div class="extras">
            <a>Forgot Password</a>
            <a>Create an Accouunt</a>
          </div>
        </form>
        <form @submit.prevent>
          <h1>Get Started</h1>

          <label for="name">Name</label>
          <input
            v-model.trim="signupForm.name"
            type="text"
            placeholder="Your Name"
            id="name"
          />

          <label for="title">Title</label>
          <input
            v-model.trim="signupForm.title"
            type="text"
            placeholder="Company"
            title="title"
          />

          <label for="email2">Email</label>
          <input
            v-model.trim="signupForm.email"
            type="text"
            placeholder="your@email.com"
            id="email2"
          />

          <label for="password2">Password</label>
          <input
            v-model.trim="signupForm.password"
            type="password"
            placeholder="min 6 characters"
            id="password2"
          />

          <button @click="signup" class="button">Sign Up</button>

          <div class="extras">
            <a>Back to Log In</a>
          </div>
        </form>
      </div>
    </section>
  </div>
</template>

<script>
const firebase = require('../firebaseConfig')

export default {
  name: 'Login',
  data() {
    return {
      loginForm: {
        email: '',
        password: ''
      },
      signupForm: {
        name: '',
        title: '',
        email: '',
        password: ''
      }
    }
  },
  methods: {
    login() {
      firebase.auth
        .signInWithEmailAndPassword( this.loginForm.email, this.loginForm.password)
        .then(user => {
          this.$store.commit('setCurrentUser', user.user)
          this.$store.dispatch('fetchUserProfile')
          this.$router.push('/dashboard')
        })
        .catch(err => {
          console.log(err)
        })
    }
  }
}
</script>