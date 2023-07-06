<template>
    <div class="loginBox">
        <div class="inputs">
            <form @submit.prevent="clickLogin">
                <div>
                    <div class="inputwrap">
                        <label for="user_id">아이디 및 이메일</label>
                        <input type="text" name="user_id" id="user_id">
                    </div>
                    <br>
                    <br>
                    <div class="inputwrap">
                        <label for="user_pwd">비밀번호</label>
                        <input type="password" name="user_pwd" id="user_pwd">
                    </div>
                </div>
                <div class="inputBtn">
                    <button type="submit">로그인하기</button>
                </div>
            </form>
            <a href="" class="signInBtn" @click.prevent="router.push('/signin')">
                계정이 없으신가요?
                <span>회원가입</span>
            </a>

        </div>
    </div>
</template>

<script setup>
import {onMounted, ref, defineEmits, defineProps} from 'vue';
import { useRouter,useRoute } from 'vue-router';
    const router = useRouter();

const clickLogin = function(e){
    console.log(e)
}
// ------------------------------------
const emits = defineEmits(['input-motion']);
const inputMotion = function(){
    emits('input-motion')
}
inputMotion();
</script>

<style scoped>
.loginBox {
    width: 100%;
    height: 100vh;
    background-color: transparent;
    display: flex;
    justify-content: center;
    align-items: center;
}
.inputs form{
    position: relative;
}
.signInBtn {
    display: block;
    font-size: 80%;
    color: #666;
    padding-top: 1rem;
    text-decoration: none;
}
.signInBtn span {
    text-decoration: underline;
    text-underline-position: under;
}
.signInBtn:hover {
    color: black;
}
.inputBtn {
    height: 100%;
    position: absolute;
    left: 100%;
    top: 0;
    display: flex;
    align-items: end;
    margin-left: 1rem;
    padding-bottom: 2px;
    box-sizing: border-box;

}
.inputBtn button {
    display: block;
    border: 0;
    border-radius: 50%;
    font-size: 0;
    width: 3rem;
    aspect-ratio: 1/1;
    cursor: pointer;
    transition: .3s ease-in-out;
    transform-origin: center;
    background: #ddd url('/img/img/arrow_right.png') center/ 80%;
}
.inputBtn button:hover {
    transform: scale(1.1,1.1);
    opacity: 0.9;
}
</style>