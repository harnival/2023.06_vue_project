<template>
    <div id="homeWrap">

        <div class="section">
            <div class="sectionWrap">
                <div class="sec_title">
                    <h3>내 플레이리스트</h3>
                    <a href="/" @click.prevent="router.push({name: 'account',params: {ids : useAuth.currentUser.uid}})" class="sec_title_btn">더 보기</a>
                </div>
    
                <div class="sec_content">
    
                    <div class="nolist" v-if="!listState">
                        <span>플레이리스트가 없습니다.</span>
                    </div>

                    <div v-if="listState" class="slideBox">
                        <div class="slideBtnBox">
                            <button type="button" class="leftArrow" @click="rightBtn"></button>
                            <button type="button" class="rightArrow" @click="leftBtn"></button>
                        </div>
                        <div class="sec_list_wrap" >
                            <ul >
                                <li v-for="(item,key) in myPlaylist" class="sec_list" :key="key">
                                    <div class="sec_list_image">
                                        <img :src="item.cover">
                                        <button type="button" @click.prevent="router.push({name: 'player', params : {listkey : key}})">플레이리스트 재생</button>
                                    </div>
                                    <div class="sec_list_text">
                                        <p class="sec1_l_t_title">
                                            <p class="sec1_l_t_t_wrap">{{ item.title }}</p>
                                            <div v-if="item.uid == useAuth.currentUser.uid" class="pl_title_btn">
                                                <button type="button" @click="clickOpen(key)">메뉴</button>
                                                <div class="sec_title_menu" v-if="openMenuPop == key">
                                                    <a href="/" @click.prevent>수정</a>
                                                    <a href="/" @click.prevent="deleteList(key)">삭제</a>
                                                </div>
                                            </div>
                                        </p>
                                        <p class="sec1_l_t_sub">
                                            <span>총 {{item.tracks? Object.entries(item.tracks).length : 0 }}곡</span>
                                            <span>{{  totalLength(item.tracks) }}</span>
                                        </p>
                                        <p class="sec1_l_t_tag">
                                            <ul>
                                                <li v-for="(tag,tagkey) in item.tag">#{{ tagkey }}</li>
                                            </ul>
                                        </p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="sectionWrap">
                <div class="sec_title">
                    <h3># 인기 해시</h3>
                </div>
                <div class="sec_content2" v-for="(item,key) in popularHashList">
                    <div class="hash_title">
                        <p># {{ key }}</p>
                        <a href="/" class="sec_title_btn" @click.prevent>더 보기</a>
                    </div>
                    <div class="slideBox">
                        <div class="slideBtnBox">
                            <button type="button" class="leftArrow" @click="rightBtn"></button>
                            <button type="button" class="rightArrow" @click="leftBtn"></button>
                        </div>
                        <div class="sec_list_wrap">
                            <ul>
                                <li class="sec_list" v-for="(items,itemkey) in item" :key="key">
                                    <div class="sec_list_image">
                                        <img :src="store.getters.getDataPlaylists[items].cover">
                                        <button type="button" @click.prevent="router.push({name: 'player', params: {listkey: itemkey}})">플레이리스트 재생</button>
                                        <div class="sec_list_maker" @click="goToMakerAccount(items)">
                                            <div class="sec_l_m_image">
                                                <img :src=" store.getters.getDataUsers[store.getters.getDataPlaylists[items].uid].photoURL">
                                            </div>
                                            <div class="sec_l_m_name">{{ store.getters.getDataUsers[store.getters.getDataPlaylists[items].uid].name }}</div>
                                        </div>
                                    </div>
                                    <div class="sec_list_text">
                                        <p class="sec1_l_t_title">
                                            <p class="sec1_l_t_t_wrap">{{ store.getters.getDataPlaylists[items].title }}</p>
                                        </p>
                                        <p class="sec1_l_t_sub">
                                            <span>총 {{store.getters.getDataPlaylists[items].tracks? Object.entries(store.getters.getDataPlaylists[items].tracks).length : 0 }}곡</span>
                                            <span>{{ store.getters.getDataPlaylists[items].totalLength? store.getters.getDataPlaylists[items].totalLength : 0 }}</span>
                                        </p>
                                        <p class="sec1_l_t_tag">
                                            <ul>
                                                <li v-for="(tag,tagkey) in store.getters.getDataPlaylists[items].tag">#{{ tagkey }}</li>
                                            </ul>
                                        </p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="sectionWrap">
                <div class="sec_title">
                    <h3>팔로워</h3>
                    <a href="/" class="sec_title_btn" @click.prevent>더 보기</a>
                </div>
            </div>
        </div>

        <div class="listmodal" v-if="openmodal">
            <form @submit.prevent>
                <div class="lm_img">
                    <input type="file" name="replaceImg" id="lm_replaceImg">
                    <img :src="currentSelectList.cover">
                    <div class="lm_img_cover"></div>
                </div>
                <div class="lm_title">
                    <input type="text" :value="currentSelectList.title">
                </div>
                <div class="lm_tag">
                    <div>
                        <input type="text">
                        <ul>
                            <li v-for="(item,itemkey) in currentSelectList.tag">
                                {{ itemkey }}
                                <a href="/" @click.prevent=""></a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="lm_tracks"></div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref ,reactive, watch, computed} from 'vue';
