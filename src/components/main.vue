<template>
  <h2>main</h2>
    <div id="mainBox">
      <Playlist v-if="channel == 'Playlist'"/>
      <Home v-if="channel == 'Home'"/>
      <Api v-if="channel == 'Api'"/>
      <Account v-if="channel == 'Account'"/>
    </div>
</template>

<script setup>
// library //
import { defineProps} from 'vue';
import { useStore } from 'vuex';
  const store = useStore();
import { useRouter,useRoute } from 'vue-router';
  const router = useRouter();
  const route = useRoute();
import { useDatabase } from '../datasources/firebase.js';
import { ref as dataRef, onValue } from 'firebase/database';
// components //
import Api from './api.vue';
import Playlist from './playlist.vue';
import Account from './account.vue';
import Home from './home.vue'

// ------------------------------------------------------------
let channel = ref('Home');
channel.value = function(){
  return store.getters.page
}


</script>