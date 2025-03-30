"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Bot, Trash2, Plus, Sparkles, HeartPulse, Brain, BookOpen, 
  Home, MessageCircle, Activity, LayoutDashboard, Link as LinkIcon, Mic 
} from 'lucide-react';
import Link from 'next/link';
import '../app/globals.css';
import router from 'next/router';

// Custom Card Components
const Card = ({ children, className = '', ...props }: { children: React.ReactNode; className?: string; [key: string]: any; }) => (
  <div 
    className={`rounded-lg border bg-gray-900/80 backdrop-blur-xl border-gray-800 shadow-sm ${className}`} 
    {...props}
  >
    {children}
  </div>
);

const CardHeader = ({ children, className = '', ...props }) => (
  <div 
    className={`flex flex-col space-y-1.5 p-6 ${className}`} 
    {...props}
  >
    {children}
  </div>
);

const CardTitle = ({ children, className = '', ...props }) => (
  <h3 
    className={`text-2xl font-semibold leading-none tracking-tight text-white ${className}`} 
    {...props}
  >
    {children}
  </h3>
);

const CardContent = ({ children, className = '', ...props }) => (
  <div 
    className={`p-6 pt-0 ${className}`} 
    {...props}
  >
    {children}
  </div>
);

const CardDescription = ({ children, className = '', ...props }) => (
  <p 
    className={`text-sm text-gray-400 ${className}`} 
    {...props}
  >
    {children}
  </p>
);

// Custom Navbar
const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-white flex items-center gap-2">
          Mind & Soul
        </Link>
        
        <div className="flex items-center gap-6">
          <Link 
            href="/chatbot" 
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Chatbot
          </Link>
          
          <Link 
            href="/suggestions" 
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <Activity className="w-5 h-5" />
            Suggestions
          </Link>
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
};

