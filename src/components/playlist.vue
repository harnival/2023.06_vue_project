<template>
    <div id="playlistBox">
        <div class="playlistBoxWrap">
            <div class="searchBox">
                <div class="sb_title">
                    <h3>검색</h3>
                </div>
                <div class="sb_inputWrap">
                    <div class="focusLine"></div>
                    <form class="inputBox_sb" @submit.prevent="searchSubmit">
                        <input type="text" name="search" v-model="searchs" placeholder="검색할 단어를 입력하세요." @focusin="inputFocus" @focusout="inputFocusOut" required>
                        <button class="sb_btn" type="submit">검색</button>
                    </form>
                </div>
            </div>
            <div class="result_empty" v-if="!doSearch">
                제목, 해시태그, 아이디 검색
            </div>
            <div class="resultBox" v-if="doSearch">
                <div class="search_section" v-if="results_user.length">
                    <div class="slideWrap">
                        <div class="slideBtnBox">
                            <button type="button" class="leftArrow" @click="rightBtn"></button>
                            <button type="button" class="rightArrow" @click="leftBtn"></button>
                        </div>
                        <div class="user_slide_box">
                            <ul>
                                <li v-for="item in results_user" :key="item.uid" class="search_user_unit" @click.prevent="router.push({ name: 'account', params : { ids : item.uid}})">
                                    <div class="search_user_image">
                                        <img :src="item.photoURL">
                                    </div>
                                    <div class="search_user_name">
                                        <p>{{ item.name }}</p>
                                        <p>@{{ item.id }}</p>
                                    </div>
                                    <div class="search_user_follow">
                                        <span>팔로워</span>
                                        <span>{{ item.follower }}</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="search_section">
                    <h4>Playlist</h4>
                    <div class="search_sec_empty" v-if="!results_playlist.length">
                        검색 결과가 없습니다.
                    </div>
                    <div class="slideWrap" v-if="results_playlist.length">
                        <div class="slideBtnBox">
                            <button type="button" class="leftArrow" @click="rightBtn"></button>
                            <button type="button" class="rightArrow" @click="leftBtn"></button>
                        </div>
                        <div class="slide_box">
                            <ul>
                                <li class="search_pl_list search_unit" v-for="item in results_playlist">
                                    <div class="search_pl_listWrap">
                                        <div class="search_pl_l_cover">
                                            <img :src="item[1].cover">
                                            <button type="button" @click.prevent="router.push({name : 'player', params : {listkey : item[0]}})">플레이리스트 재생</button>
            
                                        </div>
                                        <div class="search_pl_l_title">
                                            <div>
                                                <p >{{ item[1].title }}</p>
                                                <div v-if="item[1].uid == useAuth.currentUser.uid" class="pl_title_btn">
                                                    <button type="button" @click="clickOpen(item[0])">메뉴</button>
                                                    <div class="sec1_title_menu" v-if="openMenuPop == item[0]">
                                                        <a href="/" @click.prevent>수정</a>
                                                        <a href="/" @click.prevent="deleteList(item[0],item[1].tag)">삭제</a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="search_pl_l_content">
                                            <div class="search_pl_l_text">
                                                <span>총 {{item[1].tracks? Object.entries(item[1].tracks).length : 0 }}곡</span>
                                                <span>{{  totalLength(item[1].tracks) }}</span>
                                            </div>
                                            <div class="search_pl_l_tag">
                                                <ul>
                                                    <li v-for="(tags,tagkey) in item[1].tag"># {{ tagkey }}</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="search_section">
                    <h4>#Hashtag</h4>
                    <div class="search_sec_empty" v-if="!results_hash.length">
                        검색 결과가 없습니다.
                    </div>
                    <div class="hash_section" v-for="item in results_hash" v-if="results_hash.length">
                        <h5>#{{ item[0] }}</h5>
                        <div class="slideWrap">
                            <div class="slideBtnBox">
                                <button type="button" class="leftArrow" @click="rightBtn"></button>
                                <button type="button" class="rightArrow" @click="leftBtn"></button>
                            </div>
                            <div class="slide_box">
                                <ul>
                                    <li class="search_hash_list search_unit" v-for="items in item[1]">
                                        <div class="search_pl_listWrap">
                                            <div class="search_pl_l_cover">
                                                <img :src="items.cover">
                                                <button type="button" @click.prevent="router.push({name : 'player', params : {listkey : items.id}})">플레이리스트 재생</button>
                
                                            </div>
                                            <div class="search_pl_l_title">
                                                <div>
                                                    <p >{{ items.title }}</p>
                                                    <div v-if="items.uid == useAuth.currentUser.uid" class="pl_title_btn">
                                                        <button type="button" @click="clickOpen(items.id)">메뉴</button>
                                                        <div class="sec1_title_menu" v-if="openMenuPop == items.id">
                                                            <a href="/" @click.prevent>수정</a>
                                                            <a href="/" @click.prevent="deleteList(items.id,items.tag)">삭제</a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="search_pl_l_content">
                                                <div class="search_pl_l_text">
                                                    <span>총 {{items.tracks? Object.entries(items.tracks).length : 0 }}곡</span>
                                                    <span>{{  totalLength(items.tracks) }}</span>
                                                </div>
                                                <div class="search_pl_l_tag">
                                                    <ul>
                                                        <li v-for="(tags,tagkey) in items.tag"># {{ tagkey }}</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>
