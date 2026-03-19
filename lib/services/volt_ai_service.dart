import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'openrouter_service.dart';
import 'station_service.dart';

class VoltAIService extends ChangeNotifier {
  final OpenRouterService _openRouter = OpenRouterService();
  final List<Map<String, String>> _history = [];
  bool _isTyping = false;

  List<Map<String, String>> get history => _history;
  bool get isTyping => _isTyping;

  // Semantic caching for common questions
  final Map<String, String> _cache = {};

  Future<String> ask(String question) async {
    final normalized = question.trim().toLowerCase();
    
    // 1. Check Cache
    if (_cache.containsKey(normalized)) {
      final cached = _cache[normalized]!;
      _history.add({"role": "user", "content": question});
      _history.add({"role": "assistant", "content": cached});
      notifyListeners();
      return cached;
    }

    _isTyping = true;
    _history.add({"role": "user", "content": question});
    notifyListeners();

    try {
      // 2. Fetch Context (e.g. Nearby Stations)
      // For simplicity, we just add a small snippet of live-ish data
      String contextBoost = "";
      if (normalized.contains("charger") || normalized.contains("station") || normalized.contains("near")) {
        contextBoost = "\nContext: You have access to real-time maps. Current popular hubs are Ather Grid Hitech City (50kW) and Tata Power Banjara Hills (60kW).";
      }

      // 3. Call LLM via OpenRouter
      // We pass the history but wrap it to include our specialized system prompt
      final response = await _openRouter.sendMessage(_history);
      
      final finalResponse = _processResponse(response);
      _history.add({"role": "assistant", "content": finalResponse});
      _cache[normalized] = finalResponse;
      
      return finalResponse;
    } catch (e) {
      return "I'm having a small connection spark. Try asking again in a second!";
    } finally {
      _isTyping = false;
      notifyListeners();
    }
  }

  String _processResponse(String raw) {
    if (raw.contains("not configured")) return raw;
    // Clean up or format if needed
    return raw.trim();
  }

  void clearHistory() {
    _history.clear();
    notifyListeners();
  }
}
