import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../services/openrouter_service.dart';

class VoltAIChat extends StatefulWidget {
  const VoltAIChat({super.key});

  @override
  State<VoltAIChat> createState() => _VoltAIChatState();
}

class _VoltAIChatState extends State<VoltAIChat> {
  final _textController = TextEditingController();
  final _scrollController = ScrollController();
  final _aiService = OpenRouterService();
  
  final List<Map<String, String>> _messages = [];
  bool _isTyping = false;

  final List<String> _quickActions = [
    'Find chargers near me',
    'Check my membership',
    'Plan a trip',
    'Calculate charging cost',
  ];

  void _sendMessage(String text) async {
    if (_isTyping) return; // Loading guard
    if (text.trim().isEmpty) return;

    setState(() {
      _messages.add({"role": "user", "content": text});
      _isTyping = true;
    });
    _textController.clear();
    _scrollToBottom();

    final response = await _aiService.sendMessage(_messages);

    if (!mounted) return;
    setState(() {
      _messages.add({"role": "assistant", "content": response});
      _isTyping = false;
    });
    _scrollToBottom();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.8,
      minChildSize: 0.4,
      maxChildSize: 0.9,
      expand: false,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: AppColors.bgDark,
            borderRadius: BorderRadius.only(topLeft: Radius.circular(20), topRight: Radius.circular(20)),
          ),
          child: Column(
            children: [
              // Header
              Container(
                padding: const EdgeInsets.all(16),
                decoration: const BoxDecoration(
                  color: AppColors.cardDark,
                  borderRadius: BorderRadius.only(topLeft: Radius.circular(20), topRight: Radius.circular(20)),
                  border: Border(bottom: BorderSide(color: AppColors.borderDark)),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 32, height: 32,
                      decoration: const BoxDecoration(color: AppColors.teal, shape: BoxShape.circle),
                      alignment: Alignment.center,
                      child: const Text('V', style: TextStyle(color: AppColors.bgDark, fontWeight: FontWeight.bold, fontSize: 16)),
                    ),
                    const SizedBox(width: 12),
                    const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Volt AI', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
                        Text('Online', style: TextStyle(color: AppColors.success, fontSize: 11)),
                      ],
                    ),
                    const Spacer(),
                    IconButton(
                      icon: const Icon(Icons.close, color: AppColors.textSecondaryDark),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
              ),

              // Messages Area
              Expanded(
                child: _messages.isEmpty && !_isTyping
                    ? _buildEmptyState()
                    : ListView.builder(
                        controller: _scrollController,
                        padding: const EdgeInsets.all(16),
                        itemCount: _messages.length + (_isTyping ? 1 : 0),
                        itemBuilder: (context, index) {
                          if (index == _messages.length) {
                            return _buildTypingIndicator();
                          }
                          final msg = _messages[index];
                          final isUser = msg['role'] == 'user';
                          return _buildMessageBubble(msg['content']!, isUser);
                        },
                      ),
              ),

              // Input Area
              Container(
                padding: EdgeInsets.only(left: 16, right: 16, top: 12, bottom: MediaQuery.of(context).viewInsets.bottom + 16),
                decoration: const BoxDecoration(
                  color: AppColors.cardDark,
                  border: Border(top: BorderSide(color: AppColors.borderDark)),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _textController,
                        enabled: !_isTyping, // Disable while loading
                        style: TextStyle(color: _isTyping ? AppColors.textSecondaryDark : Colors.white),
                        decoration: InputDecoration(
                          hintText: _isTyping ? 'Volt is typing...' : 'Ask Volt anything...',
                          hintStyle: const TextStyle(color: AppColors.textSecondaryDark),
                          filled: true,
                          fillColor: AppColors.surfaceDark,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: BorderSide.none),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        ),
                        onSubmitted: _sendMessage,
                      ),
                    ),
                    const SizedBox(width: 12),
                    ValueListenableBuilder<TextEditingValue>(
                      valueListenable: _textController,
                      builder: (context, value, child) {
                        final isEmpty = value.text.trim().isEmpty || _isTyping;
                        return Container(
                          decoration: BoxDecoration(
                            color: isEmpty ? AppColors.surfaceDark : AppColors.teal,
                            shape: BoxShape.circle,
                          ),
                          child: IconButton(
                            icon: Icon(Icons.send, color: isEmpty ? AppColors.textSecondaryDark : AppColors.bgDark, size: 20),
                            onPressed: isEmpty ? null : () => _sendMessage(_textController.text),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.electric_bolt, size: 48, color: AppColors.teal),
            const SizedBox(height: 16),
            const Text('How can I help you today?', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 32),
            Wrap(
              spacing: 8,
              runSpacing: 12,
              alignment: WrapAlignment.center,
              children: _quickActions.map((action) => ActionChip(
                label: Text(action, style: const TextStyle(color: AppColors.teal)),
                backgroundColor: Colors.transparent,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: const BorderSide(color: AppColors.teal)),
                onPressed: () => _sendMessage(action),
              )).toList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMessageBubble(String text, bool isUser) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!isUser) ...[
            Container(
              width: 20, height: 20,
              margin: const EdgeInsets.only(right: 8, top: 4),
              decoration: const BoxDecoration(color: AppColors.teal, shape: BoxShape.circle),
              alignment: Alignment.center,
              child: const Text('V', style: TextStyle(color: AppColors.bgDark, fontWeight: FontWeight.bold, fontSize: 10)),
            ),
          ],
          Flexible(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: isUser ? AppColors.teal : AppColors.surfaceDark,
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(isUser ? 16 : 4),
                  topRight: Radius.circular(isUser ? 4 : 16),
                  bottomLeft: const Radius.circular(16),
                  bottomRight: const Radius.circular(16),
                ),
              ),
              child: Text(
                text,
                style: TextStyle(color: isUser ? AppColors.bgDark : Colors.white, fontSize: 14),
              ),
            ),
          ),
          if (isUser) const SizedBox(width: 28), // balance avatar space
        ],
      ),
    );
  }

  Widget _buildTypingIndicator() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 20, height: 20,
            margin: const EdgeInsets.only(right: 8, top: 4),
            decoration: const BoxDecoration(color: AppColors.teal, shape: BoxShape.circle),
            alignment: Alignment.center,
            child: const Text('V', style: TextStyle(color: AppColors.bgDark, fontWeight: FontWeight.bold, fontSize: 10)),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            decoration: const BoxDecoration(
              color: AppColors.surfaceDark,
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(4),
                topRight: Radius.circular(16),
                bottomLeft: Radius.circular(16),
                bottomRight: Radius.circular(16),
              ),
            ),
            child: _TypingDots(),
          ),
        ],
      ),
    );
  }
}

class _TypingDots extends StatefulWidget {
  @override
  State<_TypingDots> createState() => _TypingDotsState();
}

class _TypingDotsState extends State<_TypingDots> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 1200))..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(3, (index) {
        return AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            final double offset = (index * 0.2);
            double opacity = 0.4 + 0.6 * ((_controller.value - offset).abs() < 0.2 ? 1 : 0);
            return Container(
              margin: const EdgeInsets.symmetric(horizontal: 2),
              width: 6, height: 6,
              decoration: BoxDecoration(
                color: AppColors.textSecondaryDark.withValues(alpha: opacity),
                shape: BoxShape.circle,
              ),
            );
          },
        );
      }),
    );
  }
}
