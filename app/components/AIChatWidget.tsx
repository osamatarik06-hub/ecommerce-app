'use client';

import { useState, useRef, useEffect } from 'react';

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: 'Hi there! I am Velvet AI assistant. How can I help you shop today?' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: userMessage }] }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-[#3B2F2F] text-[#FAF3E0] px-5 py-3.5 rounded-full shadow-lg hover:bg-[#241B1B] transition-all hover:scale-105 border border-[#D8C7B5]/30 text-xs font-bold uppercase tracking-widest"
        >
          <span>💬</span>
          <span>AI</span>
        </button>
      ) : (
        <div className="w-[360px] h-[500px] bg-[#FFFDF8] border border-[#D8C7B5] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="bg-[#3B2F2F] text-[#FAF3E0] px-5 py-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm tracking-wide">Velvet Support AI</h3>
              <p className="text-[10px] text-[#FAF3E0]/70">Ask me anything about our store & products</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#FAF3E0]/70 hover:text-white text-lg font-bold px-2 py-1"
            >
              &times;
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAF3E0]/30">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-[#3B2F2F] text-[#FAF3E0] rounded-br-none'
                      : 'bg-white text-[#3B2F2F] border border-[#D8C7B5] rounded-bl-none shadow-xs'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-[#6F4E57] border border-[#D8C7B5] rounded-2xl rounded-bl-none px-4 py-2.5 text-xs animate-pulse">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 border-t border-[#D8C7B5] bg-[#FFFDF8] flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a question..."
              className="flex-1 bg-[#FAF3E0]/50 border border-[#D8C7B5] rounded-xl px-3 py-2 text-xs text-[#3B2F2F] outline-none focus:border-[#C07C56]"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#C07C56] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#b06c48] transition-colors disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}