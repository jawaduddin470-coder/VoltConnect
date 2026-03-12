import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import {
    Zap, Bell, Sun, Moon, User, Menu, X
} from 'lucide-react';

const Navbar = () => {
    const { user, userRole } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const location = useLocation();

    const isPublic = ['/', '/login', '/signup'].includes(location.pathname);

    return (
        <header
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 lg:px-6 glass-nav"
            style={{
                height: 'var(--nav-height)',
            }}
        >
            {/* Logo */}
            <Link to={user ? (userRole === 'driver' ? '/map' : '/operator/dashboard') : '/'} style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'linear-gradient(135deg, #2979FF, #00B4D8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Zap size={20} color="#fff" fill="#fff" />
                </div>
                <span style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 22, color: 'var(--text-primary)' }}>
                    Volt<span style={{ color: 'var(--accent)' }}>Connect</span>
                </span>
            </Link>

            {/* Right side actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    style={{
                        width: 38, height: 38, borderRadius: '50%', border: '1.5px solid var(--bg-border)',
                        background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text-secondary)', transition: 'all 0.2s ease',
                    }}
                    title="Toggle theme"
                >
                    {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
                </button>

                {user && (
                    <>
                        {/* Notification */}
                        <button
                            style={{
                                width: 38, height: 38, borderRadius: '50%', border: '1.5px solid var(--bg-border)',
                                background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--text-secondary)', position: 'relative',
                            }}
                        >
                            <Bell size={17} />
                            <span style={{
                                position: 'absolute', top: 6, right: 6, width: 8, height: 8,
                                borderRadius: '50%', background: 'var(--status-red)',
                            }} />
                        </button>

                        {/* Avatar */}
                        <Link to="/profile" style={{ textDecoration: 'none' }}>
                            <div style={{
                                width: 38, height: 38, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #2979FF, #00B4D8)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                            }}>
                                <User size={18} color="#fff" />
                            </div>
                        </Link>
                    </>
                )}

                {isPublic && !user && (
                    <div style={{ display: 'flex', gap: 8 }}>
                        <Link to="/login" className="btn-outline" style={{ padding: '8px 18px', fontSize: 14, borderRadius: 10 }}>Login</Link>
                        <Link to="/signup" className="btn-primary" style={{ padding: '8px 18px', fontSize: 14, borderRadius: 10 }}>Sign Up</Link>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;
