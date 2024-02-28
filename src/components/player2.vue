<template>
    <div id="playerBox">
        <div id="player2"></div>
        <div class="playerWrapWrap" >
            <div class="playerWrap" v-if="loadComplete">

                <div class="pr_mediaWrap" @mouseenter="showTitle = true" @mouseleave="showTitle = false" @click="listOut = !listOut">
                    <Transition>
                        <div class="pr_title" v-show="showTitle">
                            <div class="pr_t_title">
                                <button type="button" class="goBackBtn" @click="oRouter.go(-1)">뒤로가기</button>
                                <span>{{ listInfo.title }}</span>
                            </div>
                            <div class="pr_t_maker">
                                <div class="pr_t_avatar">
                                    <img :src="listInfo.makerPhoto">
                                </div>
                                <span class="pr_t_name">{{ listInfo.makerName }}</span>
                            </div>
                        </div>
                    </Transition>                    
                    <div class="pr_cover" >                    
                        <img :src="listInfo.cover">
                    </div>
                </div>
    
                <div class="pr_contentWrap">
                    <Transition :name="windowWidth? 'listIn' : 'listIn767'">
                        <div class="pr_nowplaying" v-show="!listOut">
                            <div class="pr_np_cover">
                                <div class="pr_np_bar">
                                    <div class="pr_np_bar_guage"></div>
                                </div>
                                <div class="pr_np_imgWrap">
                                    <img :src="tracksArr[nowPlaying][1].thumbnail" class="pr_np_img">
                                    <div class="pr_np_playBtn">
                                        <button type="button" class="pr_np_playBtn_repeatState" @click="() => changeRepeatState(repeatStateLast)">
                                            {{ repeatState }}
                                            <img src="../assets/img/repeat.svg" v-if="repeatState === 0"/>
                                            <img src="../assets/img/shuffle-disabled.svg" v-if="repeatState === 1"/>
                                            <img src="../assets/img/repeat-once.svg" v-if="repeatState === 2"/>
                                            <img src="../assets/img/shuffle-variant.svg" v-if="repeatState === 3"/>
                                        </button>
                                        <button type="button" class="pr_np_playBtn_previous" @click="() => moveTrack(true)">previous</button>
                                        <div class="pr_np_playState" @click="changePlayState">
                                            <img src="../assets/img/pause.svg" v-if="playState === 1">
                                            <img src="../assets/img/play.svg"  v-else>
                                        </div>
                                        <button type="button" class="pr_np_playBtn_next" @click="() => moveTrack(false)">next</button>
                                    </div>
                                </div>
                            </div>
                            <div class="pr_np_ball">
                                <div class="ball hoverBall" @mousedown="ballMouseDown"></div>
                            </div>
                            <div class="pr_np_text">
                                <p class="pr_np_title">{{ tracksArr[nowPlaying][1].title }}</p>
                                <p class="pr_np_artist">{{ tracksArr[nowPlaying][1].artist }}</p>
                            </div>
                        </div>
                    </Transition>
    
                    <Transition :name="windowWidth? 'listIn' : 'listIn767'">
                        <div class="p_list" v-show="listOut">
                            <ul>
                                <li v-for="(item,index) in tracksArr" class="p_list_list" @click="nowPlaying = index" :key="item[0]">
                                    <div class="p_list_image">
                                        <img :src="item[1].thumbnail" alt="">
                                    </div>
                                    <div class="p_list_text">
                                        <div class="p_list_title">
                                            {{ item[1].title }}
                                        </div>
                                        <div class="p_list_artist">
                                            {{ item[1].artist }}
                                        </div>
                                        
                                    </div>
                                    <div class="p_list_duration">
                                            {{ item[1].duration['0'] < 10? '0'+item[1].duration[0] : item[1].duration[0] }} : 
                                            {{ !item[1].duration['1']? "00" : item[1].duration[1] < 10? '0'+item[1].duration[1] : item[1].duration[1] }}
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </Transition>
                </div>
    
    
            </div>
        </div>
    </div>
</template>

