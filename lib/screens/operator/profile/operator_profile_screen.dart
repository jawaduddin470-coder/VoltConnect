import 'dart:io';
import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:image_picker/image_picker.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:go_router/go_router.dart';
import '../../../../theme/app_colors.dart';
import '../../../../widgets/volt_logo.dart';
import '../../../../widgets/app_footer.dart';

class OperatorProfileScreen extends StatefulWidget {
  const OperatorProfileScreen({super.key});

  @override
  State<OperatorProfileScreen> createState() => _OperatorProfileScreenState();
}

class _OperatorProfileScreenState extends State<OperatorProfileScreen> {
  final _auth = FirebaseAuth.instance;
  final _firestore = FirebaseFirestore.instance;
  final _storage = FirebaseStorage.instance;
  
  bool _isEditing = false;
  bool _isLoading = false;
  
  late TextEditingController _businessNameCtrl;
  late TextEditingController _contactEmailCtrl;
  late TextEditingController _phoneCtrl;

  @override
  void initState() {
    super.initState();
    _businessNameCtrl = TextEditingController(text: _auth.currentUser?.displayName ?? '');
    _contactEmailCtrl = TextEditingController(text: _auth.currentUser?.email ?? '');
    _phoneCtrl = TextEditingController(text: '');
    _loadProfileData();
  }

  Future<void> _loadProfileData() async {
    final user = _auth.currentUser;
    if (user == null) return;
    
    final doc = await _firestore.collection('users').doc(user.uid).get();
    if (doc.exists) {
      if (mounted) {
        setState(() {
          _businessNameCtrl.text = doc.data()?['businessName'] ?? user.displayName ?? '';
          _contactEmailCtrl.text = doc.data()?['contactEmail'] ?? user.email ?? '';
          _phoneCtrl.text = doc.data()?['phone'] ?? '';
        });
      }
    }
  }

