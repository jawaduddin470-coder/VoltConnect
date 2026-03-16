/// Conditionally exports the correct payment implementation based on the platform.
/// This avoids `dart:html` compilation errors on non-web platforms.
export 'payment_stub.dart' if (dart.library.html) 'payment_web.dart';
