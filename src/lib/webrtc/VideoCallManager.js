import Peer from 'peerjs';

/**
 * Core WebRTC connection manager using PeerJS
 * Handles peer-to-peer connections, media streams, and data channels
 */
export class VideoCallManager {
    constructor(options = {}) {
        this.peer = null;
        this.peerId = null;
        this.connections = new Map();
        this.localStream = null;
        this.remoteStreams = new Map();
        this.dataChannels = new Map();
        this.eventListeners = new Map();

        // Configuration
        this.config = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ],
            ...options
        };

        this.isInitialized = false;
        this.isInCall = false;
    }

    /**
     * Initialize the PeerJS connection
     */
    async initialize() {
        if (this.isInitialized) return;

        return new Promise((resolve, reject) => {
            try {
                this.peer = new Peer({
                    iceServers: this.config.iceServers
                });

                this.peer.on('open', (id) => {
                    this.peerId = id;
                    this.isInitialized = true;
                    this.emit('initialized', { peerId: id });
                    resolve({ peerId: id });
                });

                this.peer.on('error', (error) => {
                    console.error('PeerJS error:', error);
                    this.emit('error', error);
                    reject(error);
                });

                this.peer.on('connection', (conn) => {
                    this.handleIncomingConnection(conn);
                });

                this.peer.on('call', (call) => {
                    this.handleIncomingCall(call);
                });

            } catch (error) {
                console.error('Failed to initialize PeerJS:', error);
                reject(error);
            }
        });
    }

    /**
     * Start a call to another peer
     */
    async startCall(remotePeerId, localStream) {
        if (!this.isInitialized) {
            throw new Error('VideoCallManager not initialized');
        }

        try {
            // Create data channel for chat and file sharing
            const dataConn = this.peer.connect(remotePeerId, {
                reliable: true
            });

            dataConn.on('open', () => {
                this.dataChannels.set(remotePeerId, dataConn);
                this.emit('dataChannelOpen', { peerId: remotePeerId });
            });

            dataConn.on('data', (data) => {
                this.emit('dataReceived', { peerId: remotePeerId, data });
            });

            // Create media call
            const call = this.peer.call(remotePeerId, localStream);

            call.on('stream', (remoteStream) => {
                this.remoteStreams.set(remotePeerId, remoteStream);
                this.emit('remoteStream', { peerId: remotePeerId, stream: remoteStream });
            });

            call.on('close', () => {
                this.connections.delete(remotePeerId);
                this.remoteStreams.delete(remotePeerId);
                this.dataChannels.delete(remotePeerId);
                this.emit('callEnded', { peerId: remotePeerId });
            });

            this.connections.set(remotePeerId, call);
            this.localStream = localStream;
            this.isInCall = true;

            this.emit('callStarted', { peerId: remotePeerId });

            return call;
        } catch (error) {
            console.error('Failed to start call:', error);
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * Answer an incoming call
     */
    async answerCall(call, localStream) {
        try {
            call.answer(localStream);

            call.on('stream', (remoteStream) => {
                this.remoteStreams.set(call.peer, remoteStream);
                this.emit('remoteStream', { peerId: call.peer, stream: remoteStream });
            });

            call.on('close', () => {
                this.connections.delete(call.peer);
                this.remoteStreams.delete(call.peer);
                this.dataChannels.delete(call.peer);
                this.emit('callEnded', { peerId: call.peer });
            });

            this.connections.set(call.peer, call);
            this.localStream = localStream;
            this.isInCall = true;

            this.emit('callAnswered', { peerId: call.peer });

            return call;
        } catch (error) {
            console.error('Failed to answer call:', error);
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * End a call
     */
    endCall(peerId = null) {
        if (peerId) {
            // End specific call
            const call = this.connections.get(peerId);
            if (call) {
                call.close();
            }
        } else {
            // End all calls
            this.connections.forEach(call => call.close());
            this.connections.clear();
            this.remoteStreams.clear();
            this.dataChannels.clear();
        }

        this.isInCall = false;
        this.emit('callEnded', { peerId });
    }

    /**
     * Send data through data channel
     */
    sendData(peerId, data) {
        const dataChannel = this.dataChannels.get(peerId);
        if (dataChannel && dataChannel.open) {
            dataChannel.send(data);
        } else {
            console.warn('Data channel not available for peer:', peerId);
        }
    }

    /**
     * Handle incoming connection (data channel)
     */
    handleIncomingConnection(conn) {
        conn.on('open', () => {
            this.dataChannels.set(conn.peer, conn);
            this.emit('dataChannelOpen', { peerId: conn.peer });
        });

        conn.on('data', (data) => {
            this.emit('dataReceived', { peerId: conn.peer, data });
        });

        conn.on('close', () => {
            this.dataChannels.delete(conn.peer);
        });
    }

    /**
     * Handle incoming call
     */
    handleIncomingCall(call) {
        this.emit('incomingCall', { call });
    }

    /**
     * Get connection statistics
     */
    getConnectionStats(peerId) {
        const call = this.connections.get(peerId);
        if (call && call.peerConnection) {
            return call.peerConnection.getStats();
        }
        return null;
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
     * Cleanup resources
     */
    destroy() {
        this.endCall();

        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }

        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }

        this.eventListeners.clear();
        this.isInitialized = false;
    }

    /**
     * Get current state
     */
    getState() {
        return {
            isInitialized: this.isInitialized,
            isInCall: this.isInCall,
            peerId: this.peerId,
            connections: Array.from(this.connections.keys()),
            remoteStreams: Array.from(this.remoteStreams.keys()),
            dataChannels: Array.from(this.dataChannels.keys())
        };
    }
}

// Singleton instance
let videoCallManagerInstance = null;

export const getVideoCallManager = () => {
    if (!videoCallManagerInstance) {
        videoCallManagerInstance = new VideoCallManager();
    }
    return videoCallManagerInstance;
};