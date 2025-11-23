import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Sparkles, X, Minimize2 } from 'lucide-react';
import { ChatMessage, Course } from '../types';
import { getCourseRecommendation } from '../services/geminiService';

interface AIAdvisorProps {
  courses: Course[];
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ courses }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'model', text: 'Hi there! I\'m Omni, your AI academic advisor. Tell me about your career goals or what you want to learn, and I\'ll recommend the best courses for you.' }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Ref to store history for API context (mapped from messages)
  const chatHistoryRef = useRef<{ role: 'user' | 'model', parts: [{ text: string }] }[]>([]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input;
    setInput('');
    setIsLoading(true);

    // Optimistic update
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);
    
    // Update history ref
    chatHistoryRef.current.push({ role: 'user', parts: [{ text: userText }] });

    const aiResponseText = await getCourseRecommendation(userText, chatHistoryRef.current, courses);

    const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: aiResponseText };
    setMessages(prev => [...prev, aiMsg]);

    // Update history ref with AI response
    chatHistoryRef.current.push({ role: 'model', parts: [{ text: aiResponseText }] });
    
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-lg shadow-indigo-500/30 hover:scale-110 transition-transform flex items-center gap-2 group"
      >
        <Sparkles size={24} className="animate-pulse" />
        <span className="font-bold hidden group-hover:block max-w-0 group-hover:max-w-xs overflow-hidden transition-all duration-500 whitespace-nowrap">
          Ask AI Advisor
        </span>
      </button>
    );
  }

  return (
    <div 
      className={`fixed z-40 bg-white shadow-2xl border border-gray-200 transition-all duration-300 flex flex-col overflow-hidden
        ${isMinimized 
          ? 'bottom-6 right-6 w-72 h-14 rounded-t-xl rounded-b-none' 
          : 'bottom-6 right-6 w-[90vw] sm:w-[380px] h-[500px] sm:h-[600px] rounded-2xl'
        }
      `}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between text-white shrink-0 cursor-pointer" onClick={() => !isMinimized && setIsMinimized(true)}>
        <div className="flex items-center gap-2">
           <div className="p-1 bg-white/20 rounded-lg">
             <Sparkles size={18} />
           </div>
           <div>
             <h3 className="font-bold text-sm">Omni Advisor</h3>
             <p className="text-[10px] text-indigo-100">Powered by Gemini</p>
           </div>
        </div>
        <div className="flex items-center gap-2">
          {isMinimized ? (
             <button onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }} className="hover:bg-white/20 p-1 rounded">
               <MessageCircle size={18} />
             </button>
          ) : (
            <button onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }} className="hover:bg-white/20 p-1 rounded">
              <Minimize2 size={18} />
            </button>
          )}
          <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Body */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] p-3 text-sm rounded-2xl whitespace-pre-wrap ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  {msg.role === 'model' && <Sparkles size={12} className="mb-1 text-purple-500 inline-block mr-1" />}
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
               <div className="flex justify-start">
                 <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-gray-200 shadow-sm flex items-center gap-1">
                   <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                   <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                   <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                 </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                disabled={isLoading}
                className="w-full pl-4 pr-12 py-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <button 
                onClick={handleSend} 
                disabled={!input.trim() || isLoading}
                className="absolute right-2 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-[10px] text-center text-gray-400 mt-2">
              AI can make mistakes. Please verify course details.
            </p>
          </div>
        </>
      )}
    </div>
  );
};