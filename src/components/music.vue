<template>
    <div id="musicBox" @scroll="(e) => scrollCheck(e)">
        <div id="youtubePlayer"></div>
        <div class="musicBoxWrap">
            <div class="searchBox">
                <div class="sb_title">
                    <h3>음악검색</h3>
                </div>
                <div class="sb_inputWrap">
                    <div class="focusLine"></div>
                    <form class="inputBox_sb" @submit.prevent="getId">
                        <input type="text" name="input" v-model="searchs" placeholder="제목 또는 아티스트 명을 입력하세요." @focusin="inputFocus" @focusout="inputFocusOut">
                        <button type="submit" class="sb_btn">검색</button>
                    </form>
                </div>
            </div>
            
            <ul class="musicList_wrap">
                <li class="ml_result" v-if="!!videos.length">
                    <span>검색 결과 :</span>

                    <strong>{{ searchs }}</strong>
                </li>
                <li class="ml_empty" v-if="emptyResult">
                    <p>검색 결과가 없습니다.</p>
                </li>
                <li class="musicList" v-for="(item,index) in videos.slice(0,popCut)" :key="item.id">
                    <div class="ml_img_wrap">
                            <div class="ml_img">
                                <img class="ml_i_album" :src="item.thumbnail" alt="">
                                <div class="ml_i_cover" @click="clickToMusicPlay(index,item.id)">
                                    <img class="ml_i_play"  src="../assets/img/play.svg" alt="play" v-if="videoCalled != index || !playState">
                                    <img class="ml_i_pause"  src="../assets/img/pause.svg" alt="pause" v-if="videoCalled == index && playState">
                                </div>
                            </div>
                        </div>
                        <div class="ml_text_wrap">
                            <div class="ml_text">
                                <h5 class="ml_title">{{ item.title }}</h5>
                                <p class="ml_artist">{{ item.artist }}</p>
                            </div>
                            <div class="ml_player" :id='`player_${index}`' v-if="videoCalled == index">
                                <div :class="{ml_player_wrap : true, ml_player_wrap_atv : videoCalled == index}">
                                    <p :class="{ml_p_current : true, ml_p_active : videoCalled == index}">
                                        {{ Math.floor(nowTime/60) <10? '0'+Math.floor(nowTime/60) : Math.floor(nowTime/60) }}:
                                        {{ nowTime%60 < 10? '0'+ Math.floor(nowTime%60) : Math.floor(nowTime%60)}}
                                    </p>
                                    <div :class="{ ml_p_bar : true, ml_p_barActive : videoCalled == index}">
                                        <div class="bar_line">
                                            <div class="bar_line_ball" @mousedown="ballMouseDown"></div>
                                        </div>
                                    </div>
                                    <p class="nl_p_duration">
                                        {{ item.duration[0] < 10? '0'+item.duration[0] : item.duration[0] }} : 
                                        {{ !item.duration[1]? "00" : item.duration[1] < 10? '0'+item.duration[1] : item.duration[1] }}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div class="ml_menu">
                            <button type="button" class="ml_m_add listup" @click="openMenu(item.id)">메뉴 열기</button>
                            <div class="ml_m_list" v-if="openMenuPop == item.id">
                                <ul>
                                    <li>
                                        <a href="#" @click.prevent="() => openAddPop = openAddPop == item.id? null : item.id">플레이리스트에 추가</a>
                                        <div class="ml_m_mylist" v-if="openAddPop == item.id">
                                            <ul>
                                                <li>
                                                    <a href="#"
                                                    style="color: rgb(0,0,0,0.6) !important; border-bottom: 1px solid rgba(0, 0, 0, 0.2);"
                                                    @click="() => oRouter.push({name : 'maker'})"
                                                    >+ 새 플레이리스트 만들기</a>
                                                </li>
                                                <li v-for="(lists,key) in userPlaylist" >
                                                    <a href="#" @click.prevent="addToList(key,item)">{{ lists.title }}</a>
                                                </li>
                                            </ul>
                                        </div>
                                    </li>
                                    <li>
                                        <a href="#" @click.prevent>해당 곡이 들어간 플레이리스트 검색</a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                </li>
            </ul>
            
            <div class="popularMusicListWrap" v-if="popularText">
                <h4 class="popularTextLi"> # 인기 급상승 </h4>
                <ul class="popularMusicList" >
                    <li v-for="(item,index) in popularVideos.slice(0,popCut)" :key="item.id" class="musicList">    
                        <div class="ml_img_wrap">
                            <div class="ml_img">
                                <img class="ml_i_album" :src="item.thumbnail" alt="">
                                <div class="ml_i_cover" @click="clickToMusicPlay(index,item.id)">
                                    <img class="ml_i_play"  src="../assets/img/play.svg" alt="play" v-if="videoCalled != index || !playState">
                                    <img class="ml_i_pause"  src="../assets/img/pause.svg" alt="pause" v-if="videoCalled == index && playState">
                                </div>
                            </div>
                        </div>
                        <div class="ml_text_wrap">
                            <div class="ml_text">
                                <h5 class="ml_title">{{ item.title }}</h5>
                                <p class="ml_artist">{{ item.artist }}</p>
                            </div>
                            <div class="ml_player" :id='`player_${index}`' v-if="videoCalled == index">
                                <div :class="{ml_player_wrap : true, ml_player_wrap_atv : videoCalled == index}">
                                    <p :class="{ml_p_current : true, ml_p_active : videoCalled == index}">
                                        {{ Math.floor(nowTime/60) <10? '0'+Math.floor(nowTime/60) : Math.floor(nowTime/60) }}:
                                        {{ nowTime%60 < 10? '0'+ Math.floor(nowTime%60) : Math.floor(nowTime%60)}}
                                    </p>
                                    <div :class="{ ml_p_bar : true, ml_p_barActive : videoCalled == index}">
                                        <div class="bar_line">
                                            <div class="bar_line_ball" @mousedown="ballMouseDown"></div>
                                        </div>
                                    </div>
                                    <p class="nl_p_duration">
                                        {{ item.duration[0] < 10? '0'+item.duration[0] : item.duration[0] }} : 
                                        {{ !item.duration[1]? "00" : item.duration[1] < 10? '0'+item.duration[1] : item.duration[1] }}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div class="ml_menu">
                            <button type="button" class="ml_m_add listup" @click="openMenu(item.id)">메뉴 열기</button>
                            <div class="ml_m_list" v-if="openMenuPop == item.id">
                                <ul>
                                    <li>
                                        <a href="#" @click.prevent="() => openAddPop = openAddPop == item.id? null : item.id">플레이리스트에 추가</a>
                                        <div class="ml_m_mylist" v-if="openAddPop == item.id">
                                            <ul>
                                                <li class="ml_m_m_new">
                                                    <a href="#" @click.prevent="() => oRouter.push({name : 'maker'})">+ 새 플레이리스트 만들기</a>
                                                </li>
                                                <li v-for="(lists,key) in userPlaylist" >
                                                    <a href="#" @click.prevent="addToList(key,item)">{{ lists.title }}</a>
                                                </li>
                                            </ul>
                                        </div>
                                    </li>
                                    <li>
                                        <a href="#" @click.prevent>해당 곡이 들어간 플레이리스트 검색</a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>


        </div>
    </div>
