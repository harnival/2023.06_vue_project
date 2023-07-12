<template>
    <div id="homeWrap">

        <div class="section">
            <div class="sec1_title">
                <h3>내 플레이리스트</h3>
                <a href="/" @click.prevent="router.push('/account',{params: {ids : 'my'}})" class="sec_title_btn">더 보기</a>
            </div>
            <div class="sectionWrap">

                <div class="nolist" >
                    <span>플레이리스트가 없습니다.</span>
                </div>
                <div class="sec1_list_wrap">
                    <button type="button" class="leftArrow"></button>
                    <button type="button" class="rightArrow"></button>
                    <ul >
                        <li v-for="(item,key) in myPlaylist" class="sec1_list" :key="key">
                            <div class="sec1_list_image">
                                <img :src="item.cover">
                                <button type="button" @click.prevent>플레이리스트 재생</button>
                            </div>
                            <div class="sec1_list_text">
                                <p class="sec1_l_t_title">{{ item.title }}</p>
                                <p class="sec1_l_t_sub">
                                    <span>총 {{item.tracks? Object.entries(item.tracks).length : 0 }}곡</span>
                                    <span>{{ item.totalLength }}</span>
                                </p>
                                <p class="sec1_l_t_tag">
                                    <ul>
                                        <li v-for="tag in item.tag">#{{ tag }}</li>
                                    </ul>
                                </p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="sec2_title">
                <h3>인기 해시</h3>
                <a href="/" class="sec_title_btn" @click.prevent>더 보기</a>
            </div>
            <div class="sectionWrap">
                
            </div>
        </div>
        <div class="section"></div>
    </div>
</template>

<script setup>
import {reactive} from 'vue';
import { useDatabase , useAuth} from '../datasources/firebase';
import { ref as dataRef, onValue } from 'firebase/database';
import { useStore } from 'vuex';
    const store = useStore();
import { useRouter } from 'vue-router';
    const router = useRouter();

const myPlDb = dataRef(useDatabase,'/account/'+useAuth.currentUser.uid+'/playlist');
let myPlaylist = reactive([]);
onValue(myPlDb, (snapshot) => {
    const data = snapshot.val()
    myPlaylist = data;
})
</script>

<style scoped>
.sectionWrap {
    width: 80%;
    margin: 0 auto;
}
.leftArrow, .rightArrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    border: 0;
    width: 4rem;
    aspect-ratio: 1/1;
}
.leftArrow {
    background: transparent url('/img/img/arrow-left-circle.svg') no-repeat center/contain;
    left: -4rem;
}
.rightArrow {
    background: transparent url('/img/img/arrow-right-circle.svg') no-repeat center/contain;
    right: -4rem;
}
    .sec1_title {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .sec_title_btn {
        text-decoration: none;
        color: black;
        display: block;
        font-size: 80%;
        padding: 0.2em 2em 0.2em 1em;
        background: url('/img/img/chevron-double-right.svg') no-repeat center right/ contain;        
        transition: .3s ease;
    }
    .sec_title_btn:hover {
        opacity: 0.7;
        filter: hue-rotate(90deg);
    }
    .sec1_list_wrap {
        height: 35vh;
        border: 1px solid blue;
        overflow: hidden;
        position: relative;
    }
    .sec1_list_wrap > ul {
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
    }
    .sec1_list {
        width: 250px;
        margin: 0 1rem;
        height: 100%;
        border: 1px solid tomato;
        box-sizing: border-box;
        border-top-left-radius: 2rem;
        border-top-right-radius: 2rem;
        overflow: hidden;
    }
    .sec1_list_image{
        width: 100%;
        aspect-ratio: 1/1;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
    }
    .sec1_list_image img {
        width: 100%;
        height: 100%;
    }
    .sec1_list_image button {
        position: absolute;
        bottom: 10px;
        right: 10px;
        font-size: 0px;
        width: 20%;
        aspect-ratio: 1/1;
        border-radius: 50%;
        border: none;
        opacity: 0.6;
        background: #ddd url('/img/img/play.svg') no-repeat center / 80%;

    }
    .sec1_l_t_title {
        font-size: 120%;
        font-weight: 600;
        margin-bottom: 1rem;
    }
    .sec1_l_t_sub {
        font-size: 90%;
        color: #666;
        display: flex;
        justify-content: space-between;
        padding: 0 1em;
    }
    .sec1_l_t_tag ul{
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
    }
    .sec1_l_t_tag li {
        background-color: rgb(194, 194, 255, 0.5);
        padding: 0 1em;
        border-radius: 0.5em;
    }
</style>