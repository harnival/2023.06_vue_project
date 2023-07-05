import { createStore } from 'vuex'
import {useAuth} from '../datasources/firebase.js'
import {signInWithEmailAndPassword, signOut} from 'firebase/auth';

// Create a new store instance.
const store = createStore({
  state () {
    return {
      pageRouting: '',
      loginState : null
    }
  },
  mutations: {
    routing(state,payload){
      state.pageRouting = payload;
    },
    loginAccount(state,payload){  // 로그인 시 사용자 정보 입력, 로그아웃 시 정보 삭제
      state.loginState = payload
    }
  },
  getters: {
    page(state){
      return state.pageRouting
    },
    loginStateCheck(state){       // 로그인 정보 유무로 판단
      console.log(state.loginState);
      return state.loginState != null  
    }
  },
  actions: {
    loginWithEmail({commit},payload){
      signInWithEmailAndPassword(useAuth, email, password)
      .then(usercredential => commit('loginAccount',{
        id: usercredential.user.uid,
        name: usercredential.user.displayName,
        email: usercredential.user.email,
        token: usercredential.user.getIdToken
      }))
      .catch(err => {
        const code = err.code;
        const message = err.message;
        console.log("[Login Error]" + code + "-" + message);
      })
    },
    logout({commit}){
      signOut(useAuth)
      .then(()=> {
        commit('loginAccount',null)
      })
      .catch(err => console.log(err.message));
    },
  }
})

export default store