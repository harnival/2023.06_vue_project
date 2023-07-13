<template>
    <div>
        <div id="youtubePlayer"></div>
        <div class="searchBox">
            <div class="sb_inputWrap">
                <input type="text" v-model="searchs" placeholder="제목 또는 아티스트 명을 입력하세요." @focusin="inputFocus" @focusout="inputFocusOut">
                <div class="focusLine"></div>
                <button class="sb_btn" @click="getId">검색</button>
            </div>
        </div>
        <ul>
            <li class="musicList" v-for="item in videos" :key="item.id">
                <div :id="'player_'+item.id"></div>
                <div class="ml_img_wrap">
                    <div class="ml_img">
                        <img class="ml_i_album" :src="item.thumbnail" alt="">
                        <div class="ml_i_cover" data-play="play" @click="clickToMusicPlay(item.id)">
                            <img class="ml_i_play"  src="/img/img/play.svg" alt="play" v-if="videoCalled != item.id || playState != 1">
                            <img class="ml_i_pause"  src="/img/img/pause.svg" alt="pause" v-if="videoCalled == item.id && playState == 1">
                            <img class="ml_i_replay"  src="/img/img/replay.svg" alt="replay" v-if="videoCalled == item.id && playState == 0">
                        </div>
                    </div>
                </div>
                <div class="ml_text_wrap">
                    <div class="ml_text">
                        <h5 class="ml_title">{{ item.title }}</h5>
                        <p class="ml_artist">{{ item.artist }}</p>
                    </div>
                    <div class="ml_player">
                        <div :class="{ ml_p_bar : true, ml_p_active : videoCalled == item.id}">
                            <div class="bar_line"></div>
                        </div>
                        <p :class="{ml_p_current : true, ml_p_active : videoCalled == item.id}">00:00</p>
                        <p class="nl_p_duration">
                            {{ item.duration[0] < 10? '0'+item.duration[0] : item.duration[0] }} : 
                            {{ !item.duration[1]? "00" : item.duration[1] < 10? '0'+item.duration[1] : item.duration[1] }}
                        </p>
                    </div>
                </div>
                <div class="ml_menu">
                    <button type="button" class="ml_m_add listup" @click="(e) => clickAdd(e,item.id)">플레이리스트에 추가</button>
                    <div class="ml_m_mylist" v-if="openAddPop == item.id">
                        <ul>
                            <li>+ 새 플레이리스트 만들기</li>
                            <li v-for="lists in userPlaylist" >
                                <a href="/" @click.prevent="addToList(lists[1],lists[2],item)">{{ lists[1].title }}</a>
                            </li>
                        </ul>
                    </div>
                    <button type="button" class="ml_m_search">해당 곡이 들어간 플레이리스트 검색</button>
                </div>
            </li>
        </ul>
    </div>
</template>

<script setup>
import Youtube from './youtube.vue'
import axios from 'axios';
import {ref as dataRef, get, child, update} from 'firebase/database';
import {useDatabase, useAuth} from '../datasources/firebase.js'
import { onMounted, ref, reactive, watch , computed, onBeforeMount} from 'vue';
import { useStore } from 'vuex';
    const store = useStore();
let player;
// common ------------------------------------------------------------------
const inputFocus = () => {
    const q1 = document.querySelector(".focusLine");
    const q2 = document.querySelector(".sb_btn");
    q1.style.width = '100%';
    q2.style.borderColor = '#A60A27';
}
const inputFocusOut = () => {
    const q1 = document.querySelector(".focusLine");
    const q2 = document.querySelector(".sb_btn");
    q1.style.width = '0%';
    q2.style.borderColor = '#aaaaaa';
}
// API key 받아오기 ----------------------------------------------- //
let APIkey = ref('');

//----------------------------------------------------------------

let videos = ref([]);
let userPlaylist = ref([]);

