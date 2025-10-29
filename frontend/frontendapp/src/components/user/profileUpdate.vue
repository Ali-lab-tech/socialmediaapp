<template>
  <div class="profile-update-container">
    <div class="profile-card">
      <div class="profile-header">
        <div class="profile-icon">
          <i class="fas fa-user-edit"></i>
        </div>
        <h1 class="profile-title">Update Profile</h1>
        <p class="profile-subtitle">Keep your information up to date</p>
      </div>
      
      <form @submit.prevent="updateProfile" class="profile-form">
        <div class="input-group">
          <div class="input-icon">
            <i class="fas fa-user"></i>
          </div>
          <div class="input-wrapper">
            <label for="username" class="input-label">Username</label>
            <input 
              type="text" 
              class="form-input" 
              id="username" 
              v-model="profileForm.username"
              required
            >
          </div>
        </div>
        
        <div class="input-group">
          <div class="input-icon">
            <i class="fas fa-id-card"></i>
          </div>
          <div class="input-wrapper">
            <label for="name" class="input-label">Full Name</label>
            <input 
              type="text" 
              class="form-input" 
              id="name" 
              v-model="profileForm.name"
              required
            >
          </div>
        </div>
        
        <div class="input-group">
          <div class="input-icon">
            <i class="fas fa-envelope"></i>
          </div>
          <div class="input-wrapper">
            <label for="email" class="input-label">Email</label>
            <input 
              type="email" 
              class="form-input" 
              id="email" 
              v-model="profileForm.email"
            >
          </div>
        </div>
        
        <div class="password-section">
          <h3 class="section-title">
            <i class="fas fa-lock"></i>
            Change Password (Optional)
          </h3>
        </div>
        
        <div class="input-group">
          <div class="input-icon">
            <i class="fas fa-lock"></i>
          </div>
          <div class="input-wrapper">
            <label for="currentPassword" class="input-label">Current Password</label>
            <input 
              type="password" 
              class="form-input" 
              id="currentPassword" 
              v-model="profileForm.currentPassword"
              placeholder="Enter current password to confirm changes"
            >
          </div>
        </div>
        
        <div class="input-group">
          <div class="input-icon">
            <i class="fas fa-key"></i>
          </div>
          <div class="input-wrapper">
            <label for="newPassword" class="input-label">New Password</label>
            <input 
              type="password" 
              class="form-input" 
              id="newPassword" 
              v-model="profileForm.newPassword"
              placeholder="Leave empty to keep current password"
            >
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="goBack">
            <i class="fas fa-arrow-left"></i>
            <span>Cancel</span>
          </button>
          <button type="submit" class="btn-submit" :disabled="updating">
            <span v-if="updating" class="spinner-small"></span>
            <i v-else class="fas fa-save"></i>
            <span>{{ updating ? 'Updating...' : 'Update Profile' }}</span>
          </button>
        </div>
      </form>
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
.profile-update-container {
  min-height: calc(100vh - 76px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background: var(--bg-secondary);
}

.profile-card {
  width: 100%;
  max-width: 600px;
  background: var(--bg-card);
  border-radius: 24px;
  padding: 3rem;
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--border-color);
}

.profile-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.profile-icon {
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

.profile-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.profile-subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
  margin: 0;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.input-icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 12px;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-size: 1.25rem;
  margin-top: 0.5rem;
}

.input-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-label {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  background: var(--bg-card);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.form-input::placeholder {
  color: var(--text-tertiary);
}

.password-section {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title i {
  color: var(--accent-primary);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.btn-cancel {
  flex: 1;
  padding: 1rem 2rem;
  background: var(--bg-tertiary);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  color: var(--text-primary);
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background: var(--bg-secondary);
  border-color: var(--text-secondary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-submit {
  flex: 1;
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
  gap: 0.5rem;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-md);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-submit:active:not(:disabled) {
  transform: translateY(0);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .profile-card {
    padding: 2rem 1.5rem;
  }
  
  .profile-title {
    font-size: 1.75rem;
  }
  
  .profile-icon {
    width: 64px;
    height: 64px;
    font-size: 2rem;
  }
  
  .input-group {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .input-icon {
    margin-top: 0;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>
