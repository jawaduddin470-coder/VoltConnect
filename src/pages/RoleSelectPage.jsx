import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Car, Building2, ArrowRight, Zap } from 'lucide-react';

const RoleSelectPage = () => {
    const navigate = useNavigate();
    const { setUserRole } = useAuth();

    const handleSelectRole = (role) => {
        setUserRole(role);
        navigate(role === 'driver' ? '/pricing-driver' : '/pricing-operator');
    };

    return (
        <div className="page-wrapper" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: 'calc(100vh - var(--nav-height))', padding: '32px 16px',
        }}>
            <div style={{ maxWidth: 840, width: '100%' }}>
                {/* Heading */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: 'var(--accent-glow)', border: '1px solid rgba(41,121,255,0.2)',
                        borderRadius: 20, padding: '5px 14px', marginBottom: 16,
                    }}>
                        <Zap size={13} color="var(--accent)" fill="var(--accent)" />
                        <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>Choose your role</span>
                    </div>
                    <h1 style={{ fontSize: 'clamp(24px, 5vw, 34px)', marginBottom: 10 }}>
                        How do you want to use VoltConnect?
                    </h1>
                    <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto' }}>
                        Choose your experience to get started with the platform.
                    </p>
                </div>

                {/* Role cards — side by side on desktop, stacked on mobile */}
                <div className="role-select-grid">
                    {/* EV Driver Card */}
                    <div
                        onClick={() => handleSelectRole('driver')}
                        className="vc-card role-card"
                        style={{ padding: 32, cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                    >
                        <div style={{
                            width: 64, height: 64, borderRadius: 18,
                            background: 'rgba(41,121,255,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
                        }}>
                            <Car size={32} color="var(--accent)" />
                        </div>
                        <h2 style={{ fontSize: 26, marginBottom: 10 }}>EV Driver</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 28, flex: 1, lineHeight: 1.65, fontSize: 15 }}>
                            Find charging stations, plan EV trips, join queues, and optimize charging across the city.
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent)', fontWeight: 700 }}>
                            Continue as Driver <ArrowRight size={18} />
                        </div>
                    </div>

                    {/* Operator Card */}
                    <div
                        onClick={() => handleSelectRole('operator')}
                        className="vc-card role-card"
                        style={{ padding: 32, cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                    >
                        <div style={{
                            width: 64, height: 64, borderRadius: 18,
                            background: 'rgba(0,230,118,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
                        }}>
                            <Building2 size={32} color="#00E676" />
                        </div>
                        <h2 style={{ fontSize: 26, marginBottom: 10 }}>Charging Station Operator</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 28, flex: 1, lineHeight: 1.65, fontSize: 15 }}>
                            List your charging stations, manage pricing, track usage analytics, and attract more EV drivers.
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#00E676', fontWeight: 700 }}>
                            Continue as Operator <ArrowRight size={18} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoleSelectPage;
