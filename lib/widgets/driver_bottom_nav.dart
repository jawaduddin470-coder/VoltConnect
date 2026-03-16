import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import 'volt_bolt_icon.dart';

class DriverBottomNav extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;
  final VoidCallback onFabTap;

  const DriverBottomNav({
    super.key,
    required this.currentIndex,
    required this.onTap,
    required this.onFabTap,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 68,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          // Background bar
          Container(
            decoration: const BoxDecoration(
              color: AppColors.surfaceDark,
              border: Border(top: BorderSide(color: AppColors.borderDark, width: 0.5)),
            ),
            child: Row(
              children: [
                _NavItem(icon: Icons.map_outlined, label: 'Map', index: 0, currentIndex: currentIndex, onTap: onTap),
                _NavItem(icon: Icons.route_outlined, label: 'Trips', index: 1, currentIndex: currentIndex, onTap: onTap),
                // Space for FAB
                const Spacer(),
                _NavItem(icon: Icons.people_alt_outlined, label: 'Queue', index: 3, currentIndex: currentIndex, onTap: onTap),
                _NavItem(icon: Icons.electric_car_outlined, label: 'My EV', index: 4, currentIndex: currentIndex, onTap: onTap),
              ],
            ),
          ),
          // Floating Action Button centered
          Positioned(
            top: -18,
            left: 0,
            right: 0,
            child: Center(
              child: GestureDetector(
                onTap: onFabTap,
                child: Container(
                  width: 52,
                  height: 52,
                  decoration: BoxDecoration(
                    color: AppColors.teal,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.teal.withValues(alpha: 0.4),
                        blurRadius: 16,
                        spreadRadius: 2,
                      ),
                    ],
                  ),
                  child: const VoltBoltIcon(size: 28, showGlow: true, color: Colors.white),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final int index;
  final int currentIndex;
  final ValueChanged<int> onTap;

  const _NavItem({
    required this.icon,
    required this.label,
    required this.index,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isActive = currentIndex == index;
    return Expanded(
      child: InkWell(
        onTap: () => onTap(index),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: isActive ? AppColors.teal : AppColors.textSecondaryDark, size: 22),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontFamily: 'Inter',
                fontSize: 10,
                color: isActive ? AppColors.teal : AppColors.textSecondaryDark,
                fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
