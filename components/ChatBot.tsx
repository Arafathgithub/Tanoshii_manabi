import React, { useRef, useEffect, useState } from 'react';
import { ChatMessage } from '../types';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { XMarkIcon } from './icons/XMarkIcon';

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onClose, messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-28 right-8 w-full max-w-md h-[70vh] max-h-[600px] z-50 animate-slide-in">
      <div className="flex flex-col h-full bg-gray-800 rounded-2xl shadow-2xl border border-gray-700">
        <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <h3 className="text-lg font-bold text-white">LearnSphere Assistant</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-brand-secondary flex-shrink-0" />}
                <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-brand-primary text-white rounded-br-lg' : 'bg-gray-700 text-gray-200 rounded-bl-lg'}`}>
                  <p className="text-sm break-words">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
               <div className="flex items-end gap-2 justify-start">
                 <div className="w-8 h-8 rounded-full bg-brand-secondary flex-shrink-0" />
                 <div className="max-w-[80%] p-3 rounded-2xl bg-gray-700 text-gray-200 rounded-bl-lg">
                   <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></span>
                      <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                      <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                   </div>
                 </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>

        <footer className="p-4 border-t border-gray-700 flex-shrink-0">
          <div className="flex items-center bg-gray-700 rounded-lg">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question..."
              className="w-full p-3 bg-transparent focus:outline-none text-white"
              disabled={isLoading}
            />
            <button onClick={handleSend} disabled={isLoading || !input.trim()} className="p-3 text-white disabled:text-gray-500 hover:text-brand-accent disabled:cursor-not-allowed transition-colors">
              <PaperAirplaneIcon className="w-6 h-6" />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ChatBot;
