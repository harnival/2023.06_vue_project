import Vue from 'vue'
import VueRouter from 'vue-router'
// main page //
import feed from '@/components/feed'

Vue.use(VueRouter)

const routes = [
  ,{
    name: "feed"
    ,path: "/feed"
    ,component: feed
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
