<script setup>
import {storeToRefs} from 'pinia'
import {useClientStore} from '../../stores/client.js'
import {computed, onUnmounted, ref} from "vue"
import {useRouter} from "vue-router";
import DeviceSettings from "./DeviceSettings.vue";
import Chat from "./Chat.vue"
import {socket} from "../../api/socket.js";

const router = useRouter();

const clientStore = useClientStore()
clientStore.bindEvents()

const {
  name,
  isConnected,
  shouldCheckDevices,
  isRoomOwner,
  stream,
  screenStream,
  isScreenSharing,
  remoteStreams,
  canSwitchTrack,
  errMessage
} = storeToRefs(clientStore)

const {shareScreen, banClient, changeClientDevicesAvailability} = clientStore

const microBtn = ref("Выключить микрофон")
const videoBtn = ref("Выключить камеру")

const muteMicroOrUndo = () => {
  const isEnabled = clientStore.switchStreamTrack("audio")
  if (isEnabled) {
    microBtn.value = "Выключить микрофон"
  } else {
    microBtn.value = "Включить микрофон"
  }
}

const toggleVideoOrUndo = () => {
  const isEnabled = clientStore.switchStreamTrack("video")
  if (isEnabled) {
    videoBtn.value = "Выключить камеру"
  } else {
    videoBtn.value = "Включить камеру"
  }
}

const leaveRoom = () => {
  clientStore.leaveRoom()
  router.push(`/`).then(()=>{
    clientStore.clear()
    errMessage.value = null
    shouldCheckDevices.value = true
  });
}

const makeVideoPairs = computed(() => {
  const allStreams = [{username: name.value, stream: stream.value}]
  remoteStreams.value.forEach((v, k) => {
    allStreams.push({username: k, stream: v})
  })

  return allStreams.flatMap((_, i, arr) => i % 2 ? [] : [arr.slice(i, i + 2)]);
})

onUnmounted(() => {
  socket.off()
})
</script>

<template>
  <div class="container" v-if="isConnected && !shouldCheckDevices && !errMessage">
    <div v-for="(pair, index) in makeVideoPairs" :key="index">
      <div class="video-pair">
        <div v-for="{username, stream} in pair" :key="username">
          <div class="video-container">
            <div v-if="isScreenSharing && username === name">
              <video class="camera" :srcObject="screenStream" autoplay playsinline :muted="username === name"/>
            </div>
            <div v-else>
              <video class="camera" :srcObject="stream" autoplay playsinline :muted="username === name"/>
            </div>
            <div class="overlay dropdown">
              <div v-if="isRoomOwner && username !== name">
                <p class="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  {{ username }}
                </p>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" href="#" v-on:click="changeClientDevicesAvailability(username)">
                    Заглушить
                  </a></li>
                  <li><a class="dropdown-item" href="#" v-on:click="banClient(username)">
                    Заблокировать
                  </a></li>
                </ul>
              </div>
              <div v-else><p>{{ username }}</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="fixed-bottom">
      <button type="button" class="btn btn-primary btn-sm" v-on:click="toggleVideoOrUndo" :disabled="!canSwitchTrack">
        {{ videoBtn }}
      </button>
      <button type="button" class="btn btn-primary btn-sm" v-on:click="muteMicroOrUndo" :disabled="!canSwitchTrack">
        {{ microBtn }}
      </button>
      <button type="button" class="btn btn-primary btn-sm" v-on:click="shareScreen" :disabled="isScreenSharing || !canSwitchTrack">
        Демонстрация
        экрана
      </button>
      <button type="button" class="btn btn-danger btn-sm" v-on:click="leaveRoom">Отключиться</button>
    </div>
    <Chat/>
  </div>
  <div v-else-if="errMessage">
    <div class="alert alert-danger" role="alert">
      {{ errMessage }}
    </div>
    <RouterLink to="/" type="button" class="btn btn-light">Назад в главное меню</RouterLink>
  </div>
  <div v-else-if="shouldCheckDevices">
    <DeviceSettings/>
  </div>
  <div v-else>
    <h1>Загрузка... 😵‍💫</h1>
  </div>
</template>

<style scoped>
.btn {
  margin: 5px 5px 25px;
}

.camera {
  height: 480px;
  width: 640px;
}

.video-container {
  position: relative;
  background: black;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  background: rgba(80, 81, 89, 0.45);
  padding-right: 15px;
  padding-left: 15px;
  padding-top: 5px;
  z-index: 1;
}

.video-pair {
  display: inline-flex;
}

.fixed-bottom {
  z-index: 0;
}

.dropdown-item {
  padding: 0 5px;
  font-size: 14px;
}
</style>
