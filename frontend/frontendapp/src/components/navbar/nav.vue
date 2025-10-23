<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
    <div class="container">
        Facebook Clone      
      <button 
        class="navbar-toggler border-0" 
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target="#navbarNav"
        aria-controls="navbarNav" 
        aria-expanded="false" 
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <!-- Show Login and Register when user is NOT authenticated -->
          <template v-if="!isAuthenticated">
            <li class="nav-item me-2">
              <router-link class="nav-link btn btn-outline-primary btn-sm px-3" to="/login">
                <i class="fas fa-sign-in-alt me-1"></i>Login
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link btn btn-primary btn-sm px-3" to="/register">
                <i class="fas fa-user-plus me-1"></i>Register
              </router-link>
            </li>
          </template>
          
          <!-- Show Logout when user IS authenticated -->
          <template v-if="isAuthenticated">
            <li class="nav-item dropdown me-3">
              <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" id="profileDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="fas fa-user-circle me-2"></i>
                <span class="text-muted">{{ username }}</span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end shadow" aria-labelledby="profileDropdown">
                <li>
                  <h6 class="dropdown-header">
                    <i class="fas fa-user me-2"></i>Profile
                  </h6>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <router-link class="dropdown-item" to="/profile-update">
                    <i class="fas fa-edit me-2"></i>Update Profile
                  </router-link>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <button class="dropdown-item text-danger" @click="logout">
                    <i class="fas fa-sign-out-alt me-2"></i>Logout
                  </button>
                </li>
              </ul>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'NavBar',
  data() {
    return {
      isAuthenticated: false,
      username: '',
    };
  },
  mounted() {
    this.checkAuthStatus();
    // Listen for storage changes to update auth status
    window.addEventListener('storage', this.checkAuthStatus);
    // Also listen for custom events from login/register
    window.addEventListener('userLoggedIn', this.checkAuthStatus);
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.checkAuthStatus);
    window.removeEventListener('userLoggedIn', this.checkAuthStatus);
  },
  methods: {
    checkAuthStatus() {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        this.isAuthenticated = true;
        this.username = JSON.parse(user).username || JSON.parse(user).name;
      } else {
        this.isAuthenticated = false;
        this.username = '';
      }
    },
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.isAuthenticated = false;
      this.username = '';
      
      // Show logout notification
      // eslint-disable-next-line no-undef
      toastr.info('You have been logged out successfully.', 'Goodbye!');
      
      // Redirect to login page
      if (this.$router) {
        this.$router.push('/login');
      } else {
        window.location.href = '/login';
      }
    },
  },
};
</script>

<style scoped>
.navbar-brand {
  font-weight: 600;
}

.nav-link {
  font-weight: 500;
}

.dropdown-menu {
  border: 1px solid #dee2e6;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.dropdown-item {
  padding: 0.5rem 1rem;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.dropdown-item.text-danger:hover {
  background-color: #f8d7da;
  color: #721c24 !important;
}

.dropdown-header {
  font-weight: 600;
  color: #495057;
}
</style>
