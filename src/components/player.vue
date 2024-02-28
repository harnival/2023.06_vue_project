<template>
    <div id="playerBox">
        <div id="player2"></div>
        <div class="playerWrapWrap" >
            <div class="playerWrap" v-if="loadCom">
                <div class="pr_mediaWrap" @mouseenter="show=true" @mouseleave="show=false">
                    <Transition>
                        <div class="pr_title" v-show="show">
                            <p class="pr_t_title">
                                <button type="button" class="goBackBtn" @click="oRouter.go(-1)">뒤로가기</button>
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
                    <Transition :name="windowWidth? 'listIn' : 'listIn767'">
                        <div class="pr_nowplaying" v-show="!listOut">
                            <div class="pr_np_cover">
                                <div class="pr_np_bar">
                                    <div class="pr_np_bar_guage"></div>
                                </div>
                                <div class="pr_np_imgWrap">
                                    <img :src="tracksArr[nowPlayingInfo][1].thumbnail" class="pr_np_img">
                                    <div class="pr_np_playState">
                                        <img src="../assets/img/play.svg" @click="pausePlayer" v-if="!isItPlay">
                                        <img src="../assets/img/pause.svg" @click="pausePlayer" v-if="isItPlay">
                                    </div>
                                </div>
                            </div>
                            <div class="pr_np_ball">
                                <div class="ball hoverBall" @mousedown="ballMouseDown"></div>
                            </div>
                            <div class="pr_np_text">
                                <p class="pr_np_title">{{ tracksArr[nowPlayingInfo][1].title }}</p>
                                <p class="pr_np_artist">{{ tracksArr[nowPlayingInfo][1].artist }}</p>
                            </div>
                        </div>
                    </Transition>
    
                    <Transition :name="windowWidth? 'listIn' : 'listIn767'">
                        <div class="p_list" v-show="listOut">
                            <ul>
                                <li v-for="(item,index) in tracksArr" class="p_list_list" @click="nowPlayingInfo = index" :key="item[0]">
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
    import { useRoute, useRouter } from 'vue-router';
        const route = useRoute();
        const oRouter = useRouter();
    import {useDatabase} from '../datasources/firebase.js'
    import { ref as dataRef, get } from 'firebase/database';
    import {onBeforeMount, onMounted, reactive, ref, watch, onBeforeUnmount , computed} from 'vue';
    import { useStore } from 'vuex';
        const store = useStore();
// --------------------------------------------------------//
    const playlistKey = route.params.listkey; //플레이리스트 고유 키
    let tracksArr = reactive([]);    // 해당 플레이리스트의 트랙 정보
    let deg = ref(0);       // 현재 곡에서 1초당 재생바가 이동하는 각도
    let nowTime = ref(0)       // 현재 곡 재생시간(초)
    let nowTotal = ref(0)       // 현재 곡의 총 길이(초)
    let clickValue = ref(null);    // 마우스 클릭 감시
    let listInfo = reactive({});    //해당 플레이리스트의 총 정보
    let player;     // youtube iframe API
    let show = ref(false);      // 제목창 hover 온오프
    let listOut = ref(false);       // 플레이어 - 리스트 온오프
    let nowPlayingInfo = ref(0);        // 현재 재생중인 리스트 순서
    let loadCom = ref(false);
    let intervalId = ref(null);     // 재생시간 인터벌
    let playState = ref(-1);        // 재생상태
    let windowWidth = ref(screen.width > 767 ? true : false)
        const resize = function(e){
            windowWidth.value = e.target.innerWidth > 767? true : false;
        }
        window.addEventListener('resize',resize)
    const isItPlay = ref(true)
    
// function----------------------------------------------------------------------------
    const startInterval = function(){
        if(intervalId.value){ 
            clearInterval(intervalId.value); 
            intervalId.value = null
        }
        intervalId.value = setInterval(async function(){
                const cur_sec = await player.getCurrentTime();
                const toSecond = Math.floor(cur_sec); 
                nowTime.value = toSecond;
        },100)
    }
    const done = function(){
        if(player){
            player.destroy()
            clearInterval(intervalId.value)
            console.log("done")
        }
    }
    const onYouTubeIframeAPIReady = function() {
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
        nowPlayingInfo.value = 0;
        addClass(0);
        startInterval();
        watchNowTime();
        watchNow();
    }
    const addClass = function(index){
        const list = document.querySelectorAll(".p_list_list");
        list.forEach((v,i) => {
            if( i == index ){
                v.classList.add('activeList')

            } else {
                v.classList.remove('activeList')
            }
        })
    }
    const pausePlayer = function() {
        const img = document.querySelector(".pr_np_img")
        if( playState.value === 1 ){
            player.pauseVideo()
            // isItPlay.value = false
            img.style.animationPlayState = 'paused'
            // clearInterval(intervalId.value)
        } else {
            player.playVideo()
            // isItPlay.value = true
            img.style.animationPlayState = 'running'
            // startInterval();
        }
    }
    
    const ballMouseDown = function(){
        player.pauseVideo();
        clickValue.value = true;
        window.addEventListener('mousemove',windowMouseMove);
    }
    const mouseMoveEvent = function(){
        const img = document.querySelector(".pr_np_img")

        player.seekTo(nowTime.value,true);
        player.playVideo();
        clickValue.value = null;

        window.removeEventListener('mousemove',windowMouseMove);
        window.removeEventListener('mouseup',mouseMoveEvent)
    }
