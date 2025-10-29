
<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <div class="auth-icon">
          <i class="fas fa-user-plus"></i>
        </div>
        <h1 class="auth-title">Join Us</h1>
        <p class="auth-subtitle">Create your account and start connecting</p>
      </div>
      
      <form @submit.prevent="signup" class="auth-form">
        <div class="input-group">
          <div class="input-icon">
            <i class="fas fa-user"></i>
          </div>
          <input 
            v-model="name" 
            placeholder="Full Name" 
            class="auth-input"
            required
          />
        </div>
        
        <div class="input-group">
          <div class="input-icon">
            <i class="fas fa-at"></i>
          </div>
          <input 
            v-model="username" 
            placeholder="Username" 
            class="auth-input"
            required
          />
        </div>
        
        <div class="input-group">
          <div class="input-icon">
            <i class="fas fa-envelope"></i>
          </div>
          <input 
            v-model="email" 
            type="email"
            placeholder="Email" 
            class="auth-input"
            required
          />
        </div>
        
        <div class="input-group">
          <div class="input-icon">
            <i class="fas fa-lock"></i>
          </div>
          <input 
            v-model="password" 
            type="password" 
            placeholder="Password" 
            class="auth-input"
            required
          />
        </div>
        
        <button type="submit" class="auth-btn-submit">
          <span>Create Account</span>
          <i class="fas fa-arrow-right"></i>
        </button>
        
        <div class="auth-footer">
          <p>Already have an account? 
            <router-link to="/login" class="auth-link">Sign In</router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RegisterPage',
  data() {
    return {
      username: '',
      password: '',
      name: '',
      email: '',
    };
  },
  methods: {
    async signup() {
      try {
        const response = await fetch('http://localhost:3000/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: this.username, password: this.password, name: this.name, email: this.email }),
        });
        
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('token', data.access_token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // Show success notification
          // eslint-disable-next-line no-undef
          toastr.success('Registration successful!', 'Welcome to SocialHub!');
          
          // Dispatch custom event to notify navbar
          window.dispatchEvent(new CustomEvent('userLoggedIn'));
          
          // Redirect to user feed
          this.$router.push('/user-feed');
        } else {
          const errorData = await response.json();
          // eslint-disable-next-line no-undef
          toastr.error(errorData.message || 'Registration failed. Please try again.', 'Error');
        }
      } catch (error) {
        console.error('Registration error:', error);
        // eslint-disable-next-line no-undef
        toastr.error('Registration failed. Please try again.', 'Network Error');
      }
    },
  },
};
</script>

<style scoped>
.auth-container {
  min-height: calc(100vh - 76px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background: var(--bg-secondary);
}

.auth-card {
  width: 100%;
  max-width: 440px;
  background: var(--bg-card);
  border-radius: 24px;
  padding: 3rem;
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--border-color);
}

.auth-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.auth-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: var(--accent-gradient);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2.5rem;
  box-shadow: var(--shadow-lg);
}

.auth-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.auth-subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
  margin: 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: var(--text-secondary);
  font-size: 1rem;
  z-index: 1;
}

.auth-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.2s ease;
}

.auth-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  background: var(--bg-card);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.auth-input::placeholder {
  color: var(--text-tertiary);
}

.auth-btn-submit {
  margin-top: 0.5rem;
  padding: 1rem 2rem;
  background: var(--accent-gradient);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-md);
}

.auth-btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.auth-btn-submit:active {
  transform: translateY(0);
}

.auth-footer {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.auth-footer p {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0;
}

.auth-link {
  color: var(--accent-primary);
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
}

.auth-link:hover {
  color: var(--accent-secondary);
  text-decoration: underline;
}

@media (max-width: 768px) {
  .auth-card {
    padding: 2rem 1.5rem;
  }
  
  .auth-title {
    font-size: 1.75rem;
  }
  
  .auth-icon {
    width: 64px;
    height: 64px;
    font-size: 2rem;
  }
}
</style>