import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_map_marker_cluster/flutter_map_marker_cluster.dart';
import 'package:latlong2/latlong.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../theme/app_colors.dart';
import '../../../services/location_service.dart';
import '../../../services/ocmap_service.dart';
import '../../../services/station_service.dart';
import '../../../widgets/driver_bottom_nav.dart';
import '../../../widgets/volt_ai_chat.dart';
import '../../../widgets/notification_panel.dart';
import '../../../widgets/theme_toggle.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../../widgets/volt_logo.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> with TickerProviderStateMixin {
  final MapController _mapController = MapController();
  List<StationModel> _stations = [];
  bool _isLoading = true;
  StationModel? _selectedStation;
  late AnimationController _pulseController;
  late Animation<double> _pulseAnim;
  LatLng _userLocation = const LatLng(17.3850, 78.4867);
  final int _bottomNavIndex = 0;

  // ── Viewport debounce ─────────────────────────────────────────────────────
  Timer? _viewportDebounce;
  bool _viewportLoadEnabled = false; // Enable after initial load

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
        duration: const Duration(milliseconds: 1200), vsync: this)
      ..repeat(reverse: true);
    _pulseAnim = Tween<double>(begin: 8, end: 18).animate(
        CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut));
    _init();
  }

  Future<void> _init() async {
    // Step 1: Get user location
    final pos = await LocationService.getCurrentPosition();
    if (pos != null && mounted) {
      setState(() => _userLocation = LatLng(pos.latitude, pos.longitude));
      _mapController.move(_userLocation, 11);
    }

    // Step 2: Load stations for initial viewport
    await _fetchForCurrentBounds();

    // Step 3: Enable live viewport fetching after initial load
    if (mounted) setState(() => _viewportLoadEnabled = true);
  }

  /// Called by the map's onPositionChanged — debounced 400ms
  void _onMapPositionChanged(MapCamera camera, bool hasGesture) {
    if (!_viewportLoadEnabled) return;
    _viewportDebounce?.cancel();
    _viewportDebounce = Timer(const Duration(milliseconds: 400), () {
      _fetchForCurrentBounds();
    });
  }

  Future<void> _fetchForCurrentBounds() async {
    if (!mounted) return;
    setState(() => _isLoading = true);

    final bounds = _mapController.camera.visibleBounds;
    final stations = await StationService.fetchStationsInBounds(
      south: bounds.southWest.latitude,
      north: bounds.northEast.latitude,
      west: bounds.southWest.longitude,
      east: bounds.northEast.longitude,
    );

    if (mounted) {
      setState(() {
        _stations = stations;
        _isLoading = false;
      });
    }
  }

  @override
  void dispose() {
    _viewportDebounce?.cancel();
    _pulseController.dispose();
    super.dispose();
  }

  Color _markerColor(StationModel s) {
    if (s.power >= 50) return AppColors.error;
    if (s.power >= 22) return AppColors.warning;
    if (s.power >= 7) return AppColors.success;
    if (s.power > 0) return AppColors.textSecondaryDark;
    return AppColors.teal;
  }

  void _onNavTap(int index) {
    final routes = ['/driver/map', '/driver/trips', '/driver/map', '/driver/queue', '/driver/myev'];
    if (index < routes.length) context.go(routes[index]);
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
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      backgroundColor: isDark ? AppColors.bgDark : AppColors.bgLight,
      extendBody: true,
      appBar: _buildAppBar(),
      body: Stack(
        children: [
          // ── Map ────────────────────────────────────────────────────────────
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: const LatLng(17.3850, 78.4867),
              initialZoom: 11,
              interactionOptions: const InteractionOptions(
                flags: InteractiveFlag.all,
              ),
              onTap: (_, __) => setState(() => _selectedStation = null),
              onPositionChanged: _onMapPositionChanged,
            ),
            children: [
              // Tile layer
              TileLayer(
                key: ValueKey(isDark ? 'dark' : 'light'),
                urlTemplate: isDark
                    ? 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png'
                    : 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
                subdomains: const ['a', 'b', 'c', 'd'],
                userAgentPackageName: 'com.voltconnect',
              ),

              // ── Phase 3: Clustered station markers ─────────────────────────
              MarkerClusterLayerWidget(
                options: MarkerClusterLayerOptions(
                  maxClusterRadius: 60,
                  size: const Size(44, 44),
                  // Performance options
                  markers: _stations.map((s) {
                    return Marker(
                      point: LatLng(s.lat, s.lng),
                      width: 36,
                      height: 36,
                      child: GestureDetector(
                        onTap: () => setState(() => _selectedStation = s),
                        child: Container(
                          decoration: BoxDecoration(
                            color: _markerColor(s),
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: _markerColor(s).withValues(alpha: 0.5),
                                blurRadius: 8,
                              )
                            ],
                          ),
                          child: const Icon(Icons.bolt, color: Colors.white, size: 18),
                        ),
                      ),
                    );
                  }).toList(),
                  builder: (context, markers) {
                    // Custom cluster bubble
                    return Container(
                      decoration: BoxDecoration(
                        color: AppColors.teal,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.teal.withValues(alpha: 0.4),
                            blurRadius: 12,
                            spreadRadius: 2,
                          )
                        ],
                      ),
                      child: Center(
                        child: Text(
                          markers.length > 99 ? '99+' : markers.length.toString(),
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),

              // User location pulsing marker
              MarkerLayer(
                markers: [
                  Marker(
                    point: _userLocation,
                    width: 40,
                    height: 40,
                    child: RepaintBoundary(
                      child: AnimatedBuilder(
                        animation: _pulseAnim,
                        builder: (_, __) => Stack(
                          alignment: Alignment.center,
                          children: [
                            Container(
                              width: _pulseAnim.value * 2,
                              height: _pulseAnim.value * 2,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: AppColors.info.withValues(alpha: 0.3),
                              ),
                            ),
                            Container(
                              width: 14,
                              height: 14,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: AppColors.info,
                                border: Border.all(color: Colors.white, width: 2),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),

          // Floating Search Bar
          Positioned(
            top: 8,
            left: 16,
            right: 16,
            child: _buildSearchBar(),
          ),

          // Station count indicator
          if (!_isLoading && _stations.isNotEmpty)
            Positioned(
              top: 64,
              left: 16,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: AppColors.teal.withValues(alpha: 0.9),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  '${_stations.length} stations in view',
                  style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ),
            ),

          // Loading indicator
          if (_isLoading)
            const Positioned(
              top: 64,
              left: 0,
              right: 0,
              child: Center(
                child: SizedBox(
                  width: 24,
                  height: 24,
                  child: CircularProgressIndicator(color: AppColors.teal, strokeWidth: 2.5),
                ),
              ),
            ),

          // Station detail bottom sheet
          if (_selectedStation != null)
            Positioned(
              bottom: 80,
              left: 0,
              right: 0,
              child: _StationDetailSheet(
                station: _selectedStation!,
                onClose: () => setState(() => _selectedStation = null),
              ),
            ),
        ],
      ),
      bottomNavigationBar: DriverBottomNav(
        currentIndex: _bottomNavIndex,
        onTap: _onNavTap,
        onFabTap: _openVoltAI,
      ),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: Colors.transparent,
      elevation: 0,
      automaticallyImplyLeading: false,
      title: const VoltLogo(size: VoltLogoSize.small),
      actions: [
        const ThemeToggle(),
        const SizedBox(width: 4),
        StreamBuilder<QuerySnapshot>(
          stream: FirebaseAuth.instance.currentUser != null
              ? FirebaseFirestore.instance
                  .collection('notifications')
                  .doc(FirebaseAuth.instance.currentUser!.uid)
                  .collection('items')
                  .where('isRead', isEqualTo: false)
                  .snapshots()
              : const Stream.empty(),
          builder: (context, snapshot) {
            final unreadCount = snapshot.data?.docs.length ?? 0;
            return Stack(
              clipBehavior: Clip.none,
              children: [
                IconButton(
                  icon: const Icon(Icons.notifications_outlined, color: Colors.white),
                  onPressed: () {
                    showModalBottomSheet(
                      context: context,
                      backgroundColor: Colors.transparent,
                      isScrollControlled: true,
                      builder: (context) => const FractionallySizedBox(
                        heightFactor: 0.8,
                        child: NotificationPanel(),
                      ),
                    );
                  },
                ),
                if (unreadCount > 0)
                  Positioned(
                    right: 8,
                    top: 8,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(color: AppColors.error, shape: BoxShape.circle),
                      child: Text(
                        unreadCount > 9 ? '9+' : unreadCount.toString(),
                        style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
              ],
            );
          },
        ),
        Padding(
          padding: const EdgeInsets.only(right: 12),
          child: GestureDetector(
            onTap: () => context.go('/driver/profile'),
            child: CircleAvatar(
              radius: 16,
              backgroundColor: AppColors.teal.withValues(alpha: 0.2),
              child: const Icon(Icons.person, color: AppColors.teal, size: 18),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSearchBar() {
    return Container(
      height: 48,
      decoration: BoxDecoration(
        color: AppColors.cardDark.withValues(alpha: 0.95),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.borderDark),
      ),
      child: Row(
        children: [
          const SizedBox(width: 12),
          const Icon(Icons.search, color: AppColors.textSecondaryDark, size: 20),
          const SizedBox(width: 8),
          const Expanded(
            child: Text('Search stations, areas...', style: TextStyle(color: AppColors.textSecondaryDark, fontSize: 14)),
          ),
          IconButton(
            icon: const Icon(Icons.tune, color: AppColors.teal, size: 20),
            onPressed: () {},
          ),
        ],
      ),
    );
  }
}

class _StationDetailSheet extends StatelessWidget {
  final StationModel station;
  final VoidCallback onClose;

  const _StationDetailSheet({required this.station, required this.onClose});

  Color _availColor(String avail) {
    switch (avail) {
      case 'available': return AppColors.success;
      case 'occupied': return AppColors.error;
      default: return AppColors.textSecondaryDark;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.cardDark,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.borderDark),
        ),
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(station.name,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          color: Colors.white, fontWeight: FontWeight.bold)),
                ),
                IconButton(
                    onPressed: onClose,
                    icon: const Icon(Icons.close, color: AppColors.textSecondaryDark, size: 20)),
              ],
            ),
            const SizedBox(height: 4),
            Text(station.address,
                style: const TextStyle(color: AppColors.textSecondaryDark, fontSize: 13)),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _Chip(
                  label: station.availability.toUpperCase(),
                  color: _availColor(station.availability),
                ),
                _Chip(label: station.powerLevel, color: AppColors.info),
                if (station.queueCount > 0)
                  _Chip(label: '${station.queueCount} in queue', color: AppColors.warning),
              ],
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              children: station.connectors.map((connector) {
                Color c = AppColors.teal;
                if (connector.contains('Type2')) c = AppColors.type2Color;
                if (connector.contains('CHAdeMO')) c = AppColors.chademoColor;
                if (connector.contains('Bharat')) c = AppColors.bharatColor;
                return _Chip(label: connector, color: c);
              }).toList(),
            ),
            const SizedBox(height: 12),
            Text(station.price,
                style: const TextStyle(
                    color: AppColors.teal, fontWeight: FontWeight.bold, fontSize: 15)),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () async {
                      final url = Uri.parse(
                          'https://maps.google.com/?q=${station.lat},${station.lng}');
                      if (await canLaunchUrl(url)) launchUrl(url);
                    },
                    icon: const Icon(Icons.directions, size: 16),
                    label: const Text('Directions'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white,
                      side: const BorderSide(color: AppColors.borderDark),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => context.go('/driver/queue'),
                    icon: const Icon(Icons.people_alt, size: 16),
                    label: const Text('Join Queue'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.teal,
                      foregroundColor: AppColors.bgDark,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  final String label;
  final Color color;
  const _Chip({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.4)),
      ),
      child: Text(label,
          style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.bold)),
    );
  }
}
