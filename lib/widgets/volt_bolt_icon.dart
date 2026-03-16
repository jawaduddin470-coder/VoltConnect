import 'package:flutter/material.dart';

class VoltBoltPainter extends CustomPainter {
  final Color color;
  final bool addHighlight;

  VoltBoltPainter({required this.color, this.addHighlight = false});

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;

    final path = Path()
      ..moveTo(w * 0.60, h * 0.05)
      ..lineTo(w * 0.95, h * 0.05)
      ..lineTo(w * 0.50, h * 0.48)
      ..lineTo(w * 0.72, h * 0.48)
      ..lineTo(w * 0.25, h * 0.95)
      ..lineTo(w * 0.05, h * 0.95)
      ..lineTo(w * 0.42, h * 0.52)
      ..lineTo(w * 0.22, h * 0.52)
      ..close();

    canvas.drawPath(path, Paint()..color = color);

    if (addHighlight) {
      canvas.drawPath(
        path,
        Paint()
          ..color = Colors.white.withValues(alpha: 0.4)
          ..style = PaintingStyle.stroke
          ..strokeWidth = 1.5,
      );
    }
  }

  @override
  bool shouldRepaint(covariant VoltBoltPainter oldDelegate) {
    return oldDelegate.color != color || oldDelegate.addHighlight != addHighlight;
  }
}

class VoltBoltIcon extends StatelessWidget {
  final double size;
  final Color color;
  final bool showGlow;

  const VoltBoltIcon({
    super.key,
    required this.size,
    this.color = const Color(0xFF00D4AA),
    this.showGlow = false,
  });

  @override
  Widget build(BuildContext context) {
    final addHighlight = size >= 36;
    
    Widget icon = CustomPaint(
      size: Size(size * 0.7, size * 0.7),
      painter: VoltBoltPainter(color: color, addHighlight: addHighlight),
    );

    icon = Center(child: icon);

    if (showGlow && size >= 48) {
      return Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF00D4AA).withValues(alpha: 0.5),
              blurRadius: size * 0.4,
              spreadRadius: size * 0.05,
            ),
          ],
        ),
        child: icon,
      );
    }

    return SizedBox(width: size, height: size, child: icon);
  }
}
