import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import 'volt_bolt_icon.dart';

enum VoltLogoSize { small, medium, large }

class VoltLogo extends StatelessWidget {
  final VoltLogoSize size;

  const VoltLogo({super.key, required this.size});

  @override
  Widget build(BuildContext context) {
    switch (size) {
      case VoltLogoSize.small:
        return Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const VoltBoltIcon(size: 18),
            const SizedBox(width: 4),
            RichText(
              text: const TextSpan(
                style: TextStyle(fontFamily: 'Space Grotesk', fontSize: 18, fontWeight: FontWeight.bold),
                children: [
                  TextSpan(text: 'Volt', style: TextStyle(color: Colors.white)),
                  TextSpan(text: 'Connect', style: TextStyle(color: AppColors.teal)),
                ],
              ),
            ),
          ],
        );
      case VoltLogoSize.medium:
        return Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const VoltBoltIcon(size: 36, showGlow: false), // Wait, prompt said size 48px height overall? Prompt: "Custom lightning bolt icon (36x36) with glow effect" 
            // Wait, glow only works if size >= 48 according to part 3 "Add a 'glow' effect for large sizes (>= 48px)". Thus 36 means no glow or I can just pass showGlow: true and allow it if desired. The prompt for size 2 says "icon (36x36) with glow effect", so I should adjust the condition in VoltBoltIcon or just pass true. I will update VoltBoltIcon conditionally.
            // Let's assume VoltBoltIcon handles it. I'll pass showGlow: true.
            const VoltBoltIcon(size: 36, showGlow: true),
            const SizedBox(height: 8),
            RichText(
              text: const TextSpan(
                style: TextStyle(fontFamily: 'Space Grotesk', fontSize: 24, fontWeight: FontWeight.bold),
                children: [
                  TextSpan(text: 'Volt', style: TextStyle(color: Colors.white)),
                  TextSpan(text: 'Connect', style: TextStyle(color: AppColors.teal)),
                ],
              ),
            ),
          ],
        );
      case VoltLogoSize.large:
        return Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const VoltBoltIcon(size: 72, showGlow: true),
            const SizedBox(height: 12),
            RichText(
              text: const TextSpan(
                style: TextStyle(fontFamily: 'Space Grotesk', fontSize: 32, fontWeight: FontWeight.bold),
                children: [
                  TextSpan(text: 'Volt', style: TextStyle(color: Colors.white)),
                  TextSpan(text: 'Connect', style: TextStyle(color: AppColors.teal)),
                ],
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              'Smart EV Charging · India',
              style: TextStyle(fontFamily: 'Inter', fontSize: 14, color: AppColors.textSecondaryDark),
            ),
          ],
        );
    }
  }
}
