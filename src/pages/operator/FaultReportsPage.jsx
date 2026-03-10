import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Search, Filter } from 'lucide-react';

const initialFaults = [
    { id: 'f1', stationName: 'Hitech City Hub', issue: 'Cable damaged on Charger A', severity: 'high', status: 'pending', date: 'Oct 24, 09:30 AM', reportedBy: 'Rahul M.' },
    { id: 'f2', stationName: 'Banjara Hills Fast', issue: 'Payment terminal unresponsive', severity: 'medium', status: 'pending', date: 'Oct 23, 04:15 PM', reportedBy: 'Priya K.' },
    { id: 'f3', stationName: 'Gachibowli Plaza', issue: 'Screen glitching', severity: 'low', status: 'resolved', date: 'Oct 22, 11:00 AM', reportedBy: 'Guest' },
    { id: 'f4', stationName: 'Madhapur Metro', issue: 'ICE vehicle parked in EV spot', severity: 'medium', status: 'resolved', date: 'Oct 20, 08:45 AM', reportedBy: 'Anita D.' },
];

const SEVERITY_COLORS = {
    high: '#F44336',
    medium: '#FF9800',
    low: '#2979FF'
};

const FaultReportsPage = () => {
    const [faults, setFaults] = useState(initialFaults);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const handleResolve = (id) => {
        setFaults(prev => prev.map(f => f.id === id ? { ...f, status: 'resolved' } : f));
    };

    const filtered = faults.filter(f => {
        const matchSearch = f.stationName.toLowerCase().includes(search.toLowerCase()) || f.issue.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'all' || f.status === filterStatus;
        return matchSearch && matchStatus;
    });

    return (
        <div className="page-container" style={{ maxWidth: 1000 }}>
            <div style={{ padding: '0 8px' }}>
                <h1 style={{ fontSize: 28, marginBottom: 4 }}>Fault Reports</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Review and resolve issues reported entirely by the EV driver community.</p>

                <div className="vc-card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 400 }}>
                            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search stations or issues..."
                                className="vc-input" style={{ paddingLeft: 40 }}
                            />
                        </div>
                        <select
                            value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                            className="vc-input" style={{ width: 140 }}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="resolved">Resolved</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {filtered.map(f => (
                            <div key={f.id} style={{
                                display: 'flex', flexDirection: 'column', gap: 12, padding: 16,
                                background: 'var(--bg-primary)', borderRadius: 12, borderLeft: `4px solid ${SEVERITY_COLORS[f.severity]}`
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                            <span style={{ fontWeight: 600, fontSize: 16 }}>{f.stationName}</span>
                                            {f.status === 'resolved' && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#00E676', background: 'rgba(0,230,118,0.1)', padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>
                                                    <CheckCircle size={12} /> Resolved
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 8 }}>{f.issue}</div>
                                        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                                            <span>Reported: {f.date}</span>
                                            <span>By: {f.reportedBy}</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
                                        <span style={{
                                            fontSize: 11, fontWeight: 600, textTransform: 'uppercase', padding: '4px 10px', borderRadius: 12,
                                            background: `${SEVERITY_COLORS[f.severity]}15`, color: SEVERITY_COLORS[f.severity]
                                        }}>
                                            {f.severity} Priority
                                        </span>

                                        {f.status === 'pending' && (
                                            <button onClick={() => handleResolve(f.id)} className="btn-outline" style={{ padding: '6px 12px', fontSize: 12, borderColor: '#00E676', color: '#00E676' }}>
                                                Mark Resolved
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filtered.length === 0 && (
                            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <AlertTriangle size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                                <p>No fault reports found matching your filters.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default FaultReportsPage;