<script setup>
    import { ref, reactive } from 'vue';
    import { ref as dataRef, query, orderByValue, getDatabase} from 'firebase/database';
    import {useDatabase} from '../datasources/firebase'
    import { useRoute, useRouter } from 'vue-router';
        const route = useRoute();
        const router = useRouter();
    import { useStore } from 'vuex';
        const store = useStore();
    import { useAuth } from '../datasources/firebase';
    // ==========================================================
    let searchs = ref(null);
    let doSearch = ref(false)
    let hashSearch = reactive({value:{}});
    let results_playlist = ref([]);
    let results_hash = ref([]);
    let results_user = ref([]);
    // ==========================================================
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
    const leftBtn = function(e){    // 목록 왼쪽으로 슬라이드 이동
        const slideBox = e.target.parentNode.parentNode;
        const slide = slideBox.querySelector(".slide_box")
            const boxWidth = slide.clientWidth;
        const slideBody = slideBox.querySelector(".slide_box > ul")
            const bodyLeft = slideBody.offsetLeft;
            const bodyWidth = slideBody.offsetWidth;
        const slideUnitLength = slideBody.querySelectorAll(".search_unit").length;
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
    const rightBtn = function(e){   // 목록 오른쪽으로 슬라이드 이동
        const slideBox = e.target.parentNode.parentNode;
        const slide = slideBox.querySelector(".slide_box")
        const boxWidth = slide.clientWidth;
        const slideBody = slideBox.querySelector(".slide_box > ul")
        const bodyLeft = slideBody.offsetLeft;
        const bodyWidth = slideBody.offsetWidth;
        const slideUnitLength = slideBody.querySelectorAll(".search_unit").length;
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
            const q = (item[key].duration[0]? item[key].duration[0] * 60 : 0) + (item[key].duration[1]? item[key].duration[1] * 1 : 0);
            n += q
        }
        const minutes = Math.floor(n/60);
        const seconds = n%60;
        const text = `${minutes}분 ${seconds}초`;
        return text;
    }

    let openMenuPop = ref('');
    const clickOpen = function(k){
        openMenuPop.value = openMenuPop.value == k? null : k
    }
    // =========================================================
   
    const searchSubmit = function(e){
        const values = Object.fromEntries(new FormData(e.target).entries());
        const q = values.search;
        if(q){
            doSearch.value = true;
            const list1_1 = Object.entries(store.getters.getDataPlaylists);
            const list1_2 = list1_1.filter((v) => v[1].title.includes(q));
            results_playlist.value = list1_2;
            

            const list2_1 = Object.entries(store.getters.getDataHashs);
            const list2_2 = list2_1.filter((v) => v[0].includes(q));
            const list2_3 = list2_2.map((v) => {
                const w1 = Object.keys(v[1]);
                const w2 = w1.map((val) => {
                    const t1 = store.getters.getDataPlaylists[val];
                    t1.id = val;
                    return {...t1}
                })
                return [v[0],w2]
            })
            results_hash.value = list2_3;

            const list3_1 = Object.entries(store.getters.getDataUsers);
            const list3_2 = list3_1.filter((v) => {
                const p1 = v[1].name;
                const p2 = v[1].id;
                return p1.includes(q)|| p2.includes(q)
            })
            const list3_3 = list3_2.map((v) => ({
                name : v[1].name,
                id : v[1].id,
                uid: v[0],
                photoURL : v[1].photoURL,
                follower : v[1].follower? Object.keys(v[1].follower).length : 0
            }))
            results_user.value = list3_3
            console.log(results_user.value)
        }
    }
    const hashPage = function(hashlist){
        
    }
</script>

