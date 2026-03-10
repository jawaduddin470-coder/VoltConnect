import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStationById } from '../data/stations';
import {
    ArrowLeft, MapPin, Zap, Star, Clock, Navigation,
    AlertTriangle, Coffee, Utensils, ShoppingBag, Droplets,
    CheckCircle, Upload, X
} from 'lucide-react';

const STATUS_COLORS = { available: '#00E676', busy: '#FF9800', faulty: '#F44336' };
const AMENITY_ICONS = { Cafe: Coffee, Restaurant: Utensils, Shopping: ShoppingBag, Restroom: Droplets, 'Shopping Mall': ShoppingBag, 'Shopping Center': ShoppingBag, 'Convenience Store': ShoppingBag, 'Supermarket': ShoppingBag };

const StationDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const station = getStationById(id);
    const [inQueue, setInQueue] = useState(false);
    const [showFaultForm, setShowFaultForm] = useState(false);
    const [faultType, setFaultType] = useState('');
    const [faultDesc, setFaultDesc] = useState('');
    const [severity, setSeverity] = useState('medium');
    const [faultSubmitted, setFaultSubmitted] = useState(false);

    if (!station) return (
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - var(--nav-height))' }}>
            <div style={{ textAlign: 'center', padding: '0 16px' }}>
                <h2>Station not found</h2>
                <button onClick={() => navigate('/map')} className="btn-primary" style={{ marginTop: 16 }}>Back to Map</button>
            </div>
        </div>
    );

    const color = STATUS_COLORS[station.status];
    const prediction = station.queue > 0 ? `~${station.queue * 8} minutes` : 'Available now!';

    const handleFaultSubmit = (e) => {
        e.preventDefault();
        setFaultSubmitted(true);
        setTimeout(() => { setShowFaultForm(false); setFaultSubmitted(false); }, 3000);
    };

    return (
        <div className="page-container" style={{ maxWidth: 680 }}>
            <div style={{ padding: '0 8px' }}>
                {/* Back */}
                <button onClick={() => navigate('/map')}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14, marginBottom: 20, padding: '4px 0' }}>
                    <ArrowLeft size={16} /> Back to Map
                </button>

                {/* Header card */}
                <div className="vc-card" style={{ padding: 24, marginBottom: 16, borderColor: `${color}40` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                        <div>
                            <h1 style={{ fontSize: 24, marginBottom: 4 }}>{station.name}</h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 14 }}>
                                <MapPin size={13} /> {station.area}, Hyderabad
                            </div>
                        </div>
                        <span className={`badge-${station.status}`} style={{ fontSize: 13, padding: '5px 14px' }}>{station.status}</span>
                    </div>

                    {/* Stats row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                        {[
                            { label: 'Price', value: `₹${station.price}/kWh`, icon: Zap },
                            { label: 'Queue', value: station.queue === 0 ? 'No wait' : `${station.queue} ahead`, icon: Clock },
                            { label: 'Reliability', value: `${station.reliability}%`, icon: Star },
                        ].map(({ label, value, icon: Icon }) => (
                            <div key={label} style={{ background: 'var(--bg-primary)', borderRadius: 12, padding: '12px', textAlign: 'center' }}>
                                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Rajdhani' }}>{value}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Connector types */}
                    <div style={{ marginBottom: 16 }}>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8 }}>CONNECTOR TYPES</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {station.connectors.map(c => (
                                <span key={c} style={{ background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid rgba(41,121,255,0.3)', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 600 }}>{c}</span>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--text-secondary)' }}>
                        <Zap size={14} color="var(--accent)" /> {station.speed}
                    </div>
                </div>

                {/* Prediction */}
                <div className="vc-card" style={{ padding: 18, marginBottom: 16, background: 'linear-gradient(135deg, rgba(41,121,255,0.1), rgba(0,180,216,0.06))' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(41,121,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Clock size={18} color="var(--accent)" />
                        </div>
                        <div>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 2 }}>AVAILABILITY PREDICTION</p>
                            <p style={{ fontSize: 15, fontWeight: 600 }}>Next charger expected free in {prediction}</p>
                        </div>
                    </div>
                </div>

                {/* EV Range Safety */}
                <div className="vc-card" style={{ padding: 18, marginBottom: 16 }}>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 10 }}>EV RANGE SAFETY INDICATOR</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {[{ label: 'Short Range', sub: '0–50 km', color: '#00E676' }, { label: 'Medium Range', sub: '50–150 km', color: '#FF9800' }, { label: 'Long Range', sub: '150+ km', color: '#F44336' }].map(({ label, sub, color: c }) => (
                            <div key={label} style={{ flex: 1, borderRadius: 10, padding: '10px 8px', textAlign: 'center', background: `${c}15`, border: `1px solid ${c}30` }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: c, margin: '0 auto 6px' }} />
                                <div style={{ fontSize: 12, fontWeight: 600, color: c }}>{label}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Amenities */}
                <div className="vc-card" style={{ padding: 18, marginBottom: 16 }}>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 12 }}>NEARBY AMENITIES</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {station.amenities.map(a => {
                            const Icon = AMENITY_ICONS[a] || MapPin;
                            return (
                                <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-primary)', borderRadius: 10, padding: '8px 12px', fontSize: 13 }}>
                                    <Icon size={14} color="var(--text-secondary)" />
                                    <span style={{ color: 'var(--text-secondary)' }}>{a}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                    <button onClick={() => setInQueue(!inQueue)} className={inQueue ? 'btn-outline' : 'btn-primary'} style={{ justifyContent: 'center' }}>
                        <Clock size={16} /> {inQueue ? 'Leave Queue' : 'Join Queue'}
                    </button>
                    <button className="btn-outline" style={{ justifyContent: 'center' }}>
                        <Navigation size={16} /> Navigate
                    </button>
                </div>

                {inQueue && (
                    <div className="vc-card" style={{ padding: 16, marginBottom: 16, border: '1px solid rgba(0,230,118,0.3)', background: 'rgba(0,230,118,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <CheckCircle size={18} color="#00E676" />
                            <div>
                                <p style={{ fontWeight: 600, color: '#00E676' }}>You're in the queue!</p>
                                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Estimated wait: {prediction}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Fault report */}
                <button onClick={() => setShowFaultForm(!showFaultForm)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 12, border: '1.5px solid rgba(244,67,54,0.4)', background: 'transparent', color: '#F44336', cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'all 0.2s' }}>
                    <AlertTriangle size={16} /> Report a Fault
                </button>

                {showFaultForm && !faultSubmitted && (
                    <div className="vc-card" style={{ padding: 20, marginTop: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 style={{ fontSize: 17 }}>Report Fault</h3>
                            <button onClick={() => setShowFaultForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleFaultSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div>
                                <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>ISSUE TYPE</label>
                                <select value={faultType} onChange={e => setFaultType(e.target.value)} required className="vc-input" style={{ padding: '10px 12px' }}>
                                    <option value="">Select issue type</option>
                                    <option>Charger not working</option>
                                    <option>Cable damaged</option>
                                    <option>Payment issue</option>
                                    <option>Occupied by non-EV vehicle</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>SEVERITY</label>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {['low', 'medium', 'high'].map(s => (
                                        <button key={s} type="button" onClick={() => setSeverity(s)}
                                            style={{ flex: 1, padding: '8px', borderRadius: 8, border: `1.5px solid ${severity === s ? (s === 'high' ? '#F44336' : s === 'medium' ? '#FF9800' : '#00E676') : 'var(--bg-border)'}`, background: 'transparent', color: severity === s ? (s === 'high' ? '#F44336' : s === 'medium' ? '#FF9800' : '#00E676') : 'var(--text-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>DESCRIPTION</label>
                                <textarea value={faultDesc} onChange={e => setFaultDesc(e.target.value)} className="vc-input" placeholder="Describe the issue..." rows={3} style={{ resize: 'none' }} />
                            </div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', border: '1.5px dashed var(--bg-border)', borderRadius: 10, cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)' }}>
                                <Upload size={16} /> Upload photo (optional)
                                <input type="file" accept="image/*" style={{ display: 'none' }} />
                            </label>
                            <button type="submit" className="btn-primary" style={{ justifyContent: 'center', background: '#F44336', boxShadow: 'none' }}>Submit Report</button>
                        </form>
                    </div>
                )}

                {faultSubmitted && (
                    <div className="vc-card" style={{ padding: 16, marginTop: 12, border: '1px solid rgba(0,230,118,0.3)', background: 'rgba(0,230,118,0.08)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <CheckCircle size={20} color="#00E676" />
                            <div>
                                <p style={{ fontWeight: 600, color: '#00E676' }}>Report Submitted!</p>
                                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Thank you. Our team will review it shortly.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StationDetailsPage;
