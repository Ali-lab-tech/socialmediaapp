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
          <p class="mb-2" v-html="formatContentWithMentions(post.content)"></p>
          <div v-if="post.imageUrl" class="post-image mb-2">
            <img :src="getImageUrl(post.imageUrl)" alt="Post image" class="img-fluid rounded" />
          </div>
        </div>
        
        <div class="post-actions border-top pt-2 mt-2">
          <button 
            class="btn btn-sm" 
            :class="isPostLiked(post.id) ? 'btn-primary' : 'btn-link text-muted'"
            @click="toggleLike(post.id)"
          >
            <i :class="isPostLiked(post.id) ? 'fas fa-heart' : 'far fa-heart'" class="me-1"></i>
            <span>{{ getLikesCount(post.id) }}</span>
          </button>

          <button 
            class="btn btn-sm btn-link text-muted"
            @click="toggleComments(post.id)"
            title="Comments"
          >
            <i class="far fa-comment me-1"></i>
            <span>{{ getCommentsCount(post.id) }}</span>
          </button>

          <button 
            v-if="!isOwnPost(post.userId)"
            class="btn btn-sm btn-link text-muted" 
            @click="sharePost(post.id)"
            title="Share Post"
          >
            <i class="fas fa-share me-1"></i>
            <span>Share</span>
          </button>
        </div>

        <!-- Comments Section -->
        <div v-if="isCommentsOpen(post.id)" class="mt-2">
          <div class="mb-2" v-if="commentsByPost[post.id] && commentsByPost[post.id].length">
            <div v-for="comment in commentsByPost[post.id]" :key="comment.id" class="d-flex mb-2">
              <div class="me-2">
                <i class="fas fa-user-circle text-primary"></i>
              </div>
              <div>
                <div class="small"><strong>{{ comment.user?.name || 'Unknown' }}</strong> · <span class="text-muted">{{ formatDate(comment.createdAt) }}</span></div>
                <div v-html="formatContentWithMentions(comment.content)"></div>
              </div>
            </div>
          </div>
          <div v-else class="text-muted small mb-2">No comments yet. Be the first to comment.</div>

          <div class="mention-input-container" :data-post-id="post.id">
            <div class="input-group">
              <textarea 
                class="form-control mention-textarea" 
                :placeholder="'Write a comment...'"
                :id="'comment-input-' + post.id"
                v-model="commentInput[post.id]" 
                @input="handleMentionInput(post.id, $event)"
                @keydown="handleMentionKeydown(post.id, $event)"
                rows="2"
              ></textarea>
              <button class="btn btn-primary" @click="submitComment(post.id)">Comment</button>
            </div>
            <!-- Mention Suggestions Dropdown -->
            <div 
              v-if="getMentionSuggestions(post.id) && getMentionSuggestions(post.id).length > 0"
              class="mention-suggestions"
              :style="getMentionDropdownStyle()"
            >
              <div 
                v-for="(user, index) in getMentionSuggestions(post.id)" 
                :key="user.id"
                class="mention-suggestion-item"
                :class="{ active: (mentionSelectedIndex[post.id] || 0) === index }"
                @click="selectMention(post.id, user)"
                @mouseenter="mentionSelectedIndex[post.id] = index"
              >
                <i class="fas fa-user-circle me-2 text-primary"></i>
                <span class="fw-bold">{{ user.name }}</span>
                <span class="text-muted small ms-2">@{{ user.username }}</span>
              </div>
            </div>
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
      userLikes: {}, // Track which posts user has liked
      openComments: {}, // Track which posts' comments are open
      commentsByPost: {}, // postId -> comments[]
      commentInput: {}, // postId -> current input string
      mentionSuggestions: {}, // postId -> user[]
      mentionSelectedIndex: {}, // postId -> selected index
      mentionCaretPosition: {}, // postId -> caret position
      allUsers: [], // Cache all users for mention display
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
          // Track user likes
          this.posts.forEach(post => {
          if (post.likes && post.likes.length > 0) {
            const userLiked = post.likes.some(like => like.userId === this.currentUserId);
            this.userLikes[post.id] = userLiked; // Directly mutating the userLikes object
          }
          // Initialize comments from post data
          if (post.comments) {
            this.$set ? this.$set(this.commentsByPost, post.id, post.comments) : (this.commentsByPost[post.id] = post.comments);
          }
        });

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
    isPostLiked(postId) {
      return this.userLikes[postId] || false;
    },
    getLikesCount(postId) {
      const post = this.posts.find(p => p.id === postId);
      return post && post.likes ? post.likes.length : 0;
    },
    getCommentsCount(postId) {
      const comments = this.commentsByPost[postId];
      return comments ? comments.length : 0;
    },
    isCommentsOpen(postId) {
      return !!this.openComments[postId];
    },
    async toggleComments(postId) {
      this.openComments[postId] = !this.openComments[postId];
      if (this.openComments[postId] && !this.commentsByPost[postId]) {
        await this.loadComments(postId);
      }
    },
    async loadComments(postId) {
      try {
        const response = await fetch(`http://localhost:3000/feed/posts/${postId}/comments`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.ok) {
          const comments = await response.json();
          this.$set ? this.$set(this.commentsByPost, postId, comments) : (this.commentsByPost[postId] = comments);
        }
      } catch (error) {
        console.error('Comments load error:', error);
      }
    },
    async submitComment(postId) {
      const content = (this.commentInput[postId] || '').trim();
      if (!content) return;
      try {
        const response = await fetch(`http://localhost:3000/feed/posts/${postId}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ content }),
        });
        if (response.ok) {
          const newComment = await response.json();
          const existing = this.commentsByPost[postId] || [];
          existing.push(newComment);
          if (this.$set) {
            this.$set(this.commentsByPost, postId, existing);
          } else {
            this.commentsByPost[postId] = existing;
          }
          this.commentInput[postId] = '';
          // eslint-disable-next-line no-undef
          toastr.success('Comment added successfully!', 'Success');
        } else {
          const err = await response.json();
          // eslint-disable-next-line no-undef
          toastr.error(err.message || 'Failed to add comment', 'Error');
        }
      } catch (error) {
        console.error('Add comment error:', error);
        // eslint-disable-next-line no-undef
        toastr.error('Network error. Please try again.', 'Error');
      }
    },
    async toggleLike(postId) {
      try {
        const response = await fetch(`http://localhost:3000/feed/posts/${postId}/like`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          // Update local state
          this.userLikes[postId] = result.liked;  // Directly modify the userLikes object

          // Update likes count in post
          const post = this.posts.find(p => p.id === postId);
          if (post) {
            post.likes = result.liked 
              ? [...(post.likes || []), { userId: this.currentUserId }]  // Add like if not already liked
              : (post.likes || []).filter(like => like.userId !== this.currentUserId); // Remove like if already liked
          }

        } else {
          // eslint-disable-next-line no-undef
          toastr.error('Failed to toggle like', 'Error');
        }
      } catch (error) {
        console.error('Like toggle error:', error);
        // eslint-disable-next-line no-undef
        toastr.error('Network error. Please try again.', 'Error');
      }
    },
    async sharePost(postId) {
      try {
        const response = await fetch(`http://localhost:3000/feed/posts/${postId}/share`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          // eslint-disable-next-line no-undef
          toastr.success('Post shared successfully!', 'Success');
          this.loadPosts(); // Reload posts to show the new shared post
        } else {
          const errorData = await response.json();
          // eslint-disable-next-line no-undef
          toastr.error(errorData.message || 'Failed to share post', 'Error');
        }
      } catch (error) {
        console.error('Share error:', error);
        // eslint-disable-next-line no-undef
        toastr.error('Network error. Please try again.', 'Error');
      }
    },
    formatContentWithMentions(content) {
      if (!content) {
        return '';
      }
      
      // Escape HTML first
      let escaped = content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
      
      // Replace @username with styled mention
      // We'll style any @mention, and if we have mentionedUserIds, we know they're valid
      const mentionRegex = /@(\w+)/g;
      escaped = escaped.replace(mentionRegex, (match) => {
        return `<span class="mention-tag">${match}</span>`;
      });
      
      return escaped;
    },
    async handleMentionInput(postId, event) {
      const text = event.target.value || this.commentInput[postId] || '';
      const cursorPos = event.target.selectionStart || text.length;
      
      // Find @ symbol before cursor
      const textBeforeCursor = text.substring(0, cursorPos);
      const lastAtIndex = textBeforeCursor.lastIndexOf('@');
      
      if (lastAtIndex !== -1) {
        const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
        // Check if there's a space after @ (meaning mention ended) or another @
        if (!textAfterAt.includes(' ') && !textAfterAt.includes('@')) {
          const query = textAfterAt.trim();
          // Show suggestions even for just '@' now that backend supports empty query
          await this.searchUsersForMention(postId, query);
          return;
        }
      }
      
      // Hide suggestions if no valid mention
      this.mentionSuggestions[postId] = [];
    },
    handleMentionKeydown(postId, event) {
      // Check if '@' was just pressed
      if (event.key === '@' || event.keyCode === 64 || (event.shiftKey && event.keyCode === 50)) {
        // Trigger mention input handler after a brief delay to let the '@' be added to the input
        setTimeout(() => {
          this.handleMentionInput(postId, event);
        }, 50);
      }
      
      const suggestions = this.mentionSuggestions[postId];
      if (!suggestions || suggestions.length === 0) return;
      
      const selectedIdx = this.mentionSelectedIndex[postId] || 0;
      
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        const nextIdx = (selectedIdx + 1) % suggestions.length;
        this.mentionSelectedIndex[postId] = nextIdx;
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        const prevIdx = selectedIdx === 0 ? suggestions.length - 1 : selectedIdx - 1;
        this.mentionSelectedIndex[postId] = prevIdx;
      } else if (event.key === 'Enter' && suggestions.length > 0) {
        event.preventDefault();
        const user = suggestions[selectedIdx];
        this.selectMention(postId, user);
      } else if (event.key === 'Escape') {
        this.mentionSuggestions[postId] = [];
      }
    },
    async searchUsersForMention(postId, query) {
      try {
        // If query is empty, still search to show recent/all users
        const searchQuery = query || '';
        const url = `http://localhost:3000/auth/search?q=${encodeURIComponent(searchQuery)}&limit=5`;
        
        console.log('Searching users for mention:', query, 'URL:', url);
        
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (response.ok) {
          const users = await response.json();
          console.log('Received users:', users);
          
          // Filter out current user from suggestions
          const filteredUsers = users.filter(u => u.id !== this.currentUserId);
          console.log('Filtered users:', filteredUsers, 'for postId:', postId);
          
          // Ensure reactivity in Vue 3 - create new object reference
          this.mentionSuggestions = {
            ...this.mentionSuggestions,
            [postId]: filteredUsers
          };
          this.mentionSelectedIndex = {
            ...this.mentionSelectedIndex,
            [postId]: 0
          };
          
          console.log('Updated mentionSuggestions:', this.mentionSuggestions[postId]);
          console.log('Full mentionSuggestions object:', this.mentionSuggestions);
          
          // Force Vue to re-render
          this.$forceUpdate();
        } else {
          console.error('Search failed:', response.status);
          const errorText = await response.text();
          console.error('Error details:', errorText);
        }
      } catch (error) {
        console.error('User search error:', error);
      }
    },
    selectMention(postId, user) {
      const textarea = document.getElementById(`comment-input-${postId}`);
      if (!textarea) return;
      
      const text = this.commentInput[postId] || '';
      const cursorPos = textarea.selectionStart;
      const textBeforeCursor = text.substring(0, cursorPos);
      const lastAtIndex = textBeforeCursor.lastIndexOf('@');
      
      if (lastAtIndex !== -1) {
        const beforeAt = text.substring(0, lastAtIndex);
        const afterCursor = text.substring(cursorPos);
        const newText = `${beforeAt}@${user.username} ${afterCursor}`;
        
        this.commentInput[postId] = newText;
        
        // Hide suggestions
        this.mentionSuggestions[postId] = [];
        
        // Set cursor position after mention
        this.$nextTick(() => {
          const newPos = lastAtIndex + user.username.length + 2; // @ + username + space
          textarea.focus();
          textarea.setSelectionRange(newPos, newPos);
        });
      }
    },
    getMentionSuggestions(postId) {
      return this.mentionSuggestions && this.mentionSuggestions[postId] ? this.mentionSuggestions[postId] : [];
    },
    getMentionDropdownStyle() {
      // Simple positioning - can be enhanced
      return {
        position: 'absolute',
        zIndex: 1000,
        marginTop: '-10px',
      };
    },
    async loadAllUsers() {
      // Load users from posts data to display mentions
      try {
        const userIds = new Set();
        this.posts.forEach(post => {
          if (post.mentionedUserIds) {
            post.mentionedUserIds.forEach(id => userIds.add(id));
          }
          if (post.comments) {
            post.comments.forEach(comment => {
              if (comment.mentionedUserIds) {
                comment.mentionedUserIds.forEach(id => userIds.add(id));
              }
            });
          }
        });
        
        // For now, we'll fetch users as needed from comments/posts
        // This can be optimized later with a batch endpoint
      } catch (error) {
        console.error('Error loading users:', error);
      }
    },
  },
};
</script>

