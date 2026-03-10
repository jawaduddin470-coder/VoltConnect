import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { stations } from '../../data/stations';

// In a real application, we would fetch the stations belonging to the specific operator.
// Since we don't have a backend for that, we'll just slice the existing global stations array as a simulation.
const initialStations = stations.slice(0, 6);

const MyStationsPage = () => {
    const [search, setSearch] = useState('');
    const [myStations, setMyStations] = useState(initialStations);

    const filtered = myStations.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.area.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this station?')) {
            setMyStations(prev => prev.filter(s => s.id !== id));
        }
    };

    return (
        <div className="page-container" style={{ maxWidth: 1000 }}>
            <div style={{ padding: '0 8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <h1 style={{ fontSize: 28, marginBottom: 4 }}>My Stations</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Manage and monitor your charging station listings.</p>
                    </div>
                    <Link to="/operator/add-station" className="btn-primary" style={{ padding: '10px 16px', fontSize: 14 }}>
                        <PlusCircle size={16} /> Add New Station
                    </Link>
                </div>

                <div className="vc-card" style={{ padding: 24 }}>
                    <div style={{ marginBottom: 20, position: 'relative', maxWidth: 400 }}>
                        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search your stations..."
                            className="vc-input"
                            style={{ paddingLeft: 40 }}
                        />
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--bg-border)', color: 'var(--text-muted)', fontSize: 12 }}>
                                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>STATION NAME</th>
                                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>LOCATION</th>
                                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>STATUS</th>
                                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>PRICE</th>
                                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(s => (
                                    <tr key={s.id} style={{ borderBottom: '1px solid var(--bg-border)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-primary)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <td style={{ padding: '16px', fontWeight: 500 }}>
                                            {s.name}
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>⚡ {s.speed.split('(')[1]?.replace(')', '')}</div>
                                        </td>
                                        <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: 14 }}>{s.area}</td>
                                        <td style={{ padding: '16px' }}>
                                            <span className={`badge-${s.status}`} style={{ fontSize: 11, padding: '4px 8px' }}>{s.status}</span>
                                        </td>
                                        <td style={{ padding: '16px', color: 'var(--text-primary)', fontWeight: 600, fontSize: 14 }}>₹{s.price}/kWh</td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button style={{ background: 'none', border: 'none', color: '#00B4D8', cursor: 'pointer', padding: 4 }} title="Edit">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(s.id)} style={{ background: 'none', border: 'none', color: '#F44336', cursor: 'pointer', padding: 4 }} title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            No stations found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyStationsPage;
