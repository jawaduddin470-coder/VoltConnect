import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../theme/app_colors.dart';
import '../../../widgets/driver_bottom_nav.dart';
import '../../../widgets/theme_toggle.dart';

// ── Data models ────────────────────────────────────────────────────────────────
class _EvModel {
  final String name;
  final double kWh;
  final int kmRange;
  const _EvModel(this.name, this.kWh, this.kmRange);
}

const _brandData = {
  'Tata': {
    'Car': [
      _EvModel('Nexon EV', 40.5, 312),
      _EvModel('Tiago EV', 24.0, 250),
      _EvModel('Punch EV', 35.0, 421),
      _EvModel('Tigor EV', 26.0, 306),
    ],
  },
  'Ather': {
    '2-Wheeler': [
      _EvModel('450X', 2.9, 146),
      _EvModel('450S', 2.9, 115),
    ],
  },
  'Ola': {
    '2-Wheeler': [
      _EvModel('S1 Pro', 4.0, 181),
      _EvModel('S1 Air', 2.5, 125),
    ],
  },
  'MG': {
    'Car': [
      _EvModel('ZS EV', 50.3, 461),
      _EvModel('Comet EV', 17.3, 230),
    ],
  },
  'Hyundai': {
    'Car': [
      _EvModel('Creta Electric', 51.4, 473),
      _EvModel('Ioniq 5', 72.6, 631),
    ],
  },
};

const _brands = [
  'Tata', 'MG', 'Mahindra', 'BYD', 'Hyundai', 'Kia', 'Citroen',
  'BMW', 'Mercedes', 'Audi', 'Volvo', 'Porsche', 'MINI', 'Nissan',
  'Piaggio', 'Ather', 'Ola', 'TVS', 'Bajaj', 'Hero',
];

const _typeIcons = {
  'Car': Icons.directions_car,
  'Commercial': Icons.airport_shuttle,
  '3-Wheeler': Icons.electric_rickshaw,
  '2-Wheeler': Icons.electric_scooter,
};

class MyEvScreen extends StatefulWidget {
  const MyEvScreen({super.key});

  @override
  State<MyEvScreen> createState() => _MyEvScreenState();
}

class _MyEvScreenState extends State<MyEvScreen> {
  String? _selectedBrand;
  String? _selectedType;
  _EvModel? _selectedModel;
  double _batteryPercent = 80;
  bool _isSaving = false;

  void _onNavTap(int index) {
    final routes = ['/driver/map', '/driver/trips', '/driver/queue', '/driver/queue', '/driver/myev'];
    if (index != 4) context.go(routes[index]);
  }

  List<String> _typesForBrand(String brand) {
    return (_brandData[brand]?.keys.toList() ?? ['Car', 'Commercial', '3-Wheeler', '2-Wheeler']);
  }

  List<_EvModel> _modelsFor(String brand, String type) {
    return (_brandData[brand]?[type] as List<_EvModel>?) ?? [];
  }

