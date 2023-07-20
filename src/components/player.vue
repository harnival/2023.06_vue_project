<template>
    <div id="playerBox">
        <div id="player2"></div>
        <div class="playerWrapWrap" @mousemove="(e) => windowMouseMove(e)">
            <div class="playerWrap" v-if="loadCom">
                <div class="pr_mediaWrap" @mouseenter="show=true" @mouseleave="show=false">
                    <Transition>
                        <div class="pr_title" v-show="show">
                            <p class="pr_t_title">
                                <button type="button" class="goBackBtn">뒤로가기</button>
                                <span>{{ listInfo.title }}</span>
                            </p>
                            <p class="pr_t_maker">
                                <div class="pr_t_avatar">
                                    <img :src="listInfo.maker_photo">
                                </div>
                                <span class="pr_t_name">{{ listInfo.maker_name }}</span>
                            </p>
                        </div>
                    </Transition>                    
                    <div class="pr_cover" @click="listOut = !listOut">                    
                        <img :src="listInfo.cover">
                    </div>
                </div>
    
                <div class="pr_contentWrap">
                    <Transition name="listIn">
                        <div class="pr_nowplaying" v-show="!listOut">
                            <div class="pr_np_cover">
                                <div class="pr_np_bar"><div class="pr_np_bar_guage"></div></div>
                                <div class="pr_np_imgWrap">
                                    <img :src="tracksArr[nowPlayingInfo][1].thumbnail" class="pr_np_img">
                                    <div class="pr_np_playState">
                                        <img src="../assets/img/play.svg" @click="pausePlayer" v-if="!isItPlay">
                                        <img src="../assets/img/pause.svg" @click="pausePlayer" v-if="isItPlay">
                                    </div>
                                </div>
                            </div>
                            <div class="pr_np_ball"><div class="ball hoverBall" @mousedown="ballMouseDown"></div></div>
                            <div class="pr_np_text">
                                <p class="pr_np_title">{{ tracksArr[nowPlayingInfo][1].title }}</p>
                                <p class="pr_np_artist">{{ tracksArr[nowPlayingInfo][1].artist }}</p>
                            </div>
                        </div>
                    </Transition>
    
                    <Transition name="listIn">
                        <div class="p_list" v-show="listOut">
                            <ul>
                                <li v-for="(item,index) in tracksArr" class="p_list_list" @click="clickToMusicPlay(index)" :key="item[0]">
                                    <div class="p_list_image">
                                        <img :src="item[1].thumbnail" alt="">
                                    </div>
                                    <div class="p_list_text">
                                        <div class="p_list_title">
                                            <span>{{ item[1].title }}</span>
                                        </div>
                                        <p class="p_list_duration">
                                            {{ item[1].duration['0'] < 10? '0'+item[1].duration[0] : item[1].duration[0] }} : 
                                            {{ !item[1].duration['1']? "00" : item[1].duration[1] < 10? '0'+item[1].duration[1] : item[1].duration[1] }}
                                        </p>
                                        <div class="p_list_artist">
                                            <span>{{ item[1].artist }}</span>
                                        </div>
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
    import { useRoute } from 'vue-router';
        const route = useRoute();
    import {useDatabase} from '../datasources/firebase.js'
    import { ref as dataRef, get } from 'firebase/database';
    import {onBeforeMount, onMounted, reactive, ref, watch, onBeforeUnmount , computed} from 'vue';
    import { useStore } from 'vuex';
        const store = useStore();
    // --------------------------------------------------------//
    let tracksArr = reactive([]);    // 해당 플레이리스트의 트랙 정보
    let deg = ref(0);       // 현재 곡에서 1초당 재생바가 이동하는 각도
    let nowTime = ref(0)       // 현재 곡 재생시간(초)
    let nowTotal = ref(0)       // 현재 곡의 총 길이(초)
    let clickValue = ref(false);    // 마우스 클릭 감시
    const playlistKey = route.params.listkey; //플레이리스트 고유 키
    let listInfo = reactive({});    //해당 플레이리스트의 총 정보
    var player;     // youtube iframe API
    let show = ref(false);      // 제목창 hover 온오프
    let listOut = ref(false);       // 플레이어 - 리스트 온오프
    let nowPlayingInfo = ref(0);        // 현재 재생중인 리스트 순서
    let loadCom = ref(false);
    let intervalId = ref(null);     // 재생시간 인터벌
    let playState = ref(-1);        // 재생상태
