import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Clock, TrendingUp, AlertTriangle, PlusCircle, ArrowRight } from 'lucide-react';
import { stations } from '../../data/stations';

const OperatorDashboardPage = () => {
    // In a real app, this would filter for stations owned by the current operator
    const myStations = stations.slice(0, 4);
    const totalFaults = myStations.filter(s => s.status === 'faulty').length;
    const totalQueue = myStations.reduce((sum, s) => sum + s.queue, 0);

    const stats = [
        { label: 'Total Stations', value: myStations.length, icon: Zap, color: '#00E676' },
        { label: 'Active Queue', value: totalQueue, icon: Clock, color: '#FF9800' },
        { label: 'Utilization', value: '78%', icon: TrendingUp, color: '#00B4D8' },
        { label: 'Faults Reported', value: totalFaults, icon: AlertTriangle, color: '#F44336' },
    ];

    return (
        <div className="page-container" style={{ maxWidth: 1000 }}>
            <div style={{ padding: '0 8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                        <h1 style={{ fontSize: 28, marginBottom: 4 }}>Operator Dashboard</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Welcome back. Here's how your stations are performing today.</p>
                    </div>
                    <Link to="/operator/add-station" className="btn-primary" style={{ padding: '10px 16px', fontSize: 14 }}>
                        <PlusCircle size={16} /> Add Station
                    </Link>
                </div>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
                    {stats.map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="vc-card" style={{ padding: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon size={20} color={color} />
                                </div>
                            </div>
                            <div style={{ fontSize: 28, fontFamily: 'Rajdhani', fontWeight: 700, marginBottom: 4 }}>{value}</div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                    {/* Recent Stations */}
                    <div className="vc-card" style={{ padding: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 style={{ fontSize: 18 }}>Your Stations</h3>
                            <Link to="/operator/stations" style={{ fontSize: 13, color: '#00E676', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                                View All <ArrowRight size={14} />
                            </Link>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {myStations.map(s => (
                                <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-primary)', borderRadius: 12 }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{s.name}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.area} · ⚡{s.speed.split('(')[1]?.replace(')', '')}</div>
                                    </div>
                                    <span className={`badge-${s.status}`} style={{ fontSize: 11, padding: '4px 8px' }}>{s.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="vc-card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 18, marginBottom: 20 }}>Quick Actions</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            {[
                                { to: '/operator/analytics', label: 'View Analytics', icon: TrendingUp },
                                { to: '/operator/queue', label: 'Manage Queue', icon: Clock },
                                { to: '/operator/faults', label: 'Resolve Faults', icon: AlertTriangle },
                                { to: '/operator/settings', label: 'Settings', icon: Settings },
                            ].map(({ to, label, icon: Icon }) => (
                                <Link key={label} to={to} style={{
                                    textDecoration: 'none', padding: 16, background: 'var(--bg-primary)',
                                    borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    gap: 8, color: 'var(--text-primary)', transition: 'background 0.2s'
                                }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-border)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-primary)'}
                                >
                                    <Icon size={20} color="var(--text-secondary)" />
                                    <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Add missing import for Settings
import { Settings } from 'lucide-react';

export default OperatorDashboardPage;
