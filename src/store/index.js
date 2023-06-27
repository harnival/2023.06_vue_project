import Vue from 'vue'
import Vuex from 'vuex'
import {createUserWithEmailAndPassword} from 'firebase/auth'
import {useAuth} from '../datasources/firebase'
import router from '../router'
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: {
      email: "sample1",
      name: "sample2"
    },
    names : null
  },
  getters: {
    userInfo(state){
      return state.user
    }
  },
  mutations: {
    nulls(state){
      state.user = null
    },
    setUser(state,payload){
      state.user.email = payload.email;
      state.user.name = payload.password
    }
  },
  actions: {
    register({commit},payload){
      createUserWithEmailAndPassword(useAuth, payload.email, payload.password)
        .then(info => {
          const u = info.user;
          console.log(u)
          router.push("/register")
        })
    }
  },
  modules: {
  }
})