import { useDatabase , useAuth} from '../datasources/firebase';
import { ref as dataRef, get, update } from 'firebase/database';
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
watch(() => [form.account, form.playlists], (cur) => {
    if (cur[0]) {
        if (!cur[0]['playlist']){
            listState.value = false
        } else {
            listState.value = true
            for( const key in cur[0]['playlist']) {
                if(cur[1].playlist){
                    myPlaylist[key] = cur[1][key]
                }
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
    const slide = slideBox.querySelector(".sec_list_wrap")
        const boxWidth = slide.clientWidth;
    const slideBody = slideBox.querySelector(".sec_list_wrap > ul")
        const bodyLeft = slideBody.offsetLeft;
        const bodyWidth = slideBody.offsetWidth;
    const slideUnitLength = slideBody.querySelectorAll(".sec_list").length;
    let move = bodyWidth / slideUnitLength;
    if( bodyLeft < move && bodyLeft > 0) {
        slideBody.style.left = `0px`
    }
    else if( bodyWidth + bodyLeft - boxWidth < move ) {
        slideBody.style.left = `-${bodyWidth - boxWidth}px`
    }
    else if( bodyWidth > boxWidth ) {
        slideBody.style.left = `${bodyLeft - move}px`
    }
}
const rightBtn = function(e){
    const slideBox = e.target.parentNode.parentNode;
    const slide = slideBox.querySelector(".sec_list_wrap")
    const boxWidth = slide.clientWidth;
    const slideBody = slideBox.querySelector(".sec_list_wrap > ul")
    const bodyLeft = slideBody.offsetLeft;
    const bodyWidth = slideBody.offsetWidth;
    const slideUnitLength = slideBody.querySelectorAll(".sec_list").length;
    let move = bodyWidth / slideUnitLength;
    if( -1*bodyLeft < move && bodyLeft < 0) {
        slideBody.style.left = `0px`
    }
    else if (bodyLeft < 0) {
        slideBody.style.left = `${bodyLeft + move}px`
    }
}
const totalLength = function(item){
    if (!item) {
        return '0초';
    }
    let n=0;
    for ( const key in item) {
        const q = item[key].duration[0] * 60 + item[key].duration[1] * 1;
        n += q
    }
    const minutes = Math.floor(n/60);
    const seconds = n%60;
    const text = `${minutes}분 ${seconds}초`;
    return text;
}

// 리스트 수정,삭제 //
const deleteList = function(key){
    const deletes = {};
    const data = store.getters.getDataPlaylists[key];
    for( const val of Object.values(data)){
        deletes[`hashs/${val}/${key}`] = null
    }
    deletes[`playlists/${key}`] = null;
    deletes[`account/${useAuth.currentUser.uid}/playlist/${key}`] = null;
    deletes[`hashs/`]
    update(dataRef(useDatabase),deletes);
}
let currentSelectList = ref(null);
let openmodal = ref(false);
const editList = function(key){
    const q = store.getters.getDataPlaylists[key];
    currentSelectList.value = q;
    openmodal.value = true
}
</script>

<style scoped>
    /* common */
    #homeWrap {
        /* background-color: rgb(0,0,0,0.8); */
        background:
        linear-gradient(45deg,rgba(0,0,0, 0.7),rgba(0, 0, 0, 0.7)),
            linear-gradient(240deg, transparent,red),
            linear-gradient(45deg, transparent,yellow);
        padding-top: var(--main-top-padding) ;
        
    }
    .section {
        background-color: rgba(0, 0, 0, 0.7);
        width: 100%;
        margin:0 auto max(10%, 4rem);
        border-radius: 1rem;
        padding: 2rem 1rem;
    }
    .sectionWrap {
        max-width: 1280px;
        width: 100%;
        margin: auto;
        position: relative;
    }
    .sec_content {
        width: min(90vw, 1280px);
        margin: 1rem auto;
        box-sizing: border-box;
    }
    .sec_content2 {
        width: min(90vw, 1280px);
        margin:0 auto 5%;
        padding: 0 2rem;

    }
    .leftArrow {
        transition: .3s ease;
        position: absolute;
        top: 50%;
        right: calc(100% + 2rem) ;
        transform: translateY(-50%);
        border: 0;
        width: 3rem;
        aspect-ratio: 1/1;
        border-radius: 50%;
        overflow: hidden;
        background: transparent url('../assets/img/arrow-left-circle-yellow.png') no-repeat center/contain;
    }
    .rightArrow {
        transition: .3s ease;
        position: absolute;
        top: 50%;
        left: calc(100% + 2rem);
        transform: translateY(-50%);
        border: 0;
        width: 3rem;
        aspect-ratio: 1/1;
        background: transparent url('../assets/img/arrow-right-circle-yellow.png') no-repeat center/contain;
    }
    .leftArrow:hover,
    .rightArrow:hover {
        opacity: 0.8;
    }
    /* section_title */
        .sec_title {
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: absolute;
            bottom: calc(100% + 3rem);
            left: 0;
            width: 100%;
            color: white;
            text-shadow: 1px 0px 5px white;
        }
        .sec_title h3 {
            font-family: 'NanumSquareNeoBold';
            font-size: 250%;
            font-weight: 500;
        }
        .sec_title_btn {
            text-decoration: none;
            color: black;
            display: block;
            font-size: 80%;
            border-radius: 2em;
            padding: 0.5em 3em 0.5em 2em;
            background: rgb(255,255,255,0.6) url('../assets/img/chevron-double-right.svg') no-repeat center right 0.5em/ 1.5em 1.5em;        
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
            padding-right: 1em;
            
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
        .sec_list_wrap{
            position: relative;
            overflow-x: hidden;
            display: flex;
        }
        .sec_list_wrap > ul {
            position: relative;
            top: 0;
            left: 0;
            
            display: flex;
            flex-wrap: nowrap;
            gap: 5rem;
            transition: .3s ease-in-out;
        }
        .sec_list {
            width : max(18vw, 300px);
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
        }
        .sec_list_image{
            width: 100%;
            aspect-ratio: 1/1;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
            background-color: rgba(0,0,0,0.9);
            margin-bottom: 0.5rem;
            border-radius: 1rem;
            overflow: hidden;
        }
        .sec_list_image img {
            width: 100%;
        }
        .sec_list_image button {
            position: absolute;
            bottom: 10px;
            right: 10px;
            font-size: 0px;
            width: 20%;
            aspect-ratio: 1/1;
            border-radius: 50%;
            border: none;
            opacity: 0.6;
            background: #ddd url('../assets/img/play.svg') no-repeat center / 80%;
    
        }
        .sec_list_text {
            background-color: rgb(255,255,255,0.9);
            backdrop-filter: blur(10px);
            border-radius: 1rem;
            padding: 1rem;
            flex: 1;
        }
        .sec1_l_t_title {
            
            margin-bottom: 1rem;
            padding-right: 0.5rem;
            display: flex;
            justify-content: space-between;
        }
        .sec1_l_t_t_wrap {
            font-size: 120%;
            font-weight: 600;
            word-break: keep-all;
            white-space: nowrap;
        }
        .pl_title_btn {
            position: relative;
        }
        .sec_title_menu {
            position: absolute;
            top: 0%;
            right: 110%;
            word-break: keep-all;
            background-color: rgb(0,0,0,0.5);
            border-radius: 1rem;
            backdrop-filter: blur(5px);        
        }
        .sec_title_menu a {
            display: block;
            font-size: 100%;
            padding: 0.5em 2em;
            color: #eeeeee;
            transition: .2s ease-in-out;
        }
        .sec_title_menu a:hover {
            background-color: rgb(255,255,255,0.3);
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
            background-color: rgb(255,210,11);
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
            padding: 0 2rem 1rem;
        }
        .hash_title p{
            font-family: 'Oswald', 'Noto Sans KR';
            font-size: 150%;
            color: white;
            
        }
        .slideBox {
            position: relative;
        }
        .nolist { 
            height: 40vh;
        }
@media screen and (max-width: 1024px){

}
</style>