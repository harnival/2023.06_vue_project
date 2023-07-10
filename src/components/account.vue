<template>
    <h2>account.vue</h2>
    <div id="accountBox">
        <div class="a_profile">
            <div class="a_p_content">
                <div class="a_p_c_image">
                    <img :src="accountPageInfo.photoURL" alt="">
                </div>
                <div class="a_p_c_text">
                    <div class="a_p_c_name">
                        <strong class="a_p_c_n_name">{{ accountPageInfo.name }}</strong>
                        <span class="a_p_c_n_id">@{{ accountPageInfo.id }}</span>
                    </div>
                    <div class="a_p_c_follow">
                        <div>
                            <p>팔로워</p>
                            <p>{{ accountPageInfo.follower.length }}</p>
                        </div>
                        <div v-if="route.params.ids == 'my'">
                            <p>팔로잉</p>
                            <p>{{ accountPageInfo.following.length }}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="a_p_btns">

            </div>
        </div>
    </div>
</template>

<script setup>
import { useStore } from 'vuex';
    const store = useStore();
import { useRoute } from 'vue-router';
    const route = useRoute();
import {reactive} from 'vue';
import { onValue, ref as dataRef, update } from 'firebase/database';
import { useDatabase, useAuth } from '../datasources/firebase.js';

console.log(route.params.userInfo);
if ( route.params.ids == 'my'){
    let accountPageInfo = reactive( store.getters.getAccount );
    let dataDb = dataRef(useDatabase, 'account/' + route.params.userInfo.uid);
}

</script>

<style scoped>
    .a_profile {
        display: flex;
    }
    .a_p_content {
        display: flex;
    }
    .a_p_c_image {
        width: max(100px, 10vw);
        aspect-ratio: 1/1;
        border: 1px solid black;
        border-radius: 50%;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .a_p_c_image img {
        width: 100%;
        height: 100%;
    }
    .a_p_c_text {
        display: block;
    }
    .a_p_c_n_name {
        font-size: 100%;
        margin-right: 3rem;
    }
    .a_p_c_n_id {
        font-size: 80%;
        color: #666;
    }
    .a_p_c_follow {
        display: flex;
        gap: 2rem;
    }
    .a_p_c_follow > div > p:first-child {
        font-weight: 600;
        padding-right: 1rem;
    }
</style>