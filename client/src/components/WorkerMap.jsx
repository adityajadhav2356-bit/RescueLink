import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, Polygon, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { divIcon } from 'leaflet';
import { calculateEvacuationRoute, SAFE_EXITS } from '../services/evacuationRouter';
import { Shield, AlertTriangle, UserCheck, Flame, Navigation, Crosshair, Truck, MapPin, Locate } from 'lucide-react';
import { soundService } from '../services/soundService';

// Custom Tactical SVG Marker Generator
const createTacticalMarker = (type, status = 'SAFE', label = '') => {
    let color = '#10B981'; // Green
    let pulseClass = 'beacon-pulse';

    if (status === 'CRITICAL') {
        color = '#EF4444';
        pulseClass = 'beacon-pulse-red';
    } else if (status === 'RESCUE_EN_ROUTE') {
        color = '#00E5FF';
        pulseClass = 'beacon-pulse';
    } else if (status === 'WARNING') {
        color = '#F59E0B';
        pulseClass = 'beacon-pulse-amber';
    } else if (type === 'RESCUE') {
        color = '#00E5FF';
        pulseClass = '';
    } else if (type === 'HAZARD') {
        color = '#F97316';
        pulseClass = 'beacon-pulse-amber';
    } else if (type === 'EXIT') {
        color = '#34D399';
        pulseClass = '';
    }

    const html = `
        <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; inset: 0; border-radius: 50%; background: ${color}25; border: 1px solid ${color}; box-shadow: 0 0 10px ${color}60;"></div>
            ${status === 'CRITICAL' ? `<div style="position: absolute; inset: -4px; border-radius: 50%; border: 2px solid ${color}; animation: pulseBeaconRed 1s infinite ease-in-out;"></div>` : ''}
            ${status === 'RESCUE_EN_ROUTE' ? `<div style="position: absolute; inset: -4px; border-radius: 50%; border: 2px dashed ${color}; animation: radarRotate 3s linear infinite;"></div>` : ''}
            <div style="width: 12px; height: 12px; border-radius: 50%; background: ${color}; box-shadow: 0 0 6px ${color};"></div>
            ${label ? `<div style="position: absolute; bottom: -14px; left: 50%; transform: translateX(-50%); font-family: 'IBM Plex Mono', monospace; font-size: 9px; font-weight: 700; color: #F8FAFC; background: #0E1626; border: 1px solid ${color}; padding: 0 4px; border-radius: 3px; white-space: nowrap;">${label}</div>` : ''}
        </div>
    `;

    return divIcon({
        className: 'tactical-custom-marker',
        html,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18]
    });
};

// Smooth Map Controller for Panning & Centering
const MapController = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center && Array.isArray(center) && center.length === 2) {
            map.flyTo(center, zoom || map.getZoom(), { duration: 1.2 });
        }
    }, [center, zoom, map]);
    return null;
};

// Real-World Basemap Tile Providers (Google Maps, OSM, Esri - Zero API key required)
const BASEMAP_PRESETS = {
    google_hybrid: {
        name: '🛰️ Google Hybrid (Satellite + Roads)',
        base: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 20,
        attribution: '&copy; Google Maps'
    },
    google_streets: {
        name: '🗺️ Google Streets (Real Roadmap)',
        base: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 20,
        attribution: '&copy; Google Maps'
    },
    google_sat: {
        name: '📷 Google Satellite',
        base: 'https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 20,
        attribution: '&copy; Google Maps'
    },
    google_terrain: {
        name: '🏔️ Google Terrain',
        base: 'https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 20,
        attribution: '&copy; Google Maps'
    },
    osm: {
        name: '🌍 OpenStreetMap Standard',
        base: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        subdomains: ['a', 'b', 'c'],
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    },
    esri_sat: {
        name: '🛰️ Esri World Imagery',
        base: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        subdomains: [],
        maxZoom: 19,
        attribution: '&copy; Esri, Maxar, Earthstar Geographics'
    },
    dark: {
        name: '🌑 Tactical Dark Canvas',
        base: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        reference: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
        subdomains: [],
        maxZoom: 16,
        attribution: '&copy; Esri, HERE, Garmin'
    }
};

