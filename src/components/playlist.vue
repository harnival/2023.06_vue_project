<template>
    <h3>playlist.vue</h3>
    <ul>
        <li>
            <div class="cover">
                <img src="../assets/img/cheese.png" alt="">
            </div>
            <div class="text">
                <p class="text_title">{{ sampleList.title }}</p>
                <p class="text_sub">
                    <span class="playtime">{{ playtimeCalc(sampleList) }}</span>
                    <span class="numbers"></span>
                </p>
                <p class="text_hash">

                </p>
            </div>
        </li>
    </ul>
</template>

<style scoped>
li {
    width: 400px;
    display: flex;
}
.cover {
    width: 40%;
    box-shadow: 1px 2px 5px 0px #ccc;
}
.cover img {
    width: 100%;
}
</style>

<script setup>
import { computed } from 'vue';

const sampleList = {
    img: "../assets/img/cheese.png",
    title: "sample title",
    music: [
        {
            title: "sample_music_title",
            artist: "sample_music_artist",
            playtime: 180,
        },
        {
            title: "sample_music_title",
            artist: "sample_music_artist",
            playtime: 180,
        },
        {
            title: "sample_music_title",
            artist: "sample_music_artist",
            playtime: 180,
        },
    ]
}
const playtimeCalc = computed(function(item){
    const items = item.music;
    const q = items.map(v => {
        const w = v.playtime;
        v = w;
    });
    const r = q.reduce((a,b) => a+b);
    return Math.floor(r/60) + "분 " + (r%60) + "초";
})
</script>