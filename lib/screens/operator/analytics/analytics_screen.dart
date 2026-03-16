import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../../theme/app_colors.dart';
import '../../../widgets/operator_bottom_nav.dart';

class AnalyticsScreen extends StatefulWidget {
  const AnalyticsScreen({super.key});

  @override
  State<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends State<AnalyticsScreen> {
  String _activeFilter = 'This Week';
  final _filters = ['Today', 'This Week', 'This Month', 'All Time'];

  void _onNavTap(int index) {
    final routes = ['/operator/dashboard', '/operator/stations', '/operator/add-station', '/operator/analytics', '/operator/profile'];
    if (index != 3) context.go(routes[index]);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? AppColors.bgDark : AppColors.bgLight;
    final card = isDark ? AppColors.cardDark : AppColors.cardLight;
    final border = isDark ? AppColors.borderDark : AppColors.borderLight;
    final textPri = isDark ? Colors.white : AppColors.textPrimaryLight;
    final textSec = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    final chipBg = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
    return Scaffold(
      backgroundColor: bg,
      appBar: AppBar(
        backgroundColor: bg,
        elevation: 0,
        automaticallyImplyLeading: false,
        title: Text('Analytics', style: Theme.of(context).textTheme.titleMedium?.copyWith(color: textPri, fontWeight: FontWeight.bold)),
      ),
      bottomNavigationBar: OperatorBottomNav(currentIndex: 3, onTap: _onNavTap),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Filter Scroll
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: _filters.map((f) {
                  final active = _activeFilter == f;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ChoiceChip(
                      label: Text(f, style: TextStyle(color: active ? AppColors.bgDark : textPri, fontWeight: active ? FontWeight.bold : FontWeight.normal)),
                      selected: active,
                      onSelected: (val) => setState(() => _activeFilter = f),
                      selectedColor: AppColors.teal,
                      backgroundColor: chipBg,
                      side: BorderSide(color: active ? AppColors.teal : border),
                      showCheckmark: false,
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 24),

            // Summary Grid
            GridView.count(
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              childAspectRatio: 1.6,
              children: [
                _StatCard(label: 'Total Dispensed', value: '458 kWh', card: card, border: border, textPri: textPri, textSec: textSec),
                _StatCard(label: 'Avg Duration', value: '42 mins', card: card, border: border, textPri: textPri, textSec: textSec),
                _StatCard(label: 'Unique Drivers', value: '112', card: card, border: border, textPri: textPri, textSec: textSec),
                _StatCard(label: 'Avg Rev/Session', value: '₹340', card: card, border: border, textPri: textPri, textSec: textSec),
              ],
            ),
            const SizedBox(height: 32),

            // Line Chart: Daily Sessions
            _ChartContainer(
              title: 'Daily Sessions',
              card: card, border: border, textPri: textPri, textSec: textSec,
              child: LineChart(
                LineChartData(
                  minY: 0,
                  gridData: const FlGridData(show: false),
                  titlesData: FlTitlesData(
                    leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 22,
                        getTitlesWidget: (value, meta) {
                          const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                          if (value.toInt() < 0 || value.toInt() >= days.length) return const SizedBox();
                          return Text(days[value.toInt()], style: TextStyle(color: textSec, fontSize: 10));
                        },
                      ),
                    ),
                  ),
                  borderData: FlBorderData(show: false),
                  lineBarsData: [
                    LineChartBarData(
                      spots: const [FlSpot(0, 10), FlSpot(1, 15), FlSpot(2, 12), FlSpot(3, 25), FlSpot(4, 30), FlSpot(5, 45), FlSpot(6, 38)],
                      isCurved: true,
                      color: AppColors.teal,
                      barWidth: 3,
                      isStrokeCapRound: true,
                      dotData: const FlDotData(show: true),
                      belowBarData: BarAreaData(
                        show: true,
                        gradient: LinearGradient(
                          colors: [AppColors.teal.withValues(alpha: 0.3), AppColors.teal.withValues(alpha: 0.0)],
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Bar Chart: Revenue by Station
            _ChartContainer(
              title: 'Revenue by Station',
              card: card, border: border, textPri: textPri, textSec: textSec,
              child: BarChart(
                BarChartData(
                  gridData: const FlGridData(show: false),
                  titlesData: FlTitlesData(
                    leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        getTitlesWidget: (value, meta) {
                          const stds = ['A', 'B', 'C', 'D'];
                          if (value.toInt() >= stds.length) return const SizedBox();
                          return Text('S-${stds[value.toInt()]}', style: TextStyle(color: textSec, fontSize: 10));
                        },
                      ),
                    ),
                  ),
                  borderData: FlBorderData(show: false),
                  barGroups: [
                    BarChartGroupData(x: 0, barRods: [BarChartRodData(toY: 12000, color: AppColors.teal, width: 20, borderRadius: BorderRadius.circular(4))]),
                    BarChartGroupData(x: 1, barRods: [BarChartRodData(toY: 8500, color: AppColors.purple, width: 20, borderRadius: BorderRadius.circular(4))]),
                    BarChartGroupData(x: 2, barRods: [BarChartRodData(toY: 15400, color: AppColors.info, width: 20, borderRadius: BorderRadius.circular(4))]),
                    BarChartGroupData(x: 3, barRods: [BarChartRodData(toY: 6600, color: AppColors.warning, width: 20, borderRadius: BorderRadius.circular(4))]),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            
            // Pie Chart: Connector Usage
            Row(
              children: [
                Expanded(
                  child: _ChartContainer(
                    title: 'Connector Usage',
                    height: 180,
                    card: card, border: border, textPri: textPri, textSec: textSec,
                    child: PieChart(
                      PieChartData(
                        sectionsSpace: 2,
                        centerSpaceRadius: 30,
                        sections: [
                          PieChartSectionData(value: 45, color: AppColors.teal, showTitle: false, radius: 25),
                          PieChartSectionData(value: 30, color: AppColors.purple, showTitle: false, radius: 25),
                          PieChartSectionData(value: 15, color: AppColors.warning, showTitle: false, radius: 25),
                          PieChartSectionData(value: 10, color: AppColors.info, showTitle: false, radius: 25),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _legendItem('CCS2', AppColors.teal, '45%', textPri, textSec),
                    _legendItem('Type 2', AppColors.purple, '30%', textPri, textSec),
                    _legendItem('CHAdeMO', AppColors.warning, '15%', textPri, textSec),
                    _legendItem('Bharat', AppColors.info, '10%', textPri, textSec),
                  ],
                )
              ],
            ),
            
            const SizedBox(height: 32),
            
            // Bar Chart: Peak Usage Hours
            _ChartContainer(
              title: 'Peak Usage Hours',
              card: card, border: border, textPri: textPri, textSec: textSec,
              child: BarChart(
                BarChartData(
                  gridData: const FlGridData(show: false),
                  titlesData: FlTitlesData(
                    leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        getTitlesWidget: (value, meta) {
                          const times = ['8AM', '12PM', '4PM', '8PM'];
                          if (value.toInt() < 0 || value.toInt() >= times.length) return const SizedBox();
                          return Text(times[value.toInt()], style: TextStyle(color: textSec, fontSize: 10));
                        },
                      ),
                    ),
                  ),
                  borderData: FlBorderData(show: false),
                  barGroups: [
                    BarChartGroupData(x: 0, barRods: [BarChartRodData(toY: 30, color: AppColors.teal, width: 24, borderRadius: BorderRadius.circular(4))]),
                    BarChartGroupData(x: 1, barRods: [BarChartRodData(toY: 65, color: AppColors.teal, width: 24, borderRadius: BorderRadius.circular(4))]),
                    BarChartGroupData(x: 2, barRods: [BarChartRodData(toY: 90, color: AppColors.teal, width: 24, borderRadius: BorderRadius.circular(4))]),
                    BarChartGroupData(x: 3, barRods: [BarChartRodData(toY: 40, color: AppColors.teal, width: 24, borderRadius: BorderRadius.circular(4))]),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                icon: const Icon(Icons.download),
                label: const Text('Download CSV Report', style: TextStyle(fontWeight: FontWeight.bold)),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  foregroundColor: textPri,
                  side: const BorderSide(color: AppColors.teal),
                ),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Downloading report...'), backgroundColor: AppColors.teal));
                },
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _legendItem(String label, Color color, String percent, Color textPri, Color textSec) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Container(width: 12, height: 12, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
          const SizedBox(width: 8),
          Text(label, style: TextStyle(color: textPri, fontSize: 13)),
          const SizedBox(width: 8),
          Text(percent, style: TextStyle(color: textSec, fontSize: 12, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final Color card;
  final Color border;
  final Color textPri;
  final Color textSec;
  const _StatCard({required this.label, required this.value, required this.card, required this.border, required this.textPri, required this.textSec});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: card, borderRadius: BorderRadius.circular(12), border: Border.all(color: border)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(label, style: TextStyle(color: textSec, fontSize: 12)),
          const Spacer(),
          Text(value, style: TextStyle(color: textPri, fontSize: 20, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}

class _ChartContainer extends StatelessWidget {
  final String title;
  final Widget child;
  final double height;
  final Color card;
  final Color border;
  final Color textPri;
  final Color textSec;
  const _ChartContainer({required this.title, required this.child, this.height = 220, required this.card, required this.border, required this.textPri, required this.textSec});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: card, borderRadius: BorderRadius.circular(16), border: Border.all(color: border)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: TextStyle(color: textPri, fontWeight: FontWeight.bold)),
          const SizedBox(height: 24),
          SizedBox(height: height, child: child),
        ],
      ),
    );
  }
}
