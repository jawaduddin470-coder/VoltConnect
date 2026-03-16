import 'package:flutter/foundation.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'ocmap_service.dart';
import 'station_service.dart';

/// ════════════════════════════════════════════════════════════════════════════
/// QueueService — Phase 4-8
///
/// ARCHITECTURE NOTE:
/// The [applyDummyQueueAlgorithm] function below simulates realistic queue
/// data using time-of-day, power level, and charger count.
///
/// FUTURE LIVE UPGRADE PATH:
/// Replace [applyDummyQueueAlgorithm] with [getLiveStationStatus], which
/// should call your IoT API or OCPP endpoint:
///
///   Future<QueuedStation> getLiveStationStatus(StationModel s) async {
///     final resp = await http.get(Uri.parse('$iotBaseUrl/stations/${s.id}/status'));
///     return QueuedStation.fromJson(resp.body, s);
///   }
///
/// Add a real-time Firestore listener for queue members:
///
///   onSnapshot(collection(db, 'queues', stationId, 'members'), (snap) {
///     queueCount = snap.docs.length;
///     notifyListeners();
///   });
///
/// The UI and logic contract of QueuedStation remain unchanged.
/// ════════════════════════════════════════════════════════════════════════════

/// Enriched station model for the queue screen
class QueuedStation {
  final StationModel station;
  final double distanceKm;
  final int queueCount;
  final int estimatedWaitMinutes;
  final String availability;   // 'available', 'occupied', 'offline'
  final double utilizationPercent;

  const QueuedStation({
    required this.station,
    required this.distanceKm,
    required this.queueCount,
    required this.estimatedWaitMinutes,
    required this.availability,
    required this.utilizationPercent,
  });
}

/// Data for an active queue slot the user has joined
class ActiveQueue {
  final String stationId;
  final String stationName;
  final int position;
  final int estimatedWaitMinutes;
  final DateTime joinedAt;

  const ActiveQueue({
    required this.stationId,
    required this.stationName,
    required this.position,
    required this.estimatedWaitMinutes,
    required this.joinedAt,
  });
}

class QueueService {
  static FirebaseFirestore get _db => FirebaseFirestore.instance;
  static FirebaseAuth get _auth => FirebaseAuth.instance;

  // ── Phase 4: Fetch 10 nearest stations ────────────────────────────────────

  static Future<List<QueuedStation>> getNearestQueuedStations(
    double userLat,
    double userLng, {
    int count = 10,
  }) async {
    try {
      // Fetch a large pool from Firestore
      final raw = await StationService.fetchNearbyStations(userLat, userLng);

      // Compute distance, apply algorithm, sort, take top N
      final enriched = raw.map((s) {
        final dist = StationService.calculateDistance(userLat, userLng, s.lat, s.lng);
        return applyDummyQueueAlgorithm(s, distanceKm: dist);
      }).toList();

      enriched.sort((a, b) => a.distanceKm.compareTo(b.distanceKm));
      return enriched.take(count).toList();
    } catch (e) {
      debugPrint("QueueService: Error fetching stations: $e");
      return [];
    }
  }

  // ── Phase 5: Dummy Smart Queue Algorithm ──────────────────────────────────
  //
  // Isolated so it can be swapped for a real IoT call later.

