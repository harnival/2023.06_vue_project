<template>
    <h2>account.vue</h2>
    <div id="accountBox">
        <div class="a_profile">
            <div class="a_p_content">
                <div class="a_p_c_image">
                    <img :src="accountInfo.photoURL" alt="">
                </div>
                <div class="a_p_c_text">
                    <div class="a_p_c_name">
                        <strong class="a_p_c_n_name">{{ accountInfo.name }}</strong>
                        <span class="a_p_c_n_id">@{{ accountInfo.id }}</span>
                    </div>
                    <div class="a_p_c_follow">
                        <div>
                            <span>팔로워</span>
                            <span>{{ accountInfo.follower? accountInfo.follower.length : 0 }}</span>
                        </div>
                        <div v-if="route.params.ids == 'my'">
                            <span>팔로잉</span>
                            <span>{{ accountInfo.following? accountInfo.following.length : 0 }}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="a_p_btns" v-if="route.params.ids == 'my'">
                <a href="/" @click.prevent>프로필 수정</a>
            </div>
        </div>
        <div class="a_playlist">
            <div class="a_pl_title">
                <h3>내 플레이리스트</h3>
                <p><button type="button" @click.prevent="listtype = true"> 더보기</button></p>
            </div>
            <div class="a_playlistWrap">
                <div class="a_pl_nolist" v-if="!plState">
                    <p>플레이리스트가 없습니다.</p>
                    <button type="button" class="a_pl_newlist1" @click.prevent="makeList1"><strong>+ </strong> 새 플레이리스트 추가</button>
                </div>

                <ul v-else>
                    <li class="a_pl_list_new">
                        <div class="a_pl_btns" v-if="!makeListPage">
                            <a href="/" @click.prevent="makeList2">+ 새 플레이리스트 만들기</a>
                        </div>
                        <div class="a_pl_makeList" v-else>
                            <form @submit.prevent="saveMakeList">
                                <div class="a_pl_m_cover" @click="openFile">
                                    <input type="file" name="cover_img" id="a_pl_m_coverInput" @input="uploadImg" accept="image/*">
                                    <img src="" class="a_pl_m_c_image"  v-if="!clickme">
                                    <div class="a_pl_m_cover_before"  v-if="clickme">
                                        <img src="/img/img/plus.png" alt="" style="opacity:0.5">
                                        <p>
                                            - 클릭하여 이미지를 선택해주세요. <br/>
                                            - 미입력 시, 플레이리스트에 추가된 트랙의 앨범 이미지로 대체됩니다.
                                        </p>
                                    </div>
                                </div>
                                <div class="a_pl_m_text">
                                    <input type="text" name="" id="" v-model="playlistContent.title" placeholder="제목을 입력하세요." required>
                                </div>
                                <div class="a_pl_m_tag">
                                    <div class="a_pl_m_tag_inputwrap">
                                        <input type="text" @change="addTag" placeholder="#">
                                        <a href="/" @click.prevent="addTag">해시태그 추가</a>
                                    </div>
                                    <ul>
                                        <li v-for="(item,index) in playlistContent.tag" :key="index">
                                            #{{ item }}
                                            <a href="/" @click.prevent="removeTag(index)"></a>
                                        </li>
                                    </ul>
                                </div>
                                <div class="a_pl_m_btn">
                                    <button type="submit">생성하기</button>
                                    <button type="button" @click="">취소</button>
                                </div>
                            </form>
                        </div>
                    </li>

                    <li class="a_pl_list" v-for="(item) in Object.entries(userPlaylist).reverse()" :key="item[0]" @click="openPlayer(item[0])">
                        <div class="a_pl_listWrap">
                            <div class="a_pl_l_cover">
                                <img :src="item[1].cover">
                            </div>
                            <div class="a_pl_l_text">
                                <p>{{ item[1].title }}</p>
                                <p>{{ item[1].totalLength }}</p>
                            </div>
                            <div class="a_pl_l_tag">
                                <ul>
                                    <li v-for="tags in item[1].tag"># {{ tags }}</li>
                                </ul>
                            </div>
                        </div>
                    </li> 

                    <li class="a_pl_list">
                        <div class="a_pl_listWrap">
                            <div class="a_pl_l_cover">
                                <img src="/img/sample_cover.jpg">
                            </div>
                            <div class="a_pl_l_text">
                                <p>[playlist] 아이유 1시간 듣기</p>
                                <p>01:00:00</p>
                            </div>
                            <div class="a_pl_l_tag">
                                <ul>
                                    <li>#비오는날</li>
                                    <li>#아이유</li>
                                    <li>#오후</li>
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
import { useStore } from 'vuex';
    const store = useStore();
import { useRoute, useRouter } from 'vue-router';
    const route = useRoute();
    const router = useRouter();
