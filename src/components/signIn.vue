<template>
    <div id="signInBox">
        <form @submit.prevent>
            <div class="signpage_1 signpage" v-if="signinPage == 1">
                <div class="inputwrap signEmail">
                        <label for="signin_email">이메일</label>
                        <input type="text" name="email" id="signin_email" v-model="userInfo.email" required >
                </div>
                <p class="checktext">

                </p>
                <div class="pwdBox">
                    <div class="inputwrap signPwd">
                            <label for="signin_pwd">비밀번호</label>
                            <input type="password" name="pwd" id="signin_pwd" v-model="userInfo.pwd" required >
                    </div>
                    <br>
                    <div class="inputwrap signPwdconfirm">
                            <label for="signin_pwd">비밀번호 확인</label>
                            <input type="password" name="pwdconfirm" id="signin_pwdconfirm" required @change="correct_pwd" >
                    </div>
                    <p class="pwdInfo" v-text="pwdInfo_text"></p>
                </div>
                <p>
                    <button type="button" @click="sign_1" :disabled="!btnDbl">확인</button>
                </p>
            </div>


            <div class="signpage_2 signpage" v-else-if="signinPage == 2" >
                <p>정보를 입력해주세요</p>
                <div class="signpage_2_wrap">
                    <div class="avatar">
                        <div class="avatarWrap" @click="openFile">
                            <div class="clickMe" v-if="clickme">click</div>
                            <img src="">
                            <input type="file" name="avatar_img" id="avatar_img_input" accept="image/*" @input="uploadImg">
                        </div>
                        <div class="avatar_text">
                            <ul>
                                <li>- 프로필 사진을 등록해주세요.</li>
                                <li>- '내 정보' 에서 수정할 수 있습니다.</li>
                                <li>- 또 뭐 쓰지</li>
                                <li>- <span class="toDefaultImg" @click="resetImg">기본 이미지 적용하기</span></li>
                            </ul>
                        </div>
                        <div class="avatarModal">
                            <canvas></canvas>
                        </div>
                    </div>
                    <div class="inputwrap">
                        <label for="signin_nickname">이름</label>
                        <input type="text" name="nickname" id="signin_nickname" v-model="userInfo.name" required>
                    </div>
                </div>
                <div class="btns">
                    <button type="button" @click="saveInfo">저장</button>
                    <button type="button">취소</button>
                </div>
            </div>

        </form>
    </div>
</template>

<script setup>
import {createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile} from 'firebase/auth'
import {ref as dataRef, update} from 'firebase/database';
import {useAuth, useDatabase} from '../datasources/firebase.js';
import { onMounted, onUpdated, reactive, ref } from 'vue';
import {useRouter} from 'vue-router'
    const oRouter = useRouter();
import {useStore} from 'vuex';
    const store = useStore();

let userInfo = reactive({});
let btnDbl = ref(false)
let pwdInfo_text = ref('');
let signinPage = ref(1)

// 비밀번호 - 비밀번호 확인 일치 검사 //
const correct_pwd = function(e){
    const n = e.target.value;
    pwdInfo_text.value = n == userInfo.pwd? "비밀번호가 일치합니다." : "다시 확인해주세요."
    btnDbl = n == userInfo.pwd? true : false
}

let signCheck = ref(1)

// 이메일, 비밀번호 입력 후 정보 기입 이동 //
const sign_1 = () => {
    
    if (!signin_email.value) {
        signin_email.classList.add('required')
        signin_email.parentElement.classList.add('required')
    } else if(!signin_pwd) {
        signin_pwd.classList.add('required')
        signin_pwd.parentElement.classList.add('required')
    } else if(!signin_pwdconfirm) {
        signin_pwdconfirm.classList.add('required')
        signin_pwdconfirm.parentElement.classList.add('required')
    } else if( signin_pwd.value.length <6 ) {
        signin_pwd.classList.add('requiredLength')
        signin_pwd.parentElement.classList.add('requiredLength')
    } else if (!signin_email.value.match(/@/g)) {
        signin_email.classList.add('requiredEmail')
        signin_email.parentElement.classList.add('requiredEmail')
    }
     else {
        signinPage.value = 2;
    }
}

