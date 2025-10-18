/**
 * Session recording (video/audio)
 * Handles MediaRecorder API for recording telemedicine sessions
 */
export class RecordingManager {
    constructor() {
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.isRecording = false;
        this.recordingStartTime = null;
        this.recordingDuration = 0;
        this.eventListeners = new Map();
        this.recordingOptions = {
            mimeType: 'video/webm;codecs=vp9,opus',
            videoBitsPerSecond: 1000000, // 1 Mbps - more reasonable default
            audioBitsPerSecond: 128000 // 128 kbps
        };
    }

    /**
     * Start recording a session
     */
    async startRecording(streams, options = {}) {
        if (this.isRecording) {
            throw new Error('Recording is already in progress');
        }

        try {
            // Merge options with defaults
            const recordingOptions = {...this.recordingOptions, ...options };

            // Check if the browser supports the requested MIME type
            if (!MediaRecorder.isTypeSupported(recordingOptions.mimeType)) {
                // Fallback to a more widely supported format
                recordingOptions.mimeType = 'video/webm;codecs=vp8,opus';

                if (!MediaRecorder.isTypeSupported(recordingOptions.mimeType)) {
                    recordingOptions.mimeType = 'video/webm';
                }
            }

            // Create a combined stream if multiple streams are provided
            const combinedStream = this.combineStreams(streams);

            // Create MediaRecorder
            this.mediaRecorder = new MediaRecorder(combinedStream, recordingOptions);

            // Set up event handlers
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstart = () => {
                this.isRecording = true;
                this.recordingStartTime = Date.now();
                this.emit('recordingStarted', {
                    startTime: this.recordingStartTime,
                    options: recordingOptions
                });
            };

            this.mediaRecorder.onstop = () => {
                this.isRecording = false;
                this.recordingDuration = Date.now() - this.recordingStartTime;
                this.emit('recordingStopped', {
                    duration: this.recordingDuration,
                    chunks: this.recordedChunks.length
                });
            };

            this.mediaRecorder.onerror = (error) => {
                console.error('MediaRecorder error:', error);
                this.emit('recordingError', error);
            };

            // Start recording
            this.mediaRecorder.start(1000); // Collect data every second

            return true;
        } catch (error) {
            console.error('Failed to start recording:', error);
            this.emit('recordingError', error);
            throw error;
        }
    }

    /**
     * Stop recording
     */
    stopRecording() {
        if (!this.isRecording || !this.mediaRecorder) {
            return null;
        }

        try {
            this.mediaRecorder.stop();
            return this.getRecordingBlob();
        } catch (error) {
            console.error('Failed to stop recording:', error);
            this.emit('recordingError', error);
            throw error;
        }
    }

    /**
     * Pause recording
     */
    pauseRecording() {
        if (!this.isRecording || !this.mediaRecorder) {
            return false;
        }

        try {
            this.mediaRecorder.pause();
            this.emit('recordingPaused');
            return true;
        } catch (error) {
            console.error('Failed to pause recording:', error);
            return false;
        }
    }

    /**
     * Resume recording
     */
    resumeRecording() {
        if (!this.isRecording || !this.mediaRecorder) {
            return false;
        }

        try {
            this.mediaRecorder.resume();
            this.emit('recordingResumed');
            return true;
        } catch (error) {
            console.error('Failed to resume recording:', error);
            return false;
        }
    }

    /**
     * Combine multiple streams into one
     */
    combineStreams(streams) {
        if (!streams || streams.length === 0) {
            throw new Error('No streams provided for recording');
        }

        if (streams.length === 1) {
            return streams[0];
        }

        // Create a new MediaStream
        const combinedStream = new MediaStream();

        // Add all video tracks
        streams.forEach(stream => {
            stream.getVideoTracks().forEach(track => {
                combinedStream.addTrack(track);
            });
        });

        // Add all audio tracks
        streams.forEach(stream => {
            stream.getAudioTracks().forEach(track => {
                combinedStream.addTrack(track);
            });
        });

        return combinedStream;
    }

    /**
     * Get recording as blob
     */
    getRecordingBlob() {
        if (this.recordedChunks.length === 0) {
            return null;
        }

        const blob = new Blob(this.recordedChunks, {
            type: this.recordingOptions.mimeType
        });

        return blob;
    }

    /**
     * Get recording as URL
     */
    getRecordingURL() {
        const blob = this.getRecordingBlob();
        if (!blob) return null;

        return URL.createObjectURL(blob);
    }

    /**
     * Download recording
     */
    downloadRecording(filename = 'telemedicine-session.webm') {
        const blob = this.getRecordingBlob();
        if (!blob) {
            throw new Error('No recording data available');
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.emit('recordingDownloaded', { filename, size: blob.size });
    }

    /**
     * Save recording to patient documents
     */
    async saveRecordingToPatient(patientId, sessionId, metadata = {}) {
        const blob = this.getRecordingBlob();
        if (!blob) {
            throw new Error('No recording data available');
        }

        try {
            // Convert blob to base64 for storage
            const base64 = await this.blobToBase64(blob);

            const recordingData = {
                patient_id: patientId,
                session_id: sessionId,
                filename: `telemedicine-session-${sessionId}.webm`,
                mimeType: this.recordingOptions.mimeType,
                size: blob.size,
                duration: this.recordingDuration,
                data: base64,
                metadata: {
                    startTime: this.recordingStartTime,
                    endTime: Date.now(),
                    ...metadata
                }
            };

            this.emit('recordingSaved', recordingData);
            return recordingData;
        } catch (error) {
            console.error('Failed to save recording:', error);
            this.emit('recordingError', error);
            throw error;
        }
    }

    /**
     * Convert blob to base64
     */
    blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    /**
     * Get recording status
     */
    getRecordingStatus() {
        return {
            isRecording: this.isRecording,
            duration: this.recordingDuration,
            startTime: this.recordingStartTime,
            chunksCount: this.recordedChunks.length,
            supported: MediaRecorder.isTypeSupported(this.recordingOptions.mimeType)
        };
    }

    /**
     * Get recording duration in human-readable format
     */
    getFormattedDuration() {
        const seconds = Math.floor(this.recordingDuration / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
        }
    }

    /**
     * Check if recording is supported
     */
    isRecordingSupported() {
        return typeof MediaRecorder !== 'undefined' &&
            MediaRecorder.isTypeSupported(this.recordingOptions.mimeType);
    }

    /**
     * Clear recorded data
     */
    clearRecording() {
        this.recordedChunks = [];
        this.recordingDuration = 0;
        this.recordingStartTime = null;
        this.emit('recordingCleared');
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
        if (this.isRecording) {
            this.stopRecording();
        }
        this.clearRecording();
        this.eventListeners.clear();
    }
}

// Singleton instance
let recordingManagerInstance = null;

export const getRecordingManager = () => {
    if (!recordingManagerInstance) {
        recordingManagerInstance = new RecordingManager();
    }
    return recordingManagerInstance;
};