<style scoped>
/* Mention styles need to be global or use deep selector */
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
  border: 1px solid #4A90E2;
  box-shadow: 0 2px 8px rgba(74, 144, 226, 0.15);
  background: #FFFFFF;
}

.btn-primary {
  background-color: #4A90E2;
  border-color: #4A90E2;
  color: #FFFFFF;
}

.btn-primary:hover {
  background-color: #357ABD;
  border-color: #357ABD;
}

.btn-link:hover {
  color: #4A90E2 !important;
}

.user-avatar i {
  color: #4A90E2;
}

.post-actions .btn {
  transition: all 0.2s;
}

.post-actions .btn:hover {
  transform: translateY(-2px);
}

.modal-content {
  border: 1px solid #4A90E2;
}

.btn-close {
  filter: brightness(0);
}

.form-control:focus {
  border-color: #4A90E2;
  box-shadow: 0 0 0 0.2rem rgba(43, 32, 37, 0.25);
}

/* Use deep selector to style v-html content */
::v-deep(.mention-tag),
::v-deep .mention-tag {
  color: #1DA1F2 !important;
  font-weight: 700 !important;
  cursor: pointer;
  background-color: #E8F4F8 !important;
  padding: 2px 6px !important;
  border-radius: 4px !important;
  text-decoration: none !important;
  display: inline-block !important;
  transition: all 0.2s ease;
}

