import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Check, ArrowRight } from 'lucide-react';

const PLANS = [
    {
        name: 'Free Plan',
        price: '0',
        features: ['Basic charger map', 'Station availability', 'Community reviews', 'Basic search filters'],
        color: 'var(--text-secondary)'
    },
    {
        name: 'Silver Plan',
        price: '399',
        features: ['Join queue', 'Trip planner', 'Charging cost calculator', 'Save favorite stations', 'Price alerts'],
        color: '#00B4D8'
    },
    {
        name: 'Gold Plan',
        price: '699',
        features: ['Priority queue access', 'Advanced trip routing', 'Charging analytics', 'Range safety prediction', 'Multiple vehicle profiles'],
        color: '#FF9800',
        popular: true
    },
    {
        name: 'Platinum Plan',
        price: '1199',
        features: ['Unlimited queue priority', 'AI charging trip planner', 'Charging history insights', 'Demand prediction', 'Early feature access'],
        color: 'var(--accent)'
    }
];

const DriverPricingPage = () => {
    const navigate = useNavigate();
    const { setUserPlan } = useAuth();

    const handleSelectPlan = (planName) => {
        setUserPlan(planName.split(' ')[0].toLowerCase());
        navigate('/login');
    };

    return (
        <div className="page-wrapper" style={{ minHeight: 'calc(100vh - var(--nav-height))', padding: '40px 16px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <h1 style={{ fontSize: 36, marginBottom: 16 }}>Choose your EV Driver Plan</h1>
                    <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>
                        Unlock smart charging features, avoid queues, and plan your trips seamlessly across Hyderabad.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, padding: '16px 0' }}>
                    {PLANS.map((plan) => (
                        <div key={plan.name} className="vc-card" style={{
                            padding: 32,
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                            border: plan.popular ? '2px solid var(--accent)' : '1px solid var(--bg-border)',
                            transform: plan.popular ? 'translateY(-8px)' : 'none'
                        }}>
                            {plan.popular && (
                                <div style={{
                                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                                    background: 'var(--accent)', color: '#fff', padding: '4px 12px',
                                    borderRadius: 12, fontSize: 12, fontWeight: 700, letterSpacing: '0.05em'
                                }}>
                                    MOST POPULAR
                                </div>
                            )}
                            <h3 style={{ fontSize: 20, marginBottom: 12, color: plan.color }}>{plan.name}</h3>
                            <div style={{ marginBottom: 24, display: 'flex', alignItems: 'baseline', gap: 4 }}>
                                <span style={{ fontSize: 36, fontWeight: 700, fontFamily: 'Rajdhani' }}>₹{plan.price}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>/month</span>
                            </div>

                            <div style={{ flex: 1 }}>
                                {plan.features.map((f, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                                        <Check size={18} color={plan.color} style={{ flexShrink: 0, marginTop: 2 }} />
                                        <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{f}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => handleSelectPlan(plan.name)}
                                className={plan.popular ? "btn-primary" : "btn-outline"}
                                style={{
                                    width: '100%',
                                    justifyContent: 'center',
                                    marginTop: 32,
                                    borderColor: !plan.popular ? plan.color : undefined,
                                    color: !plan.popular ? plan.color : undefined
                                }}
                            >
                                Choose Plan <ArrowRight size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DriverPricingPage;
