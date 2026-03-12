import { useState, useCallback } from 'react';

// ─── MCP Tool Stubs ──────────────────────────────────────────────────────────
// These will be replaced by real MCP tool calls in future integration.
const MCP_TOOLS = {
    find_nearby_chargers: async (location) => {
        return `Found 8 EV charging stations near ${location || 'your location'} in Hyderabad. Top stations: HiTec City EV Hub (2.1km, 4 slots available), Banjara Hills Power Station (3.5km, 6 slots). Use the Map page for full details.`;
    },
    check_station_availability: async (stationId) => {
        return `Station status: 5 of 8 chargers currently available. Average wait time is 8 minutes. Fast DC chargers (50kW) available immediately.`;
    },
    get_membership_plans: async () => {
        return `VoltConnect Driver Plans:\n• Free — Basic charger map\n• Silver (₹399/mo) — Queue access, trip planner\n• Gold (₹699/mo) — Priority queue, analytics\n• Platinum (₹1199/mo) — AI planner, unlimited priority`;
    },
};

// ─── System Prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Volt, an intelligent AI assistant for VoltConnect — India's smartest EV charging platform based in Hyderabad.

You help users with:
1. Finding nearby EV charging stations
2. Checking charger availability and wait times  
3. Explaining membership plan benefits
4. Route planning between charging stops
5. Understanding charging costs and savings
6. Vehicle compatibility questions

Available tools you can reference:
- find_nearby_chargers(location): Find EV stations near a location
- check_station_availability(stationId): Check real-time availability  
- get_membership_plans(): List current driver membership plans

Keep responses concise, friendly, and relevant to Hyderabad's EV infrastructure. If you detect a user wants to find chargers, check availability, or learn about plans, mention those specific features.`;

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useOpenRouter = () => {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hi! I'm Volt ⚡ — your VoltConnect AI assistant. I can help you find nearby chargers, check availability, or explain our membership plans. What can I help you with?",
        },
    ]);
    const [loading, setLoading] = useState(false);

    const detectTool = (text) => {
        const lower = text.toLowerCase();
        if (lower.includes('find') || lower.includes('nearby') || lower.includes('station') || lower.includes('charger near'))
            return 'find_nearby_chargers';
        if (lower.includes('available') || lower.includes('availability') || lower.includes('busy') || lower.includes('wait'))
            return 'check_station_availability';
        if (lower.includes('plan') || lower.includes('membership') || lower.includes('subscription') || lower.includes('price') || lower.includes('cost'))
            return 'get_membership_plans';
        return null;
    };

    const sendMessage = useCallback(async (userText) => {
        if (!userText.trim() || loading) return;

        const userMsg = { role: 'user', content: userText };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setLoading(true);

        try {
            // Check if a local MCP tool should handle this
            const toolName = detectTool(userText);
            if (toolName) {
                const toolResult = await MCP_TOOLS[toolName](userText);
                setMessages(prev => [...prev, { role: 'assistant', content: toolResult }]);
                setLoading(false);
                return;
            }

            // Fall back to OpenRouter API
            const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
            if (!apiKey) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: "I'm here to help! For full AI responses, please add your VITE_OPENROUTER_API_KEY to the .env file. In the meantime, try asking me to 'find nearby chargers' or 'show membership plans'!"
                }]);
                setLoading(false);
                return;
            }

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'VoltConnect',
                },
                body: JSON.stringify({
                    model: 'mistralai/mistral-7b-instruct:free',
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        ...updatedMessages.slice(-8), // last 8 messages for context
                    ],
                    max_tokens: 300,
                    temperature: 0.7,
                }),
            });

            const data = await response.json();
            const reply = data?.choices?.[0]?.message?.content || "Sorry, I couldn't get a response. Please try again!";
            setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
        } catch (err) {
            console.error('OpenRouter error:', err);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Sorry, I ran into an issue. Please try again or visit the Map page to explore charging stations directly!"
            }]);
        } finally {
            setLoading(false);
        }
    }, [messages, loading]);

    const clearMessages = useCallback(() => {
        setMessages([{
            role: 'assistant',
            content: "Hi! I'm Volt ⚡ — your VoltConnect AI assistant. How can I help you today?",
        }]);
    }, []);

    return { messages, loading, sendMessage, clearMessages };
};
