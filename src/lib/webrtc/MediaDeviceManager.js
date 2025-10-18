/**
 * Camera/microphone control and device selection
 * Handles device enumeration, permissions, and hot-swapping
 */
export class MediaDeviceManager {
    constructor() {
        this.devices = {
            audioInput: [],
            audioOutput: [],
            videoInput: []
        };
        this.currentDevices = {
            audioInput: null,
            audioOutput: null,
            videoInput: null
        };
        this.permissions = {
            camera: false,
            microphone: false
        };
        this.eventListeners = new Map();
    }

    /**
     * Request media permissions and enumerate devices
     */
    async initialize() {
        try {
            // Request permissions first
            await this.requestPermissions();

            // Enumerate devices
            await this.enumerateDevices();

            // Set up device change listener
            navigator.mediaDevices.addEventListener('devicechange', () => {
                this.enumerateDevices();
                this.emit('devicesChanged', this.devices);
            });

            return {
                permissions: this.permissions,
                devices: this.devices
            };
        } catch (error) {
            console.error('Failed to initialize MediaDeviceManager:', error);
            throw error;
        }
    }

    /**
     * Request camera and microphone permissions
     */
    async requestPermissions() {
        try {
            // Request both camera and microphone permissions
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            // Stop the stream immediately as we only needed it for permissions
            stream.getTracks().forEach(track => track.stop());

            this.permissions.camera = true;
            this.permissions.microphone = true;

            this.emit('permissionsGranted', this.permissions);
            return this.permissions;
        } catch (error) {
            console.error('Permission request failed:', error);

            // Try to determine which permission failed
            try {
                await navigator.mediaDevices.getUserMedia({ video: true });
                this.permissions.camera = true;
            } catch (videoError) {
                console.warn('Camera permission denied:', videoError);
                this.permissions.camera = false;
            }

            try {
                await navigator.mediaDevices.getUserMedia({ audio: true });
                this.permissions.microphone = true;
            } catch (audioError) {
                console.warn('Microphone permission denied:', audioError);
                this.permissions.microphone = false;
            }

            this.emit('permissionsDenied', this.permissions);
            throw error;
        }
    }

    /**
     * Enumerate available media devices
     */
    async enumerateDevices() {
        try {
            const deviceList = await navigator.mediaDevices.enumerateDevices();

            this.devices.audioInput = deviceList
                .filter(device => device.kind === 'audioinput')
                .map(device => ({
                    deviceId: device.deviceId,
                    label: device.label || `Microphone ${device.deviceId.slice(0, 8)}`,
                    kind: device.kind,
                    groupId: device.groupId
                }));

            this.devices.audioOutput = deviceList
                .filter(device => device.kind === 'audiooutput')
                .map(device => ({
                    deviceId: device.deviceId,
                    label: device.label || `Speaker ${device.deviceId.slice(0, 8)}`,
                    kind: device.kind,
                    groupId: device.groupId
                }));

            this.devices.videoInput = deviceList
                .filter(device => device.kind === 'videoinput')
                .map(device => ({
                    deviceId: device.deviceId,
                    label: device.label || `Camera ${device.deviceId.slice(0, 8)}`,
                    kind: device.kind,
                    groupId: device.groupId
                }));

            // Set default devices if not already set
            if (!this.currentDevices.audioInput && this.devices.audioInput.length > 0) {
                this.currentDevices.audioInput = this.devices.audioInput[0].deviceId;
            }
            if (!this.currentDevices.videoInput && this.devices.videoInput.length > 0) {
                this.currentDevices.videoInput = this.devices.videoInput[0].deviceId;
            }

            this.emit('devicesEnumerated', this.devices);
            return this.devices;
        } catch (error) {
            console.error('Failed to enumerate devices:', error);
            throw error;
        }
    }

