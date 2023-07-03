import { createStore } from 'vuex'

// Create a new store instance.
const store = createStore({
  state () {
    return {
      pageRouting: '',
      langKor : true,
    }
  },
  mutations: {
    routing(state,payload){
      state.pageRouting = payload;
    },
    langChange(state){
        state.langKor = !state.langKor
    }
  },
  getters: {
    page(state){
      return state.pageRouting
    },
    langKor(state){
      return state.langKor
    }
  }
})

export default store