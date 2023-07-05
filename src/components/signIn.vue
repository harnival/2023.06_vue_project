<template>
    <div class="signInBox">
        <form>
            <div class="signpage_1 signpage" v-if="signinPage == 1">
                <div class="inputwrap">
                    <label for="signin_email">이메일</label>
                    <input type="text" name="email" id="signin_email" v-model="userInfo.email" required>
                </div>
                <p class="checktext">

                </p>
                <div class="pwdBox">
                    <div class="inputwrap">
                        <label for="signin_pwd">비밀번호</label>
                        <input type="password" name="pwd" id="signin_pwd" v-model="userInfo.pwd" required>
                    </div>
                    <div class="inputwrap">
                        <label for="signin_pwd">비밀번호 확인</label>
                        <input type="password" name="pwdconfirm" id="signin_pwdconfirm" required @change="correct_pwd">
                    </div>
                    <p class="pwdInfo" v-text="pwdInfo_text"></p>
                </div>
                <p>
                    <button type="button" @click="createAccount" :disabled="!btnDbl">확인</button>
                </p>
            </div>


            <div class="signpage_2 signpage" v-else-if="signinPage == 2">
                <div class="avater">
                    <div class="avatarWrap" @click="openFile">
                        <img src="" alt="">
                        <input type="file" name="avatar_img" id="avatar_img_input" accept="image/*" @input="uploadImg">
                    </div>
                    <div class="avatarModal">
                        <canvas></canvas>
                    </div>
                </div>
                <div class="inputwrap">
                    <label for="signin_nickname">이름</label>
                    <input type="text" name="nickname" id="signin_nickname" v-model="userInfo.name" required>
                </div>
                <div>
                    <button type="button" @click="saveInfo">저장</button>
                </div>
            </div>

        </form>
    </div>
</template>

<script setup>
import {createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile} from 'firebase/auth'
import {ref as dataRef, update} from 'firebase/database';
import {useAuth, useDatabase} from '../datasources/firebase.js';
import { onMounted, reactive, ref } from 'vue';
import {useRouter} from 'vue-router'
    const oRouter = useRouter();
import {useStore} from 'vuex';
    const store = useStore();

let userInfo = reactive({});
let btnDbl = ref(false)
let pwdInfo_text = ref('');
let signinPage = ref(2)
const correct_pwd = function(e){
    const n = e.target.value;
    pwdInfo_text.value = n == userInfo.pwd? "비밀번호가 일치합니다." : "다시 확인해주세요."
    btnDbl = n == userInfo.pwd? true : false
}

let signCheck = ref(1)

onMounted(function(){
    // ** styles --------------------------
    const inputs = document.querySelectorAll('.inputwrap input');
    inputs.forEach(v => {
        const par = v.parentElement;
        const lab = par.querySelector("label");
        v.addEventListener("focus",function(){
            lab.classList.add('label_focused','label_value')
        })
        v.addEventListener('blur',function(){
            if(v.value == ""){
                lab.classList.remove('label_focused','label_value')
            } else {
                lab.classList.remove('label_focused')
            }
        })
    })
    //--------------------------------------
})

const createAccount = () => {
    console.log(btnDbl)
    if( btnDbl ) {
        createUserWithEmailAndPassword(useAuth, userInfo.email, userInfo.pwd)
            .then((credential) => {
                const user = credential.user;
                const userData = {
                    email: user.email,
                    uid: user.uid,
                    name: user.displayName? user.displayName : "",
                    photoURL: user.photoURL? user.photoURL : ""
                };
                update(dataRef(useDatabase,'account/'+user.uid),userData);
                store.commit('loginAccount',userData);
                signInWithEmailAndPassword(useAuth, userInfo.email, userInfo.pwd);
                signinPage.value = 2;
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
}
// upload avatar image -------------------------------------------------
const openFile = () => {
    const avatarWrapFile = document.querySelector(".avatarWrap input");
    avatarWrapFile.click()
}
const uploadImg = (e) => {
    const img = document.querySelector(".avatarWrap img");
    const file = document.querySelector(".avatarWrap input").files[0];
    const reader = new FileReader();
    reader.addEventListener('load',function(){
        img.src = reader.result;
        if( img.clientWidth >= img.clientHeight ){
            img.style.height = '100%'
        } else {
            img.style.width = '100%'
        }
    })
    if(file){
        reader.readAsDataURL(file)
    }
}
// ---------------------------------------------------------------------
const saveInfo = () => {
    const me = useAuth.currentUser;
    updateProfile(me, {
        displayName: userInfo.name,
        photoURL: userInfo.photoURL
    });
    update(dataRef(useDatabase,'account/'+ me.uid),{
        name: userInfo.name,
        photoURL: userInfo.photoURL? userInfo.photoURL : "./img/img/rodent.png"
    })
}
</script>

<style scoped>
.signpage {
    margin: auto;
    width: min(100vw, 500px);
    background-color: #eee;
}
.signpage_2 {
    display: flex;
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
}
.avatarWrap_img {
    width: 100%;
    height: 100%;
}
</style>