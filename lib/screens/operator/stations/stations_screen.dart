import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../theme/app_colors.dart';
import '../../../widgets/operator_bottom_nav.dart';

class StationsScreen extends StatefulWidget {
  const StationsScreen({super.key});

  @override
  State<StationsScreen> createState() => _StationsScreenState();
}

class _StationsScreenState extends State<StationsScreen> {
  final _searchController = TextEditingController();

  void _onNavTap(int index) {
    final routes = ['/operator/dashboard', '/operator/stations', '/operator/add-station', '/operator/analytics', '/operator/profile'];
    if (index != 1) context.go(routes[index]);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg       = isDark ? AppColors.bgDark       : AppColors.bgLight;
    final card     = isDark ? AppColors.cardDark      : AppColors.cardLight;
    final border   = isDark ? AppColors.borderDark    : AppColors.borderLight;
    final textPri  = isDark ? Colors.white            : AppColors.textPrimaryLight;
    final textSec  = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    final inputBg  = isDark ? AppColors.cardDark      : AppColors.surfaceLight;
    final popupBg  = isDark ? AppColors.surfaceDark   : AppColors.cardLight;
    final popupText = isDark ? Colors.white           : AppColors.textPrimaryLight;

    return Scaffold(
      backgroundColor: bg,
      appBar: AppBar(
        backgroundColor: bg,
        elevation: 0,
        automaticallyImplyLeading: false,
        title: Text('My Stations', style: Theme.of(context).textTheme.titleMedium?.copyWith(
          color: textPri, fontWeight: FontWeight.bold,
        )),
      ),
      bottomNavigationBar: OperatorBottomNav(currentIndex: 1, onTap: _onNavTap),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppColors.teal,
        foregroundColor: AppColors.bgDark,
        child: const Icon(Icons.add),
        onPressed: () => context.go('/operator/add-station'),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              style: TextStyle(color: textPri),
              decoration: InputDecoration(
                hintText: 'Search stations...',
                hintStyle: TextStyle(color: textSec),
                prefixIcon: Icon(Icons.search, color: textSec),
                filled: true,
                fillColor: inputBg,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                contentPadding: const EdgeInsets.symmetric(vertical: 0),
              ),
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: 4,
              itemBuilder: (context, index) {
                final isActive = index != 3;
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: card,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: border),
                  ),
                  child: Column(
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Volt Station ${index + 1}', style: TextStyle(color: textPri, fontSize: 16, fontWeight: FontWeight.bold)),
                                const SizedBox(height: 4),
                                Text('Hyderabad, TS', style: TextStyle(color: textSec, fontSize: 13)),
                                const SizedBox(height: 8),
                                Wrap(
                                  spacing: 6,
                                  runSpacing: 4,
                                  children: [
                                    _buildChip('CCS2'),
                                    _buildChip('Type 2'),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: (isActive ? AppColors.success : AppColors.error).withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  isActive ? 'Active' : 'Offline',
                                  style: TextStyle(color: isActive ? AppColors.success : AppColors.error, fontSize: 11, fontWeight: FontWeight.bold),
                                ),
                              ),
                              PopupMenuButton<String>(
                                icon: Icon(Icons.more_vert, color: textSec),
                                color: popupBg,
                                onSelected: (val) {
                                  if (val == 'delete') _showDeleteConfirm(isDark, card, textPri, textSec);
                                },
                                itemBuilder: (context) => [
                                  PopupMenuItem(value: 'edit', child: Text('Edit Station', style: TextStyle(color: popupText))),
                                  PopupMenuItem(value: 'toggle', child: Text(isActive ? 'Set Offline' : 'Set Active', style: TextStyle(color: popupText))),
                                  const PopupMenuItem(value: 'delete', child: Text('Delete', style: TextStyle(color: AppColors.error))),
                                ],
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Divider(color: border, height: 1),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          _buildStatColumn('${12 - index} sessions', 'Today', textPri, textSec),
                          _buildStatColumn('${index == 0 ? 2 : 0} waiting', 'In Queue', textPri, textSec, highlight: index == 0),
                          _buildStatColumn('10 mins ago', 'Last Active', textPri, textSec),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChip(String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(color: AppColors.teal.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(4)),
      child: Text(label, style: const TextStyle(color: AppColors.teal, fontSize: 10)),
    );
  }

  Widget _buildStatColumn(String val, String label, Color textPri, Color textSec, {bool highlight = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(val, style: TextStyle(color: highlight ? AppColors.warning : textPri, fontWeight: FontWeight.w600, fontSize: 13)),
        const SizedBox(height: 2),
        Text(label, style: TextStyle(color: textSec, fontSize: 11)),
      ],
    );
  }

  void _showDeleteConfirm(bool isDark, Color card, Color textPri, Color textSec) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: card,
        title: Text('Delete Station?', style: TextStyle(color: textPri)),
        content: Text('This action cannot be undone. All session history will be lost.', style: TextStyle(color: textSec)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: Text('Cancel', style: TextStyle(color: textPri))),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error, foregroundColor: Colors.white),
            onPressed: () => Navigator.pop(context),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }
}
