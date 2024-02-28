<template>
    <div id="accountBox">
        <div class="a_container">
            <div class="a_con_section">
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
                                    <span>{{ accountInfo.follower? Object.keys(accountInfo.follower).length : 0 }}</span>
                                </div>
                                <div v-if="route.params.ids == useAuth.currentUser.uid">
                                    <span>팔로잉</span>
                                    <span>{{ accountInfo.following? Object.keys(accountInfo.following).length : 0 }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="a_p_btns" >
                        <div>
                            <a href="/" @click.prevent="router.push({name: 'setting'})" v-if="route.params.ids == useAuth.currentUser.uid" class="a_p_btn_edit">프로필 수정</a>
                        </div>
                        <div v-if="route.params.ids != useAuth.currentUser.uid">
                            <a href="/" @click.prevent="clickToFollow" v-if="!accountInfo.follower ||!accountInfo.follower[`${useAuth.currentUser.uid}`]" class="a_p_btn_follow">팔로우</a>
                            <a href="/" @click.prevent="clickToDeleteFollow" v-if="accountInfo.follower && accountInfo.follower[`${useAuth.currentUser.uid}`]" class="a_p_btn_cancel">팔로우 취소</a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="a_line"></div>
            <div class="a_pl_section">
                <div class="a_playlist">
                    <div class="a_pl_title">
                        <h3>플레이리스트</h3>
                        <div class="a_pl_list_new" v-if="route.params.ids == useAuth.currentUser.uid">
                            <div class="a_pl_btns">
                                <a href="/" @click.prevent="router.push({name : 'maker'})">+ 새 플레이리스트 만들기</a>
                            </div>                        
                        </div>
                    </div>

                    <div class="a_playlistWrap">
                        <div class="a_pl_nolist" v-if="!plList || !plList.length">
                            <p>플레이리스트가 없습니다.</p>
                        </div>
        
                        <div class="a_pl_makeList" v-if="makeListPage">
                            <form @submit.prevent="saveMakeList">
                                <div class="a_pl_m_cover" @click="openFile">
                                    <input type="file" name="cover_img" id="a_pl_m_coverInput" @input="uploadImg" accept="image/*">
                                    <img src="" class="a_pl_m_c_image"  v-if="!clickme">
                                    <div class="a_pl_m_cover_before"  v-if="clickme">
                                        <img src="../assets/img/plus.png" alt="" style="opacity:0.5">
                                        <p>
                                            - 클릭하여 이미지를 선택해주세요. <br/>
                                            - 미입력 시, 플레이리스트에 추가된 트랙의 앨범 이미지로 대체됩니다.
                                        </p>
                                    </div>
                                </div>
                                <div class="a_pl_m_textWrap">
                                    <div class="a_pl_m_text">
                                        <input type="text" name="" id="" v-model="playlistContent.title" placeholder="제목을 입력하세요." required>
                                    </div>
                                    <div class="a_pl_m_tag">
                                        <p>#태그 추가</p>
                                        <div class="a_pl_m_tag_inputwrap" v-if="Object.keys(playlistContent.tag).length<10">
                                            <input type="text" @change="addTag" placeholder="#">
                                            <a href="/" @click.prevent="addTag">해시태그 추가</a>
                                        </div>
                                        <ul>
                                            <li v-for="(item,key) in playlistContent.tag" :key="key">
                                                #{{ key }}
                                                <input type="hidden" name="tag" :value="key">
                                                <a href="/" @click.prevent="removeTag(index)"></a>
                                            </li>
                                        </ul>
                                    </div>
                                    <div class="a_pl_m_btn">
                                        <button type="submit" class="a_pl_m_btn_submit">생성하기</button>
                                    </div>
                                </div>
                                <button type="button" @click="cancelMake" class="a_pl_m_cancel">취소</button>
                            </form>
                        </div>
        
                        <ul class="a_pl_list_wrap" v-if="plList || plList.length !== 0">
                            <ListUnit
                                v-for="(item,idx) in plList"
                                :key="`accountList_${idx}`"
                                :listUid="item[0]"
                            />
                        </ul>
                    </div>
                </div>
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
import { onBeforeUnmount,onMounted,  reactive, ref, watch} from 'vue';
import { onValue, ref as dataRef, update, push, get, query,orderByChild,equalTo } from 'firebase/database';
import { useDatabase, useAuth } from '../datasources/firebase.js';
import ListUnit from './modal/listunit.vue';
import { serverTimestamp } from 'firebase/firestore';
// ---------------------------------------------------------------------------------------------------------------
let accountInfo = reactive({});         // 페이지 유저 정보
let plList = ref([])
let plState = ref(null)          // 플레이리스트 존재 유무

// 실시간 감시 요소 --> 팔로우, 팔로워, 

if(route.params.ids === useAuth.currentUser.uid){
    watch(() => store.getters.getLoginUserData, cur => {
        const v = cur;
        accountInfo.name = v.name;
        accountInfo.photoURL =  v.photoURL;
        accountInfo.id =  v.id;
        accountInfo.follower =  v.follower;
        accountInfo.following =  v.following;
    },{immediate:true, deep:true})
    watch(() => store.getters.getUserPlaylists, cur => {
        if(cur){
            const v1 = Object.entries(cur);
            const v2 = v1.sort((a,b) => b[1].date - a[1].date)
            plList.value = v2;
        }
    },{immediate:true,deep:true})
}else{
    get(dataRef(useDatabase,`user/${route.params.ids}`)).then(async(data) => {
        const v = data.val();
        const v1 = v.info;
        accountInfo.name = v1.name;
        accountInfo.photoURL =  v1.photoURL;
        accountInfo.id =  v1.id;
        accountInfo.follower =  v.follower;
        accountInfo.following =  v.following;
        plList.value = Object.entries(v.playlist).sort((a,b) => a[1] - b[1]).reverse();

        if(Object.keys(v1.playlist).length === 0){
            plState.value = null;
        }else{
            plState.value = true;
        }
    })
}
// 플레이리스트 제작 칸 불러오기 //===========================================================================
let makeListPage = ref(null);

const makeList2 = async function(){
    makeListPage.value = true;
    if(document.querySelector(".a_pl_list_new")){
        document.querySelector(".a_pl_list_new").classList.add('activated')
    }
}
const cancelMake = function(){
    makeListPage.value = false;
    clickme.value = true;
    playlistContent = {};
}

// 플레이리스트 생성 //
let playlistContent = reactive({
    tag : {},
    tracks : {},
    uid : route.params.ids
});
const addTag = function(e){
    const v = e.target.value;
    if(v && !playlistContent.tag[v]){
        playlistContent.tag[v] = true
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
const saveMakeList = function(event){
    const v1 = new FormData(event.target);
    const v2 = Object.fromEntries(v1.entries());
    console.log(v2)
    // const dbdb = dataRef(useDatabase, 'playlists');
    // const postkey2 = push(dbdb,playlistContent).key;

<<<<<<< HEAD
    // const updates2 = {};
    //     updates2['account/' + useAuth.currentUser.uid + '/playlist/' + postkey2] = true
    // const tagEntry = Object.keys(playlistContent.tag);
    // tagEntry.forEach(v => {
    //     updates2[`hashs/${v}/${postkey2}`] = true;
    // })
    // update(dataRef(useDatabase),updates2)
    // makeListPage.value = false;
=======
    const updates2 = {};
        updates2['account/' + useAuth.currentUser.uid + '/playlist/' + postkey2] = true
    const tagEntry = Object.keys(playlistContent.tag);
    tagEntry.forEach(v => {
        updates2[`hashs/${v}/${postkey2}`] = postkey2
    })
    update(dataRef(useDatabase),updates2)
    makeListPage.value = false;
>>>>>>> 1249bbd2b2e0e221b254e4066128df3e2f236f15

}
let openMenuPop = ref('');
// 팔로우 하기 
const clickToFollow = function(){
    const uid = route.params.ids;
    const myUid = useAuth.currentUser.uid;
    const updates = {};
        updates[`user/${uid}/follower/${myUid}`] = true;
        updates[`user/${myUid}/following/${uid}`] = true;
    update(dataRef(useDatabase),updates);
}
// 팔취
const clickToDeleteFollow = function(){
    const uid = route.params.ids;
    const myUid = useAuth.currentUser.uid;
    const updates = {};
        updates[`user/${uid}/follower/${myUid}`] = null;
        updates[`user/${myUid}/following/${uid}`] = null;
    update(dataRef(useDatabase),updates);
}

</script>
<<<<<<< HEAD
<style>
    @import '../css/components/account.css';
    @import '../css/units/list2.css';
</style>
=======

<style scoped>
#accountBox {
        padding-top: var(--main-top-padding) ;
        min-height: 100vh;
        box-sizing: border-box;
}
.a_container{
    background-color: rgb(0,0,0,0.8);
}
.a_con_section {
    width: 100%;
}
    .a_profile {
        border-bottom: 1px solid rgb(255,210,11);
        display: flex;
        width: 70%;
        /* max-width: 1280px; */
        margin: auto;
        /* background-color: var(--main-color1); */
        color: #e0e0e0;
        /* border-radius: 1rem; */
        padding: 3% 5%;
        box-sizing: border-box;
        position: relative;
    }
    .a_p_content {
        display: flex;
        width: 100%;
    }
    .a_p_btns {
        position: absolute;
        top: 2rem;
        right: 5%;
    }
    .a_p_btn_edit {
        font-size: 0px;
        display: block;
        width: 1.5rem;
        aspect-ratio: 1/1;
        background: url('../assets/img/pencil.svg') no-repeat center/contain;
        filter: invert(100%);
    }
    .a_p_btn_edit:hover {
        opacity: 0.8;
        border-bottom: 1px solid rgb(0,0,0);
    }
    .a_p_btn_follow {
        display: block;
        font-size: 100%;
        padding: 0.5em 1em;
        border: 1px solid #a60a27;
        border-radius: 1em;
    }
    .a_p_c_image {
        width: max(100px, 10vw);
        height: max(100px, 10vw);
        aspect-ratio: 1/1;
        border: 1px solid rgba(0, 0, 0, 0.3);
        border-radius: 50%;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: white;
    }
    .a_p_c_image img {
        width: 100%;
        height: 100%;
    }
    .a_p_c_text {
        display: block;
        padding-left: 2rem;
    }
    .a_p_c_n_name {
        font-size: 150%;
        margin-right: 3rem;
    }
    .a_p_c_name {
        display: flex;
        flex-direction: column;
        align-items: start;
        gap: 1rem;
    }
    .a_p_c_n_id {
        font-size: 100%;
    }
    .a_p_c_follow {
        display: flex;
        gap: 2rem;
        padding: 3rem 0;
    }
    .a_p_c_follow > div > span:first-child {
        font-weight: 600;
        padding-right: 1rem;
    }

    /* 2.playlist------------------------------------------------ */
    .a_playlist {
        width: 100%;
        margin: auto;
        padding-top: 5%;
    }
    .a_pl_title{
        width: 70%;
        margin: auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: white;
    }
    .a_pl_title h3{
        font-size: 150%;
        font-family: 'NanumSquareNeoBold';

    }
   
    .a_playlistWrap {
        position: relative;
        /* background-color: rgba(255, 255, 255, 0.63); */
        background-color: black;
        padding: 1rem;
        box-sizing: border-box;
    }
    .a_pl_nolist {
        width: 70%;
        height: 100%;
        margin: auto;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

    }
    .a_playlistWrap > ul {
        width: 70%;
        margin: auto;
        display: flex;
        flex-wrap: wrap;
    }
    .a_pl_list {
        height: 100%;
    }
    .a_pl_newlist1 {
        border: 0;
        font-size: 100%;
        padding: 0.5em 1em;
        border-radius: 1em;
    }
    .a_pl_list {
        width: calc(100% / 4);
        box-sizing: border-box;
        min-height: 40vh;
    }
    .a_pl_list_new a {
        display: flex;
        height: 100%;
        justify-content: center;
        align-items: center;
        text-decoration: none;
        /* color: black; */
        transition: .3s ease;
        background-color: white;
    }
    .a_pl_btns a:hover {
        background-color: white;
        color: #666;
    }
    .a_pl_btns {
        /* border: 2px dashed #333; */
        /* box-sizing: border-box; */
        /* background-color: white; */
        font-size: 100%;
    }
    .a_pl_listWrap {
        /* margin: 1rem; */
        transition: .2s ease;
        /* padding-bottom: 2rem; */
        position: relative;
        /* border-radius: 1rem;
        overflow: hidden; */
    }
    .a_pl_listWrap:hover{
        transform: scale(1.02,1.02);
    }
    .a_pl_l_cover {
        aspect-ratio: 1/1;
        height: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        margin: 0 auto;
        position: relative;
        /* border-radius: 2rem; */

        background-color: white;
    }
    .a_pl_l_cover button {
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
    .a_pl_l_cover img {
        width: 100%;
    }
    .a_pl_l_content {
        /* background-color: white; */
        padding: 1rem;
        box-sizing: border-box;
        /* border-radius: 1rem; */
    }
    .a_pl_l_text {
        display: flex;
        justify-content: space-between;
        /* color: #666; */
        color: #e0e0e0;
        font-size: 90%;
        /* padding: 1rem 2rem; */
    }
    .a_pl_l_title{
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        background-color: rgb(0,0,0,0.7);
    }
    .a_pl_l_title > div{
        display: flex;
        justify-content: space-between;
        font-size: 100%;
        color: white;
        max-height: 2.5em;
        padding: 0.4em;
        box-sizing: border-box;
    }
    .a_pl_l_title  p {
        font-size: 120%;
        font-weight: 500;
        text-overflow: ellipsis;
        overflow: hidden;
    }
    .a_pl_l_tag ul {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        padding: 1rem 0.5rem 0;
    }
    .a_pl_m_tag li,
    .a_pl_l_tag li {
        /* background-color: rgba(35,26,144,0.3); */
        background-color: rgba(166, 10, 39, 0.7);
        padding: 0.2em 0.5em;
        border-radius: 0.5em;
        color: #e0e0e0;
        /* color: #333; */
    }
    /* .a_pl_list_new.activated {
        width: 100%;
        padding: 1rem;
    } */
    /* ========================================================= */
    .a_pl_makeList {
        padding: 1rem;
        box-sizing: border-box;

        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9200;
        background-color: rgb(255,255,255,0.4);
        backdrop-filter: blur(2px);
    }
    .a_pl_makeList form {
        width: 50%;
        height: 50%;
        background-color: rgb(255,210,11,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5%;
        border-radius: 1rem;
        padding: 1rem;
        box-sizing: border-box;
        position: relative;
    }
    .a_pl_m_cover {
        background-color: #eee;
        border-radius: 2rem;
        overflow: hidden;
        aspect-ratio: 1/1;
        height: 80%;
        box-shadow: 1px 2px 5px 0px #bbb;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .a_pl_m_textWrap {
        width: 50%;
        background-color: white;
        height: 80%;
        border-radius: 2rem;
        padding: 3rem 0;
        box-sizing: border-box;
        box-shadow: 1px 2px 5px 0px #bbb;
        position: relative;
    }
    .a_pl_m_c_image {
        display: block;
    }
    .a_pl_m_text input,
    .a_pl_m_tag input {
        border: 0;
        font-size: 90%;
        padding: 0.3em 2em 0.3em 1em;
        transition: .3s ease;
        outline: none;
        margin: 0;
        overflow: hidden;
    }
    .a_pl_m_text input {
        height: 2rem;
        border: 1px solid white;
        background-color: #e0e0e0;
        border-radius: 1rem;
        width: 70%;
    }
    .a_pl_m_tag input {
        background-color: #e0e0e0;
    }
    .a_pl_m_text input:focus{
        background-color: rgba(166, 10, 39, 0.3);
    }
    .a_pl_m_tag {
        padding: 2rem;
        width: 70%;
        margin: auto;
    }
    .a_pl_m_tag > p {
        text-align: start;
        padding-bottom: 0.2rem;
    }
    .a_pl_m_tag input:focus {
        background-color: rgba(255,255,255,0.4);
    }
    .a_pl_m_tag_inputwrap {
        background-color: rgba(166, 10, 39, 0.3);
        border-radius: 0.5em;
        position: relative;
        width: fit-content;
        overflow: hidden;
        display: flex;
        align-items: center;
        margin-bottom: 1rem;
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
        background: url('../assets/img/plus.png') no-repeat center / contain;
    }
    .a_pl_m_tag li a {
        position: absolute;
        top: 0;
        right: 0;
        display: inline;
        height: 100%;
        aspect-ratio: 1/1;
        text-decoration: none;
        background: url('../assets/img/close_button.png') no-repeat center / 50%;
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
        transition: .5s ease;
    }
    .a_pl_m_cover_before:hover {
        background-color:#a60a2748;
    }
    #a_pl_m_coverInput {
        display: none;
    }
    .a_pl_m_cover_before p {
        text-align: start;
        font-size: 80%;
        color: #333;
        padding: 5%;
        box-sizing: border-box;
    }
    .a_playerWrap {
        display: flex;
    }
    .a_pr_playPart {
        width: 50%;
    }
    .a_pr_textPart {
        width: 50%;
    }
    .a_pl_m_btn {
        position: absolute;
        bottom: 2rem;
        left: 0;
        width: 100%;
    }
    .a_pl_m_btn button {
        border: 0;
        font-size: 100%;
        padding: 0.5em 3em 0.5em 1em;
        float: right;
        margin-right: 2rem;
        background: transparent url('../assets/img/chevron-double-right.svg') no-repeat center right 1em / 20%;
        border-radius: 1rem;
        transition: 3.s ease;
    }
    .a_pl_m_btn_submit:hover {
        background-color: #e0e0e0;
    }
    .a_pl_m_cancel {
        position: absolute;
        top: 0.5rem;
        left: 1rem;
        width: 3rem;
        aspect-ratio: 1/1;
        font-size: 0;
        border: 0;
        border-radius: 50%;
        background: url('../assets/img/arrow_back_3.png') no-repeat center / 100% 70%;
    }
</style>
>>>>>>> 1249bbd2b2e0e221b254e4066128df3e2f236f15
