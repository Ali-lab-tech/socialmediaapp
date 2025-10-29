// API Configuration
// This file centralizes all API endpoint URLs

const API_BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000';

export default {
  baseURL: API_BASE_URL,
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    profile: `${API_BASE_URL}/auth/profile`,
    search: `${API_BASE_URL}/auth/search`,
    activity: `${API_BASE_URL}/auth/activity`,
  },
  feed: {
    posts: `${API_BASE_URL}/feed/posts`,
    postById: (id) => `${API_BASE_URL}/feed/posts/${id}`,
    like: (id) => `${API_BASE_URL}/feed/posts/${id}/like`,
    share: (id) => `${API_BASE_URL}/feed/posts/${id}/share`,
    comments: (id) => `${API_BASE_URL}/feed/posts/${id}/comments`,
    trending: `${API_BASE_URL}/feed/posts/trending`,
  },
  getImageUrl(imageUrl) {
    if (!imageUrl) return '';
    // If imageUrl already includes http:// or https://, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    // Otherwise, prepend the backend URL
    return `${API_BASE_URL}${imageUrl}`;
  },
};

