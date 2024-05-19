import {defineStore, storeToRefs} from 'pinia'
import {computed, ref} from 'vue'
import freeice from 'freeice'
import {connectToWsServer, socket} from '../api/socket.js'
import events from '../api/events.js'
import {useAuthStore} from "./auth.js";

export const useClientStore = defineStore('client', () => {
    const authStore = useAuthStore()
    const {name, token} = storeToRefs(authStore)

    const room = ref('')

    const errMessage = ref(null)
    const isConnected = ref(false)
    const shouldCheckDevices = ref(true)

    const peers = ref(new Map())
    const stream = ref()
    const remoteStreams = ref(new Map())

    const candidates = ref(new Map())
    const isSdpReceived = ref(new Set())

    const screenStream = ref()
    const videoSenders = ref(new Map())

    const messages = ref([])
    const isRoomOwner = ref(false)

    const devicesAvailability = ref(new Map())

    const bindEvents = () => {
        connectToWsServer(token.value)

        socket.on('connect', () => {
            isConnected.value = socket.connected
        })

        socket.on(events.CONNECT_ERROR, (err) => {
            console.error('got err on connect:', err)
            clear()
            errMessage.value = err
        })

        socket.on(events.ERROR, ({error}) => {
            clear()
            errMessage.value = error.message
        })

        socket.on(events.ADD_PEER, addPeer)

        socket.on(events.SEND_SDP, handleSdp)

        socket.on(events.SEND_ICE, handleIce)

        socket.on(events.REMOVE_PEER, removePeer)

        socket.on(events.SEND_MESSAGE, ({author, message, time}) => {
            messages.value.push({author, message, time})
        })

        socket.on(events.JOIN_ROOM, ({messages: lastMessages, isOwner: isOwner}) => {
            messages.value = lastMessages
            isRoomOwner.value = isOwner
        })

        socket.on(events.FORCE_DISCONNECT, ({reason}) => {
            clear()
            errMessage.value = reason
        })

        socket.on(events.CHANGE_CLIENT_DEVICES_AVAILABILITY, async () => {
            if (canSwitchTrack.value) {
                if (screenStream.value) {
                    await stopShareScreen()
                    screenStream.value.getTracks().forEach(v=>v.stop())
                    screenStream.value = null
                }
                stream.value.getTracks().forEach(v=>{
                    devicesAvailability.value.set(v.kind, v.enabled)
                    v.enabled = false
                })
            } else {
                stream.value.getTracks().forEach(v=>{
                    v.enabled = devicesAvailability.value.get(v.kind)
                })
                devicesAvailability.value.clear()
            }
        })
    }

    const sendMessage = (message) => {
        socket.emit(events.SEND_MESSAGE, {message})
    }

    const captureLocalVideo = async (microId, cameraId) => {
        try {
            const constraints = getConstraints(microId, cameraId)
            stream.value = await navigator.mediaDevices.getUserMedia(constraints)
        } catch (err) {
            console.error('Error accessing media devices.', err)
            clear()
            errMessage.value = err
        }
    }

    const joinRoom = async (roomId) => {
        room.value = roomId
        socket.emit(events.JOIN_ROOM, {roomId})
        shouldCheckDevices.value = false
    }

    const leaveRoom = () => {
        socket.emit(events.LEAVE_ROOM)
        clear()
    }

    const addPeer = async ({name, withOffer}) => {
        if (peers.value.has(name)) {
            console.warn(`peer with name ${name} already exists`)
            return
        }

        const peer = new RTCPeerConnection({iceServers: freeice()})
        peers.value.set(name, peer)

        stream.value.getTracks().forEach(v => {
            const sender = peer.addTrack(v, stream.value)
            if (sender.track.kind === 'video') {
                videoSenders.value.set(name, sender)
            }
        })

        if (screenStream.value) {
            const [screenTrack] = screenStream.value.getTracks()
            await videoSenders.value.get(name).replaceTrack(screenTrack)
        }

        peer.onicecandidate = (e) => {
            if (e.candidate) {
                socket.emit(events.SEND_ICE, {name: name, iceCandidate: e.candidate})
            }
        }

        let trackCounter = 0
        peer.ontrack = (e) => {
            ++trackCounter

            if (trackCounter === 2) {
                trackCounter = 0

                const [remoteStream] = e.streams
                remoteStreams.value.set(name, remoteStream)
            }
        }

        if (withOffer) {
            const offer = await peer.createOffer()
            await peer.setLocalDescription(offer)
            socket.emit(events.SEND_SDP, {name: name, sdp: offer})
        }
    }

    const removePeer = ({name}) => {
        const peer = peers.value.get(name)
        if (peer) {
            peer.close()
        }

        peers.value.delete(name)
        remoteStreams.value.delete(name)
        candidates.value.delete(name)
        isSdpReceived.value.delete(name)
        videoSenders.value.delete(name)
    }

    const handleSdp = async ({name, sdp}) => {
        const desc = new RTCSessionDescription(sdp)
        if (desc.type !== 'offer' && desc.type !== 'answer') {
            console.info(`unsupported sdp type ${desc.type}`)
            return
        }

        const peer = peers.value.get(name)
        if (!peer) {
            console.warn(`peer ${name} doesn't exist`)
            return
        }

        await peer.setRemoteDescription(desc)

        if (desc.type === 'offer') {
            const answer = await peer.createAnswer()
            await peer.setLocalDescription(answer)

            socket.emit(events.SEND_SDP, {name: name, sdp: answer})
        }

        isSdpReceived.value.add(name)
        const v = (candidates.value.get(name) || [])
        v.forEach((candidate) => peer.addIceCandidate(candidate))
    }

    const handleIce = ({name, iceCandidate}) => {
        if (isSdpReceived.value.has(name)) {
            const peer = peers.value.get(name)
            if (!peer) {
                console.warn(`can't add ice cuz peer ${name} doesn't exist`)
                return
            }

            peer.addIceCandidate(iceCandidate)
        } else {
            let v = candidates.value.get(name)
            if (!v) {
                v = []
                candidates.value.set(name, v)
            }

            v.push(iceCandidate)
        }
    }

    const updateAuthData = () => {
        socket.auth.token = name.value
    }

    const switchStreamTrack = (trackKind) => {
        const track = stream.value.getTracks().find(v => v.kind === trackKind)
        track.enabled ^= true

        return track.enabled
    }

    const shareScreen = async () => {
        if (!stream.value) {
            return
        }

        try {
            screenStream.value = await navigator.mediaDevices.getDisplayMedia({video: true})
            const [screenTrack] = screenStream.value.getTracks()

            for (const [_, v] of videoSenders.value) {
                await v.replaceTrack(screenTrack)
            }

            screenTrack.onended = async () => {
                await stopShareScreen()
                screenStream.value = null
            }
        } catch (err) {
            console.error('Error accessing display media devices.', err)
        }
    }

    const stopShareScreen = async () => {
        const clientStream = stream.value.getTracks().find(v => v.kind === 'video')
        for (const [_, v] of videoSenders.value) {
            await v.replaceTrack(clientStream)
        }
    }

    const isScreenSharing = computed(() => {
        return Boolean(screenStream.value)
    })

    const getConstraints = (microId, cameraId) => {
        if (microId && cameraId) {
            return {
                audio: {deviceId: microId}, video: {deviceId: cameraId}
            }
        }
        return {audio: true, video: true}
    };

    const clear = () => {
        room.value = ''
        candidates.value.clear()
        isSdpReceived.value.clear()
        remoteStreams.value.clear()
        peers.value.forEach(v => v.close())
        peers.value.clear()
        if (stream.value) {
            stream.value.getTracks().forEach(v => v.stop())
        }
        stream.value = null

        videoSenders.value.clear()
        if (screenStream.value) {
            screenStream.value.getTracks().forEach(v => v.stop())
        }
        screenStream.value = null
        messages.value = []

        isRoomOwner.value = false
        isConnected.value = false
        // shouldCheckDevices.value = true

        socket.off()
    }

    const banClient = (clientName) => {
        socket.emit(events.BAN_CLIENT, {name: clientName})
    }

    const changeClientDevicesAvailability = (clientName) => {
        socket.emit(events.CHANGE_CLIENT_DEVICES_AVAILABILITY, {name: clientName})
    }

    const canSwitchTrack = computed(()=>devicesAvailability.value.size === 0)

    return {
        name,
        room,
        stream,
        screenStream,
        errMessage,
        isConnected,
        shouldCheckDevices,
        remoteStreams,
        isScreenSharing,
        messages,
        isRoomOwner,
        canSwitchTrack,
        bindEvents,
        joinRoom,
        leaveRoom,
        updateAuthData,
        captureLocalVideo,
        switchStreamTrack,
        shareScreen,
        sendMessage,
        banClient,
        changeClientDevicesAvailability,
        clear
    }
})
