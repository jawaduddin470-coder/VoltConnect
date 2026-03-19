
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../theme/app_colors.dart';
import '../../widgets/volt_bolt_icon.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  late Animation<double> _bgOpacity;
  late Animation<double> _boltScaleUp;
  late Animation<double> _boltScaleDown;
  late Animation<double> _textOpacity;
  late Animation<Offset> _textSlide;
  late Animation<double> _taglineOpacity;
  late Animation<double> _glowRadius;
  late Animation<double> _globalOpacity;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
        duration: const Duration(milliseconds: 2800), vsync: this);

    _bgOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 300 / 2800, curve: Curves.easeIn),
      ),
    );

    _boltScaleUp = Tween<double>(begin: 0.3, end: 1.1).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(300 / 2800, 800 / 2800, curve: Curves.elasticOut),
      ),
    );

    _boltScaleDown = Tween<double>(begin: 1.1, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(800 / 2800, 900 / 2800, curve: Curves.easeInOut),
      ),
    );

    _textOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(900 / 2800, 1100 / 2800, curve: Curves.easeIn),
      ),
    );

    _textSlide = Tween<Offset>(begin: const Offset(0, 0.2), end: Offset.zero).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(900 / 2800, 1100 / 2800, curve: Curves.easeOut),
      ),
    );

    _taglineOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(1100 / 2800, 1400 / 2800, curve: Curves.easeIn),
      ),
    );

    // Glow pulse: 20 -> 50 -> 20 (requires sine mapping or custom TweenSequence)
    _glowRadius = TweenSequence<double>([
      TweenSequenceItem(tween: Tween(begin: 20.0, end: 50.0).chain(CurveTween(curve: Curves.easeInOut)), weight: 50),
      TweenSequenceItem(tween: Tween(begin: 50.0, end: 20.0).chain(CurveTween(curve: Curves.easeInOut)), weight: 50),
    ]).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(1400 / 2800, 2400 / 2800),
      ),
    );

    _globalOpacity = Tween<double>(begin: 1.0, end: 0.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(2400 / 2800, 2800 / 2800, curve: Curves.easeOut),
      ),
    );

    _controller.forward().then((_) => _navigate());
  }

  void _navigate() async {
    final user = FirebaseAuth.instance.currentUser;

    if (user != null) {
      if (mounted) context.go('/hub');
    } else {
      if (mounted) context.go('/role-selection');
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        // Calculate bolt scale combining the two stages
        final boltScale = _controller.value <= (800 / 2800) 
            ? _boltScaleUp.value 
            : _boltScaleDown.value;

        return Scaffold(
          backgroundColor: Colors.black, // true black underlying background
          body: Opacity(
            opacity: _globalOpacity.value,
            child: Stack(
              children: [
                // Fading Background
                Opacity(
                  opacity: _bgOpacity.value,
                  child: Container(color: const Color(0xFF0A0A0F)), // AppColors.bgDark
                ),
                
                // Content
                Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Animated Bolt Icon
                      Transform.scale(
                        scale: boltScale > 0 ? boltScale : 0.001, // Prevent 0 scale
                        child: _controller.value >= (300 / 2800) ? Container(
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF00D4AA).withValues(alpha: 0.5),
                                blurRadius: _glowRadius.value > 0 ? _glowRadius.value : 0,
                                spreadRadius: _glowRadius.value * 0.1,
                              ),
                            ],
                          ),
                          child: const VoltBoltIcon(size: 72, showGlow: false), // Glow handled by container
                        ) : const SizedBox(height: 72, width: 72),
                      ),
                      
                      const SizedBox(height: 12),
                      
                      // Animated Text
                      SlideTransition(
                        position: _textSlide,
                        child: Opacity(
                          opacity: _textOpacity.value,
                          child: RichText(
                            text: const TextSpan(
                              style: TextStyle(fontFamily: 'Space Grotesk', fontSize: 32, fontWeight: FontWeight.bold),
                              children: [
                                TextSpan(text: 'Volt', style: TextStyle(color: Colors.white)),
                                TextSpan(text: 'Connect', style: TextStyle(color: AppColors.teal)),
                              ],
                            ),
                          ),
                        ),
                      ),
                      
                      const SizedBox(height: 4),
                      
                      // Tagline
                      Opacity(
                        opacity: _taglineOpacity.value,
                        child: const Text(
                          "Smart EV Charging · India",
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 14,
                            color: AppColors.textSecondaryDark,
                            fontWeight: FontWeight.normal,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
