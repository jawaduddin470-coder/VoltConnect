import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../../theme/app_colors.dart';
import '../../../widgets/operator_bottom_nav.dart';

class AddStationScreen extends StatefulWidget {
  const AddStationScreen({super.key});

  @override
  State<AddStationScreen> createState() => _AddStationScreenState();
}

class _AddStationScreenState extends State<AddStationScreen> {
  final _pageController = PageController();
  int _currentStep = 0;
  bool _isSaving = false;

  // Step 1: Location
  final _formKey1 = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _addressCtrl = TextEditingController();
  final _pincodeCtrl = TextEditingController();
  final _landmarkCtrl = TextEditingController();
  String? _selectedCity;
  String? _selectedState;

  final _cities = [
    'Hyderabad', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur',
    'Surat', 'Visakhapatnam', 'Kochi', 'Chandigarh', 'Bhopal', 'Indore', 'Nagpur', 'Coimbatore', 'Mysore', 'Vadodara', 'Lucknow'
  ];
  final _states = ['Telangana', 'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Gujarat', 'Rajasthan', 'Kerala', 'Punjab', 'Madhya Pradesh', 'Uttar Pradesh'];

  // Step 2: Equipment
  int _chargingPoints = 1;
  final Map<String, bool> _connectors = {
    'CCS2': false, 'Type 2 AC': false, 'CHAdeMO': false, 'Bharat AC-001': false, 'Bharat DC-001': false
  };
  final Map<String, String> _connectorPower = {};
  final List<String> _amenities = ['WiFi', 'Parking', 'Restroom', 'Café', 'Shopping', 'CCTV', 'EV Lounge'];
  final Set<String> _selectedAmenities = {};

  final Map<String, List<String>> _powerOptions = {
    'CCS2': ['50kW', '100kW', '150kW', '200kW'],
    'Type 2 AC': ['7.4kW', '11kW', '22kW'],
    'CHAdeMO': ['50kW', '100kW'],
  };

  // Step 3: Pricing
  final _formKey3 = GlobalKey<FormState>();
  String _pricingModel = 'Per kWh';
  final _priceCtrl = TextEditingController();
  bool _gstIncluded = true;
  bool _is24h = true;
  TimeOfDay _openTime = const TimeOfDay(hour: 6, minute: 0);
  TimeOfDay _closeTime = const TimeOfDay(hour: 22, minute: 0);

  void _onNavTap(int index) {
    if (_isSaving) return;
    final routes = ['/operator/dashboard', '/operator/stations', '/operator/add-station', '/operator/analytics', '/operator/profile'];
    if (index != 2) context.go(routes[index]);
  }

