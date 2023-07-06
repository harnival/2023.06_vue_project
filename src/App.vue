<template>
  <div id="appBox">
    <header>
      <div class="navBtn">
        <button type="button" @click="oRouter.push('/')">(임시) 메인으로 이동</button>
        <button type="button" @click="channel = 'Api'">(임시) api.vue</button>
      </div>
      <div class="nav_account">
        <div class="nav_a_avatar">
          <img src="/img/img/rodent.png">
        </div>
        <div class="nav_a_name">{{ accountName }}</div>
        <div class="nav_a_menu">
          <ul>
            <li><a href="/">내 정보</a></li>
            <li><a href="/">설정</a></li>
          </ul>
          <hr>
          <dl>
            <dt>내 플레이리스트</dt>
            <dd><a href="/">sample playlist</a></dd>
            <dd><a href="/">sample playlist</a></dd>
            <dd><a href="/">sample playlist</a></dd>
          </dl>
        </div>
      </div>
    </header>
    <main>
      <div class="logins">
        <router-view @inputMotion="inputMotion"></router-view>
      </div>
      <div class="mainPage">
        <Playlist v-if="channel == 'Playlist'"/>
        <Api v-else-if="channel == 'Api'"/>
      </div>
    </main>
  </div>
</template>

<script setup>
// import ------------------------------------------------------------------------------
import {ref, onMounted, reactive, computed} from 'vue';
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

let accountImg = ref('');
let accountName = ref('sample name');

// ** styles --------------------------
const inputMotion = function(){
  let oInputs = reactive(document.querySelectorAll(".inputWrap input"));
  oInputs.forEach(v => {
      const par = v.parentElement;
      const lab = par.querySelector("label");
      v.addEventListener("focus",function(){
          lab.classList.add('label_focused','label_value')
      })
      v.addEventListener('blur',function(){
          if(v.value == ""){
              lab.classList.remove('label_focused','label_value')
          } else {
              lab.classList.remove('label_focused')
          }
      })
  })
}

//--------------------------------------

</script>

<style>
:root {
  --inputwrap-label-bg: white;
  --main-color1:rgb(255, 210, 11);
}
body {
  margin: 0;
  padding: 0;
  min-width: 320px;
}
header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 0;
  z-index: 8000;
}
ul,li {
  list-style: none;
  margin: 0px;
  padding: 0px;
}
button {
  cursor: pointer;
}
#app {
  width: 100%;
  text-align: center;
  background-color: transparent;
}
#appBox {
  max-width: 1280px;
  margin: 0 auto;
  border: 1px solid #aaa;
  box-sizing: border-box;
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
.nav_account {
  position: absolute;
  right: 0;
  top: 0;
  border: 1px solid black;
  height: max(5vh, 4rem);
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0px 1rem;
}
.nav_a_avatar {
  height: 100%;
  aspect-ratio: 1/1;
  border: 1px solid #666;
  border-radius: 50%;
  overflow: hidden;
}
.nav_a_avatar img {
  width: 100%;

}
.nav_a_menu {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  overflow: hidden;
}
</style>
<style scoped>
.navBtn {
  height: 100vh;
  width: max-content;
  background-color: rgba(255,255,255);
}
</style>