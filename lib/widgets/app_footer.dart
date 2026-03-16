import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../theme/app_colors.dart';
import 'volt_logo.dart';

class AppFooter extends StatelessWidget {
  const AppFooter({super.key});

  Future<void> _launchUrl(String url) async {
    final uri = Uri.parse(url);
    if (!await launchUrl(uri)) {
      debugPrint('Could not launch $url');
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: isDark ? AppColors.bgDark : AppColors.bgLight,
        border: Border(
          top: BorderSide(color: isDark ? AppColors.borderDark : AppColors.borderLight, width: 1.0),
        ),
      ),
      padding: const EdgeInsets.only(top: 32, bottom: 24, left: 24, right: 24),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 600),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Row 1 - Logo
              const VoltLogo(size: VoltLogoSize.small),
              const SizedBox(height: 4),
              Text(
                "Smart EV Charging · India",
                style: TextStyle(color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight, fontSize: 13),
              ),
              const SizedBox(height: 16),

              // Row 2 - Built by section
              Text(
                "Built with ⚡ by",
                style: TextStyle(
                  fontFamily: 'Inter',
                  color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                  fontSize: 13,
                ),
              ),
              const SizedBox(height: 12),

              // Row 3 - Team cards
              LayoutBuilder(
                builder: (context, constraints) {
                  final isSmall = constraints.maxWidth < 400;
                  final cards = [
                    _buildTeamCard(
                      name: "Mohammed Meraj Uddin",
                      initial: "M",
                      color: AppColors.teal,
                      linkedinUrl: "https://www.linkedin.com/in/merajuddin-0751a6396/",
                      isDark: isDark,
                    ),
                    if (isSmall) const SizedBox(height: 12) else const SizedBox(width: 12),
                    _buildTeamCard(
                      name: "Mohd Basheer Ahmed",
                      initial: "M",
                      color: AppColors.purple,
                      linkedinUrl: "https://www.linkedin.com/in/mohd-basheer-ahmed-5247593a6/",
                      isDark: isDark,
                    ),
                  ];

                  if (isSmall) {
                    return Column(children: cards);
                  } else {
                    return Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: cards.map((c) => Expanded(child: c)).toList(),
                    );
                  }
                },
              ),
              const SizedBox(height: 24),

              // Row 4 - Copyright
              Text(
                "© 2025 VoltConnect. All rights reserved.",
                style: TextStyle(
                  fontFamily: 'Inter',
                  color: isDark ? const Color(0xFF94A3B8) : AppColors.textSecondaryLight,
                  fontSize: 12,
                ),
              ),
              const SizedBox(height: 8),

              // Row 5 - Links row
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _buildFooterLink("Privacy Policy", isDark),
                  Text(" · ", style: TextStyle(color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight)),
                  _buildFooterLink("Terms of Service", isDark),
                  Text(" · ", style: TextStyle(color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight)),
                  _buildFooterLink("Contact", isDark),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTeamCard({
    required String name,
    required String initial,
    required Color color,
    required String linkedinUrl,
    required bool isDark,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1A1A24) : Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight, width: 0.5),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.2),
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Text(
                    initial,
                    style: TextStyle(
                      color: color,
                      fontFamily: 'Space Grotesk',
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  name,
                  style: TextStyle(
                    color: isDark ? Colors.white : AppColors.textPrimaryLight,
                    fontFamily: 'Space Grotesk',
                    fontWeight: FontWeight.w600,
                    fontSize: 13,
                  ),
                  // Let name wrap to prevent truncation
                  softWrap: true,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          InkWell(
            onTap: () => _launchUrl(linkedinUrl),
            child: Row(
              children: [
                const Icon(
                  Icons.link, // Fallback for linkedIn icon
                  color: Color(0xFF0A66C2),
                  size: 16,
                ),
                const SizedBox(width: 4),
                const Text(
                  "LinkedIn",
                  style: TextStyle(
                    fontFamily: 'Inter',
                    color: Color(0xFF0A66C2),
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFooterLink(String text, bool isDark) {
    return InkWell(
      onTap: () {},
      child: Text(
        text,
        style: TextStyle(
          fontFamily: 'Inter',
          color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
          fontSize: 12,
        ),
      ),
    );
  }
}
