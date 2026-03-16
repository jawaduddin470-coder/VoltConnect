import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../main.dart';

class ThemeToggle extends StatelessWidget {
  const ThemeToggle({super.key});

  @override
  Widget build(BuildContext context) {
    final themeProvider = context.watch<ThemeProvider>();
    final isDark = themeProvider.isDark;

    return GestureDetector(
      onTap: () => themeProvider.toggleTheme(),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
        width: 56,
        height: 28,
        padding: const EdgeInsets.symmetric(horizontal: 4),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1A1A24) : const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isDark ? const Color(0xFF2A2A3A) : const Color(0xFFCBD5E1),
          ),
        ),
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Moon icon on left
            Positioned(
              left: 0,
              child: AnimatedOpacity(
                duration: const Duration(milliseconds: 300),
                opacity: isDark ? 1.0 : 0.4,
                child: Icon(
                  Icons.dark_mode_outlined,
                  size: 14,
                  color: isDark ? const Color(0xFF00D4AA) : const Color(0xFF94A3B8),
                ),
              ),
            ),
            // Sun icon on right
            Positioned(
              right: 0,
              child: AnimatedOpacity(
                duration: const Duration(milliseconds: 300),
                opacity: isDark ? 0.4 : 1.0,
                child: Icon(
                  Icons.light_mode_outlined,
                  size: 14,
                  color: isDark ? const Color(0xFF94A3B8) : const Color(0xFFF59E0B),
                ),
              ),
            ),
            // Sliding circle
            AnimatedAlign(
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeInOut,
              alignment: isDark ? Alignment.centerLeft : Alignment.centerRight,
              child: Container(
                width: 20,
                height: 20,
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF00D4AA) : const Color(0xFFF59E0B),
                  shape: BoxShape.circle,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
