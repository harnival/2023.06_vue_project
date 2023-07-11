<template>
    <div id="homeWrap">
        <div class="section">
            <h3>내 플레이리스트</h3>
            <div class="nolist" v-if="nolist">
                <span>플레이리스트가 없습니다.</span>
            </div>
            <div class="sec1_list_wrap">
                <ul v-if="!nolist">
                    <li v-for="item in myPlaylist" class="sec1_list">
                        <div class="sec1_list_image">
                            <img :src="item[1].cover">
                            <button type="button" @click.prevent>플레이리스트 재생</button>
                        </div>
                        <div class="sec1_list_text">
                            <p>{{ item[1].title }}</p>
                            <p>
                                <span>총 {{item[1].tracks? Object.entries(item[1].tracks).length : 0 }}곡</span>
                                <span>{{ item[1].totalLength }}</span>
                            </p>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
        <div class="section"></div>
        <div class="section"></div>
    </div>
</template>

<script setup>
import { get, ref as dataRef } from 'firebase/database';
import { useDatabase, useAuth } from '../datasources/firebase.js';
import { onBeforeMount, reactive, ref } from 'vue';
    let myPlaylist = reactive([]);
    let nolist = ref(false);
    onBeforeMount(function(){
        if(useAuth.currentUser) {
            get(dataRef(useDatabase,`account/${useAuth.currentUser.uid}/playlist`))
            .then(snapshot => {
                if(snapshot.exists()){
                    nolist.value = null;
                    const data = snapshot.val();
                    const q = Object.entries(data).slice(0,6);
                    myPlaylist = [...q];
                } else {
                    nolist.value = true;
                }
            })
        }
    })
</script>

<style scoped>
    .sec1_list_wrap {
        height: 35vh;
        border: 1px solid blue;
        overflow: hidden;
        position: relative;
    }
    .sec1_list_wrap ul {
        position: absolute;
        top: 0;
        left: 0;
    }
    .sec1_list {
        width: 5vw;
        height: 100%;
        border: 1px solid tomato;
        box-sizing: border-box;
        padding: 1rem;
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
        bottom: 0;
        left: 0;
    }
</style>