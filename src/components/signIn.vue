<template>
    <div class="signInBox">
        <form>
            <div class="inputwrap">
                <label for="signin_email">이메일</label>
                <input type="text" name="email" id="signin_email" v-model="userInfo.email" required>
                <p></p>
            </div>
            <div class="inputwrap">
                <label for="signin_nickname">이름</label>
                <input type="text" name="nickname" id="signin_nickname" v-model="userInfo.name" required>
            </div>
            <div class="inputwrap">
                <label for="signin_pwd">비밀번호</label>
                <input type="password" name="pwd" id="signin_pwd" v-model="userInfo.pwd" required>
                <label for="signin_pwd">비밀번호 확인</label>
                <input type="password" name="pwdconfirm" id="signin_pwdconfirm" required @change="correct_pwd">
                <p class="pwdInfo" v-text="pwdInfo_text"></p>
            </div>
            <div class="inputwrap">
                <label for="signin_phone">핸드폰 인증</label>
                <input type="tel" name="phone" id="signin_phone" v-model="userInfo.phone" required :disabled="cert_complete">
            </div>

            <div class="inputwrap"></div>
        </form>
    </div>
</template>

<script setup>
import {createUserWithEmailAndPassword} from 'firebase/auth'
import { reactive, ref } from 'vue';

const cert_complete = false;
let userInfo = reactive({});
let pwdInfo_text = ref('');
const correct_pwd = function(e){
    const n = e.target.value;
    pwdInfo_text = n == userInfo.pwd? "비밀번호가 일치합니다." : "다시 확인해주세요."
}
</script>