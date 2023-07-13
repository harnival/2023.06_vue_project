<template>
    <h2>youtube</h2>
    <button type="button" @click="onYouTubeIframeAPIReady">aaaaaaaaaaaaaaa</button>
    <div id="playerddd"
    @click="onPlayerReady"
    ></div>
</template>

<script setup>
import { onMounted } from 'vue';
onMounted(() => {
  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api"; // 로컬 파일 경로
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
});

let player;
function onYouTubeIframeAPIReady() {
player = new YT.Player('playerddd', {
    height: '360',
    width: '640',
    videoId: '0c7zGU2C2mM',
    events: {
    'onReady': onPlayerReady,
    'onStateChange': onPlayerStateChange
    }
});
}

function onPlayerReady(event) {
    event.target.playVideo();
}
var done = false;
function onPlayerStateChange(event) {
if (event.data == YT.PlayerState.PLAYING && !done) {
    setTimeout(stopVideo, 6000);
    done = true;
}
}
function stopVideo() {
player.stopVideo();
}
</script>

<style scoped>
    #playerddd {
        border: 1px solid blue;
        height: 10vh;
    }
</style>