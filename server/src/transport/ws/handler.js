import events from "../../domain/events.js";
import usecase from "../../usecase/hub.js";
import {ApiError} from "../../domain/errors.js";

class ConnectionHandler {
    constructor(io) {
        this.io = io
    }

    ServeWs() {
        this.io.on(events.CONNECTION, (socket) => {
            socket.on(events.JOIN_ROOM, usecase.joinRoom(socket, this.io));

            socket.on(events.LEAVE_ROOM, usecase.leaveRoom(socket, this.io));

            socket.on(events.SEND_SDP, usecase.sendSdp(socket, this.io));

            socket.on(events.SEND_ICE, usecase.sendIce(socket, this.io));

            socket.on(events.SEND_MESSAGE, usecase.sendMessage(socket, this.io))

            socket.on(events.BAN_CLIENT, usecase.banClient(socket, this.io))

            socket.on(events.CHANGE_CLIENT_DEVICES_AVAILABILITY, usecase.changeDevicesAvailability(socket, this.io))

            socket.on(events.DISCONNECT, usecase.leaveRoom(socket, this.io));
        });
    }
}

export default ConnectionHandler