  void _nextStep() {
    if (_currentStep == 0) {
      if (!_formKey1.currentState!.validate()) return;
    } else if (_currentStep == 1) {
      if (!_connectors.values.any((v) => v)) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Select at least one connector type.'), backgroundColor: AppColors.error));
        return;
      }
    }
    _pageController.nextPage(duration: const Duration(milliseconds: 300), curve: Curves.easeInOut);
  }

  void _prevStep() {
    _pageController.previousPage(duration: const Duration(milliseconds: 300), curve: Curves.easeInOut);
  }

  Future<void> _submitStation() async {
    if (!_formKey3.currentState!.validate()) return;
    
    setState(() => _isSaving = true);
    
    try {
      final user = FirebaseAuth.instance.currentUser;
      if (user == null) throw Exception('Not logged in');

      final activeConnectors = _connectors.entries
          .where((e) => e.value)
          .map((e) => {
                'type': e.key,
                'power': _connectorPower[e.key] ?? (e.key.contains('AC') ? '3.3kW' : '15kW')
              })
          .toList();

      await FirebaseFirestore.instance.collection('stations').add({
        'operatorId': user.uid,
        'name': _nameCtrl.text,
        'address': _addressCtrl.text,
        'city': _selectedCity,
        'state': _selectedState,
        'pincode': _pincodeCtrl.text,
        'landmark': _landmarkCtrl.text,
        'connectors': activeConnectors,
        'chargingPoints': _chargingPoints,
        'amenities': _selectedAmenities.toList(),
        'pricing': {
          'model': _pricingModel,
          'price': double.tryParse(_priceCtrl.text) ?? 0,
          'gstIncluded': _gstIncluded,
        },
        'hours': {
          'always24h': _is24h,
          'openTime': _is24h ? null : '${_openTime.hour}:${_openTime.minute.toString().padLeft(2, '0')}',
          'closeTime': _is24h ? null : '${_closeTime.hour}:${_closeTime.minute.toString().padLeft(2, '0')}',
        },
        'status': 'active',
        'createdAt': FieldValue.serverTimestamp(),
        'sessions': 0,
        'rating': 0.0,
      });

      if (!mounted) return;
      
      // Success animation overlay
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (_) => const Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.check_circle, color: AppColors.success, size: 80),
              SizedBox(height: 16),
              Text('Station Added Successfully!', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold, decoration: TextDecoration.none)),
            ],
          ),
        ),
      );
      
      await Future.delayed(const Duration(seconds: 2));
      if (mounted) context.go('/operator/stations');
      
    } catch (e) {
      if (!mounted) return;
      setState(() => _isSaving = false);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e'), backgroundColor: AppColors.error));
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? AppColors.bgDark : AppColors.bgLight;
    final textPri = isDark ? Colors.white : AppColors.textPrimaryLight;

    return Scaffold(
      backgroundColor: bg,
      appBar: AppBar(
        backgroundColor: bg,
        elevation: 0,
        automaticallyImplyLeading: false,
        title: Text('Add Station', style: Theme.of(context).textTheme.titleMedium?.copyWith(color: textPri, fontWeight: FontWeight.bold)),
      ),
      bottomNavigationBar: OperatorBottomNav(currentIndex: 2, onTap: _onNavTap),
      body: Column(
        children: [
          _buildStepIndicator(),
          Expanded(
            child: PageView(
              controller: _pageController,
              physics: const NeverScrollableScrollPhysics(),
              onPageChanged: (i) => setState(() => _currentStep = i),
              children: [
                _buildStep1(),
                _buildStep2(),
                _buildStep3(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStepIndicator() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 40),
      child: Row(
        children: [
          _buildStepDot(0, 'Location'),
          _buildStepLine(0),
          _buildStepDot(1, 'Equipment'),
          _buildStepLine(1),
          _buildStepDot(2, 'Pricing'),
        ],
      ),
    );
  }

  Widget _buildStepDot(int step, String label) {
    final isActive = _currentStep == step;
    final isCompleted = _currentStep > step;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final surface = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final border = isDark ? AppColors.borderDark : AppColors.borderLight;
    final textSec = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    final bg = isDark ? AppColors.bgDark : AppColors.bgLight;
    final textPri = isDark ? Colors.white : AppColors.textPrimaryLight;

    return Column(
      children: [
        Container(
          width: 28, height: 28,
          decoration: BoxDecoration(
            color: isCompleted || isActive ? AppColors.teal : surface,
            shape: BoxShape.circle,
            border: isCompleted || isActive ? null : Border.all(color: border),
          ),
          alignment: Alignment.center,
          child: isCompleted
              ? Icon(Icons.check, size: 16, color: bg)
              : Text('${step + 1}', style: TextStyle(color: isActive ? bg : textSec, fontWeight: FontWeight.bold, fontSize: 12)),
        ),
        const SizedBox(height: 8),
        Text(label, style: TextStyle(color: isActive || isCompleted ? textPri : textSec, fontSize: 10, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildStepLine(int sourceStep) {
    final isCompleted = _currentStep > sourceStep;
    return Expanded(
      child: Container(
        height: 2,
        margin: const EdgeInsets.only(bottom: 24, left: 8, right: 8),
        color: isCompleted ? AppColors.teal : AppColors.borderDark,
      ),
    );
  }

  Widget _buildStep1() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textPri = isDark ? Colors.white : AppColors.textPrimaryLight;
    final bg = isDark ? AppColors.bgDark : AppColors.bgLight;

    return Form(
      key: _formKey1,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Station Details', style: TextStyle(color: textPri, fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 24),
            _inputField('Station Name*', _nameCtrl, 'e.g. VoltCharge Hub Gachibowli'),
            const SizedBox(height: 16),
            _inputField('Full Address*', _addressCtrl, 'Enter complete address...', maxLines: 3),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(child: _dropdownField('City*', _cities, _selectedCity, (v) => setState(() => _selectedCity = v))),
                const SizedBox(width: 16),
                Expanded(child: _dropdownField('State*', _states, _selectedState, (v) => setState(() => _selectedState = v))),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(child: _inputField('Pincode*', _pincodeCtrl, 'e.g. 500032', isNumber: true, maxLength: 6)),
                const SizedBox(width: 16),
                Expanded(child: _inputField('Landmark (Optional)', _landmarkCtrl, 'Near Apollo Hosp')),
              ],
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.teal, foregroundColor: bg, padding: const EdgeInsets.symmetric(vertical: 16)),
                onPressed: _nextStep,
                child: const Text('Next Step →', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStep2() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textPri = isDark ? Colors.white : AppColors.textPrimaryLight;
    final textSec = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    final surface = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final border = isDark ? AppColors.borderDark : AppColors.borderLight;
    final card = isDark ? AppColors.cardDark : AppColors.cardLight;
    final bg = isDark ? AppColors.bgDark : AppColors.bgLight;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Charging Equipment', style: TextStyle(color: textPri, fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 24),
          
          // Charging Points Counter
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Number of Charging Points', style: TextStyle(color: textPri)),
              Container(
                decoration: BoxDecoration(color: surface, borderRadius: BorderRadius.circular(12), border: Border.all(color: border)),
                child: Row(
                  children: [
                    IconButton(icon: Icon(Icons.remove, color: textPri, size: 20), onPressed: () => setState(() => _chargingPoints = (_chargingPoints > 1) ? _chargingPoints - 1 : 1)),
                    Text('$_chargingPoints', style: const TextStyle(color: AppColors.teal, fontSize: 18, fontWeight: FontWeight.bold)),
                    IconButton(icon: Icon(Icons.add, color: textPri, size: 20), onPressed: () => setState(() => _chargingPoints = (_chargingPoints < 20) ? _chargingPoints + 1 : 20)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Text('Available Connectors*', style: TextStyle(color: textSec, fontSize: 13, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          ..._connectors.keys.map((cType) {
            return Container(
              margin: const EdgeInsets.only(bottom: 8),
              decoration: BoxDecoration(color: card, borderRadius: BorderRadius.circular(12), border: Border.all(color: _connectors[cType]! ? AppColors.teal : border)),
              child: Column(
                children: [
                  CheckboxListTile(
                    title: Text(cType, style: TextStyle(color: textPri)),
                    activeColor: AppColors.teal,
                    checkColor: bg,
                    value: _connectors[cType],
                    onChanged: (val) {
                      setState(() {
                        _connectors[cType] = val!;
                        if (val && _powerOptions.containsKey(cType)) {
                          _connectorPower[cType] = _powerOptions[cType]!.first;
                        } else if (!val) {
                          _connectorPower.remove(cType);
                        }
                      });
                    },
                  ),
                  if (_connectors[cType]! && _powerOptions.containsKey(cType))
                    Padding(
                      padding: const EdgeInsets.only(left: 16, right: 16, bottom: 16),
                      child: Row(
                        children: [
                          Text('Power Output:', style: TextStyle(color: textSec, fontSize: 12)),
                          const SizedBox(width: 16),
                          Expanded(
                            child: DropdownButton<String>(
                              value: _connectorPower[cType],
                              isExpanded: true,
                              dropdownColor: surface,
                              style: TextStyle(color: textPri),
                              items: _powerOptions[cType]!.map((p) => DropdownMenuItem(value: p, child: Text(p))).toList(),
                              onChanged: (v) => setState(() => _connectorPower[cType] = v!),
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            );
          }),
          
          const SizedBox(height: 24),
          Text('Amenities', style: TextStyle(color: textSec, fontSize: 13, fontWeight: FontWeight.w600)),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8, runSpacing: 8,
            children: _amenities.map((a) {
              final isSel = _selectedAmenities.contains(a);
              return FilterChip(
                label: Text(a),
                selected: isSel,
                onSelected: (val) => setState(() => val ? _selectedAmenities.add(a) : _selectedAmenities.remove(a)),
                selectedColor: AppColors.teal.withValues(alpha: 0.2),
                checkmarkColor: AppColors.teal,
                labelStyle: TextStyle(color: isSel ? AppColors.teal : textPri),
                backgroundColor: card,
                side: BorderSide(color: isSel ? AppColors.teal : border),
              );
            }).toList(),
          ),
          
          const SizedBox(height: 32),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16), foregroundColor: textPri, side: BorderSide(color: border)),
                  onPressed: _prevStep,
                  child: const Text('Back'),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                flex: 2,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(backgroundColor: AppColors.teal, foregroundColor: bg, padding: const EdgeInsets.symmetric(vertical: 16)),
                  onPressed: _nextStep,
                  child: const Text('Next Step →', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStep3() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textPri = isDark ? Colors.white : AppColors.textPrimaryLight;
    final textSec = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    final surface = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final border = isDark ? AppColors.borderDark : AppColors.borderLight;
    final bg = isDark ? AppColors.bgDark : AppColors.bgLight;

    return Form(
      key: _formKey3,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Pricing & Hours', style: TextStyle(color: textPri, fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 24),
            
            SegmentedButton<String>(
              segments: const [
                ButtonSegment(value: 'Per kWh', label: Text('Per kWh')),
                ButtonSegment(value: 'Per Hour', label: Text('Per Hour')),
                ButtonSegment(value: 'Per Session', label: Text('Per Session')),
              ],
              selected: {_pricingModel},
              onSelectionChanged: (val) => setState(() => _pricingModel = val.first),
              style: ButtonStyle(
                backgroundColor: WidgetStateProperty.resolveWith<Color>((states) => states.contains(WidgetState.selected) ? AppColors.teal : surface),
                foregroundColor: WidgetStateProperty.resolveWith<Color>((states) => states.contains(WidgetState.selected) ? AppColors.bgDark : textPri),
              ),
            ),
            const SizedBox(height: 24),
            
            _inputField('Price*', _priceCtrl, '0.00', isNumber: true, prefixText: '₹ '),
            const SizedBox(height: 12),
            
            SwitchListTile(
              title: Text('GST included (18%)', style: TextStyle(color: textPri)),
              subtitle: Text(_gstIncluded ? 'Price is final' : 'Price shown excludes 18% GST', style: TextStyle(color: textSec, fontSize: 12)),
              value: _gstIncluded,
              activeTrackColor: AppColors.teal.withValues(alpha: 0.5),
              activeThumbColor: AppColors.teal,
              onChanged: (val) => setState(() => _gstIncluded = val),
              contentPadding: EdgeInsets.zero,
            ),
            
            Divider(color: border, height: 32),
            
            SwitchListTile(
              title: Text('Open 24/7', style: TextStyle(color: textPri)),
              value: _is24h,
              activeTrackColor: AppColors.teal.withValues(alpha: 0.5),
              activeThumbColor: AppColors.teal,
              onChanged: (val) => setState(() => _is24h = val),
              contentPadding: EdgeInsets.zero,
            ),
            
            if (!_is24h) ...[
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: InkWell(
                      onTap: () async {
                        final t = await showTimePicker(context: context, initialTime: _openTime);
                        if (t != null) setState(() => _openTime = t);
                      },
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(color: surface, borderRadius: BorderRadius.circular(10), border: Border.all(color: border)),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Opening Time', style: TextStyle(color: textSec, fontSize: 12)),
                            const SizedBox(height: 4),
                            Text(_openTime.format(context), style: TextStyle(color: textPri, fontSize: 16)),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: InkWell(
                      onTap: () async {
                        final t = await showTimePicker(context: context, initialTime: _closeTime);
                        if (t != null) setState(() => _closeTime = t);
                      },
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(color: surface, borderRadius: BorderRadius.circular(10), border: Border.all(color: border)),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Closing Time', style: TextStyle(color: textSec, fontSize: 12)),
                            const SizedBox(height: 4),
                            Text(_closeTime.format(context), style: TextStyle(color: textPri, fontSize: 16)),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
            
            const SizedBox(height: 40),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16), foregroundColor: textPri, side: BorderSide(color: border)),
                    onPressed: _prevStep,
                    child: const Text('Back'),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  flex: 2,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(backgroundColor: AppColors.teal, foregroundColor: bg, padding: const EdgeInsets.symmetric(vertical: 16)),
                    onPressed: _isSaving ? null : _submitStation,
                    child: _isSaving
                      ? SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: bg))
                      : const Text('Submit Station', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _inputField(String label, TextEditingController ctrl, String hint, {bool isNumber = false, int? maxLength, String? prefixText, int maxLines = 1}) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textPri = isDark ? Colors.white : AppColors.textPrimaryLight;
    final textSec = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    final surface = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;

    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label, style: TextStyle(color: textSec, fontSize: 13, fontWeight: FontWeight.w600)),
      const SizedBox(height: 8),
      TextFormField(
        controller: ctrl,
        keyboardType: isNumber ? TextInputType.number : TextInputType.text,
        maxLength: maxLength,
        maxLines: maxLines,
        style: TextStyle(color: textPri),
        validator: (v) => v == null || v.isEmpty ? 'Required' : null,
        decoration: InputDecoration(
          hintText: hint,
          counterText: '',
          prefixText: prefixText,
          prefixStyle: TextStyle(color: textPri, fontSize: 16),
          hintStyle: TextStyle(color: textSec),
          filled: true, fillColor: surface,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.teal)),
          errorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.error)),
          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        ),
      ),
    ]);
  }

  Widget _dropdownField(String label, List<String> items, String? val, ValueChanged<String?> onChanged) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textPri = isDark ? Colors.white : AppColors.textPrimaryLight;
    final textSec = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    final surface = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final card = isDark ? AppColors.cardDark : AppColors.cardLight;

    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label, style: TextStyle(color: textSec, fontSize: 13, fontWeight: FontWeight.w600)),
      const SizedBox(height: 8),
      DropdownButtonFormField<String>(
        initialValue: val,
        dropdownColor: card,
        style: TextStyle(color: textPri),
        items: items.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
        onChanged: onChanged,
        validator: (v) => v == null ? 'Required' : null,
        decoration: InputDecoration(
          filled: true, fillColor: surface,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.teal)),
          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        ),
      ),
    ]);
  }
}
