import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../../theme/app_colors.dart';
import '../../../widgets/operator_bottom_nav.dart';
import '../../../widgets/theme_toggle.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  void _onNavTap(int index) {
    final routes = ['/operator/dashboard', '/operator/stations', '/operator/add-station', '/operator/analytics', '/operator/profile'];
    if (index != 0) context.go(routes[index]);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? AppColors.bgDark : AppColors.bgLight;
    return Scaffold(
      backgroundColor: bg,
      bottomNavigationBar: OperatorBottomNav(currentIndex: 0, onTap: _onNavTap),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Bar
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Operator Dashboard', style: TextStyle(
                        fontFamily: 'SpaceGrotesk', fontSize: 22, fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white : AppColors.textPrimaryLight,
                      )),
                      const SizedBox(height: 2),
                      Text("Welcome back. Here's how your stations are performing today.",
                        style: TextStyle(fontSize: 13,
                          color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight)),
                    ],
                  ),
                  Row(
                    children: [
                      const ThemeToggle(),
                      const SizedBox(width: 8),
                      GestureDetector(
                        onTap: () => context.go('/hub'),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          margin: const EdgeInsets.only(right: 8),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Row(
                            children: [
                              Icon(Icons.arrow_back_ios_new, size: 14, color: Colors.white70),
                              SizedBox(width: 6),
                              Text('Hub', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white70)),
                            ],
                          ),
                        ),
                      ),
                      GestureDetector(
                        onTap: () => context.go('/operator/add-station'),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            color: AppColors.teal,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Row(
                            children: [
                              Icon(Icons.add, size: 16, color: Colors.black),
                              SizedBox(width: 4),
                              Text('Add Station', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black)),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Compact Stats Row
              _buildStatsRow(isDark),
              const SizedBox(height: 24),

              // Main content — two columns on tablet+, stacked on mobile
              LayoutBuilder(
                builder: (context, constraints) {
                  if (constraints.maxWidth > 640) {
                    return Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(flex: 55, child: _buildStationsList(isDark, context)),
                        const SizedBox(width: 16),
                        Expanded(flex: 45, child: _buildQuickActions(isDark, context)),
                      ],
                    );
                  }
                  return Column(children: [
                    _buildStationsList(isDark, context),
                    const SizedBox(height: 16),
                    _buildQuickActions(isDark, context),
                  ]);
                },
              ),
              const SizedBox(height: 24),

              // Recent Sessions
              _buildRecentSessions(isDark),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatsRow(bool isDark) {
    final stats = [
      _StatData('4', 'Total Stations', Icons.bolt, AppColors.teal),
      _StatData('2', 'Active Queue', Icons.timer_outlined, AppColors.warning),
      _StatData('78%', 'Utilization', Icons.trending_up, AppColors.success),
      _StatData('0', 'Faults Reported', Icons.warning_amber_outlined, AppColors.error),
    ];
    return LayoutBuilder(
      builder: (context, constraints) {
        final isNarrow = constraints.maxWidth < 480;
        return GridView.count(
          crossAxisCount: isNarrow ? 2 : 4,
          childAspectRatio: isNarrow ? 1.6 : 1.5,
          crossAxisSpacing: 10,
          mainAxisSpacing: 10,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          children: stats.map((s) => _buildStatCard(s, isDark)).toList(),
        );
      },
    );
  }

  Widget _buildStatCard(_StatData s, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : AppColors.cardLight,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Icon(s.icon, size: 24, color: s.color),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(s.value, style: TextStyle(
                fontFamily: 'SpaceGrotesk', fontSize: 26, fontWeight: FontWeight.bold, color: s.color,
              )),
              Text(s.label, style: TextStyle(fontSize: 11,
                color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
              )),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStationsList(bool isDark, BuildContext context) {
    final stations = [
      _StationRow('Tata Power EV Hub', 'Jubilee Hills', '50 kW', 'AVAILABLE', AppColors.success),
      _StationRow('Ather Grid Station', 'Hitech City', '7.4 kW', 'AVAILABLE', AppColors.success),
      _StationRow('Zeon Charging Hub', 'Gachibowli', '50 kW', 'BUSY', AppColors.warning),
      _StationRow('BPCL Fast Charger', 'Banjara Hills', '150 kW', 'AVAILABLE', AppColors.success),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Your Stations', style: TextStyle(
              fontFamily: 'SpaceGrotesk', fontSize: 16, fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : AppColors.textPrimaryLight,
            )),
            GestureDetector(
              onTap: () => context.go('/operator/stations'),
              child: const Text('View All →', style: TextStyle(color: AppColors.teal, fontSize: 13)),
            ),
          ],
        ),
        const SizedBox(height: 12),
        ...stations.map((s) => Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            color: isDark ? AppColors.cardDark : AppColors.cardLight,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight),
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(s.name, style: TextStyle(
                      fontWeight: FontWeight.w600, fontSize: 13,
                      color: isDark ? Colors.white : AppColors.textPrimaryLight,
                    )),
                    const SizedBox(height: 2),
                    Row(children: [
                      Text(s.area, style: TextStyle(fontSize: 11,
                        color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight)),
                      const SizedBox(width: 4),
                      const Icon(Icons.bolt, size: 11, color: AppColors.warning),
                      Text(s.power, style: TextStyle(fontSize: 11,
                        color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight)),
                    ]),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: s.statusColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(s.status, style: TextStyle(
                  fontSize: 10, fontWeight: FontWeight.bold, color: s.statusColor,
                )),
              ),
            ],
          ),
        )),
      ],
    );
  }

  Widget _buildQuickActions(bool isDark, BuildContext context) {
    final actions = [
      _ActionData(Icons.trending_up, 'View Analytics', AppColors.teal, '/operator/analytics'),
      _ActionData(Icons.timer_outlined, 'Manage Queue', AppColors.warning, '/operator/dashboard'),
      _ActionData(Icons.warning_amber_outlined, 'Resolve Faults', AppColors.error, '/operator/dashboard'),
      _ActionData(Icons.settings_outlined, 'Settings', AppColors.textSecondaryDark, '/operator/profile'),
    ];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Quick Actions', style: TextStyle(
          fontFamily: 'SpaceGrotesk', fontSize: 16, fontWeight: FontWeight.bold,
          color: isDark ? Colors.white : AppColors.textPrimaryLight,
        )),
        const SizedBox(height: 12),
        GridView.count(
          crossAxisCount: 2,
          childAspectRatio: 1.6,
          crossAxisSpacing: 8,
          mainAxisSpacing: 8,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          children: actions.map((a) => _ActionCard(action: a, isDark: isDark, onTap: () => context.go(a.route))).toList(),
        ),
      ],
    );
  }

  Widget _buildRecentSessions(bool isDark) {
    final sessions = [
      ('Tata Power EV Hub', 'Driver A', '45 min', '18.2 kWh', '₹210', '3 min ago'),
      ('Ather Grid Station', 'Driver B', '1h 10m', '9.8 kWh', '₹115', '28 min ago'),
      ('BPCL Fast Charger', 'Driver C', '20 min', '48.5 kWh', '₹580', '1h ago'),
      ('Zeon Charging Hub', 'Driver D', '55 min', '22.1 kWh', '₹260', '2h ago'),
      ('MG Charge Station', 'Driver E', '35 min', '15.6 kWh', '₹190', '3h ago'),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(children: [
          Text('Recent Sessions', style: TextStyle(
            fontFamily: 'SpaceGrotesk', fontSize: 16, fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : AppColors.textPrimaryLight,
          )),
          const SizedBox(width: 8),
          Container(width: 8, height: 8, decoration: const BoxDecoration(color: AppColors.success, shape: BoxShape.circle)),
        ]),
        const SizedBox(height: 12),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: DataTable(
            headingRowColor: WidgetStateProperty.all(
              isDark ? AppColors.surfaceDark : AppColors.cardLight
            ),
            dataRowColor: WidgetStateProperty.resolveWith((states) {
              return isDark ? AppColors.cardDark : AppColors.surfaceLight;
            }),
            border: TableBorder.all(
              color: isDark ? AppColors.borderDark : AppColors.borderLight,
              borderRadius: BorderRadius.circular(12),
            ),
            columns: ['Station', 'Driver', 'Duration', 'kWh', 'Amount', 'Time']
                .map((h) => DataColumn(label: Text(h, style: TextStyle(
                  fontWeight: FontWeight.bold, fontSize: 12,
                  color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                ))))
                .toList(),
            rows: sessions.map((s) => DataRow(
              cells: [
                DataCell(Text(s.$1, style: TextStyle(
                  fontSize: 12, color: isDark ? Colors.white : AppColors.textPrimaryLight))),
                DataCell(Text(s.$2, style: TextStyle(
                  fontSize: 12, color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight))),
                DataCell(Text(s.$3, style: TextStyle(
                  fontSize: 12, color: isDark ? Colors.white : AppColors.textPrimaryLight))),
                DataCell(Text(s.$4, style: TextStyle(
                  fontSize: 12, color: isDark ? Colors.white : AppColors.textPrimaryLight))),
                DataCell(Text(s.$5, style: const TextStyle(fontSize: 12, color: AppColors.success, fontWeight: FontWeight.w600))),
                DataCell(Text(s.$6, style: TextStyle(
                  fontSize: 12, color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight))),
              ],
            )).toList(),
          ),
        ),
      ],
    );
  }
}

