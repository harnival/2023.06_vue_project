<template>
    <li class="sec_list" >
        <button class="sec_list_play" type="button" @click.prevent="goPlayer">플레이리스트 재생</button>
        <div class="sec_list_image" @click="() => showText()">
            <img :src="!listInfo.cover ? `/img/cover/${randomImage}.JPG` : listInfo.cover">
        </div>
        <p class="sec_list_title" v-if="!showTextValue" >
            <p class="sec_list_title_wrap">{{ listInfo.title }}</p>
            <div v-if="useAuth.currentUser && useAuth.currentUser.uid == listInfo.uid" class="pl_title_btn">
                <button class="pl_title_btn_button" type="button" @click="clickOpen()">메뉴</button>
                <div class="sec1_title_menu" v-if="openMenuPop">
                    <a href="#" @click.prevent="router.push({name : 'edit', params : {listkey : listUid}})" >수정</a>
                    <a href="#" @click.prevent="deleteList(listUid)">삭제</a>
                </div>
            </div>

        </p>
        <div class="sec_list_text" v-if="showTextValue" @click="() => closeText()">
            <p class="sec_list_sub">
                <span>총 {{listInfo.tracks? Object.entries(listInfo.tracks).length : 0 }}곡</span>
                <strong>·</strong>
                <span>{{ totalLength(listInfo.tracks) }}</span>
                <strong>·</strong>
                <div class="sec_list_s_maker" @click="() => router.push({name : 'account', params : {ids : listInfo.uid}})">
                    <div class="sec_list_s_m_img">
                        <img :src=" userInfo2.photoURL">
                    </div>
                    <div class="sec_list_s_m_name">
                        {{ userInfo2.name }}
                    </div>
                </div>
            </p>
            <p class="sec_list_tag">
                <ul>
                    <li v-for="(tag,tagkey) in listInfo.tag" @click="router.push({ name : 'search', params : {words : `#${tagkey}`}})">#{{ tagkey }}</li>
                </ul>
            </p>
        </div>
    </li>
</template>
<script setup>
    import { useRouter } from 'vue-router';
    import {ref} from 'vue';
    import {get ,update, ref as dataRef, onValue} from 'firebase/database';
    import { useAuth, useDatabase } from '../../datasources/firebase';
    import { useStore } from 'vuex';
        const store = useStore();
    const router = useRouter();
    const props = defineProps(['listUid','listInfo']); // items : playlist key value , playlists : playlist data
    const listInfo = ref({});
    const userInfo2 = ref({});
    const imageLength = 4;
    const randomImage = Math.floor(Math.random() * imageLength);
    

    if(props.listInfo){
        listInfo.value = props.listInfo;
        get(dataRef(useDatabase,`user/${props.listInfo.uid}/info`)).then(data => {
            const get1 = data.val();
            userInfo2.value = get1
        })

    }else{
        get(dataRef(useDatabase,`playlists/${props.listUid}`))
            .then(async(data) => {
                listInfo.value = {...data.val()}
                const get1 = await get(dataRef(useDatabase,`user/${data.val().uid}/info`));
                userInfo2.value = get1.val()
            })
            .catch(err => console.log("리스트 오류 : ", err))
    }




// ----------------------------------------------------
    let openMenuPop = ref(null);
    let windowWidth = ref(window.innerWidth);
    const showTextValue = ref(false)
 
    document.addEventListener("click",(e) => removeClickValue(e));
    const removeClickValue = function(e){
        if(e.target.className ==! "pl_title_btn_button"){
            openMenuPop.value = null;
        }
        return document.removeEventListener("click",removeClickValue)
    }
    const clickOpen = function(){  // 플레이리스트 메뉴 온오프
        openMenuPop.value = openMenuPop.value? null : true;
    }
    const goToMakerAccount = function(items){   // 플레이리스트 작성자 클릭 시 정보창으로 이동
        const uid = props.listInfo.uid;
        router.push({name : 'account', params : { ids : uid}})
    }
    const totalLength = function(item){     // 해당 플레이리스트 총 재생길이 계산
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
    const deleteList = async function(key){       // 플레이리스트 삭제
        const hl = Object.keys(store.getters.getUserPlaylists[key].tag);
        const tagObj = {};
        for await(const val of hl){
            tagObj[`hash/${val}/list/${key}`] = null
        }
        update(dataRef(useDatabase),{
            ...tagObj,
            [`account/${useAuth.currentUser.uid}/playlist/${key}`] : null,
            [`playlists/${key}`] : null
        }).then(v => {
            console.log(store.getters.getUserPlaylists);
        })

    }
    const goPlayer = function(){
        if(listInfo.value.tracks&&Object.keys(listInfo.value.tracks).length!==0){
            router.push({name: 'player', params: {listkey: props.listUid}})        
        }
    }
    const showText = function(){
        showTextValue.value = true;
    }
    const closeText = function(){
        showTextValue.value = false;
    }
    const goEdit = function(key){
        if(key){
            router.push({name : 'edit', params : {listkey : key}})
        }else{
            router.push({name : 'maker'})
        }
    }
</script>
