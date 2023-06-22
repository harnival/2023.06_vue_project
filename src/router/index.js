import Vue from 'vue'
import VueRouter from 'vue-router'
// main page //
import feed from '@/components/feed'
import account from '@/components/account'

Vue.use(VueRouter)

const routes = [
  ,{
    name: "feed"
    ,path: "/feed"
    ,component: feed
  }
  ,{
    name: "account"
    ,path: "/account"
    ,component : account
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
