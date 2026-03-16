import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:go_router/go_router.dart';
import '../../theme/app_colors.dart';
import 'package:timeago/timeago.dart' as timeago;

class NotificationPanel extends StatelessWidget {
  const NotificationPanel({super.key});

  Future<void> _markAllRead() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;
    
    final batch = FirebaseFirestore.instance.batch();
    final snapshot = await FirebaseFirestore.instance
        .collection('notifications')
        .doc(user.uid)
        .collection('items')
        .where('isRead', isEqualTo: false)
        .get();
        
    for (var doc in snapshot.docs) {
      batch.update(doc.reference, {'isRead': true});
    }
    await batch.commit();
  }

  void _handleTap(BuildContext context, Map<String, dynamic> data, String id) {
    final user = FirebaseAuth.instance.currentUser;
    if (user != null) {
      FirebaseFirestore.instance
          .collection('notifications')
          .doc(user.uid)
          .collection('items')
          .doc(id)
          .update({'isRead': true});
    }

    // Navigation logic based on type
    final type = data['type'] as String? ?? '';
    if (type == 'queue') context.go('/driver/queue');
    if (type == 'membership') context.go('/membership');
    Navigator.pop(context); // Close sheet
  }

  IconData _getIconForType(String type) {
    switch (type) {
      case 'queue': return Icons.schedule;
      case 'charging': return Icons.bolt;
      case 'membership': return Icons.star;
      case 'station': return Icons.location_on;
      default: return Icons.notifications;
    }
  }

  Color _getColorForType(String type) {
    switch (type) {
      case 'queue': return AppColors.teal;
      case 'charging': return AppColors.success;
      case 'membership': return AppColors.purple;
      case 'station': return AppColors.info;
      default: return AppColors.textSecondaryDark;
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = FirebaseAuth.instance.currentUser;
    
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.bgDark,
        borderRadius: BorderRadius.only(topLeft: Radius.circular(24), topRight: Radius.circular(24)),
      ),
      padding: const EdgeInsets.only(top: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Notifications', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                TextButton(
                  onPressed: _markAllRead,
                  child: const Text('Mark all read', style: TextStyle(color: AppColors.teal)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          const Divider(color: AppColors.borderDark, height: 1),
          Expanded(
            child: user == null
                ? const Center(child: Text('Please sign in', style: TextStyle(color: AppColors.textSecondaryDark)))
                : StreamBuilder<QuerySnapshot>(
                    stream: FirebaseFirestore.instance
                        .collection('notifications')
                        .doc(user.uid)
                        .collection('items')
                        .orderBy('createdAt', descending: true)
                        .limit(20)
                        .snapshots(),
                    builder: (context, snapshot) {
                      if (snapshot.hasError) {
                        return const Center(child: Text('Error loading notifications', style: TextStyle(color: AppColors.error)));
                      }
                      if (snapshot.connectionState == ConnectionState.waiting) {
                        return const Center(child: CircularProgressIndicator(color: AppColors.teal));
                      }

                      final docs = snapshot.data?.docs ?? [];
                      
                      if (docs.isEmpty) {
                        return _buildDemoData(context); // Fallback to demo data if Firestore is empty
                      }

                      return ListView.separated(
                        itemCount: docs.length,
                        separatorBuilder: (context, index) => const Divider(color: AppColors.borderDark, height: 1),
                        itemBuilder: (context, index) {
                          final data = docs[index].data() as Map<String, dynamic>;
                          final id = docs[index].id;
                          return _buildNotificationItem(context, data, id);
                        },
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationItem(BuildContext context, Map<String, dynamic> data, String id) {
    final isRead = data['isRead'] as bool? ?? false;
    final type = data['type'] as String? ?? '';
    final title = data['title'] as String? ?? 'Notification';
    final message = data['message'] as String? ?? '';
    final createdAt = data['createdAt'] as Timestamp?;
    
    final timeString = createdAt != null ? timeago.format(createdAt.toDate()) : 'just now';

    return InkWell(
      onTap: () => _handleTap(context, data, id),
      child: Container(
        padding: const EdgeInsets.all(20),
        color: isRead ? Colors.transparent : AppColors.surfaceDark.withValues(alpha: 0.5),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: AppColors.cardDark, shape: BoxShape.circle, border: Border.all(color: AppColors.borderDark)),
              child: Icon(_getIconForType(type), color: _getColorForType(type), size: 18),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(child: Text(title, style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: isRead ? FontWeight.w500 : FontWeight.bold))),
                      Text(timeString, style: const TextStyle(color: AppColors.textSecondaryDark, fontSize: 11)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    message,
                    style: TextStyle(color: isRead ? AppColors.textSecondaryDark : Colors.white70, fontSize: 13, height: 1.4),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            if (!isRead)
              Container(
                margin: const EdgeInsets.only(left: 12, top: 4),
                width: 8, height: 8,
                decoration: const BoxDecoration(color: AppColors.teal, shape: BoxShape.circle),
              )
          ],
        ),
      ),
    );
  }

  Widget _buildDemoData(BuildContext context) {
    final demoItems = [
      {'type': 'queue', 'title': 'Queue Update', 'message': "You're now #1 in queue at Tata Power EV.", 'isRead': false, 'createdAt': Timestamp.now()},
      {'type': 'membership', 'title': 'Plan Expiring', 'message': "Your Pro plan expires in 3 days. Renew to keep priority access.", 'isRead': true, 'createdAt': Timestamp.fromDate(DateTime.now().subtract(const Duration(hours: 2)))},
      {'type': 'station', 'title': 'New Station', 'message': "A new ultra-fast charger just opened near Hitech City.", 'isRead': true, 'createdAt': Timestamp.fromDate(DateTime.now().subtract(const Duration(days: 1)))},
    ];

    return ListView.separated(
      itemCount: demoItems.length,
      separatorBuilder: (context, index) => const Divider(color: AppColors.borderDark, height: 1),
      itemBuilder: (context, index) {
        return _buildNotificationItem(context, demoItems[index], 'demo_$index');
      },
    );
  }
}
