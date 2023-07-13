<template>
    <h2>player</h2>
    <div id="playerBox">
        <div class="playerWrap">
            <div class="pr_mediaWrap" @mouseenter="show=true" @mouseleave="show=false">
                <Transition>
                    <div class="p_title" v-show="show">
                        <p class="p_t_title">{{ listInfo.title }}</p>
                        <p class="p_t_maker">
                            <div class="p_t_avatar">
                                <img :src="listInfo.maker_photoURL">
                            </div>
                            <span class="p_t_name">{{ listInfo.maker_name }}</span>
                        </p>
                    </div>
                </Transition>
                <div class="p_cover">
                    <img :src="listInfo.cover">
                </div>
                <div class="p_bar"></div>
            </div>
            <div class="pr_textWrap">
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
    import {reactive, ref, watch } from 'vue';
    // --------------------------------------------------------
    const playlistKey = route.params.listkey;
    const db = dataRef(useDatabase, 'playlists/' + playlistKey);
    let listInfo = reactive({});
    let show = ref(false);
    get(db).then( snapshot => {
        const data = snapshot.val()
        for(const key in data) {
            listInfo[key] = data[key]
        }
        return data
    }).then((res) => {
        const userDb = dataRef(useDatabase, 'account/' + res.uid);
        get(userDb).then(snapshot => {
            const data = snapshot.val();
            listInfo['maker_name'] = data.name;
            listInfo['maker_photoURL'] = data.photoURL;
        })

    })
</script>

<style scoped>
    .playerWrap {
        display: flex;
        background-color: wheat;
    }
    .pr_mediaWrap{
        width: 50%;
        aspect-ratio: 1/1;
        position: relative;
    }
    .p_cover {
        width: 100%;
        aspect-ratio: 1/1;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: black;
    }
    .p_cover img {
        width: 100%;
    }
    .p_title {
        position: absolute;
        top: 0;
        left: 0;
        height: 20%;
        width: 100%;
        background: linear-gradient(to bottom, rgba(0,0,0,0.9) 30%, transparent) ;
        text-align: start;
        padding-top: 1rem;
        padding-left: 2rem;
        box-sizing: border-box;
    }
    .v-enter-from, .v-leave-to {
        opacity: 0;
    }
    .v-enter-active, .v-leave-active {
        transition: .5s ease;
    }
    .p_t_title {
        color: white;
        font-size: 200%;
        padding-bottom: 0.5em;
    }
    .p_t_maker {
        height: 40%;
        display: flex;
        align-items: center;
        gap: 1em;
        font-size: 100%;
        color: white;
    }
    .p_t_avatar {
        height: 100%;
        aspect-ratio: 1/1;
        border: 1px solid black;
        border-radius: 50%;
        overflow: hidden;
        background-color: white;
    }
    .p_t_avatar img {
        width: 100%;
    }
</style>