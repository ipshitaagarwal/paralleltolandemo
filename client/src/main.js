import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import SingleQuery from './views/SingleQuery.vue'
import TestSuite from './views/TestSuite.vue'
import Settings from './views/Settings.vue'

const routes = [
  { path: '/', component: SingleQuery },
  { path: '/suite', component: TestSuite },
  { path: '/suite/:id', component: TestSuite, props: true },
  { path: '/settings', component: Settings }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

createApp(App).use(router).mount('#app')
