import { createWebHistory, createRouter } from "vue-router";
const routes = [
  {
    name: "signUp",
    path: "/signUp",
    component: ()=>import('../components/signUp.vue')
  },
  {
    name: "logIn",
    path: "/logIn",
    component: () => import('../components/login.vue'),
  },{
    name: 'home',
    path: '/',
    component: () => import('../components/home.vue')
  },{
    name: 'account',
    path: '/account/:ids',
    component: () => import('../components/account.vue')
  },{
    name: 'player',
    path: '/player/:listkey',
    component: () => import('../components/player2.vue')
  },{
    name: 'setting',
    path: '/setting',
    component: () => import('../components/settings.vue')
  },{
    name: 'music',
    path: '/music',
    component: () => import('../components/music.vue')
  },{
    name: 'search',
    path: '/search/input=:words',
    component: () => import('../components/search.vue')
  },{
    name: 'maker',
    path: '/ml',
    component: () => import('../components/makelist.vue')
  },{
    name: 'edit',
    path: '/el/:listkey',
    component: () => import('../components/makelist.vue')
  },{
    name: 'error',
    path: '/:pathMatch(.*)*',
    component: () => import('../components/404.vue')
  }
];


const router = createRouter({
  history: createWebHistory(),
  routes,
});


export default router;