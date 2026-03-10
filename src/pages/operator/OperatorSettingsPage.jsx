import React, { useState } from 'react';
import { Save, Building2, Mail, Phone, CreditCard, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const OperatorSettingsPage = () => {
    const { userPlan } = useAuth();
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        companyName: 'ChargeZone EV',
        contactName: 'Operator Admin',
        email: 'operator@chargezone.example.com',
        phone: '+91 98765 43210',
        payoutMethod: 'Bank Transfer (HDFC ***4321)',
        notificationsAlerts: true,
        notificationsReports: true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);
        setTimeout(() => {
            setSubmitting(false);
            alert('Settings saved successfully!');
        }, 800);
    };

    return (
        <div className="page-container" style={{ maxWidth: 800 }}>
            <div style={{ padding: '0 8px' }}>
                <h1 style={{ fontSize: 28, marginBottom: 4 }}>Operator Settings</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Manage your business profile and preferences.</p>

                <form onSubmit={handleSubmit} className="vc-card" style={{ padding: 32 }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid var(--bg-border)' }}>
                        <div>
                            <h3 style={{ fontSize: 18, marginBottom: 4 }}>Current Plan</h3>
                            <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                                You are currently on the <strong style={{ color: '#00E676', textTransform: 'capitalize' }}>{userPlan}</strong> plan.
                            </div>
                        </div>
                        <button type="button" className="btn-outline" style={{ fontSize: 13, padding: '6px 14px' }}>
                            Upgrade Plan
                        </button>
                    </div>

                    <h3 style={{ fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Building2 size={18} color="var(--text-secondary)" /> Business Profile
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                            <div>
                                <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: 8 }}>Company Name</label>
                                <input type="text" className="vc-input" value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: 8 }}>Primary Contact Name</label>
                                <input type="text" className="vc-input" value={formData.contactName} onChange={e => setFormData({ ...formData, contactName: e.target.value })} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                            <div>
                                <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: 8 }}>Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input type="email" className="vc-input" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ paddingLeft: 40 }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: 8 }}>Phone Number</label>
                                <div style={{ position: 'relative' }}>
                                    <Phone size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input type="tel" className="vc-input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={{ paddingLeft: 40 }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <h3 style={{ fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CreditCard size={18} color="var(--text-secondary)" /> Financial
                    </h3>

                    <div style={{ marginBottom: 32 }}>
                        <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: 8 }}>Payout Method</label>
                        <select className="vc-input" value={formData.payoutMethod} onChange={e => setFormData({ ...formData, payoutMethod: e.target.value })}>
                            <option>Bank Transfer (HDFC ***4321)</option>
                            <option>Add New Bank Account</option>
                        </select>
                    </div>

                    <h3 style={{ fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Bell size={18} color="var(--text-secondary)" /> Notifications
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                            <input type="checkbox" checked={formData.notificationsAlerts} onChange={e => setFormData({ ...formData, notificationsAlerts: e.target.checked })} style={{ width: 18, height: 18, cursor: 'pointer' }} />
                            <span style={{ fontSize: 14 }}>Real-time Fault Alerts (Email & SMS)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                            <input type="checkbox" checked={formData.notificationsReports} onChange={e => setFormData({ ...formData, notificationsReports: e.target.checked })} style={{ width: 18, height: 18, cursor: 'pointer' }} />
                            <span style={{ fontSize: 14 }}>Weekly Performance Reports (Email)</span>
                        </label>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 20, borderTop: '1px solid var(--bg-border)' }}>
                        <button type="submit" disabled={submitting} className="btn-primary" style={{ padding: '0 24px', opacity: submitting ? 0.7 : 1, background: '#00E676', borderColor: '#00E676' }}>
                            {submitting ? 'Saving...' : <><Save size={18} /> Save Settings</>}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default OperatorSettingsPage;
