import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, MapPin, PlusCircle, BarChart3, Clock, AlertTriangle, Settings, LogOut, Zap
} from 'lucide-react';

const navItems = [
    { to: '/operator/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/operator/stations', icon: MapPin, label: 'My Stations' },
    { to: '/operator/add-station', icon: PlusCircle, label: 'Add Station' },
    { to: '/operator/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/operator/queue', icon: Clock, label: 'Queue Activity' },
    { to: '/operator/faults', icon: AlertTriangle, label: 'Faults' },
    { to: '/operator/settings', icon: Settings, label: 'Settings' },
];

export default function OperatorNav() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className="hidden lg:flex"
                style={{
                    position: 'fixed',
                    top: 'var(--nav-height)',
                    left: 0,
                    width: 'var(--sidebar-width)',
                    bottom: 0,
                    flexDirection: 'column',
                    background: 'var(--bg-card)',
                    borderRight: '1px solid var(--bg-border)',
                    padding: '24px 16px',
                    zIndex: 40,
                    overflow: 'auto',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, paddingLeft: 8 }}>
                    <Zap size={16} color="#00E676" />
                    <span style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Operator</span>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '12px 16px',
                                borderRadius: 12,
                                textDecoration: 'none',
                                fontWeight: 500,
                                fontSize: 15,
                                transition: 'all 0.2s ease',
                                background: isActive ? 'rgba(0,230,118,0.1)' : 'transparent',
                                color: isActive ? '#00E676' : 'var(--text-secondary)',
                                border: isActive ? '1px solid rgba(0,230,118,0.3)' : '1px solid transparent',
                            })}
                        >
                            <Icon size={18} />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 16px', borderRadius: 12,
                        border: 'none', background: 'transparent',
                        color: 'var(--status-red)', cursor: 'pointer',
                        fontSize: 15, fontWeight: 500, width: '100%',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(244,67,54,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </aside>

            {/* Mobile Bottom Nav */}
            <nav
                className="lg:hidden"
                style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 'calc(var(--bottom-nav) + env(safe-area-inset-bottom))',
                    background: 'var(--bg-card)',
                    borderTop: '1px solid var(--bg-border)',
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    zIndex: 50,
                    paddingBottom: 'env(safe-area-inset-bottom)',
                }}
            >
                {navItems.slice(0, 5).map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        style={({ isActive }) => ({
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 2,
                            textDecoration: 'none',
                            color: isActive ? '#00E676' : 'var(--text-muted)',
                            transition: 'color 0.2s ease',
                            padding: '6px 4px',
                            borderRadius: 10,
                        })}
                    >
                        <Icon size={21} />
                        <span style={{ fontSize: 10, fontWeight: 600, textAlign: 'center' }}>
                            {label.split(' ')[0]}
                        </span>
                    </NavLink>
                ))}
            </nav>
        </>
    );
}
