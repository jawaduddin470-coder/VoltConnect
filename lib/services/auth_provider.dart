import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'auth_service.dart';

class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();
  User? _user;
  bool _isLoading = false;

  User? get user => _user;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _user != null;

  AuthProvider() {
    _init();
  }

  void _init() {
    try {
      // Access instances lazily inside a method, not as final fields
      _user = FirebaseAuth.instance.currentUser;
      FirebaseAuth.instance.authStateChanges().listen((User? user) {
        _user = user;
        notifyListeners();
      }, onError: (error) {
        debugPrint("AuthProvider: Auth state stream error: $error");
      });
    } catch (e) {
      debugPrint("AuthProvider: Initialization error: $e");
    }
  }

  Future<void> signIn(String email, String password) async {
    _setLoading(true);
    try {
      await _authService.signInWithEmail(email, password);
    } finally {
      _setLoading(false);
    }
  }

  Future<void> signUp(String name, String email, String password, String role) async {
    _setLoading(true);
    try {
      final credential = await _authService.createAccount(name, email, password);
      if (credential.user != null) {
        // This internal call catches its own errors based on our AuthService update
        await _authService.syncUserData(credential.user!, role);
      }
    } finally {
      _setLoading(false);
    }
  }

  Future<void> signInWithGoogle(String role) async {
    _setLoading(true);
    try {
      final credential = await _authService.signInWithGoogle();
      if (credential?.user != null) {
        await _authService.syncUserData(credential!.user!, role);
      }
    } finally {
      _setLoading(false);
    }
  }

  Future<void> signOut() async {
    try {
      await _authService.signOut();
    } catch (e) {
      debugPrint("AuthProvider: Sign out error: $e");
    }
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }
}
