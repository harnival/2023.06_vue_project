<template>
  <div class="loadingPage" v-if="store.getters.getSetLoading">
    <div>
      <img src="./assets/main-icon-512x512.png">
      <strong>CHEEZS</strong>
    </div>
  </div>
  <div id="appBox" v-else>
    <header>
      <div class="headerIcon" @click="goHome">
        <img src="./assets/img/main-icon-fill2.png">
        <h1>CHEEZS</h1>
      </div>
      <div class="accounts">
        <div class="nav_account" v-if="store.getters.loginStateCheck">
          <div class="nav_a_info_wrap">
            <div class="nav_a_info beforeClick" @click="slideAccount">
              <div class="nav_a_avatar">
                <img :src="store.getters.getAccount.photoURL">
              </div>
              <div class="nav_a_name">{{ store.getters.getAccount.name }}</div>
            </div>
          </div>
          <div class="nav_a_menu drawing">
            <div class="nav_a_menuWrap">
              <ul>
                <li><a href="/" @click.prevent="goHome">홈</a></li>
                <li><a href="/" @click.prevent="goPlaylist">탐색</a></li>
                <li><a href="/" @click.prevent="goMusic">음악 검색</a></li>
              </ul>
              <ul>
                <li><a href="/" @click.prevent="goAccount">내 정보</a></li>
                <li><a href="/" @click.prevent="goSetting">설정</a></li>
              </ul>
            </div>
          </div>
        </div>
        <!-- <div class="logout_account" v-else>
          <button type="button">로그인</button>
          <button type="button">회원가입</button>
        </div> -->
      </div>
    </header>
    <main>
      <div class="mainWrap">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<script setup>
// import ------------------------------------------------------------------------------
import {ref,reactive, onBeforeMount, watch, Transition, onMounted} from 'vue';
import { onAuthStateChanged, updateProfile, getAuth } from 'firebase/auth';
import { useAuth, useDatabase } from './datasources/firebase';
import {useStore} from 'vuex';
  const store = useStore();
import { useRouter, useRoute } from 'vue-router';
  const oRouter = useRouter();
import { get, ref as dataRef, onValue} from 'firebase/database';

// -------------------------------------------------------------------------------------
onValue(dataRef(useDatabase,`account`), (snapshot) => {
  const data = snapshot.val()
  store.commit(`setDataUsers`,data);
  console.log('[userData]', data)
})
onValue(dataRef(useDatabase,`playlists`), (snapshot) => {
  const data = snapshot.val()
  store.commit(`setDataPlaylists`,data);
  console.log('[playlist data]', data)
})
onValue(dataRef(useDatabase,'hashs'), (snapshot) => {
  const data = snapshot.val()
  store.commit('setDataHashs',data);
  console.log('[hashs data]', data)
})
onValue(dataRef(useDatabase,'musicSearch'), (snapshot) => {
  const data = snapshot.val()
  store.commit('setDataMusicSearch',data);
  console.log('[musicSearch data]', data)
})
store.commit('setSetLoading',true)
onAuthStateChanged(useAuth ,user => {
    if(user) {
      const uid = user.uid;
      get(dataRef(useDatabase,`account/${uid}`))
      .then(data => {
        store.commit('loginAccount',data.val());
        console.log('[Auth State] log In',data.val())
        oRouter.push({name : 'main'});
        store.commit('setSetLoading',false)
      })
    } else {
      store.commit('loginAccount',null);
      oRouter.push('/logIn');
      console.log('[Auth State] Log Out')
      store.commit('setSetLoading',false)
    }
   
})

// account 메뉴 슬라이드 클릭 이벤트 //
const slideAccount = function(){
  const menu = document.querySelector(".nav_a_menu");
  menu.classList.toggle('drawing')
  if(menu.classList.contains('drawing')){
    menu.style.transform = `translateX(0px)`
  } else {
    menu.style.transform = `translateX(100%)`
  }
}

// account menu 이동 //
const goAccount = function(){
  oRouter.push({ name: 'account', params : { ids : useAuth.currentUser.uid}})
  slideAccount()
}
const goHome = function(){
  oRouter.push({name: 'main'})
  store.commit('routing', 'Home');
  slideAccount()
}
const goMusic = function(){
  oRouter.push({name: 'main'})
  store.commit('routing', 'Music');
  slideAccount()

}
const goHash = function(){
  oRouter.push({name: 'main'})
  store.commit('routing', 'Hash');
  slideAccount()

}
const goPlaylist = function(){
  oRouter.push({name: 'main'});
  store.commit('routing', 'Playlist');
  slideAccount()

};
const goSetting = function(){
  oRouter.push({name: 'setting'});
  slideAccount()

}
// 리스트 생성, 수정 창 //

// 알림 설정 -------------------------------------------------------
</script>

<style>
:root {
  --inputwrap-label-bg: #f0f0fd;
  --main-color1:rgb(255, 210, 11);
  --header-height: 7vh;
  --main-top-padding: 10rem;
}
body {
  margin: 0;
  padding: 0;
  user-select: none;
}
header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 0px;
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
p {
  padding: 0;
  margin: 0;
}
a {
  text-decoration: none;
  color: black;
}
h1,h2,h3,h4,h5,h6 {
  margin: 0; padding: 0;
}
#app {
  width: 100%;
  text-align: center;
  background-color: transparent;
  background-color: #ffffff;
}
#appBox {
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
  transform: translateX(-100%);
}

