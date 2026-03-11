import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
    MapPin, Navigation, ArrowLeftRight, Route, X, Zap, Loader2,
    Clock, Gauge, CheckCircle2, Bookmark, BookmarkCheck, ExternalLink,
    AlertCircle, Search, ChevronRight
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const OCM_KEY = '72e22793-de42-4488-b62a-7549e09a417a';
const NOMINATIM = 'https://nominatim.openstreetmap.org/search';
const OSRM = 'https://router.project-osrm.org/route/v1/driving';
const HYDERABAD = [17.3850, 78.4867];

// ─── Icon helpers ────────────────────────────────────────────────────────────
const makePin = (color, letter, size = 32) => L.divIcon({
    className: '',
    html: `<div style="
        width:${size}px;height:${size}px;border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);background:${color};border:3px solid white;
        box-shadow:0 4px 12px ${color}70;display:flex;align-items:center;justify-content:center;">
        <span style="transform:rotate(45deg);color:#fff;font-weight:800;font-size:${size * 0.35}px;">${letter}</span>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
});

const STOP_ICON = (selected = false) => L.divIcon({
    className: '',
    html: `<div style="
        width:30px;height:30px;border-radius:50%;
        background:${selected ? '#2979FF' : '#FF9800'};border:3px solid white;
        box-shadow:0 3px 10px ${selected ? '#2979FF80' : '#FF980080'};
        display:flex;align-items:center;justify-content:center;
        ${selected ? 'animation:pulse-marker 1.5s ease-in-out infinite;' : ''}
    ">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z"/></svg>
    </div>`,
    iconSize: [30, 30], iconAnchor: [15, 15], popupAnchor: [0, -15],
});

// ─── Utility: sample n points evenly from a coords array ─────────────────────
const sampleCoords = (coords, n) => {
    if (coords.length <= n) return coords;
    const step = (coords.length - 1) / (n - 1);
    return Array.from({ length: n }, (_, i) => coords[Math.round(i * step)]);
};

// ─── Utility: parse OCM POI ───────────────────────────────────────────────────
const parsePOI = (poi) => {
    const al = poi.AddressInfo || {};
    const conns = poi.Connections || [];
    const connTypes = [...new Set(conns.map(c => c.ConnectionType?.Title || 'Unknown').filter(Boolean))];
    const maxKW = conns.reduce((m, c) => Math.max(m, c.PowerKW || 0), 0);
    return {
        id: poi.ID,
        name: al.Title || 'EV Charging Station',
        area: al.Town || al.StateOrProvince || '',
        address: [al.AddressLine1, al.Town, al.StateOrProvince].filter(Boolean).join(', '),
        lat: al.Latitude,
        lng: al.Longitude,
        connectors: connTypes.length ? connTypes : ['Type 2'],
        numChargers: conns.length,
        operator: poi.OperatorInfo?.Title || null,
        maxKW: maxKW || null,
    };
};

// ─── Nominatim Autocomplete Hook ──────────────────────────────────────────────
const useAutocomplete = (query) => {
    const [results, setResults] = useState([]);
    const timer = useRef(null);
    useEffect(() => {
        clearTimeout(timer.current);
        if (!query || query.length < 3) { setResults([]); return; }
        timer.current = setTimeout(async () => {
            try {
                const url = `${NOMINATIM}?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
                const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
                const data = await res.json();
                setResults(data.map(r => ({ label: r.display_name, lat: parseFloat(r.lat), lng: parseFloat(r.lon) })));
            } catch { setResults([]); }
        }, 350);
        return () => clearTimeout(timer.current);
    }, [query]);
    return results;
};

// ─── MapFitter: fits the map to a given bounds ────────────────────────────────
const MapFitter = ({ bounds }) => {
    const map = useMap();
    useEffect(() => { if (bounds) map.fitBounds(bounds, { padding: [40, 40] }); }, [bounds, map]);
    return null;
};
const MapFlyer = ({ target }) => {
    const map = useMap();
    useEffect(() => { if (target) map.flyTo([target.lat, target.lng], 14, { duration: 1.2 }); }, [target, map]);
    return null;
};

