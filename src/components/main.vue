<template>
    <div id="mainBox">
      <h2>main.vue</h2>
      <Playlist v-if="channel == 'Playlist'"/>
      <Home v-else-if="channel == 'Home'"/>
      <Api v-else-if="channel == 'Api'"/>
      <Account v-else-if="channel == 'Account'"/>
    </div>
</template>

<script setup>
// library //
import { onMounted, ref } from 'vue';
import { useStore } from 'vuex';
  const store = useStore();
import { useRouter } from 'vue-router';
  const router = useRouter();
import { useDatabase } from '../datasources/firebase.js';
import { ref as dataRef, onValue } from 'firebase/database';
// components //
import Api from './api.vue';
import Playlist from './playlist.vue';
import Account from './account.vue';
import Home from './home.vue'

// ------------------------------------------------------------
let channel = ref(store.getters.page);


</script>