// upload avatar image -------------------------------------------------
let clickme = ref(true);
const openFile = () => {
    const avatarWrapFile = document.querySelector(".avatarWrap input");
    avatarWrapFile.click()
}
const uploadImg = (e) => {
    const img = document.querySelector(".avatarWrap img");
    const avatarWrap = document.querySelector(".avatarWrap");
    avatarWrap.style.background = '';
    const file = document.querySelector(".avatarWrap input").files[0];
    const reader = new FileReader();
    reader.addEventListener('load',function(){
        clickme.value = null;
        img.src = reader.result;
        if( img.clientWidth >= img.clientHeight ){
            img.style.height = '100%'
        } else {
            img.style.width = '100%'
        }
        userInfo.photoURL = reader.result;
    })
    if(file){
        reader.readAsDataURL(file);
    }
}
const resetImg = () => {
    const img = document.querySelector(".avatarWrap img")
    img.src = "";
    const avatarWrap = document.querySelector(".avatarWrap")
    avatarWrap.style.background = 'url("/img/img/rodent.png") center/cover no-repeat'
    clickme.value = true
}
// ---------------------------------------------------------------------
const saveInfo = () => {
    const me = useAuth.currentUser;
    if( !signin_nickname.value ) {
        alert('이름을 입력하세요')
    }else {
        
        // update(dataRef(useDatabase,'account/'+ me.uid),{
        //     name: userInfo.name,
        //     photoURL: userInfo.photoURL? userInfo.photoURL : "/img/img/rodent.png"
        // })
        if( btnDbl ) {
        createUserWithEmailAndPassword(useAuth, userInfo.email, userInfo.pwd)
            .then((credential) => {
                const user = credential.user;
                const userData = {
                    id: user.uid,
                    email: user.email,
                    uid: user.uid,
                    name: userInfo.name,
                    photoURL: userInfo.photoURL? userInfo.photoURL : "",
                    playlist: '',
                    follower: '',
                    follering: ''
                };
                update(dataRef(useDatabase,'account/'+user.uid),userData);
                updateProfile(me, {
                    displayName: userInfo.name,
                    photoURL: userInfo.photoURL
                });
                store.commit('loginAccount',userData)
                
            })
            .catch(err => {
                const code = err.code;
                console.log(err)
                if(code == 'auth/email-already-in-use'){
                    alert("이미 가입된 이메일입니다.")
                } else if (code == 'auth/weak-password'){
                    alert("비밀번호는 6자리 이상 입력하십시오.")
                }
            })
        }
        oRouter.push("/")
    }
}
// -----------------------------------------------------------------------
let oInputs = reactive(document.querySelectorAll(".inputwrap input"));
onMounted(function(){
  inputMotion();
})
onUpdated(function(){
  inputMotion();
})
const inputMotion = function(){
    oInputs = document.querySelectorAll(".inputwrap input")
    oInputs.forEach(v => {
        const par = v.parentElement;
        const lab = par.querySelector("label");
        v.addEventListener("focus",function(){
            lab.classList.add('label_focused','label_value')
            v.classList.remove('required','requiredEmail','requiredLength')
            v.parentElement.classList.remove('required','requiredLength','requiredEmail')
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
</script>

<style scoped>
#signInBox {
    width: 100%;
    height: 100vh;
    background-color: transparent;
    display: flex;
    justify-content: center;
    align-items: center;
}
.signpage {
    margin: auto;
    width: min(100vw, 500px);
}
.signpage_2_wrap {
    display: block;
}
.avatar {
    display: flex;
    justify-content: space-between;
    padding: 1rem;
}
#avatar_img_input {
    display: none;
}
.avatarModal {
    display: none;
}
.avatarWrap {
    border: 1px solid #666;
    border-radius: 50%;
    width: 10rem;
    aspect-ratio: 1/1;
    overflow: hidden;
    cursor: pointer;
    
}
.avatarWrap_img {
    width: 100%;
    height: 100%;
}
.clickMe {
    background-color: royalblue;
}
.toDefaultImg {
    text-decoration: underline;
    cursor: pointer;
}
.btns {
    padding-top: 2rem;
}
.btns button {
    border: 0;
    background-color: #ddd;
    padding: 0.5em 1em;
    font-size: 100%;
    border-radius: 1em;
    cursor: pointer;
}

#signin_email.required,
#signin_email.requiredEmail,
#signin_pwd.required,
#signin_pwd.requiredLength,
#signin_pwdconfirm.required
{
    border: 2px solid red;
    position: relative;
}
.signEmail.required::after {
    content: '이메일을 입력해주세요.';
    position: absolute;
    top: 110%;
    left: 0;
    display: block;
    text-align: center;
    color: red;
    font-size: 100%;
    width: 100%;
}
.signEmail.requiredEmail::after {
    width: 100%;
    content: '이메일을 정확히 입력해주세요.';
    position: absolute;
    top: 110%;
    left: 0;
    display: block;
    text-align: center;
    color: red;
    font-size: 100%;
}
.signPwd.required::after {
    width: 100%;

    content: '비밀번호를 입력해주세요.';
    position: absolute;
    top: 110%;
    left: 0;
    display: block;
    text-align: center;
    color: red;
    font-size: 100%;
}
.signPwdconfirm.required::after {
    width: 100%;

    content: '비밀번호 확인란을 입력해주세요.';
    position: absolute;
    top: 110%;
    left: 0;
    display: block;
    text-align: center;
    color: red;
    font-size: 100%;
}
.signPwd.requiredLength::after {
    width: 100%;

    content: '비밀번호는 6자리 이상 입력해주세요.';
    position: absolute;
    top: 110%;
    left: 0;
    display: block;
    text-align: center;
    color: red;
    font-size: 100%;
}
.signpage_1 > div{
    margin-bottom: 2rem;
}
</style>