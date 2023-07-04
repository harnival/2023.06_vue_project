<template>
    <div class="loginBox">
        <div class="inputs">
            <form>
                <div class="inputWrap">
                    <input type="text" name="user_id" id="user_id">
                </div>
                <div class="inputWrap">
                    <input type="password" name="user_pwd" id="user_pwd">
                </div>
            </form>
            <div class="inputBtn">
                <button>로그인하기</button>
                <a href="signIn" class="signInBtn" @click="goSignIn">
                    계정이 없으신가요?
                    <span>회원가입</span>
                </a>
            </div>

        </div>
    </div>
</template>

<script setup>
import {ref} from 'vue';
import { useRouter,useRoute } from 'vue-router';
    const router = useRouter();
    const route = useRoute();
const goSignIn = function(){
    router.push('/signIn');
}
</script>