<template>
    <div id="mainBox">
      <div class="mainLoading" v-if="mainLoadingOn"></div>
      <Playlist v-if="channel == 'Playlist'"/>
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

// ------------------------------------------------------------
let channel = ref(store.getters.page);

// 첫 페이지 로드 시 로딩화면 //
let mainLoadingOn = null;
const dbData = dataRef(useDatabase, 'account');



</script>