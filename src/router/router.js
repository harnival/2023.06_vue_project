import { createWebHistory, createRouter } from "vue-router";
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
  },{
    name: 'main',
    path: '/',
    component: () => import('../components/main.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;