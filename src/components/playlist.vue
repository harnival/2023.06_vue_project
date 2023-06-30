<template>
    <div id="playlist">
        <h3>playlist.vue</h3>
        <hr>
        <div class="listBox">
            <ul class="listRoll">
                <li v-for="item in 10">
                    <div class="card">
                        <div class="cover">
                            <img src="../assets/img/cheese.png" alt="">
                        </div>
                        <div class="text">
                            <p class="text_title">{{ sampleList.title + item}}</p>
                            <p class="text_sub">
                                <span class="playtime">{{ playtimeCalc(sampleList) }}</span>
                                <span class="numbers"></span>
                            </p>
                        </div>
                    </div>
                </li>
            </ul>
            <div class="contentBox"></div>
        </div>
        <div class="randomHash">

        </div>
    </div>
</template>

<style scoped>
.listBox {
    border: 2px dashed tomato;
    box-sizing: border-box;
    height: 50vh;
}
.randomHash {
    border: 2px dashed tomato;
    box-sizing: border-box;
    height: 30vh;
}
.listRoll {
    position: relative;
}
.listRoll li {
    position: absolute;
    transform-origin: -100% 50%;
    background-color: white;
}
.card {
    border: 1px solid #ccc;
    box-sizing: border-box;
    max-width: 20vw;
    display: flex;
    flex-direction: column;
    align-items: center;
}
.cover img {
    width: 100%;
}
</style>

<script setup>
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
const playtimeCalc = function(item){
    const items = item.music;
    const q = items.map(v => {
        const w = v.playtime;
         return w;
    });
    const r = q.reduce((a,b) => a+b);
    return Math.floor(+r/60) + "분 " + (+r%60) + "초";
}
</script>