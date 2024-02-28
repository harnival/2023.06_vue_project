<template>
    <div id="signUpBox">
        <form @submit.prevent>
            <div class="signUp_headerIcon" @click="() => oRouter.push({name : 'home'})">
                <img src="../assets/img/main-icon-fill2.png">
                <h1>CHEEZS</h1>
            </div>
            <div class="signpage_1 signpage" v-if="signupPage == 1">

                <div class="signupBox_title">
                    <span>회원정보입력</span>
                </div>
                <div>
                    회원가입을 위해 이메일과 비밀번호를 입력하세요.
                </div>
                <div class="inputwrap signEmail">
                        <label for="signup_email">이메일</label>
                        <input type="text" name="email" id="signup_email" v-model="signUpInfo.email" required autocomplete="off">
                </div>
                <div class="pwdBox">
                    <div class="inputwrap signPwd">
                            <label for="signup_pwd">비밀번호</label>
                            <input type="password" name="pwd" id="signup_pwd" v-model="signUpInfo.pwd" required autocomplete="off">
                    </div>
                    <br>
                    <div class="inputwrap signPwdconfirm">
                            <label for="signup_pwd">비밀번호 확인</label>
                            <input type="password" name="pwdconfirm" id="signup_pwdconfirm" required @change="correct_pwd" autocomplete="off">
                    </div>
                    <p class="pwdInfo" v-text="pwdInfo_text" ></p>
                </div>
                <p>
                    <button class="yesbtn" :class="[btnDbl? 'abledYes' : 'disabledYes']"  type="button" @click="sign_1" :disabled="!btnDbl">가입하기</button>
                </p>
            </div>


            <div class="signpage_2 signpage" v-else-if="signupPage == 2" >
                <div class="signpage_2_wrap">
                    <div class="avatar">
                        <div class="avatarWrap" @click="openFile">
                            <div class="clickMe" v-if="clickme">클릭하여 파일 업로드</div>
                            <img :src="userInfo.photoURL === ''? '/img/img/rodent.png' : userInfo.photoURL ">
                            <input type="file" name="avatar_img" id="avatar_img_input" accept="image/*" @input="uploadImg">
                        </div>
                        <div class="avatar_text">
                            <ul>
                                <li>- &nbsp; 프로필 사진을 등록해주세요.</li>
                                <li>- &nbsp; '설정' 에서 수정할 수 있습니다.</li>
                                <li>- &nbsp; <span class="toDefaultImg" @click="resetImg">기본 이미지 적용하기</span></li>
                            </ul>
                        </div>
                        <div class="avatarModal">
                            <canvas></canvas>
                        </div>
                    </div>
                    <div class="inputwrap">
                        <label for="signup_nickname">이름</label>
                        <input type="text" name="nickname" id="signup_nickname" v-model="userInfo.name" required maxlength="3000">
                    </div>
                </div>
                <div class="btns">
                    <button type="button" @click="saveInfo">저장</button>
                    <button type="button" @click="() => cancelInfo()">취소</button>
                </div>
            </div>

        </form>
    </div>
</template>

<script setup>
import {createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile} from 'firebase/auth'
import {ref as dataRef, equalTo, get, orderByChild, query, update} from 'firebase/database';
import {useAuth, useDatabase} from '../datasources/firebase.js';
import { onMounted, onUpdated, reactive, ref, watch } from 'vue';
import {useRouter} from 'vue-router'
    const oRouter = useRouter();
import {useStore} from 'vuex';
    const store = useStore();
const defaultUser = {
    email : '',
    id : '',
    photoURL : null,
    date : Date.now(),
    uid : ''
};
const defaultSignUp = {
    email : '',
    pwd : ''
};
let userInfo = ref({...defaultUser});
let signUpInfo = ref({...defaultSignUp})
let btnDbl = ref(false)
let pwdInfo_text = ref('');
let signupPage = ref(1)


