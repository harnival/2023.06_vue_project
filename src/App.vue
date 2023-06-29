<template>
  <header>
    <div class="navBtn"></div>
  </header>
  <main>
    <Login v-if="loginOn"/>
    <Home v-else-if="homeOn"/>
    <Playlist />
  </main>
</template>

<script setup>
import Login from './components/login.vue';
import Home from './components/home.vue';
import Playlist from './components/playlist.vue';

let loginOn, homeOn;

</script>