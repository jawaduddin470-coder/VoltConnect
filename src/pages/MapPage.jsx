import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, Filter, X, MapPin, Navigation, Map as MapIcon, Crosshair } from 'lucide-react';
import { stations } from '../data/stations';

// --- Custom Icons ---
const createCustomIcon = (status) => {
    const color = status === 'available' ? '#00E676' : status === 'busy' ? '#FF9800' : '#F44336';
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="
            background-color: ${color};
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 0 10px ${color}80;
        "></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -10]
    });
};

const createClusterCustomIcon = function (cluster) {
    const count = cluster.getChildCount();
    return L.divIcon({
        html: `<div style="
            background: rgba(41, 121, 255, 0.9);
            color: white;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
            border: 2px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        ">${count}</div>`,
        className: 'custom-cluster-marker',
        iconSize: L.point(36, 36, true),
    });
};

// Component to handle map centering programmatically
const MapController = ({ centerMarker }) => {
    const map = useMap();
    useEffect(() => {
        if (centerMarker) {
            map.flyTo([centerMarker.lat, centerMarker.lng], 14, { duration: 1.5 });
        }
    }, [centerMarker, map]);

    // Expose a locate function to the window for the custom control
    useEffect(() => {
        window.locateUser = () => {
            map.flyTo([17.3850, 78.4867], 11, { duration: 1.5 });
        };
        return () => { delete window.locateUser; };
    }, [map]);

    return null;
};

