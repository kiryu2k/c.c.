<script setup>
import {storeToRefs} from 'pinia';
import {useRouter} from 'vue-router';
import {useAuthStore} from "../stores/auth.js";

const router = useRouter();

const authStore = useAuthStore()
const {name} = storeToRefs(authStore)

const logout = () => {
  authStore.signOut()
  router.push("/signin")
}

</script>

<template>
  <h1>Добро пожаловать, {{ name }}!</h1>
  <RouterLink
      to="/rooms"
      type="button"
      class="btn btn-primary"
  >Создать конференцию
  </RouterLink
  >
  <RouterLink
      to="/connect"
      type="button"
      class="btn btn-primary"
  >Подключиться
  </RouterLink
  >
  <button type="button" class="btn btn-secondary" v-on:click="logout">
    Выход
  </button>
</template>

<style scoped>

.btn {
  margin: 5px;
}

</style>
