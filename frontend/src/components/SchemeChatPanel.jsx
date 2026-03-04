import { useState, useEffect, useRef } from 'react';
import { BottomSheet } from './BottomSheet';
import { api } from '../services/api';
import { Message, Bubble, LoadingDots } from './Message';

export function SchemeChatPanel({ scheme, isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = { type: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.type, content: m.content }));
      const data = await api.schemeChat(scheme.slug, input, history);
      
      setMessages(prev => [...prev, { type: 'bot', content: data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { type: 'bot', content: `Error: ${err.message}` }]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Scheme Advisor">
      <div className="flex flex-col h-[70vh]">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-[#e2dcd4]">
          <div className="w-9 h-9 rounded-full bg-[#0f1f6e] flex items-center justify-center text-lg flex-shrink-0">
            🏛️
          </div>
          <h3 className="text-[#0f1f6e] font-bold text-sm flex-1">Scheme Advisor</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5 min-h-[200px]">
          {messages.length === 0 && (
            <Message type="bot">
              <Bubble type="bot">
                Ask me anything about {scheme?.name}!
              </Bubble>
            </Message>
          )}
          
          {messages.map((msg, i) => (
            <Message key={i} type={msg.type}>
              <Bubble type={msg.type}>{msg.content}</Bubble>
            </Message>
          ))}
          
          {loading && (
            <Message type="bot">
              <LoadingDots />
            </Message>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3.5 border-t border-[#e2dcd4] flex gap-2 flex-shrink-0 bg-white">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Yojana ke baare mein kuch poochein…"
            className="flex-1 px-4 py-2.5 rounded-full border-2 border-[#e2dcd4] text-sm outline-none focus:border-[#e8570a] bg-[#f5f0ea]"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="w-10 h-10 rounded-full bg-[#e8570a] text-white flex items-center justify-center flex-shrink-0 hover:bg-[#c44a00] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
