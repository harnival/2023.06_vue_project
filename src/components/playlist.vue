<template>
    <div id="playlist">
        
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