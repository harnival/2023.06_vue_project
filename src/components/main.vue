<template>
    <div id="mainBox">
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
// components //
import Api from './api.vue';
import Playlist from './playlist.vue';
import Account from './account.vue';

let channel = ref(store.getters.page);


</script>