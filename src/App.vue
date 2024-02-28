<template>
  <div class="loadingPage" v-if="store.getters.getSetLoading">
    <div>
      <img src="./assets/main-icon-512x512.png">
      <strong>CHEEZS</strong>
    </div>
  </div>
  
  <div id="appBox" v-else>
    <header class="app_header_wrap">
        <div class="headerIcon" @click="routingPage('home')" v-if="headerState">
          <img src="./assets/img/main-icon-fill2.png">
          <h1>CHEEZS</h1>
        </div>
        <form class="app_searchBar" action="/search" @submit.prevent="searchEvent" v-if="headerState">
          <input type="search" name="searchValue" placeholder="플레이리스트, 해시태그 검색">
          <button>검색</button>
        </form>
        <div class="accounts" v-if="headerState">
          <div class="nav_account" v-if="useAuth.currentUser">
            <div class="nav_a_info beforeClick" @click="navMenuOpen = !navMenuOpen">
              <div class="nav_a_avatar">
                <img :src="store.getters.getLoginUserData.photoURL">
              </div>
              <div class="nav_a_name">{{ store.getters.getLoginUserData.name }}</div>
            </div>
            <div class="nav_a_menu" v-if="navMenuOpen">
              <ul>
                <li><a href="#" @click.prevent="routingPage('home')">홈</a></li>
                <li><a href="#" @click.prevent="routingPage('music')">음악 검색</a></li>
                <li><a href="#" @click.prevent="routingPage('account',useAuth.currentUser.uid)">내 정보</a></li>
                <li><a href="#" @click.prevent="routingPage('setting')">설정</a></li>
                <li><a href="#" @click.prevent="store.dispatch('logout')">로그아웃</a></li>
              </ul>
            </div>
          </div>
          <div class="nav_account_notLogin" v-if="!useAuth.currentUser">
            <button type="button" class="nav_a_nl_login" @click="oRouter.push({name : 'logIn'})">Login</button>
            <button type="button" class="nav_a_nl_signIn" @click="oRouter.push({name : 'signUp'})">Sign Up</button>
          </div>
        </div>
    </header>
    <main>
      <div class="nav_menu">
        
      </div>
      <div class="mainWrap" v-if="dataCheck.every(v => v)">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<script setup>
// import ------------------------------------------------------------------------------
import axios from 'axios';
import {ref,reactive,watch, onMounted} from 'vue';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuth, useDatabase } from './datasources/firebase';
import {useStore} from 'vuex';
  const store = useStore();
import { useRouter, useRoute } from 'vue-router';
  const oRouter = useRouter();
  const route = useRoute();
import { get, ref as dataRef, onValue, query, limitToLast, orderByChild, set, serverTimestamp, equalTo, update} from 'firebase/database';

const dataCheck = reactive([])
const hashObj = reactive({})
const navMenuOpen = ref(false);
let headerState = ref(false)
// 1. data load



onMounted(async function(){
  store.commit('setSetLoading',true);
  onAuthStateChanged(useAuth,user => {
    if(user){
      onValue(dataRef(useDatabase,`user/${user.uid}/info`),snapshot => {
        const v = snapshot.val();
        if(!v.photoURL){
          v.photoURL = '/img/img/rodent.png'
        }
        store.commit('setLoginUserData',v);
      })
      onValue(dataRef(useDatabase,`user/${user.uid}/following`),snapshot => {
        const v = snapshot.val();
        store.commit('setLoginUserFollowing',Object.keys(v));
      })
      onValue(dataRef(useDatabase,`user/${user.uid}/follower`),snapshot => {
        const v = snapshot.val();
        store.commit('setLoginUserFollower',Object.keys(v));
      })
      onValue(query(dataRef(useDatabase,`playlists`),orderByChild(`uid`),equalTo(user.uid)),snapshot => {
        store.commit('setUserPlaylists',snapshot.val())
        console.log("User Playlists : ", snapshot.val())
      })
    }else{
      store.commit('setLoginUserData',null);
      store.commit('setUserPlaylists',null);
      store.commit('setRandomFollowing',null);
      oRouter.push({name : 'home'})
      console.log("Non Login User");
    }
  
  })
  const query1 = query(dataRef(useDatabase,`hash`),orderByChild('number'),limitToLast(3))
  const get1 = await get(query1);
  const get2 = Object.entries(get1.val()).map(v => ({ [v[0]] : Object.keys(v[1].list) }))
  store.commit('setPopularHash',get2);
  console.log("hash ::: ",get2)

  const get4 = await get(dataRef(useDatabase,'musicSearch'))
  const get5 = new Date(get4.val().lastSearchTime);
  if(get5 && Date.now() - get5 < 86400000*5){
    store.commit('setPopularMusic',get4.val().popular);
    console.log("인기급상승 불러옴 : ", get4.val().popular)
  } else {
    const APIkeys = await get(dataRef(useDatabase,'API_key'));
    const res = await axios.get("https://www.googleapis.com/youtube/v3/videos",{
        params: {
            part: 'snippet, contentDetails',
            type: 'video',
            key: APIkeys.val(),
            chart: 'mostPopular',
            regionCode : 'kr',
            videoCategoryId: '10',
            videoSyndicated: 'true',
            maxResults: 16
        }
    });
    const res2 = res.data.items.filter(v => v.snippet.description.includes('Provided to YouTube'||'Auto-generated by YouTube'));
    const res3 = await res2.map(item => {
      const channel = item.snippet.channelTitle;
      const channel2 = channel.includes(' - Topic')? channel.split(' - Topic')[0] 
        : channel.includes(' - 주제')? channel.split(' - 주제')[0] : channel.split(' - ')[0];  ;
      return ({
              id: item.id,
              title: item.snippet.title.replaceAll('&#39;',`'`).replaceAll('&amp;','&'),
              artist: channel2,
              thumbnail: `https://i.ytimg.com/vi/${item.id}/maxresdefault.jpg`,
              url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
              duration: item.contentDetails.duration.match(/[0-9]+/g)
          })
    });
    update(dataRef(useDatabase),{
      [`musicSearch/lastSearchTime`] : Date.now(),
      [`musicSearch/popular`] : res3
    })
    store.commit('setPopularMusic',res3)
    console.log("인기급상승 새로 등록 : ", res3)
  }

  return store.commit('setSetLoading', null);
})
function searchEvent(event){
  const d1 = Object.fromEntries(new FormData(event.target).entries())
  const values = d1.searchValue;
  routingPage('search',values)
}

function routingPage(name,prop){
  switch (name) {
    case "account" :
      oRouter.push({ name: 'account', params : { ids : prop}})
      break;
    case "search" :
      oRouter.push({ name : 'search', params : {words : prop}})
      break;
    default:
      oRouter.push({ name: name})
      break;
  }
  store.commit('routing',name);
  slideAccount();
}
function slideAccount(){
  navMenuOpen.value = null;
}

watch(() => route.path, cur => {
  if(cur == '/logIn' || cur == '/signUp'){
    headerState.value = false
  }else{
    headerState.value = true
  }
},{immediate : true})
// 알림 설정 -------------------------------------------------------
</script>
<style>
  @import './css/reset.css';
  @import './css/font.css';
  @import './css/app.css';
</style>
