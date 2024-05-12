<script setup>
import {ref} from 'vue';
import {useRouter} from 'vue-router';

const roomId = ref('');
const router = useRouter();

const connect = async () => {
  await router.push(`/${roomId.value}`);
};
</script>

<template>
  <h1>Присоединиться к конференции</h1>
  <input
      class="form-control form-control-lg"
      type="text"
      placeholder="Идентификатор конференции"
      v-model="roomId"
  />
  <div>
    <RouterLink to="/" type="button" class="btn btn-light">Отмена</RouterLink>
    <button type="button" class="btn btn-primary" v-on:click="connect">
      Подключиться 🚀
    </button>
  </div>
</template>

<style scoped>

.btn {
  margin: 5px;
}

</style>
