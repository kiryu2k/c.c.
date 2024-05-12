const events = {
    CONNECTION: 'connection',
    CONNECT_ERROR: 'connect_error',
    DISCONNECT: 'disconnect',
    FORCE_DISCONNECT: 'force-disconnect',
    ERROR: 'error',

    JOIN_ROOM: 'join-room',
    LEAVE_ROOM: 'leave-room',

    ADD_PEER: 'add-peer',
    REMOVE_PEER: 'remote-peer',
    SEND_SDP: "send-sdp",
    SEND_ICE: 'send-ice',

    SEND_MESSAGE: "send-message",

    BAN_CLIENT: "ban-client",
    CHANGE_CLIENT_DEVICES_AVAILABILITY: "change-client-devices-availability"
};

export default events;
