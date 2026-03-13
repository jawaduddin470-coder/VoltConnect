import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Zap, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

const LoginPage = () => {
    const { user, login, loginWithGoogle, userRole, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Auto-navigate if already logged in (essential for redirect login flow)
    React.useEffect(() => {
        if (!authLoading && user) {
            navigate(userRole === 'driver' ? '/map' : '/operator/dashboard', { replace: true });
        }
    }, [user, authLoading, userRole, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate(userRole === 'driver' ? '/map' : '/operator/dashboard');
        } catch (err) {
            console.error('Login error details:', err);
            setError(err.message.replace('Firebase: ', '').replace(/\(.*\)$/, '').trim());
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setError('');
        try {
            console.log("Initiating Google Login...");
            const result = await loginWithGoogle();
            // If popup succeeded, result is truthy → navigate immediately
            if (result) {
                navigate(userRole === 'driver' ? '/map' : '/operator/dashboard');
            }
            // If redirect was triggered (popup blocked), the page will navigate away — do nothing
        } catch (err) {
            console.error('Google login error details:', err.code, err.message);
            if (err.code === 'auth/popup-closed-by-user') {
                setError('Sign-in cancelled. Please try again.');
            } else if (err.code === 'auth/unauthorized-domain') {
                setError('This domain is not authorized for Google Sign-In. Check your Firebase Console → Authentication → Settings → Authorized domains.');
            } else if (err.code === 'auth/cancelled-popup-request') {
                // silently ignore — another popup was opened
            } else {
                setError(err.message.replace('Firebase: ', '').replace(/\(.*\)$/, '').trim());
            }
        }
    };

    return (
        <div className="page-container" style={{
            position: 'relative', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: 'calc(100vh - var(--nav-height))'
        }}>
            {/* Background glow */}
            <div style={{
                position: 'absolute', top: '20%', right: '10%',
                width: 400, height: 400, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(41,121,255,0.1) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            <div className="vc-card" style={{ width: '100%', maxWidth: 440, padding: '40px 36px', position: 'relative', zIndex: 10, margin: 'auto' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{
                        width: 52, height: 52, borderRadius: 16,
                        background: 'linear-gradient(135deg, #2979FF, #00B4D8)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 14px',
                    }}>
                        <Zap size={26} color="#fff" fill="#fff" />
                    </div>
                    <h1 style={{ fontSize: 28, marginBottom: 6 }}>Welcome back</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Sign in to your VoltConnect account</p>
                </div>

                {error && (
                    <div style={{
                        display: 'flex', alignItems: 'flex-start', gap: 8, padding: '12px 14px',
                        background: 'rgba(244,67,54,0.1)', border: '1px solid rgba(244,67,54,0.3)',
                        borderRadius: 10, marginBottom: 20, fontSize: 13, color: 'var(--status-red)',
                    }}>
                        <AlertCircle size={15} style={{ marginTop: 1, flexShrink: 0 }} />
                        {error}
                    </div>
                )}

                {/* Google login */}
                <button
                    onClick={handleGoogle}
                    style={{
                        width: '100%', padding: '12px', borderRadius: 12,
                        border: '1.5px solid var(--bg-border)', background: 'transparent',
                        color: 'var(--text-primary)', cursor: 'pointer', fontSize: 15, fontWeight: 500,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                        marginBottom: 20, transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--bg-border)'}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <div style={{ flex: 1, height: 1, background: 'var(--bg-border)' }} />
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>or continue with email</span>
                    <div style={{ flex: 1, height: 1, background: 'var(--bg-border)' }} />
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: 6 }}>Email</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="email" required value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="vc-input" placeholder="you@example.com"
                                style={{ paddingLeft: 40 }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: 6 }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type={showPass ? 'text' : 'password'} required value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="vc-input" placeholder="••••••••"
                                style={{ paddingLeft: 40, paddingRight: 44 }}
                            />
                            <button type="button" onClick={() => setShowPass(!showPass)}
                                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary"
                        style={{ width: '100%', justifyContent: 'center', marginTop: 4, opacity: loading ? 0.7 : 1 }}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
                    Don't have an account?{' '}
                    <Link to="/signup" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Sign up free</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
