import Vue from 'vue'
import VueRouter from 'vue-router'
// main page //
// import register from '@/components/register'
Vue.use(VueRouter)

const routes = [
  {
    name: "login",
    path: "/login",
    component: () => {import('@/components/login')}
  },
  {
    name: "register",
    path: "/register",
    component: function(){ return import("@/components/register") }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
