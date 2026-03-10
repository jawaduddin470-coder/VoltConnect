import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Map, Clock, Route, Calculator, Star, ChevronRight } from 'lucide-react';

const features = [
    { icon: Map, title: 'Smart Charger Map', desc: 'Find nearby charging stations on an interactive map with real-time availability.', color: '#2979FF' },
    { icon: Clock, title: 'Virtual Queue', desc: 'Join a virtual queue remotely and get notified when your charger is ready.', color: '#00B4D8' },
    { icon: Route, title: 'Trip Planner', desc: 'Plan multi-stop EV road trips with optimal charging stops across Hyderabad.', color: '#7C4DFF' },
    { icon: Calculator, title: 'Cost Calculator', desc: 'Estimate your exact charging cost before you plug in, down to the paisa.', color: '#00E676' },
    { icon: Star, title: 'Availability Prediction', desc: 'AI-powered charger availability forecasts so you never wait at a full station.', color: '#FF9800' },
];

const benefits = [
    { title: '25+', sub: 'Charging Stations' },
    { title: '~8 min', sub: 'Avg Wait Time Saved' },
    { title: '₹200+', sub: 'Monthly Savings' },
    { title: 'Real-time', sub: 'Status Updates' },
];

const LandingPage = () => {
    return (
        <div className="page-container" style={{ padding: 0, maxWidth: 'none' }}>
            {/* Hero */}
            <section style={{
                minHeight: 'calc(100vh - var(--nav-height))',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '60px 24px 40px',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Background glow */}
                <div style={{
                    position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: 500, height: 500, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(41,121,255,0.08) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />

                <div style={{ marginBottom: 24, animation: 'fadeInUp 0.6s ease', position: 'relative', zIndex: 10 }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        background: 'var(--accent-glow)', border: '1px solid rgba(41,121,255,0.2)',
                        borderRadius: 20, padding: '6px 16px', marginBottom: 24,
                    }}>
                        <Zap size={14} color="var(--accent)" fill="var(--accent)" />
                        <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>Smart EV Charging · Hyderabad</span>
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(40px, 8vw, 84px)',
                        lineHeight: 1.05,
                        marginBottom: 20,
                        fontFamily: 'Rajdhani',
                        fontWeight: 700,
                    }}>
                        Charge Smarter<br />
                        <span className="gradient-text">in Hyderabad.</span>
                    </h1>

                    <p style={{
                        fontSize: 'clamp(16px, 2.5vw, 20px)',
                        color: 'var(--text-secondary)',
                        maxWidth: 560,
                        margin: '0 auto 40px',
                        lineHeight: 1.6,
                    }}>
                        Find chargers, avoid queues, and plan your EV charging journey smarter.
                        Your intelligent co-pilot for every charge.
                    </p>

                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/role-select" className="btn-primary" style={{ padding: '14px 32px', fontSize: 16 }}>
                            <Zap size={18} fill="#fff" />
                            Get Started
                        </Link>
                        <Link to="/login" className="btn-outline" style={{ padding: '14px 32px', fontSize: 16 }}>
                            Login
                            <ChevronRight size={18} />
                        </Link>
                    </div>
                </div>

                {/* Stats row */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, width: '100%', maxWidth: 800,
                    marginTop: 60, position: 'relative', zIndex: 10
                }}>
                    {benefits.map((b) => (
                        <div key={b.title} className="vc-card" style={{ padding: '20px 16px', textAlign: 'center' }}>
                            <div style={{ fontSize: 28, fontFamily: 'Rajdhani', fontWeight: 700, color: 'var(--accent)' }}>{b.title}</div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{b.sub}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: 56 }}>
                    <h2 style={{ fontSize: 'clamp(28px, 5vw, 44px)', marginBottom: 12 }}>
                        Everything an EV driver needs
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 17 }}>
                        Five powerful tools packed into one platform.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: 20,
                }}>
                    {features.map(({ icon: Icon, title, desc, color }) => (
                        <div key={title} className="vc-card animate-fade-up" style={{ padding: 28 }}>
                            <div style={{
                                width: 48, height: 48, borderRadius: 14,
                                background: `${color}18`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: 16,
                            }}>
                                <Icon size={22} color={color} />
                            </div>
                            <h3 style={{ fontSize: 20, marginBottom: 8 }}>{title}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6 }}>{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Banner */}
            <section style={{ padding: '60px 24px', maxWidth: 1200, margin: '0 auto', width: '100%', marginBottom: 40 }}>
                <div className="vc-card" style={{
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, rgba(41,121,255,0.08), rgba(0,180,216,0.04))',
                    borderColor: 'rgba(41,121,255,0.2)',
                    padding: '56px 32px',
                }}>
                    <Zap size={40} color="var(--accent)" fill="var(--accent)" style={{ margin: '0 auto 20px' }} />
                    <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', marginBottom: 16 }}>
                        Ready to drive smarter?
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 16, maxWidth: 500, margin: '0 auto 32px' }}>
                        Join thousands of EV drivers in Hyderabad who charge smarter with VoltConnect.
                    </p>
                    <Link to="/role-select" className="btn-primary" style={{ padding: '14px 36px', fontSize: 16 }}>
                        Get Started
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
