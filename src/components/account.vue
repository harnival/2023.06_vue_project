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

    // const updates2 = {};
    //     updates2['account/' + useAuth.currentUser.uid + '/playlist/' + postkey2] = true
    // const tagEntry = Object.keys(playlistContent.tag);
    // tagEntry.forEach(v => {
    //     updates2[`hashs/${v}/${postkey2}`] = true;
    // })
    // update(dataRef(useDatabase),updates2)
    // makeListPage.value = false;

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
<style>
    @import '../css/components/account.css';
    @import '../css/units/list2.css';
</style>
