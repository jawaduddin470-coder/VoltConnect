import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Car, Building2, ArrowRight } from 'lucide-react';

const RoleSelectPage = () => {
    const navigate = useNavigate();
    const { setUserRole } = useAuth();

    const handleSelectRole = (role) => {
        setUserRole(role);
        if (role === 'driver') {
            navigate('/pricing-driver');
        } else {
            navigate('/pricing-operator');
        }
    };

    return (
        <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - var(--nav-height))', padding: '24px 16px' }}>
            <div style={{ maxWidth: 800, width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <h1 style={{ fontSize: 32, marginBottom: 12 }}>How do you want to use VoltConnect?</h1>
                    <p style={{ fontSize: 16, color: 'var(--text-secondary)' }}>Choose your experience to get started with the platform.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
                    {/* EV Driver Card */}
                    <div
                        onClick={() => handleSelectRole('driver')}
                        className="vc-card"
                        style={{ padding: 32, cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%', transition: 'all 0.3s', border: '2px solid transparent' }}
                        onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                        onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}
                    >
                        <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(41,121,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                            <Car size={32} color="var(--accent)" />
                        </div>
                        <h2 style={{ fontSize: 24, marginBottom: 12 }}>EV Driver</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 32, flex: 1, lineHeight: 1.6 }}>
                            Find charging stations, plan EV trips, join queues, and optimize charging across the city.
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent)', fontWeight: 600 }}>
                            Continue as Driver <ArrowRight size={18} />
                        </div>
                    </div>

                    {/* Operator Card */}
                    <div
                        onClick={() => handleSelectRole('operator')}
                        className="vc-card"
                        style={{ padding: 32, cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%', transition: 'all 0.3s', border: '2px solid transparent' }}
                        onMouseOver={(e) => e.currentTarget.style.borderColor = '#00E676'}
                        onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}
                    >
                        <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(0,230,118,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                            <Building2 size={32} color="#00E676" />
                        </div>
                        <h2 style={{ fontSize: 24, marginBottom: 12 }}>Charging Station Operator</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 32, flex: 1, lineHeight: 1.6 }}>
                            List your charging stations, manage pricing, track usage analytics, and attract more EV drivers.
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#00E676', fontWeight: 600 }}>
                            Continue as Operator <ArrowRight size={18} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoleSelectPage;
