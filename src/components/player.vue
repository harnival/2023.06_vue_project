<template>
    <div id="playerBox">
        <div class="playerWrap">
            <div class="pr_mediaWrap">
                <div class="p_cover">
                    <img :src="listInfo.cover">
                </div>
                <div class="p_bar"></div>
            </div>
            <div class="pr_textWrap">
                <div class="p_title">
                    <span>{{ listInfo.title }}</span>
                </div>
                <div class="p_nowPlaying">
                    <span></span>
                </div>
            </div>
            <div class="p_list">
                <ul>
                    <li v-for="item in listInfo.tracks">
                        <div class="p_list_image">
                            <img :src="item.image" alt="">
                        </div>
                        <div class="p_list_title">
                            <span>{{ item.title }}</span>
                        </div>
                        <div class="p_list_artist">
                            <span>{{ item.artist }}</span>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { useRoute } from 'vue-router';
        const route = useRoute();
    import {useDatabase} from '../datasources/firebase.js'
    import { ref as dataRef, get } from 'firebase/database';
    import { reactive, ref } from 'vue';
import { sortUserPlugins } from 'vite';
    // --------------------------------------------------------
    const playlistKey = route.params.listkey;
    const db = dataRef(useDatabase, 'playlists/' + playlistKey);

    let maker = ref('');
    let listInfo = {};
    get(db).then( snapshot => {
        const data = snapshot.val()
        maker.value = data.maker;
        listInfo = data.contents;
        console.log(listInfo)
    })
</script>

<style scoped>
    
</style>