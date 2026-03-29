import 'dart:math';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../theme/app_colors.dart';
import '../../widgets/volt_logo.dart';
import '../../widgets/app_footer.dart';
import '../../widgets/theme_toggle.dart';

class RoleSelectionScreen extends StatefulWidget {
  const RoleSelectionScreen({super.key});

  @override
  State<RoleSelectionScreen> createState() => _RoleSelectionScreenState();
}

class _RoleSelectionScreenState extends State<RoleSelectionScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _particleController;
  String? _selectedRole; // 'driver' or 'operator'
  bool _showPlans = false;

  @override
  void initState() {
    super.initState();
    _particleController = AnimationController(
      duration: const Duration(seconds: 10),
      vsync: this,
    )..repeat();
  }

  @override
  void dispose() {
    _particleController.dispose();
    super.dispose();
  }

  void _selectRole(String role) {
    setState(() {
      _selectedRole = role;
      _showPlans = true;
    });
  }

  void _goBack() {
    setState(() {
      _selectedRole = null;
      _showPlans = false;
    });
  }

  Future<void> _proceedWithPlan(String plan) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('voltconnect-role', _selectedRole!);
    debugPrint("Role saved: ${prefs.getString('voltconnect-role')}");
    await prefs.setString('selectedPlan', plan);
    if (mounted) context.go('/auth');
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? AppColors.bgDark : AppColors.bgLight;

    return Scaffold(
      backgroundColor: bgColor,
      body: Stack(
        children: [
          // Floating Particles Background
          RepaintBoundary(
            child: AnimatedBuilder(
              animation: _particleController,
              builder: (context, child) {
                return CustomPaint(
                  painter: ParticlePainter(_particleController.value),
                  size: Size.infinite,
                );
              },
            ),
          ),

          SafeArea(
            child: SingleChildScrollView(
              child: Column(
                children: [
                  // Top bar with theme toggle
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    child: Row(
                      children: [
                        if (_showPlans)
                          GestureDetector(
                            onTap: _goBack,
                            child: Container(
                              width: 36, height: 36,
                              decoration: BoxDecoration(
                                color: AppColors.cardDark.withValues(alpha: 0.5),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Icon(
                                Icons.arrow_back_ios_new,
                                size: 16,
                                color: isDark ? Colors.white : Colors.black87,
                              ),
                            ),
                          ),
                        const Spacer(),

                        const SizedBox(width: 8),
                        const ThemeToggle(),
                      ],
                    ),
                  ),

                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24.0),
                    child: AnimatedSwitcher(
                      duration: const Duration(milliseconds: 350),
                      transitionBuilder: (child, anim) => FadeTransition(
                        opacity: anim,
                        child: SlideTransition(
                          position: Tween<Offset>(
                            begin: const Offset(0, 0.1),
                            end: Offset.zero,
                          ).animate(CurvedAnimation(parent: anim, curve: Curves.easeOut)),
                          child: child,
                        ),
                      ),
                      child: _showPlans
                          ? _buildPlanSelector(isDark)
                          : _buildRoleSelector(isDark),
                    ),
                  ),
                  const SizedBox(height: 48),
                  const AppFooter(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRoleSelector(bool isDark) {
    return Column(
      key: const ValueKey('roles'),
      children: [
        const SizedBox(height: 20),
        const Center(child: VoltLogo(size: VoltLogoSize.medium)),
        const SizedBox(height: 48),
        Text(
          "How do you want to\nuse VoltConnect?",
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.displaySmall?.copyWith(
            fontSize: 24,
            color: isDark ? Colors.white : AppColors.textPrimaryLight,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        Text(
          "Choose your experience to get started.",
          textAlign: TextAlign.center,
          style: TextStyle(
            fontFamily: 'Inter',
            fontSize: 14,
            color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
          ),
        ),
        const SizedBox(height: 40),
        _RoleCard(
          title: "EV Driver",
          description: "Find charging stations, plan trips, join queues and save with membership plans.",
          icon: Icons.directions_car_rounded,
          accentColor: AppColors.teal,
          buttonText: "Continue as Driver →",
          onTap: () => _selectRole('driver'),
        ),
        const SizedBox(height: 20),
        _RoleCard(
          title: "Station Operator",
          description: "List stations, set pricing, track usage analytics and attract more EV drivers.",
          icon: Icons.storefront_rounded,
          accentColor: AppColors.purple,
          buttonText: "Continue as Operator →",
          onTap: () => _selectRole('operator'),
        ),
        const SizedBox(height: 20),
      ],
    );
  }

  Widget _buildPlanSelector(bool isDark) {
    if (_selectedRole == 'driver') {
      return _buildDriverPlans(isDark);
    } else {
      return _buildOperatorPlans(isDark);
    }
  }

  Widget _buildDriverPlans(bool isDark) {
    return Column(
      key: const ValueKey('driver-plans'),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 16),
        Text(
          "Choose your plan to get started",
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            color: isDark ? Colors.white : AppColors.textPrimaryLight,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          "You can upgrade or change anytime",
          style: TextStyle(
            fontSize: 13,
            color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
          ),
        ),
        const SizedBox(height: 24),
        _PlanCard(
          name: "FREE",
          price: "₹0/month",
          badge: "Start Free",
          badgeColor: AppColors.textSecondaryDark,
          borderColor: AppColors.borderDark,
          features: const ["Find nearby stations", "Basic map access", "Join queues"],
          buttonText: "Start Free",
          buttonColor: Colors.transparent,
          buttonTextColor: isDark ? Colors.white : AppColors.textPrimaryLight,
          useBorder: true,
          onTap: () => _proceedWithPlan('free'),
        ),
        const SizedBox(height: 16),
        _PlanCard(
          name: "PRO",
          price: "₹699/month",
          badge: "Most Popular",
          badgeColor: AppColors.teal,
          borderColor: AppColors.teal,
          features: const [
            "Everything in Free",
            "Priority queue access",
            "10% charging discount",
            "Volt AI assistant",
            "Unlimited trip planning",
          ],
          buttonText: "Get Pro",
          buttonColor: AppColors.teal,
          buttonTextColor: Colors.black,
          useBorder: false,
          onTap: () => _proceedWithPlan('pro'),
        ),
        const SizedBox(height: 16),
        _PlanCard(
          name: "PREMIUM",
          price: "₹1199/month",
          badge: "Best Value",
          badgeColor: AppColors.purple,
          borderColor: AppColors.purple,
          features: const [
            "Everything in Pro",
            "Always #1 in queue",
            "20% discount",
            "Unlimited Volt AI",
            "Family sharing (3 EVs)",
          ],
          buttonText: "Get Premium",
          buttonColor: AppColors.purple,
          buttonTextColor: Colors.white,
          useBorder: false,
          onTap: () => _proceedWithPlan('premium'),
        ),
        const SizedBox(height: 20),
        Center(
          child: GestureDetector(
            onTap: () => _proceedWithPlan('free'),
            child: Text(
              "Skip for now →",
              style: TextStyle(
                fontSize: 13,
                color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
              ),
            ),
          ),
        ),
        const SizedBox(height: 20),
      ],
    );
  }

  Widget _buildOperatorPlans(bool isDark) {
    return Column(
      key: const ValueKey('operator-plans'),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 16),
        Text(
          "List your stations for free",
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            color: isDark ? Colors.white : AppColors.textPrimaryLight,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          "No commission. Pay only for premium features.",
          style: TextStyle(
            fontSize: 13,
            color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
          ),
        ),
        const SizedBox(height: 24),
        _PlanCard(
          name: "BASIC OPERATOR",
          price: "Free",
          badge: "Get Started",
          badgeColor: AppColors.teal,
          borderColor: AppColors.teal,
          features: const ["List up to 3 stations", "Basic analytics", "Standard support"],
          buttonText: "Get Started Free",
          buttonColor: AppColors.teal,
          buttonTextColor: Colors.black,
          useBorder: false,
          onTap: () => _proceedWithPlan('operator-basic'),
        ),
        const SizedBox(height: 16),
        _PlanCard(
          name: "PRO OPERATOR",
          price: "₹1999/month",
          badge: "Go Pro",
          badgeColor: AppColors.purple,
          borderColor: AppColors.purple,
          features: const [
            "Unlimited stations",
            "Advanced analytics",
            "Priority listing in search",
            "Verified badge",
          ],
          buttonText: "Go Pro",
          buttonColor: AppColors.purple,
          buttonTextColor: Colors.white,
          useBorder: false,
          onTap: () => _proceedWithPlan('operator-pro'),
        ),
        const SizedBox(height: 20),
        Center(
          child: GestureDetector(
            onTap: () => _proceedWithPlan('operator-basic'),
            child: Text(
              "Skip for now →",
              style: TextStyle(
                fontSize: 13,
                color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
              ),
            ),
          ),
        ),
        const SizedBox(height: 20),
      ],
    );
  }
}

// ── Plan Card ──────────────────────────────────────────────────────────────────
class _PlanCard extends StatefulWidget {
  final String name, price, badge, buttonText;
  final Color badgeColor, borderColor, buttonColor, buttonTextColor;
  final List<String> features;
  final bool useBorder;
  final VoidCallback onTap;

  const _PlanCard({
    required this.name, required this.price, required this.badge,
    required this.badgeColor, required this.borderColor,
    required this.features, required this.buttonText,
    required this.buttonColor, required this.buttonTextColor,
    required this.useBorder, required this.onTap,
  });

  @override
  State<_PlanCard> createState() => _PlanCardState();
}

class _PlanCardState extends State<_PlanCard> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return GestureDetector(
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp: (_) { setState(() => _pressed = false); widget.onTap(); },
      onTapCancel: () => setState(() => _pressed = false),
      child: AnimatedScale(
        scale: _pressed ? 0.97 : 1.0,
        duration: const Duration(milliseconds: 100),
        child: Container(
          decoration: BoxDecoration(
            color: isDark ? AppColors.cardDark : AppColors.cardLight,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: widget.borderColor, width: 1.5),
          ),
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(widget.name, style: TextStyle(
                          fontFamily: 'SpaceGrotesk',
                          fontSize: 18, fontWeight: FontWeight.bold,
                          color: isDark ? Colors.white : AppColors.textPrimaryLight,
                        )),
                        Text(widget.price, style: TextStyle(
                          fontSize: 14, color: widget.borderColor, fontWeight: FontWeight.w600,
                        )),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: widget.badgeColor.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: widget.badgeColor.withValues(alpha: 0.4)),
                    ),
                    child: Text(widget.badge, style: TextStyle(
                      fontSize: 11, color: widget.badgeColor, fontWeight: FontWeight.bold,
                    )),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              ...widget.features.map((f) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  children: [
                    Icon(Icons.check_circle, size: 14, color: widget.borderColor),
                    const SizedBox(width: 8),
                    Text(f, style: TextStyle(
                      fontSize: 13,
                      color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                    )),
                  ],
                ),
              )),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: widget.useBorder
                    ? OutlinedButton(
                        onPressed: widget.onTap,
                        style: OutlinedButton.styleFrom(
                          foregroundColor: isDark ? Colors.white : AppColors.textPrimaryLight,
                          side: BorderSide(color: isDark ? AppColors.borderDark : AppColors.borderLight),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        child: Text(widget.buttonText, style: const TextStyle(fontWeight: FontWeight.bold)),
                      )
                    : ElevatedButton(
                        onPressed: widget.onTap,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: widget.buttonColor,
                          foregroundColor: widget.buttonTextColor,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        child: Text(widget.buttonText, style: const TextStyle(fontWeight: FontWeight.bold)),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Role Card ──────────────────────────────────────────────────────────────────
class _RoleCard extends StatefulWidget {
  final String title, description, buttonText;
  final IconData icon;
  final Color accentColor;
  final VoidCallback onTap;

  const _RoleCard({
    required this.title, required this.description, required this.icon,
    required this.accentColor, required this.buttonText, required this.onTap,
  });

  @override
  State<_RoleCard> createState() => _RoleCardState();
}

class _RoleCardState extends State<_RoleCard> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return GestureDetector(
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp: (_) { setState(() => _pressed = false); widget.onTap(); },
      onTapCancel: () => setState(() => _pressed = false),
      child: AnimatedScale(
        scale: _pressed ? 0.97 : 1.0,
        duration: const Duration(milliseconds: 100),
        child: Container(
          decoration: BoxDecoration(
            color: isDark ? AppColors.cardDark : AppColors.cardLight,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight),
            boxShadow: [
              BoxShadow(
                color: widget.accentColor.withValues(alpha: 0.08),
                blurRadius: 20, offset: const Offset(0, 4),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(15),
            child: Stack(
              children: [
                // Colored left accent bar
                Positioned(
                  left: 0, top: 0, bottom: 0,
                  child: Container(width: 4, color: widget.accentColor),
                ),
                // Content
                Padding(
                  padding: const EdgeInsets.fromLTRB(24, 20, 20, 20),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 52, height: 52,
                        decoration: BoxDecoration(
                          color: widget.accentColor.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Icon(widget.icon, color: widget.accentColor, size: 26),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(widget.title, style: TextStyle(
                              fontFamily: 'SpaceGrotesk',
                              fontSize: 18, fontWeight: FontWeight.bold,
                              color: isDark ? Colors.white : AppColors.textPrimaryLight,
                            )),
                            const SizedBox(height: 6),
                            Text(widget.description, style: TextStyle(
                              fontFamily: 'Inter', fontSize: 13,
                              color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                              height: 1.4,
                            )),
                            const SizedBox(height: 12),
                            Text(widget.buttonText, style: TextStyle(
                              fontFamily: 'Inter', fontSize: 13,
                              color: widget.accentColor, fontWeight: FontWeight.w600,
                            )),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ── Particle Painter ─────────────────────────────────────────────────────────
class ParticlePainter extends CustomPainter {
  final double progress;
  ParticlePainter(this.progress);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..style = PaintingStyle.fill;
    final random = Random(42);

    for (int i = 0; i < 3; i++) {
      final seedX = random.nextDouble();
      final seedY = random.nextDouble();
      final x = size.width * seedX + 50 * sin(2 * pi * progress + i);
      final y = size.height * seedY + 50 * cos(2 * pi * progress + i);
      final radius = i < 2 ? 6.0 : 3.0;
      paint.color = AppColors.teal.withValues(alpha: i < 2 ? 0.10 : 0.06);
      canvas.drawCircle(Offset(x, y), radius, paint);
    }
  }

  @override
  bool shouldRepaint(covariant ParticlePainter oldDelegate) => true;
}
