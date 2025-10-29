<template>
  <div class="trending-container">
    <div class="trending-header">
      <div class="header-icon">
        <i class="fas fa-fire"></i>
      </div>
      <h3 class="header-title">Trending</h3>
    </div>
    
    <div v-if="loading" class="loading-state">
      <div class="spinner-small"></div>
      <span>Loading...</span>
    </div>
    
    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-circle"></i>
      <span>{{ error }}</span>
    </div>
    
    <div v-else-if="posts.length === 0" class="empty-state">
      <i class="fas fa-fire"></i>
      <span>No trending posts yet</span>
    </div>
    
    <div v-else class="trending-posts-wrapper">
      <div class="trending-posts" :class="{ 'auto-scroll': posts.length > 5 }">
        <!-- First set of posts -->
        <div 
          v-for="(post, index) in posts" 
          :key="post.id" 
          class="trending-item"
          :class="{ 'highlight': index < 3 }"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="trending-rank">
            <span class="rank-number">{{ index + 1 }}</span>
          </div>
          <div class="trending-content">
            <div class="trending-author">
              <div class="author-avatar-mini">
                <i class="fas fa-user"></i>
              </div>
              <span class="author-name">{{ post.user?.name || 'Unknown' }}</span>
            </div>
            <div class="trending-text" :title="post.content">
              {{ truncateText(post.content, 80) }}
            </div>
            <div class="trending-stats">
              <span class="stat-item">
                <i class="fas fa-heart"></i>
                <span>{{ getLikesCount(post) }}</span>
              </span>
              <span class="stat-item">
                <i class="fas fa-comment"></i>
                <span>{{ getCommentsCount(post) }}</span>
              </span>
              <span class="stat-item engagement-score">
                <i class="fas fa-chart-line"></i>
                <span>{{ getEngagementScore(post) }}</span>
              </span>
            </div>
          </div>
        </div>
        
        <!-- Duplicate items for seamless loop -->
        <div 
          v-for="(post, index) in posts" 
          :key="`duplicate-${post.id}`" 
          class="trending-item duplicate"
          :style="{ animationDelay: `${(posts.length + index) * 0.1}s` }"
        >
          <div class="trending-rank">
            <span class="rank-number">{{ index + 1 }}</span>
          </div>
          <div class="trending-content">
            <div class="trending-author">
              <div class="author-avatar-mini">
                <i class="fas fa-user"></i>
              </div>
              <span class="author-name">{{ post.user?.name || 'Unknown' }}</span>
            </div>
            <div class="trending-text" :title="post.content">
              {{ truncateText(post.content, 80) }}
            </div>
            <div class="trending-stats">
              <span class="stat-item">
                <i class="fas fa-heart"></i>
                <span>{{ getLikesCount(post) }}</span>
              </span>
              <span class="stat-item">
                <i class="fas fa-comment"></i>
                <span>{{ getCommentsCount(post) }}</span>
              </span>
              <span class="stat-item engagement-score">
                <i class="fas fa-chart-line"></i>
                <span>{{ getEngagementScore(post) }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import apiConfig from '@/config/api';

export default {
  name: 'TrendingPosts',
  data() {
    return {
      posts: [],
      loading: true,
      error: null,
      refreshInterval: null,
    };
  },
  mounted() {
    this.loadTrendingPosts();
    // Auto-refresh every 30 seconds
    this.refreshInterval = setInterval(() => {
      this.loadTrendingPosts();
    }, 30000);
  },
  beforeUnmount() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  },
  methods: {
    async loadTrendingPosts() {
      try {
        const response = await fetch(apiConfig.feed.trending, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          this.posts = data || [];
          this.loading = false;
        } else {
          this.error = 'Failed to load trending posts';
          this.loading = false;
        }
      } catch (error) {
        console.error('Error loading trending posts:', error);
        this.error = 'Network error';
        this.loading = false;
      }
    },
    getLikesCount(post) {
      return post.likes ? post.likes.length : 0;
    },
    getCommentsCount(post) {
      return post.comments ? post.comments.length : 0;
    },
    getEngagementScore(post) {
      const likes = this.getLikesCount(post);
      const comments = this.getCommentsCount(post);
      return likes + comments;
    },
    truncateText(text, maxLength) {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    },
  },
};
</script>

<style scoped>
.trending-container {
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

.trending-header {
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
  background: linear-gradient(135deg, #FF6B6B, #FF8E53);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.125rem;
  animation: fire-flicker 2s ease-in-out infinite;
}

@keyframes fire-flicker {
  0%, 100% {
    box-shadow: 0 0 10px rgba(255, 107, 107, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 107, 107, 0.8);
  }
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
  border-top-color: #FF6B6B;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.trending-posts-wrapper {
  position: relative;
  overflow: hidden;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.trending-posts {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: transform 0.3s ease;
}

.trending-posts.auto-scroll {
  animation: scroll-down 30s linear infinite;
}

.trending-posts-wrapper:hover .trending-posts.auto-scroll {
  animation-play-state: paused;
}

@keyframes scroll-down {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-50%);
  }
}

.trending-item.duplicate {
  opacity: 0.8;
}

.trending-item {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 16px;
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  transition: all 0.3s ease;
  animation: slide-in 0.5s ease-out;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.trending-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  transition: left 0.5s ease;
}

.trending-item:hover::before {
  left: 100%;
}

.trending-item:hover {
  background: var(--bg-tertiary);
  border-color: var(--accent-primary);
  transform: translateX(4px);
  box-shadow: var(--shadow-md);
}

.trending-item.highlight {
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(255, 142, 83, 0.1));
  border-color: #FF6B6B;
}

.trending-item.highlight::after {
  content: '🔥';
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  font-size: 1rem;
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.trending-rank {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rank-number {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: var(--accent-gradient);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  box-shadow: var(--shadow-sm);
}

.trending-item.highlight .rank-number {
  background: linear-gradient(135deg, #FF6B6B, #FF8E53);
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.7);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(255, 107, 107, 0);
  }
}

.trending-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.trending-author {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.author-avatar-mini {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-size: 0.75rem;
  border: 1px solid var(--border-color);
}

.author-name {
  font-weight: 600;
  font-size: 0.8125rem;
  color: var(--text-primary);
}

.trending-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.trending-stats {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 600;
}

.stat-item i {
  font-size: 0.6875rem;
  color: var(--text-tertiary);
}

.stat-item.engagement-score {
  color: var(--accent-primary);
  font-weight: 700;
}

.stat-item.engagement-score i {
  color: var(--accent-primary);
}

/* Custom Scrollbar */
.trending-container::-webkit-scrollbar {
  width: 6px;
}

.trending-container::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: 10px;
}

.trending-container::-webkit-scrollbar-thumb {
  background: var(--text-tertiary);
  border-radius: 10px;
}

.trending-container::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}
</style>

