/// Non-web stub for initiatePayment.
/// On mobile/desktop, we could use the official package if needed,
/// but since the user requested to avoid the package for web compatibility,
/// this stub throws an unimplemented error or shows a dialog.
Future<void> initiatePayment({
  required int amount,
  required String planName,
  required String userEmail,
  required String razorpayKey,
  required Function(String paymentId) onSuccess,
  required Function(String errorMessage) onError,
}) async {
  // Mobile implementation could go here, for now it returns an error
  onError('Payments are currently only supported on the Web platform.');
}