// ── Data models ────────────────────────────────────────────────────────────────
class _StatData {
  final String value, label;
  final IconData icon;
  final Color color;
  const _StatData(this.value, this.label, this.icon, this.color);
}

class _StationRow {
  final String name, area, power, status;
  final Color statusColor;
  const _StationRow(this.name, this.area, this.power, this.status, this.statusColor);
}

class _ActionData {
  final IconData icon;
  final String label, route;
  final Color color;
  const _ActionData(this.icon, this.label, this.color, this.route);
}

// ── Action Card ────────────────────────────────────────────────────────────────
class _ActionCard extends StatefulWidget {
  final _ActionData action;
  final bool isDark;
  final VoidCallback onTap;
  const _ActionCard({required this.action, required this.isDark, required this.onTap});

  @override
  State<_ActionCard> createState() => _ActionCardState();
}

class _ActionCardState extends State<_ActionCard> {
  bool _hovered = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _hovered = true),
      onExit: (_) => setState(() => _hovered = false),
      child: GestureDetector(
        onTap: widget.onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: widget.isDark ? AppColors.cardDark : AppColors.cardLight,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: _hovered ? AppColors.teal : (widget.isDark ? AppColors.borderDark : AppColors.borderLight),
            ),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(widget.action.icon, size: 22, color: widget.action.color),
              const SizedBox(height: 8),
              Text(widget.action.label, style: TextStyle(
                fontSize: 12, fontWeight: FontWeight.w600,
                color: widget.isDark ? Colors.white : AppColors.textPrimaryLight,
              )),
            ],
          ),
        ),
      ),
    );
  }
}