  @override
  void dispose() {
    _businessNameCtrl.dispose();
    _contactEmailCtrl.dispose();
    _phoneCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickAndUploadImage() async {
    final user = _auth.currentUser;
    if (user == null) return;

    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.gallery, maxWidth: 400, maxHeight: 400, imageQuality: 80);
    
    if (pickedFile == null) return;

    setState(() => _isLoading = true);

    try {
      final file = File(pickedFile.path);
      final ref = _storage.ref().child('users/${user.uid}/profile.jpg');
      await ref.putFile(file);
      final url = await ref.getDownloadURL();

      await user.updatePhotoURL(url);
      await _firestore.collection('users').doc(user.uid).update({'photoUrl': url});

      setState(() {}); 
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Upload failed: $e'), backgroundColor: AppColors.error));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _saveProfile() async {
    final user = _auth.currentUser;
    if (user == null) return;

    setState(() => _isLoading = true);
    try {
      await user.updateDisplayName(_businessNameCtrl.text);
      await _firestore.collection('users').doc(user.uid).update({
        'name': _businessNameCtrl.text,
        'businessName': _businessNameCtrl.text,
        'contactEmail': _contactEmailCtrl.text,
        'phone': _phoneCtrl.text,
      });
      setState(() => _isEditing = false);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Save failed: $e'), backgroundColor: AppColors.error));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _signOut() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) {
        final isDark = Theme.of(context).brightness == Brightness.dark;
        final card = isDark ? AppColors.cardDark : AppColors.cardLight;
        final textPri = isDark ? Colors.white : AppColors.textPrimaryLight;
        final textSec = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
        return AlertDialog(
          backgroundColor: card,
          title: Text('Sign Out', style: TextStyle(color: textPri)),
          content: Text('Are you sure you want to sign out?', style: TextStyle(color: textSec)),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context, false), child: Text('Cancel', style: TextStyle(color: textSec))),
            TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Sign Out', style: TextStyle(color: AppColors.error))),
          ],
        );
      },
    );

    if (confirm == true) {
      await _auth.signOut();
      if (mounted) context.go('/auth');
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = _auth.currentUser;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? AppColors.bgDark : AppColors.bgLight;
    final cardBg = isDark ? AppColors.cardDark : AppColors.cardLight;
    final borderCol = isDark ? AppColors.borderDark : AppColors.borderLight;
    final textPri = isDark ? Colors.white : AppColors.textPrimaryLight;
    final textSec = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    final surface = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;

    if (user == null) return Scaffold(backgroundColor: bg, body: const Center(child: CircularProgressIndicator()));

    return Scaffold(
      backgroundColor: bg,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(icon: Icon(Icons.arrow_back, color: textPri), onPressed: () => context.pop()),
        actions: [
          IconButton(
            icon: Icon(_isEditing ? Icons.close : Icons.edit, color: textPri),
            onPressed: () {
              if (_isEditing) _loadProfileData(); // Reset on cancel
              setState(() => _isEditing = !_isEditing);
            },
          )
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  const VoltLogo(size: VoltLogoSize.medium),
            const SizedBox(height: 24),
            // Top Section
            Stack(
              alignment: Alignment.center,
              children: [
                GestureDetector(
                  onTap: _isEditing ? _pickAndUploadImage : null,
                  child: CircleAvatar(
                    radius: 40,
                    backgroundColor: surface,
                    backgroundImage: user.photoURL != null ? NetworkImage(user.photoURL!) : null,
                    child: user.photoURL == null
                        ? Text(user.displayName?.isNotEmpty == true ? user.displayName![0].toUpperCase() : 'B', style: const TextStyle(color: AppColors.teal, fontSize: 32, fontWeight: FontWeight.bold))
                        : null,
                  ),
                ),
                if (_isEditing)
                  Positioned(
                    bottom: 0, right: 0,
                    child: Container(
                       padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(color: AppColors.teal, shape: BoxShape.circle),
                      child: Icon(Icons.camera_alt, color: bg, size: 16),
                    ),
                  ),
                if (_isLoading)
                  const Positioned.fill(child: CircularProgressIndicator(color: AppColors.teal, strokeWidth: 2)),
              ],
            ),
            const SizedBox(height: 16),
            
            Text(_businessNameCtrl.text.isEmpty ? 'Operator' : _businessNameCtrl.text, style: TextStyle(color: textPri, fontSize: 20, fontFamily: 'Space Grotesk', fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text(user.email ?? '', style: TextStyle(color: textSec, fontSize: 13)),
            
            const SizedBox(height: 16),
            StreamBuilder<DocumentSnapshot>(
              stream: _firestore.collection('users').doc(user.uid).snapshots(),
              builder: (context, snapshot) {
                final isVerified = snapshot.data?.data() != null && (snapshot.data!.data() as Map<String, dynamic>)['verified'] == true;
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: isVerified ? AppColors.success.withValues(alpha: 0.1) : AppColors.warning.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: isVerified ? AppColors.success : AppColors.warning),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(isVerified ? Icons.verified : Icons.pending_actions, size: 14, color: isVerified ? AppColors.success : AppColors.warning),
                      const SizedBox(width: 6),
                      Text(isVerified ? 'Verified Partner' : 'Pending Verification', style: TextStyle(color: isVerified ? AppColors.success : AppColors.warning, fontSize: 12, fontWeight: FontWeight.bold)),
                    ],
                  ),
                );
              },
            ),

            const SizedBox(height: 32),

            // Form or Display
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: cardBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: borderCol),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Business Profile', style: TextStyle(color: textPri, fontSize: 16, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 20),
                  _buildField('Business Name', _businessNameCtrl, isDark, textPri, textSec, borderCol),
                  Divider(color: borderCol, height: 24),
                  _buildField('Contact Email', _contactEmailCtrl, isDark, textPri, textSec, borderCol, isEmail: true),
                  Divider(color: borderCol, height: 24),
                  _buildField('Phone Number', _phoneCtrl, isDark, textPri, textSec, borderCol, isPhone: true),
                  
                  if (_isEditing) ...[
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(backgroundColor: AppColors.teal, foregroundColor: AppColors.bgDark, padding: const EdgeInsets.symmetric(vertical: 14)),
                        onPressed: _isLoading ? null : _saveProfile,
                        child: const Text('Save Changes', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Stats
            Container(
              padding: const EdgeInsets.symmetric(vertical: 20),
              decoration: BoxDecoration(
                color: cardBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: borderCol),
              ),
              child: Row(
                children: [
                  _buildStat('Total Stations', '4', null, isDark, textPri, textSec),
                  Container(width: 1, height: 40, color: borderCol),
                  _buildStat('Total Revenue', '₹42.5k', AppColors.success, isDark, textPri, textSec),
                  Container(width: 1, height: 40, color: borderCol),
                  _buildStat('Avg Rating', '4.8 ★', Colors.amber, isDark, textPri, textSec),
                ],
              ),
            ),

            const SizedBox(height: 48),

            // Sign Out
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.error,
                  side: BorderSide(color: AppColors.error.withValues(alpha: 0.5)),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: _signOut,
                child: const Text('Sign Out', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
                ],
              ),
            ),
            const SizedBox(height: 48),
            const AppFooter(),
          ],
        ),
      ),
    );
  }

  Widget _buildField(String label, TextEditingController controller, bool isDark, Color textPri, Color textSec, Color borderCol, {bool isEmail = false, bool isPhone = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: TextStyle(color: textSec, fontSize: 12)),
        const SizedBox(height: 6),
        if (_isEditing)
          TextField(
            controller: controller,
            keyboardType: isEmail ? TextInputType.emailAddress : (isPhone ? TextInputType.phone : TextInputType.text),
            style: TextStyle(color: textPri, fontSize: 14),
            decoration: InputDecoration(
              isDense: true,
              contentPadding: const EdgeInsets.symmetric(vertical: 8),
              border: UnderlineInputBorder(borderSide: BorderSide(color: borderCol)),
              enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: borderCol)),
              focusedBorder: const UnderlineInputBorder(borderSide: BorderSide(color: AppColors.teal)),
            ),
          )
        else
          Text(controller.text.isEmpty ? 'Not provided' : controller.text, style: TextStyle(color: textPri, fontSize: 14)),
      ],
    );
  }

  Widget _buildStat(String label, String value, Color? valueColor, bool isDark, Color textPri, Color textSec) {
    return Expanded(
      child: Column(
        children: [
          Text(value, style: TextStyle(color: valueColor ?? textPri, fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(label, style: TextStyle(color: textSec, fontSize: 11)),
        ],
      ),
    );
  }
}
