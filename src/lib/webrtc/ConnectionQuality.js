/**
 * Monitor connection quality and bandwidth
 * Provides real-time connection statistics and quality metrics
 */
export class ConnectionQuality {
    constructor() {
        this.stats = new Map();
        this.qualityThresholds = {
            excellent: { rtt: 50, packetLoss: 0.01, jitter: 10 },
            good: { rtt: 100, packetLoss: 0.03, jitter: 20 },
            fair: { rtt: 200, packetLoss: 0.05, jitter: 50 },
            poor: { rtt: 300, packetLoss: 0.1, jitter: 100 }
        };
        this.eventListeners = new Map();
        this.monitoringInterval = null;
        this.isMonitoring = false;
        this.previousStats = new Map(); // Store previous stats for bitrate calculation
    }

    /**
     * Start monitoring connection quality for a peer
     */
    startMonitoring(peerId, peerConnection) {
        if (!peerConnection) {
            console.warn('No peer connection provided for monitoring');
            return;
        }

        this.stats.set(peerId, {
            peerConnection,
            lastUpdate: Date.now(),
            quality: 'unknown',
            metrics: {
                rtt: 0,
                packetLoss: 0,
                jitter: 0,
                bandwidth: 0,
                resolution: { width: 0, height: 0 },
                frameRate: 0,
                bitrate: 0
            }
        });

        if (!this.isMonitoring) {
            this.startPeriodicMonitoring();
        }

        this.emit('monitoringStarted', { peerId });
    }

    /**
     * Stop monitoring connection quality for a peer
     */
    stopMonitoring(peerId) {
        this.stats.delete(peerId);

        if (this.stats.size === 0) {
            this.stopPeriodicMonitoring();
        }

        this.emit('monitoringStopped', { peerId });
    }

    /**
     * Start periodic monitoring
     */
    startPeriodicMonitoring() {
        if (this.isMonitoring) return;

        this.isMonitoring = true;
        this.monitoringInterval = setInterval(() => {
            this.updateAllStats();
        }, 1000); // Update every second

        this.emit('monitoringEnabled');
    }

    /**
     * Stop periodic monitoring
     */
    stopPeriodicMonitoring() {
        if (!this.isMonitoring) return;

        this.isMonitoring = false;
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }

