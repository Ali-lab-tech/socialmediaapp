<template>
  <div id="app" :data-theme="theme">
    <NavBar @theme-changed="updateTheme" />
    <div class="main-container">
      <router-view />
    </div>
  </div>
</template>

<script>
import NavBar from './components/navbar/nav.vue'
import './assets/theme.css'

export default {
  name: 'App',
  components: {
    NavBar
  },
  data() {
    return {
      theme: 'light'
    }
  },
  mounted() {
    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    this.theme = savedTheme;
    document.documentElement.setAttribute('data-theme', savedTheme);
  },
  methods: {
    updateTheme(newTheme) {
      this.theme = newTheme;
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    }
  }
}
</script>

<style>
#app {
  min-height: 100vh;
  background-color: var(--bg-secondary);
  transition: background-color 0.3s ease;
}

.main-container {
  padding-top: 76px;
  min-height: calc(100vh - 76px);
}

* {
  box-sizing: border-box;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--accent-primary);
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--accent-secondary);
}
</style>
