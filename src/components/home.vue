<template>
    <div id="homeWrap">
        <div class="section" v-if="useAuth.currentUser">
            <div class="sectionWrap">
                <div class="sec_title">
                    <h3>내 플레이리스트</h3>
                    <a href="/" @click.prevent="router.push({name: 'account',params: {ids : useAuth.currentUser.uid}})" class="sec_title_btn">더 보기</a>
                </div>
    
                <div class="sec_content">
                    <div class="nolist" v-if="!userList">
                        <span>플레이리스트가 없습니다.</span>
                    </div>

                    <div v-if="userList" class="slideBox">
                        <div class="sec_list_wrap" >
                            <ul>
                                <ListUnit
                                v-for="(items,idx) of Object.entries(userList).reverse().slice(0,listCut.my)"
                                    :listUid="items[0]"
                                />
                            </ul>
                        </div>
                    </div>
                    <div v-if="userList && userList.length > 4">
                        <button class="sec_list_moreBtn" @click="() => listCut.my = listCut.my<Object.keys(item.list).length? listCut.my+sampleNum : listCut.my">더보기</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="sectionWrap">
                <div class="sec_title">
                    <h3># 인기 해시</h3>
                </div>
                <div class="sec_content sec_content_hash" v-for="(item,idx) in hashList" :key="'hashkey'+ idx">
                    <div class="hash_title">
                        <p># {{ item[0] }}</p>
                        <!-- <a href="/" class="sec_title_btn" @click.prevent>더 보기</a> -->
                    </div>
                    <div class="slideBox">
                        <div class="sec_list_wrap">
                            <ul>
                                <ListUnit
                                    v-for="(itemkey) in item[1].slice(0,listCut.hash[idx])"
                                    :listUid="itemkey"
                                />
                            </ul>
                        </div>
                    </div>
                    <div v-if="item[1].length > 4">
                        <button class="sec_list_moreBtn" @click="() => listCut.hash[idx] = listCut.hash[idx]<Object.keys(item.list).length? listCut.hash[idx]+sampleNum : listCut.hash[idx]">더보기</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="section" v-if="useAuth.currentUser">
            <div class="sectionWrap">
                <div class="sec_title">
                    <h3>팔로워</h3>
                    <!-- <a href="/" class="sec_title_btn" v-if="randomFlInfo" @click.prevent="router.push({name: 'account', params: {ids : f_user}})">더 보기</a> -->
                </div>
                <div class="sec_content" v-if="randomFlInfo">
                    <div class="following_title">
                        <div class="following_t_user" @click="() => router.push({name : 'account', params : { ids : randomFlInfo.uid}})">
                            <img :src="randomFlInfo.photoURL">
                            @{{ randomFlInfo.id }}
                        </div>
                        님의 플레이리스트
                    </div>
                    <div class="nolist" v-if="!randomFlInfo.playlist">
                        <span>플레이리스트가 없습니다.</span>
                    </div>

                    <div v-if="randomFlInfo.playlist" class="slideBox">
                        <div class="sec_list_wrap" >
                            <ul >
                                <ListUnit
                                    v-for="(item,itemkey) in randomFlInfo.playlist"
                                    :listUid="itemkey"
                                />
                            </ul>
                        </div>
                    </div>
                    <div v-if="Object.keys(randomFlInfo.playlist).length > 4">
                        <button class="sec_list_moreBtn" @click="() => listCut.hash[idx] = listCut.hash[idx]<Object.keys(item.list).length? listCut.hash[idx]+sampleNum : listCut.hash[idx]">더보기</button>
                    </div>
                </div>
                <div class="sec_content" v-if="!randomFlInfo">
                    <p class="noFollowing">아직 팔로우 한 계정이 없습니다.</p>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
// import ==============================================================
import { ref ,reactive, watch, onBeforeUnmount} from 'vue';
import { useDatabase , useAuth} from '../datasources/firebase';
import { ref as dataRef, get, orderByChild, query, equalTo} from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';

import { useStore  } from 'vuex';
    const store = useStore();
import { useRouter } from 'vue-router';
    const router = useRouter();
import ListUnit from './modal/listunit.vue';

const windowWidthValue = ref(screen.width);
const userInfo = ref(null); // object
const userList = ref(null); // array
const hashList = ref([]); //object
const randomFlInfo = ref(null)
const sampleNum = 4 // 로딩 갯수
const listCut = reactive({
    my : sampleNum,
    hash : [sampleNum,sampleNum,sampleNum],
    follow : sampleNum
})

onAuthStateChanged(useAuth,user => {
    if(user){
        userInfo.value = store.getters.getLoginUserData;    // object
        watch(() => store.getters.getUserPlaylists, cur => {
            userList.value = cur;    // array
        },{immediate: true, deep: true})
        const fl = store.getters.getLoginUserData["following"];
        if(!!fl){
            const randomNum = Math.floor(Math.random() * fl.length)
            const randomfl = fl[randomNum];
            get(dataRef(useDatabase,`user/${randomfl}/info`)).then(async(data) => {
                const v1 = data.val();
                const q1 = query(dataRef(useDatabase,`playlists`),orderByChild(`uid`),equalTo(v1.uid))
                const get1 = await get(q1);
                const get2 = {...v1, playlist : get1.val()}
                store.commit('setRandomFollowing',get2);
                randomFlInfo.value = get2;
            })
        }
    }    
    // ------------------------------------ home에서 데이터를 호출해 list 로 전달할 경우
    // const get1 = store.getters.getPopularHash;
    // console.log(get1)
    // const get2 = get1.map((v) => {
    //     const [[keys,values]] = Object.entries(v);
    //     const obj = {};
    //     const v2 = values.map(async(q) => {
    //         const q1 = await get(dataRef(useDatabase,`playlists/${q}`));
    //         obj[q] = q1.val()
    //     })
    //     return [keys,obj]
    // })
    // hashList.value = get2;
    // --------------------------------------------------------------------------------
    const cur2 = store.getters.getPopularHash;
    hashList.value = cur2.map(v => {
        const [[keys,values]] = Object.entries(v);
        return [keys,values]
    })
})


</script>
<style>
    @import '../css/components/home.css';
    @import '../css/units/list2.css';
</style>
