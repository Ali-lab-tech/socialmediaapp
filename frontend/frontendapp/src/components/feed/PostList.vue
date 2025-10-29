<template>
  <div class="posts-container">
    <div v-if="loading" class="loading-container">
      <div class="spinner-modern"></div>
      <p class="loading-text">Loading posts...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
    </div>
    
    <div v-else-if="posts.length === 0" class="empty-state">
      <div class="empty-icon">
        <i class="fas fa-comments"></i>
      </div>
      <h3>No posts yet</h3>
      <p>Be the first to share something amazing!</p>
    </div>
    
    <div v-else class="posts-grid">
      <article class="post-card" v-for="post in posts" :key="post.id">
        <div class="post-header">
          <div class="post-author">
            <div class="author-avatar">
              <div class="avatar-inner">
                <i class="fas fa-user"></i>
              </div>
            </div>
            <div class="author-info">
              <h4 class="author-name">{{ post.user ? post.user.name : 'Unknown User' }}</h4>
              <span class="post-time">{{ formatDate(post.createdAt) }}</span>
            </div>
          </div>
          
          <div v-if="isOwnPost(post.userId)" class="post-menu">
            <button
              class="menu-btn"
              type="button"
              @click="toggleMenu(post.id)"
              :id="'menu-' + post.id"
            >
              <i class="fas fa-ellipsis-h"></i>
            </button>
            <div v-if="openMenus[post.id]" class="menu-dropdown" @click.stop>
              <button class="menu-item" @click="editPost(post); closeMenu(post.id)">
                <i class="fas fa-edit"></i>
                <span>Edit</span>
              </button>
              <button class="menu-item danger" @click="deletePost(post.id); closeMenu(post.id)">
                <i class="fas fa-trash"></i>
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
        
        <div class="post-body">
          <div class="post-text" v-html="formatContentWithMentions(post.content)"></div>
          <div v-if="post.imageUrl" class="post-image-wrapper">
            <img :src="getImageUrl(post.imageUrl)" alt="Post image" class="post-image" />
          </div>
        </div>
        
        <div class="post-footer">
          <button 
            class="action-btn" 
            :class="{ active: isPostLiked(post.id) }"
            @click="toggleLike(post.id)"
          >
            <i :class="isPostLiked(post.id) ? 'fas fa-heart' : 'far fa-heart'"></i>
            <span>{{ getLikesCount(post.id) }}</span>
          </button>

          <button 
            class="action-btn"
            :class="{ active: isCommentsOpen(post.id) }"
            @click="toggleComments(post.id)"
            title="Comments"
          >
            <i class="far fa-comment"></i>
            <span>{{ getCommentsCount(post.id) }}</span>
          </button>

          <button 
            v-if="!isOwnPost(post.userId)"
            class="action-btn" 
            @click="sharePost(post.id)"
            title="Share Post"
          >
            <i class="fas fa-share"></i>
            <span>Share</span>
          </button>
        </div>

        <!-- Comments Section -->
        <div v-if="isCommentsOpen(post.id)" class="comments-section">
          <div class="comments-list" v-if="commentsByPost[post.id] && commentsByPost[post.id].length">
            <div v-for="comment in commentsByPost[post.id]" :key="comment.id" class="comment-item">
              <div class="comment-avatar">
                <div class="avatar-small">
                  <i class="fas fa-user"></i>
                </div>
              </div>
              <div class="comment-content">
                <div class="comment-header">
                  <strong class="comment-author">{{ comment.user?.name || 'Unknown' }}</strong>
                  <span class="comment-time">{{ formatDate(comment.createdAt) }}</span>
                </div>
                <div class="comment-text" v-html="formatContentWithMentions(comment.content)"></div>
              </div>
            </div>
          </div>
          <div v-else class="no-comments">
            <i class="fas fa-comment-dots"></i>
            <p>No comments yet. Be the first to comment.</p>
          </div>

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
              <button class="btn-comment" @click="submitComment(post.id)">
                <i class="fas fa-paper-plane me-1"></i>Comment
              </button>
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
                <i class="fas fa-user-circle"></i>
                <div class="mention-user-info">
                  <span class="mention-user-name">{{ user.name }}</span>
                  <span class="mention-username">@{{ user.username }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        
      </article>
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
      openMenus: {}, // Track which post menus are open
    };
  },
  mounted() {
    this.loadPosts();
    this.loadCurrentUser();
    // Close menus when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.post-menu')) {
        Object.keys(this.openMenus).forEach(id => {
          this.openMenus[id] = false;
        });
      }
    });
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
    toggleMenu(postId) {
      this.openMenus[postId] = !this.openMenus[postId];
      // Close other menus
      Object.keys(this.openMenus).forEach(id => {
        if (id != postId) {
          this.openMenus[id] = false;
        }
      });
    },
    closeMenu(postId) {
      this.openMenus[postId] = false;
    },
  },
};
</script>

<style scoped>
.posts-container {
  width: 100%;
  margin: 0;
  padding: 0;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
}

.spinner-modern {
  width: 50px;
  height: 50px;
  border: 4px solid var(--bg-tertiary);
  border-top: 4px solid var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 1rem;
  color: var(--text-secondary);
  font-weight: 500;
}

