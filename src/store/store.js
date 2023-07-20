import { createStore } from 'vuex'
import {useAuth, useDatabase} from '../datasources/firebase.js'
import {signInWithEmailAndPassword, signOut, onAuthStateChanged, deleteUser} from 'firebase/auth';
import { get, ref, onValue , remove, query, orderByKey} from 'firebase/database';
// Create a new store instance.
const store = createStore({
  state () {
    return {
      pageRouting: 'Home',
      loginState : null,
      nowSearchMusic: null,
      innerNotification : [],
      // 로딩 지연 //
      setLoading: false,
      // 로그인 에러 발생 시 메세지 호출 //
      loginError : null,
      // database data //
      dataUsers : {},
      dataPlaylists : {},
      dataHashs : {},
      dataMusicSearch : {},
      textin : null
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
    },
    setLoginError(state,payload){
      state.loginError = payload
    },
    setDataMusicSearch(state,payload){
      state.dataMusicSearch = payload
    },
    setInnerNotification(state,payload){
      state.innerNotification.push(payload)
      const len = state.innerNotification.length;
      setTimeout(function(){
        state.innerNotification.splice(len-1,1);
      },2000);
    },
    setText(state){
      return clearInterval(state.textin);
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
    },
    getDataMusicSearch(state){
      return state.dataMusicSearch
    },
    getLoginError(state){
      return state.loginError
    },
    getInnerNotification(state){
      return state.innerNotification
    },
    getText(state,payload){
      state.textin = setInterval(function(){
        const t = payload.getCurrentTime();
        console.log(t)
      },500)
    }
  },
  actions: {
    loginWithEmail({commit, state},payload){
      signInWithEmailAndPassword(useAuth, payload.user_id , payload.user_pwd)
      .then(usercredential => {
        const uid = usercredential.user.uid;
        commit('loginAccount', state.dataUsers[uid])
        commit('setSetLoading',false);
      })
      .catch(err => {
        const code = err.code;
        const message = err.message;
        console.log("[Login Error]" + code + " => " + message);
        commit('setLoginError',true)
      });
      
    },

    logout({commit}){
      signOut(useAuth)
      .then(()=> {
        commit('loginAccount',null);
        console.log("[Auth] logout")
      })
      .catch(err => console.log(err.message));
    },

    dataLoad({commit,state}){
      return  new Promise((res,rej) => {
        commit('setSetLoading',true);
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
        onValue(ref(useDatabase,'musicSearch'), (snapshot) => {
          const data = snapshot.val()
          commit('setDataMusicSearch',data);
          console.log('[musicSearch data]', data)
        })
        res(state.dataUsers);
      })
      
    },
    userDelete({state}){
      const userUid = useAuth.currentUser.uid
      deleteUser(useAuth.currentUser)
      .then(() => {
        const plobj = state.loginState.playlist;
          plobj[userUid] = true;
        for(const listname in plobj) {
          const path = '/';
          const db2 = ref(useDatabase, path);
          get(db2).then(snapshot => {
            if( snapshot.exists() ){
              const data = snapshot.val();
              const nodes = Object.entries(data).filter(([key, value]) => value == listname).map(([key]) => key);
              nodes.forEach(nodeKey => {
                remove(ref(useDatabase,`${path}/${nodeKey}`))
              })
            }
          })
        }
        const dv = ref(useDatabase,'account/' + userUid)
        remove(dv);
      })
      .then(() => {
        router.push('/logIn');
      })
    }
  }
})

export default store