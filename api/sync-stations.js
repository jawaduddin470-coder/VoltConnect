import admin from 'firebase-admin';

// Initialize Firebase Admin (handles both local .env and Vercel Environment Variables)
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Replace escaped newlines so the private key is valid
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
    } catch (error) {
        console.error('Firebase Admin initialization error', error.stack);
    }
}

const db = admin.firestore();
const OCM_API_KEY = process.env.VITE_OPENCHARGEMAP_API_KEY || '72e22793-de42-4488-b62a-7549e09a417a';

export default async function handler(req, res) {
    // Optional: Only allow POST or specific headers if you want to restrict manual triggers
    // But since Vercel Cron uses standard GET, we allow GET requests.

    console.log('[Sync] Starting OpenChargeMap Station Sync...');
    
    try {
        // 1. Fetch stations from OpenChargeMap (India, max 3000)
        const response = await fetch(
            `https://api.openchargemap.io/v3/poi/?output=json&countrycode=IN&maxresults=3000&key=${OCM_API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error(`OpenChargeMap API responded with ${response.status}`);
        }
        
        const stations = await response.json();
        console.log(`[Sync] Fetched ${stations.length} stations from OpenChargeMap.`);

        let newCount = 0;
        let updateCount = 0;

        // 2. Fetch existing stations for geography-based duplicate detection
        const existingSnapshot = await db.collection('stations').get();
        const existingStations = [];
        existingSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.latitude && data.longitude) {
                existingStations.push({ id: doc.id, ...data });
            }
        });
        console.log(`[Sync] Loaded ${existingStations.length} existing stations for duplicate checking.`);

        // Haversine distance formula (returns KM)
        const getDistanceKM = (lat1, lon1, lat2, lon2) => {
            const R = 6371; // Earth root radius in km
            const dLat = (lat2 - lat1) * (Math.PI / 180);
            const dLon = (lon2 - lon1) * (Math.PI / 180);
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
                      Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        };

        // 3. Process and Store
        const batches = [db.batch()];
        let batchIndex = 0;
        let opCount = 0;

        for (const poi of stations) {
            // Ensure valid coordinates exist
            if (!poi.AddressInfo?.Latitude || !poi.AddressInfo?.Longitude) continue;

            const lat = poi.AddressInfo.Latitude;
            const lng = poi.AddressInfo.Longitude;
            const ocmId = String(poi.ID);

            // Check for duplicates (50 meters = 0.05 km)
            let targetDocId = ocmId;
            let isDuplicate = false;

            for (const existing of existingStations) {
                const dist = getDistanceKM(lat, lng, existing.latitude, existing.longitude);
                if (dist <= 0.05) {
                    targetDocId = existing.id; // Use the existing ID to update it instead of creating a new one
                    isDuplicate = true;
                    break;
                }
            }

            if (isDuplicate) updateCount++;
            else newCount++;

            const docRef = db.collection('stations').doc(targetDocId);

            // Parse standard fields
            const addressInfo = poi.AddressInfo || {};
            const conns = poi.Connections || [];
            const connTypes = [...new Set(conns.map(c => c.ConnectionType?.Title || 'Unknown').filter(Boolean))];
            const maxKW = conns.reduce((m, c) => Math.max(m, c.PowerKW || 0), 0);
            
            // Construct the document body
            const stationData = {
                station_id: targetDocId, // keep consistency
                name: addressInfo.Title || 'EV Charging Station',
                operator: poi.OperatorInfo?.Title || 'Unknown Operator',
                latitude: lat,
                longitude: lng,
                address: [addressInfo.AddressLine1, addressInfo.Town, addressInfo.StateOrProvince].filter(Boolean).join(', '),
                city: addressInfo.Town || addressInfo.StateOrProvince || 'Unknown',
                power_kw: maxKW,
                connectors: connTypes,
                num_chargers: conns.length || 1,
                source: 'OpenChargeMap',
                last_updated: admin.firestore.FieldValue.serverTimestamp(),
            };

            batches[batchIndex].set(docRef, stationData, { merge: true });
            opCount++;

            // Firestore batches are limited to 500 operations
            if (opCount === 450) {
                batches.push(db.batch());
                batchIndex++;
                opCount = 0;
            }
        }

        // 4. Commit all batches
        for (let i = 0; i < batches.length; i++) {
            await batches[i].commit();
            console.log(`[Sync] Committed batch ${i + 1}/${batches.length}.`);
        }

        console.log(`[Sync] Synchronization completed successfully. New: ${newCount}, Updated: ${updateCount}`);
        res.status(200).json({ 
            success: true, 
            message: `Synchronized stations successfully. New: ${newCount}, Updated/Deduped: ${updateCount}`,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('[Sync] Error syncing stations:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}
