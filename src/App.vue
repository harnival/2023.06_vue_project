<template>
  <div id="appBox">
    <header>
      <div class="navBtn">
        <button type="button" @click="store.dispatch('logout')">(임시) logout</button>
        <button type="button" @click="console.log(store.getters.getAccount, useAuth.currentUser)">[임시]loginState</button>
      </div>
      <div class="accounts">
        <div class="nav_account" v-if="store.getters.loginStateCheck">
          <div class="nav_a_info" @click="slideAccount">
            <div class="nav_a_avatar">
              <img :src="store.getters.getAccount.photoURL">
            </div>
            <div class="nav_a_name">{{ store.getters.getAccount.name }}</div>
          </div>
          <div class="nav_a_menu">
            <div class="nav_a_menuWrap">
              <ul>
                <li><a href="/" @click.prevent="goHome">홈</a></li>
                <li><a href="/" @click.prevent>탐색</a></li>
                <li><a href="/" @click.prevent="goMusic">음악 검색</a></li>
              </ul>
              <hr/>
              <ul>
                <li><a href="/" @click.prevent="goAccount">내 정보</a></li>
                <li><a href="/" @click.prevent>설정</a></li>
                <li><a href="/" @click.prevent="store.dispatch('logout')">로그아웃</a></li>
              </ul>
              <hr>              
              <dl>
                <dt>내 플레이리스트</dt>
                <dd class="nav_a_menu_nolist"><p>플레이리스트가 없습니다.</p></dd>
              </dl>
            </div>
          </div>
        </div>
        <div class="logout_account" v-else>
          <button type="button">로그인</button>
          <button type="button">회원가입</button>
        </div>
        <nav>
          
        </nav>
      </div>
    </header>
    <main>
      <div class="loadingPage" v-if="store.getters.getSetLoading">
        <h2>LOADING.........</h2>
      </div>
      <div class="mainWrap" v-else>
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<script setup>
// import ------------------------------------------------------------------------------
import {ref,reactive, onBeforeMount, defineProps} from 'vue';
import { onAuthStateChanged, updateProfile, getAuth } from 'firebase/auth';
import { useAuth, useDatabase } from './datasources/firebase';
import {useStore} from 'vuex';
  const store = useStore();
import { useRouter, useRoute } from 'vue-router';
  const oRouter = useRouter();
import { get, ref as dataRef, onValue} from 'firebase/database';

let userInfo = reactive({});
// -------------------------------------------------------------------------------------
// 첫 로딩 시 로그인 유무 체크 //
onBeforeMount(async function(){
  let current = ref(null);
  const q = new Promise(res => {
    store.commit('setSetLoading',true)
    onAuthStateChanged(useAuth, user => {
      res(user)
    })
  });
  current.value = await q;
  if( current.value ) {
    const load = await get(dataRef(useDatabase,'account/' + current.value.uid))
    store.commit('loginAccount', load.val());
    oRouter.push('/')
    store.commit('routing', 'Home');
    store.commit('setSetLoading',false)
    
  } else {
    store.commit('setSetLoading',false)  
    oRouter.push('/logIn')
  }
  // 데이터베이스 초기 정보 로드 //
  store.dispatch('dataLoad');
});

// 이후 로그인/로그아웃 체크 //
onAuthStateChanged(useAuth ,user => {
  store.commit('setSetLoading',true)
  if(user) {
    get(dataRef(useDatabase,`account/${useAuth.currentUser.uid}`))
    .then(snapshot => {
      const data = snapshot.val();
      store.commit('loginAccount',data);
      oRouter.push('/index');
    })
  } else {
    store.commit('loginAccount',null);
    oRouter.push('/logIn');
  }
  store.commit('setSetLoading',false)  
})

// account 메뉴 슬라이드 클릭 이벤트 //
const slideAccount = function(){
  const menu = document.querySelector(".nav_a_menu");
  const h = document.querySelector(".nav_a_menuWrap").offsetHeight;
  menu.classList.toggle('drawing');
  if(menu.classList.contains('drawing')){
    menu.style.height = h + "px"
  } else {
    menu.style.height = 0 + "px"
  }
}

// account menu 이동 //
const goAccount = function(){
  oRouter.push({ name: 'account', params : { ids : 'my', userInfo: useAuth.currentUser.uid }})
}
const goHome = function(){
  oRouter.push({name: 'main', params: {channel : 'Home'}})
  store.commit('routing', 'Home');
}
const goMusic = function(){
  oRouter.push({name: 'main', params : {channel : 'Api'}})
  store.commit('routing', 'Api');
}
const goHash = function(){
  oRouter.push({name: 'main' , params: {channel : Hash}})
  store.commit('routing', '');
}
</script>

<style>
:root {
  --inputwrap-label-bg: white;
  --main-color1:rgb(255, 210, 11);
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
  transform: translateX(-100%);
}
</style>

<style scoped>
.nav_account {
  position: absolute;
  right: 0;
  top: 0;
  min-height: max(5vh, 4rem);
  border: 1px solid black;

}
.nav_a_avatar {
  height: 10vh;
  aspect-ratio: 1/1;
  border: 1px solid #666;
  border-radius: 50%;
  overflow: hidden;
}
.nav_a_avatar img {
  width: 100%;

}
.nav_a_menu {
  width: 100%;
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  align-items: end;
  height: 0px;
  transition: .4s ease;

  background-color: white;
}
.nav_a_menuWrap {
  width: 100%;
  padding: 1rem 0px;
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
.nav_a_info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0px 3rem 0px 1rem;
  height: 100%;
  cursor: pointer;
  transition: .3s ease;
}
.nav_a_info:hover {
  background-color: #efefef;
}
.nav_a_name{
  position: relative;
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
  padding-left: 5px;
}
.nav_a_menuWrap li a {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem 0;
  text-decoration: none;
  color: black;
  font-size: 100%;
}
</style>