import { createStore } from 'vuex'
import {useAuth, useDatabase} from '../datasources/firebase.js'
import {signInWithEmailAndPassword, signOut, onAuthStateChanged} from 'firebase/auth';
import { get, ref, onValue } from 'firebase/database';
// Create a new store instance.
const store = createStore({
  state () {
    return {
      pageRouting: 'Home',
      loginState : null,
      nowSearchMusic: null,
      // 로딩 지연 //
      setLoading: false,
      // database data //
      dataUsers : {},
      dataPlaylists : {},
      dataHashs : {}
    }
  },
  mutations: {
    routing(state,payload){
      state.pageRouting = payload;
    },
    loginAccount(state,payload){  // 로그인 시 사용자 정보 입력, 로그아웃 시 정보 삭제
      state.loginState = payload;
    },
    storeSearching(state,payload){
      state.nowSearchMusic = payload
    },
    // 로딩 지연 //
    setSetLoading(state,payload){
      console.log('[loading]',payload)
      state.setLoading = payload
    },
    // database load //
    setDataUsers(state,payload){
      state.dataUsers = payload
    },
    setDataPlaylists(state,payload){
      state.dataPlaylists = payload
    },
    setDataHashs(state,payload){
      state.dataHashs = payload
    }
    
  },
  getters: {
    page(state){
      return state.pageRouting
    },
    loginStateCheck(state){       // 로그인 정보 유무로 판단
      return state.loginState != null  
    },
    getAccount(state){
      return state.loginState
    },
    getNowSearchMusic(state){
      return state.nowSearchMusic
    },
    getSetLoading(state){
      return state.setLoading
    },
    // database load //
    getDataUsers(state){
      return state.dataUsers
    },
    getDataPlaylists(state){
      return state.dataPlaylists
    },
    getDataHashs(state){
      return state.dataHashs
    }
    
  },
  actions: {
    loginWithEmail({commit},payload){
      commit('setSetLoading',true);
      signInWithEmailAndPassword(useAuth, payload.user_id , payload.user_pwd)
      .then(usercredential => {
        const uid = usercredential.user.uid;
        get(ref(useDatabase, `account/${uid}`))
        .then(snapshot => {
          const data = snapshot.val();
        })
        commit('setSetLoading', false);
      })
      .catch(err => {
        const code = err.code;
        const message = err.message;
        console.log("[Login Error]" + code + " => " + message);
      })
    },

    logout({commit}){
      signOut(useAuth)
      .then(()=> {
        commit('loginAccount',null);
        console.log("[Auth] logout")
      })
      .catch(err => console.log(err.message));
    },

    pageLoading({commit,state}){
      commit('setSetLoading',true);
      onAuthStateChanged(useAuth, async function(user){
        if (user) {
          const uid = user.uid;
          const data = await get(ref(useDatabase, 'account' + uid))
          commit('loginAccount', data.val())
          console.log("page load", uid)
          router.push('/')
          commit('setSetLoading',false)          
        } else {
          commit('setSetLoading',false)
          router.push('/logIn')
        }
      })
    },
    dataLoad({commit}){
      onValue(ref(useDatabase,`account`), (snapshot) => {
        const data = snapshot.val()
        commit(`setDataUsers`,data);
        console.log('[userData]', data)
      })
      onValue(ref(useDatabase,`playlists`), (snapshot) => {
        const data = snapshot.val()
        commit(`setDataPlaylists`,data);
        console.log('[playlist data]', data)
      })
      onValue(ref(useDatabase,'hashs'), (snapshot) => {
        const data = snapshot.val()
        commit('setDataHashs',data);
        console.log('[hashs data]', data)
      })      
    }
  }
})

export default store