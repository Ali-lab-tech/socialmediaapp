<template>
  <div class="container mt-4">
    <div class="row">
      <div class="col-md-8 mx-auto">
        <div class="card">
          <div class="card-body">
            <h2 class="card-title text-center mb-4">Your Feed</h2>
            <div v-if="loading" class="text-center">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div v-else-if="error" class="alert alert-danger">
              {{ error }}
            </div>
            <div v-else>
              <p class="card-text">{{ feed }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserFeed',
  data() {
    return {
      feed: '',
      loading: true,
      error: null,
    };
  },
  async created() {
    try {
      const response = await fetch('http://localhost:3000/feed/user-feed', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        this.feed = data.feed;
      } else {
        this.error = 'Failed to load feed. Please try again.';
      }
    } catch (error) {
      console.error('Feed loading error:', error);
      this.error = 'Network error. Please check your connection.';
    } finally {
      this.loading = false;
    }
  },
      methods: {
        logout() {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Show logout notification
          // eslint-disable-next-line no-undef
          toastr.info('You have been logged out successfully.', 'Goodbye!');
          
          this.$router.push('/login');
        },
      },
};
</script>