// 비밀번호 - 비밀번호 확인 일치 검사 //
function correct_pwd(e){
    const n = e.target.value;
    pwdInfo_text.value = n == signup_pwd.value? "비밀번호가 일치합니다." : "다시 확인해주세요."
    btnDbl = n == signup_pwd.value? true : false
}

// 이메일, 비밀번호 입력 후 정보 기입 이동 //
function sign_1(){
    if (!signup_email.value) {  // 이메일 작성 유무
        signup_email.classList.add('required')
        signup_email.parentElement.classList.add('required')
    } else if(!signup_pwd) {    // 비밀번호 작성 유무
        signup_pwd.classList.add('required')
        signup_pwd.parentElement.classList.add('required')
    } else if(!signup_pwdconfirm) { // 비밀번호 확인 작성 유무
        signup_pwdconfirm.classList.add('required')
        signup_pwdconfirm.parentElement.classList.add('required')
    } else if( signup_pwd.value.length <6 ) {   // 비밀번호 요건 충족 여부
        signup_pwd.classList.add('requiredLength')
        signup_pwd.parentElement.classList.add('requiredLength')
    } else if (!signup_email.value.match(/@/g)) {   // 이메일 요건 충족 여부
        signup_email.classList.add('requiredEmail')
        signup_email.parentElement.classList.add('requiredEmail')
    } else {
        const query1 = query(dataRef(useDatabase,'user'),orderByChild('info/email'),equalTo(signup_email.value));
        get(query1).then(data => {
            if(data.exists()){
                signup_email.classList.add('existEmail')
                signup_email.parentElement.classList.add('existEmail')
            }else{
                signupPage.value = 2;
            }
        })
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
    // const avatarWrap = document.querySelector(".avatarWrap");
    const file = document.querySelector(".avatarWrap input").files[0];
    const reader = new FileReader();
    reader.addEventListener('load',function(){
        // img.src = reader.result;
        if( img.clientWidth >= img.clientHeight ){
            img.style.height = '100%'
        } else {
            img.style.width = '100%'
        }
        userInfo.value.photoURL = reader.result;
    })
    if(file){
        reader.readAsDataURL(file);
        clickme.value = null;
    }
}
const resetImg = () => {
    userInfo.value.photoURL = '';
    clickme.value = null;
    // const img = document.querySelector(".avatarWrap img")
    // img.src = "";
    // const avatarWrap = document.querySelector(".avatarWrap")
    // avatarWrap.style.background = 'url("/img/img/rodent.png") center/cover no-repeat'
    // clickme.value = true
}
// ---------------------------------------------------------------------
const saveInfo = () => {
    if( !signup_nickname.value ) {
        alert('이름을 입력하세요')
    }else {
        
        // update(dataRef(useDatabase,'account/'+ me.uid),{
        //     name: userInfo.name,
        //     photoURL: userInfo.photoURL? userInfo.photoURL : "/img/img/rodent.png"
        // })
        if( btnDbl ) {
        createUserWithEmailAndPassword(useAuth, signUpInfo.email, signUpInfo.pwd)
            .then((credential) => {
                const user = credential.user;
                const userData = {
                    info : userInfo.value,
                    playlist: '',
                    follower: '',
                    follering: ''
                };
                update(dataRef(useDatabase,'user/'+user.uid),userData);
                updateProfile(useAuth.currentUser, {
                    displayName: userInfo.value.name,
                    photoURL: userInfo.value.photoURL
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
const cancelInfo = () => {
    signUpInfo.value = defaultSignUp;
    userInfo.value = defaultUser;
    signupPage.value = 1;
    console.log(signUpInfo.value)
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
            v.classList.remove('required','requiredEmail','requiredLength','existEmail')
            v.parentElement.classList.remove('required','requiredLength','requiredEmail','existEmail')
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

<style>
    @import '../css/components/signUp.css';
</style>