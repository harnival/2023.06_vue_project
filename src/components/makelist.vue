<template>
    <div id="makelist">
        <div class="makelist_wrap">
            <h2 class="mkl_h2">플레이리스트</h2>
            <div class="mkl_section_wrap">
                <form id="makelist_form" class="mkl_section mkl_section1" @submit.prevent>
                    <div class="mkl_cover_wrap">
                        <h3><span>1</span> 커버 이미지 삽입</h3>
                        <div class="mkl_cover">
                            <input type="file" name="cover" id="mkl_c_file" accept="image/*" @input="uploadImage">
                            <div class="mkl_c_image" @click="clickFile">
                                <div class="mkl_c_image_div1" v-if="listData.cover">
                                    <img :src="listData.cover">
                                    <button id="info_btn" type="button" @click="(e) => {e.stopPropagation();listData.cover = null}">이미지 삭제</button>
                                </div>
                                <div class="mkl_c_image_div2" v-else>
                                    <img src="../assets/img/photo.svg">
                                    <p>
                                        - 클릭하여 플레이리스트 이미지를 등록하세요.<br/><br/>
                                        - 선택하지 않을 시, 기본 이미지로 등록됩니다.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="mkl_text">
                        <h3><span>2</span> 제목 입력</h3>
                        <div class="mkl_title inputwrap">
                            <label for="mkl_t_input">Title</label>
                            <input id="mkl_t_input" type="text" name="title" maxlength="100" required v-model="listData.title">
                        </div>
                        <h3><span>3</span> #태그 설정</h3>
                        <div class="mkl_tag">
                            <div class="mkl_t_taginput">
                                <div class="mkl_t_ti_box1 inputwrap">
                                    <label for="mkl_t_ti_input">Tag</label>
                                    <input type="text" id="mkl_t_ti_input" name="tag" maxlength="15">
                                    <button id="info_btn" type="button" @click="infoState = !infoState">dd</button>
                                    <p class="mkl_t_ti_info" v-if="infoState">
                                        '#' 으로 구분하여 한번에 입력할 수 있습니다.
                                    </p>
                                </div>
                                <button class="mkl_t_ti_btn" type="button" @click="setTag">태그 입력</button>
                            </div>
                            <ul>
                                <li v-for="(item) in Object.entries(listData.tag).filter(v => v[1])" class="mkl_t_list">
                                    <div>
                                        <span># {{ item[0] }}</span>
                                        <button type="button" @click="() => deleteTag(item[0])">해당 태그 삭제</button>
                                    </div>
                                </li>
                                
                            </ul>
                        </div>
                        <div class="mkl_private">
                            <input type="checkbox" name="private" id="mkl_p_input" v-model="listData.private">
                            <label for="mkl_p_input">비공개로 설정</label>
                        </div>
                    </div>
                </form>
                <div class="mkl_section mkl_section3" v-if="listkey">
                    <ol type="1" start="0" class="mkl_s_realUl">
                        <li v-for="(items) in musicNumber" class="mkl_s_list"  :data-item="items">
                            <button class="mkl_s_list_movebtn" type="button" @mousedown="(e) => md(e)">목록 위치 이동</button>
                            <div class="mkl_s_list_cover">
                                <img :src="musicList[items].thumbnail">
                            </div>
                            <div class="mkl_s_list_text">
                                <p style="font-weight: 600;padding: 5% 0;text-align: start;">{{ musicList[items].title }}</p>
                                <p style="text-align: start;">{{ musicList[items].artist }}</p>
                                <p style="text-align: start;">{{ items }}</p>
                            </div>
                            <div class="mkl_s_list_menu">
                                <button class="mkl_s_list_m_btn" type="button" @click="() => openMusicMenu(items)">메뉴</button>
                                <div class="mkl_s_list_m_pop" v-if="openMenuKey === items">
                                    <button type="button" @click="() => deleteMusic(items)">플레이리스트에서 삭제</button>
                                </div>
                            </div>
                        </li>
                    </ol>
                </div>
            </div>
            <div class="mkl_section mkl_section_btn">
                <button style="color : #555" type="button" @click="submitValue">플레이리스트 생성</button>
                <button style="color : #555" @click="router.go(-1)">뒤로</button>
            </div>
        </div>
    </div>
