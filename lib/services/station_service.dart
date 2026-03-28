import 'dart:math' as math;
import 'package:flutter/foundation.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'ocmap_service.dart'; // Reusing StationModel
class StationService {
  static FirebaseFirestore get _db => FirebaseFirestore.instance;

  // Haversine distance formula
  static double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
    const double R = 6371; // Earth radius in km
    final double dLat = (lat2 - lat1) * math.pi / 180;
    final double dLon = (lon2 - lon1) * math.pi / 180;
    final double a = math.sin(dLat / 2) * math.sin(dLat / 2) +
        math.cos(lat1 * math.pi / 180) * math.cos(lat2 * math.pi / 180) *
            math.sin(dLon / 2) * math.sin(dLon / 2);
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));
  }

  // ── PHASE 2: Viewport-based station fetch ──────────────────────────────────
  // Loads only stations inside the visible map bounds (Uber-style).
  // Firestore note: Firestore does not support multi-field inequality queries on
  // different fields in a single query. We filter latitude server-side and
  // longitude client-side to stay within free-tier index limits.
  static Future<List<StationModel>> fetchStationsInBounds({
    required double south,
    required double north,
    required double west,
    required double east,
    int limit = 2000,
  }) async {
    try {
      final snapshot = await _db
          .collection('stations')
          .where('latitude', isGreaterThanOrEqualTo: south)
          .where('latitude', isLessThanOrEqualTo: north)
          .limit(limit)
          .get();

      print('[Viewport] Fetched ${snapshot.docs.length} docs for lat [$south,$north]');

      final List<StationModel> stations = [];
      for (var doc in snapshot.docs) {
        try {
          final data = doc.data();
          final rawLat = data['latitude'];
          final sLat = rawLat is num ? rawLat.toDouble() : double.tryParse(rawLat?.toString() ?? '') ?? 0.0;
          
          final rawLng = data['longitude'];
          final sLng = rawLng is num ? rawLng.toDouble() : double.tryParse(rawLng?.toString() ?? '') ?? 0.0;

          // Client-side longitude filter
          if (sLat == 0.0 || sLng == 0.0) continue;
          if (sLng < west || sLng > east) continue;

          final connRaw = data['connectors'];
          final List<String> connectors = (connRaw is List) 
              ? connRaw.map((e) => e.toString()).toList() 
              : (connRaw != null ? [connRaw.toString()] : []);
          
          final rawNum = data['num_chargers'];
          final numChargers = rawNum is num ? rawNum.toInt() : int.tryParse(rawNum?.toString() ?? '') ?? 1;
          
          final rawPower = data['power_kw'];
          final power = rawPower is num ? rawPower.toDouble() : double.tryParse(rawPower?.toString() ?? '') ?? 0.0;

          stations.add(StationModel(
            id: data['station_id']?.toString() ?? doc.id,
            name: data['name']?.toString() ?? 'Unknown Station',
            address: data['address']?.toString() ?? '',
            lat: sLat,
            lng: sLng,
            connectors: connectors,
            availability: numChargers > 0 ? 'available' : 'unknown',
            powerLevel: '${power.toStringAsFixed(0)}kW',
            power: power,
            price: '₹18/kWh',
            amenities: [],
            numChargers: numChargers,
            queueCount: 0,
          ));
        } catch (e) {
          debugPrint('[Viewport] Error parsing station doc ${doc.id}: $e');
        }
      }

      print('[Viewport] Valid stations in view: ${stations.length}');
      return stations;
    } catch (e) {
      print('[Viewport] fetchStationsInBounds error: $e');
      // If we got here, it's a real hard error (permissions, network, etc)
      // We return empty so we don't pollute with 5 demo stations
      return [];
    }
  }
  // ── end Phase 2 ────────────────────────────────────────────────────────────

  // Fetch stations near a location (simple query, client-side filter)
  static Future<List<StationModel>> fetchNearbyStations(
    double lat, double lng, {double radiusKm = 50}
  ) async {
    try {
      final snapshot = await _db.collection('stations')
          .limit(2000)
          .get();

      print('Total stations fetched: ${snapshot.docs.length}');

      final List<StationModel> stations = [];
      for (var doc in snapshot.docs) {
        try {
          final data = doc.data();
          final rawLat = data['latitude'];
          final sLat = rawLat is num ? rawLat.toDouble() : double.tryParse(rawLat?.toString() ?? '') ?? 0.0;
          final rawLng = data['longitude'];
          final sLng = rawLng is num ? rawLng.toDouble() : double.tryParse(rawLng?.toString() ?? '') ?? 0.0;
          
          if (sLat != 0.0 && sLng != 0.0) {
            final connRaw = data['connectors'];
            final List<String> connectors = (connRaw is List) 
                ? connRaw.map((e) => e.toString()).toList() 
                : (connRaw != null ? [connRaw.toString()] : []);
            
            final rawNum = data['num_chargers'];
            final numChargers = rawNum is num ? rawNum.toInt() : int.tryParse(rawNum?.toString() ?? '') ?? 1;
            
            final rawPower = data['power_kw'];
            final power = rawPower is num ? rawPower.toDouble() : double.tryParse(rawPower?.toString() ?? '') ?? 0.0;

            stations.add(StationModel(
              id: data['station_id']?.toString() ?? doc.id,
              name: data['name']?.toString() ?? 'Unknown Station',
              address: data['address']?.toString() ?? '',
              lat: sLat,
              lng: sLng,
              connectors: connectors,
              availability: numChargers > 0 ? 'available' : 'unknown',
              powerLevel: '${power.toStringAsFixed(0)}kW',
              power: power,
              price: '₹18/kWh',
              amenities: [],
              numChargers: numChargers,
              queueCount: 0,
            ));
          }
        } catch (e) {
          debugPrint('[Nearby] Error parsing station doc ${doc.id}: $e');
        }
      }

      print('Valid stations after filter: ${stations.length}');

      // Calculate distance and sort if providing lat/lng
      if (lat != 0 && lng != 0) {
        stations.sort((a, b) {
          final d1 = calculateDistance(lat, lng, a.lat, a.lng);
          final d2 = calculateDistance(lat, lng, b.lat, b.lng);
          return d1.compareTo(d2);
        });
      }

      return stations;
    } catch (e) {
      print('[Nearby] Failed to fetch nearby stations: $e');
      return [];
    }
  }

  // Fetch stations by city name
  static Future<List<StationModel>> fetchStationsByCity(String city) async {
    try {
      final snapshot = await _db.collection('stations')
          .where('city', isEqualTo: city)
          .limit(50)
          .get();
      
      return snapshot.docs.map((doc) {
        final data = doc.data();
        final power = (data['power_kw'] as num?)?.toDouble() ?? 22.0;
        final numChargers = (data['num_chargers'] as num?)?.toInt() ?? 1;
        return StationModel(
          id: data['station_id'] ?? doc.id,
          name: data['name'] ?? 'Unknown Station',
          address: data['address'] ?? '',
          lat: (data['latitude'] as num?)?.toDouble() ?? 0.0,
          lng: (data['longitude'] as num?)?.toDouble() ?? 0.0,
          connectors: (data['connectors'] as List? ?? []).map((e) => e.toString()).toList(),
          availability: 'unknown',
          powerLevel: '${power.toStringAsFixed(0)}kW',
          power: power,
          price: '₹18/kWh',
          amenities: [],
          numChargers: numChargers,
          queueCount: 0,
        );
      }).toList();
    } catch (_) {
      return [];
    }
  }
}
