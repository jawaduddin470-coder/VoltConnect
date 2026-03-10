import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Trophy, Star, Camera, CheckCircle2, AlertTriangle, Shield, Zap, LogOut, Award } from 'lucide-react';

const LEADERBOARD = [
    { rank: 1, name: 'Rahul Sharma', area: 'Jubilee Hills', points: 4850, badge: 'Gold', reports: 42, reviews: 31 },
    { rank: 2, name: 'Priya Reddy', area: 'Hitech City', points: 4210, badge: 'Gold', reports: 38, reviews: 27 },
    { rank: 3, name: 'Adithya Kumar', area: 'Gachibowli', points: 3670, badge: 'Silver', reports: 29, reviews: 22 },
    { rank: 4, name: 'Sneha Rao', area: 'Banjara Hills', points: 2890, badge: 'Silver', reports: 21, reviews: 18 },
    { rank: 5, name: 'Kiran Babu', area: 'Financial District', points: 2340, badge: 'Bronze', reports: 16, reviews: 14 },
    { rank: 6, name: 'Lakshmi Devi', area: 'Madhapur', points: 1980, badge: 'Bronze', reports: 12, reviews: 11 },
    { rank: 7, name: 'Mohammed Meraj', area: 'Kondapur', points: 1520, badge: 'Bronze', reports: 9, reviews: 8 },
];

const BADGES = [
    { name: 'Fault Reporter', desc: 'Reported 10+ faults', icon: AlertTriangle, color: '#F44336', earned: true },
    { name: 'Station Reviewer', desc: 'Left 10+ reviews', icon: Star, color: '#FF9800', earned: true },
    { name: 'Photographer', desc: 'Uploaded 20+ photos', icon: Camera, color: '#2979FF', earned: false },
    { name: 'Verifier', desc: 'Verified 15+ stations', icon: CheckCircle2, color: '#00E676', earned: false },
    { name: 'VoltShield', desc: 'Earned 2000+ points', icon: Shield, color: '#7C4DFF', earned: false },
];

const RANK_COLORS = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' };

const CommunityPage = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('leaderboard');

    const myPoints = 1520;
    const myRank = 7;

    return (
        <div className="page-container" style={{ maxWidth: 800 }}>
            <div style={{ padding: '0 8px' }}>
                <h1 style={{ fontSize: 28, marginBottom: 4 }}>Community</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Earn VoltPoints, climb the leaderboard, and unlock badges.</p>

                {/* My points */}
                <div className="vc-card" style={{ padding: 20, marginBottom: 20, background: 'linear-gradient(135deg, rgba(41,121,255,0.12), rgba(0,180,216,0.06))' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #2979FF, #00B4D8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Zap size={24} color="#fff" fill="#fff" />
                        </div>
                        <div>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 2 }}>YOUR VOLTPOINTS</p>
                            <p style={{ fontSize: 28, fontFamily: 'Rajdhani', fontWeight: 700, color: 'var(--accent)' }}>{myPoints.toLocaleString()} pts</p>
                        </div>
                        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Global Rank</p>
                            <p style={{ fontSize: 22, fontFamily: 'Rajdhani', fontWeight: 700 }}>#{myRank}</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: 12, padding: 4 }}>
                    {['leaderboard', 'badges', 'earn'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            style={{
                                flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
                                background: activeTab === tab ? 'var(--accent)' : 'transparent',
                                color: activeTab === tab ? '#fff' : 'var(--text-secondary)', fontWeight: 600, fontSize: 14, transition: 'all 0.2s',
                                textTransform: 'capitalize',
                            }}>
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Leaderboard */}
                {activeTab === 'leaderboard' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {LEADERBOARD.map((u) => (
                            <div key={u.rank} className="vc-card" style={{
                                padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
                                borderColor: u.rank <= 3 ? `${RANK_COLORS[u.rank]}40` : undefined,
                                background: u.rank === myRank ? 'rgba(41,121,255,0.06)' : undefined,
                            }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                                    background: RANK_COLORS[u.rank] ? `${RANK_COLORS[u.rank]}25` : 'var(--bg-primary)',
                                    border: `2px solid ${RANK_COLORS[u.rank] || 'var(--bg-border)'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 13, fontWeight: 700, color: RANK_COLORS[u.rank] || 'var(--text-muted)',
                                }}>
                                    {u.rank <= 3 ? <Trophy size={15} color={RANK_COLORS[u.rank]} /> : u.rank}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}{u.rank === myRank ? ' (You)' : ''}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.area} · {u.reports} reports · {u.reviews} reviews</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 17, color: u.rank <= 3 ? RANK_COLORS[u.rank] : 'var(--accent)' }}>
                                        {u.points.toLocaleString()}
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>pts</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Badges */}
                {activeTab === 'badges' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
                        {BADGES.map(({ name, desc, icon: Icon, color, earned }) => (
                            <div key={name} className="vc-card" style={{
                                padding: 20, textAlign: 'center', opacity: earned ? 1 : 0.5,
                                borderColor: earned ? `${color}40` : undefined,
                            }}>
                                <div style={{ width: 48, height: 48, borderRadius: '50%', background: `${color}20`, border: `2px solid ${earned ? color : 'var(--bg-border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                                    <Icon size={22} color={earned ? color : 'var(--text-muted)'} />
                                </div>
                                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{name}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{desc}</div>
                                {earned && <div style={{ marginTop: 8, fontSize: 11, color: color, fontWeight: 600 }}>✓ Earned</div>}
                            </div>
                        ))}
                    </div>
                )}

                {/* How to earn */}
                {activeTab === 'earn' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[
                            { action: 'Report a faulty charger', points: '+50 pts', icon: AlertTriangle, color: '#F44336' },
                            { action: 'Leave a station review', points: '+25 pts', icon: Star, color: '#FF9800' },
                            { action: 'Upload a station photo', points: '+15 pts', icon: Camera, color: '#2979FF' },
                            { action: 'Verify station information', points: '+30 pts', icon: CheckCircle2, color: '#00E676' },
                            { action: 'First charge of the day', points: '+10 pts', icon: Zap, color: '#7C4DFF' },
                        ].map(({ action, points, icon: Icon, color }) => (
                            <div key={action} className="vc-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Icon size={18} color={color} />
                                </div>
                                <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{action}</div>
                                <div style={{ fontSize: 15, fontFamily: 'Rajdhani', fontWeight: 700, color: 'var(--accent)' }}>{points}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityPage;
