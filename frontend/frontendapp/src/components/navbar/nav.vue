<template>
  <nav class="modern-navbar">
    <div class="nav-container">
      <div class="nav-brand">
        <i class="fas fa-sparkles brand-icon"></i>
        <span class="brand-text">SocialHub</span>
      </div>
      
      <div class="nav-actions">
        <!-- Dark Mode Toggle -->
        <button class="theme-toggle" @click="toggleTheme" :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
          <i :class="isDark ? 'fas fa-sun' : 'fas fa-moon'"></i>
        </button>
        
        <!-- Show Login and Register when user is NOT authenticated -->
        <template v-if="!isAuthenticated">
          <router-link class="btn btn-outline" to="/login">
            <i class="fas fa-sign-in-alt me-1"></i>Login
          </router-link>
          <router-link class="btn btn-primary" to="/register">
            <i class="fas fa-user-plus me-1"></i>Register
          </router-link>
        </template>
        
        <!-- Show Profile Menu when user IS authenticated -->
        <template v-if="isAuthenticated">
          <div class="profile-dropdown" ref="profileDropdown">
            <button class="profile-btn" @mousedown.stop="toggleProfileMenu" @click.stop ref="profileBtn" type="button">
              <div class="profile-avatar">
                <i class="fas fa-user"></i>
              </div>
              <span class="profile-name">{{ username }}</span>
              <i class="fas fa-chevron-down chevron" :class="{ rotated: showProfileMenu }"></i>
            </button>
            
            <transition name="dropdown">
              <div v-show="showProfileMenu" class="dropdown-menu" ref="dropdownMenu" @mousedown.stop>
              <div class="dropdown-header">
                <div class="dropdown-avatar">
                  <i class="fas fa-user"></i>
                </div>
                <div>
                  <div class="dropdown-name">{{ username }}</div>
                  <div class="dropdown-subtitle">Profile</div>
                </div>
              </div>
              <div class="dropdown-divider"></div>
              <router-link class="dropdown-item" to="/profile-update" @click="closeMenu">
                <i class="fas fa-edit"></i>
                <span>Update Profile</span>
              </router-link>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item danger" @click="logout">
                <i class="fas fa-sign-out-alt"></i>
                <span>Logout</span>
              </button>
            </div>
            </transition>
          </div>
        </template>
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
      showProfileMenu: false,
      isDark: false,
    };
  },
  mounted() {
      this.checkAuthStatus();
      this.loadTheme();
      window.addEventListener('storage', this.checkAuthStatus);
      window.addEventListener('userLoggedIn', this.checkAuthStatus);
    },
    beforeUnmount() {
      window.removeEventListener('storage', this.checkAuthStatus);
      window.removeEventListener('userLoggedIn', this.checkAuthStatus);
      this.removeDocumentListener();
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
    loadTheme() {
      const theme = localStorage.getItem('theme') || 'light';
      this.isDark = theme === 'dark';
    },
    toggleTheme() {
      this.isDark = !this.isDark;
      const newTheme = this.isDark ? 'dark' : 'light';
      this.$emit('theme-changed', newTheme);
    },
    toggleProfileMenu(event) {
      if (event) {
        event.stopPropagation();
        event.preventDefault();
      }
      
      const wasOpen = this.showProfileMenu;
      this.showProfileMenu = !wasOpen;
      
      this.$nextTick(() => {
        if (!wasOpen) {
          // Menu is opening - add document listener after a delay
          setTimeout(() => {
            if (this.showProfileMenu && this.$refs.dropdownMenu) {
              document.addEventListener('mousedown', this.onDocumentClick, false);
            }
          }, 300);
        } else {
          // Menu is closing - remove document listener
          this.removeDocumentListener();
        }
      });
    },
    removeDocumentListener() {
      document.removeEventListener('mousedown', this.onDocumentClick, false);
    },
    closeMenu() {
      this.showProfileMenu = false;
      this.removeDocumentListener();
    },
    onDocumentClick(event) {
      if (!this.showProfileMenu) {
        this.removeDocumentListener();
        return;
      }
      
      const root = this.$refs.profileDropdown;
      if (!root) {
        return;
      }
      
      const clickedElement = event.target;
      const isInside = root === clickedElement || root.contains(clickedElement);
      
      if (isInside) {
        return;
      }
      
      this.showProfileMenu = false;
      this.removeDocumentListener();
    },
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.isAuthenticated = false;
      this.username = '';
      this.showProfileMenu = false;
      // eslint-disable-next-line no-undef
      toastr.info('You have been logged out successfully.', 'Goodbye!');
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
.modern-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-icon {
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 1.75rem;
  animation: sparkle 2s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.1); }
}

.brand-text {
  letter-spacing: -0.5px;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.theme-toggle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.theme-toggle:hover {
  background: var(--accent-primary);
  color: white;
  transform: rotate(15deg) scale(1.1);
}

.btn {
  padding: 0.625rem 1.25rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-outline {
  background: transparent;
  border: 2px solid var(--accent-primary);
  color: var(--accent-primary);
}

.btn-outline:hover {
  background: var(--accent-primary);
  color: white;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-primary {
  background: var(--accent-gradient);
  color: white;
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.profile-dropdown {
  position: relative;
}

.profile-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: var(--bg-tertiary);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--text-primary);
}

.profile-btn:hover {
  background: var(--accent-primary);
  color: white;
}

.profile-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--accent-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.875rem;
}

.profile-name {
  font-weight: 600;
  font-size: 0.875rem;
}

.chevron {
  font-size: 0.75rem;
  transition: transform 0.3s ease;
}

.chevron.rotated {
  transform: rotate(180deg);
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  box-shadow: var(--shadow-xl);
  min-width: 220px;
  overflow: hidden;
  z-index: 10000;
  display: block;
}

.dropdown-header {
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--bg-secondary);
}

.dropdown-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--accent-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
}

.dropdown-name {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.dropdown-subtitle {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.dropdown-divider {
  height: 1px;
  background: var(--border-color);
  margin: 0.5rem 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  color: var(--text-primary);
  text-decoration: none;
  cursor: pointer;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.dropdown-item:hover {
  background: var(--bg-secondary);
  color: var(--accent-primary);
}

.dropdown-item.danger {
  color: var(--error);
}

.dropdown-item.danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--error);
}

.dropdown-item i {
  width: 20px;
  text-align: center;
}

@media (max-width: 768px) {
  .nav-container {
    padding: 0.75rem 1rem;
  }
  
  .brand-text {
    font-size: 1.25rem;
  }
  
  .profile-name {
    display: none;
  }
}
</style>
