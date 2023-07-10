<template>
  <div id="appBox">
    <header>
      <div class="navBtn">
        <button type="button" @click="channel = 'Api'">(임시) api.vue</button>
        <button type="button" @click="console.log(store.getters.getAccount, useAuth.currentUser)">[임시]loginState</button>
      </div>
      <div class="accounts">
        <div class="nav_account" v-if="store.getters.loginStateCheck">
          <div class="nav_a_info" @click="slideAccount">
            <div class="nav_a_avatar">
              <img :src="userimgs">
            </div>
            <div class="nav_a_name">{{ usernames }}</div>
          </div>
          <div class="nav_a_menu">
            <div class="nav_a_menuWrap">
              <ul>
                <li><a href="/" @click.prevent="goAccount">내 정보</a></li>
                <li><a href="/" @click.prevent>설정</a></li>
                <li><a href="/" @click.prevent="store.dispatch('logout')">로그아웃</a></li>
              </ul>
              <hr>
              <dl>
                <dt>내 플레이리스트</dt>
                <dd class="nav_a_menu_nolist"><p>플레이리스트가 없습니다.</p></dd>
                <!-- <dd class="nav_a_menu_playlist"><a href="/">sample playlist</a></dd>
                <dd class="nav_a_menu_playlist"><a href="/">sample playlist</a></dd>
                <dd class="nav_a_menu_playlist"><a href="/">sample playlist</a></dd> -->
              </dl>
            </div>
          </div>
        </div>
        <div class="logout_account" v-else>
          <button type="button">로그인</button>
          <button type="button">회원가입</button>
        </div>
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
import {ref,reactive, onMounted, onBeforeMount} from 'vue';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { useAuth, useDatabase } from './datasources/firebase';
import {useStore} from 'vuex';
  const store = useStore();
import { useRouter} from 'vue-router';
const oRouter = useRouter();
import { get, ref as dataRef, onValue} from 'firebase/database';


// -------------------------------------------------------------------------------------
onMounted(function(){
  store.dispatch('logout')
})
// 첫 mount 시, 기본값은 로그인 화면, 이미 로그인된 상태면 바로 메인화면으로 //
// 실시간 로그인 상태에 따라 페이지 변경 //
let usernames = ref('');
let userimgs = ref('');
onValue(dataRef(useDatabase,'account'),function(data){
  const q = data.val();
  store.commit('setWholeData', q);
})
onAuthStateChanged(useAuth,(user) => {
  if (user) {
    const keys = user.uid;
    const storeData = store.getters.getWholeData;
    console.log(storeData[keys]); 
    oRouter.push('/');
    
  }else {
    usernames.value = "로그인이 필요합니다."
    userimgs.value = "/img/img/rodent.png"
    oRouter.push('/logIn')
  }
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

const goAccount = function(){
  oRouter.push({ name: 'account', params : { ids : 'my', userInfo: useAuth.currentUser }})
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
  transform: translateX(-100%);
}
/* --------------------------------------------- */
/* --------------------------------------------- */
.nav_account {
  position: absolute;
  right: 0;
  top: 0;
  height: max(5vh, 4rem);
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
  box-sizing: border-box;
  display: flex;
  align-items: end;
  height: 0px;
  transition: .4s ease;
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
</style>

<style scoped>
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
  border: 1px solid black;
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

</style>