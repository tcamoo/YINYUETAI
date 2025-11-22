import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot } from 'lucide-react';
import { generateRecommendation } from '../services/geminiService';
import { ChatMessage, Track } from '../types';

interface AIChatProps {
  onRecommend: (tracks: Partial<Track>[]) => void;
}

const AIChat: React.FC<AIChatProps> = ({ onRecommend }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'model', text: 'Greetings. I am your curation AI. What vibe are we seeking today?', timestamp: Date.now() }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const result = await generateRecommendation(userMsg.text);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: result.message,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, aiMsg]);
      
      if (result.recommendedTracks.length > 0) {
        onRecommend(result.recommendedTracks);
      }
    } catch (e) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Connection unstable. Unable to process request.",
        timestamp: Date.now()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-deep-space/50 backdrop-blur-md relative font-sans">
      
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center gap-2 text-holo-cyan">
        <Bot size={18} />
        <span className="text-sm font-bold tracking-wider">AI ASSISTANT</span>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                ? 'bg-gradient-to-r from-quantum-purple to-indigo-600 text-white rounded-br-none' 
                : 'bg-white/10 border border-white/5 text-gray-200 rounded-bl-none backdrop-blur-sm'
            }`}>
                {msg.text}
            </div>
          </div>
        ))}
        {loading && (
            <div className="flex items-center gap-2 text-xs text-gray-400 ml-2">
                <Sparkles size={12} className="animate-spin" />
                <span>Processing...</span>
            </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10 bg-black/20">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 focus-within:border-holo-cyan/50 focus-within:bg-white/10 transition-all">
            <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask for a mood or genre..."
                className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 focus:outline-none"
                disabled={loading}
            />
            <button 
                onClick={handleSend} 
                disabled={loading} 
                className="text-holo-cyan hover:text-white disabled:opacity-50 transition-colors"
            >
                <Send size={18} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;