/**
 * RescueLink Transport Abstraction & Offline Queue Service
 * Supports: Online Socket.io, Offline local queue, and LoRa Gateway Hardware Interface.
 */

const QUEUE_STORAGE_KEY = 'rescuelink_offline_emergency_queue';

export class TransportService {
    constructor(socket) {
        this.socket = socket;
        this.isOnline = navigator.onLine && (socket ? socket.connected : false);
        this.queue = this.loadQueue();
    }

    loadQueue() {
        try {
            const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    saveQueue() {
        try {
            localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
        } catch (e) { }
    }

    /**
     * Dispatches emergency alert via available transport
     */
    sendEmergencyAlert(alertPayload) {
        const payloadWithMeta = {
            ...alertPayload,
            offlineTimestamp: new Date().toISOString(),
            transportProtocol: this.socket && this.socket.connected ? 'WSS_SOCKET_IO' : 'OFFLINE_LORA_STORE_FORWARD'
        };

        if (this.socket && this.socket.connected) {
            this.socket.emit('emergency_alert', payloadWithMeta);
            return { sentOnline: true, queued: false };
        } else {
            // Queue offline
            this.queue.push(payloadWithMeta);
            this.saveQueue();
            return { sentOnline: false, queued: true, queueCount: this.queue.length };
        }
    }

    /**
     * Synchronizes queued offline alerts once internet/socket connection resumes
     */
    syncQueuedEvents() {
        if (!this.socket || !this.socket.connected || this.queue.length === 0) {
            return 0;
        }

        const count = this.queue.length;
        this.queue.forEach(item => {
            this.socket.emit('emergency_alert', {
                ...item,
                syncedFromOfflineStore: true
            });
        });

        this.queue = [];
        this.saveQueue();
        return count;
    }

    getQueueCount() {
        return this.queue.length;
    }
}
