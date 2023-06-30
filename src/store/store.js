import { createStore } from 'vuex'

// Create a new store instance.
const store = createStore({
  state () {
    return {
      pageRouting: ''
    }
  },
  mutations: {
    routing(state,payload){
      state.pageRouting = payload;
    }
  },
  getters: {
    page(state){
      return state.pageRouting
    }
  }
})

export default store