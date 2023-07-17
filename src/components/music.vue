<template>
    <div id="musicBox">
        <div id="youtubePlayer"></div>
        <div class="musicBoxWrap">
            <div class="searchBox">
                <div class="sb_inputWrap">
                    <div class="focusLine"></div>
                    <div class="inputBox_sb">
                        <input type="text" v-model="searchs" placeholder="제목 또는 아티스트 명을 입력하세요." @focusin="inputFocus" @focusout="inputFocusOut">
                        <button class="sb_btn" @click="getId">검색</button>
                    </div>
                </div>
            </div>
            
            <ul class="musicList_wrap">
                <li class="ml_empty" v-if="emptyResult">
                    <p>검색 결과가 없습니다.</p>
                </li>
                <li class="musicList" v-for="item in videos" :key="item.id">
                    <div :id="'player_'+item.id"></div>
                    <div class="ml_img_wrap">
                        <div class="ml_img">
                            <img class="ml_i_album" :src="item.thumbnail" alt="">
                            <div class="ml_i_cover" data-play="play" @click="clickToMusicPlay(item.id)">
                                <img class="ml_i_play"  src="../assets/img/play.svg" alt="play" v-if="videoCalled != item.id || playState != 1">
                                <img class="ml_i_pause"  src="../assets/img/pause.svg" alt="pause" v-if="videoCalled == item.id && playState == 1">
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
                            <p :class="{ml_p_current : true, ml_p_active : videoCalled == item.id}">
                                <span v-if="videoCalled==item.id">
                                    {{ Math.floor(nowTime/60) <10? '0'+Math.floor(nowTime/60) : Math.floor(nowTime/60) }}:
                                    {{ nowTime%60 < 10? '0'+nowTime%60 : nowTime%60}}
                                </span>
                            </p>
                            <p class="nl_p_duration">
                                {{ item.duration[0] < 10? '0'+item.duration[0] : item.duration[0] }} : 
                                {{ !item.duration[1]? "00" : item.duration[1] < 10? '0'+item.duration[1] : item.duration[1] }}
                            </p>
                        </div>
                    </div>
                    <div class="ml_menu">
                        <button type="button" class="ml_m_add listup" @click="clickAdd(item.id)">플레이리스트에 추가</button>
                        <div class="ml_m_mylist" v-if="openAddPop == item.id">
                            <ul>
                                <li>+ 새 플레이리스트 만들기</li>
                                <li v-for="lists in userPlaylist" >
                                    <a href="/" @click.prevent="addToList(lists[0],item)">{{ store.getters.getDataPlaylists[lists[0]].title }}</a>
                                </li>
                            </ul>
                        </div>
                        <button type="button" class="ml_m_search">해당 곡이 들어간 플레이리스트 검색</button>
                    </div>
                </li>
            </ul>
    
            <ul class="popularMusicList" v-if="popularText">
                <li  class="popularTextLi"> # 인기 급상승 </li>
                <li v-for="(item,index) in popularVideos" :key="item.id" class="musicList">
                    <div :id="'popularPlayer_'+item.id"></div>
    
                    <div class="ml_img_wrap">
                        <div class="ml_img">
                            <img class="ml_i_album" :src="item.thumbnail" alt="">
                            <div class="ml_i_cover" data-play="play" @click="clickToMusicPlay(item.id,item.duration)">
                                <img class="ml_i_play"  src="../assets/img/play.svg" alt="play" v-if="videoCalled != item.id || playState != 1">
                                <img class="ml_i_pause"  src="../assets/img/pause.svg" alt="pause" v-if="videoCalled == item.id && playState == 1">
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
                            <p :class="{ml_p_current : true, ml_p_active : videoCalled == item.id}">
                                {{ Math.floor(nowTime/60) <10? '0'+Math.floor(nowTime/60) : Math.floor(nowTime/60) }}:
                                {{ nowTime%60 < 10? '0'+nowTime%60 : nowTime%60}}
                            </p>
                            <p class="nl_p_duration">
                                {{ item.duration[0] < 10? '0'+item.duration[0] : item.duration[0] }} : 
                                {{ !item.duration[1]? "00" : item.duration[1] < 10? '0'+item.duration[1] : item.duration[1] }}
                            </p>
                        </div>
                    </div>
                    <div class="ml_menu">
                        <button type="button" class="ml_m_add listup" @click="clickAdd(item.id)">플레이리스트에 추가</button>
                        <div class="ml_m_mylist" v-if="openAddPop == item.id">
                            <ul>
                                <li>+ 새 플레이리스트 만들기</li>
                                <li v-for="lists in userPlaylist" >
                                    <a href="/" @click.prevent="addToList(lists,item)">{{ store.getters.getDataPlaylists[lists[0]].title }}</a>
                                </li>
                            </ul>
                        </div>
                        <button type="button" class="ml_m_search">해당 곡이 들어간 플레이리스트 검색</button>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
