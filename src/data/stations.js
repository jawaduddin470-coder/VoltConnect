export const stations = [
    { "id": 1, "name": "Tata Power EV Hub", "area": "Jubilee Hills", "lat": 17.4323, "lng": 78.4070, "status": "available", price: 18, speed: "Fast (50 kW)", queue: 0, connectors: ["CCS2", "CHAdeMO", "Type 2"] },
    { "id": 2, "name": "Ather Grid Station", "area": "Hitech City", "lat": 17.4435, "lng": 78.3772, "status": "available", price: 12, speed: "Standard (7.4 kW)", queue: 0, connectors: ["Ather Type", "Type 2"] },
    { "id": 3, "name": "Zeon Charging Hub", "area": "Gachibowli", "lat": 17.4401, "lng": 78.3489, "status": "busy", price: 16, speed: "Fast (50 kW)", queue: 2, connectors: ["CCS2", "Type 2"] },
    { "id": 4, "name": "BPCL Fast Charger", "area": "Banjara Hills", "lat": 17.4174, "lng": 78.4382, "status": "available", price: 22, speed: "Ultra Fast (150 kW)", queue: 0, connectors: ["CCS2", "CHAdeMO"] },
    { "id": 5, "name": "MG Charge Station", "area": "Kondapur", "lat": 17.4663, "lng": 78.3647, "status": "busy", price: 15, speed: "Fast (50 kW)", queue: 3, connectors: ["CCS2", "Type 2"] },
    { "id": 6, "name": "Statiq Charging Hub", "area": "Madhapur", "lat": 17.4483, "lng": 78.3915, "status": "available", price: 17, speed: "Fast (50 kW)", queue: 0, connectors: ["CCS2", "Type 2", "CHAdeMO"] },
    { "id": 7, "name": "Airport EV Charging", "area": "Shamshabad", "lat": 17.2403, "lng": 78.4294, "status": "available", price: 25, speed: "Ultra Fast (150 kW)", queue: 1, connectors: ["CCS2", "CHAdeMO", "Type 2"] },
    { "id": 8, "name": "EESL Charging Station", "area": "Secunderabad", "lat": 17.4399, "lng": 78.4983, "status": "available", price: 10, speed: "Standard (22 kW)", queue: 0, connectors: ["Type 2", "CCS2"] },
    { "id": 9, "name": "Tata Power Begumpet", "area": "Begumpet", "lat": 17.4440, "lng": 78.4620, "status": "faulty", price: 18, speed: "Fast (50 kW)", queue: 0, connectors: ["CCS2", "CHAdeMO"] },
    { "id": 10, "name": "EVRE Charging Hub", "area": "Financial District", "lat": 17.4189, "lng": 78.3428, "status": "available", price: 19, speed: "Fast (50 kW)", queue: 0, connectors: ["CCS2", "Type 2"] },
    { "id": 11, "name": "ChargeZone Kukatpally", "area": "Kukatpally", "lat": 17.4948, "lng": 78.3996, "status": "busy", price: 16, speed: "Fast (50 kW)", queue: 5, connectors: ["CCS2", "Type 2", "CHAdeMO"] },
    { "id": 12, "name": "Relux EV Station", "area": "Miyapur", "lat": 17.5090, "lng": 78.3520, "status": "available", price: 13, speed: "Standard (22 kW)", queue: 0, connectors: ["Type 2", "CCS2"] },
    { "id": 13, "name": "Ather Grid Raidurg", "area": "Raidurg", "lat": 17.4366, "lng": 78.3817, "status": "available", price: 12, speed: "Standard (7.4 kW)", queue: 0, connectors: ["Ather Type", "Type 2"] },
    { "id": 14, "name": "ChargeZone LB Nagar", "area": "LB Nagar", "lat": 17.3457, "lng": 78.5567, "status": "busy", price: 16, speed: "Fast (50 kW)", queue: 2, connectors: ["CCS2", "Type 2"] },
    { "id": 15, "name": "Statiq Uppal Station", "area": "Uppal", "lat": 17.4015, "lng": 78.5590, "status": "available", price: 14, speed: "Standard (22 kW)", queue: 0, connectors: ["Type 2", "CCS2"] },
    { "id": 16, "name": "EESL Tarnaka", "area": "Tarnaka", "lat": 17.4294, "lng": 78.5384, "status": "available", price: 10, speed: "Standard (7.4 kW)", queue: 0, connectors: ["Type 2"] },
    { "id": 17, "name": "Relux Mehdipatnam", "area": "Mehdipatnam", "lat": 17.3936, "lng": 78.4392, "status": "busy", price: 15, speed: "Fast (50 kW)", queue: 3, connectors: ["CCS2", "Type 2"] },
    { "id": 18, "name": "MG EV Charger Himayatnagar", "area": "Himayatnagar", "lat": 17.3995, "lng": 78.4813, "status": "available", price: 15, speed: "Fast (50 kW)", queue: 1, connectors: ["CCS2", "Type 2"] },
    { "id": 19, "name": "ChargeZone KPHB", "area": "KPHB Colony", "lat": 17.4942, "lng": 78.3920, "status": "available", price: 17, speed: "Fast (50 kW)", queue: 0, connectors: ["CCS2", "CHAdeMO", "Type 2"] },
    { "id": 20, "name": "EVRE Kompally Station", "area": "Kompally", "lat": 17.5416, "lng": 78.4817, "status": "available", price: 13, speed: "Standard (22 kW)", queue: 0, connectors: ["Type 2", "CCS2"] },
    { "id": 21, "name": "Statiq Nallagandla", "area": "Nallagandla", "lat": 17.4670, "lng": 78.3080, "status": "busy", price: 17, speed: "Fast (50 kW)", queue: 2, connectors: ["CCS2", "Type 2"] },
    { "id": 22, "name": "Zeon Kokapet Hub", "area": "Kokapet", "lat": 17.3963, "lng": 78.3323, "status": "available", price: 16, speed: "Fast (50 kW)", queue: 0, connectors: ["CCS2", "Type 2"] },
    { "id": 23, "name": "BPCL Lakdikapul Charger", "area": "Lakdikapul", "lat": 17.4106, "lng": 78.4550, "status": "busy", price: 22, speed: "Ultra Fast (150 kW)", queue: 1, connectors: ["CCS2", "CHAdeMO"] },
    { "id": 24, "name": "Tata Power Necklace Road", "area": "Necklace Road", "lat": 17.4239, "lng": 78.4675, "status": "available", price: 18, speed: "Fast (50 kW)", queue: 0, connectors: ["CCS2", "CHAdeMO", "Type 2"] },
    { "id": 25, "name": "EVRE BHEL Station", "area": "BHEL", "lat": 17.4955, "lng": 78.3007, "status": "available", price: 19, speed: "Fast (50 kW)", queue: 0, connectors: ["CCS2", "Type 2"] }
];

export const getStationById = (id) => stations.find(s => s.id === parseInt(id));

