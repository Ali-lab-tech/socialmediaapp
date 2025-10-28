<template>
  <div class="container mt-4">
    <div class="row">
      <div class="col-md-8 mx-auto">
        <h2 class="mb-4">
          <i class="fas fa-home me-2"></i>Feed
        </h2>
        
        <CreatePost @postCreated="handlePostCreated" />
        
        
        <PostList ref="postList" />
      </div>
    </div>
  </div>
</template>

<script>
import CreatePost from '../feed/CreatePost.vue';
import PostList from '../feed/PostList.vue';

export default {
  name: 'UserFeed',
  components: {
    CreatePost,
    PostList,
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


.fa-home {
  color: #4A90E2;
}
</style>