.pl_title_btn {
  width: 1rem;
  position: relative;
}
.pl_title_btn button {
  filter: invert(100%);
  width: 100%;
  height: 100%;
  display: block;
  border: 0;
  font-size: 0px;
  background: transparent url('./assets/img/dots-vertical.svg') no-repeat center/ 150%;
}
.sec1_title_menu {
        position: absolute;
        /* top: 50%; */
        top: 0;
        /* transform: translateY(-50%); */
        right: 110%;

        font-size: 90%;
        font-weight: 500;
        word-break: keep-all;
        display: flex;
        flex-direction: column;
        /* background-color: rgba(0,0,0,0.3); */
        background-color: rgb(255,255,255,0.9);
        backdrop-filter: blur(10px);
        overflow: hidden;
        border-radius: 0.5rem;

        box-shadow: 2px 1px 3px 0px rgba(0, 0, 0, 0.63);
    }
    .sec1_title_menu a {
        text-decoration: none;
        color: black;
        padding: 0.7em 2.5em;
    }
    .sec1_title_menu a:hover{
        /* background-color: rgba(255,255,255,0.3); */
        background-color: rgb(0,0,0,0.3);
    }
</style>


<style scoped>
/* ======================================= */
.headerIcon {
  width: fit-content;
  height: var(--header-height);

  display: flex;
  align-items: center;
  gap: 0.5rem;

  padding: 0 1rem;
  box-sizing: border-box;
  position: absolute;
  top: 0;
  left: 0;

  cursor: pointer;
}
.headerIcon img {
  height: 60%;
  aspect-ratio: 1/1;
}
.headerIcon h1 {
  font-size: 250%;
  font-family: 'Oswald';
  color: var(--main-color1);
}
/* ---------------------------------------header Icon */
/* loading------------------------------------------ */
.loadingPage {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 300%;
  font-family: 'Oswald';
  background-color: rgb(255,210,11);
}
.loadingPage > div {
  padding: 10%;
  aspect-ratio: 1/1;
  background-color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
.loadingPage img {
  width: min(20vw, 100px);
}
/* -------------------------------------------------loading */
main {
  background:
    linear-gradient(45deg,rgba(0,0,0, 0.7),rgba(0, 0, 0, 0.7)),
    linear-gradient(240deg, transparent,red),
    linear-gradient(45deg, transparent,yellow);
    min-height: 100vh;
    overflow: hidden;
}
.mainWrap {
  width: 100vw;
  /* height: 93vh; */
  margin-top: 7vh;
}
/* account menu--------------------------------------------- */
.accounts {
  position: absolute;
  right: 0;
  top: 0;
  height: 100vh;
  transition: .3s ease;
}
  /* account > user  */
.nav_account {
  height: 100%;
  position: absolute;
  top: 0;
  right: 0;
}
.nav_a_info_wrap {
height: var(--header-height);
position: absolute;
top: 0;
right:0;
padding: 0.5vh 2rem;
box-sizing: border-box;

}
.nav_a_info {
  height: 100%;
  gap: 1rem;
  border-radius: 3vh;
  cursor: pointer;
  transition: .3s ease;
  display: flex;
  background: linear-gradient(300deg, rgb(250,210,11), rgba(250, 182, 36, 0.719),rgb(178, 228, 0));

  position: relative;
}
.nav_a_info:hover {
  background-color: rgb(255,210,11,0.5);
}
.nav_a_avatar {
  height: 6vh;
  width: 6vh;
  aspect-ratio: 1/1;
  border-radius: 50%;
  overflow: hidden;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  position: sticky;
  left: 5vw;
  top: 0;
  z-index: 5;
}
.nav_a_avatar img {
  width: 100%;
}
.nav_a_name{
  position: relative;
  font-size: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  word-break: keep-all;
  white-space: nowrap;
  min-width: 5vw;
  z-index: 1;
}
.nav_a_name::after {
  content: '';
  background: url('/img/img/chevron-down.svg') no-repeat center/1.2rem 1.2rem;
  display: block;
  width: 1rem;
  height: 100%;
  position: absolute;
  right: 1em;
  top: 0;
  padding-left: 1rem;
}
  /* account > menu */
.nav_a_menu {
  height: 93%;
  transition: .4s ease;
  position: absolute;
  bottom: 0;
  right: 0;
  padding-right: 2rem;

}
.nav_a_menuWrap {
  width: max(5vw, 5rem);
  word-break:keep-all;
  white-space: nowrap;
}
.nav_a_menuWrap li {
  margin-top: 1rem;
}
.nav_a_menuWrap li a {
  display: flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;
  color: black;
  font-size: 100%;
  width: 100%;
  aspect-ratio: 1;
  background-color: rgb(255,210,11);
  border-radius: 50%;
}
.nav_a_menuWrap li a:hover {
  background-color: #efefef;
}
hr {
  margin: 0;
  height: 0.5px;
  border: 0;
  background-color: #666;
}
.nav_a_menu_plTitle{
  padding: 1rem 0;
  font-weight: 500;
}
.nav_a_menu_plTitle li{
  padding-bottom: 0.5rem;
  font-weight: 400;
}

</style>