export const WorkerMap = ({
    workers = [],
    hazards = [],
    geofences = [],
    rescueTeams = [],
    selectedWorker = null,
    onSelectWorker = () => { },
    onOpenDigitalTwin = () => { }
}) => {
    const defaultCenter = [51.505, -0.09]; // Industrial site center

    const [selectedBasemap, setSelectedBasemap] = useState('google_hybrid');
    const [currentCenter, setCurrentCenter] = useState(defaultCenter);
    const [currentZoom, setCurrentZoom] = useState(15);
    const [isLocating, setIsLocating] = useState(false);
    const [userGpsPos, setUserGpsPos] = useState(null);

    const [showHazards, setShowHazards] = useState(true);
    const [showGeofences, setShowGeofences] = useState(true);
    const [showRoutes, setShowRoutes] = useState(true);
    const [showTeams, setShowTeams] = useState(true);
    const [showExits, setShowExits] = useState(true);

    // If selected worker changes, pan map to worker
    useEffect(() => {
        if (selectedWorker && selectedWorker.lat && selectedWorker.lng) {
            setCurrentCenter([selectedWorker.lat, selectedWorker.lng]);
            setCurrentZoom(16);
        }
    }, [selectedWorker]);

    // Active worker for routing priority: selected or critical SOS worker or rescue in progress
    const activeWorkerForRoute = selectedWorker || workers.find(w => w.status === 'CRITICAL' || w.status === 'RESCUE_EN_ROUTE') || workers[0];
    const evacuationRoute = (showRoutes && activeWorkerForRoute)
        ? calculateEvacuationRoute([activeWorkerForRoute.lat || 51.505, activeWorkerForRoute.lng || -0.09], hazards)
        : null;

    const currentBasemap = BASEMAP_PRESETS[selectedBasemap] || BASEMAP_PRESETS.google_hybrid;

    // Trigger browser GPS location
    const handleLocateMe = () => {
        soundService.playClick();
        if ('geolocation' in navigator) {
            setIsLocating(true);
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const coords = [pos.coords.latitude, pos.coords.longitude];
                    setUserGpsPos(coords);
                    setCurrentCenter(coords);
                    setCurrentZoom(16);
                    setIsLocating(false);
                },
                (err) => {
                    console.warn('Geolocation error:', err);
                    setIsLocating(false);
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        }
    };

    return (
        <div className="h-full w-full rounded-md overflow-hidden bezel-panel border border-[var(--grid-line)] relative flex flex-col min-h-[400px]">
            {/* Tactical Map Control Strip */}
            <div className="bg-[var(--bg-panel-elevated)] border-b border-[var(--grid-line)] px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 z-[400] text-[0.68rem] font-data select-none">
                <div className="flex items-center gap-2 text-[var(--text-primary)]">
                    <span className="w-2 h-2 rounded-full bg-[var(--safety-cyan)] animate-pulse"></span>
                    <span className="font-bold tracking-wider uppercase text-[var(--safety-cyan)]">
                        REAL-TIME GIS RADAR // LIVE MAP
                    </span>
                    <span className="text-[var(--text-muted)] text-[0.62rem] hidden sm:inline">
                        (MUMBAI HIGH / SHAFT 3)
                    </span>
                </div>

                {/* Basemap Preset Selector & Layer Toggles */}
                <div className="flex items-center flex-wrap gap-2.5">
                    {/* Basemap Switcher (Real Google & OSM Maps) */}
                    <div className="flex items-center gap-1 bg-black/50 border border-[var(--grid-line)] rounded px-2 py-0.5 shadow-inner">
                        <span className="text-[var(--text-muted)] text-[0.6rem] font-bold">MAP:</span>
                        <select
                            value={selectedBasemap}
                            onChange={(e) => {
                                soundService.playClick();
                                setSelectedBasemap(e.target.value);
                            }}
                            className="bg-transparent text-[var(--safety-cyan)] font-mono text-[0.65rem] border-none outline-none cursor-pointer font-semibold"
                        >
                            <option value="google_hybrid" className="bg-[#0E1626] text-white">🛰️ Google Hybrid (Satellite + Roads)</option>
                            <option value="google_streets" className="bg-[#0E1626] text-white">🗺️ Google Streets (Real Roadmap)</option>
                            <option value="google_sat" className="bg-[#0E1626] text-white">📷 Google Satellite Pure</option>
                            <option value="google_terrain" className="bg-[#0E1626] text-white">🏔️ Google Terrain</option>
                            <option value="osm" className="bg-[#0E1626] text-white">🌍 OpenStreetMap Standard</option>
                            <option value="esri_sat" className="bg-[#0E1626] text-white">🛰️ Esri World Imagery</option>
                            <option value="dark" className="bg-[#0E1626] text-white">🌑 Tactical Dark Canvas</option>
                        </select>
                    </div>

                    {/* GPS Locate Me Button */}
                    <button
                        onClick={handleLocateMe}
                        disabled={isLocating}
                        title="Center on my real GPS coordinates"
                        className="flex items-center gap-1 px-2 py-0.5 rounded bg-[rgba(0,229,255,0.15)] border border-[var(--safety-cyan)] text-[var(--safety-cyan)] hover:bg-[rgba(0,229,255,0.3)] transition-all cursor-pointer text-[0.65rem] font-bold"
                    >
                        <Locate className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                        <span>{isLocating ? 'Locating...' : 'GPS Me'}</span>
                    </button>

                    <label className="flex items-center gap-1.5 cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                        <input
                            type="checkbox"
                            checked={showHazards}
                            onChange={(e) => { soundService.playClick(); setShowHazards(e.target.checked); }}
                            className="rounded accent-[var(--safety-orange)]"
                        />
                        <span>Hazards ({hazards.length})</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                        <input
                            type="checkbox"
                            checked={showGeofences}
                            onChange={(e) => { soundService.playClick(); setShowGeofences(e.target.checked); }}
                            className="rounded accent-[var(--safety-cyan)]"
                        />
                        <span>Zones ({geofences.length})</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                        <input
                            type="checkbox"
                            checked={showRoutes}
                            onChange={(e) => { soundService.playClick(); setShowRoutes(e.target.checked); }}
                            className="rounded accent-[var(--safety-green)]"
                        />
                        <span>Safe Route</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                        <input
                            type="checkbox"
                            checked={showTeams}
                            onChange={(e) => { soundService.playClick(); setShowTeams(e.target.checked); }}
                            className="rounded accent-[var(--safety-cyan)]"
                        />
                        <span>Responders</span>
                    </label>
                </div>
            </div>

            {/* Evacuation Route Telemetry HUD */}
            {evacuationRoute && showRoutes && (
                <div className="absolute top-10 left-3 z-[400] bg-[var(--bg-panel-elevated)] border border-[var(--safety-green)] p-2.5 rounded shadow-2xl font-data text-xs max-w-xs pointer-events-auto backdrop-blur-md">
                    <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[0.65rem] text-[var(--safety-green)] font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-[var(--safety-green)] rounded-full animate-ping"></span>
                            RECOMMENDED RESPONSE ROUTE
                        </span>
                        <span className="text-[0.65rem] text-[var(--text-muted)]">ETA: ~{evacuationRoute.estimatedMinutes}m</span>
                    </div>
                    <p className="text-[0.7rem] text-[var(--text-primary)] truncate font-semibold">
                        Target: {evacuationRoute.destinationName}
                    </p>
                    <div className="flex justify-between text-[0.65rem] text-[var(--text-muted)] mt-1">
                        <span>Dist: <strong className="text-[var(--text-primary)]">{evacuationRoute.distanceMeters} m</strong></span>
                        <span className={evacuationRoute.isRerouted ? 'text-[var(--safety-amber)] font-bold' : 'text-[var(--safety-green)]'}>
                            {evacuationRoute.isRerouted ? '⚠️ Hazard Detour Active' : '✓ Corridor Clear'}
                        </span>
                    </div>
                </div>
            )}

            {/* Main Interactive Leaflet Map */}
            <div className="flex-1 w-full relative">
                <MapContainer
                    center={defaultCenter}
                    zoom={15}
                    className="h-full w-full"
                    zoomControl={false}
                >
                    <MapController center={currentCenter} zoom={currentZoom} />

                    {/* Real-World Base Tile Layer */}
                    <TileLayer
                        key={selectedBasemap}
                        attribution={currentBasemap.attribution}
                        url={currentBasemap.base}
                        subdomains={currentBasemap.subdomains || ['0', '1', '2', '3']}
                        maxZoom={currentBasemap.maxZoom || 19}
                    />

                    {/* Optional Reference/Labels Layer (for Dark Canvas) */}
                    {currentBasemap.reference && (
                        <TileLayer
                            key={`${selectedBasemap}-ref`}
                            url={currentBasemap.reference}
                            maxZoom={currentBasemap.maxZoom}
                            opacity={0.9}
                        />
                    )}

                    {/* User GPS Live Marker (if located) */}
                    {userGpsPos && (
                        <Marker
                            position={userGpsPos}
                            icon={createTacticalMarker('RESCUE', 'RESCUE_EN_ROUTE', 'YOU')}
                        >
                            <Popup>
                                <div className="font-data text-xs p-1">
                                    <div className="font-bold text-[var(--safety-cyan)]">📍 Your Real GPS Location</div>
                                    <div className="text-[0.65rem] text-[var(--text-muted)] mt-0.5">
                                        Lat: {userGpsPos[0].toFixed(5)}, Lng: {userGpsPos[1].toFixed(5)}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    )}

                    {/* Geofence Zones */}
                    {showGeofences && geofences.map((gf) => {
                        let strokeColor = '#00E5FF';
                        let fillColor = '#00E5FF20';

                        if (gf.type === 'DANGER' || gf.type === 'RESTRICTED') {
                            strokeColor = '#EF4444';
                            fillColor = '#EF444425';
                        } else if (gf.type === 'CAUTION') {
                            strokeColor = '#F59E0B';
                            fillColor = '#F59E0B20';
                        }

                        return (
                            <Circle
                                key={gf.id}
                                center={[gf.lat, gf.lng]}
                                radius={gf.radius || 200}
                                pathOptions={{
                                    color: strokeColor,
                                    fillColor: fillColor,
                                    fillOpacity: 0.35,
                                    weight: 1.5,
                                    dashArray: gf.type === 'RESTRICTED' ? '6, 6' : undefined
                                }}
                            >
                                <Popup>
                                    <div className="font-data text-xs p-1">
                                        <div className="font-bold text-[var(--text-primary)] flex items-center justify-between">
                                            <span>{gf.name}</span>
                                            <span className="text-[0.62rem] px-1 py-0.2 rounded bg-black/40" style={{ color: strokeColor }}>
                                                {gf.type}
                                            </span>
                                        </div>
                                        <div className="text-[0.65rem] text-[var(--text-muted)] mt-1">
                                            Zone Policy: {gf.description || 'Monitored Industrial Corridor'}
                                        </div>
                                    </div>
                                </Popup>
                            </Circle>
                        );
                    })}

                    {/* Active Hazards / Environmental Anomalies */}
                    {showHazards && hazards.map((h) => (
                        <Circle
                            key={h.id}
                            center={[h.lat, h.lng]}
                            radius={h.radius || 120}
                            pathOptions={{
                                color: '#EF4444',
                                fillColor: '#EF4444',
                                fillOpacity: 0.25,
                                weight: 1.5,
                                dashArray: '4, 4'
                            }}
                        >
                            <Popup>
                                <div className="font-data text-xs p-1">
                                    <div className="font-bold text-[var(--safety-red)] flex items-center gap-1">
                                        <Flame className="w-3.5 h-3.5" />
                                        <span>HAZARD: {h.type}</span>
                                    </div>
                                    <div className="text-[0.68rem] text-[var(--text-primary)] mt-1 font-semibold">
                                        Severity: {h.severity} // {h.zone || 'Sector'}
                                    </div>
                                    <div className="text-[0.65rem] text-[var(--text-muted)] mt-0.5">
                                        {h.description || 'Elevated gas and thermal threat.'}
                                    </div>
                                </div>
                            </Popup>
                        </Circle>
                    ))}

                    {/* Safe Evacuation Exits */}
                    {showExits && SAFE_EXITS.map((exit) => (
                        <Marker
                            key={exit.id}
                            position={[exit.lat, exit.lng]}
                            icon={createTacticalMarker('EXIT', 'SAFE', exit.id)}
                        >
                            <Popup>
                                <div className="font-data text-xs p-1">
                                    <div className="font-bold text-[var(--safety-green)]">
                                        🚪 {exit.name}
                                    </div>
                                    <div className="text-[0.65rem] text-[var(--text-muted)] mt-0.5">
                                        Muster Portal Status: <strong className="text-[var(--safety-green)]">OPEN & PRESSURIZED</strong>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    {/* Evacuation Route Polyline */}
                    {evacuationRoute && showRoutes && (
                        <Polyline
                            positions={evacuationRoute.waypoints}
                            pathOptions={{
                                color: evacuationRoute.isRerouted ? '#F59E0B' : '#10B981',
                                weight: 3,
                                dashArray: '8, 8',
                                opacity: 0.9
                            }}
                        />
                    )}

                    {/* Active Workers */}
                    {workers.map((worker) => {
                        const isCritical = worker.status === 'CRITICAL';
                        const isWarning = worker.status === 'WARNING';
                        const isRescueEnRoute = worker.status === 'RESCUE_EN_ROUTE';

                        return (
                            <Marker
                                key={worker.workerId}
                                position={[worker.lat || 51.505, worker.lng || -0.09]}
                                icon={createTacticalMarker('WORKER', worker.status, worker.workerId)}
                                eventHandlers={{
                                    click: () => {
                                        soundService.playClick();
                                        onSelectWorker(worker);
                                    }
                                }}
                            >
                                <Popup>
                                    <div className="font-data text-xs p-2 min-w-[210px]">
                                        <div className="flex items-center justify-between border-b border-[var(--grid-line)] pb-1.5 mb-1.5">
                                            <div>
                                                <div className="font-bold text-xs text-[var(--text-primary)]">
                                                    {worker.name}
                                                </div>
                                                <div className="text-[0.65rem] text-[var(--safety-cyan)]">
                                                    {worker.workerId} • {worker.zone}
                                                </div>
                                            </div>
                                            <span
                                                className={`text-[0.62rem] font-bold px-1.5 py-0.5 rounded uppercase ${isRescueEnRoute
                                                    ? 'bg-[rgba(0,229,255,0.2)] text-[var(--safety-cyan)] border border-[var(--safety-cyan)]'
                                                    : isCritical
                                                        ? 'bg-[var(--safety-red)] text-white animate-pulse'
                                                        : isWarning
                                                            ? 'bg-[var(--safety-amber)] text-black'
                                                            : 'bg-[rgba(16,185,129,0.2)] text-[var(--safety-green)]'
                                                    }`}
                                            >
                                                {isRescueEnRoute ? '🚑 RESCUE EN ROUTE' : worker.status}
                                            </span>
                                        </div>

                                        {/* Telemetry Grid */}
                                        <div className="grid grid-cols-2 gap-1.5 text-[0.68rem] text-[var(--text-secondary)] mb-2">
                                            <div>Temp: <strong className="text-[var(--text-primary)]">{worker.envTemp || 32}°C</strong></div>
                                            <div>Gas: <strong className="text-[var(--text-primary)]">{worker.gasPpm || 12} PPM</strong></div>
                                            <div>HR: <strong className="text-[var(--text-primary)]">{worker.heartRate || 76} BPM</strong></div>
                                            <div>Power: <strong className="text-[var(--text-primary)]">{worker.battery || 85}%</strong></div>
                                        </div>

                                        {/* Location Coordinates */}
                                        <div className="text-[0.65rem] text-[var(--text-muted)] mb-2">
                                            GPS: <strong className="text-[var(--safety-cyan)]">{(worker.lat || 51.505).toFixed(4)}°N, {Math.abs(worker.lng || -0.09).toFixed(4)}°W</strong>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-1.5 pt-1.5 border-t border-[var(--grid-line)]">
                                            <button
                                                onClick={() => {
                                                    soundService.playClick();
                                                    onOpenDigitalTwin(worker);
                                                }}
                                                className="btn-tactical btn-tactical-primary text-[0.62rem] py-1 px-2 flex-1 text-center cursor-pointer"
                                            >
                                                DIGITAL TWIN
                                            </button>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}

                    {/* Responders */}
                    {showTeams && rescueTeams.map((team, idx) => (
                        <Marker
                            key={team.id || idx}
                            position={[51.507 + idx * 0.003, -0.088 - idx * 0.003]}
                            icon={createTacticalMarker('RESCUE', 'SAFE', team.id || `S-0${idx + 1}`)}
                        >
                            <Popup>
                                <div className="font-data text-xs p-1">
                                    <div className="font-bold text-[var(--safety-cyan)]">
                                        🛡️ {team.name}
                                    </div>
                                    <div className="text-[0.65rem] text-[var(--text-secondary)] mt-0.5">
                                        Lead: {team.lead} • Status: <strong className="text-[var(--safety-green)]">{team.status}</strong>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};

export default WorkerMap;
