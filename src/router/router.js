import { createWebHistory, createRouter } from "vue-router";
import logIn from '../components/login.vue'
const routes = [
  {
    name: "signIn",
    path: "/signIn",
    component: ()=>import('../components/signIn.vue')
  },
  {
    name: "logIn",
    path: "/logIn",
    component: () => import('../components/login.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;