<template>
  <header>
    <div class="navBtn">
      
    </div>
  </header>
  <main>
    <Login v-if="channel == 'Login'"/>
    <Home v-else-if="channel == 'Home'"/>
    <Playlist v-else-if="channel == 'Playlist'"/>
    <Api />
  </main>
</template>

<script setup>
// import ------------------------------------------------------------------------------
import {ref} from 'vue';
import Login from './components/login.vue';
import Home from './components/home.vue';
import Playlist from './components/playlist.vue';
import {useStore} from 'vuex';
  const store = useStore();
import Api from './components/api.vue'
// common function ---------------------------------------------------------------------
const lang = (a,b) => {
  // a : kor , b = eng //
  return store.getters.langKor? a : b
}
let channel = ref(store.getters.page);


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