/* Error State */
.error-container {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--error);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  color: var(--error);
}

.error-container i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--bg-card);
  border-radius: 24px;
  box-shadow: var(--shadow-lg);
}

.empty-icon {
  width: 100px;
  height: 100px;
  margin: 0 auto 1.5rem;
  background: var(--accent-gradient);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2.5rem;
}

.empty-state h3 {
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--text-secondary);
  font-size: 1rem;
}

/* Posts Grid */
.posts-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Post Card */
.post-card {
  background: var(--bg-card);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
  position: relative;
}

.post-card:hover {
  box-shadow: var(--shadow-xl);
  transform: translateY(-2px);
}

/* Post Header */
.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.author-avatar {
  position: relative;
}

.avatar-inner {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--accent-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  box-shadow: var(--shadow-md);
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.2;
}

.post-time {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

/* Post Menu */
.post-menu {
  position: relative;
}

.menu-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.menu-btn:hover {
  background: var(--accent-primary);
  color: white;
}

.menu-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: var(--shadow-xl);
  min-width: 160px;
  overflow: hidden;
  z-index: 100;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  width: 100%;
  border: none;
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  text-align: left;
}

.menu-item:hover {
  background: var(--bg-secondary);
  color: var(--accent-primary);
}

.menu-item.danger {
  color: var(--error);
}

.menu-item.danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--error);
}

.menu-item i {
  width: 18px;
}

/* Post Body */
.post-body {
  margin-bottom: 1.25rem;
}

.post-text {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.post-image-wrapper {
  border-radius: 16px;
  overflow: hidden;
  margin-top: 1rem;
}

.post-image {
  width: 100%;
  max-height: 500px;
  object-fit: cover;
  display: block;
}

/* Post Footer */
.post-footer {
  display: flex;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--bg-secondary);
  color: var(--accent-primary);
}

.action-btn.active {
  color: var(--accent-primary);
  background: rgba(99, 102, 241, 0.1);
}

.action-btn.active i.fa-heart {
  color: var(--error) !important;
}

.action-btn.active i.fa-comment {
  color: var(--accent-primary) !important;
}

/* Comments Section */
.comments-section {
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--border-color);
}

.comments-list {
  margin-bottom: 1.25rem;
}

.comment-item {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.comment-item:hover {
  background: var(--bg-secondary);
}

.comment-avatar {
  flex-shrink: 0;
}

.avatar-small {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--accent-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.875rem;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.375rem;
}

.comment-author {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-primary);
}

.comment-time {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.comment-text {
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--text-primary);
}

.no-comments {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.no-comments i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

/* Comment Input */
.mention-input-container {
  position: relative;
  margin-top: 1rem;
}

.input-group {
  display: flex;
  gap: 0.5rem;
}

.mention-textarea,
.form-control {
  flex: 1;
  padding: 0.875rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 0.875rem;
  resize: vertical;
  transition: all 0.2s ease;
}

.mention-textarea:focus,
.form-control:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

/* Mention Suggestions */
.mention-suggestions {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  right: 90px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  box-shadow: var(--shadow-xl);
  max-height: 250px;
  overflow-y: auto;
  z-index: 1000;
  min-width: 280px;
}

.mention-suggestion-item {
  padding: 0.875rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.mention-suggestion-item:last-child {
  border-bottom: none;
}

.mention-suggestion-item:hover,
.mention-suggestion-item.active {
  background: var(--bg-secondary);
}

.mention-suggestion-item i {
  color: var(--accent-primary);
  font-size: 1.25rem;
  flex-shrink: 0;
}

.mention-user-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.mention-user-name {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.mention-username {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.mention-textarea {
  resize: vertical;
  min-height: 80px;
}

.btn-comment {
  padding: 0.875rem 1.5rem;
  background: var(--accent-gradient);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-comment:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-comment:active {
  transform: translateY(0);
}

/* Modal Styles */
.modal-content {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  color: var(--text-primary);
}

.modal-header {
  border-bottom: 1px solid var(--border-color);
}

.modal-footer {
  border-top: 1px solid var(--border-color);
}

.btn-primary {
  background: var(--accent-gradient);
  border: none;
  color: white;
  font-weight: 600;
  padding: 0.625rem 1.5rem;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-secondary {
  background: var(--bg-tertiary);
  border: none;
  color: var(--text-primary);
  padding: 0.625rem 1.5rem;
  border-radius: 12px;
}

.btn-close {
  filter: brightness(0);
  opacity: 0.5;
}

@media (max-width: 768px) {
  .posts-container {
    padding: 1rem 0.5rem;
  }
  
  .post-card {
    padding: 1.25rem;
  }
}
</style>

<style>
/* Global styles for mention tags in v-html content - supports dark mode */
.mention-tag {
  color: var(--mention-color) !important;
  font-weight: 700 !important;
  cursor: pointer;
  background-color: var(--mention-bg) !important;
  padding: 3px 8px !important;
  border-radius: 8px !important;
  text-decoration: none !important;
  display: inline-block !important;
  transition: all 0.2s ease;
  margin: 0 2px;
}

.mention-tag:hover {
  background-color: var(--mention-hover-bg) !important;
  color: var(--mention-hover-color) !important;
  text-decoration: none !important;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md) !important;
}
</style>

