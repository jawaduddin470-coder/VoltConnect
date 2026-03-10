import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { stations } from '../data/stations';
import { Clock, Zap, CheckCircle, MapPin, ArrowRight } from 'lucide-react';

const QueuePage = () => {
    const navigate = useNavigate();
    const availableStations = stations.filter(s => s.status !== 'faulty');
    const [selectedStation, setSelectedStation] = useState(null);
    const [position, setPosition] = useState(null);
    const [joined, setJoined] = useState(false);
    const [ready, setReady] = useState(false);
    const [seconds, setSeconds] = useState(0);

    const handleJoin = (station) => {
        setSelectedStation(station);
        const pos = station.queue + 1;
        setPosition(pos);
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
        setJoined(false);
        setSelectedStation(null);
        setPosition(null);
        setReady(false);
        setSeconds(0);
    };

    return (
        <div className="page-container" style={{ maxWidth: 700 }}>
            <div style={{ padding: '0 8px' }}>
                <h1 style={{ fontSize: 28, marginBottom: 4 }}>Virtual Queue</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Join a charger queue remotely and get notified when ready.</p>

                {!joined ? (
                    <>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 12 }}>SELECT A STATION TO JOIN</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {availableStations.slice(0, 10).map(s => (
                                <div key={s.id} className="vc-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, marginBottom: 2 }}>{s.name}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <MapPin size={11} /> {s.area} · Queue: {s.queue} people
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', marginRight: 12 }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: s.queue === 0 ? '#00E676' : '#FF9800' }}>
                                            {s.queue === 0 ? 'No wait' : `~${s.queue * 8} min`}
                                        </div>
                                    </div>
                                    <button onClick={() => handleJoin(s)} className="btn-primary" style={{ padding: '8px 14px', fontSize: 13, whiteSpace: 'nowrap' }}>
                                        Join
                                    </button>
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
                                        <button className="btn-outline" onClick={() => navigate(`/station/${selectedStation.id}`)} style={{ padding: '12px 24px' }}>View Station</button>
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

                                    {/* Progress */}
                                    <div style={{ background: 'var(--bg-border)', borderRadius: 8, height: 6, marginBottom: 20, overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%', borderRadius: 8, background: 'var(--accent)',
                                            width: `${Math.min(100, (seconds / (position * 10)) * 100)}%`,
                                            transition: 'width 1s linear',
                                        }} />
                                    </div>

                                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                                        <button onClick={handleLeave} className="btn-outline" style={{ padding: '10px 24px' }}>Leave Queue</button>
                                        <button onClick={() => navigate(`/station/${selectedStation.id}`)} className="btn-primary" style={{ padding: '10px 24px' }}>
                                            View Station <ArrowRight size={15} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Queue timeline */}
                        {!ready && (
                            <div className="vc-card" style={{ padding: 20 }}>
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
