<script setup>
import {useRoomStore} from "../../stores/room.js";
import {storeToRefs} from "pinia";
import RoomInfo from "./RoomInfo.vue";
import {useAuthError} from "../../hooks/useAuthError.js";

const roomStore = useRoomStore()
const {rooms, selectedRoom, errMessage, isReady} = storeToRefs(roomStore)
const {createRoom} = roomStore

useAuthError()

roomStore.getRooms()

const selectRoom = async (room) => {
  selectedRoom.value = room
};
</script>

<template>
  <div class="alert alert-danger" role="alert" v-if="errMessage">
    {{ errMessage }}
  </div>
  <div v-if="isReady">
    <h1>Создание конференции</h1>
    <div>
      <button
          type="button"
          class="btn btn-primary"
          v-on:click="createRoom"
      >
        Создать ✨
      </button>
      <RouterLink
          to="/"
          type="button"
          class="btn btn-light"
      >Отмена
      </RouterLink
      >
    </div>
    <h1>Ваши конференции</h1>
    <div v-if="rooms.length === 0">упс.. тут пусто.. 😔</div>
    <div v-for="{roomId} in rooms" :key="roomId">
      <button
          type="button"
          class="btn btn-outline-primary"
          v-on:click="selectRoom(roomId)"
      >
        {{ roomId }}
      </button>
    </div>
    <RoomInfo/>
  </div>
  <div v-else>
    <h1>Загрузка... 😵‍💫</h1>
  </div>
</template>

<style scoped>

.btn {
  margin: 5px;
}

</style>