// 플레이어 로드 ========================================================================//
    onMounted(function(){
        get(dataRef(useDatabase, 'playlists/' + playlistKey)).then( snapshot => {
            const data = snapshot.val()
            listInfo = Object.assign(listInfo,data);
            tracksArr = Object.entries(data.tracks);        // [ [ music id , { music info } ], … ]
            return data
        }).then(async(res) => {
            const users = await get(dataRef(useDatabase,`account/${res.uid}`));
            listInfo['maker_name'] = users.val().name;
            listInfo['maker_photo'] = users.val().photoURL;
            if (!player){       // youtube API 프레임설정
                onYouTubeIframeAPIReady()
            }else {
                done();
                onYouTubeIframeAPIReady()
            }
        }).then(() => {
            loadCom.value = true;
        }).catch(err =>
            console.log("[player loading error] : ",err)
        )
        watch(()=> nowPlayingInfo.value, (cur) => {     // 곡 체인지 
            console.log("nowPlayingInfo : ", cur)
            const [dm, ds] = tracksArr[cur][1].duration;
            nowTotal.value = 60 * dm + 1 * ds;
            deg.value = 180 / nowTotal.value;
    
            player.loadVideoById(tracksArr[cur][0]);
            player.playVideo()
            addClass(cur); 
        })
    })
    watch(()=>playState.value, (cur,past) => {      // 재생상태 체인지 시
        const img = document.querySelector(".pr_np_img");
        if( cur == 1 ){
            startInterval();
            img.style.animationPlayState = 'running';
        }
        if ( cur == 0 || cur == -1 ){
            clearInterval(intervalId.value);
            img.style.animationPlayState = 'paused';
        }
        if(cur == 0 && past == 1){
            nowPlayingInfo.value = nowPlayingInfo.value < tracksArr.length-1? nowPlayingInfo.value +1 : 0;
        }
    })
    
    
// =====================================================================================//

// 플레이타임 실시간 감시========================================================//
    
const watchNowTime = function(){
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
            console.log(nowPlayingInfo.value, nowTime.value, nowTotal.value)
        },{immediate:false,deep:true})
    }
    
// ============================================================================================//
    
// 페이지 종료 및 라우터 이동 시 플레이어 초기화====================================================================//
    
    window.addEventListener('beforeunload',function(){
        done();
        window.removeEventListener('resize', resize);
        window.removeEventListener('mouseup', watchNow);
        window.removeEventListener('mousemove', (e) => windowMouseMove(e));
        console.log("[player beforeunload]"); 
    })
    onBeforeUnmount(function(){
        done();
        window.removeEventListener('resize', resize);
        window.removeEventListener('mouseup', watchNow);
        window.removeEventListener('mousemove', (e) => windowMouseMove(e));
        console.log("[player beforeunmount]") 
    })
//=================================================================================================//

//========================================================================================//

    

    

    const watchNow = function(){
        if(clickValue.value){
            player.seekTo(nowTime.value,true);
            player.playVideo();
            // isItPlay.value = true;
            // img.style.animationPlayState = 'running';
            clickValue.value = null;
        }
    }
    
    const windowMouseMove = function(event){
        if(clickValue.value){
            const mx = event.movementX;
            const my = event.movementY;
            const nowPlace = nowTime.value;
            if(windowWidth.value){
                if((nowPlace < nowTotal.value / 2 && mx > 0 && my > 0) || (nowPlace >= nowTotal.value / 2 && mx<0 && my >0)){
                    const timeSet = nowPlace == nowTotal.value ?  nowTotal.value : nowPlace + 0.7;
                    nowTime.value = timeSet;
                }
                else if((nowPlace < nowTotal.value / 2 && mx<0 && my<0) || (nowPlace >= nowTotal.value / 2 && mx>0 && my<0)){
                    const timeSet = nowPlace > 0 ? nowPlace - 0.7 : 0;
                    nowTime.value = timeSet;
                }
            }
        }
    }
    window.addEventListener("mousemove",(e) => windowMouseMove(e))
    window.addEventListener("mouseup",watchNow)
    // watch(() => clickValue.value , cur => {
    //     const img = document.querySelector(".pr_np_img");

    //     if(cur){
    //         player.pauseVideo();
    //         isItPlay.value = null;
    //         img.style.animationPlayState = 'paused';
    //         clickValue.value = true;

    //     } else {
            
    //     }
    // },{immediate:false})
    
   
</script>

<style>
    @import '../css/components/player.css';
</style>