<style scoped>
#playlistBox{
    padding-top: var(--main-top-padding);
    min-height: 100vh;
}
.searchBox {
    position: relative;
    display: flex;
    justify-content: center;
    box-sizing: border-box;
    /* border-radius: 2rem; */
    background-color: white;
    margin: 10% auto;
    padding: 1rem 0;
    height: fit-content;
}
.sb_title{
    position: absolute;
    bottom: 100%;
    left: 15%;
    font-size: 250%;
    color: white;
    width: 70%;
    font-family: 'NanumSquareNeoBold';
}
.sb_title h3 {
    text-align: left;
    line-height: 1;
}
.sb_inputWrap {
    width: 70%;
    margin: auto;
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
    background-color: transparent;
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

.search_section,
.result_empty{
    background-color: rgb(0,0,0,0.5);
    position: relative;
    margin: 5rem 0;
}

.result_empty{
    width: 70%;
    margin: auto;
    padding: 2rem;
    color: rgb(255,255,255,0.8);
    font-size: 120%;
    border-radius: 2rem;
}
.search_section h4{
    position: absolute;
    bottom: 100%;
    left: 15%;
    color: white;
    font-size: 150%;
}
.hash_section{
    padding: 0.5rem 0;
}
.hash_section h5 {
    color: white;
    font-size: 100%;
    width: fit-content;
    margin: auto;
    background-color: rgb(0,0,0);
    padding: 0.3rem 1rem;
    border-radius: 1rem;
}
.search_sec_empty{
    color: rgb(255,255,255,0.7);
    padding: 2rem 0;
}
/* -------------------------------- */

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
    left: calc(102%);
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
/* --------------------------------------- */
.slideWrap{
    width: 70%;
    margin: auto;
    position: relative;
}
.slide_box,
.user_slide_box{
    position: relative;
    overflow-x: hidden;
    display: flex;

    padding: 0.5rem 0;
}

.slide_box > ul,
.user_slide_box > ul {
    position: relative;
    top: 0;
    left: 0;
    
    display: flex;
    flex-wrap: nowrap;
    gap: 4rem;
    transition: .3s ease-in-out;
    min-width: 100%;
}
.search_unit {
    height: 100%;
    width: calc(100% / 4);
    box-sizing: border-box;
    min-height: 30vh;
}
.search_user_unit{
    height: 100%;
    width: calc(100% / 4);
    box-sizing: border-box;
    padding: 1rem;
    background-color: rgb(0,0,0,0.5);
    border-radius: 2rem;
    cursor: pointer;
}
.search_user_image{
    width: 50%;
    aspect-ratio: 1/1;
    overflow: hidden;
    border-radius: 50%;
}
.search_user_image img{
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 50% 50%;
}
.search_user_name{
    padding: 1rem 0;
    text-align: start;
}
.search_user_name p:first-child{
    font-size: 110%;
    color: white;
    padding-bottom: 0.5rem;
}
.search_user_name p:last-child{
    font-size: 90%;
    color: #ccc;
    padding-left: 0.5rem;
    word-break: break-all;
}
.search_user_follow{
    width: 100%;
    text-align: start;
    padding-left: 0.5rem;
    color: white;
    display: flex;
    gap: 1rem;
}
.search_pl_listWrap {
    /* margin: 1rem; */
    transition: .2s ease;
    /* padding-bottom: 2rem; */
    position: relative;
    /* border-radius: 1rem;
    overflow: hidden; */
}
.search_pl_listWrap:hover{
    transform: scale(1.02,1.02);
}
.search_pl_l_cover {
    aspect-ratio: 1/1;
    height: 50%;
    overflow: hidden;
    margin: 0 auto;
    position: relative;
    /* border-radius: 2rem; */

    background-color: white;
}
.search_pl_l_cover button {
    position: absolute;
    bottom: 10px;
    right: 10px;
    font-size: 0px;
    width: 20%;
    aspect-ratio: 1/1;
    border-radius: 50%;
    border: none;
    /* opacity: 0.6; */
    background: #ddd url('../assets/img/play.svg') no-repeat center / 80%;

}
.search_pl_l_cover img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: 50% 50%;
}
.search_pl_l_content {
    /* background-color: white; */
    padding: 1rem;
    box-sizing: border-box;
    /* border-radius: 1rem; */
}
.search_pl_l_text {
    display: flex;
    justify-content: space-between;
    /* color: #666; */
    color: #e0e0e0;
    font-size: 90%;
    /* padding: 1rem 2rem; */
}
.search_pl_l_title{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    background-color: rgb(0,0,0,0.7);
}
.search_pl_l_title > div{
    display: flex;
    justify-content: space-between;
    font-size: 100%;
    color: white;
    max-height: 2.5em;
    padding: 0.4em;
    box-sizing: border-box;
}
.search_pl_l_title  p {
    font-size: 120%;
    font-weight: 500;
    text-overflow: ellipsis;
    overflow: hidden;
}
.search_pl_l_tag ul {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    padding: 1rem 0.5rem 0;
}
.a_pl_m_tag li,
.search_pl_l_tag li {
    /* background-color: rgba(35,26,144,0.3); */
    background-color: rgba(166, 10, 39, 0.7);
    padding: 0.2em 0.5em;
    border-radius: 0.5em;
    color: #e0e0e0;
    /* color: #333; */
}
/* --------------------------------------------------------- */

