<script setup>
import {reactive} from 'vue';
import {useAuthStore} from '../../stores/auth.js';
import {useRouter} from 'vue-router';
import {storeToRefs} from "pinia";

const router = useRouter();

const data = reactive({
  username: '',
  password: '',
});

const authStore = useAuthStore();
const {errMessage, isAuthorized} = storeToRefs(authStore)

const submit = () => {
  authStore.signIn(data.username, data.password).then(() => {
    if (isAuthorized.value) {
      router.push('/');
    }
  })
};
</script>

<template>
  <form class="form-signin" @submit.prevent="submit">
    <h1 class="h3 mb-3 font-weight-normal">Вход в аккаунт<br/></h1>

    <div class="alert alert-danger" role="alert" v-if="errMessage">
      {{ errMessage }}
    </div>

    <div class="form-floating">
      <input
          type="text"
          id="username"
          class="form-control"
          placeholder="Имя пользователя"
          required
          autofocus
          v-model="data.username"
      />
      <label>Имя пользователя</label>
    </div>

    <div class="form-floating">
      <input
          type="password"
          id="inputPassword"
          class="form-control"
          placeholder="Пароль"
          required
          v-model="data.password"
      />
      <label>Пароль</label>
    </div>

    <div class="d-grid gap-2">
      <button class="btn btn-lg btn-primary btn-block" type="submit">
        Вход
      </button>
    </div>
  </form>
  <div class="d-flex justify-content-evenly">
    <RouterLink
        to="/signup"
        class="link-body-emphasis link-offset-2 link-underline-opacity-25 link-underline-opacity-75-hover"
    >создать аккаунт
    </RouterLink
    >
  </div>
</template>

<style scoped>
.form-signin {
  width: 100%;
  max-width: 330px;
  padding: 15px;
  margin: auto;
}
</style>
