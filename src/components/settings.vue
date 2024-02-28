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
                                    <a href="/" @click.prevent="resetPwdChoice = 0">비밀번호 수정하기</a>
                                    <div class="confirm_delete" v-if="resetPwdChoice === 0">
                                        <p>비밀번호를 재설정하시겠습니까?</p>
                                        <p>
                                            <button type="button" class="sf_d_yes" @click.prevent="() => pwdReset(myData.email)">재설정</button>
                                            <button type="button" class="sf_d_no" @click.prevent="resetPwdChoice = -1">취소</button>
                                        </p>
                                    </div>
                                    <div class="confirm_delete" v-if="resetPwdChoice===1">
                                        <p>해당 이메일로 재설정 메일을 발송했습니다. <br/> 확인해주시기 바랍니다.</p>
                                        <p>
                                            <button type="button" class="sf_d_no" @click.prevent="resetPwdChoice = -1">취소</button>
                                        </p>
                                    </div>
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
import { useDatabase, useAuth } from '../datasources/firebase';
import { ref as dataRef , update } from 'firebase/database';
import { sendPasswordResetEmail } from 'firebase/auth';

// 내 데이터 불러오기 //
let myData = reactive(store.getters.getLoginUserData);
watch(() => store.getters.getLoginUserData, (cur) => {
    if (cur) {
        myData = Object.assign(myData,cur)
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
        updates[`user/${myData.uid}/info/photoURL`] = reader.result;
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
    updates[`user/${myData.uid}/info/name`] = e.target.value;
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
    updates[`user/${myData.uid}/info/id`] = e.target.value;
    update(dataRef(useDatabase),updates);
}
    // 이메일 //
let emailReplace = ref(true);
const clickEmailReplace = function(){
    emailReplace.value = !emailReplace.value;
    myData.email = e.target.value
}

let deleteChoice = ref(false);
let resetPwdChoice = ref(-1)
const pwdReset = function(email){
    if(useAuth.currentUser){
        sendPasswordResetEmail(useAuth.currentUser, email)
        .then(() => {
            console.log("pwd email send");
            resetPwdChoice.value = 1
        }).error(err => console.log(err.code,"--->",err.message))
    }
}
</script>

<style>
    @import '../css/components/settings.css';
</style>