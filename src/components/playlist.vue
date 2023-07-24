<template>
    <div id="playlistBox">
        <div class="playlistBoxWrap">
            <div class="searchBox">
                <!-- <div class="sb_title">
                    <h3></h3>
                </div> -->
                <div class="sb_inputWrap">
                    <div class="focusLine"></div>
                    <div class="inputBox_sb">
                        <input type="text" v-model="searchs" placeholder="검색어를 입력하세요." @focusin="inputFocus" @focusout="inputFocusOut">
                        <button class="sb_btn" @click.prevent="searchSubmit">검색</button>
                    </div>
                </div>
            </div>


        </div>
    </div>
</template>
<script setup>
    import { ref, reactive } from 'vue';
    import { ref as dataRef, query, orderByValue, getDatabase} from 'firebase/database';
    import {useDatabase} from '../datasources/firebase'
    // ==========================================================
    let searchs = ref(null);
    let hashSearch = reactive({value:{}})
    // ==========================================================
    const inputFocus = () => {  // 검색창 focusin 시 반응
    const q1 = document.querySelector(".focusLine");
    const q2 = document.querySelector(".sb_btn");
    q1.style.width = '100%';
    q2.style.borderColor = '#A60A27';
    }
    const inputFocusOut = () => {   // 검색창 focusouy 시 반응
        const q1 = document.querySelector(".focusLine");
        const q2 = document.querySelector(".sb_btn");
        q1.style.width = '0%';
        q2.style.borderColor = '#aaaaaa';
    }
    // =========================================================
    const searchSubmit = function(event){
        const q = searchs.value;
        const w = getDatabase();
        const refs = w.ref(`playlists`);
        refs.on('child_added',(snapshot,key) => {
            console.log(snapshot.val())
        })
       
    }
</script>

<style scoped>
.searchBox {
    position: relative;
    display: flex;
    justify-content: center;
    box-sizing: border-box;
    /* border-radius: 2rem; */
    background-color: white;
    margin: 10% auto;
    padding: 1rem 0;
    height: fit-content;
}
.sb_title{
    position: absolute;
    bottom: 100%;
    left: 15%;
    font-size: 250%;
    color: white;
    width: 70%;
    font-family: 'NanumSquareNeoBold';
}
.sb_title h3 {
    text-align: left;
    line-height: 1;
}
.sb_inputWrap {
    width: 70%;
    margin: auto;
    position: relative;
}
.searchBox input {
    width: 100%;
    font-size: 100%;
    padding: 1rem 10%;
    box-sizing: border-box;
    border: 0;
    border-bottom: 2px solid #aaa;
    outline: none;
    z-index: 8000;
    background-color: transparent;
}
.inputBox_sb {
    z-index: 8000;
}
.focusLine {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 0;
    height: 2px;
    background-color: #A60A27;
    transition: .5s ease;
}
.sb_btn {
    font-size: 0px;
    position: absolute;
    right: 0;
    top: 0;
    border-width: 2px;
    border-style: solid;
    border-color: #aaaaaa;
    background: transparent url('../assets/img/search.svg') center/2rem no-repeat;
    height: 100%;
    aspect-ratio: 2/1;
    cursor: pointer;
    transition: .5s ease;
}
.sb_btn:hover {
    background-color: #a60a278a;
    border-color: #a60a278a;
}
</style>