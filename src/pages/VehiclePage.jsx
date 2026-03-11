import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Battery, Zap, Map as MapIcon, CheckCircle2, ChevronRight, ArrowLeft, Gauge, Plug } from 'lucide-react';
import { VEHICLES, BRANDS, modelsForBrand } from '../data/vehicles';
import { useVehicle } from '../context/VehicleContext';

// ─── Brand colour map ─────────────────────────────────────────────────────────
const BRAND_COLOR = {
    Tata: '#1566C0', MG: '#E30613', Mahindra: '#CC0000', BYD: '#1B1B5E',
    Hyundai: '#002C5F', Kia: '#05141F', Citroen: '#CC0000', BMW: '#0066B1',
    Mercedes: '#222', Audi: '#BB0A30', Volvo: '#1C3F6E', Porsche: '#C0A868',
    MINI: '#1C1C1C', Nissan: '#C00', Piaggio: '#FE5000',
    Ather: '#00C77B', Ola: '#222', TVS: '#E31E24', Bajaj: '#0C2340', Hero: '#CC0000',
};

// Connector pill colour
const connColor = (c) => {
    if (c === 'CCS2') return { bg: '#EEF2FF', color: '#3730A3' };
    if (c === 'CHAdeMO') return { bg: '#FEF9C3', color: '#854D0E' };
    if (c === 'Type 2') return { bg: '#F0FDF4', color: '#166534' };
    return { bg: '#F5F5F5', color: '#555' };
};

// Vehicle type emoji
const typeEmoji = (t) => ({ Car: '🚗', '2-Wheeler': '🛵', '3-Wheeler': '🛺', Commercial: '🚐' }[t] || '🚗');

// ─── Brand Pill ───────────────────────────────────────────────────────────────
const BrandPill = ({ brand, selected, onClick }) => {
    const color = BRAND_COLOR[brand] || '#2979FF';
    return (
        <button onClick={() => onClick(brand)} style={{
            padding: '10px 18px', borderRadius: 24, border: selected ? `2px solid ${color}` : '1.5px solid var(--bg-border)',
            background: selected ? `${color}15` : 'var(--bg-card)', color: selected ? color : 'var(--text-secondary)',
            fontWeight: selected ? 700 : 500, fontSize: 14, cursor: 'pointer', transition: 'all 0.18s',
            boxShadow: selected ? `0 2px 12px ${color}30` : 'none',
        }}>
            {brand}
        </button>
    );
};