onMounted(function(){
    // Youtube API key 호출 //
    get(dataRef(useDatabase,'API_key'),)
    .then(snapshot => {
        const data = snapshot.val();
        APIkey.value = data;
        return data;
    })
    .then(data => {
        mo(data);
        onYouTubeIframeAPIReady();
        return player
    }).then((player) => {
        watch(() => player.getCurrentTime(), cur => {
            console.log(cur)
        },{immediate:true,deep:true})
    })
    
    // 첫 로딩 시 인기 음악 정렬 //
    const mo = async function(APIkeys){
        const res = await axios.get("https://www.googleapis.com/youtube/v3/videos",{
            params: {
                part: 'snippet, contentDetails',
                type: 'video',
                key: APIkeys,
                chart: 'mostPopular',
                regionCode : 'kr',
                videoCategoryId: '10',
                videoSyndicated: 'true',
                maxResults: 10
            }
        });
        const dataArr2 = await res.data.items.filter( item => item.snippet.description.includes('Provided to YouTube by'))
        console.log('[인기 음악 목록]',dataArr2)
        const dataArr = await dataArr2.map(item => ({
                id: item.id,
                title: item.snippet.title.replaceAll('&#39;',`'`).replaceAll('&amp;','&'),
                artist: (item.snippet.channelTitle).split(' - Topic')[0],
                thumbnail: item.snippet.thumbnails.high.url,
                url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
                duration: item.contentDetails.duration.match(/[0-9]+/g)
            }));
        videos.value = await dataArr
    }
})
// 검색 제출 시 내용 도출 //
let searchs = ref('');
async function getId(){
    const res = await axios.get("https://www.googleapis.com/youtube/v3/search",{
        params: {
            part: 'snippet',
            type: 'video',
            key: APIkey,
            q: searchs.value + " Auto-generated by YouTube.",
            videoCategoryId: '10',
            videoSyndicated: 'true',
            maxResults: 5
        }
    });
    const dataArr = await res.data.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title.replaceAll('&#39;',`'`).replaceAll('&amp;','&'),
            artist: (item.snippet.channelTitle).split(' - Topic')[0],
            thumbnail: item.snippet.thumbnails.high.url,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`
        }));

    const durationPromises = await dataArr.map(async (item) => {
        const response = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
            params: {
            part: 'contentDetails',
            id: item.id,
            key: APIkey
            }
            });
            return response.data.items[0].contentDetails.duration;
    });

    Promise.all(durationPromises).then(durations => {
        dataArr.forEach((item, index) => {
            item.duration = durations[index].match(/[0-9]+/g);
        })
    }).then(res => {
        videos.value = dataArr;
        store.commit('storeSearching',dataArr);
        console.log(videos.value);
        console.log(dataArr);
    })
    
}
// ---------------------------------------------------------------------------
// 클릭 이벤트 //
    // 1. 플레이리스트 선택 창 열기
let openAddPop = ref('');
const clickAdd = function(event,key){
    console.log(key)
    userPlaylist.value = Object.entries(store.getters.getAccount.playlist).reverse();
    openAddPop.value = openAddPop.value == key? null : key;
    console.log('[userPlaylist api]',userPlaylist.value)
}
    // 2. 플레이리스트 선택
const addToList = function(lists,key,item){
    const updateToMine = {};
        updateToMine[`account/${useAuth.currentUser.uid}/playlist/${key}/tracks/${item.id}`] = item;
        updateToMine[`playlists/${key}/contents/tracks/${item.id}`] = item;
    update(dataRef(useDatabase),updateToMine);
    openAddPop.value = openAddPop.value == key? null : key;
}
    //3. 음악 재생 버튼
//  https://developers.google.com/youtube/iframe_api_reference?hl=ko#Loading_a_Video_Player

let playState = ref(-1)
let videoCalled = ref(null);
let playTime = ref(0);
const clickToMusicPlay = function(currentId){
     if( videoCalled.value != currentId ) {
        player.loadVideoById(currentId);
        videoCalled.value = currentId;
    } else if ( player.getPlayerState() == 1 ){
        player.pauseVideo();
    } else {
        player.playVideo()        
     }
}

    // 초기 영상 로드 //
function onYouTubeIframeAPIReady() {
    store.commit('setSetLoading',true)
    player = new YT.Player('youtubePlayer', {
        height: '0',
        width: '0',
        videoId: '0c7zGU2C2mM',
        events: {
        'onReady': onPlayerReady,
        'onStateChange': stateChange
        }
    })
    store.commit('setSetLoading',false)
}
function stateChange(event) {
    playState.value = event.data;
    
}
function onPlayerReady(event) {
    event.target.pauseVideo();
}
var done = false;
function stopVideo() {
player.stopVideo();
}
</script>

<style scoped>
.musicList {
    position: relative;
    display: flex;
    align-items: center;
    gap: 1rem;
    border: 1px dashed tomato;
    width: 80%;
    height: max(14vh, 4rem);
    background-color: white;
    padding: 0.5em;
    margin: auto;
}
.ml_img_wrap {
    height: 100%;
}
.ml_img {
    border: 1px solid black;
    border-radius: 50%;
    height: 100%;
    aspect-ratio: 1/1;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    transition: .5s ease;
    background-color: white;
}
.ml_img:hover {
    box-shadow: 1px 2px 5px 0px #666;
}
.ml_i_cover {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: rgba(255,255,255,0.5);
    opacity: 0.4;
    transition: .5s ease;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
}
.ml_i_cover:hover {
    background-color: rgba(255,255,255,0.5);
    opacity: 1;
}
.ml_i_cover img {
    width: 80%;
}
.ml_i_album {
    display: block;
    height: 150%;
}
.ml_i_cover img.removed {
    display: none;
}
.stopRoll {
    animation-play-state: paused;
}
@keyframes rolling{
    from{ transform: rotateZ(0deg); }
    to{ transform: rotateZ(360deg); }
}
.ml_player {
    display: flex;
    align-items: center;
    gap: 1rem;
}
.ml_text_wrap{
    width: 100%;
    padding-right: 5%;
}
.ml_text {
    display: flex;
    align-items: center;
    gap: 2rem;
    margin-bottom: 1rem;
}
.ml_title {
    padding: 0px;
    margin: 0px;
    font-size: 150%;
}
.ml_artist {
    padding: 0px;
    margin: 0px;
}
.ml_p_bar {
    height: 0.5rem;
    overflow: hidden;
    background-color: #eee;
    width: 0;
    transition: .8s ease-in-out;
}
.ml_p_bar.ml_p_active {
    width: 70%
}
.ml_p_current {
    width: 0em;
    overflow: hidden;
    display: flex;
    justify-content: start;
    transition: .5s ease-in-out;
}
.ml_p_current.ml_p_active {
    width: 3em;
}
.ml_player p{
    padding: 0px;
    margin: 0px;
}
.ml_menu {
    position: relative;
}
.ml_menu button{
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background-color: #ddd;  
    border: 0;
    font-size: 0px;
}
.ml_m_add {
    background: url('/img/img/plus.png') center/80% no-repeat;
    margin-bottom: 3px;
    position: relative;
    display: flex;
    align-items: center;
}
.ml_m_add.listup:hover:before {
    content: '내 플레이리스트에 추가';
    display: flex;
    align-items: center;
    padding: 0.5em;
    font-size: 0.8rem;
    position: absolute;
    right: 120%;
    width: fit-content;
    height: 100%;
    word-break: keep-all;
    white-space: nowrap;
    background-color: rgba(0,0,0,0.4);
    border-radius: 1em;
    color: white;
}
.ml_m_search {
    background: url('/img/img/search.svg') center/80% no-repeat;
    position: relative;
    display: flex;
    align-items: center;
}
.ml_m_search:hover:before {
    content: '해당 곡이 들어간 플레이리스트 검색';
    display: flex;
    align-items: center;
    padding: 0.5em;
    font-size: 0.8rem;
    position: absolute;
    right: 120%;
    width: 10em;
    height: 100%;
    word-break: keep-all;
    background-color: rgba(0,0,0,0.4);
    border-radius: 1em;
    color: white;
}
.ml_m_mylist {
    position: absolute;
    top: 0;
    right: 120%;
    width: 20rem;
    background-color: rgba(0,0,0,0.2);
    box-shadow: 1px 2px 5px 0px #666;
    backdrop-filter: blur(10px);
}
.ml_m_mylist li a {
    display: block;
    text-decoration: none;
    color: black;
    background: url('/img/img/plus.png') no-repeat center left 1rem/ contain;
}
.ml_m_mylist li a:hover {
    background-color: rgba(255,255,255,0.5);
}
/* -------------------------------------------------------------------- */
.searchBox {
    position: relative;
    display: flex;
    justify-content: center;
}
.sb_inputWrap {
    width: 50%;
    position: relative;
}
.searchBox input {
    width: 100%;
    height: 2.5em;
    font-size: 100%;
    padding: 0.5em 10%;
    box-sizing: border-box;
    border: 0;
    border-bottom: 1px solid #aaa;
    outline: none;
}
.focusLine {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 0;
    height: 1px;
    background-color: #A60A27;
    transition: .5s ease;
}
.sb_btn {
    font-size: 0px;
    position: absolute;
    right: 0;
    top: 0;
    border: 1px solid #aaaaaa;
    background: transparent url('/img/img/search.svg') center/2rem no-repeat;
    height: 100%;
    width: 5rem;
    cursor: pointer;
    transition: .5s ease;
}
.sb_btn:hover {
    background-color: #a60a278a;
    border-color: transparent;
}
</style>../../public/youtube.js@/youtube.js