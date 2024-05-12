import axios from "axios";
import config from "../config/config.js";

const signUpEndpoint = "/api/auth/signup"
const signInEndpoint = "/api/auth/signin"
const roomEndpoint = "/api/room"

const internalServerErrMsg = 'Произошла внутренняя ошибка сервера. Повторите попытку позже';

const api = () => {
    const cli = axios.create({
        baseURL: config.serverUrl, withCredentials: true
    })

    const signUp = async (username, password) => {
        try {
            const payload = await cli.post(signUpEndpoint, {username, password})
            return payload.data
        } catch (err) {
            return handleError(err)
        }
    }

    const signIn = async (username, password) => {
        try {
            const payload = await cli.post(signInEndpoint, {username, password})
            return payload.data
        } catch (err) {
            return handleError(err)
        }
    }

    const getRooms = async (token) => {
        try {
            const payload = await cli.get(roomEndpoint, withAuth(token))
            return payload.data
        } catch (err) {
            return handleError(err)
        }
    }

    const createRoom = async (token) => {
        try {
            const payload = await cli.post(roomEndpoint, {}, withAuth(token))
            return payload.data
        } catch (err) {
            return handleError(err)
        }
    }

    const updateRoom = async (token, roomId, blackList) => {
        try {
            const reqBody = {
                roomId, blackList
            }
            const payload = await cli.put(roomEndpoint, reqBody, withAuth(token))

            return payload.data
        } catch (err) {
            return handleError(err)
        }
    }

    const deleteRoom = async (token, roomId) => {
        try {
            const deleteRoomEndpoint = `${roomEndpoint}/${roomId}`
            await cli.delete(deleteRoomEndpoint, withAuth(token))
            return {}
        } catch (err) {
            return handleError(err)
        }
    }

    const withAuth = (token) => {
        return {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    }

    const handleError = (err) => {
        if (!err.response) {
            return {
                message: internalServerErrMsg,
            };
        }

        const {error} = err.response.data;
        if (error) {
            return error;
        }

        return {
            message: internalServerErrMsg,
        };
    };

    return {
        signUp, signIn, getRooms, createRoom, updateRoom, deleteRoom
    }
}

export default api()