<script setup>
    import { useRoute, useRouter } from 'vue-router';
        const route = useRoute();
        const oRouter = useRouter();
    import {useDatabase} from '../datasources/firebase.js'
    import { ref as dataRef, get, update } from 'firebase/database';
    import {reactive, ref, watch} from 'vue';
// --------------------------------------------------------//
const playlistId = route.params.listkey;    // 플레이리스트 id
let player;                             // 플레이어 선언
const loadComplete = ref(false);    // 데이터 로드 완료 시 DOM 생성
const showTitle = ref(false);   // 마우스 오버 시 제목 프레임 온오프
const listOut = ref(false);     // false : 플레이어 , true : 곡 리스트
const windowWidth = ref(screen.width > 767); // false : 창 크기 767px 미만 
let tracksArr = reactive([]);  // 트랙 리스트 array
let listInfo = reactive({});  // 플레이리스트 정보
const nowPlaying = ref(0);      // 현재 재생중인 트랙의 번호
    watch(() => nowPlaying.value, (cur) => {
        const list = document.querySelectorAll(".p_list_list");
        list.forEach((v,i) => {
            if( i == cur ){
                v.classList.add('activeList')
    
            } else {
                v.classList.remove('activeList')
            }
        })
        setPlay(cur)
        player.loadVideoById(tracksArr[cur][0]);
        player.playVideo();
        startPlayBar();
    })
const repeatState = ref(3)  // 0 : 순차반복 ,1 : 전체 재생 후 정지, 2 : 한곡 반복, 3 : 랜덤재생
    const repeatStateLast = 3;
const playState = ref(1);      // 재생상태 : -1 (시작하지않음) 0 (종료) 1(재생) 2 (일시정지) 3 (버퍼링) 5 (동영상신호)
    watch(() => playState.value, (cur,past) => {
        const img = document.querySelector(".pr_np_img")
        if(cur === 1){
            startInterval();
            img.style.animationPlayState = 'running';
        }
        if(cur === 2 || cur === 3){
            clearInterval(interval.value);
            img.style.animationPlayState = 'paused';
        }
        if(cur === 0 && past === 1){    // 순차반복
            switch (repeatState.value) {
                case 0:
                    nowPlaying.value = nowPlaying.value === tracksArr.length - 1? 0 : nowPlaying.value + 1
                    break;
                case 1:
                    if(nowPlaying.value === tracksArr.length - 1){
                        nowTime.value = 0;
                        player.stopVideo()
                    }else{
                        nowPlaying.value += 1;
                    }
                    break;
                case 2:
                    setPlay(nowPlaying.value)
                    player.loadVideoById(tracksArr[nowPlaying.value][0]);
                    player.playVideo();
                    startPlayBar();
                    break;
                case 3:
                    const shuffle = function(){
                        const ran = Math.floor(Math.random() * tracksArr.length);
                        if(ran === nowPlaying.value){
                            return shuffle()
                        }else {
                            nowPlaying.value = ran
                        }
                    }
                    shuffle()
                    break;
                default:
                    break;
            }
        }
    })
const interval = ref(null);    // 감시 시작
const nowTime = ref(0)      // 현재 플레이타임 실시간 입력
const deg = ref(0)          // 초당 움직이는 각도
const nowTotal = ref(0)     // 현재 재생중인 곡의 총 길이 [s]
const clickValue = ref(false);  // 재생바 클릭 유무
    
