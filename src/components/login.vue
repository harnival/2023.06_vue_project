<template>
    <div id="loginBox">
        
        <div class="inputs">
            <div class="inputs_title">
                <div class="login_headerIcon" @click="() => router.push({name : 'home'})">
                    <img src="../assets/img/main-icon-fill2.png">
                    <h1>CHEEZS</h1>
                </div>
            </div>
            <form @submit.prevent="clickLogin" id="loginForm">
                <div>
                    <div class="inputwrap" id="inputwrap_id">
                        <label for="user_id">아이디 및 이메일</label>
                        <input type="text" name="user_id" id="user_id" autocomplete="off">
                    </div>
                    <br>
                    <br>
                    <div class="inputwrap" id="inputwrap_pwd">
                        <label for="user_pwd">비밀번호</label>
                        <input type="password" name="user_pwd" id="user_pwd" autocomplete="off">
                    </div>
                </div>
                <div class="inputBtn">
                    <button type="submit">로그인하기</button>
                </div>
            </form>
            <div class="btnWrap">
                <a href="" class="signInBtn" @click.prevent="router.push('/signin')">
                    계정이 없으신가요?
                    <span>회원가입</span>
                </a>
            </div>

        </div>
    </div>
</template>

<script setup>
import {onBeforeMount, onMounted, onUpdated, ref, watch} from 'vue';
import { useRouter} from 'vue-router';
    const router = useRouter();
import {useAuth, useDatabase} from '../datasources/firebase.js'
import { useStore } from 'vuex';
    const store = useStore();
import { signInWithEmailAndPassword} from 'firebase/auth';
// [common] input motion ------------------------------------
onMounted(function(){
  inputMotion();
})
const inputMotion = function(){
  let oInputs = document.querySelectorAll(".inputwrap input");
  oInputs.forEach(v => {
      const par = v.parentElement;
      const lab = par.querySelector("label");
      v.addEventListener("focus",function(){
          lab.classList.add('label_focused','label_value')
          v.classList.remove('requireInput');
          par.classList.remove('requireInput');
          loginForm.classList.remove('wrongLogin');
      })
      v.addEventListener('blur',function(){
          if(v.value == ""){
              lab.classList.remove('label_focused','label_value')
          } else {
              lab.classList.remove('label_focused')
          }
      })
  })
}

// login ---------------------------------------------------
const clickLogin = function(e){
    const data = new FormData(e.target);
    const dataobj = Object.fromEntries(data.entries());
    // 입력 확인 //
    if ( !dataobj.user_id || !dataobj.user_id.match(/@/) ) {
        inputwrap_id.classList.add("requireInput");
        user_id.classList.add("requireInput");
    } else if ( !dataobj.user_pwd ) {
        inputwrap_pwd.classList.add("requireInput");
        user_pwd.classList.add("requireInput");
    } 
    else {
        // 로그인 에러 확인 및 완료 --> 사용자 정보 저장 후 메인 페이지로 이동
        // store.dispatch('loginWithEmail',dataobj)

        signInWithEmailAndPassword(useAuth,dataobj.user_id,dataobj.user_pwd)
        .then(usercredential => {
            const uid = usercredential.user.uid;
            store.commit('loginAccount', store.getters.getDataUsers[uid])
            store.commit('setSetLoading',false);
            router.push({name : 'home'})
        })
        .catch(err => {
            const code = err.code;
            const message = err.message;
            console.log("[Login Error]" + code + " => " + message);
            store.commit('setLoginError',true);
            loginForm.classList.add('wrongLogin');

        });
    }
}
onMounted(function(){
    // watch(() => store.getters.getLoginError, (cur) => {
    //     const loginForm = document.getElementById('loginForm')
    //     if(cur){
    //         loginForm.classList.add('wrongLogin');
    //     } else {
    //         loginForm.classList.remove('wrongLogin')
    //     }
    // },{immediate:true})
})


</script>

<style>
    @import '../css/components/login.css';
</style>