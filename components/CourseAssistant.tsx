
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, MessageCircle } from 'lucide-react';
import { Course, ChatMessage } from '../types';
import { getCourseTutorResponse } from '../services/geminiService';

interface CourseAssistantProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
}

export const CourseAssistant: React.FC<CourseAssistantProps> = ({ course, isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: '0', 
      role: 'model', 
      text: `Hello! I am the AI Tutor for ${course.title}. How can I help you today? (You can ask in any language!)` 
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatHistoryRef = useRef<{ role: 'user' | 'model', parts: [{ text: string }] }[]>([]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input;
    setInput('');
    setIsLoading(true);

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);
    chatHistoryRef.current.push({ role: 'user', parts: [{ text: userText }] });

    // Call the Course Specific Tutor function
    const aiResponseText = await getCourseTutorResponse(userText, chatHistoryRef.current, course);

    const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: aiResponseText };
    setMessages(prev => [...prev, aiMsg]);
    chatHistoryRef.current.push({ role: 'model', parts: [{ text: aiResponseText }] });
    
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-0">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="bg-white w-full max-w-lg h-[80vh] rounded-2xl shadow-2xl relative z-10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-indigo-600 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
             <div className="bg-white/20 p-2 rounded-lg">
                <Bot size={24} />
             </div>
             <div>
                <h3 className="font-bold text-lg leading-tight">AI Course Tutor</h3>
                <p className="text-xs text-indigo-200">Asking about: {course.title.substring(0, 25)}...</p>
             </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
             <X size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
           {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] p-3 text-sm rounded-2xl whitespace-pre-wrap ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-md' 
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
                 <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-gray-200 shadow-sm flex items-center gap-2">
                   <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                   </div>
                 </div>
              </div>
           )}
           <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100">
           <div className="relative flex items-center">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question about this course..."
                className="w-full pl-4 pr-12 py-3 bg-gray-100 rounded-full text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                disabled={isLoading}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                 <Send size={16} />
              </button>
           </div>
           <p className="text-center text-[10px] text-gray-400 mt-2">AI-generated answers based on course material.</p>
        </div>
      </div>
    </div>
  );
};
