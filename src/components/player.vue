<template>
    <div id="playerBox">
        <div id="player2"></div>
        <div class="playerWrapWrap">
            <div class="playerWrap">
                <div class="pr_mediaWrap" @mouseenter="show=true" @mouseleave="show=false">
                    <Transition>
                        <div class="pr_title" v-show="show">
                            <p class="pr_t_title">{{ listInfo.title }}</p>
                            <p class="pr_t_maker">
                                <div class="pr_t_avatar">
                                    <img :src="listInfo.maker_photoURL">
                                </div>
                                <span class="pr_t_name">{{ listInfo.maker_name }}</span>
                            </p>
                            <a href="/" @click.prevent></a>
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
                                <div class="pr_np_imgWrap" @click="qqqq">
                                    <img :src="tracksArr[nowPlayingInfo][1].thumbnail" class="pr_np_img">
                                    <div class="pr_np_playState">
                                        <img src="../assets/img/play.svg" @click="pausePlayer" v-if="!isItPlay">
                                        <img src="../assets/img/pause.svg" @click="pausePlayer" v-if="isItPlay">
                                    </div>
                                </div>
                            </div>
                            <div class="pr_np_ball"><div class="ball hoverBall"></div></div>
                            <div class="pr_np_text">
                                <p class="pr_np_title">{{ tracksArr[nowPlayingInfo][1].title }}</p>
                                <p class="pr_np_artist">{{ tracksArr[nowPlayingInfo][1].artist }}</p>
                            </div>
                        </div>
                    </Transition>
    
                    <Transition name="listIn">
                        <div class="p_list" v-show="listOut">
                            <ul>
                                <li v-for="(item,key,index) in listInfo.tracks" class="p_list_list" @click="clickToMusicPlay(index)">
                                    <div class="p_list_image">
                                        <img :src="item.thumbnail" alt="">
                                    </div>
                                    <div class="p_list_text">
                                        <div class="p_list_title">
                                            <span>{{ item.title }}</span>
                                        </div>
                                        <p class="p_list_duration">
                                            {{ item.duration['0'] < 10? '0'+item.duration[0] : item.duration[0] }} : 
                                            {{ !item.duration['1']? "00" : item.duration[1] < 10? '0'+item.duration[1] : item.duration[1] }}
                                        </p>
                                        <div class="p_list_artist">
                                            <span>{{ item.artist }}</span>
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
    var player;
    // --------------------------------------------------------//
    let listInfo = reactive({});    //해당 플레이리스트의 총 정보
    let tracksArr = ref([]);    // 해당 플레이리스트의 트랙 정보

    onBeforeMount(function(){
        // 템플릿 로드 전 정보 설정 --> 
        const playlistKey = route.params.listkey; //플레이리스트 고유 키
        const db = dataRef(useDatabase, 'playlists/' + playlistKey);
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

    })
    const clickValue = reactive({});
    onMounted(function(){
        if (!player){
            onYouTubeIframeAPIReady()
        }

        const ball = document.querySelector(".ball")
        ball.addEventListener('mousedown',function(event){
            clickValue['click'] = true;
        })
        window.addEventListener('mouseup',function(){
            clickValue['click'] = false;
        })
        window.addEventListener('mousemove',function(event){
        })
        watch(() => clickValue['click'], cur => {
            console.log(cur)
        })
    })
    onBeforeUnmount(function(){
        if(player){
            player.destroy()
            clearInterval(set)
        }
    })
    watch(() => listInfo, cur => {
        tracksArr.value = Object.entries(cur.tracks);
    },{ deep: true})

    let show = ref(false);

    // 재생시간 //
    let nowTime = ref(0)
    const set = function(){
        return setInterval(function(){
            const time = Math.floor(player.getCurrentTime()); 
            if(nowTime.value !== time){
                nowTime.value = time
            }
        },1000)
    }
    watch(() => nowTime.value, cur => {
        const guage = document.querySelector('.pr_np_bar_guage');
        const ball = document.querySelector('.pr_np_ball');
        const [minutes , seconds] = tracksArr.value[nowPlayingInfo.value][1].duration;
        const totalTime = 60 * minutes + 1*seconds;
        const nowSet = 180 / totalTime;
        if(cur == 0) {
            guage.style.transition = '';
            ball.style.transition = '';
            guage.style.transform = `rotateZ(0deg)`
            ball.style.transform = `rotateZ(0deg)`
        } else {
            guage.style.transition = '1s linear';
            ball.style.transition = '1s linear';
            guage.style.transform = `rotateZ(${ cur * nowSet }deg)`
            ball.style.transform = `rotateZ(${ cur * nowSet }deg)`
        }
    })
    
    
    //  iframe API ===================================================//

    let playState = ref(-1)
    let videoCalled = ref(null);
    let playTime = ref(0);
    
    const addClass = (index) => {
        const list = document.querySelectorAll(".p_list_list");
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
        store.commit('setSetLoading',true)
        player = new YT.Player('player2', {
            height: '0',
            width: '0',
            videoId: tracksArr.value[0][0],
            events: {
            'onReady': onPlayerReady,
            'onStateChange': stateChange
            }
        })
        addClass(0)
        store.commit('setSetLoading',false)
    }
    function stateChange(event) { // 플레이어 상태 변화 실시간 입력
        playState.value = event.data;
        if (event.data == 0) {
            clearInterval(set);
        }
    }
    function onPlayerReady(event) {
        event.target.playVideo();
        set();
    }
    // 재생상태 //
    var isItPlay = ref(true)
    function pausePlayer() {
        const img = document.querySelector(".pr_np_img")
        if( isItPlay.value ){
            player.pauseVideo()
            isItPlay.value = false
            img.style.animationPlayState = 'paused'
        } else {
            player.playVideo()
            isItPlay.value = true
            img.style.animationPlayState = 'running'
        }
    }
    //======================================================iframe API//
    // 현재 재생 중인 노래 정보 실시간 입력 //
    let nowPlayingInfo = ref(0);
    const clickToMusicPlay = function(index){
       nowPlayingInfo.value = index
    }
    watch(()=>playState.value, (cur,past) => {
        if(cur == 0 && past == 1){
            nowPlayingInfo.value = nowPlayingInfo.value < tracksArr.value.length-1? nowPlayingInfo.value +1 : 0;
        }
    })
    watch(()=> nowPlayingInfo.value, (cur) => {
        player.loadVideoById(tracksArr.value[cur][0]);
        player.playVideo()
        addClass(cur);
        
    })
    // 컨텐츠 부분 플레이어와 리스트 //
    let listOut = ref(false);
    
    
   
</script>

<style scoped>
    #player2 {
        position: fixed;
        top: 0;
        left: 0;
    }
    #playerBox {
        padding-top: var(--header-height);        
        height: 100vh;
        box-sizing: border-box;
        /* background-color: white; */
        background-color: rgb(0,0,0,0.9);
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
        background-color: blue;
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
        transform: rotateZ(0deg);
        transform-origin: center;
        z-index: 2000;
    }
    .ball {
        width: 0.7rem;
        aspect-ratio: 1/1;
        border-radius: 50%;
        background-color: blue;
        position: absolute;
        transform: translateY(-50%);
        transform-origin: center center;
        cursor: pointer;
    }
    .hoverBall:hover {
        transform-origin: center;
        transform: scale(1.5,1.5);
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