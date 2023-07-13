<template>
    <div id="homeWrap">

        <div class="section">
            <div class="sec1_title">
                <h3>내 플레이리스트</h3>
                <a href="/" @click.prevent="router.push('/account',{params: {ids : 'my'}})" class="sec_title_btn">더 보기</a>
            </div>
            <div class="sectionWrap">

                <div class="nolist" v-if="!listState">
                    <span>플레이리스트가 없습니다.</span>
                </div>
                <div v-if="listState" class="slideBox">
                    <div class="slideBtnBox">
                        <button type="button" class="leftArrow"></button>
                        <button type="button" class="rightArrow"></button>
                    </div>
                    <div class="sec1_list_wrap" >
                        <ul >
                            <li v-for="(item,key) in myPlaylist" class="sec1_list" :key="key">
                                <div class="sec1_list_image">
                                    <img :src="item.cover">
                                    <button type="button" @click.prevent>플레이리스트 재생</button>
                                </div>
                                <div class="sec1_list_text">
                                    <p class="sec1_l_t_title">
                                        <p class="sec1_l_t_t_wrap">{{ item.title }}</p>
                                        <div v-if="item.uid == useAuth.currentUser.uid" class="pl_title_btn">
                                            <button type="button" @click="clickOpen(key)">메뉴</button>
                                            <div class="sec1_title_menu" v-if="openMenuPop == key">
                                                <a href="/" @click.prevent>수정</a>
                                                <a href="/" @click.prevent>삭제</a>
                                            </div>
                                        </div>
                                    </p>
                                    <p class="sec1_l_t_sub">
                                        <span>총 {{item.tracks? Object.entries(item.tracks).length : 0 }}곡</span>
                                        <span>{{ item.totalLength? item.totalLength : 0  }}</span>
                                    </p>
                                    <p class="sec1_l_t_tag">
                                        <ul>
                                            <li v-for="tag in item.tag">#{{ tag }}</li>
                                        </ul>
                                    </p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="sec1_title">
                <h3># 인기 해시</h3>
            </div>
            <div class="sectionWrap" v-for="(item,key) in popularHashList">
                <div class="hash_title">
                    <p># {{ key }}</p>
                    <a href="/" class="sec_title_btn" @click.prevent>더 보기</a>
                </div>
                <div class="slideBox">
                    <div class="slideBtnBox">
                        <button type="button" class="leftArrow" @click="leftBtn"></button>
                        <button type="button" class="rightArrow" @click="rightBtn"></button>
                    </div>
                    <div class="sec1_list_wrap">
                        <ul>
                            <li class="sec1_list" v-for="items in item" :key="key">
                                <div class="sec1_list_image">
                                    <img :src="store.getters.getDataPlaylists[items].cover">
                                    <button type="button" @click.prevent>플레이리스트 재생</button>
                                    <div class="sec_list_maker" @click="goToMakerAccount(items)">
                                        <div class="sec_l_m_image">
                                            <img :src=" store.getters.getDataUsers[store.getters.getDataPlaylists[items].uid].photoURL">
                                        </div>
                                        <div class="sec_l_m_name">{{ store.getters.getDataUsers[store.getters.getDataPlaylists[items].uid].name }}</div>
                                    </div>
                                </div>
                                <div class="sec1_list_text">
                                    <p class="sec1_l_t_title">
                                        <p class="sec1_l_t_t_wrap">{{ store.getters.getDataPlaylists[items].title }}</p>
                                    </p>
                                    <p class="sec1_l_t_sub">
                                        <span>총 {{store.getters.getDataPlaylists[items].tracks? Object.entries(store.getters.getDataPlaylists[items].tracks).length : 0 }}곡</span>
                                        <span>{{ store.getters.getDataPlaylists[items].totalLength? store.getters.getDataPlaylists[items].totalLength : 0 }}</span>
                                    </p>
                                    <p class="sec1_l_t_tag">
                                        <ul>
                                            <li v-for="tag in store.getters.getDataPlaylists[items].tag">#{{ tag }}</li>
                                        </ul>
                                    </p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        <div class="section">
            <div class="sec1_title">
                <h3>팔로워</h3>
                <a href="/" class="sec_title_btn" @click.prevent>더 보기</a>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref ,reactive, watch, computed} from 'vue';
