<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-4">
        <div class="card">
          <div class="card-body">
            <h2 class="card-title text-center mb-4">Login</h2>
            <form @submit.prevent="login">
              <div class="mb-3">
                <input 
                  v-model="username" 
                  placeholder="Username" 
                  class="form-control"
                  required
                />
              </div>
              <div class="mb-3">
                <input 
                  type="password" 
                  v-model="password" 
                  placeholder="Password" 
                  class="form-control"
                  required
                />
              </div>
              <button type="submit" class="btn btn-secondary w-100">Login</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginPage',
  data() {
    return {
      username: '',
      password: '',
    };
  },
  methods: {
    async login() {
      try {
        const response = await fetch('http://localhost:3000/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: this.username, password: this.password }),
        });
        
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('token', data.access_token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // Show success notification
          // eslint-disable-next-line no-undef
          toastr.success('Login successful!', 'Welcome back!');
          
          // Dispatch custom event to notify navbar
          window.dispatchEvent(new CustomEvent('userLoggedIn'));
          
          // Redirect to user feed
          this.$router.push('/user-feed');
        } else {
          // eslint-disable-next-line no-undef
          toastr.error('Login failed. Please check your credentials.', 'Error');
        }
      } catch (error) {
        console.error('Login error:', error);
        // eslint-disable-next-line no-undef
        toastr.error('Login failed. Please try again.', 'Network Error');
      }
    },
  },
};
</script>