// --------------------------------------------------------//
function startPlayBar(){
    watch(() => [nowTime.value, windowWidth.value], (cur) => {
        const guage = document.querySelector(".pr_np_bar_guage");
        const ball = document.querySelector(".pr_np_ball");
        if(cur[1]){
            guage.style.transform = `rotateZ(${deg.value * cur[0]}deg)`
            ball.style.transform = `rotateZ(${deg.value * cur[0]}deg)`
        } else {
            guage.style.transform = `rotateZ(${-deg.value * cur[0]}deg)`
            ball.style.transform = `rotateZ(${-deg.value * cur[0]}deg)`
        }
    })
}
function startInterval(){
    interval.value = setInterval(async function(){
        const now = await player.getCurrentTime();
        nowTime.value = Math.floor(now*10)/10
        // console.log(nowTime.value, " / ", nowTotal.value, " / ", deg.value)
    },100)
}
function playerReady(event){
    const v = event.target;
    const list = document.querySelectorAll(".p_list_list")[0];
    v.playVideo();
    nowPlaying.value = 0;
    startPlayBar();
    list.classList.add("activeList")
}
function youtubeAPIReady(){
    player = new YT.Player('player2', {
        height: '0',
        width: '0',
        videoId: tracksArr[0][0],
        events: {
        'onReady': (event) => playerReady(event),
        'onStateChange': (event) => { playState.value = event.data; }
        }
    })
}
function breakPlayer(){
    if(player){
        player.destroy();
        clearInterval(interval.value)
        console.log("[player destroy]")
    }
}
function changePlayState(){
    if( playState.value === 1 ){
        player.pauseVideo()
    } else {
        player.playVideo()
    }
}
function moveTrack(direction){
    if(repeatState.value === 3){
        const shuffle = function(){
            const ran = Math.floor(Math.random() * tracksArr.length);
            if(ran === nowPlaying.value){ return shuffle() }
            else { return nowPlaying.value = ran }
        }
        shuffle()
    }else {
        if(direction){  // 이전 곡으로 이동
            nowPlaying.value = nowPlaying.value === 0? tracksArr.length - 1 : nowPlaying.value - 1
        } else {
            nowPlaying.value = nowPlaying.value === tracksArr.length - 1? 0 : nowPlaying.value + 1
        }
    }
}
function setPlay(cur){
    // 선택한 리스트 재생
    const [dm, ds] = tracksArr[cur][1].duration;
    const trackLength = 60 * dm + 1 * ds;
    nowTotal.value = trackLength;
    deg.value = 180 / trackLength;
}
function ballMouseDown(){
    if(playState.value === 1){
        player.pauseVideo()
    }
    clickValue.value = true;
    window.addEventListener("mousemove",ballMouseMove)
    window.addEventListener("mouseup",ballMouseUp)

}
function ballMouseMove(event){
    if(clickValue.value){
        const my = event.movementY;
        const cover = document.querySelector(".pr_np_cover");
        const coverHeight = cover.clientHeight;
        const ratio = nowTotal.value / coverHeight;
        if(my>0){
            nowTime.value = nowTime.value >= nowTotal.value? nowTotal.value : nowTime.value +  Math.floor(my * ratio * 10)/10;
        }else {
            nowTime.value = nowTime.value <= 0? 0 : nowTime.value +  Math.floor(my * ratio * 10)/10;
        }
    }
}
function ballMouseUp(){
    if(clickValue.value){
        clickValue.value = null;
        player.seekTo(nowTime.value,true);
        player.playVideo();
    
        window.removeEventListener("mousemove",ballMouseMove)
        window.removeEventListener("mouseup",ballMouseUp)
    }
}
function changeRepeatState(last){
    const q = repeatState.value;
    if(q === last){
        repeatState.value = 0;
    }else {
        repeatState.value += 1;
    }
}
// --------------------------------------------------------//
get(dataRef(useDatabase,`playlists/${playlistId}`))
    .then(snapshot => { const data = snapshot.val(); return data})
    .then(data => {
        listInfo = Object.assign(listInfo,data);
        tracksArr = Object.entries(data.tracks);
        setPlay(0)
        // if(tracksArr[0] && !tracksArr[0][1].number){
        //     const ta = [...tracksArr]
        //     for(const value of ta){
                
        //         const idx = ta.indexOf(value);
        //         console.log(idx,value)
        //         const up = {};
        //         up[`playlists/${playlistId}/tracks/${value[0]}/number`] = idx
        //         update(dataRef(useDatabase),up)
        //     }
        // }
        return data
    })
    .then(async(data) => {
        const user = await get(dataRef(useDatabase,`user/${data.uid}/info`));
        listInfo["makerName"] = user.val().name;
        listInfo["makerPhoto"] = user.val().photoURL;
        if(player){ breakPlayer() }
;    })
    .then(() => {
        youtubeAPIReady();
        loadComplete.value = true;
    })
    .catch(err => console.log("[player loading error] : ",err))
</script>

<style>
    @import '../css/components/player.css';
</style>