<template>
    <div id="settingBox">
        <div class="settingBoxWrap">
            <div class="settingMenu">
                <h3>설정</h3>
            </div>
            <div class="settingFrame">
                <div class="sf_private">
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
                    <div class="sf_delete">
                        <p>계정 탈퇴</p>
                        <a href="/" @click.prevent="deleteChoice = true">계정 탈퇴</a>
                        <div class="confirm_delete" v-if="deleteChoice">
                            <p>계정을 삭제하시겠습니까? <br/> 다시 복구할 수 없습니다.</p>
                            <p>
                                <button type="button" class="sf_d_yes" @click.prevent="store.dispatch('userDelete')">삭제</button>
                                <button type="button" class="sf_d_no" @click.prevent="deleteChoice = false">취소</button>
                            </p>
                        </div>
                    </div>
                    <div class="sf_logout">
                        <a href="/" @click.prevent="store.dispatch('logout')">로그아웃</a>
                    </div>
                </div>
            </div>
        </div>
        <div class="settingBoxWrap">
            <div class="settingMenu">
                <h3>알림설정</h3>
            </div>
            <div class="settingFrame">

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

let deleteChoice = ref(false);

</script>

<style scoped>
    #settingBox {
        padding-top: var(--main-top-padding) ;
        min-height: 100vh;
        box-sizing: border-box;
    }
    .settingBoxWrap {
        width: 80%;
        max-width: 1280px;
        margin: auto;
    }
    .settingMenu {
        text-align: start;
        color: rgb(255,210,11);
        font-family: 'NanumSquareNeoBold';
        padding-left: 2rem;
        font-size: 150%;
    }
    .settingFrame {
        background-color: var(--main-color1);
        border-radius: 1rem;
        padding: 2rem 0;
    }
    /* ------------------------------ */
    .sf_p_profile li,
    .sf_p_account li{
        display: flex;
        gap: 2rem;
        margin-bottom: 2rem;
        align-items: center;
    }
    .sf_p_profile li > p,
    .sf_delete > p,
    .sf_p_account li > p{
        width: 20%;
        text-align: end;
        font-size: 120%;
        font-weight: 500;
        color: #a60a27;
        height: 100%;
    }
    .sf_p_p_image_wrap {
        align-items: end;
    }
    .sf_p_p_image {
        background-color: white;
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
        height: 1rem;
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
    .sf_delete {
        display: flex;
        gap: 2rem;
        margin-bottom: 2rem;
        align-items: center;
    }
    .sf_delete a {
        color: red;
        background-color: white;
        padding: 0.8rem 2rem;
        font-weight: 600;
        border-radius: 1rem;
        transition: .3s ease;
    }
    .sf_delete a:hover {
        color: white;
        background-color: red;
    }
    .confirm_delete {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translateX(-50%) translateY(-50%);

        width: 20vw;
        height: 15vh;
        background-color: #e0e0e0;
        box-shadow: 3px 5px 5px 0px rgb(0,0,0,0.6);
        border-radius: 1rem;
    }
    .confirm_delete p:first-of-type {
        height: 70%;
        display: flex;
        justify-content: center;
        align-items: center;
        line-height: 2;
    }
    .sf_d_yes {
        color: red;
        background-color: white;
        border: 0;
        padding: 0.6em 1em;
        border-radius: 1em;
        transition: .3s ease;
    }
    .sf_d_yes:hover{
        background-color: red;
        color: white;
    }
     .sf_d_no{
        color: #333;
        background-color: white;
        border: 0;
        padding: 0.6em 1em;
        border-radius: 1em;
        margin-left: 2rem;
     }
    /* ---------------------------------------------------- */
    .sf_logout a {
        color: #a60a27;
        border: 2px solid #a60a27;
        font-size: 120%;
        font-weight: 600;
        padding: 0.6em 1em;
        border-radius: 1em;
    }
</style>