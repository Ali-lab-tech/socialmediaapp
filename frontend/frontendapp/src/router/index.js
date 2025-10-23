import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../components/auth/login.vue'
import RegisterPage from '../components/auth/register.vue'
import userFeed from '../components/user/userFeed.vue'
import ProfileUpdate from '../components/user/profileUpdate.vue'


const routes = [
  {
    path: '/',
    name: 'Home',
    component: LoginPage
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage
  },
  {
    path: '/user-feed',
    name: 'UserFeed',
    component: userFeed
  },
  {
    path: '/profile-update',
    name: 'ProfileUpdate',
    component: ProfileUpdate
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
