<template>
    <h3>home.vue</h3>
    <div class="myPlaylist">
        <h3></h3>
        <div class="playlistBox">
            <ul>
                <li v-for="item in listup">
                    <p class="list_img"><img :src="rodent" alt=""></p>
                    <p class="list_title"><strong>{{ item.title }}</strong></p>
                    <p class="list_ats"><span>{{ item.artist }}</span></p>
                </li>
            </ul>
        </div>
        <div class="recommList"></div>
        <div class="recommMusic"></div>
    </div>
</template>
<style scoped>
ul {
    display: flex;
}
li {
    width: max(150px, 5vw);
    background-color: #eee;
}
.list_img {
    width: 100%;
    aspect-ratio: 1/1;
    background-color: #ccc;
}
.list_img img {
    width: 100%;
}
</style>
<script setup>
import rodent from '../assets/img/rodent.png'
const listup = [
    {
        title : "sample_title1",
        artist : "sample_ats1",
        cover : "./assets/img/rodent.png"
    },
    {
        title : "sample_title2",
        artist : "sample_ats2",
        cover : "./assets/img/rodent.png"
    },
]
</script>