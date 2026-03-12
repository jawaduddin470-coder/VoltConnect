import React from 'react';

const shimmer = {
    background: 'linear-gradient(90deg, var(--bg-card) 25%, var(--bg-border) 50%, var(--bg-card) 75%)',
    backgroundSize: '400% 100%',
    animation: 'skeleton-shimmer 1.4s ease infinite',
    borderRadius: 10,
};

const PageSkeleton = () => (
    <div style={{ padding: '32px 24px', maxWidth: 900, margin: '0 auto', width: '100%' }}>
        <style>{`
            @keyframes skeleton-shimmer {
                0% { background-position: 100% 0; }
                100% { background-position: -100% 0; }
            }
        `}</style>

        {/* Heading */}
        <div style={{ ...shimmer, height: 36, width: '45%', marginBottom: 12 }} />
        <div style={{ ...shimmer, height: 20, width: '60%', marginBottom: 40 }} />

        {/* Card grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {[1, 2, 3].map(i => (
                <div key={i} style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--bg-border)',
                    borderRadius: 16,
                    padding: 24,
                }}>
                    <div style={{ ...shimmer, height: 48, width: 48, borderRadius: 12, marginBottom: 16 }} />
                    <div style={{ ...shimmer, height: 22, width: '70%', marginBottom: 10 }} />
                    <div style={{ ...shimmer, height: 16, width: '90%', marginBottom: 8 }} />
                    <div style={{ ...shimmer, height: 16, width: '75%' }} />
                </div>
            ))}
        </div>
    </div>
);

export default PageSkeleton;
