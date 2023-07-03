<template>
    <div>
        <button @click="getId">api</button>
    </div>
</template>

<script setup>
import axios from 'axios';
import {ref, get, child} from 'firebase/database';
import {useDatabase} from '../datasources/firebase.js'
import { onMounted } from 'vue';
import { stringifyQuery } from 'vue-router';

let APIkey = '';
async function getKey(){
  const q = await get(child(ref(useDatabase), 'API_key'));
  if( q.exists()){
    console.log(q.val());
    APIkey = q.val();
  } else {
    const r = console.log('not has API key.') 
  }
}
onMounted(function(){
    getKey();
})

let videos = [];
const props = defineProps({
    playlist: {
        type: String,
        required: true
    }
})
async function getId(){
    const res = await axios.get("https://www.googleapis.com/youtube/v3/search",{
        params: {
            part: 'snippet',
            type: 'music',
            key: APIkey,
            q: 'attention+newjeans'
        }
    });
    
    videos = res.data.items.map(item => ({
        id: item.id.videoId,
        title: item.snippet.title
    }));
    console.log(`https://www.youtube.com/watch?v=${videos[0].id}`);
}


</script>