        this.emit('monitoringDisabled');
    }

    /**
     * Update statistics for all monitored peers
     */
    async updateAllStats() {
        const updatePromises = Array.from(this.stats.keys()).map(peerId =>
            this.updatePeerStats(peerId)
        );

        await Promise.allSettled(updatePromises);
    }

    /**
     * Update statistics for a specific peer
     */
    async updatePeerStats(peerId) {
        const peerStats = this.stats.get(peerId);
        if (!peerStats) return;

        try {
            const stats = await peerStats.peerConnection.getStats();
            const metrics = this.parseStats(stats, peerId);

            peerStats.metrics = metrics;
            peerStats.lastUpdate = Date.now();
            peerStats.quality = this.calculateQuality(metrics);

            this.emit('statsUpdated', { peerId, metrics, quality: peerStats.quality });
        } catch (error) {
            console.error(`Failed to update stats for peer ${peerId}:`, error);
        }
    }

    /**
     * Parse WebRTC statistics
     */
    parseStats(stats, peerId) {
        const metrics = {
            rtt: 0,
            packetLoss: 0,
            jitter: 0,
            bandwidth: 0,
            resolution: { width: 0, height: 0 },
            frameRate: 0,
            bitrate: 0
        };

        const previousStats = this.previousStats.get(peerId) || {};
        const currentTime = Date.now();
        const timeDiff = currentTime - (previousStats.timestamp || currentTime);

        stats.forEach(report => {
            switch (report.type) {
                case 'candidate-pair':
                    if (report.state === 'succeeded') {
                        metrics.rtt = report.currentRoundTripTime * 1000; // Convert to ms
                        metrics.bandwidth = report.availableOutgoingBitrate || 0;
                    }
                    break;

                case 'inbound-rtp':
                    if (report.mediaType === 'video') {
                        metrics.resolution.width = report.frameWidth || 0;
                        metrics.resolution.height = report.frameHeight || 0;
                        metrics.frameRate = report.framesPerSecond || 0;

                        // Calculate bitrate from bytes difference
                        const bytesReceived = report.bytesReceived || 0;
                        const prevBytesReceived = previousStats.bytesReceived || 0;
                        const bytesDiff = bytesReceived - prevBytesReceived;
                        metrics.bitrate = timeDiff > 0 ? (bytesDiff * 8) / (timeDiff / 1000) / 1000 : 0; // Convert to kbps
                    }
                    break;

                case 'outbound-rtp':
                    if (report.mediaType === 'video') {
                        const bytesSent = report.bytesSent || 0;
                        const prevBytesSent = previousStats.bytesSent || 0;
                        const bytesDiff = bytesSent - prevBytesSent;
                        metrics.bitrate = timeDiff > 0 ? (bytesDiff * 8) / (timeDiff / 1000) / 1000 : 0; // Convert to kbps
                    }
                    break;

                case 'remote-inbound-rtp':
                    metrics.packetLoss = report.packetsLost / (report.packetsReceived + report.packetsLost) || 0;
                    metrics.jitter = report.jitter * 1000; // Convert to ms
                    break;
            }
        });

        // Store current stats for next calculation
        this.previousStats.set(peerId, {
            timestamp: currentTime,
            bytesReceived: stats.find(r => r.type === 'inbound-rtp' && r.mediaType === 'video')?.bytesReceived || 0,
            bytesSent: stats.find(r => r.type === 'outbound-rtp' && r.mediaType === 'video')?.bytesSent || 0
        });

        return metrics;
    }

    /**
     * Calculate connection quality based on metrics
     */
    calculateQuality(metrics) {
        const { rtt, packetLoss, jitter } = metrics;

        if (rtt <= this.qualityThresholds.excellent.rtt &&
            packetLoss <= this.qualityThresholds.excellent.packetLoss &&
            jitter <= this.qualityThresholds.excellent.jitter) {
            return 'excellent';
        }

        if (rtt <= this.qualityThresholds.good.rtt &&
            packetLoss <= this.qualityThresholds.good.packetLoss &&
            jitter <= this.qualityThresholds.good.jitter) {
            return 'good';
        }

        if (rtt <= this.qualityThresholds.fair.rtt &&
            packetLoss <= this.qualityThresholds.fair.packetLoss &&
            jitter <= this.qualityThresholds.fair.jitter) {
            return 'fair';
        }

        return 'poor';
    }

    /**
     * Get current quality for a peer
     */
    getQuality(peerId) {
        const peerStats = this.stats.get(peerId);
        return peerStats ? peerStats.quality : 'unknown';
    }

    /**
     * Get current metrics for a peer
     */
    getMetrics(peerId) {
        const peerStats = this.stats.get(peerId);
        return peerStats ? peerStats.metrics : null;
    }

    /**
     * Get quality recommendations
     */
    getQualityRecommendations(peerId) {
        const quality = this.getQuality(peerId);
        const metrics = this.getMetrics(peerId);

        if (!metrics) return [];

        const recommendations = [];

        if (quality === 'poor') {
            if (metrics.rtt > 300) {
                recommendations.push('High latency detected. Check your internet connection.');
            }
            if (metrics.packetLoss > 0.05) {
                recommendations.push('Packet loss detected. Try moving closer to your router.');
            }
            if (metrics.jitter > 100) {
                recommendations.push('Network jitter detected. Close other applications using bandwidth.');
            }
        }

        if (metrics.frameRate < 15) {
            recommendations.push('Low frame rate. Consider reducing video quality.');
        }

        if (metrics.bitrate < 100) {
            recommendations.push('Low bitrate. Check your internet speed.');
        }

        return recommendations;
    }

    /**
     * Get quality color for UI
     */
    getQualityColor(quality) {
        const colors = {
            excellent: '#10B981', // green
            good: '#3B82F6', // blue
            fair: '#F59E0B', // yellow
            poor: '#EF4444', // red
            unknown: '#6B7280' // gray
        };
        return colors[quality] || colors.unknown;
    }

    /**
     * Get quality icon for UI
     */
    getQualityIcon(quality) {
        const icons = {
            excellent: '🟢',
            good: '🔵',
            fair: '🟡',
            poor: '🔴',
            unknown: '⚪'
        };
        return icons[quality] || icons.unknown;
    }

    /**
     * Format metrics for display
     */
    formatMetrics(metrics) {
        return {
            rtt: `${Math.round(metrics.rtt)}ms`,
            packetLoss: `${(metrics.packetLoss * 100).toFixed(1)}%`,
            jitter: `${Math.round(metrics.jitter)}ms`,
            bandwidth: `${Math.round(metrics.bandwidth / 1000)}kbps`,
            resolution: `${metrics.resolution.width}x${metrics.resolution.height}`,
            frameRate: `${Math.round(metrics.frameRate)}fps`,
            bitrate: `${Math.round(metrics.bitrate)}kbps`
        };
    }

    /**
     * Check if connection is stable
     */
    isConnectionStable(peerId, timeWindow = 10000) {
        const peerStats = this.stats.get(peerId);
        if (!peerStats) return false;

        const now = Date.now();
        const timeSinceUpdate = now - peerStats.lastUpdate;

        return timeSinceUpdate < timeWindow && peerStats.quality !== 'poor';
    }

    /**
     * Get all monitored peers
     */
    getMonitoredPeers() {
        return Array.from(this.stats.keys());
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
        this.stopPeriodicMonitoring();
        this.stats.clear();
        this.previousStats.clear();
        this.eventListeners.clear();
    }
}

// Singleton instance
let connectionQualityInstance = null;

export const getConnectionQuality = () => {
    if (!connectionQualityInstance) {
        connectionQualityInstance = new ConnectionQuality();
    }
    return connectionQualityInstance;
};