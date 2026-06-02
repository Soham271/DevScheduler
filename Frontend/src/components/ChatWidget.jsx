import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, AlertCircle, X, ChevronDown, CodeSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import '../index.css';

const ChatMessage = ({ role, content }) => {
  const isAI = role === 'ai';

  return (
    <div className={`flex w-full ${isAI ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`flex max-w-[85%] sm:max-w-[85%] ${isAI ? 'flex-row' : 'flex-row-reverse'} gap-3`}>
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isAI ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm' : 'bg-[var(--color-charcoal)] text-white'
          }`}>
          {isAI ? <Bot size={18} /> : <User size={18} />}
        </div>

        <div className={`flex flex-col ${isAI ? 'items-start' : 'items-end'} max-w-full overflow-hidden`}>
          <div className="mb-1 text-xs text-gray-500 font-medium px-1">
            {isAI ? 'DevScheduler AI' : 'You'}
          </div>
          <div className={`relative px-4 py-3 text-sm rounded-2xl ${isAI
            ? 'bg-[rgba(255,255,255,0.95)] border border-[rgba(27,25,23,0.06)] shadow-[var(--shadow-subtle-3)] text-gray-800 rounded-tl-sm'
            : 'bg-[var(--color-charcoal)] text-white rounded-tr-sm'
            }`}>
            {isAI ? (
              <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-[var(--color-charcoal)] prose-pre:text-gray-100 prose-pre:p-3 prose-pre:rounded-lg prose-code:text-amber-600">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            ) : (
              <div className="whitespace-pre-wrap break-words">{content}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hello! I'm your DevScheduler AI coach. Ask me about your upcoming contests, coding activity, or data!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  
  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isLoading, isOpen]);

  
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setError('');

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await api.chatWithAI(userMessage);
      setMessages(prev => [...prev, { role: 'ai', content: response.response }]);
    } catch (err) {
      setError(err.message || "Failed to connect to the AI. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mb-4 flex flex-col w-[380px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-[rgba(252,248,244,0.95)] backdrop-blur-xl rounded-[28px] shadow-[0_24px_48px_rgba(27,25,23,0.12)] border border-[rgba(27,25,23,0.08)] overflow-hidden origin-bottom-right"
          >
            {}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(27,25,23,0.06)] bg-white/60">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-[14px] bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm">
                  <CodeSquare className="text-white" size={18} strokeWidth={2.4} />
                  <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500"></div>
                </div>
                <div>
                  <h2 className="text-base font-bold text-[var(--color-charcoal)] leading-tight">DevScheduler AI</h2>

                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-black/5 hover:text-gray-600 transition-colors"
              >
                <ChevronDown size={20} />
              </button>
            </div>

            {}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {messages.map((msg, index) => (
                <ChatMessage key={index} role={msg.role} content={msg.content} />
              ))}

              {isLoading && (
                <div className="flex w-full justify-start mb-4">
                  <div className="flex max-w-[85%] gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm">
                      <Bot size={18} />
                    </div>
                    <div className="flex flex-col items-start">
                      <div className="mb-1 text-xs text-gray-500 font-medium px-1">DevScheduler AI</div>
                      <div className="px-4 py-3.5 bg-white border border-[rgba(27,25,23,0.06)] shadow-[var(--shadow-subtle-3)] rounded-2xl rounded-tl-sm flex gap-1.5 items-center">
                        <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex w-full justify-center my-4">
                  <div className="bg-red-50 text-red-600 border border-red-100 rounded-xl px-4 py-2 text-[13px] flex items-center gap-2 shadow-sm">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {}
            <div className="p-3 bg-white border-t border-[rgba(27,25,23,0.06)]">
              <div className="relative flex items-end gap-2">
                <div className="relative flex-1 bg-[rgba(250,242,236,0.5)] border border-[rgba(27,25,23,0.08)] rounded-[20px] transition-all focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 overflow-hidden">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask AI anything..."
                    className="w-full max-h-24 min-h-[46px] bg-transparent resize-none py-3 px-4 text-[14px] outline-none text-[var(--color-charcoal)] placeholder-gray-400 custom-scrollbar"
                    rows={1}
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className={`flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[18px] transition-all ${!input.trim() || isLoading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95'
                    }`}
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center h-14 w-14 rounded-full shadow-[0_8px_32px_rgba(245,158,11,0.3)] transition-colors z-50 ${isOpen ? 'bg-[var(--color-charcoal)] text-white hover:bg-black' : 'bg-gradient-to-br from-amber-500 to-orange-600 text-white'
          }`}
        animate={!isOpen ? { y: [0, -6, 0] } : { y: 0 }}
        transition={{
          y: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <CodeSquare size={24} strokeWidth={2.4} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default ChatWidget;
