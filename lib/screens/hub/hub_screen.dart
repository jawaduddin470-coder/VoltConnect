import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:go_router/go_router.dart';

class HubScreen extends StatefulWidget {
  const HubScreen({super.key});
  @override
  State<HubScreen> createState() => _HubScreenState();
}

class _HubScreenState extends State<HubScreen>
    with TickerProviderStateMixin {

  String userName = "User";
  String userRole = "consumer";
  late List<AnimationController> _controllers;
  late List<Animation<Offset>> _slideAnimations;

  @override
  void initState() {
    super.initState();
    _loadUser();
    _setupAnimations();
  }

  void _loadUser() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user != null) {
      final doc = await FirebaseFirestore.instance
          .collection('users')
          .doc(user.uid)
          .get();
      if (mounted) {
        setState(() {
          userName = doc.data()?['name'] ??
                     user.displayName ??
                     user.email?.split('@')[0] ??
                     'User';
          userRole = doc.data()?['role'] ?? 'consumer';
        });
      }
    }
  }

  void _setupAnimations() {
    _controllers = List.generate(3, (i) => AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    ));
    _slideAnimations = _controllers.map((c) =>
      Tween<Offset>(begin: const Offset(0, 0.3), end: Offset.zero)
        .animate(CurvedAnimation(parent: c, curve: Curves.easeOut))
    ).toList();

    // Staggered entry
    Future.delayed(const Duration(milliseconds: 100),
      () { if (mounted) _controllers[0].forward(); });
    Future.delayed(const Duration(milliseconds: 200),
      () { if (mounted) _controllers[1].forward(); });
    Future.delayed(const Duration(milliseconds: 300),
      () { if (mounted) _controllers[2].forward(); });
  }

  @override
  void dispose() {
    for (var c in _controllers) c.dispose();
    super.dispose();
  }

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }

  void _handlePartnerTap() {
    if (userRole == 'partner' || userRole == 'admin') {
      context.go('/operator/dashboard');
    } else {
      _showAccessDenied(
        title: "Partner Access Required",
        message: "You need a partner account to access this area.",
        showApply: true,
      );
    }
  }

  void _handleAdminTap() {
    if (userRole == 'admin') {
      // Admin panel is on the web platform; show info for mobile
      _showAccessDenied(
        title: "🔒 Admin Panel",
        message: "The Admin Panel is available on the VoltConnect web platform at voltconnect-platform.vercel.app",
        showApply: false,
      );
    } else {
      _showAccessDenied(
        title: "🔒 Restricted Access",
        message: "This area is for VoltConnect staff only.",
        showApply: false,
      );
    }
  }

  void _showAccessDenied({
    required String title,
    required String message,
    required bool showApply,
  }) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF141414),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40, height: 4,
              decoration: BoxDecoration(
                color: Colors.grey[700],
                borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 20),
            Text(title, style: const TextStyle(
              color: Colors.white, fontSize: 18,
              fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            Text(message, textAlign: TextAlign.center,
              style: const TextStyle(color: Color(0xFF888888))),
            const SizedBox(height: 24),
            if (showApply) SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF00C853),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12))),
                onPressed: () => Navigator.pop(context),
                child: const Text("Apply for Partner Access",
                  style: TextStyle(color: Colors.black,
                    fontWeight: FontWeight.bold)))),
            const SizedBox(height: 10),
            SizedBox(
              width: double.infinity,
              child: TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text("Cancel",
                  style: TextStyle(color: Color(0xFF888888))))),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top bar
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF00C853).withOpacity(0.15),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(
                        color: const Color(0xFF00C853).withOpacity(0.4)),
                    ),
                    child: const Row(children: [
                      Text("⚡", style: TextStyle(fontSize: 14)),
                      SizedBox(width: 6),
                      Text("VoltConnect Hub",
                        style: TextStyle(color: Color(0xFF00C853),
                          fontWeight: FontWeight.w600, fontSize: 14)),
                    ]),
                  ),
                  // Status pill
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFF141414),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFF2A2A2A)),
                    ),
                    child: const Row(children: [
                      Icon(Icons.circle, color: Color(0xFF00C853), size: 8),
                      SizedBox(width: 6),
                      Text("All Systems Online",
                        style: TextStyle(color: Colors.white70,
                          fontSize: 11)),
                    ]),
                  ),
                ],
              ),

              const SizedBox(height: 32),

              // Greeting
              Text("${_getGreeting()},",
                style: const TextStyle(
                  color: Color(0xFF888888), fontSize: 16)),
              const SizedBox(height: 4),
              Text(userName,
                style: const TextStyle(
                  color: Colors.white, fontSize: 28,
                  fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              const Text("What are you here for today?",
                style: TextStyle(
                  color: Color(0xFF888888), fontSize: 14)),

              const SizedBox(height: 32),

              // Card 1 — Consumer
              SlideTransition(
                position: _slideAnimations[0],
                child: _HubCard(
                  icon: Icons.electric_bolt,
                  iconColor: const Color(0xFF00C853),
                  borderColor: const Color(0xFF00C853),
                  title: "Find & Book Chargers",
                  subtitle: "Discover stations, book slots, "
                      "manage your EV wallet",
                  tags: const ["🗺️ Map", "📅 Book", "💳 Wallet"],
                  tagColor: const Color(0xFF00C853),
                  badge: "🟢 LIVE",
                  badgeColor: const Color(0xFF00C853),
                  buttonLabel: "Open Consumer App →",
                  buttonColor: const Color(0xFF00C853),
                  buttonTextColor: Colors.black,
                  onTap: () => context.go('/driver/map'),
                ),
              ),

              const SizedBox(height: 16),

              // Card 2 — Partner
              SlideTransition(
                position: _slideAnimations[1],
                child: _HubCard(
                  icon: Icons.business,
                  iconColor: const Color(0xFF1565C0),
                  borderColor: const Color(0xFF1565C0),
                  title: "Partner Dashboard",
                  subtitle: "Manage stations, track revenue "
                      "and bookings",
                  tags: const ["📊 Analytics", "🗺️ Stations", "💰 Revenue"],
                  tagColor: const Color(0xFF1565C0),
                  badge: "🔒 B2B",
                  badgeColor: const Color(0xFF1565C0),
                  buttonLabel: "Open Partner Portal →",
                  buttonColor: const Color(0xFF1565C0),
                  buttonTextColor: Colors.white,
                  onTap: _handlePartnerTap,
                ),
              ),

              const SizedBox(height: 16),

              // Card 3 — Admin
              SlideTransition(
                position: _slideAnimations[2],
                child: _HubCard(
                  icon: Icons.shield,
                  iconColor: const Color(0xFFB71C1C),
                  borderColor: const Color(0xFFB71C1C),
                  title: "Admin Panel",
                  subtitle: "Internal operations, commissions, "
                      "disputes & payouts",
                  tags: const ["⚖️ Disputes", "💸 Payouts", "👤 Users"],
                  tagColor: const Color(0xFFB71C1C),
                  badge: "🔐 Internal",
                  badgeColor: const Color(0xFFB71C1C),
                  buttonLabel: "Open Admin Panel →",
                  buttonColor: const Color(0xFFB71C1C),
                  buttonTextColor: Colors.white,
                  onTap: _handleAdminTap,
                ),
              ),

              const SizedBox(height: 24),

              // Quick stats
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(children: [
                  _statPill("⚡ 1,500+ Stations"),
                  const SizedBox(width: 8),
                  _statPill("🌆 12 Cities"),
                  const SizedBox(width: 8),
                  _statPill("🔋 Active Now: 847"),
                  const SizedBox(width: 8),
                  _statPill("👥 50K+ Users"),
                ]),
              ),

              const SizedBox(height: 24),

              // Footer
              const Center(
                child: Text("© 2026 VoltConnect · All rights reserved",
                  style: TextStyle(
                    color: Color(0xFF444444), fontSize: 12)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// Reusable Hub Card Widget
class _HubCard extends StatefulWidget {
  final IconData icon;
  final Color iconColor, borderColor, tagColor, badgeColor;
  final Color buttonColor, buttonTextColor;
  final String title, subtitle, badge, buttonLabel;
  final List<String> tags;
  final VoidCallback onTap;

  const _HubCard({
    required this.icon, required this.iconColor,
    required this.borderColor, required this.title,
    required this.subtitle, required this.tags,
    required this.tagColor, required this.badge,
    required this.badgeColor, required this.buttonLabel,
    required this.buttonColor, required this.buttonTextColor,
    required this.onTap,
  });

  @override
  State<_HubCard> createState() => _HubCardState();
}

class _HubCardState extends State<_HubCard> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp: (_) {
        setState(() => _pressed = false);
        widget.onTap();
      },
      onTapCancel: () => setState(() => _pressed = false),
      child: AnimatedScale(
        scale: _pressed ? 0.97 : 1.0,
        duration: const Duration(milliseconds: 100),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: const Color(0xFF141414),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: widget.borderColor.withOpacity(0.4), width: 1.5),
            boxShadow: [BoxShadow(
              color: widget.borderColor.withOpacity(0.1),
              blurRadius: 12, spreadRadius: 0)],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: widget.iconColor.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(12)),
                    child: Icon(widget.icon,
                      color: widget.iconColor, size: 24),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: widget.badgeColor.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(20)),
                    child: Text(widget.badge,
                      style: TextStyle(
                        color: widget.badgeColor,
                        fontSize: 11,
                        fontWeight: FontWeight.w600)),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              Text(widget.title,
                style: const TextStyle(
                  color: Colors.white, fontSize: 18,
                  fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              Text(widget.subtitle,
                style: const TextStyle(
                  color: Color(0xFF888888), fontSize: 13)),
              const SizedBox(height: 14),
              Wrap(spacing: 8, runSpacing: 6, children: widget.tags.map((tag) =>
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: widget.tagColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: widget.tagColor.withOpacity(0.3))),
                  child: Text(tag,
                    style: TextStyle(
                      color: widget.tagColor, fontSize: 11)),
                )
              ).toList()),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: widget.buttonColor,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12))),
                  onPressed: widget.onTap,
                  child: Text(widget.buttonLabel,
                    style: TextStyle(
                      color: widget.buttonTextColor,
                      fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// Stat pill widget (top-level function)
Widget _statPill(String text) {
  return Container(
    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
    decoration: BoxDecoration(
      color: const Color(0xFF141414),
      borderRadius: BorderRadius.circular(20),
      border: Border.all(color: const Color(0xFF2A2A2A)),
    ),
    child: Text(text,
      style: const TextStyle(color: Colors.white70, fontSize: 12)),
  );
}
