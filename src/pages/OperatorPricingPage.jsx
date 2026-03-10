import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Check, ArrowRight, Zap } from 'lucide-react';

const PLANS = [
    {
        name: 'Basic',
        price: '3000',
        features: ['List charging stations', 'Edit station details', 'Receive fault reports', 'Basic visibility on map'],
        color: '#00E676'
    },
    {
        name: 'Growth',
        price: '9000',
        features: ['Queue management tools', 'Demand analytics', 'Station performance insights', 'Price update controls'],
        color: 'var(--accent)',
        popular: true
    },
    {
        name: 'Enterprise',
        price: '25000',
        features: ['AI demand prediction', 'Dynamic pricing tools', 'Priority listing on map', 'API integrations', 'Advanced analytics dashboard'],
        color: '#F44336'
    }
];

const OperatorPricingPage = () => {
    const navigate = useNavigate();
    const { setUserPlan } = useAuth();

    const handleSelectPlan = (planName) => {
        setUserPlan(planName.toLowerCase());
        navigate('/signup'); // Operators usually sign up first
    };

    return (
        <div className="page-wrapper" style={{ minHeight: 'calc(100vh - var(--nav-height))', padding: '40px 16px' }}>
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,230,118,0.1)', color: '#00E676', padding: '8px 16px', borderRadius: 24, fontWeight: 600, fontSize: 13, marginBottom: 24 }}>
                        <Zap size={16} /> For Station Operators
                    </div>
                    <h1 style={{ fontSize: 36, marginBottom: 16 }}>Power Up Your EV Charging Business</h1>
                    <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>
                        Join Hyderabad's fastest-growing EV charging network. Manage stations, attract drivers, and increase utilization.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, padding: '16px 0' }}>
                    {PLANS.map((plan) => (
                        <div key={plan.name} className="vc-card" style={{
                            padding: 32,
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                            border: plan.popular ? `2px solid ${plan.color}` : '1px solid var(--bg-border)',
                            transform: plan.popular ? 'scale(1.02)' : 'none'
                        }}>
                            {plan.popular && (
                                <div style={{
                                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                                    background: plan.color, color: '#fff', padding: '4px 16px',
                                    borderRadius: 12, fontSize: 12, fontWeight: 700, letterSpacing: '0.05em'
                                }}>
                                    RECOMMENDED
                                </div>
                            )}
                            <h3 style={{ fontSize: 24, marginBottom: 12, color: plan.popular ? plan.color : 'var(--text-primary)' }}>{plan.name}</h3>
                            <div style={{ marginBottom: 24, display: 'flex', alignItems: 'baseline', gap: 4 }}>
                                <span style={{ fontSize: 40, fontWeight: 700, fontFamily: 'Rajdhani', color: plan.color }}>₹{plan.price}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>/month</span>
                            </div>

                            <div style={{ flex: 1 }}>
                                {plan.features.map((f, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                                        <Check size={18} color={plan.color} style={{ flexShrink: 0, marginTop: 2 }} />
                                        <span style={{ fontSize: 15, color: 'var(--text-secondary)' }}>{f}</span>
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
                                    background: plan.popular ? plan.color : undefined,
                                    borderColor: plan.color,
                                    color: !plan.popular ? plan.color : undefined,
                                    boxShadow: plan.popular ? `0 8px 16px ${plan.color}40` : 'none'
                                }}
                            >
                                Start Operator Account <ArrowRight size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OperatorPricingPage;
