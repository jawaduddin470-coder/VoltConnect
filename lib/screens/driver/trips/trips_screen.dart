import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../theme/app_colors.dart';
import '../../../widgets/driver_bottom_nav.dart';
import '../../../widgets/volt_ai_chat.dart';
import '../../../widgets/theme_toggle.dart';

// ── Indian Cities Dataset ────────────────────────────────────────────────────
class _City {
  final String name;
  final double lat, lng;
  const _City(this.name, this.lat, this.lng);
}

const _indianCities = [
  _City('Hyderabad', 17.3850, 78.4867),
  _City('Mumbai', 19.0760, 72.8777),
  _City('Delhi', 28.7041, 77.1025),
  _City('Bangalore', 12.9716, 77.5946),
  _City('Chennai', 13.0827, 80.2707),
  _City('Kolkata', 22.5726, 88.3639),
  _City('Pune', 18.5204, 73.8567),
  _City('Ahmedabad', 23.0225, 72.5714),
  _City('Jaipur', 26.9124, 75.7873),
  _City('Surat', 21.1702, 72.8311),
  _City('Visakhapatnam', 17.6868, 83.2185),
  _City('Kochi', 9.9312, 76.2673),
  _City('Chandigarh', 30.7333, 76.7794),
  _City('Bhopal', 23.2599, 77.4126),
  _City('Indore', 22.7196, 75.8577),
  _City('Nagpur', 21.1458, 79.0882),
  _City('Coimbatore', 11.0168, 76.9558),
  _City('Mysore', 12.2958, 76.6394),
  _City('Vadodara', 22.3072, 73.1812),
  _City('Lucknow', 26.8467, 80.9462),
  _City('Patna', 25.5941, 85.1376),
  _City('Bhubaneswar', 20.2961, 85.8245),
  _City('Thiruvananthapuram', 8.5241, 76.9366),
  _City('Guwahati', 26.1445, 91.7362),
  _City('Raipur', 21.2514, 81.6296),
  _City('Ranchi', 23.3441, 85.3096),
  _City('Dehradun', 30.3165, 78.0322),
  _City('Jammu', 32.7266, 74.8570),
  _City('Shimla', 31.1048, 77.1734),
  _City('Agra', 27.1767, 78.0081),
  _City('Varanasi', 25.3176, 82.9739),
  _City('Amritsar', 31.6340, 74.8723),
  _City('Ludhiana', 30.9010, 75.8573),
  _City('Gurgaon', 28.4595, 77.0266),
  _City('Noida', 28.5355, 77.3910),
  _City('Meerut', 28.9845, 77.7064),
  _City('Rajkot', 22.3039, 70.8022),
  _City('Nashik', 19.9975, 73.7898),
  _City('Madurai', 9.9252, 78.1198),
  _City('Vijayawada', 16.5062, 80.6480),
  _City('Guntur', 16.2990, 80.4575),
  _City('Warangal', 17.9784, 79.5941),
];

class TripsScreen extends StatefulWidget {
  const TripsScreen({super.key});

  @override
  State<TripsScreen> createState() => _TripsScreenState();
}

class _TripsScreenState extends State<TripsScreen> {
  final _fromController = TextEditingController();
  final _toController = TextEditingController();
  final MapController _mapController = MapController();

  _City? _fromCity;
  _City? _toCity;
  bool _showFrom = false, _showTo = false;
  List<_City> _fromSuggestions = [], _toSuggestions = [];
  bool _isPlanning = false;
  bool _hasRoute = false;

  void _onNavTap(int index) {
    final routes = ['/driver/map', '/driver/trips', '/driver/trips', '/driver/queue', '/driver/myev'];
    if (index != 1) context.go(routes[index]);
  }