import { useDatabase , useAuth} from '../datasources/firebase';
import { ref as dataRef, get } from 'firebase/database';
import { useStore } from 'vuex';
    const store = useStore();
import { useRouter } from 'vue-router';
    const router = useRouter();
// -----------------------------------------------------------------------
// 내 플레이리스트 불러오기 //
let myPlaylist = reactive({});
let listState = ref(true)
const form = reactive({
    account : store.getters.getAccount,
    playlists : store.getters.getDataPlaylists
})
watch(() => [form.account, form.playlists], () => {
    if (form.account) {
        if (!form.account['playlist']){
            listState.value = false
        } else {
            listState.value = true
            for( const key in form.account['playlist']) {
                myPlaylist[key] = form.playlists[key]
            }
        }
    }
},{immediate: true, deep: true})

// 해시태그 분석 //
let popularHashList = reactive({});
watch(() => store.getters.getDataHashs, (cur) => {
    const q = [];
    for (const key in cur) {
        const w = Object.values(cur[key])
        q.push([key, ...w]);
    }
    q.sort(function(a,b){
        if (a.length < b.length) {return 1}
        if (a.length > b.length) {return -1}
        return 0
    });
    let r = q.slice(0,3);
    r.forEach(v => {
        const val = v;
        const key = val.shift()
        popularHashList[key] = val
    })
},{immediate: true, deep : true})


// 클릭 이벤트 //
let openMenuPop = ref('');
const clickOpen = function(k){
    openMenuPop.value = openMenuPop.value == k? null : k
}

// 작성자 정보 보러 가기 //
const goToMakerAccount = function(items){
    const uid = store.getters.getDataPlaylists[items].uid;
    router.push({name : 'account', params : { ids : uid}})
}
// 플리카드 hover 시 이벤트 //
const hoverTitle = function(e){
    const title = e.target.querySelector(".sec1_l_t_t_wrap");
    
}

// 슬라이드 이벤트 //
const leftBtn = function(e){
    
    const slideBox = e.target.parentNode.parentNode;
    const slide = slideBox.querySelector(".sec1_list_wrap")
    const boxWidth = slide.clientWidth;
    const slideBody = slideBox.querySelector(".sec1_list_wrap > ul")
    const bodyLeft = slideBody.offsetLeft;
    const bodyWidth = slideBody.offsetWidth;
    const slideUnitLength = slideBody.querySelectorAll(".sec1_list").length;
    let move = bodyWidth / slideUnitLength;
    if( Math.sqrt(bodyLeft*bodyLeft) < move ) {
        slideBody.style.left = `0px`
    }
    else if( bodyWidth > boxWidth + slideUnitLength ) {
        slideBody.style.left = `${bodyLeft - move}px`
    }
}
const rightBtn = function(e){
    const slideBox = e.target.parentNode.parentNode;
    const slide = slideBox.querySelector(".sec1_list_wrap")
    const boxWidth = slide.clientWidth;
    const slideBody = slideBox.querySelector(".sec1_list_wrap > ul")
    const bodyLeft = slideBody.offsetLeft;
    const bodyWidth = slideBody.offsetWidth;
    const slideUnitLength = slideBody.querySelectorAll(".sec1_list").length;
    let move = bodyWidth / slideUnitLength;
    if( bodyLeft < 0) {
        slideBody.style.left = `${bodyLeft + move}px`
    }
}
</script>