// ----------------------------------------------------------------------------

// 플레이어 로드 ========================================================================//
    onMounted(function(){
        console.log("[player mounted]")
        loadCom.value = false;
        get(dataRef(useDatabase, 'playlists/' + playlistKey)).then( snapshot => {

            const data = snapshot.val()
            listInfo = Object.assign(listInfo,data);
            tracksArr = Object.entries(data.tracks);        // [ [ music id , { music info } ], … ]
            return data
        }).then((res) => {
            const users = store.getters.getDataUsers[res.uid];
            listInfo['maker_name'] = users.name;
            listInfo['maker_photo'] = users.photoURL;
            if (!player){       // youtube API 프레임설정
                onYouTubeIframeAPIReady()
            }
            loadCom.value = true;
        })
        
    })
// =====================================================================================//
    const startInterval = function(){
        intervalId.value = setInterval(async function(){
            const cur_sec = await player.getCurrentTime();
            const toSeconds = Math.floor(cur_sec);
            nowTime.value = toSeconds;

        },100)
    }
    const watchNowTime = function(){
        const guage = document.querySelector(".pr_np_bar_guage");
        const ball = document.querySelector(".pr_np_ball");
        
        watch(() => nowTime.value, (cur) => {
            guage.style.transform = `rotateZ(${deg.value * cur}deg)`
            ball.style.transform = `rotateZ(${deg.value * cur}deg)`
        })
    }
    
    
    // 페이지 종료 및 라우터 이동 시 ====================================================================//
    function done() {
        player.destroy()
        clearInterval(intervalId.value)
        console.log("done")
    }
    window.addEventListener('beforeunload',function(){ done(); console.log("[player beforeunload]"); })
    onBeforeUnmount(function(){ done(); console.log("[player beforeunmount]") })
    //=================================================================================================//

    //  iframe API ===================================================//

            const addClass = (index) => {
                const list = document.querySelectorAll(".p_list_list");
                console.log("addclass")
                list.forEach((v,i) => {
                 if( i == index ){
                     v.classList.add('activeList')

                 } else {
                     v.classList.remove('activeList')
                 }
                })
            }
                // 초기 영상 로드 //
            function onYouTubeIframeAPIReady() {
                player = new YT.Player('player2', {
                    height: '0',
                    width: '0',
                    videoId: tracksArr[0][0],
                    events: {
                    'onReady': onVideoReady,
                    'onStateChange': (event) => { playState.value = event.data; }
                    }
                })
                
            }
            const onVideoReady = function(event){
                event.target.playVideo();
                addClass(0);
                startInterval();
                watchNowTime();
                watchNow();
            }
           
            // 재생상태 //
            var isItPlay = ref(true)
            function pausePlayer() {
                const img = document.querySelector(".pr_np_img")
                if( isItPlay.value ){
                    player.pauseVideo()
                    isItPlay.value = false
                    img.style.animationPlayState = 'paused'
                    clearInterval(intervalId.value)
                } else {
                    player.playVideo()
                    isItPlay.value = true
                    img.style.animationPlayState = 'running'
                    startInterval();
                }
            }
            const clickToMusicPlay = function(idx){
               nowPlayingInfo.value = idx
            }

            watch(()=>playState.value, (cur,past) => {      // 재생상태 체인지 시
                if( cur == 1 ){
                    startInterval();
                }
                if ( cur == 0 || cur == -1 ){
                    clearInterval(intervalId.value);
                }
                if(cur == 0 && past == 1){
                    nowPlayingInfo.value = nowPlayingInfo.value < tracksArr.length-1? nowPlayingInfo.value +1 : 0;
                }
            },{immediate : true})

            const watchNow = function(){
                watch(()=> nowPlayingInfo.value, (cur) => {     // 곡 체인지 시
                    const [dm, ds] = tracksArr[cur][1].duration;
                    nowTotal.value = 60 * dm + 1 * ds;
                    deg.value = 180 / nowTotal.value;
    
                    player.loadVideoById(tracksArr[cur][0]);
                    player.playVideo()
                    addClass(cur); 
                },{immediate : true})
            }

            const ballMouseDown = function(event){
                clickValue.value = true;
                const img = document.querySelector(".pr_np_img")
                if(playState.value == 1){
                    player.pauseVideo();
                    isItPlay.value = false
                    img.style.animationPlayState = 'paused'
                    clearInterval(intervalId.value)
                }
            }
            const windowMouseMove = function(event){
                if(clickValue.value){
                    const mx = event.movementX;
                    const my = event.movementY;
                    const len = Math.sqrt( Math.pow(mx,2) + Math.pow(my,2) )
                    if( my < 0 ){
                        nowTime.value = nowTime.value >0? nowTime.value - 0.3 : nowTime.value;
                    } else {
                         nowTime.value =nowTime.value < nowTotal.value? nowTime.value + 0.3 :  nowTime.value; 
                     }
                     console.log(nowTime.value, mx, my)
                }
            }
            window.addEventListener('mouseup',function(){
                const img = document.querySelector(".pr_np_img")
                if(clickValue.value){
                    clickValue.value = false;
                    player.seekTo(nowTime.value,true);
                    player.playVideo();
                    isItPlay.value = true
                    img.style.animationPlayState = 'running'
                    startInterval();
                }
            })

    
    
   
