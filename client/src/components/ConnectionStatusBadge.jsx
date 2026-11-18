import React from 'react';
import { Wifi, WifiOff, RefreshCw, Radio } from 'lucide-react';

const ConnectionStatusBadge = ({ isConnected = true, isSyncing = false, queueCount = 0, onSync = null }) => {
    if (isSyncing) {
        return (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded border border-[var(--phosphor-amber)] bg-[rgba(255,180,84,0.12)] text-[var(--phosphor-amber)] font-data text-xs shadow-[0_0_8px_var(--phosphor-amber-glow)]">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>SYNCING QUEUE ({queueCount})...</span>
            </div>
        );
    }

    if (!isConnected) {
        return (
            <div 
                onClick={onSync}
                className="flex items-center gap-1.5 px-3 py-1 rounded border border-[var(--radar-red)] bg-[rgba(255,92,92,0.15)] text-[var(--radar-red)] font-data text-xs shadow-[0_0_8px_var(--radar-red-glow)] cursor-pointer"
                title="Transmitting via LoRa Store-and-Forward Mesh"
            >
                <WifiOff className="w-3.5 h-3.5 animate-pulse" />
                <span>OFFLINE [LORA STORE: {queueCount}]</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded border border-[var(--phosphor-green)] bg-[rgba(107,203,119,0.12)] text-[var(--phosphor-green)] font-data text-xs shadow-[0_0_8px_var(--phosphor-green-glow)]">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>LINK NOMINAL (ONLINE)</span>
        </div>
    );
};

export default ConnectionStatusBadge;