</template>
<script setup>
    import { useRoute, useRouter } from 'vue-router';
        const route = useRoute();
        const router = useRouter();
    import { ref, reactive, onMounted, watch } from 'vue';
    import { useStore } from 'vuex';
        const store = useStore();
    import { useAuth } from '../datasources/firebase';
    import { get, ref as dataRef, update, push, set } from 'firebase/database';
    import { useDatabase } from '../datasources/firebase';
    const listData = reactive({
        cover : null,
        title : null,
        tag : {},
        uid : useAuth.currentUser.uid,
        date : Date.now(),
        tracks : {},
        private : false
    })
    let musicList = reactive({});
    let musicNumber = reactive([]);
    let defaultValue = {
        cover : null,
        title : null,
        tag : {},
        private : false,
        tracks : []
    }
    const listkey = route.params.listkey;
    if(listkey){
        const get1 = store.getters.getUserPlaylists[listkey];
        musicList = Object.assign(musicList,get1.tracks)
        for(const key in get1.tracks){
            const num = get1.tracks[key].number;
            musicNumber[num] = key;
            defaultValue.tracks[num] = key;
        }
        listData.tag = get1.tag;
        listData.cover = get1.cover;
        listData.title = get1.title;
        listData.private = get1.private;

        defaultValue.tag = get1.tag;
        defaultValue.cover = get1.cover;
        defaultValue.title = get1.title;
        defaultValue.private = get1.private;
       
    }

    let infoState = ref(false)  // tag info
    let openMenuKey = ref(null);
    window.addEventListener('click',function(e){
        if(e.target.id !== 'info_btn'){
            infoState.value = false
        }
        if(!e.target.classList.contains("mkl_s_list_m_btn") && openMenuKey.value){
            openMenuKey.value = null;
        }
    })
    function openMusicMenu(key){
        openMenuKey.value = openMenuKey.value === key? null : key
    }    
    function clickFile(){ mkl_c_file.click() }   // 이미지 파일 input 클릭 유도
    function uploadImage(event){
        const file = event.target.files[0];
        const reader = new FileReader();
        if(file){
            reader.readAsDataURL(file)
        }
        reader.onload = () => {
            listData.cover = reader.result;
        }
    }
    function setTag(){
        const val = mkl_t_ti_input.value;
        if(val){
            const val2 = val.trim().replaceAll(/\s/g,"_");
            const val3 = val2.split('#');
            val3.map(v => {
                const arr1 = Object.keys(listData.tag);
                console.log(arr1)
                if(!arr1.find((n) => n == v)){
                    listData.tag[v] = "new";
                    changeValue.tag[v] = true
                }else{
                    alert(`#${v} : 이미 입력한 태그입니다.`)
                }
            });
            mkl_t_ti_input.focus();
            return mkl_t_ti_input.value = ''
        }
    }
    function deleteTag(key){
        if(listData.tag[key] === "new"){
            delete listData.tag[key]
        }else{
            listData.tag[key] = null
        }
    }
    function submitValue(){
        if(route.path === '/ml'){
            const key1 = push(dataRef(useDatabase,'playlists'),listData)
            const key2 = key1.key
    
            const arr1 = Object.keys(listData.tag)
            const arr2 = arr1.map(v => {
                get(dataRef(useDatabase,`hash/${v}`)).then(data => {
                        const data2 = data.val()
                        const obj1 = {
                            [`hash/${v}/list`] : key2
                        }
                        obj1[`hash/${v}/number`] = data2.exists()? data2.number +1 : 1
                        update(dataRef(useDatabase),obj1)
                })
            })
            Promise.all(arr2)
                .then(() => {
                    update(dataRef(useDatabase),{
                        [`user/${useAuth.currentUser.uid}/playlist/${key2}`] :  Date.now()
                    })
                    return router.go(-1);
                })
        }else {
            const ch = Array.from(document.querySelectorAll(".mkl_s_list"));
            const arr3 = ch.map((v,i) => {
                musicList[v.getAttribute("data-item")].number = i
            })
            const updateObj = {};
            const get4 = store.getters.getUserPlaylists[listkey];
            Promise.all(arr3)
            .then(() => {
                if(listData.cover !== defaultValue.cover){ updateObj[`playlists/${listkey}/cover`] = listData.cover }
                if(listData.title !== defaultValue.title){ updateObj[`playlists/${listkey}/title`] = listData.title }
                Object.entries(listData.tag).map(v => {
                    if(!v[1]){ 
                        updateObj[`playlists/${listkey}/tag/${v[0]}`] = null;
                        updateObj[`hash/${v[0]}/list/${listkey}`] = null;
                    }
                    else if(get4.tag[v[0]]==="new"){
                        updateObj[`hash/${v[0]}/list/${listkey}`] = true;
                        updateObj[`playlists/${listkey}/tag/${v[0]}`] = true;
                    }
                })
                if(listData.private !== defaultValue.private){ updateObj[`playlists/${listkey}/private`] = listData.private}

                
                Object.entries(musicList).map(v => {
                    const num1 = v[1].number;
                    const num2 = defaultValue.tracks
                    if(num1 !== num2.indexOf(v[0])){
                        console.log(num1 , num2.indexOf(v[0]))
                        if(v[1].number === null){
                            updateObj[`playlists/${listkey}/tracks/${v[0]}`] = null
                        }else {
                            updateObj[`playlists/${listkey}/tracks/${v[0]}/number`] = v[1].number
                        }                        
                    }
                })
                
                console.log(updateObj);
                return finallySubmit(updateObj)
            })

        }
    }
    function finallySubmit(obj){
        update(dataRef(useDatabase),obj);
        router.go(-1)
    }
    function deleteMusic(key){
        musicList[key].number = null;
        musicNumber = musicNumber.filter(v => v !== key)
    }
    // --------------------
    let mouseValue = ref(null);
    let empty,ul;
    function md(e){
        const q = e.target;
        mouseValue.value = true;
        q.parentElement.classList.add("moveList")
        const lil = document.querySelectorAll(".mkl_s_list")
        if(q.parentElement === lil.item(musicNumber.length-1)){
            ul.appendChild(empty);
        }else{
            ul.insertBefore(empty, e.target.parentElement.nextSibling)
        }
        document.addEventListener("mousemove",mm)
    }
    function mm(e){
        const mx = e.movementX;
        const my = e.movementY;
        const tg = document.querySelector(".moveList");

        tg.style.top = `${tg.offsetTop + my}px`
        tg.style.left = `${tg.offsetLeft + mx}px`

        const px = e.pageX, py = e.pageY;
        const el = document.elementsFromPoint(px,py);
        const el2 = el.find(v => v.classList.contains("mkl_s_list")&&!v.classList.contains("moveList"));
        if(el2){
            if(my < 0){
                ul.insertBefore(empty,el2);
    
            }else{
                ul.insertBefore(empty,el2.nextSibling)
            }
        }
    }
    onMounted(function(){
        ul = document.querySelector(".mkl_s_realUl");
        empty = document.createElement("li");
        empty.classList.add("mkl_s_empty");

        document.addEventListener("mouseup",async(e) => {
            if(mouseValue.value){
                mouseValue.value = null;
                document.removeEventListener("mousemove",mm)

                const th = document.querySelector(".moveList")
                th.style.top = null;
                th.style.left = null;

                await ul.insertBefore(th,empty)
                ul.removeChild(empty);
                th.classList.remove("moveList")
            }
        })
        
        // input motion
        let oInputs = document.querySelectorAll(".inputwrap input");
        oInputs.forEach(v => {
            const par = v.parentElement;
            const lab = par.querySelector("label");
            const focused = () => {
                lab.classList.add('label_focused','label_value')
                v.classList.remove('requireInput');
                par.classList.remove('requireInput');
            }
            if(!!v.value){ focused() }
            v.addEventListener("focus",() => focused())
            v.addEventListener('blur',function(){
                if(v.value == ""){
                    lab.classList.remove('label_focused','label_value')
                } else {
                    lab.classList.remove('label_focused')
                }
            })
        })
    })
</script>
<style>
    @import '../css/components/makelist.css';
</style>