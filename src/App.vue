<template>
  <div id="apps">
    <div class="loading" v-if="startPage.loadingOn">
      <img src="./assets/img/cheese.png" alt="cheese">
      <h2>Hi, I'm cheese.</h2>
    </div>
    <div class="login" v-else-if="startPage.loginOn">

      <form action="">
        <p>It's been a long time, Cheese.</p>
        <div class="loginInput">
          <label for="user_id">username</label>
          <input type="text" name="user_id" id="user_id" >
        </div>
        <div class="loginInput">
          <label for="user_pwd">password</label>
          <input type="password" name="user_pwd" id="user_pwd" >
        </div>
        <div class="loginBtn">
          <button class="submitBtn" type="button" @click="goMain">enter</button>
        </div>
      </form>
    </div>
    <div id="main" v-else-if="startPage.mainOn">
      <v-app>
          <header>
            <v-app-bar-nav-icon class="nav_btn"><v-icon></v-icon></v-app-bar-nav-icon>
          </header>
          <v-row no-gutters>
            <v-col offset-md="2" cols="12" md="8">
              <router-view class="view"></router-view>
            </v-col>
          </v-row>
      </v-app>
    </div>
  </div>
</template>
<style>
.loading, .login {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  background-color: rgb(255, 210, 9);
}
.loading img {
  width: max(10%, 3rem);
}
.login form {
  width: max(20%,10rem);
  aspect-ratio: 2/3;
  border: 1px dashed #eee;
  padding: 2rem;

  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 3rem;
}
.login form p {
  font-size: 150%;
  font-weight: 600;
  white-space:nowrap;
}
.loginInput input {
  border-bottom: 1px solid #666;
  padding: 0.5rem 1rem;
}
header {
  width: 100vw;
  height: 0px;
  position: fixed;
  top: 0px;
  left: 0px;
}
.nav_btn {
  max-width: 2rem;
  max-height: 2rem;
  position: absolute;
  top: 2rem;
  left: 2rem;
  transform: scale(1.5,1.5);
}
</style>
<script>
import {useMyInfo, useCategory} from './datasources/firebase'

export default {
  name: 'App'
  ,created(){
    if (this.$route.path == "/") {
      setTimeout(() => {
        this.startPage.loadingOn = false;
        this.startPage.loginOn = true;
      }, 1000);
    } else {
      this.startPage.loadingOn = false;
      this.startPage.loginOn = false;
      this.startPage.mainOn = true;
    }
   
  }
  ,mounted(){
    const btn = document.querySelector(".submitBtn");
    const form = document.querySelector(".login form");
  }
  // --------------------------------------------
  ,data: () => ({
    startPage: {
      loadingOn: true,
      loginOn : false,
      mainOn: false
    },
    account: [],
    category: [],
  })
  ,firebase: {
    account: useMyInfo,
    category: useCategory
  }
  ,methods : {
    goMain(){
      this.startPage.loginOn = false;
      this.startPage.mainOn = true;
      if( this.$route.path != "/feed" ){
        this.$router.push("/feed")
      }
    }
  }
};
</script>
