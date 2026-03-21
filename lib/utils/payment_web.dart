import 'dart:js' as js;
import 'package:flutter/foundation.dart';

/// Initiates a payment process on Flutter Web using the dynamically injected
/// Razorpay checkout.js script to avoid native compilation issues.
Future<void> initiatePayment({
  required int amount,
  required String planName,
  required String userEmail,
  required String razorpayKey,
  required Function(String paymentId) onSuccess,
  required Function(String errorMessage) onError,
}) async {
  try {
    debugPrint('VoltConnect: Calling JS helper openRazorpay... $amount, $planName');
    
    final Map<String, dynamic> optionsMap = {
      'key': razorpayKey,
      'amount': amount.toInt(),
      'currency': 'INR',
      'name': 'VoltConnect',
      'description': planName,
      'prefill': {'email': userEmail, 'contact': ''},
      'theme': {'color': '#00D4AA'},
    };

    final jsOptions = js.JsObject.jsify(optionsMap);

    js.context.callMethod('openRazorpay', [
      jsOptions,
      (paymentId) => onSuccess(paymentId),
      (errorMessage) => onError(errorMessage),
    ]);
  } catch (e) {
    debugPrint('VoltConnect: initiatePayment exception: $e');
    onError('Error launching payment popup: $e');
  }
}
