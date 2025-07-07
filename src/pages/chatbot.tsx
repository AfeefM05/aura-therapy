"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Bot, Trash2, Plus, Sparkles, HeartPulse, Brain, BookOpen, 
  Home, MessageCircle, Activity, LayoutDashboard, Link as LinkIcon, Mic,
  Menu, X, ChevronLeft, ChevronRight, Languages, Globe
} from 'lucide-react';
import Link from 'next/link';
import '../app/globals.css';
import router from 'next/router';
import { getUserData, updateUserData } from '@/utils/mongoUserStorage';
import QuickStartCardsComponent from '@/components/QuickStartCards';

// Message Interface
interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: number;
}

// Language Type
type LanguageOption = 'english' | 'tamil';

// User Data Interface
interface UserData {
  username: string;
  chatHistory?: Message[][];
  preferredLanguage?: LanguageOption;
  // Add other user data fields as needed
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
  const [language, setLanguage] = useState<LanguageOption>('english');
  
  useEffect(() => {
    const loadUserData = async () => {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (currentUser.username) {
        try {
          const data = await getUserData(currentUser.username);
          if (data) {
            setUserData(data);
            // Convert chat history from database format to component format
            // Database format: [{ message: string; timestamp: number }]
            // Component format: Message[][]
            let convertedChatHistory: Message[][] = [];
            
            if (data.chatHistory && Array.isArray(data.chatHistory)) {
              // Group messages by conversation using session separators
              let currentConversation: any[] = [];
              let globalIndex = 0;
              
              data.chatHistory.forEach((msg: any) => {
                // Check if this is a session separator
                if (msg.message && msg.message.startsWith('---SESSION_SEPARATOR_')) {
                  // Save the current conversation and start a new one
                  if (currentConversation.length > 0) {
                    convertedChatHistory.push(currentConversation);
                  }
                  currentConversation = [];
                  return; // Skip the separator message
                }
                
                const messageWithType = {
                  id: crypto.randomUUID(),
                  // Use global index to alternate between user and bot messages
                  // Even indices are user messages, odd indices are bot responses
                  type: globalIndex % 2 === 0 ? 'user' : 'bot' as 'user' | 'bot',
                  content: msg.message,
                  timestamp: msg.timestamp
                };
                
                currentConversation.push(messageWithType);
                globalIndex++;
              });
              
              // Add the last conversation if it has messages
              if (currentConversation.length > 0) {
                convertedChatHistory.push(currentConversation);
              }
            }
            
            setChatHistory(convertedChatHistory);
            // Load saved language preference if available
            if (data.preferredLanguage) {
              setLanguage(data.preferredLanguage as LanguageOption);
            }
          } else {
            router.push('/login');
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Initialize speech recognition with chosen language
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.interimResults = true;
      
      // Set language for speech recognition
      if (language === 'tamil') {
        recog.lang = 'ta-IN'; // Tamil language code
      } else {
        recog.lang = 'en-US'; // English language code
      }

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
      };

      recog.onerror = (event: SpeechRecognitionError) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      setRecognition(recog);
    } else {
      console.error('Speech recognition not supported in this browser.');
    }
  }, [language, lastTranscript]); // Re-initialize when language changes

  const toggleLanguage = async () => {
    const newLanguage = language === 'english' ? 'tamil' : 'english';
    setLanguage(newLanguage);
    
    // Save language preference
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.username) {
      try {
        await updateUserData(currentUser.username, {
          preferredLanguage: newLanguage
        });
      } catch (error) {
        console.error('Error updating language preference:', error);
      }
    }
    
    // Stop and reset speech recognition to update language
    if (isListening && recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

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
          })),
          language: language // Send the selected language to the API
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
            chat[0]?.id === messages[0]?.id ? messagesWithBot : chat
          );

      setChatHistory(updatedHistory);
      
      // Convert chat history to the format expected by the database
      // Add session markers to preserve conversation boundaries
      const chatHistoryForDB = updatedHistory.flatMap((chat, sessionIndex) => {
        const sessionMessages = chat.map(msg => ({
          message: msg.content,
          timestamp: msg.timestamp
        }));
        
        // Add a session separator message if not the first session
        if (sessionIndex > 0) {
          sessionMessages.unshift({
            message: `---SESSION_SEPARATOR_${sessionIndex}---`,
            timestamp: chat[0]?.timestamp - 1000 // 1 second before first message
          });
        }
        
        return sessionMessages;
      });
      
      // Update user data
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (currentUser.username) {
        try {
          await updateUserData(currentUser.username, {
            chatHistory: chatHistoryForDB,
            preferredLanguage: language
          });
        } catch (error) {
          console.error('Error updating user data:', error);
        }
      }

    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        type: 'bot',
        content: language === 'tamil' 
          ? "மன்னிக்கவும், தற்போது உங்கள் செய்தியை செயலாக்க எனக்கு சிரமம் உள்ளது. தயவுசெய்து பின்னர் முயற்சிக்கவும்."
          : "I apologize, but I'm having trouble processing your message right now. Please try again later.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadChat = (chat: Message[]) => {
    // Check if chat is a valid array before trying to map it
    if (!Array.isArray(chat)) {
      console.warn('Invalid chat data received:', chat);
      setMessages([]);
      return;
    }
    
    const chatCopy = chat.map(msg => ({ ...msg }));
    setMessages(chatCopy);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const deleteChat = async (index: number) => {
    const updatedHistory = chatHistory.filter((_, i) => i !== index);
    setChatHistory(updatedHistory);
    
    // Convert chat history to the format expected by the database
    const chatHistoryForDB = updatedHistory.flatMap(chat => 
      chat.map(msg => ({
        message: msg.content,
        timestamp: msg.timestamp
      }))
    );
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.username) {
      try {
        await updateUserData(currentUser.username, {
          chatHistory: chatHistoryForDB
        });
      } catch (error) {
        console.error('Error updating chat history:', error);
      }
    }
    
    if (messages.length > 0 && messages[0]?.id === chatHistory[index][0]?.id) {
      setMessages([]);
    }
  };

  const startNewChat = async () => {
    // Save current conversation if there are messages and it's not already saved
    if (messages.length > 0) {
      // Check if this conversation is already in chat history
      const isAlreadySaved = chatHistory.some(chat => 
        chat.length === messages.length && 
        chat.every((msg, index) => msg.content === messages[index].content)
      );
      
      if (!isAlreadySaved) {
        const updatedHistory = [...chatHistory, messages];
        setChatHistory(updatedHistory);
        
        // Convert chat history to the format expected by the database
        const chatHistoryForDB = updatedHistory.flatMap(chat => 
          chat.map(msg => ({
            message: msg.content,
            timestamp: msg.timestamp
          }))
        );
        
        // Update user data
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (currentUser.username) {
          try {
            await updateUserData(currentUser.username, {
              chatHistory: chatHistoryForDB
            });
          } catch (error) {
            console.error('Error updating chat history:', error);
          }
        }
      }
    }
    
    // Clear current messages to start new chat
    setMessages([]);
    
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

  // Quick Start Prompts based on language
  const quickStartPrompts = language === 'tamil' ? [
    { text: "நான் சமீபத்தில் பதற்றமாக உணர்கிறேன். ஏன் என்று புரிந்துகொள்ள உதவ முடியுமா?", icon: <HeartPulse size={40} /> },
    { text: "மன அழுத்தத்தை நிர்வகிப்பதற்கான சில பயனுள்ள நுட்பங்கள் என்ன?", icon: <Sparkles size={40} /> },
    { text: "என் தூக்கத்தின் தரத்தை மேம்படுத்த விரும்புகிறேன். ஏதேனும் பரிந்துரைகள் உள்ளதா?", icon: <BookOpen size={40} /> },
    { text: "நான் எவ்வாறு அதிக சுய-அன்பைப் பயிற்சி செய்ய முடியும்?", icon: <Brain size={40} /> }
  ] : [
    { text: "I've been feeling anxious lately. Can you help me understand why?", icon: <HeartPulse size={40} /> },
    { text: "What are some effective techniques for managing stress?", icon: <Sparkles size={40} /> },
    { text: "I'd like to improve my sleep quality. Any suggestions?", icon: <BookOpen size={40} /> },
    { text: "How can I practice more self-compassion?", icon: <Brain size={40} /> }
  ];

  // Get welcome text based on language
  const getWelcomeText = () => {
    if (language === 'tamil') {
      return {
        title: "உங்கள் மன நல துணையாளர்",
        subtitle: "நான் கேட்க, ஆதரிக்க மற்றும் உங்கள் மன நல பயணத்தில் வழிகாட்ட இங்கே இருக்கிறேன். இன்று நான் எவ்வாறு உதவ முடியும்?",
        promptsLabel: "இவற்றில் ஒன்றைக் கொண்டு தொடங்க முயற்சிக்கவும்:"
      };
    } else {
      return {
        title: "Your Mental Health Companion",
        subtitle: "I'm here to listen, support, and provide guidance on your mental wellbeing journey. How can I assist you today?",
        promptsLabel: "Try starting with one of these:"
      };
    }
  };

  const welcomeText = getWelcomeText();

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
            <span className="font-bold text-lg">Mind & Soul</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Language Toggle Button */}
          <button
            onClick={toggleLanguage}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${
              theme === 'dark' 
                ? 'bg-slate-700 hover:bg-slate-600' 
                : 'bg-slate-200 hover:bg-slate-300'
            }`}
          >
            <Globe size={16} />
            <span className="text-sm font-medium">
              {language === 'english' ? 'தமிழ்' : 'English'}
            </span>
          </button>
          
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
                  <h2 className="font-semibold">
                    {language === 'tamil' ? 'அரட்டை வரலாறு' : 'Chat History'}
                  </h2>
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
                      {language === 'tamil' ? 'இதுவரை உரையாடல் வரலாறு இல்லை' : 'No conversation history yet'}
                    </div>
                  ) : (
                    <div className="space-y-1 p-2">
                      {chatHistory.map((chat, index) => {
                        // Ensure chat is a valid array and has at least one message
                        if (!Array.isArray(chat) || chat.length === 0) {
                          return null;
                        }
                        
                        return (
                          <div 
                            key={index}
                            onClick={() => loadChat(chat)}
                            className={`p-3 rounded-lg cursor-pointer flex items-start justify-between ${
                              messages.length > 0 && messages[0]?.id === chat[0]?.id
                                ? theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-100'
                                : theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-200'
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <MessageCircle size={16} className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} />
                                <p className="font-medium truncate">
                                  {chat[0]?.content?.substring(0, 20) || (language === 'tamil' ? `உரையாடல் ${index + 1}` : `Chat ${index + 1}`)}
                                </p>
                              </div>
                              <p className="text-xs text-slate-400 mt-1 truncate">
                                {chat.length > 0 
                                  ? new Date(chat[0]?.timestamp || Date.now()).toLocaleString() 
                                  : language === 'tamil' ? 'புதிய உரையாடல்' : 'New chat'}
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
                        );
                      })}
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
                    <h1 className="text-2xl font-bold mb-4">{welcomeText.title}</h1>
                    <p className="mb-6">
                      {welcomeText.subtitle}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">{welcomeText.promptsLabel}</h3>
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
                          <span className="ml-2 text-sm font-medium">
                            {language === 'tamil' ? 'உதவியாளர்' : 'Assistant'}
                          </span>
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
                    <span className="ml-2 text-sm font-medium">
                      {language === 'tamil' ? 'உதவியாளர்' : 'Assistant'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="animate-pulse">
                      {language === 'tamil' ? 'பதிலளிக்கிறது...' : 'Responding...'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          
          {/* Input Area */}
          <div className={`${theme === 'dark' ? 'bg-slate-800 border-t border-slate-700' : 'bg-white border-t border-slate-200'} p-4`}>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={language === 'tamil' ? 'உங்கள் செய்தியை இங்கே உள்ளிடவும்...' : 'Type your message here...'}
                  className={`w-full px-4 pr-12 py-3 rounded-full focus:outline-none ${
                    theme === 'dark' 
                      ? 'bg-slate-700 text-white placeholder:text-slate-400 focus:ring-1 focus:ring-purple-500' 
                      : 'bg-slate-100 text-slate-900 placeholder:text-slate-500 focus:ring-1 focus:ring-purple-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${
                    isListening 
                      ? 'text-red-500' 
                      : theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Mic size={18} className={isListening ? 'animate-pulse' : ''} />
                </button>
              </div>
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className={`p-3 rounded-full ${
                  theme === 'dark' 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white disabled:bg-purple-900 disabled:text-slate-400' 
                    : 'bg-purple-500 hover:bg-purple-600 text-white disabled:bg-purple-300 disabled:text-slate-100'
                } flex-shrink-0`}
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}