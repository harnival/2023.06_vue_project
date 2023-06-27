<template>
  <div class="register">
            <form @submit.prevent="regist">
                <v-text-field type="text" label="email" required></v-text-field>
                <v-text-field type="password" label="password" required></v-text-field>
                <v-btn type="submit">ggg</v-btn>
            </form>
        </div>
</template>
<script>
import { register } from 'register-service-worker';

export default{
  data(){
    return{
      emails: 'sample1@sample.com',
      passwords: 'sample2'
    }
  },
  methods: {
    regist(){
      this.$store.dispatch('register',{email: this.emails, password: this.passwords})
    }
  }
}
</script>