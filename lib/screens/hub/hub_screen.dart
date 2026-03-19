import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../services/auth_service.dart';
import '../../theme/app_colors.dart';

class HubScreen extends StatefulWidget {
  const HubScreen({super.key});

  @override
  State<HubScreen> createState() => _HubScreenState();
}

class _HubScreenState extends State<HubScreen> with TickerProviderStateMixin {
  late AnimationController _fadeController;
  final AuthService _authService = AuthService();
  String? _userRole;
  String _greeting = "Hello";

  @override
  void initState() {
    super.initState();
    _fadeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );
    _loadUserRole();
    _updateGreeting();
    _fadeController.forward();
  }

  void _updateGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) {
      _greeting = "Good morning";
    } else if (hour < 17) {
      _greeting = "Good afternoon";
    } else {
      _greeting = "Good evening";
    }
  }

  Future<void> _loadUserRole() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user != null) {
      final role = await _authService.getUserRole(user.uid);
      if (mounted) setState(() => _userRole = role);
    }
  }

  @override
  void dispose() {
    _fadeController.dispose();
    super.dispose();
  }

  void _showRestrictedSheet(String title, String subtitle, IconData icon, Color color, {String? ctaLabel}) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: Color(0xFF141414),
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          border: Border(top: BorderSide(color: Color(0xFF2A2A2A))),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(2)))),
            const SizedBox(height: 24),
            Container(width: 52, height: 52, decoration: BoxDecoration(color: color.withOpacity(0.15), shape: BoxShape.circle), child: Icon(icon, color: color, size: 28)),
            const SizedBox(height: 16),
            Text(title, style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text(subtitle, style: const TextStyle(color: Colors.white70, fontSize: 14, lineHeight: 1.5)),
            const SizedBox(height: 32),
            if (ctaLabel != null)
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  style: ElevatedButton.styleFrom(backgroundColor: color, foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(vertical: 14), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                  child: Text(ctaLabel, style: const TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            TextButton(
              onPressed: () => Navigator.pop(context),
              style: TextButton.styleFrom(minimumSize: const Size(double.infinity, 50), foregroundColor: Colors.white38),
              child: const Text("Cancel"),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = FirebaseAuth.instance.currentUser;
    final displayName = user?.displayName ?? user?.email?.split('@')[0] ?? "there";

    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header pill
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(color: const Color(0xFF00C853).withOpacity(0.1), borderRadius: BorderRadius.circular(20), border: Border.all(color: const Color(0xFF00C853).withOpacity(0.2))),
                child: const Row(mainAxisSize: MainAxisSize.min, children: [Icon(LucideIcons.zap, size: 14, color: Color(0xFF00C853)), SizedBox(width: 6), Text("VoltConnect Hub", style: TextStyle(color: Color(0xFF00C853), fontWeight: FontWeight.bold, fontSize: 12))]),
              ),
              const SizedBox(height: 20),
              Text("$_greeting,\n$displayName 👋", style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w900, letterSpacing: -1, height: 1.1)),
              const SizedBox(height: 8),
              const Text("What are you here for today?", style: TextStyle(color: Colors.white38, fontSize: 16)),
              const SizedBox(height: 32),

              _HubCard(
                index: 0, controller: _fadeController,
                title: "Find & Book Chargers", subtitle: "Discover stations, book slots, manage wallet", icon: LucideIcons.smartphone, color: const Color(0xFF00C853), badge: "🟢 LIVE",
                pills: const ["Map", "Book", "Wallet"], cta: "Open Consumer App →",
                onTap: () => context.go('/driver/map'),
              ),
              const SizedBox(height: 16),
              _HubCard(
                index: 1, controller: _fadeController,
                title: "Partner Dashboard", subtitle: "Manage stations and track revenue", icon: LucideIcons.building, color: const Color(0xFF1565C0), badge: "🔒 B2B Access",
                pills: const ["Analytics", "Revenue"], cta: "Open Partner Portal →",
                onTap: () {
                  if (_userRole == 'partner' || _userRole == 'admin') {
                    context.go('/operator/dashboard');
                  } else {
                    _showRestrictedSheet("Partner Access Required", "You need a partner account to access this area. Apply via our website to get started.", LucideIcons.building, const Color(0xFF1565C0), ctaLabel: "Apply for Access");
                  }
                },
              ),
              const SizedBox(height: 16),
              _HubCard(
                index: 2, controller: _fadeController,
                title: "Admin Panel", subtitle: "Internal operations and payouts", icon: LucideIcons.shieldCheck, color: const Color(0xFFEF4444), badge: "🔐 Internal Only",
                pills: const ["Disputes", "Users"], cta: "Open Admin Panel →",
                onTap: () {
                  if (_userRole == 'admin') {
                    // Navigate to admin if implemented in Flutter, or show restricted
                    _showRestrictedSheet("Restricted Access", "This area is only accessible to VoltConnect internal staff.", LucideIcons.lock, const Color(0xFFEF4444));
                  } else {
                    _showRestrictedSheet("Restricted Access", "This area is only accessible to VoltConnect internal staff.", LucideIcons.lock, const Color(0xFFEF4444));
                  }
                },
              ),
              const SizedBox(height: 40),

              // Horizontal stats scroll
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _StatPill(emoji: "⚡", label: "1,500+ Stations"),
                    const SizedBox(width: 8),
                    _StatPill(emoji: "🌆", label: "12 Cities"),
                    const SizedBox(width: 8),
                    _StatPill(emoji: "🔋", label: "Active: 847"),
                  ],
                ),
              ),
              const SizedBox(height: 48),
              Center(child: Text("© 2026 VoltConnect · All rights reserved", style: TextStyle(color: Colors.white.withOpacity(0.2), fontSize: 12))),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}

