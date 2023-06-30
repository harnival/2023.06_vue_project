<template>
  <header>
    <div class="navBtn">
      <nav>
        <ul>
          <li>{{ lang("홈","HOME") }}</li>
          <li>{{ lang("랜덤플리","RAMDON PLAYLIST") }}</li>
          <li>{{ lang("인기","POPULAR") }}</li>
          <li>
            <p>{{ lang("해시태그 탐색대","HASHTAG ADVENTURE") }}</p>
            <dl>
              <dt>{{ lang("장르별","GENRE") }}</dt>
              <dt>{{ lang("기분파","HOW ARE YOU") }}</dt>
            </dl>
          </li>
        </ul>
      </nav>
    </div>
  </header>
  <main>
    <Login v-if="channel == 'Login'"/>
    <Home v-else-if="channel == 'Home'"/>
    <Playlist />
  </main>
</template>

<script setup>
// import ------------------------------------------------------------------------------
import {ref} from 'vue';
import Login from './components/login.vue';
import Home from './components/home.vue';
import Playlist from './components/playlist.vue';
// common function ---------------------------------------------------------------------
const lang = (a,b) => {
  // a : kor , b = eng //
  return this.$store.getters.langKor? a : b
}
let channel = ref(this.$store.getters.page);



</script>

<style>
body {
  margin: 0;
  padding: 0;
  min-width: 320px;
}
ul,li {
  list-style: none;
  margin: 0px;
  padding: 0px;
}
#app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
  border: 1px solid black;
}
</style>
<style scoped>
</style>