  Future<void> _saveModel(_EvModel model) async {
    setState(() => _isSaving = true);
    try {
      final user = FirebaseAuth.instance.currentUser;
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('selectedEV', '${model.name}|${model.kWh}|${model.kmRange}|$_selectedBrand');
      if (user != null) {
        await FirebaseFirestore.instance.collection('users').doc(user.uid).collection('ev').doc('vehicle').set({
          'model': model.name, 'brand': _selectedBrand,
          'batteryCapacity': model.kWh, 'totalRange': model.kmRange,
          'currentBattery': _batteryPercent.round(),
          'updatedAt': FieldValue.serverTimestamp(),
        });
      }
      if (mounted) {
        setState(() => _selectedModel = model);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('${model.name} saved!'), backgroundColor: AppColors.success));
      }
    } catch (_) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Saved (demo mode)'), backgroundColor: AppColors.info));
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  Color get _batteryColor {
    if (_batteryPercent > 60) return AppColors.success;
    if (_batteryPercent > 30) return AppColors.warning;
    return AppColors.error;
  }

  double get _estimatedRange {
    if (_selectedModel == null) return 0;
    return _selectedModel!.kmRange * _batteryPercent / 100;
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
        title: Text('My EV', style: TextStyle(
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
      bottomNavigationBar: DriverBottomNav(currentIndex: 4, onTap: _onNavTap, onFabTap: () {}),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // If model selected — show EV profile card at top
            if (_selectedModel != null) ...[
              _buildEvProfileCard(isDark),
              const SizedBox(height: 24),
              _buildBatterySlider(isDark),
              const SizedBox(height: 32),
              GestureDetector(
                onTap: () => setState(() {
                  _selectedBrand = null;
                  _selectedType = null;
                  _selectedModel = null;
                }),
                child: const Text('Change Vehicle', style: TextStyle(color: AppColors.teal, fontSize: 13)),
              ),
              const SizedBox(height: 40),
            ] else ...[
              // Step 1: Brand selection
              _buildBrandGrid(isDark),
              
              // Step 2: Type selection (animated reveal)
              if (_selectedBrand != null) ...[
                const SizedBox(height: 32),
                _buildTypeGrid(isDark),
              ],

              // Step 3: Model selection
              if (_selectedBrand != null && _selectedType != null) ...[
                const SizedBox(height: 32),
                _buildModelList(isDark),
              ],
              const SizedBox(height: 32),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildEvProfileCard(bool isDark) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [isDark ? AppColors.cardDark : AppColors.cardLight, AppColors.teal.withValues(alpha: 0.12)],
          begin: Alignment.topLeft, end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(19),
        child: Stack(
          children: [
            // Teal top accent bar
            Positioned(top: 0, left: 0, right: 0,
              child: Container(height: 3, color: AppColors.teal)),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                Icon(Icons.electric_car, size: 72, color: AppColors.teal.withValues(alpha: 0.8)),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(_selectedBrand ?? '', style: TextStyle(
                  fontSize: 12, color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight)),
                Text(_selectedModel!.name, style: TextStyle(
                  fontFamily: 'SpaceGrotesk', fontSize: 20, fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : AppColors.textPrimaryLight,
                )),
                const SizedBox(height: 4),
                Text('${_selectedModel!.kWh} kWh battery', style: TextStyle(
                  fontSize: 12, color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight)),
                const SizedBox(height: 12),
                // Circular battery indicator using stack
                Row(children: [
                  SizedBox(
                    width: 52, height: 52,
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        CircularProgressIndicator(
                          value: _batteryPercent / 100,
                          backgroundColor: isDark ? AppColors.borderDark : AppColors.borderLight,
                          color: _batteryColor, strokeWidth: 5,
                        ),
                        Text('${_batteryPercent.round()}%', style: TextStyle(
                          fontSize: 11, fontWeight: FontWeight.bold, color: _batteryColor,
                        )),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('Range: ~${_estimatedRange.round()} km', style: TextStyle(
                      fontSize: 13, fontWeight: FontWeight.w600,
                      color: isDark ? Colors.white : AppColors.textPrimaryLight,
                    )),
                    const SizedBox(height: 2),
                    Text('of ${_selectedModel!.kmRange} km full', style: TextStyle(
                      fontSize: 11, color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                    )),
                  ]), // expands column
                ]), // expands row
              ], // expanded column children
            ), // column
          ), // expanded
        ], // row children
      ), // row
    ), // padding
  ], // stack children
  ), // stack
  ), // cliprrect
  ); // return container
  }

  Widget _buildBatterySlider(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Current Battery Level', style: TextStyle(
          fontWeight: FontWeight.w600, fontSize: 14,
          color: isDark ? Colors.white : AppColors.textPrimaryLight,
        )),
        const SizedBox(height: 8),
        SliderTheme(
          data: SliderTheme.of(context).copyWith(
            activeTrackColor: _batteryColor, thumbColor: _batteryColor,
            inactiveTrackColor: isDark ? AppColors.borderDark : AppColors.borderLight,
            overlayColor: _batteryColor.withValues(alpha: 0.2),
          ),
          child: Slider(
            value: _batteryPercent, min: 0, max: 100,
            onChanged: (v) => setState(() => _batteryPercent = v),
          ),
        ),
      ],
    );
  }

  Widget _buildBrandGrid(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('My EV Vehicle', style: TextStyle(
          fontFamily: 'SpaceGrotesk', fontSize: 20, fontWeight: FontWeight.bold,
          color: isDark ? Colors.white : AppColors.textPrimaryLight,
        )),
        const SizedBox(height: 4),
        Text('Select your EV to get personalised charging recommendations', style: TextStyle(
          fontSize: 13, color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
        )),
        const SizedBox(height: 20),
        Text('1 SELECT BRAND', style: TextStyle(
          fontSize: 11, letterSpacing: 1.2, fontWeight: FontWeight.bold,
          color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
        )),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8, runSpacing: 8,
          children: _brands.map((brand) {
            final selected = _selectedBrand == brand;
            return GestureDetector(
              onTap: () => setState(() {
                _selectedBrand = brand;
                _selectedType = null;
              }),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: selected ? AppColors.teal : (isDark ? AppColors.cardDark : AppColors.cardLight),
                  borderRadius: BorderRadius.circular(100),
                  border: Border.all(
                    color: selected ? AppColors.teal : (isDark ? AppColors.borderDark : AppColors.borderLight),
                  ),
                ),
                child: Text(brand, style: TextStyle(
                  fontSize: 13, fontWeight: selected ? FontWeight.w600 : FontWeight.normal,
                  color: selected ? Colors.black : (isDark ? Colors.white : AppColors.textPrimaryLight),
                )),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildTypeGrid(bool isDark) {
    final types = _typesForBrand(_selectedBrand!);
    final allTypes = ['Car', 'Commercial', '3-Wheeler', '2-Wheeler'];
    final displayTypes = allTypes.where((t) => true).toList(); // Show all types

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('2 SELECT TYPE', style: TextStyle(
          fontSize: 11, letterSpacing: 1.2, fontWeight: FontWeight.bold,
          color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
        )),
        const SizedBox(height: 12),
        GridView.count(
          crossAxisCount: 2, crossAxisSpacing: 10, mainAxisSpacing: 10,
          childAspectRatio: 2.2, shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
          children: displayTypes.map((type) {
            final selected = _selectedType == type;
            final hasModels = _modelsFor(_selectedBrand!, type).isNotEmpty;
            return GestureDetector(
              onTap: () => setState(() => _selectedType = type),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: selected ? AppColors.teal.withValues(alpha: 0.15) : (isDark ? AppColors.cardDark : AppColors.cardLight),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: selected ? AppColors.teal : (isDark ? AppColors.borderDark : AppColors.borderLight), width: selected ? 2 : 1),
                ),
                child: Row(children: [
                  Icon(_typeIcons[type] ?? Icons.directions_car, size: 28,
                    color: selected ? AppColors.teal : (isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight)),
                  const SizedBox(width: 10),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(type, style: TextStyle(
                        fontSize: 13, fontWeight: FontWeight.w600,
                        color: selected ? AppColors.teal : (isDark ? Colors.white : AppColors.textPrimaryLight),
                      )),
                      Text(
                        hasModels ? '${_modelsFor(_selectedBrand!, type).length} models' : 'All brands',
                        style: TextStyle(fontSize: 11,
                          color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight),
                      ),
                    ],
                  ),
                ]),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildModelList(bool isDark) {
    final models = _modelsFor(_selectedBrand!, _selectedType!);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('3 SELECT MODEL', style: TextStyle(
          fontSize: 11, letterSpacing: 1.2, fontWeight: FontWeight.bold,
          color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
        )),
        const SizedBox(height: 12),
        if (models.isEmpty)
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: isDark ? AppColors.cardDark : AppColors.cardLight,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight),
            ),
            child: Center(child: Text(
              'Models for $_selectedBrand $_selectedType\ncoming soon',
              textAlign: TextAlign.center,
              style: TextStyle(color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight, fontSize: 13),
            )),
          )
        else
          ...models.map((model) => Container(
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark ? AppColors.cardDark : AppColors.cardLight,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight),
            ),
            child: Row(
              children: [
                Expanded(child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(model.name, style: TextStyle(
                      fontWeight: FontWeight.w600, fontSize: 14,
                      color: isDark ? Colors.white : AppColors.textPrimaryLight,
                    )),
                    const SizedBox(height: 8),
                    Wrap(spacing: 6, children: [
                      _Badge('${model.kWh} kWh', AppColors.teal),
                      _Badge('${model.kmRange} km', AppColors.info),
                    ]),
                  ],
                )),
                GestureDetector(
                  onTap: _isSaving ? null : () => _saveModel(model),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(
                      color: AppColors.teal,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: _isSaving
                        ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                        : const Text('Select', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black)),
                  ),
                ),
              ],
            ),
          )),
      ],
    );
  }
}

class _Badge extends StatelessWidget {
  final String label;
  final Color color;
  const _Badge(this.label, this.color);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(label, style: TextStyle(fontSize: 11, color: color, fontWeight: FontWeight.w500)),
    );
  }
}
