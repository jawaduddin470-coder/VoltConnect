import React from 'react';
import { Linkedin, Zap } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Footer = () => {
    const location = useLocation();
    const isMapPage = location.pathname === '/map';

    // Do not render footer on map page to maximize map visibility
    if (isMapPage) return null;

    return (
        <footer style={{
            textAlign: 'center',
            padding: '32px 24px',
            borderTop: '1px solid var(--bg-border)',
            background: 'var(--bg-card)',
            color: 'var(--text-muted)',
            fontSize: 14,
            marginTop: 'auto', // Pushes footer to the bottom of the flex container
            paddingBottom: 'calc(32px + env(safe-area-inset-bottom))'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
                <Zap size={14} color="var(--accent)" fill="var(--accent)" />
                <span style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 16, color: 'var(--text-secondary)' }}>VoltConnect</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                <p style={{ margin: 0 }}>
                    Developed by <strong style={{ color: 'var(--text-primary)' }}>Mohammed Meraj Uddin</strong> & <strong style={{ color: 'var(--text-primary)' }}>Mohd Basheer Ahmed</strong>
                </p>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <a
                        href="https://www.linkedin.com/in/merajuddin-0751a6396"
                        target="_blank" rel="noopener noreferrer"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            color: 'var(--accent)',
                            textDecoration: 'none',
                            fontWeight: 500,
                            transition: 'opacity 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    >
                        <Linkedin size={14} />
                        Meraj Uddin
                    </a>
                    <a
                        href="https://www.linkedin.com/in/mohd-basheer-ahmed-5247593a6/?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BUCTVRMwzSIGpz55RAd6TkQ%3D%3D"
                        target="_blank" rel="noopener noreferrer"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            color: 'var(--accent)',
                            textDecoration: 'none',
                            fontWeight: 500,
                            transition: 'opacity 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    >
                        <Linkedin size={14} />
                        Basheer Ahmed
                    </a>
                </div>
            </div>
            <p style={{ marginTop: 20, fontSize: 12 }}>
                © {new Date().getFullYear()} VoltConnect · Smart EV Charging Platform<br />
                Hyderabad, India
            </p>
        </footer>
    );
};

export default Footer;
