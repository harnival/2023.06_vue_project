<template>
    <div id="loginBox">
        <div class="inputs">
            <div class="inputs_title">
                <p>로그인</p>
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
onUpdated(function(){
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
        store.dispatch('loginWithEmail',dataobj)
    }
}
onMounted(function(){
    watch(() => store.getters.getLoginError, (cur) => {
        const loginForm = document.getElementById('loginForm')
        if(cur){
            loginForm.classList.add('wrongLogin');
        } else {
            loginForm.classList.remove('wrongLogin')
        }
    },{immediate:true})
})


</script>

<style scoped>
.inputs_title {
    position: absolute;
    top: 0;
    left: 0;
    text-align: center;
    font-size: 300%;
    width: 100%;
    color: var(--main-color1);
    font-weight: 500;
    margin: auto;
}
.inputs_title p {
    margin: auto;
}
#loginBox {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: transparent;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--main-color1);
}
.inputs {
    position: relative;
    background-color: #f0f0fd;
    width: 100%;
    padding: 10%;
}
#loginForm{
    position: relative;
    margin: 0px auto 2rem;
    width: min(80vw, 300px);
}
#loginForm.wrongLogin::before {
    content: '이메일 또는 비밀번호가 틀렸습니다. 다시 입력해주세요.';
    position: absolute;
    bottom: 120%;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: center;
    color: red;
    font-size: 100%;
    white-space: nowrap;
    word-break: keep-all;

}
#user_id.requireInput,
#user_pwd.requireInput {
    border: 2px solid red;
    position: relative;
    box-sizing: border-box;
}
#inputwrap_id.requireInput::after{
    content: '이메일을 입력해주세요.';
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    display: block;
    color: red;
    font-size: 90%;
}
#inputwrap_pwd.requireInput::after{
    content: '비밀번호를 입력해주세요.';
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    display: block;
    color: red;
    font-size: 90%;
}
.signInBtn {
    display: block;
    font-size: 80%;
    color: #666;
    text-decoration: none;
}
.btnWrap {
    padding-top: 1rem;
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
    background: #ddd url('../assets/img/arrow_right.png') center/ 80%;
}
.inputBtn button:hover {
    transform: scale(1.1,1.1);
    opacity: 0.9;
}
</style>