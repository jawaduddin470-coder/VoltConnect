import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import {
    Clock, Zap, CheckCircle, MapPin, ArrowRight, Navigation,
    Wifi, WifiOff, AlertCircle, Loader2, Plug
} from 'lucide-react';

// ─── Availability indicator ───────────────────────────────────────────────────
const StatusDot = ({ status }) => {
    const cfg = {
        available: { color: '#00E676', label: 'Available', bg: 'rgba(0,230,118,0.12)' },
        busy: { color: '#FF9800', label: 'Busy', bg: 'rgba(255,152,0,0.12)' },
        faulty: { color: '#F44336', label: 'Faulty', bg: 'rgba(244,67,54,0.12)' },
    }[status] || { color: '#aaa', label: status, bg: 'rgba(170,170,170,0.1)' };

    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
            background: cfg.bg, color: cfg.color,
        }}>
            <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: cfg.color,
                boxShadow: `0 0 6px ${cfg.color}`,
                display: 'inline-block',
                animation: status === 'available' ? 'pulse-dot 2s infinite' : 'none',
            }} />
            {cfg.label}
        </span>
    );
};

// ─── Wait time badge ──────────────────────────────────────────────────────────
const WaitBadge = ({ queue, chargers }) => {
    const w = Math.round((queue * 30) / Math.max(1, chargers));
    if (queue === 0) return (
        <div style={{ fontSize: 13, fontWeight: 700, color: '#00E676' }}>No wait</div>
    );
    const color = w > 30 ? '#F44336' : w > 15 ? '#FF9800' : '#00E676';
    return (
        <div style={{
            display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
            background: `${color}18`, borderRadius: 10, padding: '4px 10px',
        }}>
            <span style={{ fontSize: 15, fontWeight: 800, color }}>~{w}m</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{queue} in queue</span>
        </div>
    );
};

