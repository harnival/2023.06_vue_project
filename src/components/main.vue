<template>
    <div id="mainBox">
        <Playlist v-if="channel == 'Playlist'"/>
        <Api v-else-if="channel == 'Api'"/>
    </div>
</template>

<script setup>
// library //
import { onAuthStateChanged } from 'firebase/auth';

// components //
import Playlist from './components/playlist.vue';
import Api from './components/api.vue'

let channel = ref(store.getters.page);


onAuthStateChanged(useAuth,(user) => {
  if(user){
    channel = 'Home'
    oRouter.push('/');
  } else {
    console.log('change logout')
    oRouter.push('/login')
  }
})
</script>