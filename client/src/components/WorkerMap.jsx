import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { useTranslation } from 'react-i18next';

// Create custom icons for leaflet
const createIcon = (color) => new Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const icons = {
    SAFE: createIcon('green'),
    WARNING: createIcon('yellow'),
    CRITICAL: createIcon('red')
};

const WorkerMap = ({ workers }) => {
    const center = [51.505, -0.09]; // Default center
    const { t } = useTranslation();

    return (
        <div className="h-[400px] w-full rounded-2xl overflow-hidden glass-panel border-[rgba(0,240,255,0.2)]">
            <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                {/* Dark theme styled map tiles from CartoDB */}
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                {workers.map((worker) => (
                    <Marker
                        key={worker.workerId}
                        position={[worker.lat, worker.lng]}
                        icon={icons[worker.status] || icons['SAFE']}
                    >
                        <Popup className="bg-[#050a14] border-[var(--primary)] text-white">
                            <div className="p-2 min-w-[150px]">
                                <h3 className="font-bold text-lg border-b border-gray-700 pb-2 mb-2">{worker.name}</h3>
                                <p><strong>{t("Zone")}:</strong> {worker.zone}</p>
                                <p><strong>{t("Status")}:</strong> <span className={`font-bold ${worker.status === 'SAFE' ? 'text-[var(--safe)]' : worker.status === 'WARNING' ? 'text-[var(--warning)]' : 'text-[var(--danger)]'}`}>{t(worker.status)}</span></p>
                                <p><strong>{t("Temp:")}</strong> {worker.envTemp}°C</p>
                                <p><strong>{t("Battery")}:</strong> {worker.battery}%</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default WorkerMap;
