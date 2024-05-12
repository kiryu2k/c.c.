import {defineStore} from "pinia";
import {ref} from "vue";

export const useDeviceStore = defineStore('device', () => {
    const cameraList = ref([])
    const microList = ref([])

    const selectedCamera = ref('');
    const selectedMicro = ref('');

    const getConnectedDevices = async (type) => {
        const connectedDevices = await navigator.mediaDevices.enumerateDevices();
        return connectedDevices.filter((device) => device.kind === type);
    };

    const updateCameraList = async () => {
        const cameras = await getConnectedDevices('videoinput')
        updateDeviceList(cameras, cameraList, selectedCamera)
    }

    const updateMicroList = async () => {
        const micros = await getConnectedDevices('audioinput')
        updateDeviceList(micros, microList, selectedMicro)
    }

    const updateDeviceList = (src, dest, selected) => {
        dest.value = [];
        selected.value = '';
        src.forEach(v => {
            if (selected.value === '') {
                selected.value = v.deviceId;
            }

            const option = document.createElement('option');
            option.label = v.label;
            option.value = v.deviceId;

            dest.value.push(option);
        });
    }

    const listenDeviceUpdates = () => {
        updateCameraList()
        updateMicroList()
        navigator.mediaDevices.addEventListener('devicechange', (event) => {
            updateCameraList()
            updateMicroList()
        });
    }

    return {
        cameraList, microList, selectedCamera, selectedMicro, listenDeviceUpdates
    }
})