  static QueuedStation applyDummyQueueAlgorithm(
    StationModel station, {
    required double distanceKm,
  }) {
    final now = DateTime.now();
    final hour = now.hour;
    final isWeekend = now.weekday == DateTime.saturday || now.weekday == DateTime.sunday;

    // 3% offline chance — deterministic per station_id
    final stationHash = station.id.codeUnits.fold(0, (a, b) => a + b);
    if (stationHash % 33 == 0) {
      return QueuedStation(
        station: station,
        distanceKm: distanceKm,
        queueCount: 0,
        estimatedWaitMinutes: 0,
        availability: 'offline',
        utilizationPercent: 0,
      );
    }

    // Base demand by time-of-day
    double demandFactor;
    if (hour >= 8 && hour < 10) {
      demandFactor = 0.75;         // Morning rush
    } else if (hour >= 12 && hour < 14) {
      demandFactor = 0.55;         // Lunch
    } else if (hour >= 17 && hour < 20) {
      demandFactor = 0.90;         // Evening peak
    } else if (hour >= 23 || hour < 6) {
      demandFactor = 0.10;         // Late night
    } else {
      demandFactor = 0.35;         // Normal hours
    }

    // Weekend modifier
    if (isWeekend) demandFactor *= 1.2;

    // Power demand modifier
    double powerMod;
    if (station.power >= 100) {
      powerMod = 1.4;              // DC fast chargers — busiest
    } else if (station.power >= 50) {
      powerMod = 1.2;
    } else if (station.power >= 22) {
      powerMod = 0.9;
    } else {
      powerMod = 0.5;              // Slow AC — low demand
    }

    // Deterministic jitter per station so they don't all look identical
    final jitter = (stationHash % 20 - 10) / 100.0; // ±10% jitter
    final utilRaw = (demandFactor * powerMod + jitter).clamp(0.0, 1.0);
    final utilizationPercent = utilRaw * 100;

    // Queue count — only forms if utilization > 80%
    final numChargers = station.numChargers < 1 ? 1 : station.numChargers;
    int queueCount = 0;
    if (utilRaw > 0.80) {
      queueCount = ((utilRaw - 0.80) * 20).round().clamp(0, 8);
    }

    // Average session duration by power
    int avgSessionMin;
    if (station.power >= 100) {
      avgSessionMin = 20;
    } else if (station.power >= 50) {
      avgSessionMin = 35;
    } else if (station.power >= 22) {
      avgSessionMin = 60;
    } else {
      avgSessionMin = 120;
    }

    // Wait time = (queued vehicles × avg session) / chargers
    final estimatedWait = queueCount > 0
        ? ((queueCount * avgSessionMin) / numChargers).round()
        : 0;

    final String avail;
    if (utilizationPercent >= 95) {
      avail = 'occupied';
    } else if (utilizationPercent < 20) {
      avail = 'available';
    } else {
      avail = 'available';
    }

    return QueuedStation(
      station: station,
      distanceKm: distanceKm,
      queueCount: queueCount,
      estimatedWaitMinutes: estimatedWait,
      availability: avail,
      utilizationPercent: utilizationPercent,
    );
  }

  // ── Phase 6: Firestore Join / Leave Queue ─────────────────────────────────

  /// Join the queue for a station. Returns the user's position (1-based).
  static Future<int> joinQueue(QueuedStation qs) async {
    final user = _auth.currentUser;
    if (user == null) throw StateError('Not authenticated');

    try {
      final stationId = qs.station.id;
      final membersRef = _db.collection('queues').doc(stationId).collection('members');

      // Check if already in this queue
      final existing = await membersRef.doc(user.uid).get();
      if (existing.exists) {
        return (existing.data()?['position'] as int?) ?? 1;
      }

      // Position = current member count + 1
      final countSnap = await membersRef.get();
      final position = countSnap.docs.length + 1;

      await membersRef.doc(user.uid).set({
        'uid': user.uid,
        'userName': user.displayName ?? 'Driver',
        'stationId': stationId,
        'stationName': qs.station.name,
        'joinedAt': FieldValue.serverTimestamp(),
        'position': position,
        'estimatedWaitMinutes': qs.estimatedWaitMinutes,
        'status': 'waiting',
      });

      return position;
    } catch (e) {
      debugPrint("QueueService: Error joining queue: $e");
      rethrow;
    }
  }

  /// Leave the queue for a station.
  static Future<void> leaveQueue(String stationId) async {
    try {
      final user = _auth.currentUser;
      if (user == null) return;
      await _db
          .collection('queues')
          .doc(stationId)
          .collection('members')
          .doc(user.uid)
          .delete();
    } catch (e) {
      debugPrint("QueueService: Error leaving queue: $e");
    }
  }

  /// Returns the user's currently active queue entry, or null.
  static Future<ActiveQueue?> getUserActiveQueue() async {
    try {
      final user = _auth.currentUser;
      if (user == null) return null;

      // Query all queues for this user — collectionGroup across all members/uid docs
      final snap = await _db
          .collectionGroup('members')
          .where('uid', isEqualTo: user.uid)
          .where('status', isEqualTo: 'waiting')
          .limit(1)
          .get();

      if (snap.docs.isEmpty) return null;
      final data = snap.docs.first.data();
      return ActiveQueue(
        stationId: data['stationId'] as String? ?? '',
        stationName: data['stationName'] as String? ?? 'Station',
        position: data['position'] as int? ?? 1,
        estimatedWaitMinutes: data['estimatedWaitMinutes'] as int? ?? 0,
        joinedAt: (data['joinedAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      );
    } catch (e) {
      debugPrint("QueueService: Error getting active queue: $e");
      return null;
    }
  }
}