class _HubCard extends StatelessWidget {
  final int index;
  final AnimationController controller;
  final String title, subtitle, badge, cta;
  final IconData icon;
  final Color color;
  final List<String> pills;
  final VoidCallback onTap;

  const _HubCard({required this.index, required this.controller, required this.title, required this.subtitle, required this.icon, required this.color, required this.badge, required this.pills, required this.cta, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final animation = CurvedAnimation(
      parent: controller,
      curve: Interval(0.1 + (index * 0.1), 0.6 + (index * 0.1), curve: Curves.easeOutCubic),
    );

    return AnimatedBuilder(
      animation: animation,
      builder: (context, child) => Transform.translate(
        offset: Offset(0, 30 * (1 - animation.value)),
        child: Opacity(opacity: animation.value, child: child),
      ),
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          decoration: BoxDecoration(color: const Color(0xFF141414), borderRadius: BorderRadius.circular(20), border: Border.all(color: color.withOpacity(0.15))),
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(width: 48, height: 48, decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(14)), child: Icon(icon, color: color, size: 24)),
                  Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4), decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(20)), child: Text(badge, style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold))),
                ],
              ),
              const SizedBox(height: 16),
              Text(title, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Text(subtitle, style: const TextStyle(color: Colors.white38, fontSize: 13, height: 1.3)),
              const SizedBox(height: 16),
              Row(children: pills.map((p) => Container(margin: const EdgeInsets.only(right: 6), padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4), decoration: BoxDecoration(color: Colors.white.withOpacity(0.05), borderRadius: BorderRadius.circular(12)), child: Text(p, style: const TextStyle(color: Colors.white54, fontSize: 11)))).toList()),
              const SizedBox(height: 16),
              Container(width: double.infinity, padding: const EdgeInsets.symmetric(vertical: 12), decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(12)), child: Center(child: Text(cta, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)))),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatPill extends StatelessWidget {
  final String emoji, label;
  const _StatPill({required this.emoji, required this.label});
  @override
  Widget build(BuildContext context) {
    return Container(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8), decoration: BoxDecoration(color: const Color(0xFF141414), border: Border.all(color: Colors.white.withOpacity(0.05)), borderRadius: BorderRadius.circular(30)), child: Row(children: [Text(emoji, style: const TextStyle(fontSize: 14)), const SizedBox(width: 8), Text(label, style: const TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w500))]));
  }
}