</template>

<script setup>
// ============================= import ========================================
import axios from 'axios';
import {ref as dataRef, get, child, update} from 'firebase/database';
import {useDatabase, useAuth} from '../datasources/firebase.js'
import { onMounted, ref, reactive, watch , computed, onBeforeMount, onUpdated, onBeforeUnmount} from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
    const oRouter = useRouter();
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
    let userPlaylist = reactive({});    //currentUser 의 플레이리스트 목록 호출
    const openMenuPop = ref(null);
    const listNumber = 5;
    const popCut = ref(listNumber);
// ================================= function ===================================
function inputFocus(){  // 검색창 focusin 시 반응
    const q1 = document.querySelector(".focusLine");
    const q2 = document.querySelector(".sb_btn");
    q1.style.width = '100%';
    q2.style.borderColor = '#A60A27';
}
function inputFocusOut(){   // 검색창 focusouy 시 반응
    const q1 = document.querySelector(".focusLine");
    const q2 = document.querySelector(".sb_btn");
    q1.style.width = '0%';
    q2.style.borderColor = '#aaaaaa';
}
// const savePopular = async function(APIkeys){ // 인기순위 정보 저장
//     popularText.value = true;
//     const set = function(datas){
//         const updates = {};
//         updates['musicSearch/popular'] = datas
//         update(dataRef(useDatabase),updates);
//         return datas
//     }
//     const res = await axios.get("https://www.googleapis.com/youtube/v3/videos",{
//         params: {
//             part: 'snippet, contentDetails',
//             type: 'video',
//             key: APIkeys,
//             chart: 'mostPopular',
//             regionCode : 'kr',
//             videoCategoryId: '10',
//             videoSyndicated: 'true',
//             maxResults: 20
//         }
//     });
//     const dataArr2 = await res.data.items.filter( item => item.snippet.description.includes('Provided to YouTube by'))
//     const dataArr = await dataArr2.map(item => ({
//             id: item.id,
//             title: item.snippet.title.replaceAll('&#39;',`'`).replaceAll('&amp;','&'),
//             artist: (item.snippet.channelTitle).split(' - Topic')[0],
//             thumbnail: `https://i.ytimg.com/vi/${item.id}/maxresdefault.jpg`,
//             url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
//             duration: item.contentDetails.duration.match(/[0-9]+/g)
//         }));
//     const q = await set(dataArr);
//     popularVideos.value = await q
// }
// const dateSetting = function(){ // 갱신 날짜 지정 위해 현재날짜 저장
//     const currentDate = Date.now();
//     const lastSearchTime =store.getters.getDataMusicSearch['lastSearchTime']? new Date(store.getters.getDataMusicSearch['lastSearchTime']) : new Date(0);
//     if ( currentDate >= new Date(lastSearchTime.getFullYear(), lastSearchTime.getMonth(), lastSearchTime.getDate()+1,0,0) ){
//         const updates = {};
//             updates[`musicSearch/popular`] = false;
//             updates[`musicSearch/search`] = false;
//             updates[`musicSearch/lastSearchTime`] = currentDate;
//         update(dataRef(useDatabase),updates);
//     }
// }
function scrollCheck(event){
    const q = event.target;
    if(q.scrollTop === q.scrollHeight - q.clientHeight && popCut.value <= popularVideos.value.length){
        setTimeout(() => {
            popCut.value += listNumber
        }, 500);
    }
}
async function getId(event){ // 검색 시 데이터 호출
    const form1 = new FormData(event.target);
    const form2 = Object.fromEntries(form1.entries()).input;
    const searchData = store.getters.getDataMusicSearch[form2];
    if( !form2 ) {
        alert("검색어를 입력해주세요.")
        return;
    }

    popularText.value = false
    if( !searchData ) {
        const res = await axios.get("https://www.googleapis.com/youtube/v3/search",{
            params: {
                part: 'snippet',
                type: 'video',
                key: APIkey.value,
                q: form2.trim() + " Auto-generated by YouTube.",
                videoCategoryId: '10',
                videoSyndicated: 'true',
                maxResults: 5
            }
        });
        const ddd = await res.data.items.filter(v => !!v.snippet.channelTitle.match(/- Topic|- 주제/g));
        const dataArr = await ddd.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title.replaceAll('&#39;',`'`).replaceAll('&amp;','&'),
            artist: (item.snippet.channelTitle).split(' - Topic')[0],
            thumbnail: `https://i.ytimg.com/vi/${item.id.videoId}/maxresdefault.jpg`,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`
        }));
        console.log("dataArr 1 : ",dataArr)
        
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
            console.log("dataArr 2: ",dataArr,durationPromises)
            Promise.all(durationPromises).then(durations => {   // 재생옥록 
                dataArr.forEach((item, index) => {
                    item.duration = durations[index].match(/[0-9]+/g);
                })
            }).then(res => {
                videos.value = dataArr;
                update(dataRef(useDatabase),{
                    [`musicSearch/search/${form2}`] : dataArr
                });
                store.commit('setDataMusicSearch',{word : form2, data : dataArr});
                console.log(store.getters.getDataMusicSearch, dataArr)
            })
        }

    } else {
        videos.value = searchData;
        console.log('[music search] get stored data - ' + form2);
    }
    videoCalled.value = null
}
// 클릭 이벤트 ====================================================================================================//
function addToList(key,item){   // 해당 음악을 playlist 디렉토리에 추가 (key : platlist디렉토리 키, item : 음악 정보)
    const get1 = store.getters.getUserPlaylists[key].tracks;
    const getLen = Object.keys(get1).length;
    const newItem = {...item};
    newItem.number = getLen;
    if(!Object.hasOwn(get1,item.id)){
        update(dataRef(useDatabase),{
            [`playlists/${key}/tracks/${item.id}`] : newItem
        });
        openAddPop.value = null;
        return alert("플레이리스트에 추가되었습니다.")
    }else{
        return alert("이미 추가된 곡입니다.")
    }
}
function openMenu(id){
    openMenuPop.value = openMenuPop.value == id? null : id;
    openAddPop.value = null;
}
// ===================================================================
onMounted(function(){
    const get1 = store.getters.getPopularMusic
    if(get1){
        
    }
    get(dataRef(useDatabase,'API_key'))     // toutube data API 호출
    .then(snapshot => {
        const data = snapshot.val();
        APIkey.value = data;
        // dateSetting(); // 날짜설정 호출
        return data;
    })
    .then(data => {
        onYouTubeIframeAPIReady();  // 유튜브 iframe 생성
        popularVideos.value = store.getters.getPopularMusic;
    })
    // 초기 정보 호출 //
    // const user = useAuth.currentUser.uid;
    // get(dataRef(useDatabase, `account/${user}/playlist`)).then(snapshot => {
    //     const data = snapshot.val();
    //     userPlaylist.value = Object.keys(data).reverse();
    // });
    userPlaylist = Object.assign(userPlaylist,store.getters.getUserPlaylists);
})
//=====================================================================================================//

// youtube iframe API 설정 ==================================================================//
let playState = ref(false)     // 현재 플레이어 재생상태
let videoCalled = ref(null);        // 현재 재생중인 곡의 순서
let musicTime = ref(0);     // 현재 재생중인 음악의 총 길이
let nowTime = ref(0)        // 지금 재생시간
let intervalId = ref(null);     // 재생시간 인터벌
let mouseValue = ref(null);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtubePlayer', {
        height: '0',
        width: '0',
        videoId: '',
        events: {
        'onReady': onPlayerReady,
        'onStateChange': (e) => { playState.value = e.data === 1? true : false}
        }
    })
}
function onPlayerReady(event) {
    event.target.pauseVideo();
    watchNow();
}
function watchNow(){
    watch(() => videoCalled.value, function(cur){
        const pl = popularVideos.value[cur].duration;
        musicTime.value = 60 * pl[0] + 1 * pl[1];
        
        const barline = document.querySelector(".ml_p_barActive .bar_line");
        barline.style.width = '0px';
    
        watchNowTime();
    })
}
function startInterval(){
    if(intervalId.value){ 
        clearInterval(intervalId.value); 
        intervalId.value = null
    }
    intervalId.value = setInterval(async function(){
        const cur_sec = await player.getCurrentTime();
        const toSeconds = Math.floor(cur_sec*10)/10;
        nowTime.value = toSeconds;
    },100)
}
function clickToMusicPlay(index,musicId){
    if(videoCalled.value == index){
        if(playState.value == 1){
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    } else {
        videoCalled.value = index;
        player.loadVideoById(musicId);
        player.playVideo();
    }
}
function watchNowTime(){
    watch(() => nowTime.value, (cur) => {
        const barline = document.querySelector(".bar_line");
        const bar = document.querySelector(".ml_p_barActive").clientWidth;
        barline.style.width = `${cur * (bar / musicTime.value)}px`
    })
}
function ballMouseDown(){
    if(!mouseValue.value){
        mouseValue.value = true;
        player.pauseVideo()
        window.addEventListener("mousemove",windowMouseMove)
    }
}
function windowMouseUp(){
    if(mouseValue.value){
        player.seekTo(nowTime.value,true);
        player.playVideo()
        mouseValue.value = false;
    }
    window.removeEventListener("mousemove",windowMouseMove);
}
function windowMouseMove(event){
    if(mouseValue.value){
        const mx = event.movementX;
        const nowPlace = nowTime.value;
        if(mx > 0){
            const timeSet = nowPlace == musicTime.value ?  musicTime.value : nowPlace + 1;
            nowTime.value = timeSet;
        }else{
            const timeSet = nowPlace > 0 ? nowPlace - 0.7 : 0;
            nowTime.value = timeSet;
        }
    }
}
watch(() => playState.value, function(cur){
    if(cur){
        startInterval();
    }
    else{
        clearInterval(intervalId.value);
    }
})
window.addEventListener("mouseup",windowMouseUp)

onBeforeUnmount(function(){
    window.removeEventListener("mousemove",windowMouseMove);
    window.removeEventListener("mouseup",windowMouseUp);
    if(player){
        player.destroy();
        clearInterval(intervalId.value);
    }
})
</script>
<style>
    @import '../css/components/music.css';
</style>

