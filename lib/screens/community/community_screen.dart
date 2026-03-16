import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../theme/app_colors.dart';

class CommunityScreen extends StatefulWidget {
  const CommunityScreen({super.key});

  @override
  State<CommunityScreen> createState() => _CommunityScreenState();
}

class _CommunityScreenState extends State<CommunityScreen> {
  final _postCtrl = TextEditingController();
  bool _isComposing = false;
  String _selectedCategory = 'Tip';
  final _categories = ['Tip', 'Review', 'Question', 'Achievement'];

  Future<void> _submitPost() async {
    final text = _postCtrl.text.trim();
    if (text.isEmpty) return;
    
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    try {
      await FirebaseFirestore.instance.collection('posts').add({
        'uid': user.uid,
        'userName': user.displayName ?? 'Volt Driver',
        'userPhoto': user.photoURL,
        'content': text,
        'category': _selectedCategory,
        'likes': [],
        'createdAt': FieldValue.serverTimestamp(),
      });
      
      setState(() {
        _isComposing = false;
        _postCtrl.clear();
      });
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Posted successfully!'), backgroundColor: AppColors.teal));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e'), backgroundColor: AppColors.error));
    }
  }

  Future<void> _toggleLike(String postId, List likes) async {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null) return;

    final docRef = FirebaseFirestore.instance.collection('posts').doc(postId);
    if (likes.contains(uid)) {
      await docRef.update({'likes': FieldValue.arrayRemove([uid])});
    } else {
      await docRef.update({'likes': FieldValue.arrayUnion([uid])});
    }
  }

  @override
  void dispose() {
    _postCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final user = FirebaseAuth.instance.currentUser;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? AppColors.bgDark : AppColors.bgLight;
    final cardBg = isDark ? AppColors.cardDark : AppColors.cardLight;
    final borderCol = isDark ? AppColors.borderDark : AppColors.borderLight;
    final textPri = isDark ? Colors.white : AppColors.textPrimaryLight;
    final textSec = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    final surface = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;

    return Scaffold(
      backgroundColor: bg,
      appBar: AppBar(
        backgroundColor: bg,
        elevation: 0,
        leading: IconButton(icon: Icon(Icons.arrow_back, color: textPri), onPressed: () => context.pop()),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Community', style: Theme.of(context).textTheme.titleMedium?.copyWith(color: textPri, fontWeight: FontWeight.bold)),
            Row(
              children: [
                Container(width: 6, height: 6, decoration: const BoxDecoration(color: AppColors.success, shape: BoxShape.circle)),
                const SizedBox(width: 4),
                Text('342 online', style: TextStyle(color: textSec, fontSize: 11)),
              ],
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          // Composer
          AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            margin: const EdgeInsets.all(16),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: cardBg, borderRadius: BorderRadius.circular(16), border: Border.all(color: borderCol)),
            child: Column(
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    CircleAvatar(
                      radius: 18,
                      backgroundColor: AppColors.teal.withValues(alpha: 0.2),
                      backgroundImage: user?.photoURL != null ? NetworkImage(user!.photoURL!) : null,
                      child: user?.photoURL == null ? const Icon(Icons.person, color: AppColors.teal, size: 20) : null,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextField(
                        controller: _postCtrl,
                        style: TextStyle(color: textPri, fontSize: 14),
                        maxLines: _isComposing ? 4 : 1,
                        decoration: InputDecoration(
                          hintText: 'Share your EV experience...',
                          hintStyle: TextStyle(color: textSec, fontSize: 14),
                          border: InputBorder.none,
                          isDense: true,
                          contentPadding: EdgeInsets.zero,
                        ),
                        onTap: () {
                          if (!_isComposing) setState(() => _isComposing = true);
                        },
                      ),
                    ),
                  ],
                ),
                if (_isComposing) ...[
                  Divider(color: borderCol, height: 24),
                  Row(
                    children: [
                      Expanded(
                        child: SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: Row(
                            children: _categories.map((c) {
                              final sel = _selectedCategory == c;
                              return Padding(
                                padding: const EdgeInsets.only(right: 8),
                                child: InkWell(
                                  borderRadius: BorderRadius.circular(12),
                                  onTap: () => setState(() => _selectedCategory = c),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: sel ? AppColors.teal.withValues(alpha: 0.15) : surface,
                                      border: Border.all(color: sel ? AppColors.teal : borderCol),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Text(c, style: TextStyle(color: sel ? AppColors.teal : textSec, fontSize: 11)),
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(backgroundColor: AppColors.teal, foregroundColor: AppColors.bgDark, minimumSize: const Size(60, 32), padding: EdgeInsets.zero),
                        onPressed: _submitPost,
                        child: const Text('Post', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
          
          Divider(color: borderCol, height: 1),
          
          // Feed
          Expanded(
            child: StreamBuilder<QuerySnapshot>(
              stream: FirebaseFirestore.instance.collection('posts').orderBy('createdAt', descending: true).limit(20).snapshots(),
              builder: (context, snapshot) {
                if (snapshot.hasError) return const Center(child: Text('Error loading feed.', style: TextStyle(color: AppColors.error)));
                if (!snapshot.hasData || snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator(color: AppColors.teal));
                }

                final docs = snapshot.data!.docs;
                if (docs.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.electric_bolt, size: 60, color: borderCol),
                        const SizedBox(height: 16),
                        Text('Be the first to share!', style: TextStyle(color: textSec)),
                      ],
                    ),
                  );
                }

                return ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: docs.length,
                  itemBuilder: (context, index) {
                    final data = docs[index].data() as Map<String, dynamic>;
                    final docId = docs[index].id;
                    final isHtmlOrUnknown = data['createdAt'] == null;
                    
                    final likes = List.from(data['likes'] ?? []);
                    final isLiked = user != null && likes.contains(user.uid);
                    
                    return Container(
                      margin: const EdgeInsets.only(bottom: 16),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(color: cardBg, borderRadius: BorderRadius.circular(16), border: Border.all(color: borderCol)),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              CircleAvatar(
                                radius: 16,
                                backgroundColor: surface,
                                backgroundImage: data['userPhoto'] != null ? NetworkImage(data['userPhoto']) : null,
                                child: data['userPhoto'] == null ? Icon(Icons.person, color: textSec, size: 18) : null,
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(data['userName'] ?? 'User', style: TextStyle(color: textPri, fontWeight: FontWeight.bold, fontSize: 14)),
                                    Text(isHtmlOrUnknown ? 'Just now' : 'Recently', style: TextStyle(color: textSec, fontSize: 11)),
                                  ],
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(color: AppColors.teal.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                                child: Text(data['category'] ?? 'Tip', style: const TextStyle(color: AppColors.teal, fontSize: 10)),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(data['content'] ?? '', style: TextStyle(color: textPri, height: 1.5, fontSize: 14)),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              GestureDetector(
                                onTap: () => _toggleLike(docId, likes),
                                child: Row(
                                  children: [
                                    Icon(isLiked ? Icons.favorite : Icons.favorite_border, color: isLiked ? AppColors.error : textSec, size: 20),
                                    const SizedBox(width: 4),
                                    Text('${likes.length}', style: TextStyle(color: isLiked ? AppColors.error : textSec, fontSize: 13, fontWeight: FontWeight.bold)),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 24),
                              Row(
                                children: [
                                  Icon(Icons.chat_bubble_outline, color: textSec, size: 18),
                                  const SizedBox(width: 4),
                                  Text('0', style: TextStyle(color: textSec, fontSize: 13, fontWeight: FontWeight.bold)),
                                ],
                              ),
                              const Spacer(),
                              Icon(Icons.share_outlined, color: textSec, size: 18),
                            ],
                          ),
                        ],
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
