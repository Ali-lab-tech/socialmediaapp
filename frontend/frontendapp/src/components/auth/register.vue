
<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-4">
        <div class="card">
          <div class="card-body">
            <h2 class="card-title text-center mb-4">Register Profile</h2>
            <form @submit.prevent="signup">
                   <div class="mb-3">
                <input 
                  v-model="name" 
                  placeholder="Full Name" 
                  class="form-control"
                  required
                />
              </div>
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
                  v-model="email" 
                  placeholder="Email" 
                  class="form-control"
                  required
                />
              </div>
              <div class="mb-3">
                <input 
                  v-model="password" 
                  type="password" 
                  placeholder="Password" 
                  class="form-control"
                  required
                />
              </div>
              <button type="submit" class="btn btn-success w-100">Register</button>
            </form>
          </div>
        </div>
      </div>
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
          toastr.success('Registration successful!', 'Welcome to Social Media App!');
          
          // Dispatch custom event to notify navbar
          window.dispatchEvent(new CustomEvent('userLoggedIn'));
          
          // Redirect to user feed
          this.$router.push('/user-feed');
        } else {
          // eslint-disable-next-line no-undef
          toastr.error('Registration failed. Please try again.', 'Error');
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