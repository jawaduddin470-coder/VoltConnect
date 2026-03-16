import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:ui'; // Fix: PlatformDispatcher
import 'router/app_router.dart';
import 'theme/app_theme.dart';
import 'services/auth_provider.dart';
import 'widgets/startup_guard.dart'; // [NEW] Phase 8

// ─── ThemeProvider ──────────────────────────────────────────────────────────
class ThemeProvider extends ChangeNotifier {
  bool _isDark = true;
  bool get isDark => _isDark;

  ThemeProvider(bool initialDark) : _isDark = initialDark;

  Future<void> toggleTheme() async {
    _isDark = !_isDark;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('isDark', _isDark);
  }
}

// ─── Global Error Logger ─────────────────────────────────────────────────────
void _setupErrorHandling() {
  // Phase 2: Add Flutter Error Handling
  FlutterError.onError = (FlutterErrorDetails details) {
    FlutterError.presentError(details);
    debugPrint("Global Error (Flutter): ${details.exception}");
    debugPrint("Stack trace: ${details.stack}");
  };

  PlatformDispatcher.instance.onError = (Object error, StackTrace stack) {
    debugPrint("Global Error (Platform): $error");
    debugPrint("Stack trace: $stack");
    return true; // Error persists to default handler if false
  };

  // Custom Error Widget for visual crashes
  ErrorWidget.builder = (FlutterErrorDetails details) {
    return Material(
      color: Colors.black,
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.bolt, color: Colors.orange, size: 48),
              const SizedBox(height: 16),
              const Text(
                "APP CRASHED",
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, letterSpacing: 2),
              ),
              const SizedBox(height: 8),
              Text(
                details.exception.toString(),
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.white70, fontSize: 12),
              ),
            ],
          ),
        ),
      ),
    );
  };
}

// ─── App Entry Point ─────────────────────────────────────────────────────────
void main() {
  // Ensure we set up error handling before anything else
  _setupErrorHandling();

  runApp(
    StartupGuard(
      child: MultiProvider(
        providers: [
          // Theme preference logic moved inside StartupGuard or provided as placeholder
          // since SharedPreferences is async. For simplicity, we default to dark 
          // and let the guard handle the real initialization if needed, but 
          // AuthProvider and ThemeProvider can be created after boot.
          ChangeNotifierProvider(create: (_) => ThemeProvider(true)),
          ChangeNotifierProvider(create: (_) => AuthProvider()),
        ],
        child: const VoltConnectApp(),
      ),
    ),
  );
}

// ─── Root Widget ─────────────────────────────────────────────────────────────
class VoltConnectApp extends StatelessWidget {
  const VoltConnectApp({super.key});

  @override
  Widget build(BuildContext context) {
    // Attempting to read theme pref here (StartupGuard ensures SharedPrefs is ready)
    return FutureBuilder<SharedPreferences>(
      future: SharedPreferences.getInstance(),
      builder: (context, snapshot) {
        final themeProvider = context.watch<ThemeProvider>();
        
        return MaterialApp.router(
          title: 'VoltConnect',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.lightTheme,
          darkTheme: AppTheme.darkTheme,
          themeMode: themeProvider.isDark ? ThemeMode.dark : ThemeMode.light,
          routerConfig: goRouter,
        );
      },
    );
  }
}