// ─── Model Card ───────────────────────────────────────────────────────────────
const ModelCard = ({ vehicle, selected, onClick }) => {
    const color = BRAND_COLOR[vehicle.brand] || '#2979FF';
    const conn = connColor(vehicle.connector_type);
    return (
        <button onClick={() => onClick(vehicle)} style={{
            textAlign: 'left', padding: '16px', borderRadius: 14, width: '100%',
            border: selected ? `2px solid ${color}` : '1.5px solid var(--bg-border)',
            background: selected ? `${color}08` : 'var(--bg-card)',
            boxShadow: selected ? `0 4px 16px ${color}20` : 'none',
            cursor: 'pointer', transition: 'all 0.18s',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2, color: 'var(--text-primary)' }}>
                        {typeEmoji(vehicle.vehicle_type)} {vehicle.model}
                    </div>
                    <span style={{ fontSize: 11, background: conn.bg, color: conn.color, padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
                        {vehicle.connector_type}
                    </span>
                </div>
                {selected && <CheckCircle2 size={20} color={color} />}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                    <Battery size={13} color={color} /> {vehicle.battery_kwh} kWh
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                    <Gauge size={13} color={color} /> {vehicle.range_km} km
                </div>
            </div>
        </button>
    );
};

// ─── Selected Vehicle Summary Card ────────────────────────────────────────────
const VehicleSummaryCard = ({ vehicle, onClear }) => {
    const color = BRAND_COLOR[vehicle.brand] || '#2979FF';
    const conn = connColor(vehicle.connector_type);
    return (
        <div style={{
            border: `2px solid ${color}`, borderRadius: 18, overflow: 'hidden',
            background: `linear-gradient(135deg, var(--bg-card) 60%, ${color}12)`,
            boxShadow: `0 8px 32px ${color}25`,
        }}>
            <div style={{ padding: '20px 20px 16px', background: `${color}10`, borderBottom: `1px solid ${color}20` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
                        {typeEmoji(vehicle.vehicle_type)}
                    </div>
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: '0.07em', textTransform: 'uppercase' }}>{vehicle.brand}</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>{vehicle.model}</div>
                    </div>
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--bg-border)' }}>
                {[
                    { icon: Battery, label: 'Battery', val: `${vehicle.battery_kwh} kWh`, c: color },
                    { icon: Gauge, label: 'Range', val: `${vehicle.range_km} km`, c: color },
                    { icon: Plug, label: 'Connector', val: vehicle.connector_type, c: conn.color },
                ].map(({ icon: Icon, label, val, c }) => (
                    <div key={label} style={{ padding: '14px 10px', textAlign: 'center', background: 'var(--bg-card)' }}>
                        <Icon size={17} color={c} style={{ marginBottom: 4 }} />
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{val}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const VehiclePage = () => {
    const navigate = useNavigate();
    const { selectedVehicle, setVehicle, clearVehicle } = useVehicle();

    const [selectedBrand, setSelectedBrand] = useState(selectedVehicle?.brand || null);
    const [pendingVehicle, setPendingVehicle] = useState(selectedVehicle || null);
    const [saved, setSaved] = useState(!!selectedVehicle);

    const models = selectedBrand ? modelsForBrand(selectedBrand) : [];
    const TYPES = [...new Set(VEHICLES.map(v => v.vehicle_type))];

    const handleBrandClick = (brand) => {
        setSelectedBrand(brand);
        setPendingVehicle(null);
        setSaved(false);
    };

    const handleModelClick = (vehicle) => {
        setPendingVehicle(vehicle);
        setSaved(false);
    };

    const handleSave = () => {
        if (!pendingVehicle) return;
        setVehicle(pendingVehicle);
        setSaved(true);
    };

    const handleClear = () => {
        clearVehicle();
        setPendingVehicle(null);
        setSelectedBrand(null);
        setSaved(false);
    };

    return (
        <div className="page-container" style={{ maxWidth: 720 }}>
            <div style={{ padding: '0 8px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                    <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, display: 'flex' }}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: 24, margin: 0, fontWeight: 800 }}>My EV Vehicle</h1>
                        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>Select your EV to get personalised charging recommendations</p>
                    </div>
                </div>

                {/* Current vehicle summary */}
                {selectedVehicle && (
                    <div style={{ marginBottom: 24, marginTop: 16 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: 10 }}>CURRENT VEHICLE</div>
                        <VehicleSummaryCard vehicle={selectedVehicle} />
                        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                            <button onClick={() => navigate('/map')} style={{ flex: 1, padding: '11px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 14px rgba(41,121,255,0.3)' }}>
                                <MapIcon size={16} /> Filter Matching Stations
                            </button>
                            <button onClick={handleClear} style={{ padding: '11px 16px', background: 'rgba(244,67,54,0.08)', color: '#F44336', border: '1px solid rgba(244,67,54,0.2)', borderRadius: 12, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                                Remove
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 1 – Select Brand */}
                <div className="vc-card" style={{ padding: '20px', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: 13, color: '#fff', fontWeight: 700 }}>1</span>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>Select Brand</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {BRANDS.map(b => (
                            <BrandPill key={b} brand={b} selected={selectedBrand === b} onClick={handleBrandClick} />
                        ))}
                    </div>
                </div>

                {/* Step 2 – Select Model */}
                {selectedBrand && (
                    <div className="vc-card" style={{ padding: '20px', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: 13, color: '#fff', fontWeight: 700 }}>2</span>
                            </div>
                            <span style={{ fontWeight: 700, fontSize: 15 }}>Select {selectedBrand} Model</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {models.map(v => (
                                <ModelCard key={v.model} vehicle={v} selected={pendingVehicle?.model === v.model && pendingVehicle?.brand === v.brand} onClick={handleModelClick} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Vehicle preview + save */}
                {pendingVehicle && (
                    <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: 10 }}>SELECTED VEHICLE</div>
                        <VehicleSummaryCard vehicle={pendingVehicle} />
                        <button
                            onClick={handleSave}
                            disabled={saved}
                            style={{
                                marginTop: 14, width: '100%', padding: '13px', borderRadius: 12, border: 'none',
                                background: saved ? 'rgba(16,185,129,0.12)' : 'linear-gradient(90deg,#2979FF,#00B0FF)',
                                color: saved ? '#10B981' : '#fff', fontWeight: 700, fontSize: 15,
                                cursor: saved ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                boxShadow: saved ? 'none' : '0 4px 16px rgba(41,121,255,0.3)', transition: 'all 0.2s',
                            }}
                        >
                            {saved ? <><CheckCircle2 size={18} /> Vehicle Saved!</> : <><Car size={18} /> Save Vehicle Profile</>}
                        </button>
                        {saved && (
                            <button onClick={() => navigate('/map')} style={{ marginTop: 10, width: '100%', padding: '12px', borderRadius: 12, background: 'rgba(41,121,255,0.08)', color: 'var(--accent)', border: '1px solid rgba(41,121,255,0.2)', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                <MapIcon size={16} /> Filter Stations for My EV <ChevronRight size={16} />
                            </button>
                        )}
                    </div>
                )}

                {/* Browse all vehicles by type */}
                <div className="vc-card" style={{ padding: '20px' }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Vehicle Types Available</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                        {TYPES.map(type => {
                            const count = VEHICLES.filter(v => v.vehicle_type === type).length;
                            return (
                                <div key={type} style={{ padding: '12px 14px', borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--bg-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ fontSize: 22 }}>{typeEmoji(type)}</span>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 13 }}>{type}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{count} models</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VehiclePage;
