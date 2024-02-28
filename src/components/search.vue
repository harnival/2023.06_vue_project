<template>
    <div id="searchBox">
        <div class="search_title">
            <p>
                <span v-if="searchState.tag">태그 검색 : &nbsp;</span>
                <span v-if="searchState.id">아이디 검색 : &nbsp;</span>
                <span v-if="searchState.all">검색 : &nbsp;</span>
                <strong>{{ route.params.words }}</strong>
            </p>
        </div>
        <div class="search_content">
            <div class="search_c_name" v-if="searchState.id || searchState.all">
                <h5 hidden>아이디</h5>
                <!-- <div class="search_c_name_empty" v-if="Object.keys(idLists).length===0">
                    <p>검색 결과가 없습니다.</p>
                </div> -->
                <div class="search_c_n_exist" v-if="Object.keys(idLists).length!==0">
                    <ul>
                        <li v-for="(item,keys) of idLists" class="search_c_n_list" @click="router.push({name : 'account',params : {ids : keys}})">
                            <div class="search_c_n_img">
                                <img :src="item.info.photoURL" />
                            </div>
                            <div class="search_c_n_text">
                                <strong>{{ item.info.name }}</strong>
                                <p>@{{ item.info.id }}</p>
                            </div>
                            <div class="search_c_n_follow">
                                팔로워 &nbsp; <strong>{{ followNumber(item.follower) }}</strong> &nbsp;
                                팔로잉 &nbsp; <strong>{{followNumber(item.following) }}</strong>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="search_c_hash" v-if="searchState.tag || searchState.all">
                <h5>{{ searchWord.match(/^#./g)? searchWord : "# " + searchWord }}</h5>
                <div class="search_c_hash_empty" v-if="Object.keys(lists).length===0">
                    <p>검색 결과가 없습니다.</p>
                </div>
                <div class="search_c_h_exist" v-else>
                    <div class="search_c_h_word">
                        <ul>
                            <Listunit :listUid="item" v-for="item in lists"/>
                        </ul>
                    </div>
                </div>
            </div>           
            <div class="search_c_other" >
                <div class="search_c_o_playlist" v-if="searchState.all">
                    <h5>플레이리스트</h5>
                    <div class="search_c_o_playlist_empty" v-if="Object.keys(plLists).length===0">
                        <p>검색 결과가 없습니다.</p>
                    </div>
                    <div class="search_c_o_playlist_exist" v-else>
                        <ul>
                            <Listunit :listUid="key" :listInfo="item" v-for="(item,key) of plLists"/>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
    import { useRouter, useRoute } from 'vue-router';
        const route = useRoute();
        const router = useRouter();
    import { reactive, ref, watch } from 'vue';
    import Listunit from './modal/listunit.vue';
    import { ref as dataRef, query, orderByChild, get, startAt, endAt } from 'firebase/database';
    import { useDatabase } from '../datasources/firebase';

    const qqq = route.path.split("input=?")[1]
    const searchState = reactive({
        tag : false,
        id : false,
        all : false
    })
    let tagSearching = ref(false);
    let idSearching = ref(false);
    let allSearching = ref(false);

    let lists = ref([]) // 해시검색 리스트
    let idLists = ref({})   // 아이디 리스트
    let plLists = ref({})   // 플리 제목 리스트
    let searchWord = ref(route.params.words)
    function hashSearch(word2){
        get(dataRef(useDatabase,`hash/${word2}/list`)).then(snapshot => {
            if(snapshot.exists()){
                const data2 = snapshot.val()
                const data = Object.keys(data2);
                lists.value = data
            }
        })
    }
    async function idSearch(word3){
        const query2 = query(dataRef(useDatabase,'user'),orderByChild(`info/id`),startAt(word3),endAt(word3 + '\uf8ff'))
        const query3 = query(dataRef(useDatabase,'user'),orderByChild(`info/name`),startAt(word3),endAt(word3 + '\uf8ff'))
        const get1 = await get(query2)
        const get2 = await get(query3)
        const listObj = {};
        if(get1.exists()){
            const get3 = Object.assign(listObj,get1.val())
        }
        if(get2.exists()){
            const get4 = Object.assign(listObj,get2.val())
        }
        return idLists.value = listObj
    }
    function playlistSearch(word4){
        const query4 = query(dataRef(useDatabase,'playlists'),orderByChild(`title`),startAt(word4),endAt(word4 + '\uf8ff'))
        get(query4).then(snapshot => {
            if(snapshot.exists()){
                const data = snapshot.val();
                plLists.value = data
            }
        })
    }
    watch(() => route.params.words, cur => {
        const sw = cur.trim()
        // idLists.value = {};
        // plLists.value = {};
        // lists.value = [];

        if(sw.match(/^#./g)){   // 해시태그 검색
            searchState.tag = true;
            searchState.id = false;
            searchState.all = false;
            hashSearch(sw.split("#")[1]);
        }
        else if(sw.match(/^@./g)){  // 아이디 검색
            searchState.tag = false;
            searchState.id = true;
            searchState.all = false;
            idSearch(sw.split("@")[1]);
        }
        else{
            searchState.tag = false;
            searchState.id = false;
            searchState.all = true;
            idSearch(sw);
            hashSearch(sw);
            playlistSearch(sw);
        }
    },{immediate:true})

    function comma(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    function followNumber(obj){
        const num1 = Object.keys(obj).length;
        if(num1 < 10000){
            return comma(num1)
        }else if(10000 <= num1 < 1000000){
            const num2 = Math.floor(num1 / 100)/10
            return num2 + "k"
        }else{
            const num3 = Math.floor(num1 / 100000)/10
            return num3 + "M"
        }
    }
</script>
<style>
    @import "../css/units/list2.css";
    @import "../css/components/search.css"
</style>