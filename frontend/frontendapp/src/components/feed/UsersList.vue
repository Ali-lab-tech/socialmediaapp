<template>
  <div class="users-list-container">
    <div class="users-list-header">
      <div class="header-icon">
        <i class="fas fa-chart-line"></i>
      </div>
      <h3 class="header-title">Activity</h3>
    </div>
    
    <div v-if="loading" class="loading-state">
      <div class="spinner-small"></div>
      <span>Loading activity...</span>
    </div>
    
    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-circle"></i>
      <span>{{ error }}</span>
    </div>
    
    <div v-else-if="users.length === 0" class="empty-state">
      <i class="fas fa-user-slash"></i>
      <span>No activity yet</span>
    </div>
    
    <div v-else class="users-list">
      <div 
        v-for="user in users" 
        :key="user.id" 
        class="user-item"
        :class="{ 'current-user': isCurrentUser(user.id), 'top-activity': user.postCount > 0 }"
      >
        <div class="user-avatar">
          <div class="avatar-inner">
            <i class="fas fa-user"></i>
          </div>
        </div>
        <div class="user-info">
          <div class="user-name">{{ user.name }}</div>
          <div class="user-username">@{{ user.username }}</div>
        </div>
        <div class="user-activity">
          <div class="post-count-badge" :class="{ 'high-activity': user.postCount >= 10, 'medium-activity': user.postCount >= 5 && user.postCount < 10 }">
            <i class="fas fa-file-alt"></i>
            <span>{{ user.postCount }}</span>
          </div>
          <div v-if="isCurrentUser(user.id)" class="user-badge">
            <i class="fas fa-check-circle"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import apiConfig from '@/config/api';

export default {
  name: 'UsersList',
  data() {
    return {
      users: [],
      loading: true,
      error: null,
      currentUserId: null,
    };
  },
  mounted() {
    this.loadCurrentUser();
    this.loadUsers();
  },
  methods: {
    loadCurrentUser() {
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const userData = JSON.parse(user);
          this.currentUserId = userData.id;
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
    },
    async loadUsers() {
      this.loading = true;
      this.error = null;
      try {
        const response = await fetch(`${apiConfig.auth.activity}?limit=50`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          this.users = data || [];
        } else {
          this.error = 'Failed to load activity';
        }
      } catch (error) {
        console.error('Error loading activity:', error);
        this.error = 'Network error. Please try again.';
      } finally {
        this.loading = false;
      }
    },
    isCurrentUser(userId) {
      return this.currentUserId && this.currentUserId === userId;
    },
  },
};
</script>

<style scoped>
.users-list-container {
  background: var(--bg-card);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
  position: sticky;
  top: 70px;
  max-height: calc(100vh - 70px - 1rem);
  height: calc(100vh - 70px - 1rem);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  z-index: 100;
}

.users-list-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--border-color);
  flex-shrink: 0;
}

.header-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 12px;
  background: var(--accent-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.125rem;
}

.header-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.error-state {
  color: var(--error);
}

.empty-state {
  flex-direction: column;
  gap: 0.75rem;
}

.empty-state i {
  font-size: 2rem;
  opacity: 0.5;
}

.spinner-small {
  width: 1rem;
  height: 1rem;
  border: 2px solid var(--border-color);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
  overflow-y: auto;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 12px;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
}

.user-item:hover {
  background: var(--bg-secondary);
  transform: translateX(4px);
}

.user-item.current-user {
  background: var(--accent-gradient);
  background-size: 200% 200%;
  animation: gradient-shift 3s ease infinite;
}

.user-item.current-user .user-name,
.user-item.current-user .user-username {
  color: white;
}

@keyframes gradient-shift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.user-avatar {
  flex-shrink: 0;
}

.avatar-inner {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-size: 1.125rem;
  border: 2px solid var(--border-color);
}

.user-item.current-user .avatar-inner {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  color: white;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  font-size: 0.9375rem;
  color: var(--text-primary);
  margin-bottom: 0.125rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-username {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-activity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.post-count-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.625rem;
  border-radius: 12px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.post-count-badge.medium-activity {
  background: rgba(59, 130, 246, 0.15);
  color: #3B82F6;
}

.post-count-badge.high-activity {
  background: rgba(34, 197, 94, 0.15);
  color: #22C55E;
}

.post-count-badge i {
  font-size: 0.6875rem;
}

.user-item.top-activity .post-count-badge {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.user-badge {
  color: white;
  font-size: 1rem;
  flex-shrink: 0;
}

/* Custom Scrollbar */
.users-list-container::-webkit-scrollbar {
  width: 6px;
}

.users-list-container::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: 10px;
}

.users-list-container::-webkit-scrollbar-thumb {
  background: var(--text-tertiary);
  border-radius: 10px;
}

.users-list-container::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}
</style>

