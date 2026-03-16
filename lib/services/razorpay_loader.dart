import 'dart:async';
import 'dart:html' as html;
import 'dart:js_util' as js_util;
import 'package:flutter/foundation.dart';

class RazorpayLoader {
  static const String _scriptUrl = "https://checkout.razorpay.com/v1/checkout.js";
  static bool _isLoaded = false;
  static Completer<bool>? _loadCompleter;

  /// Loads the Razorpay SDK dynamically into the browser.
  /// Returns [true] if successfully loaded or already present.
  static Future<bool> load() async {
    // Only applies to Web
    if (!kIsWeb) return true;

    // We use a try-catch for the import/usage of js_util to be safe 
    // across different analyzer configurations.
    try {
      if (js_util.hasProperty(html.window, 'Razorpay')) {
        _isLoaded = true;
        return true;
      }
    } catch (_) {}

    if (_isLoaded) return true;

    // Prevent multiple parallel loads
    if (_loadCompleter != null) return _loadCompleter!.future;

    _loadCompleter = Completer<bool>();

    try {
      debugPrint("VoltConnect: Loading Razorpay SDK...");
      
      final script = html.ScriptElement()
        ..src = _scriptUrl
        ..async = true
        ..type = 'text/javascript';

      script.onLoad.listen((_) {
        debugPrint("VoltConnect: Razorpay SDK loaded successfully.");
        _isLoaded = true;
        _loadCompleter!.complete(true);
      });

      script.onError.listen((_) {
        debugPrint("VoltConnect: Failed to load Razorpay SDK.");
        _loadCompleter!.complete(false);
        _loadCompleter = null; // Allow retry
      });

      html.document.body!.append(script);
    } catch (e) {
      debugPrint("VoltConnect: Error injecting Razorpay script: $e");
      _loadCompleter!.complete(false);
      _loadCompleter = null;
    }

    return _loadCompleter!.future;
  }
}
