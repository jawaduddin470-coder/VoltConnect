import React, { useState, useRef, useEffect } from 'react';
import { Zap, X, Send, RefreshCw, ChevronDown } from 'lucide-react';
import { useOpenRouter } from '../hooks/useOpenRouter';

const BotIcon = () => (
    <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0, marginTop: 2,
        background: 'linear-gradient(135deg, #2979FF, #00B4D8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
        <Zap size={14} color="#fff" fill="#fff" />
    </div>
);

const TypingDots = () => (
    <div style={{ display: 'flex', gap: 4, padding: '4px 0' }}>
        {[0, 1, 2].map(i => (
            <div key={i} style={{
                width: 7, height: 7, borderRadius: '50%',
                background: 'var(--accent)',
                animation: `vc-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }} />
        ))}
    </div>
);

const AIChatAssistant = () => {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const { messages, loading, sendMessage, clearMessages } = useOpenRouter();
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (open) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => inputRef.current?.focus(), 150);
        }
    }, [open, messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        sendMessage(input.trim());
        setInput('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const quickPrompts = [
        '⚡ Find chargers near me',
        '📋 View membership plans',
        '🔌 Check availability',
    ];

    return (
        <>
            <style>{`
                @keyframes vc-bounce {
                    0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
                    40% { transform: scale(1); opacity: 1; }
                }
                @keyframes vc-chat-in {
                    from { opacity: 0; transform: scale(0.95) translateY(12px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes vc-pulse-ring {
                    0% { box-shadow: 0 0 0 0 rgba(41,121,255,0.5); }
                    70% { box-shadow: 0 0 0 10px rgba(41,121,255,0); }
                    100% { box-shadow: 0 0 0 0 rgba(41,121,255,0); }
                }
                .vc-chat-bubble { animation: vc-pulse-ring 2.5s ease-out infinite; }
                .vc-chat-bubble:hover { animation: none; }
                .vc-chat-panel { animation: vc-chat-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .vc-ai-msg { animation: fadeInUp 0.3s ease forwards; }
                .vc-quick-btn:hover { background: var(--accent-glow) !important; border-color: var(--accent) !important; color: var(--accent) !important; }
            `}</style>

            {/* ── Chat Panel ── */}
            {open && (
                <div
                    className="vc-chat-panel"
                    style={{
                        position: 'fixed',
                        bottom: 96,
                        right: 20,
                        width: 'min(380px, calc(100vw - 40px))',
                        height: 520,
                        background: 'var(--bg-card)',
                        border: '1px solid var(--bg-border)',
                        borderRadius: 20,
                        boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
                        display: 'flex',
                        flexDirection: 'column',
                        zIndex: 9999,
                        overflow: 'hidden',
                    }}
                >
                    {/* Header */}
                    <div style={{
                        padding: '14px 16px',
                        background: 'linear-gradient(135deg, rgba(41,121,255,0.15), rgba(0,180,216,0.08))',
                        borderBottom: '1px solid var(--bg-border)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        flexShrink: 0,
                    }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #2979FF, #00B4D8)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Zap size={18} color="#fff" fill="#fff" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 15, fontFamily: 'Rajdhani' }}>Volt AI</div>
                            <div style={{ fontSize: 11, color: 'var(--status-green)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--status-green)', display: 'inline-block' }} />
                                Online
                            </div>
                        </div>
                        <button
                            onClick={clearMessages}
                            title="Clear chat"
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 8, display: 'flex' }}
                        >
                            <RefreshCw size={15} />
                        </button>
                        <button
                            onClick={() => setOpen(false)}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 8, display: 'flex' }}
                        >
                            <ChevronDown size={18} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '16px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                    }}>
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className="vc-ai-msg"
                                style={{
                                    display: 'flex',
                                    gap: 8,
                                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                }}
                            >
                                {msg.role === 'assistant' && <BotIcon />}
                                <div style={{
                                    maxWidth: '80%',
                                    padding: '10px 13px',
                                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                    background: msg.role === 'user'
                                        ? 'linear-gradient(135deg, #2979FF, #00B4D8)'
                                        : 'var(--bg-primary)',
                                    color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                                    fontSize: 14,
                                    lineHeight: 1.55,
                                    whiteSpace: 'pre-wrap',
                                    border: msg.role === 'assistant' ? '1px solid var(--bg-border)' : 'none',
                                }}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                <BotIcon />
                                <div style={{
                                    padding: '10px 13px',
                                    background: 'var(--bg-primary)',
                                    border: '1px solid var(--bg-border)',
                                    borderRadius: '16px 16px 16px 4px',
                                }}>
                                    <TypingDots />
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Quick prompts */}
                    {messages.length <= 1 && (
                        <div style={{ padding: '0 14px 10px', display: 'flex', flexWrap: 'wrap', gap: 6, flexShrink: 0 }}>
                            {quickPrompts.map(p => (
                                <button
                                    key={p}
                                    className="vc-quick-btn"
                                    onClick={() => sendMessage(p)}
                                    style={{
                                        fontSize: 12,
                                        padding: '5px 10px',
                                        borderRadius: 20,
                                        background: 'var(--bg-primary)',
                                        border: '1px solid var(--bg-border)',
                                        color: 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div style={{
                        padding: '10px 12px',
                        borderTop: '1px solid var(--bg-border)',
                        display: 'flex',
                        gap: 8,
                        alignItems: 'center',
                        flexShrink: 0,
                    }}>
                        <input
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask Volt anything..."
                            disabled={loading}
                            style={{
                                flex: 1,
                                background: 'var(--bg-primary)',
                                border: '1.5px solid var(--bg-border)',
                                borderRadius: 12,
                                color: 'var(--text-primary)',
                                padding: '9px 13px',
                                fontSize: 14,
                                outline: 'none',
                                transition: 'border-color 0.2s',
                            }}
                            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                            onBlur={e => e.target.style.borderColor = 'var(--bg-border)'}
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            style={{
                                width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                                background: input.trim() ? 'linear-gradient(135deg, #2979FF, #00B4D8)' : 'var(--bg-border)',
                                border: 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: input.trim() ? 'pointer' : 'default',
                                transition: 'all 0.2s',
                            }}
                        >
                            <Send size={16} color="#fff" />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Floating Bubble ── */}
            <button
                className="vc-chat-bubble"
                onClick={() => setOpen(o => !o)}
                title="Ask Volt AI"
                style={{
                    position: 'fixed',
                    bottom: 24,
                    right: 20,
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2979FF, #00B4D8)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9998,
                    boxShadow: '0 8px 24px rgba(41,121,255,0.4)',
                    transition: 'transform 0.2s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
                {open
                    ? <X size={22} color="#fff" />
                    : <Zap size={22} color="#fff" fill="#fff" />
                }
            </button>
        </>
    );
};

export default AIChatAssistant;
