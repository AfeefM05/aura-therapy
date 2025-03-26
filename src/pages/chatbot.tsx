"use client";

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/ui/navbar';
import { Card } from '@/components/ui/card';
import { Send, Bot, Trash2, History } from 'lucide-react';
import '../app/globals.css';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: number;
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState<Message[][]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Load chat history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistoryArchive');
    const savedMessages = localStorage.getItem('chatHistory');

    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory));
    }

    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages);
      setMessages(parsedMessages);
    } else {
      // Initialize with welcome message if no history exists
      const initialMessage: Message = {
        id: crypto.randomUUID(),
        type: 'bot',
        content: "Thank you for completing the assessment. I'm here to support you on your journey to better mental well-being. How can I help you today?",
        timestamp: Date.now()
      };
      setMessages([initialMessage]);
      localStorage.setItem('chatHistory', JSON.stringify([initialMessage]));
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
  }, [messages]);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!userInput.trim()) return;
    
    const userMessage: Message = {
      id: crypto.randomUUID(),
      type: 'user',
      content: userInput,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setUserInput("");

    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: crypto.randomUUID(),
        type: 'bot',
        content: "I understand how you're feeling. Let me suggest some activities that might help you feel better.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const clearHistory = () => {
    const initialMessage: Message = {
      id: crypto.randomUUID(),
      type: 'bot',
      content: "Chat history has been cleared. How can I help you today?",
      timestamp: Date.now()
    };
    
    // Save current messages to chat history archive before clearing
    const updatedHistory = [...chatHistory, messages];
    setChatHistory(updatedHistory);
    localStorage.setItem('chatHistoryArchive', JSON.stringify(updatedHistory));
    
    setMessages([initialMessage]);
  };

  const restoreChatSession = (session: Message[]) => {
    setMessages(session);
    setShowHistory(false);
  };

  const formatTime = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric'
    }).format(timestamp);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12 pt-20">
        <Card className="max-w-4xl mx-auto h-[70vh] flex flex-col bg-white/80 backdrop-blur-lg">
          {/* Chat Header */}
          <div className="p-4 border-b bg-white/50 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Bot className="w-6 h-6" />
              Mind & Soul Assistant
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="btn btn-ghost btn-sm text-gray-500 hover:text-primary flex items-center gap-2"
              >
                <History className="w-4 h-4" />
                {showHistory ? 'Hide History' : 'View History'}
              </button>
              <button
                onClick={clearHistory}
                className="btn btn-ghost btn-sm text-gray-500 hover:text-red-500 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear History
              </button>
            </div>
          </div>

          {/* Chat History Panel */}
          {showHistory && (
            <div className="absolute z-10 top-full mt-2 left-0 right-0 max-h-96 overflow-y-auto">
              <Card className="bg-white shadow-lg">
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Chat History</h3>
                  {chatHistory.length === 0 ? (
                    <p className="text-gray-500">No previous conversations</p>
                  ) : (
                    chatHistory.map((session, index) => (
                      <div 
                        key={index} 
                        className="mb-4 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                        onClick={() => restoreChatSession(session)}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            Conversation from {formatTime(session[0].timestamp)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {session.length} messages
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* Chat Messages */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-6 space-y-4"
          >
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-primary text-white ml-auto'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.type === 'bot' && (
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
                      <Bot className="w-5 h-5" />
                      <span className="text-sm font-medium">Assistant</span>
                    </div>
                  )}
                  <div className="mb-1">{message.content}</div>
                  <div className={`text-xs ${message.type === 'user' ? 'text-white/70' : 'text-gray-500'} text-right`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t bg-white/50">
            <div className="flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 p-3 rounded-lg border focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button 
                onClick={handleSendMessage}
                className="btn btn-primary px-6"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}