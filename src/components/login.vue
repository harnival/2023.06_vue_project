<template>
    <div class="loginBox">
        <button type="button" @click="router.push('/')">(임시) 메인으로 이동</button>
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
                <a href="" class="signInBtn" @click.prevent="router.push('/signin')">
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
</script>