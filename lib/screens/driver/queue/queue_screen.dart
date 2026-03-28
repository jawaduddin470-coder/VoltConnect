import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../theme/app_colors.dart';
import '../../../services/queue_service.dart';
import '../../../services/location_service.dart';
import '../../../widgets/driver_bottom_nav.dart';
import '../../../widgets/volt_ai_chat.dart';
import '../../../widgets/theme_toggle.dart';

class QueueScreen extends StatefulWidget {
  const QueueScreen({super.key});

  @override
  State<QueueScreen> createState() => _QueueScreenState();
}

class _QueueScreenState extends State<QueueScreen> {
  // ── State ─────────────────────────────────────────────────────────────────
  List<QueuedStation> _stations = [];
  ActiveQueue? _activeQueue;
  bool _isLoading = true;
  String? _joiningStationId;
  String _activeFilter = 'All';
  Set<String> _expandedIds = {};
  bool _showHistory = false;
  Timer? _refreshTimer;
  
  // ── Search ────────────────────────────────────────────────────────────────
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  final _filters = ['All', 'No Wait', 'Fast Charger', 'Available'];

  @override
  void initState() {
    super.initState();
    _loadData();
    // Phase 7: Auto-refresh every 60 seconds
    _refreshTimer = Timer.periodic(const Duration(seconds: 60), (_) => _refreshQueueData());
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  // ── Data Loading ──────────────────────────────────────────────────────────

  Future<void> _loadData() async {
    if (!mounted) return;
    setState(() => _isLoading = true);

    try {
      final pos = await LocationService.getCurrentPosition();
      final lat = pos?.latitude ?? 17.3850;
      final lng = pos?.longitude ?? 78.4867;

      debugPrint("Queue fetching stations...");
      
      // Parallel fetch
      final results = await Future.wait([
        QueueService.getNearestQueuedStations(lat, lng),
        QueueService.getUserActiveQueue(),
      ]);

      if (mounted) {
        final List<QueuedStation> fetchedStations = results[0] as List<QueuedStation>;
        debugPrint("Queue fetching stations — Size: ${fetchedStations.length}");
        setState(() {
          _stations = fetchedStations;
          _activeQueue = results[1] as ActiveQueue?;
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint("Queue page load error: $e");
      if (mounted) {
        setState(() => _isLoading = false);
        if (e.toString().contains('permission-denied')) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text('Firebase Permission Denied! Update your Firestore rules.'),
            backgroundColor: AppColors.error,
          ));
        } else {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text('Failed to load queue data: $e'),
            backgroundColor: AppColors.error,
          ));
        }
      }
    }
  }

  // Phase 7: Refresh queue simulation data (re-runs algorithm with current time)
  Future<void> _refreshQueueData() async {
    if (!mounted) return;
    try {
      final pos = await LocationService.getCurrentPosition();
      final lat = pos?.latitude ?? 17.3850;
      final lng = pos?.longitude ?? 78.4867;
      final fresh = await QueueService.getNearestQueuedStations(lat, lng);
      final activeQ = await QueueService.getUserActiveQueue();
      if (mounted) setState(() { _stations = fresh; _activeQueue = activeQ; });
    } catch (e) {
      debugPrint("Queue refresh error: $e");
    }
  }

  // ── Queue Actions ─────────────────────────────────────────────────────────

  Future<void> _joinQueue(QueuedStation qs) async {
    setState(() => _joiningStationId = qs.station.id);
    try {
      final position = await QueueService.joinQueue(qs);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Joined queue at ${qs.station.name}! Position: #$position'),
          backgroundColor: AppColors.success,
        ));
        _loadData(); // Refresh to show active queue card
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Please sign in to join the queue'),
        backgroundColor: AppColors.warning,
      ));
    } finally {
      if (mounted) setState(() => _joiningStationId = null);
    }
  }

  Future<void> _leaveQueue() async {
    if (_activeQueue == null) return;
    await QueueService.leaveQueue(_activeQueue!.stationId);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Left the queue'),
        backgroundColor: AppColors.info,
      ));
      _loadData();
    }
  }

  // ── Filter ────────────────────────────────────────────────────────────────

  List<QueuedStation> get _filteredStations {
    return _stations.where((qs) {
      // Filter by search query
      if (_searchQuery.isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final nameMatch = qs.station.name.toLowerCase().contains(q);
        final addressMatch = qs.station.address.toLowerCase().contains(q);
        if (!nameMatch && !addressMatch) return false;
      }
      // Filter by chip
      switch (_activeFilter) {
        case 'No Wait':
          return qs.queueCount == 0;
        case 'Fast Charger':
          return qs.station.power >= 50;
        case 'Available':
          return qs.availability != 'offline';
        default:
          return true;
      }
    }).toList();
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  void _onNavTap(int index) {
    final routes = ['/driver/map', '/driver/trips', '/driver/queue', '/driver/queue', '/driver/myev'];
    if (index != 2) context.go(routes[index]);
  }

  void _openVoltAI() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const VoltAIChat(),
    );
  }

  // ── Build ─────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? AppColors.bgDark : AppColors.bgLight;
    final filtered = _filteredStations;

    return Scaffold(
      backgroundColor: bg,
      appBar: _buildAppBar(isDark),
      bottomNavigationBar: DriverBottomNav(
        currentIndex: 2,
        onTap: _onNavTap,
        onFabTap: _openVoltAI,
      ),
      body: RefreshIndicator(
        color: AppColors.teal,
        onRefresh: _loadData,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Active Queue Card
              _ActiveQueueCard(
                activeQueue: _activeQueue,
                isDark: isDark,
                onLeave: _leaveQueue,
              ),
              const SizedBox(height: 16),

              // Search Bar
              Container(
                height: 46,
                decoration: BoxDecoration(
                  color: isDark ? AppColors.cardDark : AppColors.cardLight,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight),
                ),
                child: Row(
                  children: [
                    const SizedBox(width: 12),
                    Icon(Icons.search, size: 18,
                      color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight),
                    const SizedBox(width: 8),
                    Expanded(
                      child: TextField(
                        controller: _searchController,
                        style: TextStyle(
                          fontSize: 14,
                          color: isDark ? Colors.white : AppColors.textPrimaryLight,
                        ),
                        decoration: InputDecoration(
                          hintText: 'Search by station name or city...',
                          hintStyle: TextStyle(
                            fontSize: 14,
                            color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                          ),
                          border: InputBorder.none,
                          isDense: true,
                        ),
                        onChanged: (val) => setState(() => _searchQuery = val.trim().toLowerCase()),
                      ),
                    ),
                    if (_searchQuery.isNotEmpty)
                      IconButton(
                        icon: Icon(Icons.close, size: 18,
                          color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight),
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _searchQuery = '');
                        },
                      ),
                  ],
                ),
              ),
              const SizedBox(height: 12),

              // Filter Chips
              SizedBox(
                height: 40,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: _filters.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 8),
                  itemBuilder: (context, i) {
                    final filter = _filters[i];
                    final active = _activeFilter == filter;
                    return GestureDetector(
                      onTap: () => setState(() => _activeFilter = filter),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        constraints: const BoxConstraints(minHeight: 44),
                        alignment: Alignment.center,
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        decoration: BoxDecoration(
                          color: active ? AppColors.teal : (isDark ? AppColors.cardDark : AppColors.cardLight),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: active ? AppColors.teal : (isDark ? AppColors.borderDark : AppColors.borderLight),
                          ),
                        ),
                        child: Text(filter, style: TextStyle(
                          fontSize: 12, fontWeight: FontWeight.w500,
                          color: active ? Colors.black : (isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight),
                        )),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 20),

              Row(
                children: [
                  Text('NEAREST STATIONS', style: TextStyle(
                    fontSize: 11, letterSpacing: 1.2, fontWeight: FontWeight.bold,
                    color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                  )),
                  const SizedBox(width: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(4)),
                    child: const Text('V.10 READY', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold)),
                  ),
                  const Spacer(),
                  if (!_isLoading)
                    Text('${filtered.length} results', style: TextStyle(
                      fontSize: 11, color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                    )),
                ],
              ),
              const SizedBox(height: 12),

              // Station Cards
              if (_isLoading)
                ...List.generate(5, (_) => _ShimmerCard(isDark: isDark))
              else if (filtered.isEmpty)
                _EmptyState(isDark: isDark)
              else
                ...filtered.map((qs) => _QueueStationCard(
                  qs: qs,
                  isDark: isDark,
                  isJoining: _joiningStationId == qs.station.id,
                  isExpanded: _expandedIds.contains(qs.station.id),
                  isActiveStation: _activeQueue?.stationId == qs.station.id,
                  onTap: () => setState(() {
                    if (_expandedIds.contains(qs.station.id)) {
                      _expandedIds.remove(qs.station.id);
                    } else {
                      _expandedIds.add(qs.station.id);
                    }
                  }),
                  onJoin: () => _joinQueue(qs),
                )),

              const SizedBox(height: 24),

              // History Accordion
              GestureDetector(
                onTap: () => setState(() => _showHistory = !_showHistory),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.cardDark : AppColors.cardLight,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight),
                  ),
                  child: Row(
                    children: [
                      Text('Past Queue History', style: TextStyle(
                        fontWeight: FontWeight.w600, fontSize: 14,
                        color: isDark ? Colors.white : AppColors.textPrimaryLight,
                      )),
                      const Spacer(),
                      Icon(_showHistory ? Icons.expand_less : Icons.expand_more,
                        color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight),
                    ],
                  ),
                ),
              ),
              if (_showHistory) ...[
                const SizedBox(height: 8),
                ..._historyItems(isDark),
              ],
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  List<Widget> _historyItems(bool isDark) {
    final items = [
      ('Tata Power EV Hub', 'Mar 10, 2026', '12 min wait', '28 min charge'),
      ('Ather Grid Station', 'Mar 7, 2026', 'No wait', '45 min charge'),
      ('BPCL Fast Charger', 'Mar 2, 2026', '5 min wait', '18 min charge'),
    ];
    return items.map((item) => Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight),
      ),
      child: Row(
        children: [
          Expanded(child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(item.$1, style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13,
                color: isDark ? Colors.white : AppColors.textPrimaryLight)),
              const SizedBox(height: 2),
              Text('${item.$2} · ${item.$3}', style: TextStyle(fontSize: 12,
                color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight)),
            ],
          )),
          Text(item.$4, style: const TextStyle(fontSize: 12, color: AppColors.teal, fontWeight: FontWeight.w500)),
        ],
      ),
    )).toList();
  }

  PreferredSizeWidget _buildAppBar(bool isDark) {
    return AppBar(
      backgroundColor: isDark ? AppColors.bgDark : AppColors.bgLight,
      elevation: 0,
      automaticallyImplyLeading: false,
      title: Text('Virtual Queue', style: TextStyle(
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
    );
  }
}

// ── Active Queue Card ─────────────────────────────────────────────────────────

class _ActiveQueueCard extends StatelessWidget {
  final ActiveQueue? activeQueue;
  final bool isDark;
  final VoidCallback onLeave;

  const _ActiveQueueCard({required this.activeQueue, required this.isDark, required this.onLeave});

  @override
  Widget build(BuildContext context) {
    final aq = activeQueue;
    if (aq == null) {
      // Not in queue
      return ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: Stack(children: [
          Container(
            decoration: BoxDecoration(
              color: isDark ? AppColors.cardDark : AppColors.cardLight,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight),
            ),
            padding: const EdgeInsets.fromLTRB(19, 16, 16, 16),
            child: Row(children: [
              Icon(Icons.info_outline, size: 18,
                color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight),
              const SizedBox(width: 12),
              Text('Not in any queue — browse stations below', style: TextStyle(fontSize: 13,
                color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight)),
            ]),
          ),
          Positioned(left: 0, top: 0, bottom: 0,
            child: Container(width: 3, color: AppColors.textSecondaryDark.withValues(alpha: 0.5))),
        ]),
      );
    }

    // Active queue
    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: Stack(children: [
        Container(
          decoration: BoxDecoration(
            color: isDark ? AppColors.cardDark : AppColors.cardLight,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.teal.withValues(alpha: 0.5)),
          ),
          padding: const EdgeInsets.all(16),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              const Icon(Icons.people_alt, size: 16, color: AppColors.teal),
              const SizedBox(width: 8),
              Text('You\'re in queue!', style: TextStyle(
                fontWeight: FontWeight.bold, color: isDark ? Colors.white : AppColors.textPrimaryLight)),
              const Spacer(),
              TextButton(
                onPressed: onLeave,
                style: TextButton.styleFrom(foregroundColor: AppColors.error, padding: EdgeInsets.zero),
                child: const Text('Leave', style: TextStyle(fontSize: 12)),
              ),
            ]),
            const SizedBox(height: 8),
            Text(aq.stationName, style: const TextStyle(color: AppColors.teal, fontWeight: FontWeight.w600, fontSize: 13)),
            const SizedBox(height: 4),
            Row(children: [
              _Badge('Position #${aq.position}', AppColors.teal),
              const SizedBox(width: 8),
              _Badge('~${aq.estimatedWaitMinutes} min', AppColors.warning),
            ]),
          ]),
        ),
        Positioned(left: 0, top: 0, bottom: 0,
          child: Container(width: 3, color: AppColors.teal)),
      ]),
    );
  }
}