</script>

<style scoped>
    #player2 {
        position: fixed;
        top: 0;
        left: 0;
    }
    #playerBox {
        min-height: 100vh;
        box-sizing: border-box;
        /* background-color: white; */
        /* background-color: rgb(0,0,0,0.9);
        padding-top: var(--header-height);         */
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .playerWrapWrap {
        width: 100%;
        background-color: black;
        /* background: linear-gradient(to right, transparent,black 5% 90%,transparent); */
    }
    .playerWrap {
        display: flex;
        justify-content: center;
        width: 80%;
        margin: auto;
    }
    .pr_mediaWrap{
        width: 50%;
        aspect-ratio: 1/1;
        position: relative;
        z-index: 1000;
    }
    .pr_cover {
        width: 100%;
        aspect-ratio: 1/1;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: black;
        box-shadow: 7px 0px 10px -2px rgba(0, 0, 0, 0.8);
    }
    .pr_cover img {
        width: 100%;
    }
    .pr_title {
        position: absolute;
        top: 0;
        left: 0;
        height: 30%;
        width: 100%;
        background: linear-gradient(to bottom, rgba(0,0,0,0.9) 30%, transparent) ;
        /* background: linear-gradient(to bottom, rgba(255,255,255,0.9) 50%, transparent) ; */
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
    .pr_t_title {
        color: white;
        font-size: 200%;
        padding-bottom: 0.5em;
        font-weight: 600;
    }
    .pr_t_maker {
        height: 30%;
        display: flex;
        align-items: center;
        gap: 1em;
        font-size: 120%;
        color: #ddd;
    }
    .pr_t_avatar {
        height: 100%;
        aspect-ratio: 1/1;
        border: 1px solid black;
        border-radius: 50%;
        overflow: hidden;
        background-color: white;
    }
    .pr_t_avatar img {
        width: 100%;
    }
    /* ------------------------------------------- */
    .pr_contentWrap {        
        width: 50%;
        position: relative;
    }
    .pr_nowplaying {
        height: 100%;
        position: relative;
    }
    .pr_np_cover {
        height: 100%;
        position: relative;
        overflow: hidden;
    }
    .pr_np_imgWrap {
        height: 100%;
        aspect-ratio: 1/1;
        border-radius: 50%;
        overflow: hidden;
        position: absolute;
        top: 0;
        left: 0;
        transform: translateX(-50%) scale(0.99,0.99);
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .pr_np_img {
        height: 100%;
        animation: rotateCover 5s linear infinite ;
    }
    @keyframes rotateCover{
        from{transform:  rotateZ(0deg)}
        to{transform:  rotateZ(360deg)}
        
    }
    .pr_np_cover.pauseMusic img {
        animation-play-state: paused;
    }
    .pr_np_bar {
        height: 100%;
        aspect-ratio: 1/1;
        border-radius: 50%;
        overflow: hidden;
        position: absolute;
        top: 0;
        left: 0;
        transform: translateX(-50%);
        background-color: white;
    }
    .pr_np_bar_guage {
        width: 50%;
        height: 100%;
        background-color: rgb(255,210,11);
        transform-origin: right center;
        z-index: 9999;
    }
    .pr_np_ball{
        width: 0%;
        height: 100%;
        display: flex;
        justify-content: center;
        position: absolute;
        top: 0;
        left: 0;
        transform-origin: center;
        z-index: 2000;
    }
    .ball {
        width: 0.7rem;
        aspect-ratio: 1/1;
        border-radius: 50%;
        background-color: rgb(255,210,11);
        position: absolute;
        transform: translateY(-50%);
        transform-origin: center;
        cursor: pointer;
    }
    .hoverBall:hover {
        transform: scale(1.3,1.3) translateY(-50%);
    }
    .pr_np_text {
        position: absolute;
        top: 50%;
        left: 55%;
    }
    .pr_np_title {
        font-size: 150%;
        color: white;
        margin-bottom: 1rem;
    }
    .pr_np_artist {
        color: rgb(255,255,255,0.8);
    }

    .pr_np_playState {
        position: absolute;
        display: flex;
        justify-content: end;
        align-items: center;
        width: 100%;
        height: 100%;
        opacity: 0.3;
        background-color: rgb(255,255,255,0.4);
    }
    .pr_np_playState:hover {
        opacity: 0.9;
        backdrop-filter: blue(50px);
    }
    .pr_np_playState img {
        display: block;
        width: 15%;
        aspect-ratio: 1/1;
        cursor: pointer;
        background-color: white;
        border-radius: 50%;
        overflow: hidden;
        padding: 5%;
        margin-right: 5%;
    }
    .p_list {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 150;
        background-color: rgba(255, 255, 255, 0.8);
        background: linear-gradient(to right,rgba(255,255,255,0.7) 98%,transparent);

        width: 100%;
        height: 100%;
        overflow-y: auto;
        transition: .3s ease-in-out;
    }
    .listIn-enter-from,
    .listIn-leave-to {
        transform: translateX(-100%);
        opacity: 0;
    }
    .listIn-enter-active,
    .listIn-leave-active {
        transition: .5s ease;
    }
    .p_list_list {
        display: flex;
        height: max(7vh, 5rem);
        border-bottom: 1px solid rgb(0,0,0,0.3);
        cursor: pointer;
        transition: .5s ease;
    }
    .p_list_list.activeList {
        /* background-color: rgb(255,210,11); */
        background: linear-gradient(to right,transparent,rgb(255,210,11) 40% 70%,transparent);
    }
    .p_list_image {
        height: 100%;
        aspect-ratio: 1/1;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        overflow: hidden;
    }
    .p_list_image img {
        height: 100%;
    }
    .p_list_text{
        flex: 1;
    }
    .p_list_title {
        font-size: 150%;
        font-weight: 500;
        height: 50%;
    }
    .p_list_artist {
        font-size: 110%;
        height: 50%;
        color: #666;
    }
    .p_list_duration{
        float: right;
        font-size: 110%;
        padding-right: 1rem;
    }

    .p_list > ul {
        display: flex;
        flex-direction: column;
        padding:0 2rem;
        box-sizing: border-box;
    }
    .p_list > ul > li {
        padding-top: 1rem;
    }
</style>