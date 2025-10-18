/**
 * Screen sharing functionality
 * Handles screen capture, sharing controls, and stream management
 */
export class ScreenShareManager {
    constructor() {
        this.screenStream = null;
        this.isSharing = false;
        this.eventListeners = new Map();
        this.shareOptions = {
            video: true,
            audio: false, // Screen share typically doesn't include audio
            cursor: 'always' // Show cursor in screen share
        };
    }

    /**
     * Start screen sharing
     */
    async startScreenShare(options = {}) {
        if (this.isSharing) {
            throw new Error('Screen sharing is already active');
        }

        try {
            // Merge options with defaults
            const shareOptions = {...this.shareOptions, ...options };

            // Request screen capture
            this.screenStream = await navigator.mediaDevices.getDisplayMedia(shareOptions);

            // Handle stream ending (user stops sharing)
            this.screenStream.getVideoTracks()[0].addEventListener('ended', () => {
                this.stopScreenShare();
            });

            this.isSharing = true;
            this.emit('screenShareStarted', { stream: this.screenStream });

            return this.screenStream;
        } catch (error) {
            console.error('Failed to start screen sharing:', error);
            this.emit('screenShareError', error);
            throw error;
        }
    }

    /**
     * Stop screen sharing
     */
    stopScreenShare() {
        if (!this.isSharing) return;

        if (this.screenStream) {
            this.screenStream.getTracks().forEach(track => track.stop());
            this.screenStream = null;
        }

        this.isSharing = false;
        this.emit('screenShareStopped');
    }

    /**
     * Check if screen sharing is supported
     */
    isScreenShareSupported() {
        return navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia;
    }

    /**
     * Get available screen sources
     */
    async getScreenSources() {
        if (!this.isScreenShareSupported()) {
            return [];
        }

        try {
            // Note: The getDisplayMedia API doesn't provide detailed source information
            // in most browsers. This is a simplified approach that returns common options.
            // For more detailed source information, you would need to use Electron's
            // desktopCapturer API or similar platform-specific APIs.
            return [
                { id: 'screen', name: 'Entire Screen', type: 'screen' },
                { id: 'window', name: 'Application Window', type: 'window' },
                { id: 'tab', name: 'Browser Tab', type: 'tab' }
            ];
        } catch (error) {
            console.error('Failed to get screen sources:', error);
            return [];
        }
    }

    /**
     * Switch screen source (if supported by browser)
     */
    async switchScreenSource(sourceId) {
        if (!this.isSharing) {
            throw new Error('Screen sharing is not active');
        }

        try {
            // Stop current sharing
            this.stopScreenShare();

            // Start sharing with new source
            const newStream = await this.startScreenShare({
                video: {
                    mediaSource: sourceId
                }
            });

            return newStream;
        } catch (error) {
            console.error('Failed to switch screen source:', error);
            throw error;
        }
    }

    /**
     * Get current screen stream
     */
    getScreenStream() {
        return this.screenStream;
    }

    /**
     * Check if currently sharing
     */
    isCurrentlySharing() {
        return this.isSharing;
    }

    /**
     * Get sharing status
     */
    getSharingStatus() {
        return {
            isSharing: this.isSharing,
            stream: this.screenStream,
            supported: this.isScreenShareSupported()
        };
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
        this.stopScreenShare();
        this.eventListeners.clear();
    }
}

// Singleton instance
let screenShareManagerInstance = null;

export const getScreenShareManager = () => {
    if (!screenShareManagerInstance) {
        screenShareManagerInstance = new ScreenShareManager();
    }
    return screenShareManagerInstance;
};