import React, { useState } from 'react';
import { stations } from '../data/stations';
import { Route, MapPin, Zap, Battery, CheckCircle2 } from 'lucide-react';

const HYD_AREAS = ['Jubilee Hills', 'Hitech City', 'Gachibowli', 'Banjara Hills', 'Kondapur', 'Madhapur', 'Secunderabad', 'Financial District', 'Kukatpally', 'Miyapur', 'LB Nagar', 'Necklace Road'];

const TripsPage = () => {
    const [start, setStart] = useState('');
    const [dest, setDest] = useState('');
    const [range, setRange] = useState(250);
    const [battery, setBattery] = useState(80);
    const [planned, setPlanned] = useState(false);

    const handlePlan = (e) => {
        e.preventDefault();
        setPlanned(true);
    };

    // Simulate stops
    const stops = planned ? stations
        .filter(s => s.status === 'available')
        .slice(0, battery < 50 ? 3 : 2)
        .map((s, i) => ({
            ...s,
            chargeDuration: Math.round((80 - (i === 0 ? battery : 20)) * 0.6),
            addedRange: Math.round(((80 - (i === 0 ? battery : 20)) / 100) * range),
            cost: (((80 - (i === 0 ? battery : 20)) / 100) * 60 * s.price).toFixed(0),
        })) : [];

    const totalCost = stops.reduce((sum, s) => sum + parseInt(s.cost), 0);
    const totalTime = stops.reduce((sum, s) => sum + s.chargeDuration, 0);

    return (
        <div className="page-container" style={{ maxWidth: 700 }}>
            <div style={{ padding: '0 8px' }}>
                <h1 style={{ fontSize: 28, marginBottom: 4 }}>Trip Planner</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Plan your EV road trip with optimal charging stops.</p>

                <div className="vc-card" style={{ padding: 24, marginBottom: 20 }}>
                    <form onSubmit={handlePlan} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>START LOCATION</label>
                                <div style={{ position: 'relative' }}>
                                    <MapPin size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--accent)' }} />
                                    <select value={start} onChange={e => setStart(e.target.value)} required className="vc-input" style={{ paddingLeft: 36, padding: '10px 12px 10px 36px' }}>
                                        <option value="">Select start</option>
                                        {HYD_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>DESTINATION</label>
                                <div style={{ position: 'relative' }}>
                                    <MapPin size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--status-red)' }} />
                                    <select value={dest} onChange={e => setDest(e.target.value)} required className="vc-input" style={{ paddingLeft: 36, padding: '10px 12px 10px 36px' }}>
                                        <option value="">Select destination</option>
                                        {HYD_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>VEHICLE RANGE: {range} km</label>
                            <input type="range" min={100} max={500} step={10} value={range} onChange={e => setRange(Number(e.target.value))}
                                style={{ width: '100%', accentColor: 'var(--accent)' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                                <span>100 km</span><span>500 km</span>
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>CURRENT BATTERY: {battery}%</label>
                            <input type="range" min={5} max={100} step={5} value={battery} onChange={e => setBattery(Number(e.target.value))}
                                style={{ width: '100%', accentColor: battery < 20 ? '#F44336' : battery < 40 ? '#FF9800' : '#00E676' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                                <span style={{ color: '#F44336' }}>5%</span><span style={{ color: '#00E676' }}>100%</span>
                            </div>
                        </div>

                        <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '14px' }}>
                            <Route size={18} /> Plan My Trip
                        </button>
                    </form>
                </div>

                {planned && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* Summary */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                            {[
                                { label: 'Charging Stops', value: stops.length },
                                { label: 'Total Charge Time', value: `${totalTime} min` },
                                { label: 'Total Cost', value: `₹${totalCost}` },
                            ].map(({ label, value }) => (
                                <div key={label} className="vc-card" style={{ padding: '16px', textAlign: 'center' }}>
                                    <div style={{ fontSize: 24, fontFamily: 'Rajdhani', fontWeight: 700, color: 'var(--accent)' }}>{value}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Route */}
                        <div className="vc-card" style={{ padding: 20 }}>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 16 }}>RECOMMENDED ROUTE</p>

                            {/* Start */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,230,118,0.2)', border: '2px solid #00E676', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: '#00E676' }}>S</span>
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600 }}>{start}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Battery: {battery}%</div>
                                </div>
                            </div>

                            {stops.map((stop, i) => (
                                <div key={stop.id}>
                                    <div style={{ width: 2, height: 24, background: 'var(--bg-border)', marginLeft: 15, marginBottom: 8 }} />
                                    <div className="vc-card" style={{ padding: 14, marginBottom: 8, borderColor: 'rgba(41,121,255,0.3)' }}>
                                        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-glow)', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <Zap size={14} color="var(--accent)" />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600, marginBottom: 2 }}>{stop.name}</div>
                                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{stop.area} · ₹{stop.price}/kWh</div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>⏱ {stop.chargeDuration} min charge</span>
                                                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>⚡ +{stop.addedRange} km range</span>
                                                    <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>₹{stop.cost}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div style={{ width: 2, height: 24, background: 'var(--bg-border)', marginLeft: 15, marginBottom: 8 }} />
                            {/* Destination */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(244,67,54,0.2)', border: '2px solid #F44336', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: '#F44336' }}>D</span>
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600 }}>{dest}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Destination</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TripsPage;
