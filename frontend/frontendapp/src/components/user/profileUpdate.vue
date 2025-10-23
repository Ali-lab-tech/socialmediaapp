<template>
  <div class="container mt-4">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6">
        <div class="card shadow">
          <div class="card-header bg-primary text-white">
            <h4 class="card-title mb-0">
              <i class="fas fa-user-edit me-2"></i>Update Profile
            </h4>
          </div>
          <div class="card-body p-4">
            <form @submit.prevent="updateProfile">
              <div class="mb-3">
                <label for="username" class="form-label">
                  <i class="fas fa-user me-1"></i>Username
                </label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="username" 
                  v-model="profileForm.username"
                  required
                >
              </div>
              
              <div class="mb-3">
                <label for="name" class="form-label">
                  <i class="fas fa-id-card me-1"></i>Full Name
                </label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="name" 
                  v-model="profileForm.name"
                  required
                >
              </div>
              
              <div class="mb-3">
                <label for="email" class="form-label">
                  <i class="fas fa-envelope me-1"></i>Email
                </label>
                <input 
                  type="email" 
                  class="form-control" 
                  id="email" 
                  v-model="profileForm.email"
                >
              </div>
              
              <div class="mb-3">
                <label for="currentPassword" class="form-label">
                  <i class="fas fa-lock me-1"></i>Current Password
                </label>
                <input 
                  type="password" 
                  class="form-control" 
                  id="currentPassword" 
                  v-model="profileForm.currentPassword"
                  placeholder="Enter current password to confirm changes"
                >
              </div>
              
              <div class="mb-3">
                <label for="newPassword" class="form-label">
                  <i class="fas fa-key me-1"></i>New Password (Optional)
                </label>
                <input 
                  type="password" 
                  class="form-control" 
                  id="newPassword" 
                  v-model="profileForm.newPassword"
                  placeholder="Leave empty to keep current password"
                >
              </div>
              
              <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                <button type="button" class="btn btn-secondary me-md-2" @click="goBack">
                  <i class="fas fa-arrow-left me-1"></i>Cancel
                </button>
                <button type="submit" class="btn btn-primary" :disabled="updating">
                  <i class="fas fa-save me-1" v-if="!updating"></i>
                  <span class="spinner-border spinner-border-sm me-1" v-if="updating"></span>
                  {{ updating ? 'Updating...' : 'Update Profile' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProfileUpdate',
  data() {
    return {
      updating: false,
      profileForm: {
        username: '',
        name: '',
        email: '',
        currentPassword: '',
        newPassword: ''
      }
    };
  },
  async mounted() {
    await this.loadUserProfile();
  },
  methods: {
    async loadUserProfile() {
      try {
        const response = await fetch('http://localhost:3000/auth/profile', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          this.profileForm.username = userData.username;
          this.profileForm.name = userData.name;
          this.profileForm.email = userData.email || '';
        } else {
          // eslint-disable-next-line no-undef
          toastr.error('Failed to load profile data', 'Error');
          this.goBack();
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        // eslint-disable-next-line no-undef
        toastr.error('Failed to load profile data', 'Network Error');
        this.goBack();
      }
    },
    async updateProfile() {
      this.updating = true;
      
      try {
        const updateData = {
          username: this.profileForm.username,
          name: this.profileForm.name,
          email: this.profileForm.email,
          currentPassword: this.profileForm.currentPassword
        };
        
        // Only include new password if provided
        if (this.profileForm.newPassword) {
          updateData.newPassword = this.profileForm.newPassword;
        }
        
        const response = await fetch('http://localhost:3000/auth/profile', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });
        
        if (response.ok) {
          const updatedUser = await response.json();
          
          // Update localStorage with new user data
          localStorage.setItem('user', JSON.stringify({
            username: updatedUser.username,
            name: updatedUser.name,
            email: updatedUser.email
          }));
          
          // Show success message
          // eslint-disable-next-line no-undef
          toastr.success('Profile updated successfully!', 'Success');
          
          // Dispatch event to update navbar
          window.dispatchEvent(new CustomEvent('userLoggedIn'));
          
          // Redirect to user feed
          this.$router.push('/user-feed');
        } else {
          const error = await response.json();
          // eslint-disable-next-line no-undef
          toastr.error(error.message || 'Failed to update profile', 'Error');
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        // eslint-disable-next-line no-undef
        toastr.error('Failed to update profile. Please try again.', 'Network Error');
      } finally {
        this.updating = false;
      }
    },
    goBack() {
      this.$router.push('/user-feed');
    }
  }
};
</script>

<style scoped>
.card {
  border: 1px solid #dee2e6;
}

.card-header {
  background-color: #007bff;
  border-bottom: 1px solid #dee2e6;
}

.form-label {
  font-weight: 500;
  color: #495057;
}

.form-control:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.btn-primary {
  background-color: #007bff;
  border-color: #007bff;
}

.btn-primary:hover {
  background-color: #0056b3;
  border-color: #004085;
}

.btn-secondary {
  background-color: #6c757d;
  border-color: #6c757d;
}

.btn-secondary:hover {
  background-color: #5a6268;
  border-color: #545b62;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
