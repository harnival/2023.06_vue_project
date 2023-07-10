import { createStore } from 'vuex'
import {useAuth} from '../datasources/firebase.js'
import {signInWithEmailAndPassword, signOut} from 'firebase/auth';

// Create a new store instance.
const store = createStore({
  state () {
    return {
      pageRouting: '',
      loginState : null,
      nowSearchMusic: null,
      wholeData: null
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
    setWholeData(state,payload){
      state.wholeData = payload
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
    getWholeData(state){
      return state.wholeData
    }
  },
  actions: {
    loginWithEmail({commit},payload){
      signInWithEmailAndPassword(useAuth, payload.user_id , payload.user_pwd)
      .then(usercredential => {
        const user = usercredential.user;
        commit('loginAccount',{
          id: user.uid,
          name: user.displayName,
          email: user.email,
          token: user.getIdToken,
          photoURL: user.photoURL
        });
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
        console.log("logout")
      })
      .catch(err => console.log(err.message));
    },
  }
})

export default store