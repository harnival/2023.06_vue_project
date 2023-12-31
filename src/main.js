import { createApp } from 'vue'
import App from './App.vue'
import router from './router/router.js'
import store from './store/store.js'
import './registerServiceWorker'



createApp(App)
  .use(router)
  .use(store)
  .mount('#app')
