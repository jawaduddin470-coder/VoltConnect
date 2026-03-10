import React from 'react';
import { TrendingUp, BatteryCharging, IndianRupee, Zap, ArrowUpRight } from 'lucide-react';

const OperatorAnalyticsPage = () => {
    const stats = [
        { label: 'Total Revenue (This Month)', value: '₹142,500', trend: '+12.5%', icon: IndianRupee, color: '#00E676' },
        { label: 'Total Sessions', value: '1,284', trend: '+8.2%', icon: BatteryCharging, color: '#2979FF' },
        { label: 'Energy Dispensed', value: '42.8 MWh', trend: '+15.1%', icon: Zap, color: '#FF9800' },
        { label: 'Average Utilization', value: '64%', trend: '+2.4%', icon: TrendingUp, color: '#7C4DFF' },
    ];

    // Dummy data for height values
    const revenueData = [40, 65, 55, 80, 70, 95, 85];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <div className="page-container" style={{ maxWidth: 1000 }}>
            <div style={{ padding: '0 8px' }}>
                <h1 style={{ fontSize: 28, marginBottom: 4 }}>Analytics</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Monitor your charging network's performance and revenue.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
                    {stats.map(({ label, value, trend, icon: Icon, color }) => (
                        <div key={label} className="vc-card" style={{ padding: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon size={20} color={color} />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#00E676', fontSize: 12, fontWeight: 600, background: 'rgba(0,230,118,0.1)', padding: '4px 8px', borderRadius: 20 }}>
                                    <ArrowUpRight size={12} /> {trend}
                                </div>
                            </div>
                            <div style={{ fontSize: 28, fontFamily: 'Rajdhani', fontWeight: 700, marginBottom: 4 }}>{value}</div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
                    {/* Revenue Chart Simulation */}
                    <div className="vc-card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontSize: 18, marginBottom: 24 }}>7-Day Revenue Trend</h3>

                        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, height: 200, paddingBottom: 10, borderBottom: '1px solid var(--bg-border)' }}>
                            {revenueData.map((h, i) => (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, flex: 1 }}>
                                    <div style={{
                                        width: '100%', maxWidth: 40, height: `${h}%`,
                                        background: 'linear-gradient(to top, rgba(0,230,118,0.2), #00E676)',
                                        borderRadius: '6px 6px 0 0',
                                        transition: 'height 1s ease-out'
                                    }} />
                                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{days[i]}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Stations */}
                    <div className="vc-card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 18, marginBottom: 20 }}>Top Performing Stations</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {[
                                { name: 'ChargeZone Hitech City', revenue: '₹42,100', util: 82 },
                                { name: 'Jubilee Hills FastHub', revenue: '₹38,400', util: 75 },
                                { name: 'Gachibowli Plaza', revenue: '₹29,800', util: 68 },
                                { name: 'Banjara Mall Charging', revenue: '₹21,500', util: 54 },
                            ].map((s, i) => (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <span style={{ fontSize: 14, fontWeight: 500 }}>{s.name}</span>
                                        <span style={{ fontSize: 14, fontWeight: 600, color: '#00E676' }}>{s.revenue}</span>
                                    </div>
                                    <div style={{ height: 6, background: 'var(--bg-border)', borderRadius: 3, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${s.util}%`, background: 'var(--accent)', borderRadius: 3 }} />
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right', marginTop: 4 }}>
                                        {s.util}% Utilization
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default OperatorAnalyticsPage;