<style scoped>
.sectionWrap {
    width: 80%;
    margin: 0 auto;
}
.leftArrow {
    transition: .3s ease;
    position: absolute;
    top: 50%;
    left: -4rem;
    transform: translateY(-50%);
    border: 0;
    width: 4rem;
    aspect-ratio: 1/1;
    background: transparent url('/img/img/arrow-left-circle.svg') no-repeat center/contain;
}
.rightArrow {
    transition: .3s ease;
    position: absolute;
    top: 50%;
    right: -4rem;
    transform: translateY(-50%);
    border: 0;
    width: 4rem;
    aspect-ratio: 1/1;
    background: transparent url('/img/img/arrow-right-circle.svg') no-repeat center/contain;
}
.leftArrow:hover,
.rightArrow:hover {
    opacity: 0.8;
}
    .sec1_title {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .sec1_title h3 {
        font-family: 'Orbit';
        font-size: 200%;
        font-weight: 400;
    }
    .sec_title_btn {
        text-decoration: none;
        color: black;
        display: block;
        font-size: 80%;
        padding: 0.2em 2em 0.2em 1em;
        background: url('/img/img/chevron-double-right.svg') no-repeat center right/ contain;        
        transition: .3s ease;
    }
    .sec_title_btn:hover {
        opacity: 0.7;
        filter: hue-rotate(90deg);
    }
    .sec_list_maker {
        position: absolute;
        top: 0.5rem;
        left: 0.5rem;
        height: 15%;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        border-radius: 2rem;
        cursor: pointer;
        
    }
    .sec_list_maker:hover {
        background-color: rgba(255,255,255,0.7);
        backdrop-filter: blur(5px);
    }
    .sec_l_m_name {
        font-size: 100%;
        padding-right: 0.5rem;
    }

    .sec_l_m_image {
        border: 1px solid black;
        border-radius: 50%;
        height: 100%;
        aspect-ratio: 1/1;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: white;
    }
    .sec_l_m_image img {
        width: 100%;
    }
/* ---------------------------------------------- */
    .sec1_list_wrap,
    .sec2_list_wrap {
        position: relative;
        overflow-x: hidden;
    }
    .sec1_list_wrap > ul,
    .sec2_list_wrap > ul {
        position: relative;
        top: 0;
        left: 0;
        display: flex;
        flex-wrap: nowrap;
    }
    .sec1_list {
        width: 250px;
        margin: 0 1rem;
        height: 100%;
        box-sizing: border-box;
        border-top-left-radius: 2rem;
        border-top-right-radius: 2rem;
        overflow: hidden;
    }
    .sec1_list_image{
        width: 100%;
        aspect-ratio: 1/1;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        background-color: rgba(0,0,0,0.9);
        margin-bottom: 1rem;
    }
    .sec1_list_image img {
        width: 100%;
    }
    .sec1_list_image button {
        position: absolute;
        bottom: 10px;
        right: 10px;
        font-size: 0px;
        width: 20%;
        aspect-ratio: 1/1;
        border-radius: 50%;
        border: none;
        opacity: 0.6;
        background: #ddd url('/img/img/play.svg') no-repeat center / 80%;

    }
    .sec1_l_t_title {
        
        margin-bottom: 1rem;
        padding-right: 0.5rem;
        display: flex;
        justify-content: space-between;
        overflow-x: hidden;
    }
    .sec1_l_t_t_wrap {
        font-size: 120%;
        font-weight: 600;
        word-break: keep-all;
        white-space: nowrap;
    }
    
    .sec1_l_t_sub {
        font-size: 90%;
        color: #666;
        display: flex;
        justify-content: space-between;
        padding: 1em 1em;
    }
    .sec1_l_t_tag ul{
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
    }
    .sec1_l_t_tag li {
        background-color: rgb(194, 194, 255, 0.5);
        padding: 0 1em;
        border-radius: 0.5em;
    }
    /* ---------------------------------------------------- */
    .sec2_title {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .hash_title {
        display: flex;
        justify-content: space-between;
        align-items: center;        
        padding: 2rem;
    }
    .hash_title p{
        font-family: 'Oswald', 'Noto Sans KR';
        font-size: 150%;
        
    }
    .slideBox {
        position: relative;
    }
</style>