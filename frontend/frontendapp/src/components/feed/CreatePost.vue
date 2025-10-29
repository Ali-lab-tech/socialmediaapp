<template>
  <div class="create-post-card">
    <div class="create-post-header">
      <div class="header-icon">
        <i class="fas fa-sparkles"></i>
      </div>
      <h3 class="header-title">Create a Post</h3>
    </div>
    
    <form @submit.prevent="createPost" class="create-post-form">
      <div class="input-wrapper">
        <textarea
          v-model="content"
          class="post-textarea"
          rows="4"
          placeholder="Share your thoughts with the community... ✨"
          required
        ></textarea>
      </div>
      
      <div class="form-actions">
        <div class="file-upload-wrapper">
          <input
            type="file"
            ref="fileInput"
            @change="handleFileSelect"
            accept="image/*"
            class="file-input"
          />
          <button
            type="button"
            class="btn-icon"
            @click="$refs.fileInput.click()"
            title="Add Photo"
          >
            <i class="fas fa-image"></i>
            <span>Photo</span>
          </button>
        </div>
        
        <button 
          type="submit" 
          class="btn-submit" 
          :disabled="loading || !content.trim()"
        >
          <span v-if="loading" class="spinner-small"></span>
          <i v-else class="fas fa-paper-plane"></i>
          <span>Post</span>
        </button>
      </div>
      
      <div v-if="selectedImage" class="image-preview-wrapper">
        <div class="image-preview-container">
          <img :src="imagePreview" alt="Preview" class="image-preview" />
          <button
            type="button"
            class="btn-remove-image"
            @click="removeImage"
            title="Remove Image"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import apiConfig from '@/config/api';

export default {
  name: 'CreatePost',
  data() {
    return {
      content: '',
      imageUrl: '',
      selectedImage: null,
      imagePreview: '',
      loading: false,
    };
  },
  methods: {
    handleFileSelect(event) {
      const file = event.target.files[0];
      if (file) {
        this.selectedImage = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreview = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    removeImage() {
      this.selectedImage = null;
      this.imagePreview = '';
      this.$refs.fileInput.value = '';
    },
    async createPost() {
      this.loading = true;
      try {
        const formData = new FormData();
        formData.append('content', this.content);
        
        if (this.selectedImage) {
          formData.append('image', this.selectedImage);
        }
        
        const response = await fetch(apiConfig.feed.posts, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        });

        if (response.ok) {
          // Show success notification
          // eslint-disable-next-line no-undef
          toastr.success('Post created successfully!', 'Success');
          
          // Reset form
          this.content = '';
          this.removeImage();
          
          // Emit event to parent to refresh posts
          this.$emit('postCreated');
        } else {
          const error = await response.json();
          // eslint-disable-next-line no-undef
          toastr.error(error.message || 'Failed to create post', 'Error');
        }
      } catch (error) {
        console.error('Post submission error:', error);
        // eslint-disable-next-line no-undef
        toastr.error('Network error. Please try again.', 'Error');
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.create-post-card {
  background: var(--bg-card);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--border-color);
  margin-bottom: 0;
  transition: all 0.3s ease;
  width: 100%;
}

.create-post-card:hover {
  box-shadow: var(--shadow-xl);
  transform: translateY(-2px);
}

.create-post-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.header-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: var(--accent-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
}

.header-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.create-post-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.input-wrapper {
  position: relative;
}

.post-textarea {
  width: 100%;
  padding: 1.25rem;
  border: 2px solid var(--border-color);
  border-radius: 16px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  line-height: 1.6;
  resize: vertical;
  min-height: 120px;
  transition: all 0.2s ease;
  font-family: inherit;
}

.post-textarea:focus {
  outline: none;
  border-color: var(--accent-primary);
  background: var(--bg-card);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.post-textarea::placeholder {
  color: var(--text-tertiary);
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.file-upload-wrapper {
  position: relative;
}

.file-input {
  display: none;
}

.btn-icon {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: var(--bg-tertiary);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: white;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-submit {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  background: var(--accent-gradient);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
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

.image-preview-wrapper {
  margin-top: 1rem;
}

.image-preview-container {
  position: relative;
  display: inline-block;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.image-preview {
  max-height: 300px;
  display: block;
  border-radius: 16px;
}

.btn-remove-image {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-remove-image:hover {
  background: var(--error);
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .create-post-card {
    padding: 1.5rem;
  }
  
  .header-title {
    font-size: 1.25rem;
  }
  
  .btn-submit {
    padding: 0.625rem 1.5rem;
    font-size: 0.875rem;
  }
}
</style>