// ============================= import ========================================
import axios from 'axios';
import {ref as dataRef, get, child, update} from 'firebase/database';
import {useDatabase, useAuth} from '../datasources/firebase.js'
import { onMounted, ref, reactive, watch , computed, onBeforeMount, onUpdated} from 'vue';
import { useStore } from 'vuex';
    const store = useStore();
    
// ================================= varient ===================================
    let player; // 유튜브 iframe 컨테이너
    let videos = ref([]);   // 검색한 비디오 array
    let popularVideos = ref([]);    // 인기 순위 array
    let APIkey = ref('');   // 유튜브 API key
    let searchs = ref('');  // 검색창 입력값
    let popularText = ref(true);    // 인기 리스트 온오프
    let emptyResult = ref(false);   // 결과가 없을 시 안내 문구 출력 온오프
    let openAddPop = ref('');   // 플레이리스트 추가 창 온오프
    let userPlaylist = reactive([]);    //currentUser 의 플레이리스트를 playlists 디렉토리에서 호출( array )

// ================================= function ===================================
const inputFocus = () => {  // 검색창 focusin 시 반응
    const q1 = document.querySelector(".focusLine");
    const q2 = document.querySelector(".sb_btn");
    q1.style.width = '100%';
    q2.style.borderColor = '#A60A27';
}
const inputFocusOut = () => {   // 검색창 focusouy 시 반응
    const q1 = document.querySelector(".focusLine");
    const q2 = document.querySelector(".sb_btn");
    q1.style.width = '0%';
    q2.style.borderColor = '#aaaaaa';
}
const mo = async function(APIkeys){ // 인기순위 정보 호출
    popularText.value = true;
    const set = function(datas){
        const updates = {};
        updates['musicSearch/popular'] = datas
        update(dataRef(useDatabase),updates);
        return datas
    }
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
    const dataArr = await dataArr2.map(item => ({
            id: item.id,
            title: item.snippet.title.replaceAll('&#39;',`'`).replaceAll('&amp;','&'),
            artist: (item.snippet.channelTitle).split(' - Topic')[0],
            thumbnail: `https://i.ytimg.com/vi/${item.id}/maxresdefault.jpg`,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            duration: item.contentDetails.duration.match(/[0-9]+/g)
        }));
    const q = await set(dataArr);
    popularVideos.value = await q
}
const dateSetting = function(){ // 갱신 날짜 지정 위해 현재날짜 저장
    const currentDate = Date.now();
    const lastSearchTime =store.getters.getDataMusicSearch['lastSearchTime']? new Date(store.getters.getDataMusicSearch['lastSearchTime']) : new Date(0);
    if ( currentDate >= new Date(lastSearchTime.getFullYear(), lastSearchTime.getMonth(), lastSearchTime.getDate()+1,0,0) ){
        const updates = {};
            updates[`musicSearch/popular`] = false;
            updates[`musicSearch/search`] = false;
            updates[`musicSearch/lastSearchTime`] = currentDate;
        update(dataRef(useDatabase),updates);
    }
}

// ===================================================================