  void _openVoltAI() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const VoltAIChat(),
    );
  }

  @override
  void dispose() {
    _fromController.dispose();
    _toController.dispose();
    super.dispose();
  }

  void _filterFrom(String q) {
    if (q.length < 2) { setState(() => _fromSuggestions = []); return; }
    setState(() => _fromSuggestions = _indianCities
        .where((c) => c.name.toLowerCase().contains(q.toLowerCase()))
        .take(6).toList());
  }

  void _filterTo(String q) {
    if (q.length < 2) { setState(() => _toSuggestions = []); return; }
    setState(() => _toSuggestions = _indianCities
        .where((c) => c.name.toLowerCase().contains(q.toLowerCase()))
        .take(6).toList());
  }

  void _swapCities() {
    final tmpCtrl = _fromController.text;
    final tmpCity = _fromCity;
    setState(() {
      _fromController.text = _toController.text;
      _fromCity = _toCity;
      _toController.text = tmpCtrl;
      _toCity = tmpCity;
    });
  }

  Future<void> _planRoute() async {
    if (_fromCity == null || _toCity == null) return;
    setState(() => _isPlanning = true);
    await Future.delayed(const Duration(milliseconds: 1500));
    if (mounted) {
      setState(() { _isPlanning = false; _hasRoute = true; });
      // Fit map bounds
      final bounds = LatLngBounds.fromPoints([
        LatLng(_fromCity!.lat, _fromCity!.lng),
        LatLng(_toCity!.lat, _toCity!.lng),
      ]);
      _mapController.fitCamera(CameraFit.bounds(bounds: bounds, padding: const EdgeInsets.all(60)));
    }
  }

  double _distanceKm() {
    if (_fromCity == null || _toCity == null) return 0;
    const distance = Distance();
    return distance(
      LatLng(_fromCity!.lat, _fromCity!.lng),
      LatLng(_toCity!.lat, _toCity!.lng),
    ) / 1000;
  }

  List<_City> get _chargingStops {
    if (!_hasRoute || _fromCity == null || _toCity == null) return [];
    final d = _distanceKm();
    if (d < 200) return [];
    // Pick a midpoint from cities
    final midLat = (_fromCity!.lat + _toCity!.lat) / 2;
    final midLng = (_fromCity!.lng + _toCity!.lng) / 2;
    return [_City('Midway Charging Stop', midLat, midLng)];
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? AppColors.bgDark : AppColors.bgLight;

    return Scaffold(
      backgroundColor: bg,
      appBar: AppBar(
        backgroundColor: isDark ? AppColors.bgDark : AppColors.bgLight,
        elevation: 0,
        automaticallyImplyLeading: false,
        title: Text('Trip Planner', style: TextStyle(
          fontFamily: 'SpaceGrotesk', fontWeight: FontWeight.bold, fontSize: 18,
          color: isDark ? Colors.white : AppColors.textPrimaryLight,
        )),
        actions: [
          const ThemeToggle(),
          const SizedBox(width: 8),
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: GestureDetector(
              onTap: () => context.go('/driver/profile'),
              child: CircleAvatar(radius: 16, backgroundColor: AppColors.teal.withValues(alpha: 0.2),
                child: const Icon(Icons.person, color: AppColors.teal, size: 18)),
            ),
          ),
        ],
      ),
      bottomNavigationBar: DriverBottomNav(currentIndex: 1, onTap: _onNavTap, onFabTap: _openVoltAI),
      body: LayoutBuilder(
        builder: (context, constraints) {
          final isWide = constraints.maxWidth >= 768;
          if (isWide) {
            return Row(
              children: [
                SizedBox(width: constraints.maxWidth * 0.4, child: _buildForm(isDark)),
                Expanded(child: _buildMap(isDark)),
              ],
            );
          }
          return Column(
            children: [
              Flexible(flex: 0, child: _buildForm(isDark, compact: true)),
              SizedBox(
                height: _hasRoute ? 300 : 200,
                child: _buildMap(isDark),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildForm(bool isDark, {bool compact = false}) {
    final card = isDark ? AppColors.cardDark : AppColors.cardLight;
    final border = isDark ? AppColors.borderDark : AppColors.borderLight;
    final textColor = isDark ? Colors.white : AppColors.textPrimaryLight;
    final secColor = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('EV Route Planner', style: TextStyle(
            fontFamily: 'SpaceGrotesk', fontSize: 20, fontWeight: FontWeight.bold, color: textColor)),
          Text('Plan your journey with real charging stops', style: TextStyle(fontSize: 13, color: secColor)),
          const SizedBox(height: 24),

          // From field
          _locationField(
            controller: _fromController,
            hint: 'e.g. Hyderabad, Telangana',
            dotColor: AppColors.success,
            suggestions: _fromSuggestions,
            isDark: isDark,
            onChanged: _filterFrom,
            onSelect: (city) => setState(() {
              _fromCity = city;
              _fromController.text = city.name;
              _fromSuggestions = [];
            }),
          ),

          // Swap button
          Center(
            child: GestureDetector(
              onTap: _swapCities,
              child: Container(
                margin: const EdgeInsets.symmetric(vertical: 8),
                width: 36, height: 36,
                decoration: BoxDecoration(
                  color: AppColors.teal.withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                  border: Border.all(color: AppColors.teal.withValues(alpha: 0.3)),
                ),
                child: const Icon(Icons.swap_vert, color: AppColors.teal, size: 18),
              ),
            ),
          ),

          // To field
          _locationField(
            controller: _toController,
            hint: 'e.g. Mumbai, Maharashtra',
            dotColor: AppColors.error,
            suggestions: _toSuggestions,
            isDark: isDark,
            onChanged: _filterTo,
            onSelect: (city) => setState(() {
              _toCity = city;
              _toController.text = city.name;
              _toSuggestions = [];
            }),
          ),

          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isPlanning ? null : _planRoute,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.teal, foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: _isPlanning
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                  : const Text('Plan EV Route', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            ),
          ),

          if (_hasRoute) ...[
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: card,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(children: [
                    Text(_fromCity!.name, style: TextStyle(fontWeight: FontWeight.bold, color: textColor)),
                    const SizedBox(width: 8),
                    const Icon(Icons.arrow_forward, size: 14, color: AppColors.teal),
                    const SizedBox(width: 8),
                    Expanded(child: Text(_toCity!.name, style: TextStyle(fontWeight: FontWeight.bold, color: textColor), overflow: TextOverflow.ellipsis)),
                  ]),
                  const SizedBox(height: 12),
                  Row(children: [
                    _InfoChip('${_distanceKm().round()} km', Icons.route),
                    const SizedBox(width: 8),
                    _InfoChip('~${(_distanceKm() / 80).round()}h drive', Icons.timer),
                    const SizedBox(width: 8),
                    _InfoChip('${_chargingStops.length} stops', Icons.bolt),
                  ]),
                ],
              ),
            ),

            if (_chargingStops.isNotEmpty) ...[
              const SizedBox(height: 16),
              Text('Charging Stops', style: TextStyle(fontWeight: FontWeight.bold, color: textColor, fontSize: 14)),
              const SizedBox(height: 8),
              ..._chargingStops.map((stop) => ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: Stack(
                  children: [
                    Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.fromLTRB(17, 14, 14, 14),
                      decoration: BoxDecoration(
                        color: card,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: border),
                      ),
                      child: Row(children: [
                        Expanded(child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(stop.name, style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: textColor)),
                            const SizedBox(height: 4),
                            Row(children: [
                              _StatusChip('Available', AppColors.success),
                              const SizedBox(width: 6),
                              _StatusChip('CCS2 · 50 kW', AppColors.teal),
                            ]),
                          ],
                        )),
                      ]),
                    ),
                    Positioned(left: 0, top: 0, bottom: 0,
                      child: Container(width: 3, color: AppColors.teal)),
                  ],
                ),
              )),
            ],

            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () async {
                  final url = Uri.parse(
                    'https://www.google.com/maps/dir/${Uri.encodeComponent(_fromCity!.name)}/${Uri.encodeComponent(_toCity!.name)}');
                  if (await canLaunchUrl(url)) launchUrl(url, mode: LaunchMode.externalApplication);
                },
                icon: const Icon(Icons.navigation, size: 16),
                label: const Text('Start Navigation'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.success,
                  side: const BorderSide(color: AppColors.success),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
          ],
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildMap(bool isDark) {
    final defaultCenter = LatLng(17.3850, 78.4867);
    final List<Marker> markers = [];

    if (_fromCity != null) markers.add(Marker(
      point: LatLng(_fromCity!.lat, _fromCity!.lng), width: 30, height: 30,
      child: Container(
        decoration: BoxDecoration(color: AppColors.success, shape: BoxShape.circle,
          boxShadow: [BoxShadow(color: AppColors.success.withValues(alpha: 0.4), blurRadius: 8)]),
        child: const Icon(Icons.trip_origin, color: Colors.white, size: 16),
      ),
    ));

    if (_toCity != null) markers.add(Marker(
      point: LatLng(_toCity!.lat, _toCity!.lng), width: 30, height: 30,
      child: Container(
        decoration: BoxDecoration(color: AppColors.error, shape: BoxShape.circle,
          boxShadow: [BoxShadow(color: AppColors.error.withValues(alpha: 0.4), blurRadius: 8)]),
        child: const Icon(Icons.location_on, color: Colors.white, size: 16),
      ),
    ));

    for (final stop in _chargingStops) {
      markers.add(Marker(
        point: LatLng(stop.lat, stop.lng), width: 30, height: 30,
        child: Container(
          decoration: BoxDecoration(color: AppColors.teal, shape: BoxShape.circle,
            boxShadow: [BoxShadow(color: AppColors.teal.withValues(alpha: 0.4), blurRadius: 8)]),
          child: const Icon(Icons.bolt, color: Colors.black, size: 16),
        ),
      ));
    }

    return FlutterMap(
      mapController: _mapController,
      options: MapOptions(
        initialCenter: defaultCenter,
        initialZoom: 6,
        interactionOptions: const InteractionOptions(flags: InteractiveFlag.all),
      ),
      children: [
        TileLayer(
          key: ValueKey(isDark ? 'dark' : 'light'),
          urlTemplate: isDark 
              ? 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png'
              : 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
          subdomains: const ['a', 'b', 'c', 'd'],
          userAgentPackageName: 'com.voltconnect',
        ),
        if (_hasRoute && _fromCity != null && _toCity != null)
          PolylineLayer(polylines: [
            Polyline(
              points: [
                LatLng(_fromCity!.lat, _fromCity!.lng),
                ..._chargingStops.map((s) => LatLng(s.lat, s.lng)),
                LatLng(_toCity!.lat, _toCity!.lng),
              ],
              color: AppColors.teal.withValues(alpha: 0.8),
              strokeWidth: 3,
            ),
          ]),
        MarkerLayer(markers: markers),
      ],
    );
  }

  Widget _locationField({
    required TextEditingController controller,
    required String hint,
    required Color dotColor,
    required List<_City> suggestions,
    required bool isDark,
    required Function(String) onChanged,
    required Function(_City) onSelect,
  }) {
    final border = isDark ? AppColors.borderDark : AppColors.borderLight;
    final cardColor = isDark ? AppColors.cardDark : AppColors.cardLight;
    final textColor = isDark ? Colors.white : AppColors.textPrimaryLight;
    final secColor = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    
    return Column(
      children: [
        Row(
          children: [
            Container(width: 10, height: 10, decoration: BoxDecoration(color: dotColor, shape: BoxShape.circle)),
            const SizedBox(width: 10),
            Expanded(
              child: TextField(
                controller: controller,
                style: TextStyle(color: textColor, fontSize: 14),
                decoration: InputDecoration(
                  hintText: hint, hintStyle: TextStyle(color: secColor, fontSize: 13),
                  filled: true, fillColor: cardColor,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: border)),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: border)),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.teal, width: 2)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                ),
                onChanged: onChanged,
              ),
            ),
          ],
        ),
        if (suggestions.isNotEmpty)
          Container(
            margin: const EdgeInsets.only(top: 4, left: 20),
            decoration: BoxDecoration(
              color: cardColor,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: border),
            ),
            child: Column(
              children: suggestions.map((city) => ListTile(
                dense: true,
                leading: const Icon(Icons.location_city, size: 16, color: AppColors.teal),
                title: Text(city.name, style: TextStyle(color: textColor, fontSize: 13)),
                onTap: () => onSelect(city),
              )).toList(),
            ),
          ),
      ],
    );
  }
}

class _InfoChip extends StatelessWidget {
  final String label;
  final IconData icon;
  const _InfoChip(this.label, this.icon);

  @override
  Widget build(BuildContext context) {
    return Row(children: [
      Icon(icon, size: 13, color: AppColors.teal),
      const SizedBox(width: 4),
      Text(label, style: const TextStyle(fontSize: 12, color: AppColors.teal)),
    ]);
  }
}

class _StatusChip extends StatelessWidget {
  final String label;
  final Color color;
  const _StatusChip(this.label, this.color);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(label, style: TextStyle(fontSize: 10, color: color, fontWeight: FontWeight.w500)),
    );
  }
}