// --- Main Page Component ---
const MapPage = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [showList, setShowList] = useState(false); // Mobile bottom sheet toggle
    const [selectedStation, setSelectedStation] = useState(null);
    const [filterConnector, setFilterConnector] = useState('All');
    const [filterSpeed, setFilterSpeed] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [showFilters, setShowFilters] = useState(false);

    // Filter logic
    const filtered = useMemo(() => {
        return stations.filter(s => {
            const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.area.toLowerCase().includes(search.toLowerCase());
            const matchConn = filterConnector === 'All' || s.connectors.includes(filterConnector);
            const matchSpeed = filterSpeed === 'All' || s.speed === filterSpeed;
            const matchStatus = filterStatus === 'All' || s.status === filterStatus;
            return matchSearch && matchConn && matchSpeed && matchStatus;
        });
    }, [search, filterConnector, filterSpeed, filterStatus]);

    const handleSelectListItem = (station) => {
        setSelectedStation(station);
        if (window.innerWidth < 1024) {
            setShowList(false); // Close bottom sheet on mobile when a station is selected
        }
    };

    return (
        <div className="page-wrapper" style={{ padding: 0, height: 'calc(100vh - var(--nav-height))', position: 'relative', overflow: 'hidden' }}>

            {/* The Map */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
                <MapContainer center={[17.3850, 78.4867]} zoom={11} zoomControl={false} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />

                    <MapController centerMarker={selectedStation} />

                    <MarkerClusterGroup
                        chunkedLoading
                        iconCreateFunction={createClusterCustomIcon}
                        maxClusterRadius={40}
                        spiderfyOnMaxZoom={true}
                    >
                        {filtered.map(station => (
                            <Marker
                                key={station.id}
                                position={[station.lat, station.lng]}
                                icon={createCustomIcon(station.status)}
                                eventHandlers={{
                                    click: () => setSelectedStation(station)
                                }}
                            >
                                <Popup className="custom-popup" closeButton={false} offset={[0, -10]}>
                                    <div style={{ padding: '4px', minWidth: '220px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1A202C' }}>{station.name}</h3>
                                                <span style={{ fontSize: 12, color: '#4A5568' }}>{station.area}</span>
                                            </div>
                                            <span style={{
                                                fontSize: 10, fontWeight: 700, textTransform: 'uppercase', padding: '2px 6px', borderRadius: 4,
                                                background: station.status === 'available' ? '#E6FFFA' : station.status === 'busy' ? '#FFFAF0' : '#FFF5F5',
                                                color: station.status === 'available' ? '#047857' : station.status === 'busy' ? '#C05621' : '#C53030',
                                            }}>
                                                {station.status}
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                                            <span style={{ fontSize: 11, padding: '2px 6px', background: '#F1F5F9', borderRadius: 4, color: '#475569' }}>⚡ {station.speed.split('(')[1]?.replace(')', '') || station.speed}</span>
                                            <span style={{ fontSize: 11, padding: '2px 6px', background: '#F1F5F9', borderRadius: 4, color: '#475569' }}>₹{station.price}/kWh</span>
                                        </div>

                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button onClick={() => navigate(`/station/${station.id}`)} style={{ flex: 1, padding: '8px', background: '#2979FF', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>View</button>
                                            <button style={{ padding: '8px', background: '#F1F5F9', color: '#1A202C', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Navigation size={14} /></button>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MarkerClusterGroup>
                </MapContainer>
            </div>

            {/* Floating Top Search Bar */}
            <div style={{
                position: 'absolute', top: 16, left: 16, right: 16, zIndex: 1000,
                display: 'flex', justifyContent: 'center', pointerEvents: 'none'
            }}>
                <div style={{
                    width: '100%', maxWidth: 400, pointerEvents: 'auto',
                    display: 'flex', flexDirection: 'column', gap: 8
                }}>
                    <div className="vc-card" style={{
                        display: 'flex', alignItems: 'center', padding: '12px 16px', borderRadius: 16,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.15)', background: 'var(--bg-card)'
                    }}>
                        <Search size={20} style={{ color: 'var(--text-muted)', marginRight: 12 }} />
                        <input
                            type="text"
                            placeholder="Search stations, areas..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                                fontSize: 15, color: 'var(--text-primary)', width: '100%'
                            }}
                        />
                        <button onClick={() => setShowFilters(!showFilters)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: showFilters ? 'var(--accent)' : 'var(--text-muted)', display: 'flex', padding: 4 }}>
                            <Filter size={20} />
                        </button>
                    </div>

                    {/* Filters Dropdown */}
                    {showFilters && (
                        <div className="vc-card" style={{ padding: 16, borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div>
                                    <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4, display: 'block' }}>Speed</label>
                                    <select value={filterSpeed} onChange={e => setFilterSpeed(e.target.value)} className="vc-input" style={{ width: '100%', padding: '8px 12px' }}>
                                        {['All', 'Standard (7.4 kW)', 'Standard (22 kW)', 'Fast (50 kW)', 'Ultra Fast (150 kW)'].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4, display: 'block' }}>Status</label>
                                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="vc-input" style={{ width: '100%', padding: '8px 12px' }}>
                                            {['All', 'available', 'busy', 'faulty'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Map Action Buttons (Bottom Right) */}
            <div style={{
                position: 'absolute', bottom: window.innerWidth < 1024 ? (showList ? 60 : 80) : 24, right: window.innerWidth < 1024 ? 16 : (showList ? 416 : 24),
                zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 12, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                <button
                    onClick={() => { if (window.locateUser) window.locateUser(); }}
                    style={{
                        width: 44, height: 44, borderRadius: 22, background: 'var(--bg-card)', border: '1px solid var(--bg-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)', color: 'var(--text-primary)'
                    }}
                >
                    <Crosshair size={20} />
                </button>
                <button
                    onClick={() => setShowList(!showList)}
                    style={{
                        width: 44, height: 44, borderRadius: 22, background: showList ? 'var(--accent)' : 'var(--bg-card)', border: '1px solid var(--bg-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)', color: showList ? '#fff' : 'var(--text-primary)'
                    }}
                >
                    <MapIcon size={20} />
                </button>
            </div>

            {/* Right Panel (Desktop) / Bottom Sheet (Mobile) for Station List */}
            <div style={{
                position: 'absolute',
                top: window.innerWidth >= 1024 ? 0 : 'auto',
                bottom: 0,
                right: 0,
                width: window.innerWidth >= 1024 ? 400 : '100%',
                maxHeight: window.innerWidth >= 1024 ? '100%' : '70vh',
                height: window.innerWidth >= 1024 ? '100%' : 'auto',
                background: 'var(--bg-card)',
                boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
                zIndex: 1001,
                transform: showList ? 'translate(0, 0)' : (window.innerWidth >= 1024 ? 'translateX(100%)' : 'translateY(100%)'),
                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                flexDirection: 'column',
                borderTopLeftRadius: window.innerWidth < 1024 ? 24 : 0,
                borderTopRightRadius: window.innerWidth < 1024 ? 24 : 0,
            }}>
                {/* Mobile Handle */}
                {window.innerWidth < 1024 && (
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '12px 0 4px', cursor: 'pointer' }} onClick={() => setShowList(false)}>
                        <div style={{ width: 40, height: 4, background: 'var(--bg-border)', borderRadius: 2 }} />
                    </div>
                )}

                <div style={{ padding: '20px 24px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--bg-border)' }}>
                    <h2 style={{ fontSize: 20, margin: 0 }}>Nearby Stations ({filtered.length})</h2>
                    {window.innerWidth >= 1024 && (
                        <button onClick={() => setShowList(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                            <X size={24} />
                        </button>
                    )}
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {filtered.map(s => (
                            <div key={s.id} onClick={() => handleSelectListItem(s)}
                                className="vc-card"
                                style={{
                                    padding: '16px', cursor: 'pointer', transition: 'all 0.2s',
                                    border: selectedStation?.id === s.id ? '1px solid var(--accent)' : '1px solid var(--bg-border)'
                                }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: 16, margin: '0 0 4px 0', fontWeight: 600 }}>{s.name}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-muted)' }}>
                                            <MapPin size={12} /> {s.area}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>₹{s.price}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>per kWh</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <span className={`badge-${s.status}`} style={{ padding: '4px 8px', fontSize: 11 }}>{s.status}</span>
                                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>⚡ {s.speed.split('(')[1]?.replace(')', '') || s.speed}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Global style injections for Leaflet popups to match dark/light theme */}
            <style jsx="true">{`
                .leaflet-popup-content-wrapper {
                    background: var(--bg-card);
                    color: var(--text-primary);
                    border-radius: 12px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2) !important;
                    overflow: hidden;
                    border: 1px solid var(--bg-border);
                }
                .leaflet-popup-tip {
                    background: var(--bg-card);
                    border: 1px solid var(--bg-border);
                    border-top: none;
                    border-left: none;
                }
                .leaflet-popup-content {
                    margin: 12px;
                }
                .leaflet-container {
                    background: #e5e7eb;
                    font-family: 'DM Sans', sans-serif;
                }
                [data-theme='dark'] .leaflet-container {
                    background: #1a202c; /* Avoid white flashes in dark mode */
                }
                [data-theme='dark'] .leaflet-tile {
                    filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
                }
            `}</style>
        </div>
    );
};

export default MapPage;
