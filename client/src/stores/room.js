import {defineStore, storeToRefs} from "pinia";
import {computed, ref} from "vue";
import api from "../api/axios.js"
import {useAuthStore} from "./auth.js";

export const useRoomStore = defineStore('room', () => {
    const authStore = useAuthStore()
    const {token} = storeToRefs(authStore)

    const rooms = ref([])
    const selectedRoom = ref('')
    const errMessage = ref('')
    const isReady = ref(false)

    const getRooms = () => {
        api.getRooms(token.value).then((res) => {
            if (res.message) {
                errMessage.value = res.message
            } else {
                errMessage.value = ""
                rooms.value = res.rooms
                isReady.value = true
            }
        })
    }

    const createRoom = async () => {
        const {room, message} = await api.createRoom(token.value)
        if (message) {
            errMessage.value = message
        } else {
            rooms.value.push(room)
        }
    }

    const updateRoom = async (newBlackList) => {
        if (!selectedRoom.value) {
            console.warn("empty selected room")
            return
        }

        const {room, message} = await api.updateRoom(token.value, selectedRoom.value, newBlackList)
        if (message) {
            errMessage.value = message
        } else {
            findRoomAndDo((idx) => {
                rooms.value[idx] = room
            })
        }
    }

    const deleteRoom = async () => {
        if (!selectedRoom.value) {
            console.warn("empty selected room")
            return
        }

        const {message} = await api.deleteRoom(token.value, selectedRoom.value)
        if (message) {
            errMessage.value = message
        } else {
            findRoomAndDo((idx) => {
                rooms.value.splice(idx, 1);
            })
        }
    }

    const findRoomAndDo = (fn) => {
        if (!selectedRoom.value) {
            console.warn("empty selected room")
            return
        }

        for (const [i, v] of rooms.value.entries()) {
            if (v.roomId === selectedRoom.value) {
                fn(i)
                return
            }
        }
    }

    const blackList = computed(() => {
        if (!selectedRoom.value) {
            return []
        }

        const currentRoom = rooms.value.find(v => v.roomId === selectedRoom.value)
        if (!currentRoom) {
            return []
        }

        return currentRoom.blackList
    })

    const clear = () => {
        rooms.value = []
        selectedRoom.value = ""
        errMessage.value = ""
        isReady.value = false
        authStore.signOut()
    }

    return {
        rooms, selectedRoom, errMessage, isReady, blackList, getRooms, createRoom, updateRoom, deleteRoom, clear
    }
})