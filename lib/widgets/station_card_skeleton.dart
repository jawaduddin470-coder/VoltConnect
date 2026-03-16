import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../theme/app_colors.dart';

class StationCardSkeleton extends StatelessWidget {
  final bool isDark;
  const StationCardSkeleton({super.key, required this.isDark});

  @override
  Widget build(BuildContext context) {
    final baseColor = isDark ? AppColors.cardDark : AppColors.cardLight;
    final highlightColor = isDark ? AppColors.borderDark : AppColors.borderLight;
    final shimmerBase = isDark ? highlightColor : Colors.grey[300]!;
    final shimmerHighlight = isDark ? baseColor : Colors.grey[100]!;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: baseColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: highlightColor),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Shimmer.fromColors(
                    baseColor: shimmerBase,
                    highlightColor: shimmerHighlight,
                    child: Container(
                      width: 150, height: 16,
                      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(4)),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Shimmer.fromColors(
                    baseColor: shimmerBase,
                    highlightColor: shimmerHighlight,
                    child: Container(
                      width: 100, height: 12,
                      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(4)),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Shimmer.fromColors(
              baseColor: shimmerBase,
              highlightColor: shimmerHighlight,
              child: Container(
                width: 60, height: 26,
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8)),
              ),
            ),
            const SizedBox(width: 8),
            Shimmer.fromColors(
              baseColor: shimmerBase,
              highlightColor: shimmerHighlight,
               child: Container(
                width: 60, height: 28,
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
