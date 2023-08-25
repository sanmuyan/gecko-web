import { createRouter, createWebHistory } from 'vue-router'
import CodeSearch from '@/views/CodeSearch.vue'
import UserLogin from '@/views/UserLogin.vue'
import OauthCallback from '@/views/OauthCallback.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    meta: {
      title: '代码搜索'
    },
    component: CodeSearch
  },
  {
    path: '/login',
    name: 'login',
    meta: {
      title: '登录'
    },
    component: UserLogin
  },
  {
    path: '/oauth/callback',
    name: 'oauth',
    meta: {
      title: '登录中...'
    },
    component: OauthCallback
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
