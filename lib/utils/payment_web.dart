// ignore_for_file: avoid_web_libraries_in_flutter
import 'dart:html' as html;
import 'dart:js' as js;

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
    js.context['console'].callMethod('log', ['VoltConnect: Calling JS helper openRazorpay...', amount, planName]);

    final Map<String, dynamic> optionsMap = {
      'key': razorpayKey,
      'amount': amount.toInt(),
      'currency': 'INR',
      'name': 'VoltConnect',
      'description': planName,
      'prefill': {'email': userEmail, 'contact': ''},
      'theme': {'color': '#00D4AA'},
    };

    js.context.callMethod('openRazorpay', [
      js.JsObject.jsify(optionsMap),
      (paymentId) => onSuccess(paymentId),
      (errorMessage) => onError(errorMessage),
    ]);
  } catch (e) {
    js.context['console'].callMethod('error', ['VoltConnect: initiatePayment exception', e.toString()]);
    onError('Error launching payment popup: $e');
  }
}
