<template>
  <div class="feed-container">
    <div class="feed-layout">
      <!-- Left Sidebar: Users List -->
      <aside class="feed-sidebar sidebar-left">
        <UsersList />
      </aside>
      
      <!-- Center: Feed Content -->
      <main class="feed-main">
        <div class="feed-header">
          <i class="fas fa-home feed-icon"></i>
          <h2 class="feed-title">Feed</h2>
        </div>
        
        <CreatePost @postCreated="handlePostCreated" />
        
        <PostList ref="postList" />
      </main>
      
      <!-- Right Sidebar: Trending Posts -->
      <aside class="feed-sidebar sidebar-right">
        <TrendingPosts />
      </aside>
    </div>
  </div>
</template>

<script>
import CreatePost from '../feed/CreatePost.vue';
import PostList from '../feed/PostList.vue';
import UsersList from '../feed/UsersList.vue';
import TrendingPosts from '../feed/TrendingPosts.vue';

export default {
  name: 'UserFeed',
  components: {
    CreatePost,
    PostList,
    UsersList,
    TrendingPosts,
  },
  methods: {
    handlePostCreated() {
      // post will be updated in the post list
      this.$refs.postList.loadPosts();
    },
  },
};
</script>

<style scoped>
.feed-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
  padding-top: calc(70px + 1.5rem);
  position: relative;
}

.feed-layout {
  display: grid;
  grid-template-columns: 280px 1fr 280px;
  gap: 1.5rem;
  align-items: start;
  min-height: calc(100vh - 3rem);
}

.feed-sidebar {
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: fit-content;
}

.feed-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.feed-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.feed-icon {
  font-size: 1.5rem;
  color: var(--accent-primary);
}

.feed-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .feed-layout {
    grid-template-columns: 260px 1fr;
  }
  
  .sidebar-right {
    display: none;
  }
}

@media (max-width: 768px) {
  .feed-container {
    padding: 1rem;
  }
  
  .feed-layout {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .feed-sidebar {
    position: relative;
    top: 0;
    max-height: none;
  }
  
  .feed-main {
    order: -1;
  }
  
  .sidebar-left {
    order: 1;
  }
}
</style>
