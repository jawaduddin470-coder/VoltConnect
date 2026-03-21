import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../theme/app_colors.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';
import '../../services/auth_provider.dart';
import '../../widgets/volt_logo.dart';
import '../../widgets/app_footer.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String _userRole = 'driver';

  // Sign In Controllers
  final _signInEmailController = TextEditingController();
  final _signInPasswordController = TextEditingController();
  final _signInFormKey = GlobalKey<FormState>();

  // Sign Up Controllers
  final _signUpNameController = TextEditingController();
  final _signUpEmailController = TextEditingController();
  final _signUpPasswordController = TextEditingController();
  final _signUpConfirmPasswordController = TextEditingController();
  final _signUpFormKey = GlobalKey<FormState>();
  bool _agreeToTerms = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadUserRole();
  }

  Future<void> _loadUserRole() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _userRole = prefs.getString('voltconnect-role') ?? 'driver';
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _signInEmailController.dispose();
    _signInPasswordController.dispose();
    _signUpNameController.dispose();
    _signUpEmailController.dispose();
    _signUpPasswordController.dispose();
    _signUpConfirmPasswordController.dispose();
    super.dispose();
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: AppColors.error),
    );
  }

  Future<void> _handleSignIn() async {
    if (_signInFormKey.currentState!.validate()) {
      final authProvider = context.read<AuthProvider>();
      try {
        await authProvider.signIn(
          _signInEmailController.text.trim(),
          _signInPasswordController.text.trim(),
        );
        _navigateToDashboard();
      } catch (e) {
        _showError(_getErrorMessage(e.toString()));
      }
    }
  }

  // MANUAL FIREBASE STEPS REQUIRED:
  // STEP 1: Go to console.firebase.google.com
  // STEP 2: Select project "voltconnect-30c9b"
  // STEP 3: Click "Authentication" in left sidebar
  // STEP 4: Click "Sign-in method" tab -> Email/Password -> Enable -> Save
  // STEP 5: Click "Google" provider -> Enable -> Add support email -> Save
  // STEP 6: Click "Settings" tab -> "Authorized domains" -> Add "localhost"
  // STEP 7: Firestore Database -> Rules -> Update as provided in instructions
  Future<void> _handleSignUp() async {
    if (_signUpFormKey.currentState!.validate()) {
      if (!_agreeToTerms) {
        _showError("Please agree to the Terms & Privacy Policy");
        return;
      }
      final authProvider = context.read<AuthProvider>();
      try {
        await authProvider.signUp(
          _signUpNameController.text.trim(),
          _signUpEmailController.text.trim(),
          _signUpPasswordController.text.trim(),
          _userRole,
        );
        // Route new signups to their respective dashboards
        _navigateToDashboard();
      } catch (e) {
        debugPrint('Signup error: $e'); // Log trace explicitly as requested
        _showError(_getErrorMessage(e.toString()));
      }
    }
  }

  Future<void> _handleGoogleSignIn() async {
    final authProvider = context.read<AuthProvider>();
    try {
      await authProvider.signInWithGoogle(_userRole);
      // Route Google sign-in users to their respective dashboards
      _navigateToDashboard();
    } catch (e) {
      _showError(_getErrorMessage(e.toString()));
    }
  }

  void _navigateToDashboard() {
    if (_userRole == 'operator') {
      context.go('/operator/dashboard');
    } else {
      context.go('/driver/map');
    }
  }

  String _getErrorMessage(String error) {
    if (error.contains('wrong-password')) return "Incorrect password. Try again.";
    if (error.contains('user-not-found')) return "No account with this email.";
    if (error.contains('email-already-in-use')) return "Email already registered.";
    if (error.contains('weak-password')) return "Password must be at least 8 characters.";
    if (error.contains('network-request-failed')) return "No internet. Check connection.";
    // Google Sign in specific errors
    if (error.contains('popup-blocked')) return "Please allow popups for this site in your browser settings, then try again.";
    if (error.contains('popup-closed-by-user')) return "Sign-in was cancelled. Please try again.";
    if (error.contains('unauthorized-domain')) return "This domain is not authorized. Please contact support.";
    if (error.contains('operation-not-allowed')) return "Provider is not enabled. Please enable it in Firebase Console.";
    
    return "Sign in failed: $error"; // Detailed catch-all error block to never swallow
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final roleColor = _userRole == 'driver' ? AppColors.teal : AppColors.purple;

    return Scaffold(
      backgroundColor: isDark ? AppColors.bgDark : AppColors.bgLight,
      body: Stack(
        children: [
          SafeArea(
            child: SingleChildScrollView(
              padding: EdgeInsets.only(
                left: 24.0, right: 24.0,
                bottom: MediaQuery.of(context).viewInsets.bottom,
              ),
              child: Column(
                children: [
                  // Header
                  Row(
                    children: [
                      IconButton(
                        icon: Icon(Icons.arrow_back, color: isDark ? Colors.white : AppColors.textPrimaryLight),
                        onPressed: () => context.go('/role-selection'),
                      ),
                      const Expanded(
                        child: Center(
                          child: VoltLogo(size: VoltLogoSize.small),
                        ),
                      ),
                      const SizedBox(width: 48), // Balancing for back arrow
                    ],
                  ),
                  const SizedBox(height: 12),
                  // Role Badge
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                    decoration: BoxDecoration(
                      color: roleColor.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: roleColor.withValues(alpha: 0.5), width: 0.5),
                    ),
                    child: Text(
                      _userRole == 'driver' ? "EV Driver" : "Station Operator",
                      style: TextStyle(
                        fontSize: 12,
                        color: roleColor,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),
                  // Tabs
                  TabBar(
                    controller: _tabController,
                    indicatorColor: AppColors.teal,
                    indicatorWeight: 2,
                    labelColor: isDark ? Colors.white : AppColors.textPrimaryLight,
                    unselectedLabelColor: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                    dividerColor: Colors.transparent,
                    tabs: const [
                      Tab(text: "Sign In"),
                      Tab(text: "Create Account"),
                    ],
                  ),
                  const SizedBox(height: 32),
                  // Form Content
                  if (_tabController.index == 0) _buildSignInTab() else _buildSignUpTab(),
                  const SizedBox(height: 48), // Spacing before footer
                  const AppFooter(),
                ],
              ),
            ),
          ),
          // Loading Overlay
          if (context.watch<AuthProvider>().isLoading)
            Container(
            color: Colors.black.withValues(alpha: 0.5),
              child: const Center(
                child: CircularProgressIndicator(color: AppColors.teal),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildSignInTab() {
    return Form(
      key: _signInFormKey,
      child: Column(
        children: [
          CustomTextField(
            label: "Email",
            hint: "Enter your email",
            controller: _signInEmailController,
            keyboardType: TextInputType.emailAddress,
            validator: (v) => (v == null || !v.contains('@')) ? "Enter a valid email" : null,
          ),
          const SizedBox(height: 20),
          CustomTextField(
            label: "Password",
            hint: "Enter your password",
            controller: _signInPasswordController,
            isPassword: true,
            validator: (v) => (v == null || v.length < 8) ? "Min 8 characters required" : null,
          ),
          const SizedBox(height: 12),
          Align(
            alignment: Alignment.centerRight,
            child: TextButton(
              onPressed: () {}, // Implement Forgot Password
              child: const Text(
                "Forgot Password?",
                style: TextStyle(color: AppColors.textSecondaryDark, fontSize: 13),
              ),
            ),
          ),
          const SizedBox(height: 24),
          CustomButton(
            text: "Sign In",
            onPressed: _handleSignIn,
          ),
          const SizedBox(height: 24),
          _buildDivider(),
          const SizedBox(height: 24),
          _buildGoogleButton(),
        ],
      ),
    );
  }

  Widget _buildSignUpTab() {
    return Form(
      key: _signUpFormKey,
      child: Column(
        children: [
          CustomTextField(
            label: "Full Name",
            hint: "Enter your full name",
            controller: _signUpNameController,
            validator: (v) => (v == null || v.length < 2) ? "Enter at least 2 chars" : null,
          ),
          const SizedBox(height: 20),
          CustomTextField(
            label: "Email",
            hint: "Enter your email",
            controller: _signUpEmailController,
            keyboardType: TextInputType.emailAddress,
            validator: (v) => (v == null || !v.contains('@')) ? "Enter a valid email" : null,
          ),
          const SizedBox(height: 20),
          CustomTextField(
            label: "Password",
            hint: "Min. 8 characters",
            controller: _signUpPasswordController,
            isPassword: true,
            validator: (v) => (v == null || v.length < 8) ? "Min 8 characters required" : null,
          ),
          const SizedBox(height: 20),
          CustomTextField(
            label: "Confirm Password",
            hint: "Repeat your password",
            controller: _signUpConfirmPasswordController,
            isPassword: true,
            validator: (v) => v != _signUpPasswordController.text ? "Passwords don't match" : null,
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              SizedBox(
                height: 24,
                width: 24,
                child: Checkbox(
                  value: _agreeToTerms,
                  onChanged: (v) => setState(() => _agreeToTerms = v ?? false),
                  activeColor: AppColors.teal,
                  checkColor: AppColors.bgDark,
                  side: const BorderSide(color: AppColors.borderDark),
                ),
              ),
              const SizedBox(width: 8),
              const Expanded(
                child: Text(
                  "I agree to Terms & Privacy Policy",
                  style: TextStyle(color: AppColors.textSecondaryDark, fontSize: 12),
                ),
              ),
            ],
          ),
          const SizedBox(height: 32),
          CustomButton(
            text: "Create Account",
            onPressed: _handleSignUp,
          ),
          const SizedBox(height: 24),
          _buildDivider(),
          const SizedBox(height: 24),
          _buildGoogleButton(),
        ],
      ),
    );
  }

  Widget _buildDivider() {
    return const Row(
      children: [
        Expanded(child: Divider(color: AppColors.borderDark)),
        Padding(
          padding: EdgeInsets.symmetric(horizontal: 16),
          child: Text(
            "or continue with",
            style: TextStyle(color: AppColors.textSecondaryDark, fontSize: 12),
          ),
        ),
        Expanded(child: Divider(color: AppColors.borderDark)),
      ],
    );
  }

  Widget _buildGoogleButton() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      width: double.infinity,
      height: 52,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: isDark ? Colors.white.withValues(alpha: 0.5) : AppColors.borderLight, width: 0.5),
      ),
      child: InkWell(
        onTap: _handleGoogleSignIn,
        borderRadius: BorderRadius.circular(12),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.g_mobiledata, color: isDark ? Colors.white : AppColors.textPrimaryLight, size: 32),
            const SizedBox(width: 8),
            Text(
              "Continue with Google",
              style: TextStyle(color: isDark ? Colors.white : AppColors.textPrimaryLight, fontSize: 15),
            ),
          ],
        ),
      ),
    );
  }
}
