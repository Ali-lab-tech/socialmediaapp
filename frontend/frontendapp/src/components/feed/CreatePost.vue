<template>
  <div class="card mb-4">
    <div class="card-body">
      <h5 class="card-title mb-3">
        <i class="fas fa-pencil-alt me-2"></i>Create a Post
      </h5>
      <form @submit.prevent="createPost">
        <div class="mb-3">
          <textarea
            v-model="content"
            class="form-control"
            rows="4"
            placeholder="What's on your mind?"
            required
          ></textarea>
        </div>
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <input
              type="file"
              ref="fileInput"
              @change="handleFileSelect"
              accept="image/*"
              style="display: none"
            />
            <button
              type="button"
              class="btn btn-outline-secondary btn-sm"
              @click="$refs.fileInput.click()"
            >
              <i class="fas fa-image me-2"></i>Photo
            </button>
          </div>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="fas fa-paper-plane me-2"></i>Post
          </button>
        </div>
        <div v-if="selectedImage" class="mt-3">
          <img :src="imagePreview" alt="Preview" class="img-thumbnail" style="max-height: 200px;" />
          <button
            type="button"
            class="btn btn-sm btn-danger ms-2"
            @click="removeImage"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
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
        
        const response = await fetch('http://localhost:3000/feed/posts', {
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
.card {
  border: 1px solid #dee2e6;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.btn-outline-secondary {
  border-color: #6c757d;
}

.img-thumbnail {
  border: 1px solid #dee2e6;
}
</style>
