import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:firebase_auth/firebase_auth.dart';

import '../screens/splash/splash_screen.dart';
import '../screens/role_selection/role_selection_screen.dart';
import '../screens/auth/auth_screen.dart';
import '../screens/driver/map/map_screen.dart';
import '../screens/driver/trips/trips_screen.dart';
import '../screens/driver/queue/queue_screen.dart';
import '../screens/driver/myev/myev_screen.dart';
import '../screens/driver/calculator/calculator_screen.dart';

import '../screens/operator/dashboard/dashboard_screen.dart';
import '../screens/operator/stations/stations_screen.dart';
import '../screens/operator/add_station/add_station_screen.dart';
import '../screens/operator/analytics/analytics_screen.dart';
import '../screens/membership/membership_screen.dart';
import '../screens/community/community_screen.dart';

import '../screens/driver/profile/driver_profile_screen.dart';
import '../screens/operator/profile/operator_profile_screen.dart';
import '../screens/hub/hub_screen.dart';

Page<dynamic> _fade(Widget child, GoRouterState state) {
  return CustomTransitionPage<void>(
    key: state.pageKey,
    child: child,
    transitionDuration: const Duration(milliseconds: 250),
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      return FadeTransition(
        opacity: CurveTween(curve: Curves.easeInOut).animate(animation),
        child: child,
      );
    },
  );
}

final goRouter = GoRouter(
  initialLocation: '/splash',
  redirect: (context, state) {
    final user = FirebaseAuth.instance.currentUser;
    final isLoggedIn = user != null;
    final isGoingToRoot = state.uri.path == '/';
    final isGoingToAuth = state.uri.path == '/auth';
    final isGoingToSplash = state.uri.path == '/splash';
    final isGoingToDriver = state.uri.path.startsWith('/driver');
    final isGoingToOperator = state.uri.path.startsWith('/operator');

    if (!isLoggedIn && (isGoingToDriver || isGoingToOperator || isGoingToRoot)) {
      if (isGoingToSplash) return null;
      return '/auth';
    }

    if (isLoggedIn && (isGoingToAuth || isGoingToRoot)) {
      return '/hub';
    }
    
    return null;
  },
  routes: [
    GoRoute(path: '/', redirect: (_, __) => '/splash'),
    GoRoute(path: '/splash', pageBuilder: (context, state) => _fade(const SplashScreen(), state)),
    GoRoute(path: '/hub', pageBuilder: (context, state) => _fade(const HubScreen(), state)),
    GoRoute(path: '/role-selection', pageBuilder: (context, state) => _fade(const RoleSelectionScreen(), state)),
    GoRoute(path: '/auth', pageBuilder: (context, state) => _fade(const AuthScreen(), state)),

    // Driver routes — real screens
    GoRoute(path: '/driver/map', pageBuilder: (context, state) => _fade(const MapScreen(), state)),
    GoRoute(path: '/driver/trips', pageBuilder: (context, state) => _fade(const TripsScreen(), state)),
    GoRoute(path: '/driver/queue', pageBuilder: (context, state) => _fade(const QueueScreen(), state)),
    GoRoute(path: '/driver/myev', pageBuilder: (context, state) => _fade(const MyEvScreen(), state)),
    GoRoute(path: '/driver/calculator', pageBuilder: (context, state) => _fade(const CalculatorScreen(), state)),
    GoRoute(path: '/driver/community', pageBuilder: (context, state) => _fade(const CommunityScreen(), state)),
    GoRoute(path: '/driver/profile', pageBuilder: (context, state) => _fade(const DriverProfileScreen(), state)),

    // Operator routes — stubs until Phase 4
    GoRoute(path: '/operator/dashboard', pageBuilder: (context, state) => _fade(const DashboardScreen(), state)),
    GoRoute(path: '/operator/stations', pageBuilder: (context, state) => _fade(const StationsScreen(), state)),
    GoRoute(path: '/operator/add-station', pageBuilder: (context, state) => _fade(const AddStationScreen(), state)),
    GoRoute(path: '/operator/analytics', pageBuilder: (context, state) => _fade(const AnalyticsScreen(), state)),
    GoRoute(path: '/operator/profile', pageBuilder: (context, state) => _fade(const OperatorProfileScreen(), state)),

    GoRoute(path: '/membership', pageBuilder: (context, state) => _fade(const MembershipScreen(), state)),
  ],
);
