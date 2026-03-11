import React, { createContext, useContext, useState, useEffect } from 'react';

const VehicleContext = createContext(null);

const STORAGE_KEY = 'voltconnect_vehicle';

export const VehicleProvider = ({ children }) => {
    const [selectedVehicle, setSelectedVehicle] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : null;
        } catch { return null; }
    });

    const setVehicle = (vehicle) => {
        setSelectedVehicle(vehicle);
        if (vehicle) localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicle));
        else localStorage.removeItem(STORAGE_KEY);
    };

    const clearVehicle = () => setVehicle(null);

    return (
        <VehicleContext.Provider value={{ selectedVehicle, setVehicle, clearVehicle }}>
            {children}
        </VehicleContext.Provider>
    );
};

export const useVehicle = () => {
    const ctx = useContext(VehicleContext);
    if (!ctx) throw new Error('useVehicle must be used inside VehicleProvider');
    return ctx;
};
