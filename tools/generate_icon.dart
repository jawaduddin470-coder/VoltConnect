// ignore_for_file: avoid_print, prefer_const_declarations
import 'dart:io';
import 'dart:ui' as ui;
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('Generate App Icon', (WidgetTester tester) async {
    final recorder = ui.PictureRecorder();
    final canvas = Canvas(recorder);
    final size = const Size(1024, 1024);

    // Background
    final bgRect = RRect.fromRectAndRadius(
      Offset.zero & size,
      const Radius.circular(230),
    );
    canvas.drawRRect(
      bgRect,
      Paint()..color = const Color(0xFF0A0A0A),
    );

    // Outer ring
    canvas.drawCircle(
      const Offset(512, 512),
      440,
      Paint()
        ..color = const Color(0xFF00D4AA).withValues(alpha: 0.3)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 3,
    );

    // Bolt path
    final boltPath = Path()
      ..moveTo(600, 80)
      ..lineTo(750, 80)
      ..lineTo(430, 500)
      ..lineTo(620, 500)
      ..lineTo(280, 940)
      ..lineTo(260, 940)
      ..lineTo(420, 560)
      ..lineTo(240, 560)
      ..close();

    // Bolt body
    canvas.drawPath(
      boltPath,
      Paint()..color = const Color(0xFF0D1A0D),
    );

    // Neon green edge
    canvas.drawPath(
      boltPath,
      Paint()
        ..color = const Color(0xFF39FF14)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 3,
    );

    // Inner bright center line
    canvas.drawLine(
      const Offset(530, 120),
      const Offset(360, 880),
      Paint()
        ..color = const Color(0xFFAAFFAA).withValues(alpha: 0.9)
        ..strokeWidth = 2,
    );

    // Sparks
    final sparks = [
      const Offset(290, 200), const Offset(720, 180), const Offset(760, 400),
      const Offset(680, 560), const Offset(300, 700), const Offset(250, 820),
      const Offset(350, 920), const Offset(500, 90), const Offset(680, 130),
      const Offset(740, 600), const Offset(310, 460), const Offset(270, 550),
    ];
    final rand = math.Random(123);
    for (final spark in sparks) {
      final radius = 2.0 + rand.nextDouble() * 2.0;
      final alpha = 0.6 + rand.nextDouble() * 0.3;
      canvas.drawCircle(
        spark,
        radius,
        Paint()..color = const Color(0xFF39FF14).withValues(alpha: alpha),
      );
    }

    // Teal arc accent
    final arcRect = Rect.fromCircle(center: const Offset(512, 512), radius: 400);
    canvas.drawArc(
      arcRect,
      30 * math.pi / 180, // Start angle
      100 * math.pi / 180, // Sweep
      false,
      Paint()
        ..color = const Color(0xFF00D4AA).withValues(alpha: 0.7)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2,
    );

    final picture = recorder.endRecording();
    final image = await picture.toImage(1024, 1024);
    final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
    
    if (byteData != null) {
      final buffer = byteData.buffer.asUint8List();
      final dir = Directory('assets/icons');
      if (!dir.existsSync()) {
        dir.createSync(recursive: true);
      }
      File('assets/icons/app_icon.png').writeAsBytesSync(buffer);
      File('assets/icons/app_icon_fg.png').writeAsBytesSync(buffer);
      print('Icons generated successfully.');
    } else {
      print('Failed to generate image bytes.');
    }
  });
}
