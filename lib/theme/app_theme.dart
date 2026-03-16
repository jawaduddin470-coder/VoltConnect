import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

class AppTheme {
  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.bgDark,
      primaryColor: AppColors.teal,
      cardColor: AppColors.cardDark,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.teal,
        secondary: AppColors.purple,
        surface: AppColors.surfaceDark,
        error: AppColors.error,
        onPrimary: AppColors.surfaceDark,
        onSecondary: Colors.white,
        onSurface: AppColors.textPrimaryDark,
      ),
      textTheme: _buildTextTheme(Brightness.dark),
      inputDecorationTheme: _buildInputDecorationTheme(Brightness.dark),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppColors.surfaceDark,
        selectedItemColor: AppColors.teal,
        unselectedItemColor: AppColors.textSecondaryDark,
      ),
      elevatedButtonTheme: _buildElevatedButtonTheme(Brightness.dark),
    );
  }

  static ThemeData get lightTheme {
    return ThemeData(
      brightness: Brightness.light,
      scaffoldBackgroundColor: AppColors.bgLight,
      primaryColor: AppColors.teal,
      cardColor: AppColors.cardLight,
      colorScheme: const ColorScheme.light(
        primary: AppColors.teal,
        secondary: AppColors.purple,
        surface: AppColors.surfaceLight,
        error: AppColors.error,
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onSurface: AppColors.textPrimaryLight,
      ),
      textTheme: _buildTextTheme(Brightness.light),
      inputDecorationTheme: _buildInputDecorationTheme(Brightness.light),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppColors.surfaceLight,
        selectedItemColor: AppColors.teal,
        unselectedItemColor: AppColors.textSecondaryLight,
      ),
      elevatedButtonTheme: _buildElevatedButtonTheme(Brightness.light),
    );
  }

  static TextTheme _buildTextTheme(Brightness brightness) {
    final textColor = brightness == Brightness.dark
        ? AppColors.textPrimaryDark
        : AppColors.textPrimaryLight;

    return TextTheme(
      displayLarge: GoogleFonts.spaceGrotesk(color: textColor, fontWeight: FontWeight.bold),
      displayMedium: GoogleFonts.spaceGrotesk(color: textColor, fontWeight: FontWeight.bold),
      displaySmall: GoogleFonts.spaceGrotesk(color: textColor, fontWeight: FontWeight.bold),
      headlineLarge: GoogleFonts.spaceGrotesk(color: textColor, fontWeight: FontWeight.bold),
      headlineMedium: GoogleFonts.spaceGrotesk(color: textColor, fontWeight: FontWeight.w600),
      headlineSmall: GoogleFonts.spaceGrotesk(color: textColor, fontWeight: FontWeight.w600),
      titleLarge: GoogleFonts.spaceGrotesk(color: textColor, fontWeight: FontWeight.w600),
      titleMedium: GoogleFonts.spaceGrotesk(color: textColor, fontWeight: FontWeight.w600),
      titleSmall: GoogleFonts.spaceGrotesk(color: textColor, fontWeight: FontWeight.w500),
      bodyLarge: GoogleFonts.inter(color: textColor),
      bodyMedium: GoogleFonts.inter(color: textColor),
      bodySmall: GoogleFonts.inter(color: textColor),
      labelLarge: GoogleFonts.inter(color: textColor, fontWeight: FontWeight.w500),
      labelMedium: GoogleFonts.inter(color: textColor, fontWeight: FontWeight.w500),
      labelSmall: GoogleFonts.inter(color: textColor, fontWeight: FontWeight.w500),
    );
  }

  static InputDecorationTheme _buildInputDecorationTheme(Brightness brightness) {
    final isDark = brightness == Brightness.dark;
    final fill = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final border = isDark ? AppColors.borderDark : AppColors.borderLight;
    final hint = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;

    return InputDecorationTheme(
      filled: true,
      fillColor: fill,
      hintStyle: GoogleFonts.inter(color: hint),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.teal, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.error),
      ),
    );
  }

  static ElevatedButtonThemeData _buildElevatedButtonTheme(Brightness brightness) {
    return ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.teal,
        foregroundColor: AppColors.bgDark,
        textStyle: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 16),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }
}
