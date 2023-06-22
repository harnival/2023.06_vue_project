import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    rodentOrigin: ""
  },
  getters: {
    getOrigin(state){
      return state.rodentOrigin
    }
  },
  mutations: {
    setOrigin(state,payload){
      state.rodentOrigin = payload;
    }
  },
  actions: {
  },
  modules: {
  }
})