// ── Queue Station Card ────────────────────────────────────────────────────────

class _QueueStationCard extends StatefulWidget {
  final QueuedStation qs;
  final bool isDark, isJoining, isExpanded, isActiveStation;
  final VoidCallback onTap, onJoin;

  const _QueueStationCard({
    required this.qs, required this.isDark, required this.isJoining,
    required this.isExpanded, required this.isActiveStation,
    required this.onTap, required this.onJoin,
  });

  @override
  State<_QueueStationCard> createState() => _QueueStationCardState();
}

class _QueueStationCardState extends State<_QueueStationCard> {
  bool _pressed = false;

  Color get _waitColor {
    if (widget.qs.availability == 'offline') return AppColors.textSecondaryDark;
    if (widget.qs.queueCount == 0) return AppColors.success;
    if (widget.qs.estimatedWaitMinutes <= 10) return AppColors.warning;
    return AppColors.error;
  }

  String get _waitLabel {
    if (widget.qs.availability == 'offline') return 'Offline';
    if (widget.qs.queueCount == 0) return 'No wait';
    return '~${widget.qs.estimatedWaitMinutes} min';
  }

  @override
  Widget build(BuildContext context) {
    final qs = widget.qs;
    final s = qs.station;
    final wc = _waitColor;
    final cardColor = widget.isDark ? AppColors.cardDark : AppColors.cardLight;
    final border = widget.isDark ? AppColors.borderDark : AppColors.borderLight;
    final textPri = widget.isDark ? Colors.white : AppColors.textPrimaryLight;
    final textSec = widget.isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;

    return GestureDetector(
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp: (_) { setState(() => _pressed = false); widget.onTap(); },
      onTapCancel: () => setState(() => _pressed = false),
      child: AnimatedScale(
        scale: _pressed ? 0.97 : 1.0,
        duration: const Duration(milliseconds: 100),
        child: Container(
          margin: const EdgeInsets.only(bottom: 10),
          decoration: BoxDecoration(
            color: cardColor,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: widget.isActiveStation ? AppColors.teal.withValues(alpha: 0.6) : border,
              width: widget.isActiveStation ? 1.5 : 1.0,
            ),
          ),
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Station info
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(s.name, style: TextStyle(
                                fontWeight: FontWeight.w600, fontSize: 14, color: textPri)),
                              const SizedBox(height: 4),
                              Row(children: [
                                Icon(Icons.location_on, size: 12, color: textSec),
                                const SizedBox(width: 4),
                                Expanded(child: Text(
                                  s.address.isNotEmpty ? s.address : '${qs.distanceKm.toStringAsFixed(1)} km away',
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(fontSize: 12, color: textSec),
                                )),
                              ]),
                              const SizedBox(height: 4),
                              Text('${qs.distanceKm.toStringAsFixed(1)} km · ${qs.queueCount} in queue · ${s.numChargers} charger${s.numChargers == 1 ? "" : "s"}',
                                style: TextStyle(fontSize: 11, color: textSec)),
                            ],
                          ),
                        ),
                        const SizedBox(width: 10),
                        // Wait badge + join button
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                              decoration: BoxDecoration(
                                color: wc.withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(_waitLabel, style: TextStyle(
                                fontSize: 11, color: wc, fontWeight: FontWeight.bold)),
                            ),
                            const SizedBox(height: 8),
                            if (qs.availability != 'offline')
                              GestureDetector(
                                onTap: widget.isActiveStation ? null : widget.onJoin,
                                child: Container(
                                  constraints: const BoxConstraints(minHeight: 36, minWidth: 64),
                                  alignment: Alignment.center,
                                  padding: const EdgeInsets.symmetric(horizontal: 14),
                                  decoration: BoxDecoration(
                                    color: widget.isActiveStation
                                        ? AppColors.teal.withValues(alpha: 0.3)
                                        : AppColors.teal,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: widget.isJoining
                                      ? const SizedBox(width: 14, height: 14,
                                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                                      : Text(widget.isActiveStation ? 'Joined' : 'Join',
                                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black)),
                                ),
                              ),
                          ],
                        ),
                      ],
                    ),
                    // Utilization bar
                    const SizedBox(height: 10),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: qs.utilizationPercent / 100,
                        minHeight: 4,
                        backgroundColor: border,
                        valueColor: AlwaysStoppedAnimation<Color>(
                          qs.utilizationPercent > 80 ? AppColors.error
                              : qs.utilizationPercent > 50 ? AppColors.warning
                              : AppColors.success,
                        ),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('${qs.utilizationPercent.toInt()}% utilized', style: TextStyle(fontSize: 10, color: textSec)),
                        Text(s.powerLevel, style: const TextStyle(fontSize: 10, color: AppColors.info, fontWeight: FontWeight.w600)),
                      ],
                    ),
                  ],
                ),
              ),

              // Expanded detail
              if (widget.isExpanded)
                Padding(
                  padding: const EdgeInsets.fromLTRB(14, 0, 14, 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Divider(color: border),
                      // Connector badges
                      Wrap(spacing: 6, runSpacing: 6, children: s.connectors.map((c) => Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.teal.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.teal.withValues(alpha: 0.3)),
                        ),
                        child: Text(c, style: const TextStyle(color: AppColors.teal, fontSize: 11)),
                      )).toList()),
                      const SizedBox(height: 10),
                      // Directions button
                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton.icon(
                          icon: const Icon(Icons.directions, size: 14),
                          label: const Text('Directions', style: TextStyle(fontSize: 13)),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: textSec,
                            side: BorderSide(color: border),
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                          onPressed: () async {
                            final url = Uri.parse('https://maps.google.com/?q=${s.lat},${s.lng}');
                            if (await canLaunchUrl(url)) launchUrl(url);
                          },
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Shimmer Skeleton Card ─────────────────────────────────────────────────────

class _ShimmerCard extends StatefulWidget {
  final bool isDark;
  const _ShimmerCard({required this.isDark});

  @override
  State<_ShimmerCard> createState() => _ShimmerCardState();
}

class _ShimmerCardState extends State<_ShimmerCard> with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(duration: const Duration(milliseconds: 1200), vsync: this)..repeat();
    _anim = Tween<double>(begin: -1, end: 2).animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut));
  }

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final base = widget.isDark ? AppColors.cardDark : AppColors.cardLight;
    final shimmer = widget.isDark ? const Color(0xFF2A2A3A) : const Color(0xFFE0E0E0);
    return AnimatedBuilder(
      animation: _anim,
      builder: (_, __) => Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: base,
          borderRadius: BorderRadius.circular(12),
          gradient: LinearGradient(
            begin: Alignment(_anim.value - 1, 0),
            end: Alignment(_anim.value, 0),
            colors: [base, shimmer, base],
          ),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          _Box(width: 180, height: 14, color: shimmer),
          const SizedBox(height: 8),
          _Box(width: 120, height: 11, color: shimmer),
          const SizedBox(height: 10),
          _Box(width: double.infinity, height: 4, color: shimmer),
        ]),
      ),
    );
  }
}

class _Box extends StatelessWidget {
  final double width, height;
  final Color color;
  const _Box({required this.width, required this.height, required this.color});

  @override
  Widget build(BuildContext context) => Container(
    width: width,
    height: height,
    decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(4)),
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

class _EmptyState extends StatelessWidget {
  final bool isDark;
  const _EmptyState({required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 40),
      child: Center(
        child: Column(children: [
          Icon(Icons.ev_station, size: 48, color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight),
          const SizedBox(height: 12),
          Text('No stations match the filter', style: TextStyle(
            color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight, fontSize: 14)),
        ]),
      ),
    );
  }
}

// ── Small Helper ──────────────────────────────────────────────────────────────

class _Badge extends StatelessWidget {
  final String label;
  final Color color;
  const _Badge(this.label, this.color);

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
    decoration: BoxDecoration(color: color.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(6)),
    child: Text(label, style: TextStyle(fontSize: 11, color: color, fontWeight: FontWeight.bold)),
  );
}
