import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const CONNECTORS = ['CCS2', 'CHAdeMO', 'Type 2', 'Ather Type'];
const SPEEDS = ['Standard (7.4 kW)', 'Standard (22 kW)', 'Fast (50 kW)', 'Ultra Fast (150 kW)'];
const AMENITIES = ['Cafe', 'Restaurant', 'Shopping', 'Restroom', 'Convenience Store'];

const AddStationPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        area: '',
        lat: '',
        lng: '',
        price: '16',
        speed: SPEEDS[2],
        description: '',
    });
    const [selectedConnectors, setSelectedConnectors] = useState(['CCS2']);
    const [selectedAmenities, setSelectedAmenities] = useState([]);

    const handleToggle = (item, list, setList) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedConnectors.length === 0) {
            alert('Please select at least one connector type.');
            return;
        }

        setSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setSubmitting(false);
            console.log('New Station Data:', { ...formData, connectors: selectedConnectors, amenities: selectedAmenities });
            navigate('/operator/stations');
        }, 1200);
    };

    return (
        <div className="page-container" style={{ maxWidth: 800 }}>
            <div style={{ padding: '0 8px' }}>
                <Link to="/operator/stations" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: 20, fontSize: 14 }}>
                    <ArrowLeft size={16} /> Back to My Stations
                </Link>

                <h1 style={{ fontSize: 28, marginBottom: 4 }}>Add New Station</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>List a new charging station on the VoltConnect network.</p>

                <form onSubmit={handleSubmit} className="vc-card" style={{ padding: 32 }}>

                    <h3 style={{ fontSize: 18, marginBottom: 20, borderBottom: '1px solid var(--bg-border)', paddingBottom: 12 }}>Basic Details</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }}>
                        <div>
                            <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: 8 }}>Station Name</label>
                            <input
                                required type="text" className="vc-input" placeholder="e.g. ChargeZone Hitech City Hub"
                                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                            <div>
                                <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: 8 }}>Area / Neighborhood</label>
                                <input
                                    required type="text" className="vc-input" placeholder="e.g. Hitech City"
                                    value={formData.area} onChange={e => setFormData({ ...formData, area: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: 8 }}>Price per kWh (₹)</label>
                                <input
                                    required type="number" min="1" step="0.5" className="vc-input" placeholder="16"
                                    value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div>
                                <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: 8 }}>Latitude</label>
                                <input
                                    required type="number" step="0.0001" className="vc-input" placeholder="17.4482"
                                    value={formData.lat} onChange={e => setFormData({ ...formData, lat: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: 8 }}>Longitude</label>
                                <input
                                    required type="number" step="0.0001" className="vc-input" placeholder="78.3914"
                                    value={formData.lng} onChange={e => setFormData({ ...formData, lng: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <h3 style={{ fontSize: 18, marginBottom: 20, borderBottom: '1px solid var(--bg-border)', paddingBottom: 12 }}>Charging Specifications</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 32 }}>
                        <div>
                            <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: 12 }}>Supported Connectors</label>
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                {CONNECTORS.map(c => (
                                    <button
                                        type="button" key={c}
                                        onClick={() => handleToggle(c, selectedConnectors, setSelectedConnectors)}
                                        style={{
                                            padding: '8px 16px', borderRadius: 8, border: '1.5px solid', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
                                            borderColor: selectedConnectors.includes(c) ? 'var(--accent)' : 'var(--bg-border)',
                                            background: selectedConnectors.includes(c) ? 'rgba(41,121,255,0.1)' : 'transparent',
                                            color: selectedConnectors.includes(c) ? 'var(--accent)' : 'var(--text-primary)'
                                        }}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: 8 }}>Max Charging Speed</label>
                            <select
                                className="vc-input"
                                value={formData.speed} onChange={e => setFormData({ ...formData, speed: e.target.value })}
                            >
                                {SPEEDS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    <h3 style={{ fontSize: 18, marginBottom: 20, borderBottom: '1px solid var(--bg-border)', paddingBottom: 12 }}>Amenities & Details</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 32 }}>
                        <div>
                            <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: 12 }}>Nearby Amenities (Optional)</label>
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                {AMENITIES.map(a => (
                                    <button
                                        type="button" key={a}
                                        onClick={() => handleToggle(a, selectedAmenities, setSelectedAmenities)}
                                        style={{
                                            padding: '6px 14px', borderRadius: 20, border: '1.5px solid', fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
                                            borderColor: selectedAmenities.includes(a) ? '#00E676' : 'var(--bg-border)',
                                            background: selectedAmenities.includes(a) ? 'rgba(0,230,118,0.1)' : 'transparent',
                                            color: selectedAmenities.includes(a) ? '#00E676' : 'var(--text-secondary)'
                                        }}
                                    >
                                        {a}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: 8 }}>Description (Optional)</label>
                            <textarea
                                className="vc-input" placeholder="Any specific instructions for finding the charger..." rows={4} style={{ resize: 'none' }}
                                value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', paddingTop: 20, borderTop: '1px solid var(--bg-border)' }}>
                        <button type="button" onClick={() => navigate('/operator/stations')} className="btn-outline">
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting} className="btn-primary" style={{ padding: '0 24px', opacity: submitting ? 0.7 : 1 }}>
                            {submitting ? 'Saving...' : <><Save size={18} /> Save Station</>}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default AddStationPage;
