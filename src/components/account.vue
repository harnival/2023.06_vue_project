<template>
    <div id="account">
        <v-row class="d-flex justify-center">
            <v-col cols="12" sm="6" md="4" lg="3" class="acc_col">
                <v-card>
                    <img src="@/assets/img/rodent.png" class="origin" hidden>
                    <div class="account_img">
                        <canvas class="can"></canvas>
                    </div>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>
<style>
#account {
    border: 2px solid black;
}
.can {
    width: 100%;
    height: 20vh;
}
.acc_col {
    background-color: wheat;
}
</style>
<script>
    export default{
        mounted(){
            const can = document.querySelector(".can")
            const img = document.querySelector(".origin");
            const ctx = can.getContext('2d');
            img.onload = function(){
                ctx.drawImage(img,0,0,img.width,img.height,0,0,can.width/2,can.height/2)
                const can2 = document.querySelector(".can");
                const ur = can2.toDataURL()
                this.$store.commit("setOrigin",ur)
            }
        }
    }
</script>