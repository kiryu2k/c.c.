import {defineStore} from "pinia";
import {computed, ref} from "vue";
import api from "../api/axios.js"

export const useAuthStore = defineStore('auth', () => {
    const name = ref('')
    const token = ref('')
    const errMessage = ref('')

    const signUp = async (username, password) => {
        const {accessToken, message} = await api.signUp(username, password)
        name.value = username
        token.value = accessToken
        errMessage.value = message
    }

    const signIn = async (username, password) => {
        const {accessToken, message} = await api.signIn(username, password)
        name.value = username
        token.value = accessToken
        errMessage.value = message
    }

    const signOut = () => {
        name.value = ""
        token.value = ""
        errMessage.value = ""
    }

    const isAuthorized = computed(() => {
        return Boolean(name.value) && Boolean(token.value) && !Boolean(errMessage.value)
    })

    return {
        name, token, errMessage, isAuthorized, signUp, signIn, signOut
    }
}, {
    persist: {
        storage: localStorage,
        paths: ['name', 'token'],
    }
})