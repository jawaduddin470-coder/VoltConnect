import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../theme/app_colors.dart';
import '../../../widgets/driver_bottom_nav.dart';
import '../../../widgets/volt_ai_chat.dart';
import '../../../widgets/theme_toggle.dart';

class CalculatorScreen extends StatefulWidget {
  const CalculatorScreen({super.key});

  @override
  State<CalculatorScreen> createState() => _CalculatorScreenState();
}

class _CalculatorScreenState extends State<CalculatorScreen> {
  double _currentBattery = 20;
  double _targetBattery = 100;
  final _capacityController = TextEditingController(text: '40.5');
  final _costController = TextEditingController(text: '18');
  String _chargerSpeed = '50';
  final _chargerSpeeds = ['3.3', '22', '50', '150'];
  final _chargerSpeedLabels = ['Slow', 'Fast', 'Rapid', 'Ultra'];

  @override
  void initState() {
    super.initState();
    _loadSavedEv();
  }

  Future<void> _loadSavedEv() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString('selectedEV'); // 'ModelName|kWh|km|Brand'
    if (saved != null && mounted) {
      final parts = saved.split('|');
      if (parts.length >= 2) {
        setState(() => _capacityController.text = parts[1]);
      }
    }
  }

  void _onNavTap(int index) {
    final routes = ['/driver/map', '/driver/trips', '/driver/queue', '/driver/queue', '/driver/myev'];
    context.go(routes[index]);
  }

  void _openVoltAI() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const VoltAIChat(),
    );
  }

  double get _energyNeeded {
    final capacity = double.tryParse(_capacityController.text) ?? 40.5;
    return capacity * (_targetBattery - _currentBattery) / 100;
  }

  double get _timeMinutes {
    final speed = double.tryParse(_chargerSpeed) ?? 50;
    return _energyNeeded / speed * 60;
  }

  double get _totalCost {
    final costPerKwh = double.tryParse(_costController.text) ?? 18;
    return _energyNeeded * costPerKwh;
  }

  String _formatTime(double minutes) {
    final h = minutes ~/ 60;
    final m = (minutes % 60).round();
    if (h == 0) return '${m}m';
    return '${h}h ${m}m';
  }

  double get _costPerKm {
    final costPerKwh = double.tryParse(_costController.text) ?? 18;
    // Avg consumption: ~6 km per kWh for an EV
    return costPerKwh / 6;
  }

  @override
  void dispose() {
    _capacityController.dispose();
    _costController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? AppColors.bgDark : AppColors.bgLight;
    return Scaffold(
      backgroundColor: bg,
      appBar: _buildAppBar(context),
      bottomNavigationBar: DriverBottomNav(
        currentIndex: 4,
        onTap: _onNavTap,
        onFabTap: _openVoltAI,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Input card
            Container(
              decoration: BoxDecoration(
                color: isDark ? AppColors.cardDark : AppColors.cardLight,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight),
              ),
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Session Details', style: TextStyle(
                    fontFamily: 'SpaceGrotesk', fontSize: 16, fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white : AppColors.textPrimaryLight,
                  )),
                  const SizedBox(height: 20),
                  _buildSlider('Current Battery', _currentBattery, (v) => setState(() => _currentBattery = v), AppColors.error, isDark),
                  const SizedBox(height: 12),
                  _buildSlider('Target Battery', _targetBattery, (v) => setState(() => _targetBattery = v.clamp(_currentBattery + 1, 100)), AppColors.success, isDark),
                  const SizedBox(height: 20),
                  Row(children: [
                    Expanded(child: _inputField('Battery (kWh)', _capacityController, isDark)),
                    const SizedBox(width: 12),
                    Expanded(child: _inputField('Cost/kWh (₹)', _costController, isDark)),
                  ]),
                  const SizedBox(height: 16),
                  Text('Charger Speed', style: TextStyle(
                    color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                    fontSize: 13, fontWeight: FontWeight.w600,
                  )),
                  const SizedBox(height: 8),
                  SizedBox(
                    height: 44,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: _chargerSpeeds.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 8),
                      itemBuilder: (context, i) {
                        final s = _chargerSpeeds[i];
                        final label = _chargerSpeedLabels[i];
                        final selected = _chargerSpeed == s;
                        return GestureDetector(
                          onTap: () => setState(() => _chargerSpeed = s),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            decoration: BoxDecoration(
                              color: selected ? AppColors.teal : (isDark ? AppColors.surfaceDark : AppColors.cardLight),
                              borderRadius: BorderRadius.circular(22),
                              border: Border.all(color: selected ? AppColors.teal : (isDark ? AppColors.borderDark : AppColors.borderLight)),
                            ),
                            alignment: Alignment.center,
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text('${s}kW', style: TextStyle(
                                  color: selected ? Colors.black : (isDark ? Colors.white : AppColors.textPrimaryLight),
                                  fontWeight: FontWeight.bold, fontSize: 13,
                                )),
                                Text(label, style: TextStyle(
                                  color: selected ? Colors.black.withValues(alpha: 0.7) : (isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight),
                                  fontSize: 9,
                                )),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Live results
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(colors: [AppColors.teal.withValues(alpha: 0.15), AppColors.purple.withValues(alpha: 0.1)]),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.teal.withValues(alpha: 0.4)),
              ),
              padding: const EdgeInsets.all(20),
              child: Column(children: [
                _resultRow('Energy Needed', '${_energyNeeded.toStringAsFixed(1)} kWh', AppColors.teal, large: true),
                Divider(color: isDark ? AppColors.borderDark : AppColors.borderLight, height: 24),
                _resultRow('Time to charge', _formatTime(_timeMinutes), isDark ? Colors.white : AppColors.textPrimaryLight),
                const SizedBox(height: 8),
                _resultRow('Total cost', '₹${_totalCost.toStringAsFixed(2)}', isDark ? Colors.white : AppColors.textPrimaryLight),
                const SizedBox(height: 8),
                _resultRow('Cost per km', '₹${_costPerKm.toStringAsFixed(2)}', AppColors.success),
              ]),
            ),

            const SizedBox(height: 24),

            // Comparison
            Text('Tariff Comparison', style: TextStyle(
              fontFamily: 'SpaceGrotesk', fontSize: 16, fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : AppColors.textPrimaryLight,
            )),
            const SizedBox(height: 4),
            Text('Cost per kWh in Hyderabad', style: TextStyle(fontSize: 12,
              color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight)),
            const SizedBox(height: 12),
            _buildComparisonChart(),

            const SizedBox(height: 24),

            // Nearest stations
            Text('Nearest Stations', style: TextStyle(
              fontFamily: 'SpaceGrotesk', fontSize: 16, fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : AppColors.textPrimaryLight,
            )),
            const SizedBox(height: 12),
            _buildNearestStations(isDark),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildSlider(String label, double value, ValueChanged<double> onChanged, Color color, bool isDark) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [
        Text(label, style: TextStyle(
          color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight, fontSize: 13)),
        const Spacer(),
        Text('${value.round()}%', style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 13)),
      ]),
      SliderTheme(
        data: SliderTheme.of(context).copyWith(
          activeTrackColor: color, thumbColor: color,
          inactiveTrackColor: isDark ? AppColors.borderDark : AppColors.borderLight,
          overlayColor: color.withValues(alpha: 0.2), trackHeight: 4),
        child: Slider(value: value, min: 0, max: 100, onChanged: onChanged),
      ),
    ]);
  }

  Widget _inputField(String label, TextEditingController ctrl, bool isDark) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label, style: TextStyle(
        color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
        fontSize: 13, fontWeight: FontWeight.w600)),
      const SizedBox(height: 8),
      TextField(
        controller: ctrl,
        keyboardType: TextInputType.number,
        style: TextStyle(color: isDark ? Colors.white : AppColors.textPrimaryLight),
        onChanged: (_) => setState(() {}),
        decoration: InputDecoration(
          filled: true,
          fillColor: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: isDark ? AppColors.borderDark : AppColors.borderLight)),
          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: isDark ? AppColors.borderDark : AppColors.borderLight)),
          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.teal, width: 2)),
          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        ),
      ),
    ]);
  }

  Widget _resultRow(String label, String value, Color valueColor, {bool large = false}) {
    return Row(children: [
      Text(label, style: const TextStyle(color: AppColors.textSecondaryDark, fontSize: 14)),
      const Spacer(),
      Text(value, style: TextStyle(color: valueColor, fontWeight: FontWeight.bold, fontSize: large ? 22 : 16)),
    ]);
  }

  Widget _buildComparisonChart() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final providers = [
      ('EESL', 8.0, AppColors.info, false),
      ('BPCL', 12.0, const Color(0xFF06B6D4), false),
      ('VoltConnect Partner', 16.0, AppColors.teal, true),
      ('ChargeZone', 22.0, AppColors.warning, false),
      ('Fortum', 28.0, const Color(0xFFF97316), false),
      ('Premium Fast', 35.0, AppColors.error, false),
    ];
    const maxRate = 35.0;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : AppColors.cardLight,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight),
      ),
      child: Column(
        children: providers.map((p) => Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(children: [
                Expanded(child: Text(p.$1, style: TextStyle(
                  fontSize: 12, fontWeight: p.$4 ? FontWeight.bold : FontWeight.normal,
                  color: p.$4 ? AppColors.teal : (isDark ? Colors.white : AppColors.textPrimaryLight),
                ))),
                if (p.$4) Container(
                  margin: const EdgeInsets.only(right: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.teal.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: const Text('Best Value', style: TextStyle(fontSize: 9, color: AppColors.teal, fontWeight: FontWeight.bold)),
                ),
                Text('₹${p.$2.toInt()}/kWh', style: TextStyle(
                  fontSize: 12, color: p.$3, fontWeight: FontWeight.bold)),
              ]),
              const SizedBox(height: 4),
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: p.$2 / maxRate,
                  backgroundColor: isDark ? AppColors.borderDark : AppColors.borderLight,
                  color: p.$3, minHeight: 8,
                ),
              ),
            ],
          ),
        )).toList(),
      ),
    );
  }

  Widget _buildNearestStations(bool isDark) {
    final stations = [
      ('Tata Power EV Hub', '1.2 km', true),
      ('Ather Grid Station', '2.8 km', true),
      ('Zeon Charging Hub', '3.5 km', false),
    ];
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : AppColors.cardLight,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Stations near you', style: TextStyle(
            fontWeight: FontWeight.bold, fontSize: 14,
            color: isDark ? Colors.white : AppColors.textPrimaryLight,
          )),
          const SizedBox(height: 12),
          ...stations.map((s) => Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: Row(children: [
              Expanded(child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(s.$1, style: TextStyle(
                    fontWeight: FontWeight.w600, fontSize: 13,
                    color: isDark ? Colors.white : AppColors.textPrimaryLight,
                  )),
                  const SizedBox(height: 2),
                  Text(s.$2, style: TextStyle(fontSize: 11,
                    color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight)),
                ],
              )),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: (s.$3 ? AppColors.success : AppColors.warning).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(s.$3 ? 'Available' : 'Busy', style: TextStyle(
                  fontSize: 10, fontWeight: FontWeight.bold,
                  color: s.$3 ? AppColors.success : AppColors.warning,
                )),
              ),
              const SizedBox(width: 8),
              GestureDetector(
                onTap: () => context.go('/driver/map'),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Row(children: [
                    Icon(Icons.navigation, size: 12, color: isDark ? Colors.white : AppColors.textPrimaryLight),
                    const SizedBox(width: 4),
                    Text('Navigate', style: TextStyle(fontSize: 11,
                      color: isDark ? Colors.white : AppColors.textPrimaryLight)),
                  ]),
                ),
              ),
            ]),
          )),
        ],
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return AppBar(
      backgroundColor: isDark ? AppColors.bgDark : AppColors.bgLight,
      elevation: 0,
      automaticallyImplyLeading: false,
      title: Text('Cost Calculator', style: TextStyle(
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
