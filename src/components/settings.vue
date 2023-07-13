<template>
    <div id="settingBox">
        <div class="settingMenu">
            <h3>설정</h3>
            <ul>
                <li><a href="/" @click.prevent>정보 수정</a></li>
                <li><a href="/" @click.prevent>알림 설정</a></li>
                <li><a href="/" @click.prevent>계정 탈퇴</a></li>
            </ul>
        </div>
        <div class="settingFrame">
            <div class="sf_private">
                <h4>정보수정</h4>
                <ul class="sf_p_profile">
                    <li class="sf_p_p_image_wrap">
                        <p>프로필 사진</p>
                        <div class="sf_p_p_image" @click="openFile">
                            <input type="file" name="avatar_img" id="sf_avatar_img" style="display:none" @input="uploadImg" accept="image/*">
                            <img :src="myData.photoURL">
                            <div class="sf_p_p_imageClick"></div>
                        </div>
                    </li>
                    <li class="sf_p_p_name_wrap">
                        <p>프로필 이름</p>
                        <div class="sf_p_p_name">
                            <p v-if="nameReplace">{{ myData.name }}</p>
                            <input type="text" id="sf_private_name" v-if="!nameReplace && nowActivate == 'name'" @blur="blurName" :value = 'myData.name'>
                            <button type="button" @click="clickNameReplace" class="sf_replaceBtn">수정하기</button>
                        </div>
                    </li>
                    <li>
                        <p>아이디</p>
                        <div class="sf_p_p_id">
                            <p v-if="idReplace">{{ myData.id }}</p>
                            <input type="text" v-if="!idReplace && nowActivate == 'id'" @blur="blurId" :value="myData.id" >
                            <button type="button" @click="clickIdReplace" class="sf_replaceBtn">수정하기</button>
                        </div>
                    </li>
                </ul>
                <div>
                    <p>계정 정보 수정</p>
                    <ul class="sf_p_account">
                        <li>
                            <p>이메일</p>
                            <div class="sf_p_a_email">
                                <p v-if="emailReplace">{{ myData.email }}</p>
                                <input type="email" id="sf_account_email" v-if="!emailReplace && nowActivate=='email'">
                            </div>
                        </li>
                        <li>
                            <p>비밀번호</p>
                            <div>
                                <a href="/" @click.prevent>비밀번호 수정하기</a>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useStore } from 'vuex';
    const store = useStore();
import {ref, reactive, watch} from 'vue';
import { useDatabase } from '../datasources/firebase';
import { ref as dataRef , update } from 'firebase/database';

// 내 데이터 불러오기 //
let myData = reactive({});
watch(() => store.getters.getAccount, (cur) => {
    if (cur) {
        myData = cur
        console.log(cur, store.getters.getAccount)
    }
},{immediate: true, deep: true})

// 데이터 교체 -------------------
    // 프로필 사진 //
const openFile = () => {
    sf_avatar_img.click()
}
const uploadImg = (e) => {
    const img = document.querySelector(".sf_p_p_image img");
    const file = sf_avatar_img.files[0];
    const reader = new FileReader();
    reader.addEventListener('load',function(){
        img.src = reader.result;
        myData.photoURL = reader.result;
        if( img.clientWidth >= img.clientHeight ){
            img.style.height = '100%'
        } else {
            img.style.width = '100%'
        }
        const updates = {};
        updates[`account/${myData.uid}/photoURL`] = reader.result;
        update(dataRef(useDatabase),updates);
    })
    if(file){
        reader.readAsDataURL(file);
    }
}
    // 프로필 이름 //
let nowActivate = ref('');

let nameReplace = ref(true);
const clickNameReplace = function(){
    nameReplace.value = !nameReplace.value;
    nowActivate.value = 'name'
}
const blurName = function(e){
    nameReplace.value = !nameReplace.value;
    myData.name = e.target.value;
    const updates = {};
    updates[`account/${myData.uid}/name`] = e.target.value;
    update(dataRef(useDatabase),updates);

}
    // 아이디 //
let idReplace = ref(true)
const clickIdReplace = function(){
    idReplace.value = !idReplace.value
    nowActivate.value = 'id'
    
}
const blurId = function(e){
    idReplace.value = !idReplace.value;
    myData.id = e.target.value
    const updates = {};
    updates[`account/${myData.uid}/id`] = e.target.value;
    update(dataRef(useDatabase),updates);
}
    // 이메일 //
let emailReplace = ref(true);
const clickEmailReplace = function(){
    emailReplace.value = !emailReplace.value;
    myData.email = e.target.value
}

</script>

<style scoped>
    #settingBox {
        display: flex;
        height: 100vh;
    }
    .settingMenu {
        width: 25%;
        background-color: blue;
    }
    /* ------------------------------ */
    .sf_p_profile li,
    .sf_p_account li{
        display: flex;
    }
    .sf_p_p_image_wrap {
        align-items: end;
    }
    .sf_p_p_image {
        width: 10vw;
        aspect-ratio: 1/1;
        border: 1px solid black;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 50%;
        overflow: hidden;
        position: relative;
        cursor: pointer;
    }
    .sf_p_p_image img {
        max-width: 100%;
        max-height: 100%;
    }
    .sf_p_p_imageClick {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255,255,255,0.7) url('/img/img/plus.png') no-repeat center/ 50% 50%;
        opacity: 0;
    }
    .sf_p_p_imageClick:hover {
        opacity: 0.5;
    }
    /* ----------------------------- */
    .sf_private input[type=text] {
        border: 0;
        background-color: #eee;
        padding:0.5rem 1rem;
        border-bottom: 2px solid #aaa;
    }
    .sf_replaceBtn {
        display: block;
        height: 100%;
        width: 1rem;
        border: 0;
        font-size: 0px;
        background: transparent url('/img/img/pencil.svg') no-repeat center / 100% 100%;
    }
    .sf_p_p_name,
    .sf_p_p_id {
        display: flex;
        gap: 1rem;
        align-items: center;
    }
    .sf_p_p_name p,
    .sf_p_p_id p{
        padding: 0.5rem 1rem;
    }
    /* ---------------------------------------------------- */
</style>