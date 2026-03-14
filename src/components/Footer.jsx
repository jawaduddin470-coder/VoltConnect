import React from 'react';
import { Zap, Linkedin } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Footer = () => {
    const location = useLocation();
    const isMapPage = location.pathname === '/map';
    if (isMapPage) return null;

    const sections = [
        {
            title: 'Product',
            links: [
                { label: 'Map', to: '/map' },
                { label: 'Trips', to: '/trips' },
                { label: 'Queue', to: '/queue' },
                { label: 'EV Calculator', to: '/calculator' },
            ]
        },
        {
            title: 'Community',
            links: [
                { label: 'Community', to: '/community' },
                { label: 'Support', to: '#' },
                { label: 'Feedback', to: '#' },
            ]
        }
    ];

    const developers = [
        { name: 'Meraj Uddin', url: 'https://www.linkedin.com/in/merajuddin-0751a6396/' },
        { name: 'Mohd Basheer Ahmed', url: 'https://www.linkedin.com/in/mohd-basheer-ahmed-5247593a6/' },
    ];

    return (
        <footer style={{
            background: 'var(--bg-card)',
            borderTop: '1px solid var(--bg-border)',
            paddingBottom: 'calc(20px + env(safe-area-inset-bottom))',
            marginTop: 'auto',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Electric gradient divider */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                background: 'linear-gradient(90deg, transparent 0%, #2979FF 30%, #00B0FF 60%, #00E676 80%, transparent 100%)',
                opacity: 0.8,
            }} />

            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 32px 32px' }}>
                {/* Top: logo + tagline */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 48 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: 'linear-gradient(135deg, #2979FF, #00B0FF)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 16px rgba(41,121,255,0.4)',
                        }}>
                            <Zap size={18} color="#fff" fill="#fff" />
                        </div>
                        <span style={{
                            fontFamily: 'Rajdhani, sans-serif', fontWeight: 800, fontSize: 22,
                            background: 'linear-gradient(135deg, #2979FF, #00B0FF)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            letterSpacing: '0.02em',
                        }}>VoltConnect</span>
                    </div>
                    <p style={{
                        margin: 0, fontSize: 14, color: 'var(--text-muted)',
                        textAlign: 'center', maxWidth: 360, lineHeight: 1.6,
                    }}>
                        Smart EV Charging Network for Faster, Smarter Travel.
                    </p>
                </div>

                {/* 3-column grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: '40px 32px',
                    marginBottom: 40,
                }}>
                    {sections.map(section => (
                        <div key={section.title}>
                            <h4 style={{ margin: '0 0 16px', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                {section.title}
                            </h4>
                            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {section.links.map(link => (
                                    <li key={link.label}>
                                        <Link
                                            to={link.to}
                                            style={{
                                                color: 'var(--text-secondary)',
                                                textDecoration: 'none',
                                                fontSize: 14,
                                                transition: 'all 0.2s',
                                                display: 'inline-block',
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.color = 'var(--accent)';
                                                e.currentTarget.style.transform = 'translateX(4px)';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.color = 'var(--text-secondary)';
                                                e.currentTarget.style.transform = 'translateX(0)';
                                            }}
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Developers column */}
                    <div>
                        <h4 style={{ margin: '0 0 16px', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                            Developers
                        </h4>
                        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {developers.map(dev => (
                                <li key={dev.name}>
                                    <a
                                        href={dev.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            color: 'var(--text-secondary)',
                                            textDecoration: 'none',
                                            fontSize: 14,
                                            transition: 'all 0.2s',
                                            padding: '6px 10px',
                                            borderRadius: 8,
                                            border: '1px solid transparent',
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.color = '#0077B5';
                                            e.currentTarget.style.borderColor = 'rgba(0,119,181,0.3)';
                                            e.currentTarget.style.background = 'rgba(0,119,181,0.08)';
                                            e.currentTarget.style.boxShadow = '0 0 12px rgba(0,119,181,0.2)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.color = 'var(--text-secondary)';
                                            e.currentTarget.style.borderColor = 'transparent';
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        <Linkedin size={15} color="currentColor" />
                                        {dev.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom divider + copyright */}
                <div style={{ borderTop: '1px solid var(--bg-border)', paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
                        © 2026 VoltConnect. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
