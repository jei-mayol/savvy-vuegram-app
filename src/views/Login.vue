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
        <form>
          <h1>Welcome Back</h1>

          <label for="email1">Email</label>
          <input type="text" placeholder="your@email.com" id="email1" />

          <label for="password1">Password</label>
          <input type="password" placeholder="******" id="password1" />

          <button class="button">Log In</button>

          <div class="extras">
            <a>Forgot Password</a>
            <a>Create an Accouunt</a>
          </div>
        </form>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "Login"
}
</script>