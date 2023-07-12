<template>
  <h2>main</h2>
    <div id="mainBox">
      <Home v-if="channel == 'Home'"/>
      <Music v-else-if="channel == 'Music'"/>
      <Playlist v-else-if="channel == 'Playlist'"/>
    </div>
</template>

<script setup>
import { watch, ref} from 'vue';
import { useStore } from 'vuex';
  const store = useStore();
import { useRouter,useRoute, onBeforeRouteUpdate } from 'vue-router';
  const router = useRouter();
  const route = useRoute();
import { useDatabase } from '../datasources/firebase.js';
import { ref as dataRef, onValue } from 'firebase/database';
// components //
import Music from './music.vue';
import Playlist from './playlist.vue';
import Home from './home.vue'

// ------------------------------------------------------------

let channel = ref('Home');
watch(()=> store.getters.page, (cur) => {
  channel.value = cur
})


</script>