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
                    <br>
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
                <p>가입이 완료되었습니다! 정보를 입력해주세요</p>
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
let signinPage = ref(2)
const correct_pwd = function(e){
    const n = e.target.value;
    pwdInfo_text.value = n == userInfo.pwd? "비밀번호가 일치합니다." : "다시 확인해주세요."
    btnDbl = n == userInfo.pwd? true : false
}

let signCheck = ref(1)

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
    updateProfile(me, {
        displayName: userInfo.name,
        photoURL: userInfo.photoURL
    });
    update(dataRef(useDatabase,'account/'+ me.uid),{
        name: userInfo.name,
        photoURL: userInfo.photoURL? userInfo.photoURL : "/img/img/rodent.png"
    })
}
</script>

<style scoped>
.signInBox {
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
</style>