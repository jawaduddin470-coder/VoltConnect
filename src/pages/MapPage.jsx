import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import useSupercluster from 'use-supercluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
    Search, Filter, X, MapPin, Navigation, Map as MapIcon,
    Crosshair, Zap, ExternalLink, Wifi, WifiOff, AlertCircle, Loader2, Car, Clock
} from 'lucide-react';
import { useVehicle } from '../context/VehicleContext';
import { db } from '../firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';

// ─── Constants ──────────────────────────────────────────────────────────────
const HYDERABAD = [17.3850, 78.4867];
const CACHE_KEY = 'voltconnect_stations_cache';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// ─── Helper: parse Firestore data → station objects ─────────────────────
const parseFirestoreStation = (doc) => {
    const data = doc.data();
    const maxKW = data.power_kw || 0;
    const speedLabel = maxKW >= 100 ? 'Ultra Fast' : maxKW >= 40 ? 'Fast' : maxKW > 0 ? 'Standard' : 'Standard';
    
    // Simulate some busy/faulty statuses for realism since OCM rarely provides real-time status in India
    // In production, this would come from an operator API
    const rand = Math.random();
    const status = rand > 0.9 ? 'faulty' : rand > 0.6 ? 'busy' : 'available';

    return {
        id: doc.id,
        name: data.name || 'EV Charging Station',
        area: data.city || 'Hyderabad',
        address: data.address || '',
        lat: data.latitude,
        lng: data.longitude,
        status: status,
        connectors: data.connectors || ['Type 2'],
        numChargers: data.num_chargers || 1,
        operator: data.operator || null,
        maxKW: maxKW > 0 ? maxKW : null,
        speedLabel,
        // Mock queue data for wait time estimation
        queueCount: Math.floor(Math.random() * 4), 
        usageCost: data.usageCost || null,
    };
};

// ─── Custom Icons ─────────────────────────────────────────────────────────────
const EV_ICON_SVG = (color, size = 28) => `
<div style="
    width: ${size}px; height: ${size}px; border-radius: 50%;
    background: ${color}; border: 3px solid white;
    box-shadow: 0 2px 10px ${color}80, 0 0 0 4px ${color}25;
    display: flex; align-items: center; justify-content: center;
">
  <svg width="${size * 0.45}" height="${size * 0.45}" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z"/>
  </svg>
</div>`;

const SELECTED_ICON_SVG = () => `
<div style="
    width: 36px; height: 36px; border-radius: 50%;
    background: #2979FF; border: 3px solid white;
    box-shadow: 0 4px 16px #2979FF80, 0 0 0 6px #2979FF30;
    display: flex; align-items: center; justify-content: center;
    animation: pulse-marker 1.5s ease-in-out infinite;
">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z"/>
  </svg>
</div>`;

const createCustomIcon = (status, isSelected = false) => {
    if (isSelected) {
        return L.divIcon({ className: 'custom-marker', html: SELECTED_ICON_SVG(), iconSize: [36, 36], iconAnchor: [18, 18], popupAnchor: [0, -18] });
    }
    const color = status === 'available' ? '#00C853' : status === 'busy' ? '#FF9800' : '#F44336';
    return L.divIcon({ className: 'custom-marker', html: EV_ICON_SVG(color), iconSize: [28, 28], iconAnchor: [14, 14], popupAnchor: [0, -14] });
};

