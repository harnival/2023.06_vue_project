<template>
    <div id="settingBox">
        <div class="settingMenu">
            <h3>설정</h3>
            <ul>
                <li><a href="/" @click.prevent>정보 수정</a></li>
                <li><a href="/" @click.prevent>알림 설정</a></li>
                <li><a href="/" @click.prevent>계정 탈퇴</a></li>
            </ul>
        </div>
        <div class="settingFrame">
            <div class="sf_private">
                <h4>정보수정</h4>
                <div class="sf_p_profile">
                    
                </div>
                <div class="sf_p_account"></div>
            </div>
        </div>
    </div>
</template>

<script setup>

</script>

<style scoped>
a {
    text-decoration: none;
    color: black;
}
    #settingBox {
        display: flex;
        height: 100vh;
    }
    .settingMenu {
        width: 25%;
        background-color: blue;
    }
</style>