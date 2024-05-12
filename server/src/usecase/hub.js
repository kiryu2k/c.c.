import events from '../domain/events.js';
import roomUsecase from "./room.js"
import messageUsecase from "./message.js"
import {ApiError} from "../domain/errors.js";

const HubUseCase = () => {
    const connectedUsers = new Map()

    const joinRoom = (socket, io) => {
        return async ({roomId}) => {
            const userId = socket.data.userId
            const user = socket.data.username
            console.log(`user ${user} is gonna join the room ${roomId}`);

            let room = null
            try {
                room = await roomUsecase.getRoom(roomId)
            } catch (err) {
                return handleError(socket, err)
            }

            const inBlackList = room.blackList.find(v => user === v)
            if (inBlackList) {
                return handleError(socket, ApiError.forbidden(
                    `Пользователь ${user} находится в черном списке данной конференции`,
                ))
            }

            if (connectedUsers.has(user)) {
                return handleError(socket, ApiError.badRequest(
                    `Пользователь ${user} уже находится в какой-то конференции`,
                ))
            }

            const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
            clients.forEach(clientId => {
                const client = io.sockets.sockets.get(clientId)
                if (!client) {
                    return
                }
                client.emit(events.ADD_PEER, {
                    name: user, withOffer: false,
                })

                const clientName = client.data.username
                socket.emit(events.ADD_PEER, {
                    name: clientName, withOffer: true
                })
            })

            socket.join(roomId)
            connectedUsers.set(user, roomId)

            let messages = []
            try {
                messages = await messageUsecase.getLastMessages(roomId)
            } catch (err) {
                return handleError(socket, err)
            }

            const isOwner = userId.localeCompare(room.ownerId) === 0
            socket.emit(events.JOIN_ROOM, {messages, isOwner})
        };
    };

    const leaveRoom = (socket, io) => {
        return async () => {
            const user = socket.data.username;
            const roomId = connectedUsers.get(user)
            if (!roomId) {
                return handleError(socket, ApiError.badRequest(
                    'Операция выполняется только во время нахождения в конференции',
                ))
            }

            const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
            clients.forEach(clientId => {
                io.to(clientId).emit(events.REMOVE_PEER, {name: user})
                // maybe remove peers in client that leaves????
            })

            socket.leave(roomId)
            connectedUsers.delete(user)
            socket.disconnect(true);
        };
    };

    const sendSdp = (socket, io) => {
        return ({name, sdp}) => {
            const user = socket.data.username;
            const roomId = connectedUsers.get(user)
            if (!roomId) {
                return handleError(socket, ApiError.badRequest(
                    'Операция выполняется только во время нахождения в конференции',
                ))
            }

            const clientId = findClientByName(io, name, roomId)
            if (clientId) {
                io.to(clientId).emit(events.SEND_SDP, {
                    name: user, sdp: sdp
                })
            }
        }
    }

    const sendIce = (socket, io) => {
        return ({name, iceCandidate}) => {
            const user = socket.data.username
            const roomId = connectedUsers.get(user)
            if (!roomId) {
                return handleError(socket, ApiError.badRequest(
                    'Операция выполняется только во время нахождения в конференции',
                ))
            }

            const clientId = findClientByName(io, name, roomId)
            if (clientId) {
                io.to(clientId).emit(events.SEND_ICE, {
                    name: user, iceCandidate: iceCandidate
                })
            }
        };
    };

    const sendMessage = (socket, io) => {
        return async ({message}) => {
            const user = socket.data.username;
            const roomId = connectedUsers.get(user)
            if (!roomId) {
                return handleError(socket, ApiError.badRequest(
                    'Операция выполняется только во время нахождения в конференции',
                ))
            }

            const userId = socket.data.userId;
            const time = new Date()
            try {
                await messageUsecase.addMessage(userId, roomId, message, time)
            } catch (err) {
                return handleError(socket, err)
            }

            const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
            clients.forEach(clientId => {
                io.to(clientId).emit(events.SEND_MESSAGE, {author: user, message: message, time: time})
            })
        }
    }

    const banClient = (socket, io) => {
        return async ({name}) => {
            const user = socket.data.username;
            if (user === name) {
                return handleError(socket, ApiError.badRequest(`Невозможно заблокировать самого себя`))
            }

            const roomId = connectedUsers.get(user)
            if (!roomId) {
                return handleError(socket, ApiError.badRequest(
                    'Операция выполняется только во время нахождения в конференции',
                ))
            }

            let room = null
            try {
                room = await roomUsecase.getRoom(roomId)
            } catch (err) {
                return handleError(socket, err)
            }

            const userId = socket.data.userId;
            const isOwner = userId.localeCompare(room.ownerId) === 0
            if (!isOwner) {
                return handleError(socket, ApiError.forbidden(`Недостаточно прав`))
            }

            const alreadyInBlackList = room.blackList.find(v => v === name)
            if (alreadyInBlackList) {
                return handleError(socket, ApiError.badRequest(`Пользователь ${name} уже находится в черном списке`))
            }

            room.blackList.push(name)
            try {
                await roomUsecase.updateRoom(userId, user, roomId, room.blackList)
            } catch (err) {
                return handleError(socket, err)
            }

            const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
            clients.forEach(clientId => {
                const client = io.sockets.sockets.get(clientId)
                if (!client) {
                    return
                }

                const clientName = client.data.username
                if (clientName === name) {
                    client.emit(events.FORCE_DISCONNECT, {
                        reason: "Организатор добавил вас в черный список данной конференции",
                    })
                    socket.leave(roomId)
                    connectedUsers.delete(user)
                    socket.disconnect(true);
                } else {
                    client.emit(events.REMOVE_PEER, {name})
                }
            })
        }
    }

    const changeDevicesAvailability = (socket, io) => {
        return async ({name}) => {
            const user = socket.data.username;
            if (user === name) {
                return handleError(socket, ApiError.badRequest(`Некорректная цель для операции`))
            }

            const roomId = connectedUsers.get(user)
            if (!roomId) {
                return handleError(socket, ApiError.badRequest(
                    'Операция выполняется только во время нахождения в конференции',
                ))
            }

            const userId = socket.data.userId;
            try {
                const room = await roomUsecase.getRoom(roomId)
                const isOwner = userId.localeCompare(room.ownerId) === 0
                if (!isOwner) {
                    return handleError(socket, ApiError.forbidden(`Недостаточно прав`))
                }
            } catch (err) {
                return handleError(socket, err)
            }

            const clientId = findClientByName(io, name, roomId)
            if (clientId) {
                io.to(clientId).emit(events.CHANGE_CLIENT_DEVICES_AVAILABILITY)
            }

        }
    }

    const findClientByName = (io, name, roomId) => {
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
        return clients.find(clientId => {
            const client = io.sockets.sockets.get(clientId)
            if (!client) {
                return false
            }

            const clientName = client.data.username

            return clientName === name
        })
    }

    const handleError = (socket, err) => {
        let error = {message: 'Internal server error'}
        if (err instanceof ApiError) {
            error = {message: err.message, details: err.details,}
        }
        socket.emit(events.ERROR, {error})
    }

    return {
        joinRoom, leaveRoom, sendSdp, sendIce, sendMessage, banClient, changeDevicesAvailability
    };
};

export default HubUseCase();
