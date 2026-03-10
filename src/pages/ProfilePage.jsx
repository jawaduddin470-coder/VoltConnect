import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    User, Zap, Battery, MapPin, History, CreditCard, LogOut,
    Settings, Star, BookmarkCheck, ChevronRight, Car
} from 'lucide-react';

const SAVED = [
    { id: 1, name: 'Tata Power EV Hub', area: 'Jubilee Hills' },
    { id: 9, name: 'EVRE Charging Hub', area: 'Financial District' },
    { id: 25, name: 'Tata Power EV Station', area: 'Necklace Road' },
];

const HISTORY = [
    { station: 'Zeon Charging Hub', area: 'Gachibowli', date: 'Mar 9, 2026', energy: '18.5 kWh', cost: '₹296' },
    { station: 'Statiq Charging Hub', area: 'Madhapur', date: 'Mar 5, 2026', energy: '22.0 kWh', cost: '₹374' },
    { station: 'BPCL Fast Charger', area: 'Banjara Hills', date: 'Feb 28, 2026', energy: '30.0 kWh', cost: '₹660' },
    { station: 'Ather Grid', area: 'Hitech City', date: 'Feb 20, 2026', energy: '12.0 kWh', cost: '₹144' },
];

const PLANS = [
    { name: 'Free', price: '₹0/mo', features: ['5 queue joins/mo', 'Basic map', 'Community access'], current: true, color: '#8B94B2' },
    { name: 'Pro', price: '₹199/mo', features: ['Unlimited queues', 'Trip planner', 'Priority support', 'Ad-free'], current: false, color: '#2979FF' },
    { name: 'Elite', price: '₹499/mo', features: ['All Pro features', 'Real-time alerts', 'Dedicated support', 'VoltBadge'], current: false, color: '#7C4DFF' },
];

const ProfilePage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('saved');

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const displayName = user?.displayName || user?.email?.split('@')[0] || 'EV Driver';
    const email = user?.email || 'user@voltconnect.in';

    return (
        <div className="page-container" style={{ maxWidth: 800 }}>
            <div style={{ padding: '0 8px' }}>
                {/* Profile header */}
                <div className="vc-card" style={{ padding: 24, marginBottom: 20, background: 'linear-gradient(135deg, rgba(41,121,255,0.1), rgba(0,180,216,0.06))' }}>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #2979FF, #00B4D8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <User size={30} color="#fff" />
                        </div>
                        <div style={{ flex: 1, minWidth: 200 }}>
                            <h2 style={{ fontSize: 22, marginBottom: 2 }}>{displayName}</h2>
                            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>{email}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                                <Zap size={13} color="var(--accent)" fill="var(--accent)" />
                                <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>1,520 VoltPoints</span>
                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>· Rank #7</span>
                            </div>
                        </div>
                        <button style={{ background: 'none', border: '1px solid var(--bg-border)', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            <Settings size={16} />
                        </button>
                    </div>

                    {/* Vehicle info */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10 }}>
                        {[
                            { icon: Car, label: 'Vehicle', value: 'Tata Nexon EV' },
                            { icon: Battery, label: 'Battery', value: '40.5 kWh' },
                            { icon: MapPin, label: 'City', value: 'Hyderabad' },
                        ].map(({ icon: Icon, label, value }) => (
                            <div key={label} style={{ textAlign: 'center', background: 'var(--bg-primary)', borderRadius: 10, padding: '10px 8px' }}>
                                <Icon size={16} color="var(--accent)" style={{ margin: '0 auto 4px' }} />
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{value}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: 12, padding: 4 }}>
                    {[
                        { key: 'saved', label: 'Saved', icon: BookmarkCheck },
                        { key: 'history', label: 'History', icon: History },
                        { key: 'plans', label: 'Plans', icon: CreditCard },
                    ].map(({ key, label, icon: Icon }) => (
                        <button key={key} onClick={() => setActiveTab(key)}
                            style={{
                                flex: 1, padding: '10px 8px', borderRadius: 10, border: 'none', cursor: 'pointer',
                                background: activeTab === key ? 'var(--accent)' : 'transparent',
                                color: activeTab === key ? '#fff' : 'var(--text-secondary)', fontWeight: 600, fontSize: 14, transition: 'all 0.2s',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            }}>
                            <Icon size={15} /> <span className="hidden sm:inline">{label}</span>
                        </button>
                    ))}
                </div>

                {/* Saved stations */}
                {activeTab === 'saved' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {SAVED.map(s => (
                            <div key={s.id} onClick={() => navigate(`/station/${s.id}`)} className="vc-card"
                                style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(41,121,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Zap size={18} color="var(--accent)" />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <MapPin size={11} /> {s.area}
                                    </div>
                                </div>
                                <ChevronRight size={16} color="var(--text-muted)" />
                            </div>
                        ))}
                    </div>
                )}

                {/* History */}
                {activeTab === 'history' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {HISTORY.map((h, i) => (
                            <div key={i} className="vc-card" style={{ padding: '14px 16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                    <div style={{ flex: 1, minWidth: 0, paddingRight: 10 }}>
                                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.station}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.area} · {h.date}</div>
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <div style={{ fontSize: 16, fontFamily: 'Rajdhani', fontWeight: 700, color: 'var(--accent)' }}>{h.cost}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{h.energy}</div>
                                    </div>
                                </div>
                                <div style={{ height: 4, borderRadius: 2, background: 'var(--bg-border)', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', borderRadius: 2, background: 'var(--accent)', width: `${Math.random() * 60 + 30}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Plans */}
                {activeTab === 'plans' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {PLANS.map(plan => (
                            <div key={plan.name} className="vc-card" style={{ padding: 20, borderColor: plan.current ? `${plan.color}50` : undefined, background: plan.current ? `${plan.color}08` : undefined }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                                    <div>
                                        <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 20, color: plan.color }}>{plan.name}</div>
                                        <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Rajdhani' }}>{plan.price}</div>
                                    </div>
                                    {plan.current ? (
                                        <span style={{ background: `${plan.color}20`, color: plan.color, border: `1px solid ${plan.color}40`, borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>Current</span>
                                    ) : (
                                        <button className="btn-primary" style={{ padding: '8px 16px', fontSize: 13, background: plan.color }}>Upgrade</button>
                                    )}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {plan.features.map(f => (
                                        <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                                            <div style={{ width: 16, height: 16, borderRadius: '50%', background: `${plan.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <span style={{ fontSize: 9, color: plan.color }}>✓</span>
                                            </div>
                                            {f}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Logout */}
                <button onClick={handleLogout}
                    style={{
                        marginTop: 24, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        padding: '14px', borderRadius: 12, border: '1.5px solid rgba(244,67,54,0.4)',
                        background: 'transparent', color: '#F44336', cursor: 'pointer', fontSize: 15, fontWeight: 600,
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(244,67,54,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                    <LogOut size={18} /> Sign Out
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;
