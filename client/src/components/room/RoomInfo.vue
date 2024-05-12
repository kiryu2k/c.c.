<script setup>
import {useRoomStore} from "../../stores/room.js";
import {storeToRefs} from "pinia";
import {onMounted, ref, watch} from "vue";

const roomStore = useRoomStore()
const {selectedRoom, blackList, errMessage} = storeToRefs(roomStore)

let modal

onMounted(() => {
  const modalElem = document.getElementById('roomModal')
  modalElem.addEventListener("hide.bs.modal", () => {
    selectedRoom.value = ""
  })

  modal = new bootstrap.Modal(modalElem, {
    backdrop: true,
    keyboard: true,
    focus: true,
  })
})

const updatedBlackList = ref([])

watch(selectedRoom, () => {
  if (selectedRoom.value) {
    modal.show()
    updatedBlackList.value = blackList.value
  }
})

const copyRoomLink = async () => {
  const url = window.location.origin;
  await navigator.clipboard.writeText(`${url}/${selectedRoom.value}`);
};

const copyRoomId = async () => {
  await navigator.clipboard.writeText(selectedRoom.value);
}

const deleteRoom = async () => {
  await roomStore.deleteRoom()
  modal.hide()
}

const updateRoom = async () => {
  await roomStore.updateRoom(updatedBlackList.value)
  modal.hide()
}
</script>

<template>
  <div class="modal fade" id="roomModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="roomModalLabel">Конференция {{ selectedRoom }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"/>
        </div>
        <div class="modal-body">
          <div class="alert alert-danger" role="alert" v-if="errMessage">
            {{ errMessage }}
            <hr>
          </div>
          <h5>Подключение к конференции</h5><br/>
          <p>
            Для подключения к конференции скопируйте и перейдите <a href="#" v-on:click="copyRoomLink">по ссылке</a> или
            введите уникальный <a href="#" v-on:click="copyRoomId">идентификатор</a> конференции в соответствующем
            разделе.
          </p>
          <hr>
          <h5>Черный список</h5><br/>
          <div v-if="blackList.length === 0">
            <p>упс.. тут пусто.. 😔</p>
          </div>
          <div v-else>
            <p>Уберите галочки с пользователей, которых хотите исключить из черного списка конференции</p>
          </div>
          <div class="list-group" v-for="name in blackList" :key="name">
            <label class="list-group-item">
              <input class="form-check-input me-1" type="checkbox" :value="name" v-model="updatedBlackList">
              {{ name }}
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
          <button type="button" class="btn btn-danger" v-on:click="deleteRoom">
            Удалить
          </button>
          <button type="button" class="btn btn-primary" v-on:click="updateRoom">Сохранить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.btn {
  margin: 5px;
}

.modal-dialog {
  max-width: 50%;
  margin: 2rem auto;
}

</style>