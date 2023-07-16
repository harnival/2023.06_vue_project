<template>
  <div class="loadingPage" v-if="store.getters.getSetLoading">
    <div>
      <img src="./assets/img/main-icon-fill2.png">
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
          <div class="nav_a_menu">
            <div class="nav_a_menuWrap">
              <ul>
                <li><a href="/" @click.prevent="goHome">홈</a></li>
                <!-- <li><a href="/" @click.prevent="goPlaylist">탐색</a></li> -->
                <li><a href="/" @click.prevent="goMusic">음악 검색</a></li>
              </ul>
              <hr/>
              <ul>
                <li><a href="/" @click.prevent="goAccount">내 정보</a></li>
                <li><a href="/" @click.prevent="goSetting">설정</a></li>
                <li><a href="/" @click.prevent="store.dispatch('logout')">로그아웃</a></li>
              </ul>
              <hr>              
              <!-- <p class="nav_a_menu_plTitle">내 플레이리스트</p>
              <ul v-if="!listState">
                <dd class="nav_a_menu_nolist"><p>플레이리스트가 없습니다.</p></dd>
              </ul>
              <ul v-if="listState">
                <li v-for="item in myPlaylist">{{ item.title }}</li>
              </ul> -->
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
import {ref,reactive, onBeforeMount, watch, Transition} from 'vue';
import { onAuthStateChanged, updateProfile, getAuth } from 'firebase/auth';
import { useAuth, useDatabase } from './datasources/firebase';
import {useStore} from 'vuex';
  const store = useStore();
import { useRouter, useRoute } from 'vue-router';
  const oRouter = useRouter();
import { get, ref as dataRef, onValue} from 'firebase/database';

// -------------------------------------------------------------------------------------
onBeforeMount(function(){
  // 데이터베이스 초기 정보 로드 //
  store.dispatch('dataLoad');
  // 로그인/로그아웃 체크 //
  onAuthStateChanged(useAuth ,user => {
    store.commit('setSetLoading',true)
    if(user) {
      get(dataRef(useDatabase,`account/${useAuth.currentUser.uid}`))
      .then(snapshot => {
        const data = snapshot.val();
        store.commit('loginAccount',data);
        oRouter.push({name : 'main'});
        store.commit('setSetLoading',false)
      })
    } else {
      store.commit('loginAccount',null);
      oRouter.push('/logIn');
      store.commit('setSetLoading',false)
    }
  })
})

// account 메뉴 슬라이드 클릭 이벤트 //
const slideAccount = function(){
  const navInfo = document.querySelector(".nav_a_info")
  const menu = document.querySelector(".nav_a_menu");
  const infowrap = document.querySelector(".nav_a_info_wrap")
  const w = infowrap.offsetWidth;
  menu.classList.toggle('drawing');
  infowrap.classList.toggle('drawing');
  navInfo.classList.toggle('beforeClick')
  menu.style.width = w + 'px'
  if(menu.classList.contains('drawing')){
    menu.style.transform = `translateX(0px)`
  } else {
    menu.style.transform = `translateX(100%)`
  }
}
// nav에 플레이리스트 //
let myPlaylist = reactive({});
let listState = ref(true)
const form = reactive({
    account : store.getters.getAccount,
    playlists : store.getters.getDataPlaylists
})
watch(() => [form.account, form.playlists], (cur) => {
    if (cur[0]) {
        if (!cur[0]['playlist']){
            listState.value = false
        } else {
            listState.value = true
            for(const key in cur[0]['playlist']) {
                myPlaylist[key] = cur[1][key]
            }
        }
    }
},{immediate: true, deep: true})
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
  --header-height: 6rem;
  --main-top-padding: 13rem;
}
body {
  margin: 0;
  padding: 0;
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
  width: 100%;
  height: 100%;
  display: block;
  border: 0;
  font-size: 0px;
  background: transparent url('./assets/img/dots-vertical.svg') no-repeat center/ 150%;
}
.sec1_title_menu {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        right: 110%;

        font-size: 80%;
        font-weight: 500;
        word-break: keep-all;
        display: flex;
        flex-direction: column;
        background-color: rgba(0,0,0,0.3);
        backdrop-filter: blur(10px);
        overflow: hidden;
        border-radius: 0.5rem;
    }
    .sec1_title_menu a {
        text-decoration: none;
        color: black;
        padding: 0.2em 1.5em;
    }
    .sec1_title_menu a:hover{
        background-color: rgba(255,255,255,0.3);
    }
</style>
<style scoped>

/* ======================================= */
.headerIcon {
  width: fit-content;
  height: var(--header-height);
  display: flex;
  align-items: center;
  padding: 0 1rem;
  gap: 0.5rem;
  cursor: pointer;
  position: absolute;
  top: 0;
  left: 0;
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
  position: relative;
}
.nav_a_info_wrap {
height: var(--header-height);
min-width: max(15vw, 250px);
width: fit-content;
display: flex;
align-items: center;
transition: .4s ease;
position: absolute;
top: 0;
right:0;
}
.nav_a_info {
  width: 90%;
  box-shadow: -3px 1px 5px 0px #66666679;
  height: 80%;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-radius: 3.5rem;
  cursor: pointer;
  transition: .3s ease;
  background-color: var(--main-color1);
}
.nav_a_info.beforeClick {
  color: black;
  box-shadow: none;
}
.nav_a_info.beforeClick:hover {
  background-color: rgb(255,210,11,0.5);
}
.nav_a_avatar {
  height: 100%;
  aspect-ratio: 1/1;
  border: 1px solid #66666679;
  border-radius: 50%;
  overflow: hidden;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
}
.nav_a_avatar img {
  width: 100%;

}
.nav_a_name{
  position: relative;
  font-size: 120%;
}
.nav_a_name::after {
  content: '';
  background: url('/img/img/chevron-down.svg') no-repeat center/1.2rem 1.2rem;
  display: block;
  width: 1rem;
  height: 100%;
  position: absolute;
  left: 100%;
  top: 0;
  padding-left: 1rem;
}
  /* account > menu */
.nav_a_menu {
  width: 0px;
  overflow: hidden;
  display: flex;
  justify-content: start;
  height: calc(90vh);
  transition: .4s ease;
  float: right;
  border-radius: 2rem;
  background-color: rgb(255,210,11,0.9);
  backdrop-filter: blur(3px);
  position: absolute;
  bottom: 0;
  right: 0;

}
.nav_a_menu.drawing {
  box-shadow: -3px 1px 5px 0px #66666679;
}
.nav_a_menuWrap {
  width: 20vw;
  height: 90vh;
  word-break:keep-all;
  white-space: nowrap;
}
.nav_a_menu_playlist {
  color: #ddd;
  margin: 0px;
  padding: 0px;
  text-align: center;
}
.navBtn {
  height: 100vh;
  width: max-content;
  background-color: rgba(255,255,255);
}


.nav_a_menuWrap li a {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem 0;
  text-decoration: none;
  color: black;
  font-size: 100%;
  transition: .3s ease;
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