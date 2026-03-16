import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../utils/demo_data.dart';

class StationModel {
  final String id;
  final String name;
  final String address;
  final double lat;
  final double lng;
  final List<String> connectors;
  final String availability; // 'available', 'occupied', 'unknown'
  final String powerLevel;
  final double power;
  final String price;
  final List<String> amenities;
  final int numChargers;
  final int queueCount;

  StationModel({
    required this.id,
    required this.name,
    required this.address,
    required this.lat,
    required this.lng,
    required this.connectors,
    required this.availability,
    required this.powerLevel,
    required this.power,
    required this.price,
    required this.amenities,
    this.numChargers = 1,
    required this.queueCount,
  });

  factory StationModel.fromDemo(Map<String, dynamic> data) {
    final connectors = List<String>.from(data['connectors'] ?? []);
    final powerStr = connectors.isNotEmpty
        ? connectors.first.contains('kW') ? connectors.first.split(' ').last : '22kW'
        : '22kW';
    return StationModel(
      id: data['id'] ?? '',
      name: data['name'] ?? '',
      address: 'Hyderabad, Telangana',
      lat: (data['lat'] as num).toDouble(),
      lng: (data['lng'] as num).toDouble(),
      connectors: connectors,
      availability: data['availability'] ?? 'unknown',
      powerLevel: powerStr,
      power: powerStr.contains('kW') ? double.tryParse(powerStr.replaceAll('kW', '').trim()) ?? 22.0 : 22.0,
      price: data['price'] ?? '₹18/kWh',
      amenities: List<String>.from(data['amenities'] ?? []),
      numChargers: data['num_chargers'] ?? 1,
      queueCount: data['queue'] ?? 0,
    );
  }

  factory StationModel.fromOCMap(Map<String, dynamic> data) {
    final addressInfo = data['AddressInfo'] ?? {};
    final connections = data['Connections'] as List? ?? [];
    final connectors = connections.map<String>((c) {
      final type = c['ConnectionType']?['Title'] ?? 'Unknown';
      final power = c['PowerKW'];
      return power != null ? '$type ${power.toStringAsFixed(0)}kW' : type;
    }).toList();

    final statusType = data['StatusType'];
    String availability = 'unknown';
    if (statusType != null) {
      final isOperational = statusType['IsOperational'] ?? false;
      availability = isOperational ? 'available' : 'occupied';
    }

    return StationModel(
      id: data['ID']?.toString() ?? '',
      name: addressInfo['Title'] ?? 'Unknown Station',
      address: addressInfo['AddressLine1'] ?? '',
      lat: (addressInfo['Latitude'] as num?)?.toDouble() ?? 17.3850,
      lng: (addressInfo['Longitude'] as num?)?.toDouble() ?? 78.4867,
      connectors: connectors,
      availability: availability,
      powerLevel: connectors.isNotEmpty ? '22kW' : '7kW',
      power: connectors.isNotEmpty ? 22.0 : 7.0,
      price: '₹18/kWh',
      amenities: [],
      numChargers: 1,
      queueCount: 0,
    );
  }
}

class OCMapService {
  static List<StationModel> getDemoStations() {
    return DemoData.stations.map(StationModel.fromDemo).toList();
  }

  static Future<List<StationModel>> fetchNearbyStations(double lat, double lng) async {
    final apiKey = dotenv.env['OCMAP_API_KEY'] ?? '';
    if (apiKey.isEmpty || apiKey == 'REPLACE_WITH_YOUR_KEY') {
      return getDemoStations();
    }

    try {
      final uri = Uri.parse(
        'https://api.openchargemap.io/v3/poi/'
        '?output=json&countrycode=IN'
        '&latitude=$lat&longitude=$lng'
        '&distance=10&distanceunit=KM'
        '&maxresults=20&compact=true&verbose=false'
        '&key=$apiKey',
      );
      final response = await http.get(uri).timeout(const Duration(seconds: 10));
      if (response.statusCode == 200) {
        final List data = json.decode(response.body);
        return data.map((d) => StationModel.fromOCMap(d)).toList();
      }
    } catch (_) {}
    return getDemoStations();
  }
}
