<template>
  <Header />
  <main>
    <div class="contents">
      <router-view />
    </div>
  </main>
</template>

<script>
import Header from './components/Header.vue'
import Home from './components/Home.vue'

export default {
  name: 'App',
  components: {
    Header, Home
  }
}
</script>