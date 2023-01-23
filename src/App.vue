<template>
  <Header />
  <main class="main">
    <div class="page-inner">
      <div class="contents">
        <router-view />
      </div>
    </div>
  </main>
  <Footer />
</template>

<script>
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import Home from './components/Home.vue'

export default {
  name: 'App',
  components: {
    Header, Home, Footer
  }
}
</script>