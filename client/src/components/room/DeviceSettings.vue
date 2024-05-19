<script setup>
import {useRoute, useRouter} from 'vue-router';
import {onMounted, ref, watch} from 'vue';
import {useClientStore} from '../../stores/client';
import {storeToRefs} from "pinia";
import {useDeviceStore} from "../../stores/device.js";

const deviceStore = useDeviceStore()
const {cameraList, microList, selectedCamera, selectedMicro} = storeToRefs(deviceStore)

const clientStore = useClientStore();
const {stream, isConnected} = storeToRefs(clientStore)
const {joinRoom} = clientStore

const {params} = useRoute();

const router = useRouter();

const buttonTexts = ['Прослушать себя', 'Прекратить слушать'];
const micVolume = ref(0);
const muteBtnText = ref('Прослушать себя');

const switchMicroVolume = () => {
  micVolume.value ^= 1;
  muteBtnText.value = buttonTexts[micVolume.value];
};

watch(selectedCamera, async () => {
  await clientStore.captureLocalVideo(selectedMicro.value, selectedCamera.value)
});

watch(selectedMicro, async () => {
  await clientStore.captureLocalVideo(selectedMicro.value, selectedCamera.value)
});

onMounted(() => {
  clientStore.captureLocalVideo(null, null).then(deviceStore.listenDeviceUpdates)
});

const cancel = () => {
  router.push("/").then(() => {
    if (stream.value) {
      stream.value.getTracks().forEach(v => v.stop())
    }
    stream.value = null
  })
}
</script>

<template>
  <div class="container">
    <div class="row">
      <div class="col-sm videocamera">
        <video class="camera" :srcObject="stream" autoplay playsinline :volume="micVolume"/>
      </div>
      <div class="col-sm">
        <div class="options">
          <label>Выберете камеру</label><br/>
          <select v-model="selectedCamera" class="form-select">
            <option
                v-for="camera in cameraList"
                v-bind:value="camera.value"
            >
              {{ camera.label }}
            </option>
          </select>
        </div>
        <div class="options">
          <label>Выберете микрофон</label><br/>
          <select v-model="selectedMicro" class="form-select">
            <option v-for="micro in microList" v-bind:value="micro.value">
              {{ micro.label }}
            </option>
          </select>
        </div>
        <div class="options">
          <button
              type="button"
              class="btn btn-primary"
              v-on:click="joinRoom(params.id)"
              :disabled="!isConnected"
          >
            Подключиться
          </button>
          <button
              type="button"
              class="btn btn-primary"
              v-on:click="switchMicroVolume"
          >
            {{ muteBtnText }}
          </button>
          <button type="button" class="btn btn-light" v-on:click="cancel">
            Отмена
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

.camera {
  height: 480px;
  width: 640px;
}

.options {
  text-align: center;
  padding: 45px 0;
}
</style>
