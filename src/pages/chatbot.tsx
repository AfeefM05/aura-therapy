"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Bot, Trash2, Plus, Sparkles, HeartPulse, Brain, BookOpen, 
  Home, MessageCircle, Activity, LayoutDashboard, Link as LinkIcon, Mic,
  Menu, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import '../app/globals.css';
import router from 'next/router';
import { getUserData, updateUserData } from '@/utils/userStorage';
import QuickStartCardsComponent from '@/components/QuickStartCards';

// Message Interface
interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: number;
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Message[][]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [lastTranscript, setLastTranscript] = useState('');
  
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.username) {
      const data = getUserData(currentUser.username);
      if (data) {
        setUserData(data);
        setChatHistory(data.chatHistory || []);
      } else {
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.interimResults = true;
      recog.lang = 'en-US';

      recog.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript.trim();
        if (event.results[0].isFinal) {
          if (transcript && transcript !== lastTranscript) {
            setInput(prevInput => prevInput + ' ' + transcript);
            setLastTranscript(transcript);
          }
        }
      };

      recog.onend = () => {
        setIsListening(false);
        startListening();
      };

      recog.onerror = (event: SpeechRecognitionError) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      setRecognition(recog);
    } else {
      console.error('Speech recognition not supported in this browser.');
    }
  }, [lastTranscript]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      type: 'user',
      content: input,
      timestamp: Date.now()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/therapy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: input,
          history: updatedMessages.map(m => ({
            role: m.type,
            content: m.content
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response from AI.');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      const botMessage: Message = {
        id: crypto.randomUUID(),
        type: 'bot',
        content: '',
        timestamp: Date.now()
      };

      const messagesWithBot = [...updatedMessages, botMessage];
      setMessages(messagesWithBot);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.text) {
              botMessage.content += data.text;
              setMessages(prev => [...prev.slice(0, -1), { ...botMessage }]);
            }
          } catch (e) {
            console.error('Error parsing chunk:', e);
          }
        }
      }

      // Update user's chat history
      const updatedHistory = messages.length === 0 
        ? [...chatHistory, messagesWithBot]
        : chatHistory.map(chat => 
            chat.length > 0 && messages.length > 0 && chat[0].id === messages[0].id 
              ? messagesWithBot 
              : chat
          );

      setChatHistory(updatedHistory);
      
      // Update user data
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (currentUser.username) {
        updateUserData(currentUser.username, {
          chatHistory: updatedHistory
        });
      }

    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        type: 'bot',
        content: "I apologize, but I'm having trouble processing your message right now. Please try again later.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadChat = (chat: Message[]) => {
    const chatCopy = chat.map(msg => ({ ...msg }));
    setMessages(chatCopy);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const deleteChat = (index: number) => {
    const updatedHistory = chatHistory.filter((_, i) => i !== index);
    setChatHistory(updatedHistory);
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.username) {
      updateUserData(currentUser.username, {
        chatHistory: updatedHistory
      });
    }
    
    if (messages.length > 0 && messages[0].id === chatHistory[index][0].id) {
      setMessages([]);
    }
  };

  const startNewChat = () => {
    const newChat: Message[] = [];
    setMessages(newChat);
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.username) {
      updateUserData(currentUser.username, {
        chatHistory: [...chatHistory, newChat]
      });
    }
    
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const startListening = () => {
    if (recognition) {
      setIsListening(true);
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Quick Start Prompts
  const quickStartPrompts = [
    { text: "I've been feeling anxious lately. Can you help me understand why?", icon: <HeartPulse size={40} /> },
    { text: "What are some effective techniques for managing stress?", icon: <Sparkles size={40} /> },
    { text: "I'd like to improve my sleep quality. Any suggestions?", icon: <BookOpen size={40} /> },
    { text: "How can I practice more self-compassion?", icon: <Brain size={40} /> }
  ];

  return (
    <div className={`h-[100dvh] w-full flex flex-col ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
      {/* Top Navigation Bar */}
      <div className={`flex items-center justify-between px-4 py-3 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white border-b border-slate-200'} z-10`}>
        <div className="flex items-center">
          <button 
            onClick={toggleSidebar}
            className={`mr-2 p-2 rounded-full ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
          <div className="flex items-center gap-2">
            <Brain className={`w-6 h-6 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
            <span className="font-bold text-lg">Aura Therapy</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
            <LayoutDashboard size={20} />
          </Link>
          <Link href="/suggestions" className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
            <Activity size={20} />
          </Link>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
          >
            {theme === 'dark' ? 
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> : 
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            }
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '300px', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex-shrink-0 h-full ${theme === 'dark' ? 'bg-slate-800 border-r border-slate-700' : 'bg-slate-50 border-r border-slate-200'} overflow-hidden`}
            >
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                  <h2 className="font-semibold">Chat History</h2>
                  <button 
                    onClick={startNewChat}
                    className={`p-2 rounded-full ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'}`}
                  >
                    <Plus size={18} />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {chatHistory.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-400">
                      No conversation history yet
                    </div>
                  ) : (
                    <div className="space-y-1 p-2">
                      {chatHistory.map((chat, index) => (
                        <div 
                          key={index}
                          onClick={() => loadChat(chat)}
                          className={`p-3 rounded-lg cursor-pointer flex items-start justify-between ${
                            messages.length > 0 && messages[0].id === chat[0]?.id
                              ? theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-100'
                              : theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-200'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <MessageCircle size={16} className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} />
                              <p className="font-medium truncate">
                                {chat[0]?.content?.substring(0, 20) || `Chat ${index + 1}`}
                              </p>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 truncate">
                              {chat.length > 0 
                                ? new Date(chat[0]?.timestamp || Date.now()).toLocaleString() 
                                : 'New chat'}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteChat(index);
                            }}
                            className={`p-1 rounded-full ${theme === 'dark' ? 'hover:bg-red-900/30' : 'hover:bg-red-100'}`}
                          >
                            <Trash2 size={14} className="text-red-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Messages */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center">
                <div className={`max-w-lg mx-auto text-center ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                  <div className="mb-8">
                    <div className="flex justify-center mb-4">
                      <HeartPulse size={48} className={`${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
                    </div>
                    <h1 className="text-2xl font-bold mb-4">Your Mental Health Companion</h1>
                    <p className="mb-6">
                      I'm here to listen, support, and provide guidance on your mental wellbeing journey.
                      How can I assist you today?
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Try starting with one of these:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {quickStartPrompts.map((prompt, i) => (
                        <button 
                          key={i}
                          onClick={() => {
                            setInput(prompt.text);
                          }}
                          className={`p-3 text-left rounded-lg ${
                            theme === 'dark' 
                              ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700' 
                              : 'bg-slate-100 hover:bg-slate-200 border border-slate-200'
                          }`}
                        >
                          <div className="flex items-center">
                            {prompt.icon}
                            <span className="ml-2 text-sm">{prompt.text}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`rounded-2xl px-4 py-3 max-w-[75%] ${
                        message.type === 'user'
                          ? theme === 'dark' 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-purple-500 text-white'
                          : theme === 'dark'
                            ? 'bg-slate-800 border border-slate-700'
                            : 'bg-white border border-slate-200'
                      }`}
                    >
                      {message.type === 'bot' && (
                        <div className="flex items-center mb-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            theme === 'dark' ? 'bg-purple-900' : 'bg-purple-100'
                          }`}>
                            <Bot size={14} className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} />
                          </div>
                          <span className="ml-2 text-sm font-medium">Assistant</span>
                        </div>
                      )}
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      <div className="text-xs opacity-60 text-right mt-1">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className={`rounded-2xl px-4 py-3 ${
                  theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
                }`}>
                  <div className="flex items-center mb-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      theme === 'dark' ? 'bg-purple-900' : 'bg-purple-100'
                    }`}>
                      <Bot size={14} className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} />
                    </div>
                    <span className="ml-2 text-sm font-medium">Assistant</span>
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          
          {/* Input Box */}
          <div className={`p-4 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className={`flex-1 py-3 px-4 rounded-full border ${
                  theme === 'dark' 
                    ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:border-purple-500' 
                    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-purple-500'
                } focus:outline-none focus:ring-1 focus:ring-purple-500`}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`p-3 rounded-full ${
                  isListening 
                    ? 'bg-red-500 text-white' 
                    : theme === 'dark'
                      ? 'bg-slate-700 hover:bg-slate-600 text-white'
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-600'
                }`}
                disabled={isLoading}
              >
                <Mic size={20} />
              </button>
              <button
                type="submit"
                className={`p-3 rounded-full ${
                  theme === 'dark'
                    ? 'bg-purple-600 hover:bg-purple-500 text-white'
                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                }`}
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}