<script setup>
import {computed, ref} from "vue";
import {useClientStore} from "../../stores/client.js";
import {storeToRefs} from "pinia";

const clientStore = useClientStore()
const {messages} = storeToRefs(clientStore)

const msg = ref("")

const sendMessage = () => {
  clientStore.sendMessage(msg.value)
  msg.value = ""
}

const collapsed = ref(true)
const toggleSidebar = () => {
  collapsed.value = !collapsed.value
}

const SIDEBAR_WIDTH = 450
const getSidebarWidth = computed(() => {
  return (offset) => {
    if (!offset) {
      offset = 0
    }
    return `${collapsed.value ? offset : SIDEBAR_WIDTH + offset}px`
  }
})

</script>

<template>
  <button type="button" class="btn chat-btn" @click="toggleSidebar" :style="{ width: getSidebarWidth(50) }">💬</button>
  <div class="sidebar" :style="{ width: getSidebarWidth() }">
    <div class="chat-messages">
      <div v-for="{author, message} in messages">
        <p>{{ author }}: {{ message }}</p>
      </div>
    </div>
    <div class="input-group mb-3 chat-input">
      <textarea class="form-control" placeholder="Сообщение" rows="1" v-model="msg"/>
      <div class="input-group-append">
        <button class="btn btn-outline-secondary" type="button" v-on:click="sendMessage">📩</button>
      </div>
    </div>
  </div>
</template>

<style>
:root {
  --sidebar-bg-color: rgb(27, 30, 33);
}
</style>

<style scoped>
.sidebar {
  color: white;
  background-color: var(--sidebar-bg-color);

  float: left;
  position: fixed;
  z-index: 1;
  top: 0;
  right: 0;
  bottom: 0;

  transition: 0.3s ease;

  display: flex;
  flex-direction: column;
}

.chat-btn {
  color: white;
  background-color: rgba(255, 255, 255, 0);

  float: left;
  position: fixed;
  z-index: 1;
  top: 0;
  right: 0;

  transition: 0.3s ease;

  display: flex;
  flex-direction: column;
}

.chat-input {
  right: 0;
  bottom: 0;
  position: absolute;
}

.chat-messages {
  height: 92%;
  text-align: left;
  padding-left: 10px;
  overflow-x: scroll;
}
</style>