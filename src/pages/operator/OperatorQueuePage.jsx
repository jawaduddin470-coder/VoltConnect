import React, { useState, useEffect } from 'react';
import { Clock, Users, Bell, Search, CheckCircle2 } from 'lucide-react';
import { stations } from '../../data/stations';

// Simulated queue data for operator's stations
const initialQueues = [
    { id: 'q1', stationId: '2', stationName: 'Hitech City Hub', user: 'Rahul M.', vehicle: 'Nexon EV', addedAt: new Date(Date.now() - 15 * 60000), position: 1, estimatedWait: 5 },
    { id: 'q2', stationId: '2', stationName: 'Hitech City Hub', user: 'Priya K.', vehicle: 'Ather 450X', addedAt: new Date(Date.now() - 8 * 60000), position: 2, estimatedWait: 25 },
    { id: 'q3', stationId: '5', stationName: 'Gachibowli Fast', user: 'Vikram S.', vehicle: 'MG ZS EV', addedAt: new Date(Date.now() - 32 * 60000), position: 1, estimatedWait: 2 },
    { id: 'q4', stationId: '8', stationName: 'Madhapur Metro', user: 'Anita D.', vehicle: 'Tiago EV', addedAt: new Date(Date.now() - 5 * 60000), position: 1, estimatedWait: 15 },
];

const OperatorQueuePage = () => {
    const [queues, setQueues] = useState(initialQueues);
    const [search, setSearch] = useState('');
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const handleNotify = (id) => {
        alert('Notification sent to user: Your charger is ready!');
        setQueues(prev => prev.filter(q => q.id !== id));
    };

    const formatTimeAgo = (date) => {
        const mins = Math.floor((now - date) / 60000);
        return `${mins} min ago`;
    };

    const filtered = queues.filter(q =>
        q.stationName.toLowerCase().includes(search.toLowerCase()) ||
        q.user.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="page-container" style={{ maxWidth: 1000 }}>
            <div style={{ padding: '0 8px' }}>
                <h1 style={{ fontSize: 28, marginBottom: 4 }}>Queue Activity</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Monitor live virtual queues across your charging network.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 32 }}>
                    <div className="vc-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,152,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={24} color="#FF9800" />
                        </div>
                        <div>
                            <div style={{ fontSize: 28, fontFamily: 'Rajdhani', fontWeight: 700, lineHeight: 1 }}>{queues.length}</div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Total Drivers Waiting</div>
                        </div>
                    </div>

                    <div className="vc-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(41,121,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Clock size={24} color="#2979FF" />
                        </div>
                        <div>
                            <div style={{ fontSize: 28, fontFamily: 'Rajdhani', fontWeight: 700, lineHeight: 1 }}>
                                {queues.length ? Math.round(queues.reduce((sum, q) => sum + q.estimatedWait, 0) / queues.length) : 0}m
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Avg. Wait Time</div>
                        </div>
                    </div>
                </div>

                <div className="vc-card" style={{ padding: 24 }}>
                    <div style={{ marginBottom: 20, position: 'relative', maxWidth: 400 }}>
                        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by station or driver name..."
                            className="vc-input"
                            style={{ paddingLeft: 40 }}
                        />
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--bg-border)', color: 'var(--text-muted)', fontSize: 12 }}>
                                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>STATION</th>
                                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>DRIVER</th>
                                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>JOINED</th>
                                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>WAIT</th>
                                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>POS</th>
                                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(q => (
                                    <tr key={q.id} style={{ borderBottom: '1px solid var(--bg-border)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-primary)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <td style={{ padding: '16px', fontWeight: 500 }}>{q.stationName}</td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ fontSize: 14, fontWeight: 500 }}>{q.user}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{q.vehicle}</div>
                                        </td>
                                        <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: 13 }}>{formatTimeAgo(q.addedAt)}</td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{
                                                fontSize: 12, fontWeight: 600, padding: '4px 8px', borderRadius: 8,
                                                background: q.estimatedWait <= 5 ? 'rgba(0,230,118,0.1)' : 'rgba(255,152,0,0.1)',
                                                color: q.estimatedWait <= 5 ? '#00E676' : '#FF9800'
                                            }}>
                                                ~{q.estimatedWait}m
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px', fontSize: 15, fontWeight: 700, fontFamily: 'Rajdhani', color: 'var(--accent)' }}>#{q.position}</td>
                                        <td style={{ padding: '16px' }}>
                                            {q.position === 1 && q.estimatedWait <= 5 ? (
                                                <button onClick={() => handleNotify(q.id)} className="btn-primary" style={{ padding: '6px 12px', fontSize: 12 }}>
                                                    <Bell size={14} style={{ marginRight: 4 }} /> Notify Ready
                                                </button>
                                            ) : (
                                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Waiting...</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            Queue is currently empty.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default OperatorQueuePage;