::v-deep(.mention-tag:hover),
::v-deep .mention-tag:hover {
  background-color: #1DA1F2 !important;
  color: white !important;
  text-decoration: none !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(29, 161, 242, 0.3) !important;
}

.mention-input-container {
  position: relative;
}

.mention-suggestions {
  position: absolute;
  bottom: calc(100% + 5px);
  left: 0;
  right: 75px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 5px;
  z-index: 1050;
  width: auto;
  min-width: 250px;
}

.mention-suggestion-item {
  padding: 10px 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}

.mention-suggestion-item:last-child {
  border-bottom: none;
}

.mention-suggestion-item:hover,
.mention-suggestion-item.active {
  background-color: #f0f7ff;
}

.mention-textarea {
  resize: vertical;
}
</style>

<style>
/* Global styles for mention tags in v-html content */
.mention-tag {
  color: #1DA1F2 !important;
  font-weight: 700 !important;
  cursor: pointer;
  background-color: #E8F4F8 !important;
  padding: 2px 6px !important;
  border-radius: 4px !important;
  text-decoration: none !important;
  display: inline-block !important;
  transition: all 0.2s ease;
}

.mention-tag:hover {
  background-color: #1DA1F2 !important;
  color: white !important;
  text-decoration: none !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(29, 161, 242, 0.3) !important;
}
</style>