import {computed, onBeforeMount, onMounted, reactive, ref} from 'vue';
import { onValue, ref as dataRef, update, push, get } from 'firebase/database';
import { useDatabase, useAuth } from '../datasources/firebase.js';
// ----------------------------------------------------------------------
let pageUser = ref('');

let accountInfo = reactive(store.getters.getAccount);
let playlistInfo = reactive(store.getters.getDataPlaylists);
let userPlaylist = reactive(accountInfo.playlist)
let plState = ref(userPlaylist? true : false) // 플레이리스트 존재 유무
onBeforeMount(function(){
    if( route.params.ids == 'my') {
        onValue(dataRef(useDatabase,`account/${useAuth.currentUser.uid}`), snapshot => {
            const data = snapshot.val()
            accountInfo = data;

        })
    } else {
        onValue(dataRef(useDatabase,`account/${route.params.ids}`), snapshot => {
            const data = snapshot.val();
            accountInfo = data;
        })
    }
    onValue(dataRef(useDatabase,'playlists'), snapshot => {
        const data = snapshot.val();
    })
})

// account 페이지 --> 내 정보 or 다른 계정 정보 ==============================================================
if( route.params.ids == 'my' ) {
    console.log("[account.vue] 내 계정으로 로드", userPlaylist)
} else {
    console.log("[account.vue] 다른 계정으로 로드", accountInfo.value)
}

//   playlist 구조 --> [
//  {title : value},
//  {cover : value},
//  {totalLength : number(s)},
//  {tag : [ string ... ]},
//  {tracks: [ ]}

// 플레이리스트 제작 칸 불러오기 //===========================================================================
let makeListPage = ref(null);

const makeList1 = function(){
    plState.value = true;
    makeList2();
}

const makeList2 = async function(){
    makeListPage.value = true;
    if(document.querySelector(".a_pl_list_new")){
        document.querySelector(".a_pl_list_new").classList.add('activated')
    }
}
const cancelMake = function(){
    makeListPage.value = false
    playlistContent = {};
}

// 플레이리스트 생성 //
let playlistContent = reactive({});
    playlistContent.tag = [];
    playlistContent.tracks = [];
    playlistContent.uid = route.params.ids == 'my'? useAuth.currentUser.uid : route.params.ids;
const addTag = function(e){
    const v = e.target.value;
    if(v){
        playlistContent.tag.splice(0,0,v)
        e.target.value = '';
    }
}
const removeTag = function(index){
    playlistContent.tag.splice(index,1);
    console.log(playlistContent.tag)
}
// 이미지 선택 //
// upload avatar image -------------------------------------------------
let clickme = ref(true);
const openFile = () => {
    const inputs = document.getElementById('a_pl_m_coverInput')
    inputs.click()
    clickme.value = null;
}
const uploadImg = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    const img = document.querySelector('.a_pl_m_c_image');
    reader.addEventListener('load',async function(){
        img.src = reader.result;
        playlistContent.cover = reader.result;
        console.log('[dsddsdd]',img)
        if( img.clientWidth >= img.clientHeight ){
            img.style.height = '100%'
        } else {
            img.style.width = '100%'
        }
    })
    if(file){
        reader.readAsDataURL(file);
    }
}
const resetImg = () => {
    const img = document.querySelector(".a_pl_m_c_image")
    img.src = "";
    clickme.value = true
}

// 플레이리스트 생성 버튼 //
const saveMakeList = function(){
    const currentUserDataDb = dataRef(useDatabase,'account/' + useAuth.currentUser.uid + '/playlist');
        const postkey = push(currentUserDataDb,playlistContent).key;
        const updates = {};
        updates['/playlists/' + postkey] = {
            maker : useAuth.currentUser.uid,
            contents : playlistContent
        }
        update(dataRef(useDatabase),updates);
    
    makeListPage.value = false;
}
// player 이동---------------------------------------------------------------
const openPlayer = function(key) {
    const q = store.getters.getDataPlaylists;
    console.log(q[key])
    router.push(`/player/` + key, {params : {
        listkey: key
    }})
}
</script>

