<template>
  <header>
    <div class="navBtn">
      
    </div>
  </header>
  <main>
    <div class="logins">
      <router-view></router-view>
    </div>
    <Playlist v-if="channel == 'Playlist'"/>
    <Api v-else-if="channel == 'Api'"/>
  </main>
</template>

<script setup>
// import ------------------------------------------------------------------------------
import {ref, onMounted} from 'vue';
import {useStore} from 'vuex';
  const store = useStore();
import { useRouter, useRoute } from 'vue-router';
  const oRouter = useRouter();
  const oRoute = useRoute();
import Playlist from './components/playlist.vue';
import Api from './components/api.vue'
// common function ---------------------------------------------------------------------
let channel = ref(store.getters.page);

  if(store.getters.loginStateCheck) {
    channel = 'main'
  } else {
    oRouter.push({name: 'logIn'});
  }
</script>

<style>
body {
  margin: 0;
  padding: 0;
  min-width: 320px;
}
ul,li {
  list-style: none;
  margin: 0px;
  padding: 0px;
}
#app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
  border: 1px solid black;
}
</style>
<style scoped>
.navBtn {
  position: fixed;
  z-index: 8000;
  top: 0;
  left: 0;
  height: 100vh;
  width: max-content;
  background-color: rgba(255,255,255);

  padding: 20% 0;
}
nav ul {
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 1rem;
}
nav ul li {
  width: 100%;
  padding: 0 1rem;
  box-sizing: border-box;
}
.navClose {
  left: -100%;
}
</style>