onMounted(function(){
    // Youtube API key 호출 //
    get(dataRef(useDatabase,'API_key'))
    .then(snapshot => {
        dateSetting(); // 날짜설정 호출
        const data = snapshot.val();
        APIkey.value = data;
        return data;    // 유튜브 API key
    })
    .then(data => {
        onYouTubeIframeAPIReady();  // 유튜브 iframe 생성
        const popular = store.getters.getDataMusicSearch['popular'];    // 인기순위 호출 or 저장소 호출
        if( !popular ) {
            mo(data);
        } else {
            popularVideos.value = popular;
        }
    })
    
    
})
async function getId(){ // 검색 시 데이터 호출
    const searchData = store.getters.getDataMusicSearch['search'];
    if( !searchs.value ) {
        mo(APIkey.value);
        return;
    }
    popularText.value = false
    if( !searchData[searchs.value] ) {
        const res = await axios.get("https://www.googleapis.com/youtube/v3/search",{
            params: {
                part: 'snippet',
                type: 'video',
                key: APIkey.value,
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
            thumbnail: `https://i.ytimg.com/vi/${item.id.videoId}/maxresdefault.jpg`,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`
        }));
        
        if(!dataArr) {
            emptyResult.value = true;
        }else {
            emptyResult.value = false;
            const durationPromises = await dataArr.map(async (item) => {
                const response = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
                    params: {
                    part: 'contentDetails',
                    id: item.id,
                    key: APIkey.value
                    }
                    });
                    return response.data.items[0].contentDetails.duration;
            });
        
            Promise.all(durationPromises).then(durations => {   // 재생옥록 
                dataArr.forEach((item, index) => {
                    item.duration = durations[index].match(/[0-9]+/g);
                })
            }).then(res => {
                videos.value = dataArr;
                store.commit('storeSearching',dataArr);
            })
        }

    } else {
        videos.value = searchData[searchs.value];
        console.log('[music search] get stored data - ' + searchs.value);
    }
}
// ---------------------------------------------------------------------------
// 클릭 이벤트 //

const clickAdd = function(key){ // 플레이리스트에 곡 추가하기 위해 버튼 클릭 (key : account의 playlist 목록)
    const q = Object.keys(Object.entries(store.getters.getAccount.playlist).reverse());
    if(userPlaylist){
        Object.assign(userPlaylist,q);
    }  //----> 
   
    openAddPop.value = openAddPop.value == key? null : key; // 해당 key를 가진 element만 열림
}
const addToList = function(key,item){   // 해당 음악을 playlist 디렉토리에 추가 (key : platlist디렉토리 키, item : 음악 정보)
    const updateToMine = {};
        updateToMine[`playlists/${key}/tracks/${item.id}`] = item;
    update(dataRef(useDatabase),updateToMine);
    openAddPop.value = openAddPop.value == key? null : key;

}
    //3. 음악 재생 버튼
//  https://developers.google.com/youtube/iframe_api_reference?hl=ko#Loading_a_Video_Player

let playState = ref(-1)
let videoCalled = ref(null);
let musicTime = ref(0);
let nowTime = ref(0)
const setPlayTime = function(){
    return setInterval(function(){
        const time = Math.floor(player.getCurrentTime()); 
        if(nowTime.value !== time){
            nowTime.value = time
        }
    },1000)
}

const clickToMusicPlay = function(currentId,duration){
    musicTime.value = 60 * duration[0] + 1* duration[1];
    if( videoCalled.value != currentId ) {
        player.loadVideoById(currentId);
        videoCalled.value = currentId;
    } else if ( player.getPlayerState() == 1 ){
        player.pauseVideo();
    } else {
        player.playVideo();
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

function stateChange(event) { // 플레이어 상태 변화 실시간 입력
    playState.value = event.data;
    clearInterval(setPlayTime)
}
function onPlayerReady(event) {
    event.target.pauseVideo();
    setPlayTime()
}

//재생시간
const qqqqq = function(id){

}
watch(() => videoCalled.value, cur => {
})

</script>

<style scoped>
#musicBox {
    background:
        linear-gradient(45deg,rgba(0,0,0, 0.7),rgba(0, 0, 0, 0.7)),
            linear-gradient(240deg, transparent,red),
            linear-gradient(45deg, transparent,yellow);
        min-height: 100vh;
}
.musicBoxWrap {
    width: 80%;
    max-width: 1280px;
    margin: auto;
    background-color: rgba(0, 0, 0, 0.61);
    min-height: 100vh;
    padding: 5vh 2rem;
}
.popularMusicList {
    padding: 0;
    position: relative;
}
.popularTextLi {
    text-align: start;
    position: absolute;
    bottom: 100%;
    left: 0;
    color:white;
    font-family: 'NanumSquareNeoBold';
    font-size: 150%;
}
.musicList_wrap {
    width: 70%;
    margin: auto;
    background-color: black;
}
.musicList {
    position: relative;
    display: flex;
    align-items: center;
    gap: 1rem;
    width: 100%;
    height: max(18vh, 8rem);
    background-color: white;
    padding: 2rem 5%;
    box-sizing: border-box;
    margin: auto;
    border-bottom: 1px solid #666;
    border-radius: 2rem;
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
.bar_line {
    background-color: #A60A27;
    height: 100%;
}
.ml_p_current {
    width: 0em;
    overflow: hidden;
    display: flex;
    justify-content: start;
    transition: .5s ease-in-out;
    word-break: keep-all;
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
    background: url('../assets/img/plus.png') center/80% no-repeat;
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
    background: url('../assets/img/search.svg') center/80% no-repeat;
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
    background: url('../assets/img/plus.png') no-repeat center left 1rem/ contain;
}
.ml_m_mylist li a:hover {
    background-color: rgba(255,255,255,0.5);
}
/* -------------------------------------------------------------------- */
.searchBox {
    position: relative;
    display: flex;
    justify-content: center;
    box-sizing: border-box;
    border-radius: 2rem;
    background-color: white;
    margin: 10% auto;
    padding: 1rem 0;
    height: fit-content;
}
.sb_inputWrap {
    width: 80%;
    position: relative;
}
.searchBox input {
    width: 100%;
    font-size: 100%;
    padding: 1rem 10%;
    box-sizing: border-box;
    border: 0;
    border-bottom: 2px solid #aaa;
    outline: none;
    z-index: 8000;
}
.inputBox_sb {
    z-index: 8000;
}
.focusLine {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 0;
    height: 2px;
    background-color: #A60A27;
    transition: .5s ease;
}
.sb_btn {
    font-size: 0px;
    position: absolute;
    right: 0;
    top: 0;
    border-width: 2px;
    border-style: solid;
    border-color: #aaaaaa;
    background: transparent url('../assets/img/search.svg') center/2rem no-repeat;
    height: 100%;
    aspect-ratio: 2/1;
    cursor: pointer;
    transition: .5s ease;
}
.sb_btn:hover {
    background-color: #a60a278a;
    border-color: #a60a278a;
}
</style>