// ─── Supercluster Component ───────────────────────────────────────────────────
const SuperclusterMarkers = ({ stations, selectedStation, markerRefs, handleMarkerClick }) => {
    const map = useMap();
    const navigate = useNavigate();
    const [bounds, setBounds] = useState(null);
    const [zoom, setZoom] = useState(map.getZoom());

    const updateMapState = useCallback(() => {
        const b = map.getBounds();
        setBounds([
            b.getSouthWest().lng,
            b.getSouthWest().lat,
            b.getNorthEast().lng,
            b.getNorthEast().lat
        ]);
        setZoom(map.getZoom());
    }, [map]);

    useEffect(() => {
        updateMapState();
        map.on('moveend', updateMapState);
        return () => {
            map.off('moveend', updateMapState);
        };
    }, [map, updateMapState]);

    const points = useMemo(() => {
        return stations.map(station => ({
            type: 'Feature',
            properties: { cluster: false, stationId: station.id, station },
            geometry: { type: 'Point', coordinates: [station.lng, station.lat] }
        }));
    }, [stations]);

    const { clusters, supercluster } = useSupercluster({
        points,
        bounds,
        zoom,
        options: { radius: 60, maxZoom: 16 }
    });

    return (
        <>
            {clusters.map(cluster => {
                const [longitude, latitude] = cluster.geometry.coordinates;
                const { cluster: isCluster, point_count: pointCount, station } = cluster.properties;

                if (isCluster) {
                    return (
                        <Marker
                            key={`cluster-${cluster.id}`}
                            position={[latitude, longitude]}
                            icon={L.divIcon({
                                html: `<div style="background: linear-gradient(135deg,#2979FF,#00B0FF); color:white; border-radius:50%; width:38px; height:38px; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:13px; border:3px solid white; box-shadow:0 4px 14px rgba(41,121,255,0.5);">${pointCount}</div>`,
                                className: 'custom-cluster-marker',
                                iconSize: L.point(38, 38, true),
                            })}
                            eventHandlers={{
                                click: () => {
                                    const expansionZoom = Math.min(supercluster.getClusterExpansionZoom(cluster.id), 20);
                                    map.setView([latitude, longitude], expansionZoom, { animate: true });
                                }
                            }}
                        />
                    );
                }

                return (
                    <Marker
                        key={station.id}
                        position={[station.lat, station.lng]}
                        icon={createCustomIcon(station.status, selectedStation?.id === station.id)}
                        ref={el => { if (el) markerRefs.current[station.id] = el; }}
                        eventHandlers={{ click: () => handleMarkerClick(station) }}
                    >
                        <Popup className="custom-popup" closeButton={false} offset={[0, -14]}>
                            <div style={{ minWidth: 210, padding: 4 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                    <div style={{ flex: 1, paddingRight: 8 }}>
                                        <h3 style={{ margin: '0 0 2px', fontSize: 15, fontWeight: 700, color: '#1A202C', lineHeight: 1.3 }}>{station.name}</h3>
                                        <span style={{ fontSize: 12, color: '#718096' }}>{station.area}</span>
                                    </div>
                                    <StatusBadge status={station.status} />
                                </div>
                                {station.operator && (
                                    <p style={{ margin: '0 0 8px', fontSize: 12, color: '#4A5568' }}>🏢 {station.operator}</p>
                                )}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                                    {station.maxKW && (
                                        <span style={{ fontSize: 11, padding: '2px 7px', background: '#EEF2FF', borderRadius: 6, color: '#3730A3' }}>⚡ {station.maxKW} kW</span>
                                    )}
                                    <span style={{ fontSize: 11, padding: '2px 7px', background: '#F0FDF4', borderRadius: 6, color: '#166534' }}>🔌 {station.numChargers} port{station.numChargers !== 1 ? 's' : ''}</span>
                                </div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button
                                        onClick={() => navigate(`/station/${station.id}`)}
                                        style={{ flex: 1, padding: '8px', background: '#2979FF', color: '#fff', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                                    >View Details</button>
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`}
                                        target="_blank" rel="noreferrer"
                                        style={{ padding: '8px', background: '#F1F5F9', border: 'none', borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: '#334155' }}
                                    ><Navigation size={14} /></a>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </>
    );
};

// ─── Map controller ───────────────────────────────────────────────────────────
const MapController = ({ fly }) => {
    const map = useMap();
    useEffect(() => {
        if (fly) map.flyTo([fly.lat, fly.lng], 15, { duration: 1.2 });
    }, [fly, map]);
    useEffect(() => {
        window._vcLocate = () => map.flyTo(HYDERABAD, 11, { duration: 1.0 });
        return () => { delete window._vcLocate; };
    }, [map]);
    return null;
};

// ─── Status badge helper ──────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const cfg = {
        available: { bg: '#E8F5E9', color: '#2E7D32', label: 'Available', Icon: Wifi },
        busy: { bg: '#FFF3E0', color: '#E65100', label: 'Busy', Icon: WifiOff },
        faulty: { bg: '#FFEBEE', color: '#B71C1C', label: 'Faulty', Icon: AlertCircle },
    }[status] || { bg: '#F5F5F5', color: '#555', label: status, Icon: Wifi };
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700, background: cfg.bg, color: cfg.color }}>
            <cfg.Icon size={11} /> {cfg.label}
        </span>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const MapPage = () => {
    const navigate = useNavigate();
    const { selectedVehicle } = useVehicle();
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [showList, setShowList] = useState(false);
    const [selectedStation, setSelectedStation] = useState(null);
    const [placeCard, setPlaceCard] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [flyTarget, setFlyTarget] = useState(null);
    const [vehicleFilter, setVehicleFilter] = useState(false);
    const markerRefs = useRef({});

    // ─ Fetch from Firestore with cache fallback ─
    useEffect(() => {
        let isMounted = true;
        const loadStations = async () => {
            // 1. Immediately show cached data if available for instant UI
            try {
                const cached = localStorage.getItem(CACHE_KEY);
                if (cached) {
                    const { data, ts } = JSON.parse(cached);
                    if (Date.now() - ts < CACHE_TTL) {
                        if (isMounted) {
                            setStations(data);
                            setLoading(false);
                        }
                        // We still continue to fetch silently to get the latest queue times
                    }
                }
            } catch { /* ignore parse errors */ }

            try {
                // 2. Fetch fresh from Firestore
                const q = query(collection(db, 'stations'), limit(1500));
                const snapshot = await getDocs(q);
                
                if (snapshot.empty) {
                    throw new Error("No stations found in database.");
                }

                const parsed = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.latitude && data.longitude) {
                        parsed.push(parseFirestoreStation(doc));
                    }
                });

                if (isMounted) {
                    setStations(parsed);
                    setLoading(false);
                    localStorage.setItem(CACHE_KEY, JSON.stringify({ data: parsed, ts: Date.now() }));
                }
            } catch (e) {
                console.error("Error fetching map stations:", e);
                if (isMounted && stations.length === 0) {
                    setError('Could not connect to database. Please check your internet connection.');
                    setLoading(false);
                }
            }
        };
        loadStations();
        
        return () => { isMounted = false; };
    }, []);

    // ─ Filter logic ─
    const filtered = useMemo(() => {
        return stations.filter(s => {
            const matchSearch = !search.trim() || s.name.toLowerCase().includes(search.toLowerCase()) || s.area.toLowerCase().includes(search.toLowerCase()) || s.address.toLowerCase().includes(search.toLowerCase());
            const matchVehicle = !vehicleFilter || !selectedVehicle || s.connectors.some(c => c.toLowerCase().includes(selectedVehicle.connector_type.toLowerCase()) || selectedVehicle.connector_type.toLowerCase().includes(c.toLowerCase()));
            return matchSearch && matchVehicle;
        });
    }, [stations, search, vehicleFilter, selectedVehicle]);

    // ─ Marker click → open place card ─
    const handleMarkerClick = useCallback((station) => {
        setSelectedStation(station);
        setPlaceCard(station);
    }, []);

    // ─ "View on Map" from list ─
    const handleViewOnMap = useCallback((station) => {
        setFlyTarget(station);
        setSelectedStation(station);
        setPlaceCard(station);
        setShowList(false);
        // reset flyTarget after animation so same station can be re-clicked
        setTimeout(() => setFlyTarget(null), 2000);
    }, []);

    const closePlaceCard = () => {
        setPlaceCard(null);
        setSelectedStation(null);
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="page-wrapper" style={{ padding: 0, height: 'calc(100vh - var(--nav-height))', position: 'relative', overflow: 'hidden' }}>

            {/* ── Map ── */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
                <MapContainer center={HYDERABAD} zoom={11} zoomControl={false} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <MapController fly={flyTarget} />

                    <SuperclusterMarkers 
                        stations={filtered} 
                        selectedStation={selectedStation} 
                        markerRefs={markerRefs} 
                        handleMarkerClick={handleMarkerClick} 
                    />
                </MapContainer>
            </div>

            {/* ── Loading Overlay ── */}
            {loading && (
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 2000,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(10,12,16,0.7)', backdropFilter: 'blur(6px)'
                }}>
                    <div style={{ background: 'var(--bg-card)', borderRadius: 20, padding: '32px 40px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
                        <div style={{ marginBottom: 16, color: 'var(--accent)', animation: 'spin 1s linear infinite', display: 'inline-block' }}>
                            <Loader2 size={40} />
                        </div>
                        <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>Loading Stations</h3>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 14 }}>Fetching real EV charging data…</p>
                    </div>
                </div>
            )}

            {/* ── Error Banner ── */}
            {error && (
                <div style={{
                    position: 'absolute', bottom: 80, left: 16, right: 16, zIndex: 1500,
                    background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12,
                    padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, color: '#991B1B', fontSize: 13
                }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{error}</span>
                    <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#991B1B' }}><X size={16} /></button>
                </div>
            )}

            {/* ── Top Search Bar ── */}
            <div style={{ position: 'absolute', top: 16, left: 16, right: 16, zIndex: 1000, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
                <div style={{ width: '100%', maxWidth: 440, pointerEvents: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', padding: '12px 16px', borderRadius: 16,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.18)', background: 'var(--bg-card)',
                        border: '1px solid var(--bg-border)'
                    }}>
                        <Search size={18} style={{ color: 'var(--text-muted)', marginRight: 12, flexShrink: 0 }} />
                        <input
                            type="text"
                            placeholder="Search stations, areas…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 15, color: 'var(--text-primary)' }}
                        />
                        {search && (
                            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                                <X size={16} />
                            </button>
                        )}
                        <button onClick={() => setShowFilters(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: showFilters ? 'var(--accent)' : 'var(--text-muted)', display: 'flex', padding: 4, marginLeft: 4 }}>
                            <Filter size={18} />
                        </button>
                    </div>

                    {/* Station count + vehicle filter chips */}
                    {!loading && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <span style={{ background: 'rgba(41,121,255,0.12)', color: '#2979FF', padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, backdropFilter: 'blur(4px)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                ⚡ {filtered.length} station{filtered.length !== 1 ? 's' : ''}
                            </span>
                            {selectedVehicle && (
                                <button
                                    onClick={() => setVehicleFilter(v => !v)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 5,
                                        padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                                        cursor: 'pointer', backdropFilter: 'blur(4px)',
                                        border: vehicleFilter ? '1.5px solid #10B981' : '1.5px solid rgba(16,185,129,0.35)',
                                        background: vehicleFilter ? 'rgba(16,185,129,0.18)' : 'rgba(16,185,129,0.08)',
                                        color: vehicleFilter ? '#059669' : '#10B981',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    }}
                                >
                                    <Car size={12} />
                                    {vehicleFilter ? `${selectedVehicle.connector_type} Only ✓` : `Filter: ${selectedVehicle.connector_type}`}
                                    {vehicleFilter && <X size={11} />}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── FABs ── */}
            <div style={{ position: 'absolute', bottom: placeCard ? 220 : 24, right: 16, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 10, transition: 'bottom 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
                <button
                    onClick={() => window._vcLocate?.()}
                    title="Re-center to Hyderabad"
                    style={{ width: 44, height: 44, borderRadius: 22, background: 'var(--bg-card)', border: '1px solid var(--bg-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', color: 'var(--text-primary)' }}
                >
                    <Crosshair size={20} />
                </button>
                <button
                    onClick={() => setShowList(v => !v)}
                    title="Station list"
                    style={{ width: 44, height: 44, borderRadius: 22, background: showList ? 'var(--accent)' : 'var(--bg-card)', border: '1px solid var(--bg-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', color: showList ? '#fff' : 'var(--text-primary)' }}
                >
                    <MapIcon size={20} />
                </button>
            </div>

            {/* ── Station List Drawer ── */}
            <div style={{
                position: 'absolute', top: 0, bottom: 0, right: 0,
                width: Math.min(window.innerWidth, 400),
                background: 'var(--bg-card)',
                boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
                zIndex: 1001,
                transform: showList ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
                display: 'flex', flexDirection: 'column',
            }}>
                <div style={{ padding: '20px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--bg-border)' }}>
                    <div>
                        <h2 style={{ fontSize: 18, margin: '0 0 2px', fontWeight: 700 }}>Nearby Stations</h2>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{filtered.length} results</span>
                    </div>
                    <button onClick={() => setShowList(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <X size={22} />
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200, color: 'var(--text-muted)', flexDirection: 'column', gap: 12 }}>
                            <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} />
                            <span>Loading…</span>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', marginTop: 60, color: 'var(--text-muted)' }}>
                            <MapPin size={40} style={{ opacity: 0.3 }} />
                            <p>No stations found</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {filtered.map(s => (
                                <div key={s.id} className="vc-card" style={{
                                    padding: '14px 16px', cursor: 'pointer',
                                    border: selectedStation?.id === s.id ? '1.5px solid var(--accent)' : '1px solid var(--bg-border)',
                                    transition: 'all 0.2s', borderRadius: 14,
                                }}>
                                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(41,121,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Zap size={18} color="var(--accent)" />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h3 style={{ fontSize: 14, margin: '0 0 2px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                                                <MapPin size={11} /> {s.area}
                                            </div>
                                        </div>
                                        <StatusBadge status={s.status} />
                                    </div>
                                    {s.address && (
                                        <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>{s.address}</p>
                                    )}
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                                        {s.maxKW > 0 && (
                                            <span style={{ fontSize: 11, padding: '2px 7px', background: 'rgba(41,121,255,0.1)', borderRadius: 6, color: 'var(--accent)' }}>⚡ {s.maxKW} kW</span>
                                        )}
                                        <span style={{ fontSize: 11, padding: '2px 7px', background: 'rgba(0,200,83,0.1)', borderRadius: 6, color: '#00c853' }}>🔌 {s.numChargers} ports</span>
                                    </div>
                                    <button
                                        onClick={() => handleViewOnMap(s)}
                                        style={{ width: '100%', padding: '8px', background: 'rgba(41,121,255,0.08)', color: 'var(--accent)', border: '1px solid rgba(41,121,255,0.2)', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                                    >
                                        <MapPin size={13} /> View on Map
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

        {/* ── Glassmorphism Station Info Panel ── */}
            <div style={{
                position: 'absolute', left: 0, right: 0, bottom: 0,
                zIndex: 1200,
                transform: placeCard ? 'translateY(0)' : 'translateY(110%)',
                transition: 'transform 0.45s cubic-bezier(0.16,1,0.3,1)',
                pointerEvents: placeCard ? 'auto' : 'none',
            }}>
                {placeCard && (
                    <div style={{
                        background: 'rgba(13,16,23,0.88)',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        borderTopLeftRadius: 28, borderTopRightRadius: 28,
                        boxShadow: '0 -4px 40px rgba(0,0,0,0.4), 0 -1px 0 rgba(255,255,255,0.07)',
                        padding: '0 20px 28px',
                        maxWidth: 640, margin: '0 auto',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderBottom: 'none',
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        {/* Subtle electric glow at the top */}
                        <div style={{
                            position: 'absolute', top: 0, left: '20%', right: '20%', height: 1,
                            background: 'linear-gradient(90deg, transparent, #2979FF80, #00B0FF80, transparent)',
                        }} />

                        {/* Handle bar */}
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 10px' }}>
                            <div
                                style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.2)', cursor: 'pointer' }}
                                onClick={closePlaceCard}
                            />
                        </div>

                        {/* Header: name + status + close */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                                background: 'linear-gradient(135deg, rgba(41,121,255,0.25), rgba(0,176,255,0.15))',
                                border: '1px solid rgba(41,121,255,0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 16px rgba(41,121,255,0.2)',
                            }}>
                                <Zap size={20} color="#2979FF" fill="#2979FF" />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h2 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 700, color: '#fff', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {placeCard.name}
                                </h2>
                                {placeCard.operator && (
                                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>🏢 {placeCard.operator}</div>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                                    <MapPin size={11} />
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {placeCard.address || placeCard.area}
                                    </span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                <StatusBadge status={placeCard.status} />
                                <button onClick={closePlaceCard} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Stats grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 }}>
                            {/* Power */}
                            <div style={{ background: 'rgba(41,121,255,0.1)', borderRadius: 14, padding: '10px 6px', textAlign: 'center', border: '1px solid rgba(41,121,255,0.2)' }}>
                                <div style={{ fontSize: 15, fontWeight: 800, color: '#60A5FA' }}>{placeCard.maxKW > 0 ? `${placeCard.maxKW}` : '—'}</div>
                                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>kW Power</div>
                            </div>
                            {/* Chargers */}
                            <div style={{ background: 'rgba(0,200,83,0.1)', borderRadius: 14, padding: '10px 6px', textAlign: 'center', border: '1px solid rgba(0,200,83,0.2)' }}>
                                <div style={{ fontSize: 15, fontWeight: 800, color: '#4ADE80' }}>{placeCard.numChargers}</div>
                                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Ports</div>
                            </div>
                            {/* Queue length */}
                            <div style={{ background: 'rgba(255,152,0,0.1)', borderRadius: 14, padding: '10px 6px', textAlign: 'center', border: '1px solid rgba(255,152,0,0.2)' }}>
                                <div style={{ fontSize: 15, fontWeight: 800, color: '#FBBF24' }}>{placeCard.queueCount || 0}</div>
                                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>In Queue</div>
                            </div>
                            {/* Wait time */}
                            <div style={{ background: 'rgba(139,92,246,0.1)', borderRadius: 14, padding: '10px 6px', textAlign: 'center', border: '1px solid rgba(139,92,246,0.2)' }}>
                                {(() => {
                                    const q = placeCard.queueCount || 0;
                                    const c = Math.max(1, placeCard.numChargers || 1);
                                    const w = Math.round((q * 30) / c);
                                    return q === 0
                                        ? <><div style={{ fontSize: 12, fontWeight: 800, color: '#4ADE80' }}>Free</div><div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>No Wait</div></>
                                        : <><div style={{ fontSize: 15, fontWeight: 800, color: w > 30 ? '#F87171' : '#C084FC' }}>~{w}m</div><div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Wait</div></>;
                                })()}
                            </div>
                        </div>

                        {/* Connector type tags */}
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', alignSelf: 'center', fontWeight: 600, marginRight: 2 }}>Connectors:</span>
                            {placeCard.connectors.map(c => (
                                <span key={c} style={{
                                    fontSize: 11, padding: '3px 10px',
                                    background: 'rgba(255,152,0,0.12)',
                                    border: '1px solid rgba(255,152,0,0.25)',
                                    borderRadius: 8, color: '#FBBF24', fontWeight: 600,
                                }}>
                                    {c}
                                </span>
                            ))}
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button
                                onClick={() => navigate('/queue')}
                                style={{
                                    flex: 1, padding: '13px 0',
                                    background: 'rgba(0,200,83,0.12)',
                                    color: '#4ADE80',
                                    border: '1.5px solid rgba(0,200,83,0.3)',
                                    borderRadius: 14, fontSize: 14, fontWeight: 700,
                                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', gap: 7,
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,200,83,0.22)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,200,83,0.2)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,200,83,0.12)'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                <Clock size={15} /> Join Queue
                            </button>
                            <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${placeCard.lat},${placeCard.lng}`}
                                target="_blank" rel="noreferrer"
                                style={{
                                    flex: 1, padding: '13px 0',
                                    background: 'linear-gradient(135deg, #2979FF, #00B0FF)',
                                    color: '#fff',
                                    border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 700,
                                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', gap: 7, textDecoration: 'none',
                                    boxShadow: '0 6px 20px rgba(41,121,255,0.4)',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                            >
                                <Navigation size={15} /> Navigate
                            </a>
                            <button
                                onClick={() => navigate(`/station/${placeCard.id}`)}
                                style={{
                                    padding: '0 16px',
                                    background: 'rgba(255,255,255,0.07)',
                                    color: 'rgba(255,255,255,0.6)',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    borderRadius: 14, display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                                aria-label="View Details"
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                            >
                                <ExternalLink size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Global Leaflet Style Overrides ── */}
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse-marker {
                    0%, 100% { box-shadow: 0 4px 16px #2979FF80, 0 0 0 6px #2979FF30; }
                    50% { box-shadow: 0 4px 20px #2979FFCC, 0 0 0 10px #2979FF15; }
                }
                .leaflet-popup-content-wrapper {
                    background: var(--bg-card) !important;
                    color: var(--text-primary) !important;
                    border-radius: 14px !important;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.25) !important;
                    border: 1px solid var(--bg-border) !important;
                    overflow: hidden;
                }
                .leaflet-popup-tip { background: var(--bg-card) !important; }
                .leaflet-popup-content { margin: 14px !important; }
                .leaflet-container { font-family: 'DM Sans', sans-serif !important; }
                [data-theme='dark'] .leaflet-tile {
                    filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
                }
            `}</style>
        </div>
    );
};

export default MapPage;
