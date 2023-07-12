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
                                        <p>{{ item.title }}</p>
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
                                        <span>{{ item.totalLength }}</span>
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
            <div class="sec2_title">
                <h3>인기 해시</h3>
                <a href="/" class="sec_title_btn" @click.prevent>더 보기</a>
            </div>
            <div class="sectionWrap" v-for="(item,key) in popularHashList">
                <div class="hash_title">
                    #{{ key }}
                </div>
                <div class="slideBox">
                    <div class="slideBtnBox">
                        <button type="button" class="leftArrow"></button>
                        <button type="button" class="rightArrow"></button>
                    </div>
                    <div class="sec2_list_wrap">
                        <ul>
                            <li class="sec1_list" v-for="items in item" :key="key">
                                <div class="sec1_list_image">
                                    <img :src="store.getters.getDataPlaylists[items].cover">
                                    <button type="button" @click.prevent>플레이리스트 재생</button>
                                </div>
                                <div class="sec1_list_text">
                                    <p class="sec1_l_t_title">{{ store.getters.getDataPlaylists[items].title }}</p>
                                    <p class="sec1_l_t_sub">
                                        <span>총 {{store.getters.getDataPlaylists[items].tracks? Object.entries(store.getters.getDataPlaylists[items].tracks).length : 0 }}곡</span>
                                        <span>{{ store.getters.getDataPlaylists[items].totalLength }}</span>
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
        <div class="section"></div>
    </div>
</template>

<script setup>
import { ref ,reactive, watch} from 'vue';
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
    console.log(popularHashList)
},{immediate: true, deep : true})

// 클릭 이벤트 //
let openMenuPop = ref('');
const clickOpen = function(k){
    openMenuPop.value = openMenuPop.value == k? null : k
}
</script>

<style scoped>
.sectionWrap {
    width: 80%;
    margin: 0 auto;
}
.leftArrow {
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
    position: absolute;
    top: 50%;
    right: -4rem;
    transform: translateY(-50%);
    border: 0;
    width: 4rem;
    aspect-ratio: 1/1;
    background: transparent url('/img/img/arrow-right-circle.svg') no-repeat center/contain;
}
    .sec1_title {
        display: flex;
        justify-content: space-between;
        align-items: center;
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
    .sec1_list_wrap,
    .sec2_list_wrap {
        border: 1px solid blue;
        position: relative;
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
        font-size: 120%;
        font-weight: 600;
        margin-bottom: 1rem;
        padding-right: 0.5rem;
        display: flex;
        justify-content: space-between;
    }
    
    
    .sec1_l_t_sub {
        font-size: 90%;
        color: #666;
        display: flex;
        justify-content: space-between;
        padding: 0 1em;
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
        font-family: 'Oswald', 'Noto Sans KR';
        font-size: 100%;
    }
    .slideBox {
        position: relative;
    }
</style>