    /**
     * Get media stream with specific device constraints
     */
    async getMediaStream(constraints = {}) {
        const defaultConstraints = {
            video: {
                deviceId: this.currentDevices.videoInput ? { exact: this.currentDevices.videoInput } : undefined,
                width: { ideal: 1280 },
                height: { ideal: 720 },
                frameRate: { ideal: 30 }
            },
            audio: {
                deviceId: this.currentDevices.audioInput ? { exact: this.currentDevices.audioInput } : undefined,
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
        };

        const finalConstraints = this.mergeConstraints(defaultConstraints, constraints);

        try {
            const stream = await navigator.mediaDevices.getUserMedia(finalConstraints);
            this.emit('streamCreated', { stream, constraints: finalConstraints });
            return stream;
        } catch (error) {
            console.error('Failed to get media stream:', error);
            this.emit('streamError', error);
            throw error;
        }
    }

    /**
     * Switch camera device
     */
    async switchCamera(deviceId) {
        if (!this.devices.videoInput.find(device => device.deviceId === deviceId)) {
            throw new Error('Camera device not found');
        }

        this.currentDevices.videoInput = deviceId;
        this.emit('deviceChanged', { type: 'videoInput', deviceId });
    }

    /**
     * Switch microphone device
     */
    async switchMicrophone(deviceId) {
        if (!this.devices.audioInput.find(device => device.deviceId === deviceId)) {
            throw new Error('Microphone device not found');
        }

        this.currentDevices.audioInput = deviceId;
        this.emit('deviceChanged', { type: 'audioInput', deviceId });
    }

    /**
     * Switch speaker device
     */
    async switchSpeaker(deviceId) {
        if (!this.devices.audioOutput.find(device => device.deviceId === deviceId)) {
            throw new Error('Speaker device not found');
        }

        this.currentDevices.audioOutput = deviceId;
        this.emit('deviceChanged', { type: 'audioOutput', deviceId });
    }

    /**
     * Test a specific device
     */
    async testDevice(deviceType, deviceId) {
        try {
            let constraints = {};

            if (deviceType === 'videoInput') {
                constraints.video = { deviceId: { exact: deviceId } };
            } else if (deviceType === 'audioInput') {
                constraints.audio = { deviceId: { exact: deviceId } };
            }

            const stream = await navigator.mediaDevices.getUserMedia(constraints);

            // Stop the test stream after a short delay
            setTimeout(() => {
                stream.getTracks().forEach(track => track.stop());
            }, 2000);

            this.emit('deviceTested', { deviceType, deviceId, success: true });
            return true;
        } catch (error) {
            console.error(`Failed to test ${deviceType}:`, error);
            this.emit('deviceTested', { deviceType, deviceId, success: false, error });
            return false;
        }
    }

    /**
     * Get device capabilities
     */
    async getDeviceCapabilities(deviceId) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: { exact: deviceId } }
            });

            const videoTrack = stream.getVideoTracks()[0];
            const capabilities = videoTrack.getCapabilities();

            // Stop the stream
            stream.getTracks().forEach(track => track.stop());

            return capabilities;
        } catch (error) {
            console.error('Failed to get device capabilities:', error);
            return null;
        }
    }

    /**
     * Merge constraints objects
     */
    mergeConstraints(defaultConstraints, userConstraints) {
        const merged = {...defaultConstraints };

        if (userConstraints.video) {
            merged.video = {...merged.video, ...userConstraints.video };
        }

        if (userConstraints.audio) {
            merged.audio = {...merged.audio, ...userConstraints.audio };
        }

        return merged;
    }

    /**
     * Check if device is available
     */
    isDeviceAvailable(deviceType, deviceId) {
        return this.devices[deviceType] ? .some(device => device.deviceId === deviceId) || false;
    }

    /**
     * Get current device settings
     */
    getCurrentDevices() {
        return {...this.currentDevices };
    }

    /**
     * Get available devices
     */
    getAvailableDevices() {
        return {...this.devices };
    }

    /**
     * Get permission status
     */
    getPermissions() {
        return {...this.permissions };
    }

    /**
     * Event emitter methods
     */
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.eventListeners.has(event)) {
            const listeners = this.eventListeners.get(event);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Error in event listener:', error);
                }
            });
        }
    }

    /**
     * Cleanup
     */
    destroy() {
        this.eventListeners.clear();
    }
}

// Singleton instance
let mediaDeviceManagerInstance = null;

export const getMediaDeviceManager = () => {
    if (!mediaDeviceManagerInstance) {
        mediaDeviceManagerInstance = new MediaDeviceManager();
    }
    return mediaDeviceManagerInstance;
};