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
    component: () => import('../components/login.vue'),
  },{
    name: 'main',
    path: '/',
    component: () => import('../components/main.vue')
  },{
    name: 'account',
    path: '/account/:ids',
    component: () => import('../components/account.vue')
  },{
    name: 'player',
    path: '/player/:listkey',
    component: () => import('../components/player.vue')
  },{
    name: 'setting',
    path: '/setting',
    component: () => import('../components/settings.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});


export default router;