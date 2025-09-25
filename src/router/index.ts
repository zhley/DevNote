import { createRouter, createWebHistory } from 'vue-router'
import CommandWindow from '../views/CommandWindow.vue'
import EditorWindow from '../views/EditorWindow.vue'

const routes = [
  {
    path: '/command',
    component: CommandWindow
  },
  {
    path: '/editor',
    component: EditorWindow
  },
  {
    path: '/',
    redirect: '/command' // 默认重定向，但主窗口不会用到
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router