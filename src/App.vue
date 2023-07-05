<template>
  <header>
    <div class="navBtn">
      
    </div>
  </header>
  <main>
    <div class="logins">
      <router-view></router-view>
    </div>
    <div class="mainPage">
      <button type="button" @click="channel = 'Api'">(임시) api.vue</button>
      <Playlist v-if="channel == 'Playlist'"/>
      <Api v-else-if="channel == 'Api'"/>
    </div>
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
onMounted(function(){
  if(store.getters.loginStateCheck) {
    channel = 'main'
  } else {
    oRouter.push({name: 'logIn'});
  }
})
</script>

<style>
:root {
  --inputwrap-label-bg: #eee;
}
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
  text-align: center;
  border: 1px solid black;
}
.inputwrap {
  position: relative;
  display: flex;
  align-items: center;
}
.inputwrap input{
  font-size: 18px;
  border: 0;
  background-color: transparent;
  width: 100%;
  height: 3em;
  border: 1px solid #ccc;
  border-radius: 1em;
  padding: 0 1em;
  z-index: 5;
}
.inputwrap input:focus {
  outline: 2px solid royalblue;
}
.inputwrap label {
  position: absolute;
  left: 1em;
  background-color: var(--inputwrap-label-bg);
  padding: 0 0.5em;
  transition: .2s ease-in-out;
  z-index: 3;
  color: #666;
}
label.label_focused {
  color: royalblue;
}
label.label_value {
  z-index: 10;
  font-size: 12px;
  transform: translateY(-180%);
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