export const VEHICLES = [
  // ── TATA (Cars) ──
  { brand: 'Tata', model: 'Nexon EV Prime',        battery_kwh: 30.2, range_km: 312, connector_type: 'CCS2',           vehicle_type: 'Car' },
  { brand: 'Tata', model: 'Nexon EV Max',           battery_kwh: 40.5, range_km: 437, connector_type: 'CCS2',           vehicle_type: 'Car' },
  { brand: 'Tata', model: 'Punch EV',               battery_kwh: 25,   range_km: 315, connector_type: 'CCS2',           vehicle_type: 'Car' },
  { brand: 'Tata', model: 'Punch EV Long Range',    battery_kwh: 35,   range_km: 421, connector_type: 'CCS2',           vehicle_type: 'Car' },
  { brand: 'Tata', model: 'Tigor EV',               battery_kwh: 26,   range_km: 315, connector_type: 'CCS2',           vehicle_type: 'Car' },
  { brand: 'Tata', model: 'Tiago EV MR',            battery_kwh: 19.2, range_km: 250, connector_type: 'CCS2',           vehicle_type: 'Car' },
  { brand: 'Tata', model: 'Tiago EV LR',            battery_kwh: 24,   range_km: 315, connector_type: 'CCS2',           vehicle_type: 'Car' },
  { brand: 'Tata', model: 'Ace EV',                 battery_kwh: 21.3, range_km: 154, connector_type: 'CCS2',           vehicle_type: 'Commercial' },

  // ── MG ──
  { brand: 'MG',   model: 'ZS EV',                  battery_kwh: 50.3, range_km: 461, connector_type: 'CCS2',           vehicle_type: 'Car' },
  { brand: 'MG',   model: 'Comet EV',               battery_kwh: 17.3, range_km: 230, connector_type: 'Type 2',         vehicle_type: 'Car' },

  // ── Mahindra (Cars) ──
  { brand: 'Mahindra', model: 'XUV400 EC',          battery_kwh: 34.5, range_km: 375, connector_type: 'CCS2',           vehicle_type: 'Car' },
  { brand: 'Mahindra', model: 'XUV400 EL',          battery_kwh: 39.4, range_km: 456, connector_type: 'CCS2',           vehicle_type: 'Car' },
  { brand: 'Mahindra', model: 'XUV400 Pro',         battery_kwh: 39.4, range_km: 456, connector_type: 'CCS2',           vehicle_type: 'Car' },
  { brand: 'Mahindra', model: 'Treo Zor',           battery_kwh: 10.24,range_km: 125, connector_type: 'Type 2',         vehicle_type: 'Commercial' },
  { brand: 'Mahindra', model: 'Treo EV',            battery_kwh: 7.37, range_km: 131, connector_type: 'Type 2',         vehicle_type: '3-Wheeler' },

  // ── BYD ──
  { brand: 'BYD',  model: 'Atto 3',                 battery_kwh: 60.5, range_km: 521, connector_type: 'CCS2',           vehicle_type: 'Car' },
  { brand: 'BYD',  model: 'e6',                     battery_kwh: 71.7, range_km: 520, connector_type: 'CCS2',           vehicle_type: 'Car' },
  { brand: 'BYD',  model: 'Seal',                   battery_kwh: 82.5, range_km: 650, connector_type: 'CCS2',           vehicle_type: 'Car' },

  // ── Hyundai ──
  { brand: 'Hyundai', model: 'Kona Electric',       battery_kwh: 39.2, range_km: 452, connector_type: 'CCS2',           vehicle_type: 'Car' },
  { brand: 'Hyundai', model: 'Ioniq 5',             battery_kwh: 72.6, range_km: 631, connector_type: 'CCS2',           vehicle_type: 'Car' },

  // ── Kia ──
  { brand: 'Kia',  model: 'EV6',                    battery_kwh: 77.4, range_km: 708, connector_type: 'CCS2',           vehicle_type: 'Car' },

  // ── Citroen ──
  { brand: 'Citroen', model: 'eC3',                 battery_kwh: 29.2, range_km: 320, connector_type: 'CCS2',           vehicle_type: 'Car' },

  // ── BMW ──
  { brand: 'BMW',  model: 'i4',                     battery_kwh: 83.9, range_km: 590, connector_type: 'CCS2',           vehicle_type: 'Car' },
  { brand: 'BMW',  model: 'iX',                     battery_kwh: 76.6, range_km: 425, connector_type: 'CCS2',           vehicle_type: 'Car' },
  { brand: 'BMW',  model: 'i7',                     battery_kwh: 101.7,range_km: 603, connector_type: 'CCS2',           vehicle_type: 'Car' },

  // ── Mercedes ──
  { brand: 'Mercedes', model: 'EQB',               battery_kwh: 66.5, range_km: 423, connector_type: 'CCS2',           vehicle_type: 'Car' },
  { brand: 'Mercedes', model: 'EQC',               battery_kwh: 80,   range_km: 471, connector_type: 'CCS2',           vehicle_type: 'Car' },
  { brand: 'Mercedes', model: 'EQS',               battery_kwh: 107.8,range_km: 857, connector_type: 'CCS2',           vehicle_type: 'Car' },
  { brand: 'Mercedes', model: 'EQE',               battery_kwh: 90.6, range_km: 660, connector_type: 'CCS2',           vehicle_type: 'Car' },

  // ── Audi ──
  { brand: 'Audi', model: 'e-tron',                 battery_kwh: 95,   range_km: 484, connector_type: 'CCS2',           vehicle_type: 'Car' },
  { brand: 'Audi', model: 'Q8 e-tron',              battery_kwh: 114,  range_km: 600, connector_type: 'CCS2',           vehicle_type: 'Car' },

  // ── Volvo ──
  { brand: 'Volvo', model: 'XC40 Recharge',         battery_kwh: 78,   range_km: 418, connector_type: 'CCS2',           vehicle_type: 'Car' },
  { brand: 'Volvo', model: 'C40 Recharge',          battery_kwh: 78,   range_km: 530, connector_type: 'CCS2',           vehicle_type: 'Car' },

  // ── Porsche ──
  { brand: 'Porsche', model: 'Taycan',              battery_kwh: 93.4, range_km: 484, connector_type: 'CCS2',           vehicle_type: 'Car' },

  // ── MINI ──
  { brand: 'MINI', model: 'Cooper SE',              battery_kwh: 32.6, range_km: 270, connector_type: 'CCS2',           vehicle_type: 'Car' },

  // ── Nissan ──
  { brand: 'Nissan', model: 'Leaf',                 battery_kwh: 40,   range_km: 311, connector_type: 'CHAdeMO',        vehicle_type: 'Car' },

  // ── Piaggio ──
  { brand: 'Piaggio', model: 'Ape E City',          battery_kwh: 7.5,  range_km: 110, connector_type: 'Type 2',         vehicle_type: '3-Wheeler' },

  // ── Ather (2-wheelers) ──
  { brand: 'Ather', model: '450X',                  battery_kwh: 3.7,  range_km: 150, connector_type: 'Ather Grid',     vehicle_type: '2-Wheeler' },
  { brand: 'Ather', model: '450S',                  battery_kwh: 2.9,  range_km: 115, connector_type: 'Ather Grid',     vehicle_type: '2-Wheeler' },

  // ── Ola ──
  { brand: 'Ola',  model: 'S1 Pro',                 battery_kwh: 4,    range_km: 181, connector_type: 'Ola Hypercharger', vehicle_type: '2-Wheeler' },
  { brand: 'Ola',  model: 'S1 Air',                 battery_kwh: 3,    range_km: 151, connector_type: 'Ola Hypercharger', vehicle_type: '2-Wheeler' },

  // ── TVS ──
  { brand: 'TVS',  model: 'iQube',                  battery_kwh: 3.4,  range_km: 145, connector_type: 'Type 2',         vehicle_type: '2-Wheeler' },

  // ── Bajaj ──
  { brand: 'Bajaj', model: 'Chetak',               battery_kwh: 3.2,  range_km: 113, connector_type: 'Type 2',         vehicle_type: '2-Wheeler' },

  // ── Hero ──
  { brand: 'Hero', model: 'Vida V1 Pro',            battery_kwh: 3.94, range_km: 165, connector_type: 'Type 2',         vehicle_type: '2-Wheeler' },
];

/** All unique brands */
export const BRANDS = [...new Set(VEHICLES.map(v => v.brand))];

/** Models for a given brand */
export const modelsForBrand = (brand) => VEHICLES.filter(v => v.brand === brand);

/** Find a vehicle by brand + model */
export const findVehicle = (brand, model) =>
    VEHICLES.find(v => v.brand === brand && v.model === model) || null;
