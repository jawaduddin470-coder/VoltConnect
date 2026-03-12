import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRazorpay } from '../hooks/useRazorpay';
import { Check, ArrowRight, Zap, Star, Rocket, Gift, Loader2 } from 'lucide-react';

const PLANS = [
    {
        id: 'free',
        name: 'Basic',
        tagline: 'Get started for free',
        price: '0',
        priceSuffix: 'forever',
        icon: Gift,
        color: '#10B981',
        bgColor: 'rgba(16,185,129,0.08)',
        features: [
            'List EV charging station on VoltConnect map',
            'Basic station visibility',
            'Up to 2 chargers',
            'Basic analytics',
        ],
    },
    {
        id: 'growth',
        name: 'Growth',
        tagline: 'Most popular for growing businesses',
        price: '3,000',
        priceSuffix: 'per month',
        icon: Star,
        color: '#2979FF',
        bgColor: 'rgba(41,121,255,0.08)',
        popular: true,
        features: [
            'Priority listing on the map',
            'Booking system enabled',
            'Charger availability tracking',
            'Upload station photos',
            'Customer analytics dashboard',
        ],
    },
    {
        id: 'pro',
        name: 'Pro',
        tagline: 'For serious charging operators',
        price: '7,000',
        priceSuffix: 'per month',
        icon: Rocket,
        color: '#F59E0B',
        bgColor: 'rgba(245,158,11,0.08)',
        features: [
            'Featured station placement',
            'Unlimited chargers listed',
            'Advanced analytics & reports',
            'Marketing promotion on app',
            'Priority customer support',
            'Custom branding options',
        ],
    },
];

const OperatorPricingPage = () => {
    const navigate = useNavigate();
    const { user, setUserPlan, userPlan } = useAuth();
    const { initializePayment, loading } = useRazorpay();

    const handleSelectPlan = async (plan) => {
        if (!user) {
            navigate('/signup', { state: { returnTo: '/pricing-operator' } });
            return;
        }

        if (plan.price === '0') {
            setUserPlan(plan.id);
            navigate('/operator/dashboard');
            return;
        }

        await initializePayment({
            amount: plan.price.replace(/,/g, ''),
            planId: plan.id,
            planName: `Operator ${plan.name}`
        });
    };

    return (
        <div className="page-wrapper" style={{ minHeight: 'calc(100vh - var(--nav-height))', padding: '48px 16px 64px' }}>
            <div style={{ maxWidth: 1060, margin: '0 auto' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 56 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(41,121,255,0.1)', color: 'var(--accent)', padding: '8px 18px', borderRadius: 24, fontWeight: 600, fontSize: 13, marginBottom: 20 }}>
                        <Zap size={15} /> For Station Operators
                    </div>
                    <h1 style={{ fontSize: 38, fontWeight: 800, marginBottom: 14, lineHeight: 1.2 }}>
                        Power Up Your EV Charging Business
                    </h1>
                    <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 580, margin: '0 auto', lineHeight: 1.6 }}>
                        Join Hyderabad's fastest-growing EV charging network. Start free and upgrade as you grow.
                    </p>
                </div>

                {/* Plan cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 24, alignItems: 'start' }}>
                    {PLANS.map((plan) => {
                        const Icon = plan.icon;
                        return (
                            <div
                                key={plan.id}
                                className="vc-card"
                                style={{
                                    padding: '32px 28px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    position: 'relative',
                                    border: plan.popular ? `2px solid ${plan.color}` : '1px solid var(--bg-border)',
                                    borderRadius: 20,
                                    transform: plan.popular ? 'scale(1.03)' : 'none',
                                    boxShadow: plan.popular ? `0 16px 48px ${plan.color}25` : undefined,
                                    background: plan.popular ? `linear-gradient(145deg, var(--bg-card) 70%, ${plan.bgColor})` : 'var(--bg-card)',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                }}
                            >
                                {plan.popular && (
                                    <div style={{
                                        position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                                        background: `linear-gradient(90deg, ${plan.color}, #00B0FF)`,
                                        color: '#fff', padding: '5px 20px',
                                        borderRadius: 20, fontSize: 11, fontWeight: 800,
                                        letterSpacing: '0.08em', whiteSpace: 'nowrap',
                                        boxShadow: `0 4px 12px ${plan.color}50`,
                                    }}>
                                        ⭐ MOST POPULAR
                                    </div>
                                )}

                                {/* Icon + Plan Name */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: plan.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${plan.color}30` }}>
                                        <Icon size={22} color={plan.color} />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: plan.popular ? plan.color : 'var(--text-primary)' }}>
                                            {plan.name}
                                        </h3>
                                        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.3 }}>{plan.tagline}</p>
                                    </div>
                                </div>

                                {/* Price */}
                                <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--bg-border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                                        {plan.price !== '0' && (
                                            <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-muted)' }}>₹</span>
                                        )}
                                        <span style={{ fontSize: plan.price === '0' ? 36 : 38, fontWeight: 800, fontFamily: 'Rajdhani, sans-serif', color: plan.color, lineHeight: 1 }}>
                                            {plan.price === '0' ? 'FREE' : plan.price}
                                        </span>
                                    </div>
                                    <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{plan.priceSuffix}</span>
                                </div>

                                {/* Features */}
                                <div style={{ flex: 1, marginBottom: 28 }}>
                                    {plan.features.map((f, i) => (
                                        <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 13, alignItems: 'flex-start' }}>
                                            <div style={{ width: 20, height: 20, borderRadius: 6, background: plan.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                                                <Check size={13} color={plan.color} strokeWidth={3} />
                                            </div>
                                            <span style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{f}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* CTA */}
                                <button
                                    onClick={() => handleSelectPlan(plan)}
                                    disabled={userPlan === plan.id || loading}
                                    style={{
                                        width: '100%',
                                        padding: '13px',
                                        borderRadius: 12,
                                        fontSize: 15,
                                        fontWeight: 700,
                                        cursor: userPlan === plan.id ? 'default' : loading ? 'wait' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8,
                                        transition: 'all 0.2s',
                                        background: userPlan === plan.id ? 'var(--bg-border)' : plan.popular
                                            ? `linear-gradient(90deg, ${plan.color}, #00B0FF)`
                                            : plan.bgColor,
                                        color: userPlan === plan.id ? 'var(--text-muted)' : plan.popular ? '#fff' : plan.color,
                                        border: plan.popular ? 'none' : `1.5px solid ${plan.color}50`,
                                        boxShadow: plan.popular && userPlan !== plan.id ? `0 8px 20px ${plan.color}40` : 'none',
                                        opacity: userPlan === plan.id ? 0.6 : 1,
                                    }}
                                >
                                    {userPlan === plan.id ? 'Current Plan' : loading ? <><Loader2 className="spinner" size={16} /> Processing...</> : plan.price === '0' ? 'Get Started Free' : 'Start Operator Account'}
                                    {userPlan !== plan.id && !loading && <ArrowRight size={16} />}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom note */}
                <p style={{ textAlign: 'center', marginTop: 40, color: 'var(--text-muted)', fontSize: 13 }}>
                    No credit card required for the Free plan. Upgrade or cancel anytime.
                </p>
            </div>
        </div>
    );
};

export default OperatorPricingPage;