<style scoped>
    .a_profile {
        display: flex;
    }
    .a_p_content {
        display: flex;
    }
    .a_p_c_image {
        width: max(100px, 10vw);
        aspect-ratio: 1/1;
        border: 1px solid black;
        border-radius: 50%;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .a_p_c_image img {
        width: 100%;
        height: 100%;
    }
    .a_p_c_text {
        display: block;
    }
    .a_p_c_n_name {
        font-size: 100%;
        margin-right: 3rem;
    }
    .a_p_c_n_id {
        font-size: 80%;
        color: #666;
    }
    .a_p_c_follow {
        display: flex;
        gap: 2rem;
    }
    .a_p_c_follow > div > span:first-child {
        font-weight: 600;
        padding-right: 1rem;
    }

    /* 2.playlist------------------------------------------------ */
    .a_playlist {
        display: block;
    }
    .a_pl_title{
        display: flex;
        justify-content: space-between;
        align-items: center;
        border: 1px dashed royalblue;
    }
    .a_pl_title button{
        display: block;
        border: 0;
        padding-right: 2em;
        background: transparent url('/img/img/chevron-double-right.svg') no-repeat center right / contain;
    }
    .a_pl_title button:hover,
    .a_pl_title button:focus {
        opacity: 0.7;
    }
    .a_playlistWrap {
        height: 45vh;
        position: relative;
    }
    .a_pl_nolist {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

    }
    .a_playlistWrap > ul {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
    }
    .a_pl_list {
        background-color: #eee;
        height: 100%;
    }
    .a_pl_newlist1 {
        border: 0;
        font-size: 100%;
        padding: 0.5em 1em;
        border-radius: 1em;
    }
    .a_pl_list_new,
    .a_pl_list {
        width: calc(100% / 4);
        border: 1px dashed palegreen;
        box-sizing: border-box;
        min-height: 45vh;
    }
    .a_pl_list_new a {
        display: flex;
        height: 100%;
        justify-content: center;
        align-items: center;
        text-decoration: none;
        color: black;
        transition: .3s ease;
    }
    .a_pl_btns a:hover {
        background-color: white;
        color: #666;
    }
    .a_pl_btns {
        margin: 1rem;
        border: 2px dashed #333;
        box-sizing: border-box;
        background-color: white;
        height: calc(45vh - 2rem);
    }
    .a_pl_listWrap {
        margin: 1rem;
        background-color: #eee;
        transition: .2s ease;
        border-radius: 2rem;
        cursor: pointer;
        overflow: hidden;
        padding-bottom: 2rem;
    }
    .a_pl_listWrap:hover{
        transform: scale(1.02,1.02);
        background-color: #fff;
    }
    .a_pl_l_cover {
        aspect-ratio: 1/1;
        height: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        margin: 0 auto 1rem;
    }
    .a_pl_l_cover img {
        width: 100%;
    }
    .a_pl_l_text p:last-child {
        text-align: end;
        font-size: 80%;
        color: #666;
    }
    .a_pl_l_tag ul {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        padding: 1rem 0.5rem 0;
    }
    .a_pl_m_tag li,
    .a_pl_l_tag li {
        background-color: rgba(35,26,144,0.3);
        padding: 0.2em 0.5em;
        border-radius: 0.5em;
        color: #333;
    }
    /* .a_pl_list_new.activated {
        width: 100%;
        padding: 1rem;
    } */
    .a_pl_makeList {
        padding: 1rem;
        box-sizing: border-box;
        border: 2px dashed black;
    }
    .a_pl_m_cover {
        background-color: #eee;
        border-radius: 2rem;
        overflow: hidden;
        aspect-ratio: 1/1;
        width: 100%;
        box-shadow: 1px 2px 5px 0px #bbb;
        cursor: pointer;
        margin-bottom: 1rem;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .a_pl_m_c_image {
        display: block;
    }
    .a_pl_m_text {
        background-color: tomato;
    }
    .a_pl_m_text input,
    .a_pl_m_tag input {
        border: 0;
        font-size: 90%;
        padding: 0.3em 2em 0.3em 1em;
        background-color: transparent;
        transition: .3s ease;
        outline: none;
        margin: 0;
        overflow: hidden;
    }
    .a_pl_m_text input:focus,
    .a_pl_m_tag input:focus {
        background-color: rgba(255,255,255,0.4);
    }
    .a_pl_m_tag_inputwrap {
        background-color: rgba(35,26,144,0.3);
        border-radius: 0.5em;
        position: relative;
        width: fit-content;
        overflow: hidden;
        display: flex;
        align-items: center;
    }
    .a_pl_m_tag_inputwrap a {
        position: absolute;
        top: 0;
        right: 0;
        font-size: 0px;
        box-sizing:border-box;
        display: inline-block;
        height: 100%;
        aspect-ratio: 1/1;
        background: url('/img/img/plus.png') no-repeat center / contain;
    }
    .a_pl_m_tag li a {
        position: absolute;
        top: 0;
        right: 0;
        display: inline;
        height: 100%;
        aspect-ratio: 1/1;
        text-decoration: none;
        background: url('/img/img/close_button.png') no-repeat center / 50%;
    }
    .a_pl_m_tag ul {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
    }
    .a_pl_m_tag li {
        position: relative;
        padding-right: 2em;
    }
    .a_pl_m_cover_before {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
    #a_pl_m_coverInput {
        display: none;
    }
    .a_pl_m_cover_before p {
        text-align: start;
        font-size: 80%;
        color: #333;
        padding: 1em;
    }
    .a_playerWrap {
        background-color: royalblue;
        display: flex;
    }
    .a_pr_playPart {
        width: 50%;
    }
    .a_pr_textPart {
        width: 50%;
    }
</style>