// Haversine formula for distance
const getDistKM = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ─── Main Component ───────────────────────────────────────────────────────────
const QueuePage = () => {
    const navigate = useNavigate();
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userPos, setUserPos] = useState(null);
    const [selectedStation, setSelectedStation] = useState(null);
    const [position, setPosition] = useState(null);
    const [joined, setJoined] = useState(false);
    const [ready, setReady] = useState(false);
    const [seconds, setSeconds] = useState(0);

    // Fetch real stations from Firestore
    useEffect(() => {
        const load = async () => {
            try {
                const snap = await getDocs(query(collection(db, 'stations'), limit(500)));
                const parsed = [];
                snap.forEach(doc => {
                    const d = doc.data();
                    if (d.latitude && d.longitude) {
                        const rand = Math.random();
                        const status = rand > 0.85 ? 'faulty' : rand > 0.55 ? 'busy' : 'available';
                        parsed.push({
                            id: doc.id,
                            name: d.name || 'EV Charging Station',
                            area: d.city || 'Hyderabad',
                            address: d.address || '',
                            lat: d.latitude,
                            lng: d.longitude,
                            status,
                            connectors: d.connectors || ['Type 2'],
                            numChargers: d.num_chargers || 1,
                            operator: d.operator || '',
                            maxKW: d.power_kw || 0,
                            queue: Math.floor(Math.random() * 5),
                        });
                    }
                });
                setStations(parsed);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
        navigator.geolocation?.getCurrentPosition(pos => {
            setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        }, () => setUserPos({ lat: 17.385, lng: 78.4867 }));
    }, []);

    const availableStations = useMemo(() => {
        const list = stations.filter(s => s.status !== 'faulty');
        if (!userPos) return list.slice(0, 10);
        return list
            .map(s => ({ ...s, distKM: getDistKM(userPos.lat, userPos.lng, s.lat, s.lng) }))
            .sort((a, b) => a.distKM - b.distKM)
            .slice(0, 10);
    }, [stations, userPos]);

    const handleJoin = (station) => {
        setSelectedStation(station);
        setPosition(station.queue + 1);
        setJoined(true);
        setSeconds(0);
        setReady(false);
    };

    useEffect(() => {
        if (!joined || ready) return;
        const interval = setInterval(() => {
            setSeconds(s => s + 1);
            if (seconds > 0 && seconds % 10 === 0) {
                setPosition(p => {
                    if (p <= 1) { setReady(true); return 1; }
                    return p - 1;
                });
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [joined, ready, seconds]);

    const handleLeave = () => {
        setJoined(false); setSelectedStation(null);
        setPosition(null); setReady(false); setSeconds(0);
    };

    return (
        <div className="page-container" style={{ maxWidth: 700 }}>
            <style>{`
                @keyframes pulse-dot {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
                .queue-card {
                    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
                }
                .queue-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 28px rgba(41,121,255,0.12);
                    border-color: rgba(41,121,255,0.3) !important;
                }
            `}</style>

            <div style={{ padding: '0 8px' }}>
                <h1 style={{ fontSize: 28, marginBottom: 4 }}>Virtual Queue</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                    Join a charger queue remotely and get notified when ready.
                </p>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200, flexDirection: 'column', gap: 12, color: 'var(--text-muted)' }}>
                        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
                        <span>Loading stations…</span>
                    </div>
                ) : !joined ? (
                    <>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 12, letterSpacing: '0.08em' }}>
                            NEARBY STATIONS — SELECT TO JOIN
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {availableStations.map(s => (
                                <div
                                    key={s.id}
                                    className="vc-card queue-card"
                                    style={{ padding: '16px 18px', borderRadius: 16, border: '1px solid var(--bg-border)' }}
                                >
                                    {/* Header row */}
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                                        <div style={{
                                            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                                            background: 'rgba(41,121,255,0.1)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <Zap size={20} color="var(--accent)" />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h3 style={{ margin: '0 0 3px', fontSize: 15, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {s.name}
                                            </h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                                                <MapPin size={11} />
                                                {s.area}
                                                {s.distKM != null && (
                                                    <span style={{ marginLeft: 4, color: 'var(--accent)', fontWeight: 600 }}>
                                                        · {s.distKM < 1 ? `${Math.round(s.distKM * 1000)}m` : `${s.distKM.toFixed(1)} km`} away
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <StatusDot status={s.status} />
                                    </div>

                                    {/* Detail chips */}
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                                        {s.maxKW > 0 && (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '3px 9px', background: 'rgba(41,121,255,0.1)', borderRadius: 8, color: 'var(--accent)', fontWeight: 600 }}>
                                                <Zap size={10} /> {s.maxKW} kW
                                            </span>
                                        )}
                                        {s.connectors.slice(0, 2).map(c => (
                                            <span key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '3px 9px', background: 'rgba(255,152,0,0.1)', borderRadius: 8, color: '#e65100', fontWeight: 600 }}>
                                                <Plug size={10} /> {c}
                                            </span>
                                        ))}
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '3px 9px', background: 'rgba(0,200,83,0.1)', borderRadius: 8, color: '#00c853', fontWeight: 600 }}>
                                            {s.numChargers} port{s.numChargers !== 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    {/* Bottom row: wait + buttons */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ marginRight: 'auto' }}>
                                            <WaitBadge queue={s.queue} chargers={s.numChargers} />
                                        </div>
                                        <button
                                            onClick={() => navigate(`/map`)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 5,
                                                padding: '8px 14px', background: 'transparent',
                                                color: 'var(--text-secondary)', border: '1px solid var(--bg-border)',
                                                borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                                transition: 'all 0.2s',
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--bg-border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                                        >
                                            <Navigation size={12} /> Navigate
                                        </button>
                                        <button
                                            onClick={() => handleJoin(s)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 5,
                                                padding: '8px 18px', background: 'var(--accent)',
                                                color: '#fff', border: 'none',
                                                borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                                                boxShadow: '0 4px 14px rgba(41,121,255,0.35)',
                                                transition: 'all 0.2s',
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                                        >
                                            <Clock size={12} /> Join Queue
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* Queue card */}
                        <div className="vc-card" style={{
                            padding: 32, textAlign: 'center',
                            borderColor: ready ? 'rgba(0,230,118,0.4)' : 'rgba(41,121,255,0.3)',
                            background: ready ? 'rgba(0,230,118,0.05)' : 'rgba(41,121,255,0.04)',
                            borderRadius: 20,
                        }}>
                            {ready ? (
                                <>
                                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(0,230,118,0.2)', border: '3px solid #00E676', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                        <CheckCircle size={38} color="#00E676" />
                                    </div>
                                    <h2 style={{ fontSize: 28, color: '#00E676', marginBottom: 8 }}>Your charger is ready!</h2>
                                    <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Please proceed to {selectedStation.name}</p>
                                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                                        <button className="btn-primary" onClick={handleLeave} style={{ padding: '12px 24px' }}>Done</button>
                                        <button className="btn-outline" onClick={() => navigate('/map')} style={{ padding: '12px 24px' }}>View on Map</button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 16 }}>YOUR POSITION</div>
                                    <div style={{
                                        width: 100, height: 100, borderRadius: '50%',
                                        border: '3px solid var(--accent)',
                                        background: 'var(--accent-glow)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        margin: '0 auto 16px',
                                        animation: 'pulse-glow 2s infinite',
                                    }}>
                                        <span style={{ fontSize: 40, fontFamily: 'Rajdhani', fontWeight: 700, color: 'var(--accent)' }}>#{position}</span>
                                    </div>
                                    <h2 style={{ fontSize: 22, marginBottom: 6 }}>{selectedStation.name}</h2>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{selectedStation.area}</p>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 24 }}>
                                        Estimated wait: <strong>{position <= 1 ? 'Almost ready!' : `~${(position - 1) * 8} minutes`}</strong>
                                    </p>
                                    <div style={{ background: 'var(--bg-border)', borderRadius: 8, height: 6, marginBottom: 20, overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%', borderRadius: 8, background: 'var(--accent)',
                                            width: `${Math.min(100, (seconds / (position * 10)) * 100)}%`,
                                            transition: 'width 1s linear',
                                        }} />
                                    </div>
                                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                                        <button onClick={handleLeave} className="btn-outline" style={{ padding: '10px 24px' }}>Leave Queue</button>
                                        <button onClick={() => navigate('/map')} className="btn-primary" style={{ padding: '10px 24px', display: 'flex', gap: 6, alignItems: 'center' }}>
                                            View on Map <ArrowRight size={15} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Queue timeline */}
                        {!ready && (
                            <div className="vc-card" style={{ padding: 20, borderRadius: 20 }}>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 16 }}>QUEUE PROGRESS</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {Array.from({ length: Math.min(5, selectedStation.queue + 2) }, (_, i) => i + 1).map(pos => (
                                        <div key={pos} style={{
                                            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10,
                                            background: pos < position ? 'rgba(0,230,118,0.08)' : pos === position ? 'var(--accent-glow)' : 'var(--bg-primary)',
                                            border: `1px solid ${pos < position ? 'rgba(0,230,118,0.2)' : pos === position ? 'rgba(41,121,255,0.3)' : 'transparent'}`,
                                        }}>
                                            <div style={{
                                                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                                                background: pos < position ? '#00E676' : pos === position ? 'var(--accent)' : 'var(--bg-border)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                {pos < position ? <CheckCircle size={14} color="#0A0C10" /> : <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>#{pos}</span>}
                                            </div>
                                            <span style={{ fontSize: 14, color: pos === position ? 'var(--accent)' : pos < position ? '#00E676' : 'var(--text-muted)', fontWeight: pos === position ? 600 : 400 }}>
                                                {pos === position ? 'You are here' : pos < position ? 'Charged ✓' : `Position #${pos}`}
                                            </span>
                                            {pos === position && <Zap size={14} color="var(--accent)" style={{ marginLeft: 'auto' }} />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QueuePage;
