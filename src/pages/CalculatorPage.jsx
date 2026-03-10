import React, { useState, useMemo } from 'react';
import { Calculator, Zap, Battery, Clock, IndianRupee } from 'lucide-react';

const CalculatorPage = () => {
    const [batterySize, setBatterySize] = useState(50);
    const [currentBattery, setCurrentBattery] = useState(20);
    const [targetBattery, setTargetBattery] = useState(90);
    const [tariff, setTariff] = useState(16);

    const results = useMemo(() => {
        const percent = Math.max(0, targetBattery - currentBattery);
        const energyKwh = (batterySize * percent) / 100;
        const cost = energyKwh * tariff;
        const timeMinutes = (energyKwh / 50) * 60; // assuming 50kW charger
        return {
            energy: energyKwh.toFixed(2),
            cost: cost.toFixed(0),
            timeH: Math.floor(timeMinutes / 60),
            timeM: Math.round(timeMinutes % 60),
        };
    }, [batterySize, currentBattery, targetBattery, tariff]);

    const fillPercent = targetBattery - currentBattery;

    return (
        <div className="page-container" style={{ maxWidth: 600 }}>
            <div style={{ padding: '0 8px' }}>
                <h1 style={{ fontSize: 28, marginBottom: 4 }}>Cost Calculator</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Estimate your charging cost before you plug in.</p>

                <div className="vc-card" style={{ padding: 24, marginBottom: 20 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {/* Battery size */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Battery Size</label>
                                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent)', fontFamily: 'Rajdhani' }}>{batterySize} kWh</span>
                            </div>
                            <input type="range" min={10} max={120} step={1} value={batterySize} onChange={e => setBatterySize(Number(e.target.value))}
                                style={{ width: '100%', accentColor: 'var(--accent)' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                                <span>10 kWh</span><span>120 kWh</span>
                            </div>
                        </div>

                        {/* Current battery */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Current Battery Level</label>
                                <span style={{ fontSize: 15, fontWeight: 700, color: currentBattery < 20 ? '#F44336' : currentBattery < 40 ? '#FF9800' : '#00E676', fontFamily: 'Rajdhani' }}>{currentBattery}%</span>
                            </div>
                            <input type="range" min={0} max={99} step={1} value={currentBattery} onChange={e => { const v = Number(e.target.value); setCurrentBattery(v); if (v >= targetBattery) setTargetBattery(v + 1); }}
                                style={{ width: '100%', accentColor: currentBattery < 20 ? '#F44336' : currentBattery < 40 ? '#FF9800' : '#00E676' }} />
                        </div>

                        {/* Target battery */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Target Battery Level</label>
                                <span style={{ fontSize: 15, fontWeight: 700, color: '#00E676', fontFamily: 'Rajdhani' }}>{targetBattery}%</span>
                            </div>
                            <input type="range" min={Math.min(currentBattery + 1, 100)} max={100} step={1} value={targetBattery} onChange={e => setTargetBattery(Number(e.target.value))}
                                style={{ width: '100%', accentColor: '#00E676' }} />
                        </div>

                        {/* Tariff */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Charging Tariff</label>
                                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent)', fontFamily: 'Rajdhani' }}>₹{tariff}/kWh</span>
                            </div>
                            <input type="range" min={8} max={35} step={1} value={tariff} onChange={e => setTariff(Number(e.target.value))}
                                style={{ width: '100%', accentColor: 'var(--accent)' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                                <span>₹8 (EESL)</span><span>₹35 (Premium)</span>
                            </div>
                        </div>

                        {/* Battery visual */}
                        <div>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 10 }}>BATTERY PREVIEW</p>
                            <div style={{ position: 'relative', height: 36, background: 'var(--bg-primary)', borderRadius: 8, border: '2px solid var(--bg-border)', overflow: 'hidden' }}>
                                {/* Current level */}
                                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${currentBattery}%`, background: 'rgba(244,67,54,0.3)', transition: 'width 0.3s ease' }} />
                                {/* Fill */}
                                <div style={{ position: 'absolute', left: `${currentBattery}%`, top: 0, bottom: 0, width: `${fillPercent}%`, background: 'rgba(0,230,118,0.5)', transition: 'all 0.3s ease' }} />
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600 }}>
                                    {currentBattery}% → {targetBattery}% &nbsp;(+{fillPercent}%)
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {[
                        { icon: Zap, label: 'Energy Required', value: `${results.energy} kWh`, color: '#2979FF' },
                        { icon: IndianRupee, label: 'Estimated Cost', value: `₹${results.cost}`, color: '#00E676' },
                        { icon: Clock, label: 'Charge Time', value: results.timeH > 0 ? `${results.timeH}h ${results.timeM}m` : `${results.timeM} min`, color: '#FF9800' },
                    ].map(({ icon: Icon, label, value, color }) => (
                        <div key={label} className="vc-card" style={{ padding: '18px 12px', textAlign: 'center' }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                                <Icon size={18} color={color} />
                            </div>
                            <div style={{ fontSize: 22, fontFamily: 'Rajdhani', fontWeight: 700, color }}>{value}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
                        </div>
                    ))}
                </div>

                {/* Comparison */}
                <div className="vc-card" style={{ padding: 20, marginTop: 16 }}>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 12 }}>TARIFF COMPARISON</p>
                    {[{ op: 'EESL', rate: 10 }, { op: 'Ather Grid', rate: 12 }, { op: 'ChargeZone', rate: 16 }, { op: 'Tata Power', rate: 18 }, { op: 'BPCL Fast', rate: 22 }].map(({ op, rate }) => {
                        const c = ((batterySize * fillPercent) / 100 * rate).toFixed(0);
                        return (
                            <div key={op} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                                <div style={{ width: 80, fontSize: 13, color: 'var(--text-secondary)', flexShrink: 0 }}>{op}</div>
                                <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'var(--bg-border)', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', borderRadius: 4, background: 'var(--accent)', width: `${Math.min(100, (rate / 35) * 100)}%` }} />
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: rate === tariff ? 'var(--accent)' : 'var(--text-primary)', width: 50, textAlign: 'right' }}>₹{c}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CalculatorPage;