// ─── Location Input ───────────────────────────────────────────────────────────
const LocationInput = ({ label, icon: Icon, iconColor, value, onChange, onSelect, placeholder }) => {
    const results = useAutocomplete(value);
    const [open, setOpen] = useState(false);
    return (
        <div style={{ position: 'relative' }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: 6, display: 'block' }}>{label}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: 'var(--bg-secondary)', borderRadius: 12, border: '1.5px solid var(--bg-border)', transition: 'border-color 0.2s' }}
                onFocus={() => setOpen(true)}>
                <Icon size={15} color={iconColor} style={{ flexShrink: 0 }} />
                <input
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={e => { onChange(e.target.value); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    onBlur={() => setTimeout(() => setOpen(false), 200)}
                    style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: 'var(--text-primary)' }}
                />
                {value && <button onClick={() => { onChange(''); onSelect(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}><X size={14} /></button>}
            </div>
            {open && results.length > 0 && (
                <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 9999, marginTop: 4,
                    background: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: 12,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)', overflow: 'hidden',
                }}>
                    {results.map((r, i) => (
                        <button key={i} onMouseDown={() => { onChange(r.label.split(',').slice(0, 2).join(',')); onSelect(r); setOpen(false); }}
                            style={{
                                display: 'flex', alignItems: 'flex-start', gap: 10, width: '100%', padding: '11px 14px',
                                background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                                borderBottom: i < results.length - 1 ? '1px solid var(--bg-border)' : 'none',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                            <Search size={13} style={{ color: 'var(--text-muted)', marginTop: 2, flexShrink: 0 }} />
                            <span style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4 }}>{r.label.split(',').slice(0, 3).join(', ')}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── Place Card ───────────────────────────────────────────────────────────────
const PlaceCard = ({ station, onClose }) => (
    <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 2000,
        transform: station ? 'translateY(0)' : 'translateY(110%)',
        transition: 'transform 0.45s cubic-bezier(0.16,1,0.3,1)',
        pointerEvents: station ? 'auto' : 'none',
    }}>
        {station && (
            <div style={{ background: 'var(--bg-card)', borderTopLeftRadius: 22, borderTopRightRadius: 22, boxShadow: '0 -8px 40px rgba(0,0,0,0.25)', padding: '0 20px 28px', border: '1px solid var(--bg-border)', borderBottom: 'none', maxWidth: 540, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px' }}>
                    <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--bg-border)', cursor: 'pointer' }} onClick={onClose} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,152,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Zap size={15} color="#FF9800" />
                            </div>
                            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, lineHeight: 1.2 }}>{station.name}</h3>
                        </div>
                        {station.operator && <p style={{ margin: '0 0 3px', fontSize: 12, color: 'var(--text-muted)' }}>🏢 {station.operator}</p>}
                        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                            <MapPin size={12} style={{ marginTop: 2 }} /> {station.address || station.area}
                        </p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}><X size={20} /></button>
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                    {station.maxKW > 0 && (
                        <div style={{ flex: 1, background: 'rgba(41,121,255,0.08)', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                            <div style={{ fontSize: 15, fontWeight: 700, color: '#2979FF' }}>{station.maxKW} kW</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Max Power</div>
                        </div>
                    )}
                    <div style={{ flex: 1, background: 'rgba(0,200,83,0.08)', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#00c853' }}>{station.numChargers}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Chargers</div>
                    </div>
                    <div style={{ flex: 2, background: 'rgba(255,152,0,0.08)', borderRadius: 10, padding: '10px 12px' }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Connectors</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                            {station.connectors.slice(0, 3).map(c => (
                                <span key={c} style={{ fontSize: 10, padding: '2px 5px', background: 'rgba(255,152,0,0.15)', borderRadius: 4, color: '#e65100', fontWeight: 600 }}>{c}</span>
                            ))}
                        </div>
                    </div>
                </div>
                <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`}
                    target="_blank" rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', background: '#2979FF', color: '#fff', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(41,121,255,0.35)' }}
                >
                    <Navigation size={16} /> Navigate to Station
                </a>
            </div>
        )}
    </div>
);

// ─── Station Stop Card ────────────────────────────────────────────────────────
const StopCard = ({ stop, index, isSelected, onViewMap, onSave, isSaved }) => (
    <div style={{
        border: isSelected ? '1.5px solid #FF9800' : '1px solid var(--bg-border)',
        borderRadius: 14, padding: '14px', background: 'var(--bg-card)',
        transition: 'all 0.2s', boxShadow: isSelected ? '0 4px 16px rgba(255,152,0,0.15)' : 'none',
    }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,152,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1.5px solid rgba(255,152,0,0.3)' }}>
                <span style={{ fontWeight: 800, fontSize: 13, color: '#FF9800' }}>#{index}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stop.name}</h4>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stop.address || stop.area}</p>
            </div>
            <button onClick={() => onSave(stop)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isSaved ? '#2979FF' : 'var(--text-muted)', padding: 4, flexShrink: 0 }}>
                {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
            </button>
        </div>
        {stop.operator && <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--text-muted)' }}>🏢 {stop.operator}</p>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
            {stop.maxKW > 0 && <span style={{ fontSize: 11, padding: '2px 7px', background: 'rgba(41,121,255,0.08)', borderRadius: 6, color: '#2979FF' }}>⚡ {stop.maxKW} kW</span>}
            <span style={{ fontSize: 11, padding: '2px 7px', background: 'rgba(0,200,83,0.08)', borderRadius: 6, color: '#00c853' }}>🔌 {stop.numChargers} ports</span>
            {stop.connectors.slice(0, 2).map(c => <span key={c} style={{ fontSize: 11, padding: '2px 7px', background: 'rgba(255,152,0,0.1)', borderRadius: 6, color: '#e65100' }}>{c}</span>)}
        </div>
        <div style={{ display: 'flex', gap: 7 }}>
            <button onClick={() => onViewMap(stop)} style={{ flex: 1, padding: '8px', background: 'rgba(255,152,0,0.08)', color: '#FF9800', border: '1px solid rgba(255,152,0,0.25)', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                <MapPin size={12} /> View on Map
            </button>
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${stop.lat},${stop.lng}`} target="_blank" rel="noreferrer"
                style={{ flex: 1, padding: '8px', background: 'rgba(41,121,255,0.08)', color: '#2979FF', border: '1px solid rgba(41,121,255,0.2)', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, textDecoration: 'none' }}>
                <Navigation size={12} /> Navigate
            </a>
        </div>
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const TripsPage = () => {
    const [startText, setStartText] = useState('');
    const [destText, setDestText] = useState('');
    const [startCoord, setStartCoord] = useState(null);
    const [destCoord, setDestCoord] = useState(null);
    const [routeCoords, setRouteCoords] = useState([]);
    const [routeInfo, setRouteInfo] = useState(null); // {distance, duration}
    const [stops, setStops] = useState([]);
    const [loadingRoute, setLoadingRoute] = useState(false);
    const [routeError, setRouteError] = useState(null);
    const [selectedStop, setSelectedStop] = useState(null);
    const [placeCard, setPlaceCard] = useState(null);
    const [flyTarget, setFlyTarget] = useState(null);
    const [fitBounds, setFitBounds] = useState(null);
    const [savedStops, setSavedStops] = useState(new Set());
    const lastRouteRef = useRef(null);

    // ─ Swap start/dest ─
    const handleSwap = () => {
        setStartText(destText); setDestText(startText);
        setStartCoord(destCoord); setDestCoord(startCoord);
    };

    // ─ Toggle save ─
    const toggleSave = useCallback((stop) => {
        setSavedStops(prev => {
            const next = new Set(prev);
            next.has(stop.id) ? next.delete(stop.id) : next.add(stop.id);
            return next;
        });
    }, []);

    // ─ View on map ─
    const handleViewOnMap = useCallback((stop) => {
        setSelectedStop(stop);
        setPlaceCard(stop);
        setFlyTarget(stop);
        setTimeout(() => setFlyTarget(null), 2000);
    }, []);

    // ─ Plan route ─
    const handlePlan = async (e) => {
        e.preventDefault();
        if (!startCoord || !destCoord) { setRouteError('Please select both locations from the dropdown suggestions.'); return; }
        setRouteError(null); setLoadingRoute(true); setRouteCoords([]); setStops([]); setRouteInfo(null); setPlaceCard(null); setSelectedStop(null);

        // Check cache
        const cacheKey = `route_${startCoord.lat.toFixed(4)}_${startCoord.lng.toFixed(4)}_${destCoord.lat.toFixed(4)}_${destCoord.lng.toFixed(4)}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
            const { coords, info, stations } = JSON.parse(cached);
            setRouteCoords(coords); setRouteInfo(info); setStops(stations);
            setFitBounds([[Math.min(startCoord.lat, destCoord.lat) - 0.5, Math.min(startCoord.lng, destCoord.lng) - 0.5],
                [Math.max(startCoord.lat, destCoord.lat) + 0.5, Math.max(startCoord.lng, destCoord.lng) + 0.5]]);
            setLoadingRoute(false); return;
        }

        try {
            // 1. Get route from OSRM
            const osrmRes = await fetch(`${OSRM}/${startCoord.lng},${startCoord.lat};${destCoord.lng},${destCoord.lat}?overview=full&geometries=geojson`);
            const osrmData = await osrmRes.json();
            if (osrmData.code !== 'Ok') throw new Error('Could not calculate route. Try different locations.');
            const routeGeo = osrmData.routes[0].geometry.coordinates; // [lng, lat] pairs
            const distKm = (osrmData.routes[0].distance / 1000).toFixed(0);
            const durMin = Math.round(osrmData.routes[0].duration / 60);
            const coords = routeGeo.map(([lng, lat]) => [lat, lng]);
            setRouteCoords(coords);
            const info = { distance: distKm, duration: durMin };
            setRouteInfo(info);

            // Fit map
            const lats = coords.map(c => c[0]), lngs = coords.map(c => c[1]);
            setFitBounds([[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]]);

            // 2. Sample route points and fetch stations nearby
            const samples = sampleCoords(coords, Math.min(8, Math.max(3, Math.round(distKm / 80))));
            const seen = new Set();
            const routeStations = [];

            await Promise.all(samples.map(async ([lat, lng]) => {
                try {
                    const url = `https://api.openchargemap.io/v3/poi/?output=json&latitude=${lat}&longitude=${lng}&distance=25&distanceunit=KM&maxresults=3&key=${OCM_KEY}`;
                    const res = await fetch(url);
                    const data = await res.json();
                    data.filter(p => p.AddressInfo?.Latitude && p.AddressInfo?.Longitude).forEach(poi => {
                        if (!seen.has(poi.ID)) { seen.add(poi.ID); routeStations.push(parsePOI(poi)); }
                    });
                } catch { /* ignore individual point failures */ }
            }));

            // Dedupe and limit to 8 best stops spaced along route
            const finalStops = routeStations.slice(0, 8);
            setStops(finalStops);

            // Cache to session
            sessionStorage.setItem(cacheKey, JSON.stringify({ coords, info, stations: finalStops }));

        } catch (err) {
            setRouteError(err.message || 'Failed to plan route. Please try again.');
        } finally {
            setLoadingRoute(false);
        }
    };

    const startPin = startCoord ? makePin('#00C853', 'A') : null;
    const destPin = destCoord ? makePin('#F44336', 'B') : null;
    const hasRoute = routeCoords.length > 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--nav-height))', overflow: 'hidden', background: 'var(--bg-primary)' }}>

            {/* ── Header ── */}
            <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--bg-border)', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(41,121,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Route size={17} color="var(--accent)" />
                    </div>
                    <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>EV Route Planner</h1>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>Plan your journey with real charging stops along the route</p>
            </div>

            {/* ── Main: two-column layout ── */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden', flexDirection: window.innerWidth >= 900 ? 'row' : 'column' }}>

                {/* ── Left: Form + Results ── */}
                <div style={{ width: window.innerWidth >= 900 ? 360 : '100%', flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--bg-border)', overflow: 'hidden' }}>

                    {/* Planner form */}
                    <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--bg-border)', flexShrink: 0 }}>
                        <form onSubmit={handlePlan}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
                                <LocationInput label="START LOCATION" icon={MapPin} iconColor="#00C853" value={startText} onChange={setStartText} onSelect={setStartCoord} placeholder="e.g. Hyderabad, Telangana" />

                                {/* Swap button */}
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <button type="button" onClick={handleSwap} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--bg-border)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.2s' }}
                                        title="Swap locations">
                                        <ArrowLeftRight size={14} />
                                    </button>
                                </div>

                                <LocationInput label="DESTINATION" icon={MapPin} iconColor="#F44336" value={destText} onChange={setDestText} onSelect={setDestCoord} placeholder="e.g. Mumbai, Maharashtra" />
                            </div>

                            {routeError && (
                                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '10px 12px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, marginBottom: 10, fontSize: 13, color: '#991B1B' }}>
                                    <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                                    <span>{routeError}</span>
                                </div>
                            )}

                            <button type="submit" disabled={loadingRoute || !startText || !destText} style={{
                                width: '100%', padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                background: loadingRoute ? 'var(--bg-secondary)' : 'linear-gradient(90deg,#2979FF,#00B0FF)',
                                color: loadingRoute ? 'var(--text-muted)' : '#fff', border: 'none',
                                boxShadow: '0 4px 16px rgba(41,121,255,0.3)', transition: 'all 0.2s',
                                opacity: (!startText || !destText) ? 0.6 : 1,
                            }}>
                                {loadingRoute ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Planning Route…</> : <><Route size={16} /> Plan EV Route</>}
                            </button>
                        </form>
                    </div>

                    {/* Route summary */}
                    {routeInfo && (
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--bg-border)', flexShrink: 0 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                                {[
                                    { icon: Gauge, label: 'Distance', val: `${routeInfo.distance} km`, color: '#2979FF' },
                                    { icon: Clock, label: 'Drive Time', val: routeInfo.duration >= 60 ? `${Math.floor(routeInfo.duration / 60)}h ${routeInfo.duration % 60}m` : `${routeInfo.duration}m`, color: '#FF9800' },
                                    { icon: Zap, label: 'Stops', val: stops.length, color: '#10B981' },
                                ].map(({ icon: Icon, label, val, color }) => (
                                    <div key={label} style={{ textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 10, padding: '10px 6px', border: '1px solid var(--bg-border)' }}>
                                        <Icon size={16} color={color} style={{ marginBottom: 4 }} />
                                        <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Rajdhani, sans-serif', color }}>{val}</div>
                                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Charging stops list */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
                        {!hasRoute && !loadingRoute && (
                            <div style={{ textAlign: 'center', marginTop: 32, color: 'var(--text-muted)' }}>
                                <Route size={48} style={{ opacity: 0.2, marginBottom: 12 }} />
                                <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 6px' }}>Ready to Plan</h3>
                                <p style={{ fontSize: 13, margin: 0 }}>Enter your start and destination above to find charging stops along your route.</p>
                            </div>
                        )}

                        {loadingRoute && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, gap: 12, color: 'var(--text-muted)' }}>
                                <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)' }} />
                                <span style={{ fontSize: 14 }}>Finding charging stations…</span>
                            </div>
                        )}

                        {hasRoute && !loadingRoute && stops.length === 0 && (
                            <div style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)' }}>
                                <AlertCircle size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                                <p style={{ fontSize: 13 }}>No charging stations found along this route. Try a different path.</p>
                            </div>
                        )}

                        {hasRoute && stops.length > 0 && (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                    <CheckCircle2 size={16} color="#10B981" />
                                    <span style={{ fontSize: 13, fontWeight: 600, color: '#10B981' }}>{stops.length} charging stops found</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {stops.map((s, i) => (
                                        <StopCard key={s.id} stop={s} index={i + 1} isSelected={selectedStop?.id === s.id} onViewMap={handleViewOnMap} onSave={toggleSave} isSaved={savedStops.has(s.id)} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Right: Map ── */}
                <div style={{ flex: 1, position: 'relative', minHeight: window.innerWidth < 900 ? 300 : 'auto' }}>
                    <MapContainer center={HYDERABAD} zoom={5} zoomControl={false} style={{ height: '100%', width: '100%', minHeight: 300 }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        />
                        <MapFitter bounds={fitBounds} />
                        <MapFlyer target={flyTarget} />

                        {/* Route polyline */}
                        {hasRoute && (
                            <Polyline
                                positions={routeCoords}
                                pathOptions={{ color: '#2979FF', weight: 5, opacity: 0.85, lineCap: 'round', lineJoin: 'round', dashArray: '' }}
                            />
                        )}
                        {/* Route outline for contrast */}
                        {hasRoute && (
                            <Polyline positions={routeCoords} pathOptions={{ color: '#fff', weight: 9, opacity: 0.3 }} />
                        )}

                        {/* Start/End markers */}
                        {startCoord && startPin && (
                            <Marker position={[startCoord.lat, startCoord.lng]} icon={startPin}>
                                <Popup>{startText.split(',')[0]}<br /><small>Start</small></Popup>
                            </Marker>
                        )}
                        {destCoord && destPin && (
                            <Marker position={[destCoord.lat, destCoord.lng]} icon={destPin}>
                                <Popup>{destText.split(',')[0]}<br /><small>Destination</small></Popup>
                            </Marker>
                        )}

                        {/* Stop markers */}
                        {stops.map(s => (
                            <Marker key={s.id} position={[s.lat, s.lng]} icon={STOP_ICON(selectedStop?.id === s.id)}
                                eventHandlers={{ click: () => handleViewOnMap(s) }}>
                                <Popup closeButton={false} offset={[0, -15]}>
                                    <div style={{ minWidth: 190, padding: 4 }}>
                                        <h4 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#1A202C' }}>{s.name}</h4>
                                        {s.operator && <p style={{ margin: '0 0 6px', fontSize: 12, color: '#718096' }}>🏢 {s.operator}</p>}
                                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                                            {s.maxKW > 0 && <span style={{ fontSize: 11, padding: '2px 6px', background: '#EEF2FF', borderRadius: 5, color: '#3730A3' }}>⚡ {s.maxKW} kW</span>}
                                            <span style={{ fontSize: 11, padding: '2px 6px', background: '#F0FDF4', borderRadius: 5, color: '#166534' }}>🔌 {s.numChargers} ports</span>
                                        </div>
                                        <a href={`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`} target="_blank" rel="noreferrer"
                                            style={{ display: 'block', textAlign: 'center', padding: '7px', background: '#2979FF', color: '#fff', borderRadius: 7, textDecoration: 'none', fontSize: 12, fontWeight: 600 }}>
                                            Navigate
                                        </a>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>

                    {/* Map hint */}
                    {!hasRoute && !loadingRoute && (
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'rgba(0,0,0,0.55)', color: '#fff', borderRadius: 14, padding: '12px 20px', fontSize: 13, fontWeight: 600, backdropFilter: 'blur(6px)', pointerEvents: 'none', textAlign: 'center', whiteSpace: 'nowrap' }}>
                            🗺️ Route will appear here
                        </div>
                    )}

                    {/* Loading overlay on map */}
                    {loadingRoute && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', zIndex: 500 }}>
                            <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: '24px 32px', textAlign: 'center' }}>
                                <Loader2 size={32} color="var(--accent)" style={{ animation: 'spin 1s linear infinite', marginBottom: 10 }} />
                                <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Calculating route…</p>
                            </div>
                        </div>
                    )}

                    {/* Animated place card */}
                    <PlaceCard station={placeCard} onClose={() => { setPlaceCard(null); setSelectedStop(null); }} />
                </div>
            </div>

            {/* Global styles */}
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse-marker {
                    0%,100% { box-shadow: 0 3px 10px #2979FF80; }
                    50% { box-shadow: 0 3px 18px #2979FFCC, 0 0 0 8px #2979FF20; }
                }
                .leaflet-popup-content-wrapper {
                    background: var(--bg-card) !important; color: var(--text-primary) !important;
                    border-radius: 12px !important; box-shadow: 0 8px 30px rgba(0,0,0,0.2) !important;
                    border: 1px solid var(--bg-border) !important; overflow: hidden;
                }
                .leaflet-popup-tip { background: var(--bg-card) !important; }
                .leaflet-popup-content { margin: 12px !important; }
                .leaflet-container { font-family: 'DM Sans', sans-serif !important; }
                [data-theme='dark'] .leaflet-tile {
                    filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
                }
            `}</style>
        </div>
    );
};

export default TripsPage;
