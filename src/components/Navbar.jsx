import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { Zap, Sun, Moon, User } from 'lucide-react';

const Navbar = () => {
    const { user, userRole } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();

    const isPublic = ['/', '/login', '/signup'].includes(location.pathname);

    return (
        <header
            className="glass-nav"
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
                height: 'var(--nav-height)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 16px',
            }}
        >
            {/* Logo */}
            <Link
                to={user ? (userRole === 'driver' ? '/map' : '/operator/dashboard') : '/'}
                style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}
            >
                <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'linear-gradient(135deg, #2979FF, #00B4D8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Zap size={20} color="#fff" fill="#fff" />
                </div>
                <span style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 22, color: 'var(--text-primary)' }}>
                    Volt<span style={{ color: 'var(--accent)' }}>Connect</span>
                </span>
            </Link>

            {/* Right side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                    style={{
                        width: 38, height: 38, borderRadius: '50%',
                        border: '1.5px solid var(--bg-border)',
                        background: 'transparent', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text-secondary)', transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-glow)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--bg-border)'; e.currentTarget.style.background = 'transparent'; }}
                >
                    {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
                </button>

                {/* Profile avatar (logged-in only) */}
                {user && (
                    <Link to="/profile" style={{ textDecoration: 'none' }}>
                        <div
                            style={{
                                width: 38, height: 38, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #2979FF, #00B4D8)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', transition: 'transform 0.2s ease',
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <User size={18} color="#fff" />
                        </div>
                    </Link>
                )}

                {/* Login / Sign Up (public pages, not logged in) */}
                {isPublic && !user && (
                    <div style={{ display: 'flex', gap: 8 }}>
                        <Link to="/login" className="btn-outline" style={{ padding: '8px 16px', fontSize: 14, borderRadius: 10 }}>
                            Login
                        </Link>
                        <Link to="/signup" className="btn-primary" style={{ padding: '8px 16px', fontSize: 14, borderRadius: 10 }}>
                            Sign Up
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;