@media screen and (max-width: 1023px){
    #playlistBox{
        padding-top: 1rem;
        box-sizing: border-box;
    }
    .leftArrow {
        transition: .3s ease;
        position: absolute;
        top: 50%;
        right: 100%;
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
        left: 100%;
        transform: translateY(-50%);
        border: 0;
        width: 3rem;
        aspect-ratio: 1/1;
        background: transparent url('../assets/img/arrow-right-circle-yellow.png') no-repeat center/contain;
    }
    .slide_box > ul,
    .user_slide_box > ul {
        position: relative;
        top: 0;
        left: 0;
        
        display: flex;
        flex-wrap: nowrap;
        gap: 1rem;
        transition: .3s ease-in-out;
        min-width: 100%;
    }
    .search_unit {
        height: 100%;
        width: calc(100% / 3);
        box-sizing: border-box;
        min-height: 30vh;
    }
    .search_user_unit{
        height: 100%;
        width: calc(100% / 3);
        box-sizing: border-box;
        padding: 1rem;
        background-color: rgb(0,0,0,0.5);
        border-radius: 2rem;
        cursor: pointer;
    }
}
/* ==========//////////////////////////////================================ */

@media screen and (max-width: 767px){
    .slideBtnBox{
        display: none;
    }
    .sb_title{
        position: absolute;
        bottom: 100%;
        left: 5%;
        font-size: 250%;
        color: white;
        width: 90%;
        font-family: 'NanumSquareNeoBold';
    }
    .searchBox {
        position: relative;
        display: flex;
        justify-content: center;
        box-sizing: border-box;
        /* border-radius: 2rem; */
        background-color: white;
        margin: 3rem auto;
        padding: 0.5rem 0 0;
        height: fit-content;
    }
    .sb_inputWrap {
        width: 100%;
        margin: auto;
        position: relative;
    }
    .searchBox input {
        width: 80%;
        font-size: 100%;
        padding: 0.5rem 5%;
        box-sizing: border-box;
        border: 0;
        border-bottom: 2px solid #aaa;
        outline: none;
        z-index: 8000;
    }
    .sb_btn {
        font-size: 0;
        position: static;
        right: 0;
        top: 0;
        border-width: 0px;
        border-style: solid;
        border-color: #aaaaaa;
        background: transparent url('../assets/img/search.svg') center/2rem no-repeat;
        aspect-ratio: auto;
        height: 2rem;
        cursor: pointer;
        transition: .5s ease;
        /* 767px */
        border-bottom-width: 2px;
        float: right;
        width: 20%;
    }
    /* --------- */
    .search_section h4{
        position: absolute;
        bottom: 100%;
        left: 5%;
        color: white;
        font-size: 150%;
    }
    .slideWrap{
        width: 100%;
        margin: auto;
        position: relative;
    }
    .slide_box{
        position: relative;
        overflow-x: auto;
        overflow-y: auto;
        display: flex;

        padding: 0.5rem 0;
        max-height: 60vh;
    }
    .user_slide_box{
        position: relative;
        overflow-x: auto;

    }
    .slide_box > ul {
        position: relative;
        top: 0;
        left: 0;
        
        display: block;
        flex-wrap: nowrap;
        gap: 1rem;
        transition: .3s ease-in-out;
    }
    .search_unit {
        height: fit-content;
        width: 100%;
        box-sizing: border-box;
        min-height: none;
    }
    .search_user_unit{
        height: auto;
        width: calc(100% / 1.5);
        box-sizing: border-box;
        padding: 1rem;
        background-color: rgb(0,0,0,0.5);
        border-radius: 2rem;
        cursor: pointer;
    }
    .search_user_image{
        width: 5rem;
        aspect-ratio: 1/1;
        overflow: hidden;
        border-radius: 50%;
    }

    .search_pl_listWrap{
        position: relative;
    }

}
</style>