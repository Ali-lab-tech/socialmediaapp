import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Wait for DOM to be ready and ensure jQuery is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Configure toastr
  // eslint-disable-next-line no-undef
  if (typeof toastr !== 'undefined') {
    // eslint-disable-next-line no-undef
    toastr.options = {
      closeButton: true,
      debug: false,
      newestOnTop: true,
      progressBar: true,
      positionClass: 'toast-top-right',
      preventDuplicates: false,
      onclick: null,
      showDuration: '300',
      hideDuration: '1000',
      timeOut: '5000',
      extendedTimeOut: '1000',
      showEasing: 'swing',
      hideEasing: 'linear',
      showMethod: 'fadeIn',
      hideMethod: 'fadeOut'
    };
  }
});

createApp(App).use(router).mount('#app')
