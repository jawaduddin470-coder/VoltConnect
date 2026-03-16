import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../theme/app_colors.dart';
import '../../widgets/app_footer.dart';
import '../../utils/payment.dart';

class MembershipScreen extends StatefulWidget {
  const MembershipScreen({super.key});

  @override
  State<MembershipScreen> createState() => _MembershipScreenState();
}

class _MembershipScreenState extends State<MembershipScreen> {
  bool _isAnnual = false;
  bool _isProcessingPayment = false;

  void _handlePaymentSuccess(String paymentId) async {
    final user = FirebaseAuth.instance.currentUser;
    if (user != null) {
      await FirebaseFirestore.instance.collection('users').doc(user.uid).update({
        'membership': {
          'plan': 'Pro/Premium', // Simplification for demo
          'active': true,
          'startDate': FieldValue.serverTimestamp(),
          'endDate': DateTime.now().add(const Duration(days: 30)).toIso8601String(),
          'transactionId': paymentId,
        }
      });
    }

    if (!mounted) return;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        backgroundColor: isDark ? AppColors.cardDark : AppColors.cardLight,
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.check_circle, color: AppColors.teal, size: 64),
            const SizedBox(height: 16),
            Text('Payment Successful!', style: TextStyle(color: isDark ? Colors.white : AppColors.textPrimaryLight, fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text('Transaction ID: $paymentId', style: TextStyle(color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight, fontSize: 12)),
            const SizedBox(height: 24),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.teal, foregroundColor: AppColors.bgDark, minimumSize: const Size(double.infinity, 45)),
              onPressed: () {
                Navigator.pop(context);
                context.go('/splash'); // Reboot to proper routing home
              },
              child: const Text('Back to App'),
            ),
          ],
        ),
      ),
    );
  }

  void _handlePaymentError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Payment Failed: $message'), backgroundColor: AppColors.error));
  }

  void _startPayment(int amount, String planName) async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please sign in first to complete payment.'), backgroundColor: AppColors.warning),
      );
      return;
    }
    final razorpayKey = dotenv.env['RAZORPAY_KEY_ID'] 
        ?? dotenv.env['VITE_RAZORPAY_KEY_ID'] 
        ?? '';
        
    if (razorpayKey.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Payment not configured. Contact support.'), backgroundColor: AppColors.error),
      );
      return;
    }

    setState(() => _isProcessingPayment = true);
    
    try {
      await initiatePayment(
        amount: amount * 100, // in paise
        planName: planName,
        userEmail: user.email ?? 'user@example.com',
        razorpayKey: razorpayKey,
        onSuccess: (paymentId) {
          if (mounted) setState(() => _isProcessingPayment = false);
          _handlePaymentSuccess(paymentId);
        },
        onError: (message) {
          if (mounted) setState(() => _isProcessingPayment = false);
          _handlePaymentError(message);
        },
      );
    } catch (e) {
      if (mounted) setState(() => _isProcessingPayment = false);
      _handlePaymentError(e.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? AppColors.bgDark : AppColors.bgLight;
    final cardBg = isDark ? AppColors.cardDark : AppColors.cardLight;
    final borderCol = isDark ? AppColors.borderDark : AppColors.borderLight;
    final textPri = isDark ? Colors.white : AppColors.textPrimaryLight;
    final textSec = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    final surface = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;

    return Scaffold(
      backgroundColor: bg,
      appBar: AppBar(
        backgroundColor: bg,
        elevation: 0,
        leading: IconButton(icon: Icon(Icons.arrow_back, color: textPri), onPressed: () => context.pop()),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            if (_isProcessingPayment)
              const LinearProgressIndicator(color: AppColors.teal, backgroundColor: AppColors.surfaceDark),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
            Text('Choose Your Plan', style: Theme.of(context).textTheme.headlineSmall?.copyWith(color: textPri, fontWeight: FontWeight.bold)),
            const SizedBox(height: 24),

            // Billing Toggle
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(color: cardBg, borderRadius: BorderRadius.circular(30), border: Border.all(color: borderCol)),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _buildToggleBtn('Monthly', !_isAnnual, isDark, textPri, textSec, surface),
                  _buildToggleBtn('Annual (Save 20%)', _isAnnual, isDark, textPri, textSec, surface),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // Plans
            _buildPlanCard(
              name: 'BASIC',
              monthlyPrice: 399,
              annualPrice: 319,
              features: ['Find nearby stations', '3 trip plans per month', 'Join charging queues', '5% discount at partner stations', 'Standard support'],
              buttonText: 'Get Basic',
              buttonStyle: OutlinedButton.styleFrom(foregroundColor: textPri, side: BorderSide(color: borderCol), padding: const EdgeInsets.symmetric(vertical: 16)),
              isDark: isDark, textPri: textPri, textSec: textSec, borderCol: borderCol, cardBg: cardBg,
            ),
            const SizedBox(height: 16),
            _buildPlanCard(
              name: 'PRO',
              monthlyPrice: 699,
              annualPrice: 559,
              features: ['Everything in Basic', 'Unlimited trip planning', 'Priority queue access', '10% charging discount', 'Volt AI — 100 queries/month', 'Charging reports & history', 'Priority support'],
              buttonText: 'Get Pro',
              buttonStyle: ElevatedButton.styleFrom(backgroundColor: AppColors.teal, foregroundColor: AppColors.bgDark, padding: const EdgeInsets.symmetric(vertical: 16)),
              borderColor: AppColors.teal,
              bgTint: AppColors.teal.withValues(alpha: 0.05),
              badgeText: 'Most Popular',
              badgeColor: AppColors.teal,
              checkColor: AppColors.teal,
              isDark: isDark, textPri: textPri, textSec: textSec, borderCol: borderCol, cardBg: cardBg,
            ),
            const SizedBox(height: 16),
            _buildPlanCard(
              name: 'PREMIUM',
              monthlyPrice: 1199,
              annualPrice: 959,
              features: ['Everything in Pro', 'Always #1 in queue', '20% charging discount', 'Unlimited Volt AI queries', 'Advanced route optimization', 'Family sharing (3 EVs)', 'Dedicated account manager'],
              buttonText: 'Get Premium',
              buttonStyle: ElevatedButton.styleFrom(backgroundColor: AppColors.purple, foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(vertical: 16)),
              borderColor: AppColors.purple,
              bgTint: AppColors.purple.withValues(alpha: 0.05),
              badgeText: 'Best Value',
              badgeColor: AppColors.purple,
              checkColor: AppColors.purple,
              isDark: isDark, textPri: textPri, textSec: textSec, borderCol: borderCol, cardBg: cardBg,
            ),

            const SizedBox(height: 48),

            // FAQ Accordion
            Align(alignment: Alignment.centerLeft, child: Text('Frequently Asked Questions', style: TextStyle(color: textPri, fontSize: 18, fontWeight: FontWeight.bold))),
            const SizedBox(height: 16),
            _buildFaq('Can I change my plan anytime?', 'Yes, you can upgrade or downgrade your plan at any point. Changes will be pro-rated for the current billing cycle.', isDark, textPri, textSec),
            _buildFaq('Is there a free trial?', 'Currently we do not offer a free trial, but you can use the app without a membership for basic features.', isDark, textPri, textSec),
            _buildFaq('How does priority queue work?', 'Pro and Premium members are automatically moved ahead of non-members when joining a virtual queue.', isDark, textPri, textSec),
            _buildFaq('Are discounts automatic?', 'Yes! Just use VoltConnect to pay at the station and partner discounts are automatically applied.', isDark, textPri, textSec),
            _buildFaq('How do I cancel?', 'You can cancel anytime from your Profile > Billing settings.', isDark, textPri, textSec),
            
            const SizedBox(height: 40),
              ],
            ),
          ),
          const AppFooter(),
        ],
      ),
    ),
  );
}

  Widget _buildToggleBtn(String label, bool isSelected, bool isDark, Color textPri, Color textSec, Color surface) {
    return GestureDetector(
      onTap: () => setState(() => _isAnnual = label.contains('Annual')),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        decoration: BoxDecoration(color: isSelected ? surface : Colors.transparent, borderRadius: BorderRadius.circular(24)),
        child: Text(label, style: TextStyle(color: isSelected ? textPri : textSec, fontWeight: isSelected ? FontWeight.bold : FontWeight.normal, fontSize: 13)),
      ),
    );
  }

  Widget _buildPlanCard({
    required String name,
    required int monthlyPrice,
    required int annualPrice,
    required List<String> features,
    required String buttonText,
    required ButtonStyle buttonStyle,
    Color? borderColor,
    Color? bgTint,
    String? badgeText,
    Color? badgeColor,
    Color checkColor = AppColors.teal, // using teal default instead of fixed dark secondary
    required bool isDark,
    required Color textPri,
    required Color textSec,
    required Color borderCol,
    required Color cardBg,
  }) {
    final price = _isAnnual ? annualPrice : monthlyPrice;
    
    return Stack(
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: bgTint ?? cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: borderColor ?? borderCol, width: borderColor != null ? 2 : 1),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(name, style: TextStyle(color: textSec, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
              const SizedBox(height: 12),
              Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text('₹$price', style: TextStyle(color: textPri, fontSize: 36, fontWeight: FontWeight.bold)),
                  Padding(padding: const EdgeInsets.only(bottom: 6, left: 4), child: Text('/month', style: TextStyle(color: textSec))),
                ],
              ),
              if (_isAnnual)
                Padding(
                  padding: const EdgeInsets.only(top: 4),
                  child: Text('₹$monthlyPrice/month · billed ₹${annualPrice * 12}/year', style: const TextStyle(color: AppColors.teal, fontSize: 13)),
                ),
              const SizedBox(height: 24),
              ...features.map((f) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.check_circle_outline, color: checkColor, size: 20),
                    const SizedBox(width: 12),
                    Expanded(child: Text(f, style: TextStyle(color: textPri, fontSize: 14))),
                  ],
                ),
              )),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: name == 'BASIC'
                  ? OutlinedButton(style: buttonStyle, onPressed: _isProcessingPayment ? null : () => _startPayment(price, name), child: Text(buttonText))
                  : ElevatedButton(style: buttonStyle, onPressed: _isProcessingPayment ? null : () => _startPayment(price, name), child: Text(buttonText)),
              ),
              const SizedBox(height: 8),
              Center(
                child: Text(
                  'ⓘ If payment window doesn\'t open, allow popups for this site in your browser settings.',
                  style: TextStyle(fontSize: 11, color: textSec),
                  textAlign: TextAlign.center,
                ),
              ),
            ],
          ),
        ),
        if (badgeText != null)
          Positioned(
            top: 0, right: 24,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: badgeColor,
                borderRadius: const BorderRadius.only(bottomLeft: Radius.circular(8), bottomRight: Radius.circular(8)),
              ),
              child: Text(badgeText, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
            ),
          ),
      ],
    );
  }

  Widget _buildFaq(String q, String a, bool isDark, Color textPri, Color textSec) {
    return Theme(
      data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
      child: ExpansionTile(
        title: Text(q, style: TextStyle(color: textPri, fontSize: 15, fontWeight: FontWeight.w600)),
        iconColor: AppColors.teal,
        collapsedIconColor: textSec,
        tilePadding: EdgeInsets.zero,
        childrenPadding: const EdgeInsets.only(bottom: 16),
        children: [Text(a, style: TextStyle(color: textSec, height: 1.5))],
      ),
    );
  }
}
