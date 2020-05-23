<template>
  <header>
    <section>
      <div class="col1">
        <router-link to="dashboard"><h3>Vuegram</h3></router-link>
        <ul class="inline">
          <li><router-link to="dashboard">Dashboard</router-link></li>
          <li><router-link to="settings">Settings</router-link></li>
          <li><a @click="logout">Log Out</a></li>
        </ul>
      </div>
    </section>
  </header>
</template>

<script>
const firebase = require('../firebaseConfig')

export default {
  name: 'Navigation',
  methods: {
    logout() {
      firebase.auth.signOut().then(() => {
        this.$store.dispatch('clearData')
        this.$router.push('/login')
      })
      .catch(err => {
        console.log(err)
      })
    }
  }
}
</script>