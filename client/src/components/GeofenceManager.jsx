import React, { useState } from 'react';
import { Shield, PlusCircle, Trash2, MapPin, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const GeofenceManager = ({ geofences = [], onAddGeofence, onRemoveGeofence, onClose }) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [type, setType] = useState('RESTRICTED');
    const [radius, setRadius] = useState(100);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name) return;

        const newGeo = {
            id: `GEO-${Date.now().toString().slice(-4)}`,
            name,
            type,
            lat: 51.505 + (Math.random() - 0.5) * 0.01,
            lng: -0.09 + (Math.random() - 0.5) * 0.01,
            radius: Number(radius),
            color: type === 'SAFE' ? '#6BCB77' : type === 'RESTRICTED' ? '#FF5C5C' : '#FFB454',
            description: `Configured active ${type.toLowerCase()} perimeter.`
        };

        onAddGeofence(newGeo);
        setName('');
    };

    return (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-[rgba(10,16,20,0.85)] backdrop-blur-md">
            <div className="glass-panel w-full max-w-xl p-6 rounded border-2 border-[var(--brass)] shadow-[0_10px_40px_rgba(0,0,0,0.9)] bg-[var(--bg-panel-elevated)] max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-[var(--chart-line)] pb-3 mb-4">
                    <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-[var(--brass)]" />
                        <h3 className="font-display font-bold text-base text-[var(--parchment-bright)]">
                            {t("Geofence & Site Perimeter Manager")}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded border border-[var(--chart-line)] hover:border-[var(--radar-red)] text-[var(--muted)] hover:text-[var(--radar-red)]"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Geofence List */}
                <div className="space-y-2.5 mb-6 max-h-52 overflow-y-auto pr-1">
                    {geofences.map(g => (
                        <div key={g.id} className="p-3 rounded bg-[var(--bg-void)] border border-[var(--chart-line)] flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span
                                        className="w-2.5 h-2.5 rounded-full"
                                        style={{ backgroundColor: g.color }}
                                    ></span>
                                    <strong className="text-xs font-body text-[var(--parchment-bright)]">{g.name}</strong>
                                    <span className="font-data text-[0.65rem] text-[var(--muted)]">({g.type})</span>
                                </div>
                                <p className="font-data text-[0.7rem] text-[var(--muted)]">Radius: {g.radius}m • {g.description}</p>
                            </div>
                            <button
                                onClick={() => onRemoveGeofence(g.id)}
                                className="p-1.5 text-[var(--muted)] hover:text-[var(--radar-red)] transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Add New Geofence */}
                <form onSubmit={handleSubmit} className="pt-3 border-t border-[var(--chart-line)] space-y-3">
                    <span className="font-data text-xs uppercase tracking-wider text-[var(--brass)] font-bold block">
                        Define New Zone Perimeter
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-data text-xs">
                        <input
                            type="text"
                            placeholder="Zone Name (e.g. Shaft B Exit)"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-[var(--bg-void)] border border-[var(--chart-line)] rounded px-3 py-2 text-[var(--parchment)] focus:outline-none focus:border-[var(--brass)] sm:col-span-2"
                            required
                        />
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="bg-[var(--bg-void)] border border-[var(--chart-line)] rounded px-2 py-2 text-[var(--parchment)] focus:outline-none focus:border-[var(--brass)]"
                        >
                            <option value="RESTRICTED">RESTRICTED</option>
                            <option value="SAFE">SAFE MUSTER</option>
                            <option value="HIGH_RISK">HIGH RISK</option>
                        </select>
                    </div>
                    <div className="flex justify-between items-center">
                        <label className="font-data text-xs text-[var(--muted)]">
                            Perimeter Radius: <strong className="text-[var(--parchment)]">{radius}m</strong>
                        </label>
                        <input
                            type="range"
                            min="50"
                            max="300"
                            value={radius}
                            onChange={(e) => setRadius(e.target.value)}
                            className="w-40"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2.5 rounded bg-[var(--brass)] text-[var(--bg-void)] font-data font-bold text-xs uppercase hover:bg-[var(--phosphor-amber)] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_10px_var(--brass-glow)]"
                    >
                        <PlusCircle className="w-4 h-4" /> Save Geofence Perimeter
                    </button>
                </form>
            </div>
        </div>
    );
};

export default GeofenceManager;
