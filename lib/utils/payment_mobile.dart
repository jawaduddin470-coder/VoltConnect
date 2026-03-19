import 'package:razorpay_flutter/razorpay_flutter.dart';

/// Native implementation of Razorpay for Android/iOS.
Future<void> initiatePayment({
  required int amount,
  required String planName,
  required String userEmail,
  required String razorpayKey,
  required Function(String paymentId) onSuccess,
  required Function(String errorMessage) onError,
}) async {
  Razorpay razorpay = Razorpay();

  void handlePaymentSuccess(PaymentSuccessResponse response) {
    razorpay.clear();
    onSuccess(response.paymentId ?? '');
  }

  void handlePaymentError(PaymentFailureResponse response) {
    razorpay.clear();
    onError(response.message ?? 'Payment Failed');
  }

  void handleExternalWallet(ExternalWalletResponse response) {
    razorpay.clear();
    onError('External Wallet Selected: ${response.walletName}');
  }

  razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, handlePaymentSuccess);
  razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, handlePaymentError);
  razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, handleExternalWallet);

  var options = {
    'key': razorpayKey,
    'amount': amount,
    'name': 'VoltConnect',
    'description': planName,
    'prefill': {'contact': '', 'email': userEmail},
    'theme': {'color': '#00D4AA'}
  };

  try {
    razorpay.open(options);
  } catch (e) {
    onError('Error launching Razorpay: $e');
  }
}
