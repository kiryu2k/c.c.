import {watch} from "vue";
import {useRouter} from "vue-router";
import {useRoomStore} from "../stores/room.js";
import {storeToRefs} from "pinia";

export const useAuthError = () => {
    const roomStore = useRoomStore()
    const {errMessage} = storeToRefs(roomStore)

    const router = useRouter();

    watch(errMessage, async () => {
        if (errMessage.value === "Пользователь не авторизован") {
            roomStore.clear()
            await router.push("/signin")
        }
    })
}