// Quick Start Cards Data with enhanced descriptions
const QuickStartCards = [
  {
    icon: <HeartPulse className="w-10 h-10 text-pink-400" />,
    title: "Emotional Support",
    description: "Get compassionate guidance for your emotional well-being. Our AI assistant is trained to provide empathetic responses and help you navigate difficult emotions.",
    color: "from-pink-500 to-rose-500",
    prompt: "I'm feeling emotionally overwhelmed and could use some support..."
  },
  {
    icon: <Brain className="w-10 h-10 text-indigo-400" />,
    title: "Mental Health Tips",
    description: "Explore evidence-based strategies for stress management, anxiety reduction, and overall mental wellness. Learn practical self-care techniques.",
    color: "from-indigo-500 to-purple-500",
    prompt: "What are some effective ways to manage daily stress?"
  },
  {
    icon: <BookOpen className="w-10 h-10 text-emerald-400" />,
    title: "Personal Growth",
    description: "Discover insights for personal development, building resilience, and improving relationships. Tools for self-reflection and positive change.",
    color: "from-emerald-500 to-teal-500",
    prompt: "How can I develop better habits and break negative patterns?"
  }
];

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

  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistoryArchive');
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory));
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
        const transcript = event.results[0][0].transcript;
        setInput(prevInput => prevInput + ' ' + transcript); // Append recognized text to input
      };

      recog.onend = () => {
        setIsListening(false); // Update listening state when recognition ends
        startListening(); // Restart listening for continuous input
      };

      recog.onerror = (event: SpeechRecognitionError) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false); // Stop listening on error
        // alert(`Error: ${event.error}`); // Alert the user about the error
      };

      setRecognition(recog);
    } else {
      console.error('Speech recognition not supported in this browser.');
    }
  }, []);

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

      // Update or create chat history
      const updatedHistory = messages.length === 0 
        ? [...chatHistory, messagesWithBot]
        : chatHistory.map(chat => 
            chat[0].id === messages[0].id ? messagesWithBot : chat
          );

      setChatHistory(updatedHistory);
      localStorage.setItem('chatHistoryArchive', JSON.stringify(updatedHistory));
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
  };

  const deleteChat = (index: number) => {
    const updatedHistory = chatHistory.filter((_, i) => i !== index);
    setChatHistory(updatedHistory);
    localStorage.setItem('chatHistoryArchive', JSON.stringify(updatedHistory));
    
    if (messages.length > 0 && messages[0].id === chatHistory[index][0].id) {
      setMessages([]);
    }
  };

  const startNewChat = () => {
    const newChat: Message[] = [{
      id: crypto.randomUUID(),
      type: 'user',
      content: 'New Chat',
      timestamp: Date.now()
    }];
    
    const updatedHistory = [...chatHistory, newChat];
    setChatHistory(updatedHistory);
    localStorage.setItem('chatHistoryArchive', JSON.stringify(updatedHistory));
    
    setMessages([]);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-violet-950 overflow-hidden">
      <Navbar />
      <div className="max-h-[100vh] flex pt-16">
        {/* History Sidebar */}
        <motion.div 
          className="w-80 bg-gray-900/80 backdrop-blur-xl border-r border-gray-800 shadow-2xl flex flex-col"
        >
          <Card className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" /> Chat History
              </h3>
              <button
                onClick={startNewChat}
                className="p-1.5 hover:bg-gray-800/50 rounded-lg transition-colors group"
                title="Start new chat"
              >
                <Plus className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              </button>
            </div>
            <div className="flex-1 min-h-[100dvh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
              {chatHistory.length === 0 ? (
                <p className="p-4 text-gray-400">No previous conversations</p>
              ) : (
                <div className='h-[100dvh] overflow-y-scroll flex flex-col'>
                  <AnimatePresence>
                    {chatHistory.map((session, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="p-4 border-b border-gray-800 hover:bg-gray-800/50 group relative transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div
                            className="flex-1 cursor-pointer"
                            onClick={() => loadChat(session)}
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-200">
                                Chat {index + 1}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(session[0].timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                              {session[0].content}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteChat(index);
                            }}
                            className="flex-shrink-0 p-1.5 hover:bg-red-500/20 rounded-lg transition-colors group"
                            title="Delete this chat"
                          >
                            <Trash2 className="w-4 h-4 text-red-400 group-hover:text-red-600 transition-colors" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Main Chat Area */}
        <motion.div 
          className="flex-1 flex flex-col min-h-0"
        >
          <Card className="flex-1 flex flex-col bg-gray-900/80 backdrop-blur-xl border-gray-800 shadow-2xl min-h-0">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-800 bg-gray-900/90 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
                <Bot className="w-6 h-6 text-indigo-400" />
                Mind & Soul Assistant
              </h2>
            </div>

            {/* Quick Start Cards */}
            {messages.length === 0 && (
              <div className='px-6 pt-3'>
              {/* Hero Section with AI Features */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className=" text-center"
              >
                <h2 className="text-3xl font-bold text-white mb-4">
                  Your Compassionate AI Mental Health Companion
                </h2>
                <div className="grid grid-cols-3 gap-6 mb-8 px-20 py-10">
                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-center mb-3">
                      <Sparkles className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Always Available</h3>
                    <p className="text-gray-300 text-sm">
                      24/7 support whenever you need someone to talk to, no waiting required
                    </p>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-center mb-3">
                      <HeartPulse className="w-8 h-8 text-pink-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Judgment-Free Zone</h3>
                    <p className="text-gray-300 text-sm">
                      A safe space to express yourself without fear of judgment or stigma
                    </p>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-center mb-3">
                      <Brain className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Evidence-Based</h3>
                    <p className="text-gray-300 text-sm">
                      Using proven therapeutic techniques to provide meaningful support
                    </p>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-4">
                  Where would you like to start today?
                </h3>
                <button className='bg-gradient-to-r h-10  rounded-lg from-indigo-600 via-purple-600 to-violet-600 text-white border-0 shadow-lg px-6 transform hover:scale-105 transition-transform btn-xs' onClick={() =>router.push("/suggestions")}>Find Suggestions</button>
              </motion.div>
          
              {/* Quick Start Cards */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-3 gap-4"
              >
              </motion.div>
            </div>
            )}

            {/* Chat Messages */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 min-h-0"
            >
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: message.type === 'user' ? 50 : -50 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[65%] p-4 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-none'
                          : 'bg-gray-800/50 text-gray-100 border border-gray-700'
                      }`}
                    >
                      {message.type === 'bot' && (
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-700">
                          <Bot className="w-5 h-5 text-indigo-400" />
                          <span className="text-sm font-medium text-gray-200">Assistant</span>
                        </div>
                      )}
                      <div className="mb-1 whitespace-pre-wrap">{message.content}</div>
                      <div className={`text-xs ${message.type === 'user' ? 'text-white/70' : 'text-gray-400'} text-right`}>
                        {new Date(message.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-800/50 text-gray-100 p-4 rounded-lg border border-gray-700">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-700">
                      <Bot className="w-5 h-5 text-indigo-400" />
                      <span className="text-sm font-medium text-gray-200">Assistant</span>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-800 bg-gray-900/90">
              <form onSubmit={handleSubmit}>
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSubmit(e)}
                    placeholder="Type your message..."
                    className="flex-1 p-3 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={isListening ? stopListening : startListening}
                    className={`p-3 rounded-lg border border-gray-700 text-gray-100 transition-colors ${isListening ? 'bg-red-600' : 'bg-gray-800 hover:bg-gray-700'}`}
                    title={isListening ? "Stop voice input" : "Start voice input"}
                    aria-label={isListening ? "Stop voice input" : "Start voice input"}
                    disabled={isLoading}
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                  <button
                    type="submit"
                    className="btn bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500 hover:from-indigo-600 hover:via-purple-600 hover:to-violet-600 text-white border-0 shadow-lg px-6 transform hover:scale-105 transition-transform"
                    title="Send message"
                    aria-label="Send message"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </motion.div>
              </form>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}