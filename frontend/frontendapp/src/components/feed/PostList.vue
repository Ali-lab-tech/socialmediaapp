<template>
  <div class="posts-container">
    <div v-if="loading" class="text-center my-4">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    
    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>
    
    <div v-else-if="posts.length === 0" class="card">
      <div class="card-body text-center">
        <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
        <p class="text-muted">No posts yet. Be the first to share something!</p>
      </div>
    </div>
    
    <div v-else class="card mb-3" v-for="post in posts" :key="post.id">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div class="d-flex align-items-center">
            <div class="user-avatar me-2">
              <i class="fas fa-user-circle fa-2x text-primary"></i>
            </div>
            <div>
              <h6 class="mb-0 fw-bold">{{ post.user ? post.user.name : 'Unknown User' }}</h6>
              <small class="text-muted">{{ formatDate(post.createdAt) }}</small>
            </div>
          </div>
          
          <div v-if="isOwnPost(post.userId)" class="dropdown">
            <button
              class="btn btn-sm btn-link text-muted"
              type="button"
              :id="'dropdown' + post.id"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i class="fas fa-ellipsis-v"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end" :aria-labelledby="'dropdown' + post.id">
              <li>
                <button class="dropdown-item" @click="editPost(post)">
                  <i class="fas fa-edit me-2"></i>Edit
                </button>
              </li>
              <li><hr class="dropdown-divider" /></li>
              <li>
                <button class="dropdown-item text-danger" @click="deletePost(post.id)">
                  <i class="fas fa-trash me-2"></i>Delete
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        <div class="post-content">
          <p class="mb-2">{{ post.content }}</p>
          <div v-if="post.imageUrl" class="post-image mb-2">
            <img :src="getImageUrl(post.imageUrl)" alt="Post image" class="img-fluid rounded" />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Edit Post Modal -->
    <div class="modal fade" id="editPostModal" tabindex="-1" aria-labelledby="editPostModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="editPostModalLabel">Edit Post</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <textarea
              v-model="editingPost.content"
              class="form-control mb-3"
              rows="4"
            ></textarea>
            
            <!-- Image Upload -->
            <div class="mb-3">
              <label class="form-label">Change Image (Optional)</label>
              <input
                type="file"
                ref="editFileInput"
                @change="handleEditFileSelect"
                accept="image/*"
                class="form-control"
              />
              <div v-if="editingPost.imagePreview" class="mt-2">
                <img :src="editingPost.imagePreview" alt="Preview" class="img-thumbnail" style="max-height: 200px;" />
                <button
                  type="button"
                  class="btn btn-sm btn-danger ms-2"
                  @click="removeEditImage"
                >
                  <i class="fas fa-times"></i> Remove
                </button>
              </div>
              <div v-else-if="editingPost.currentImage" class="mt-2">
                <label class="text-muted">Current Image:</label>
                <img :src="getImageUrl(editingPost.currentImage)" alt="Current" class="img-thumbnail d-block" style="max-height: 200px;" />
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="saveEdit">Save changes</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PostList',
  data() {
    return {
      posts: [],
      loading: true,
      error: null,
      currentUserId: null,
      editingPost: { id: null, content: '', currentImage: null, selectedImage: null, imagePreview: '' },
    };
  },
  mounted() {
    this.loadPosts();
    this.loadCurrentUser();
  },
  methods: {
    getImageUrl(imageUrl) {
      if (!imageUrl) return '';
      // If imageUrl already includes http://, return as is
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
      }
      // Otherwise, prepend the backend URL
      return `http://localhost:3000${imageUrl}`;
    },
    async loadCurrentUser() {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        this.currentUserId = user.id;
      }
    },
    async loadPosts() {
      this.loading = true;
      this.error = null;
      try {
        const response = await fetch('http://localhost:3000/feed/posts', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          this.posts = await response.json();
        } else {
          this.error = 'Failed to load posts. Please try again.';
        }
      } catch (error) {
        console.error('Posts loading error:', error);
        this.error = 'Network error. Please check your connection.';
      } finally {
        this.loading = false;
      }
    },
    isOwnPost(userId) {
      return this.currentUserId === userId;
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);

      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
      
      return date.toLocaleDateString();
    },
    editPost(post) {
      this.editingPost = { 
        id: post.id, 
        content: post.content,
        currentImage: post.imageUrl,
        selectedImage: null,
        imagePreview: ''
      };
      // eslint-disable-next-line no-undef
      const modal = new bootstrap.Modal(document.getElementById('editPostModal'));
      modal.show();
    },
    handleEditFileSelect(event) {
      const file = event.target.files[0];
      if (file) {
        this.editingPost.selectedImage = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.editingPost.imagePreview = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    removeEditImage() {
      this.editingPost.selectedImage = null;
      this.editingPost.imagePreview = '';
      this.editingPost.currentImage = null;
      if (this.$refs.editFileInput) {
        this.$refs.editFileInput.value = '';
      }
    },
    async saveEdit() {
      try {
        const formData = new FormData();
        formData.append('content', this.editingPost.content);
        
        // If no new image selected and current image exists, keep current image
        if (this.editingPost.selectedImage) {
          formData.append('image', this.editingPost.selectedImage);
        } else if (!this.editingPost.currentImage && this.editingPost.imagePreview === '') {
          // User removed the image
          formData.append('imageUrl', '');
        }
        
        const response = await fetch(`http://localhost:3000/feed/posts/${this.editingPost.id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        });

        if (response.ok) {
          // eslint-disable-next-line no-undef
          toastr.success('Post updated successfully!', 'Success');
          this.loadPosts();
          this.removeEditImage();
          // eslint-disable-next-line no-undef
          const modal = bootstrap.Modal.getInstance(document.getElementById('editPostModal'));
          modal.hide();
        } else {
          const errorData = await response.json();
          // eslint-disable-next-line no-undef
          toastr.error(errorData.message || 'Failed to update post', 'Error');
        }
      } catch (error) {
        console.error('Post update error:', error);
        // eslint-disable-next-line no-undef
        toastr.error('Network error. Please try again.', 'Error');
      }
    },
    async deletePost(postId) {
      if (!confirm('Are you sure you want to delete this post?')) {
        return;
      }

      try {
        const response = await fetch(`http://localhost:3000/feed/posts/${postId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          // eslint-disable-next-line no-undef
          toastr.success('Post deleted successfully!', 'Success');
          this.loadPosts();
        } else {
          // eslint-disable-next-line no-undef
          toastr.error('Failed to delete post', 'Error');
        }
      } catch (error) {
        console.error('Post deletion error:', error);
        // eslint-disable-next-line no-undef
        toastr.error('Network error. Please try again.', 'Error');
      }
    },
  },
};
</script>

<style scoped>
.posts-container {
  max-width: 100%;
}

.user-avatar {
  display: flex;
  align-items: center;
}

.post-content {
  margin-top: 1rem;
}

.post-image img {
  max-height: 400px;
  object-fit: cover;
  width: 100%;
}

.card {
  border: 1px solid #dee2e6;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}
</style>
