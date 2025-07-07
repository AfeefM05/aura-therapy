"use client";

import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Music, Youtube, Book, CheckCircle2, Heart, Moon, Brain, BatteryCharging, Calendar, TrendingUp, Smile, Plus, Edit, Trash2, X } from 'lucide-react';
import '../app/globals.css';
import { Navbar } from '@/components/ui/navbar';
import { getUserData, updateUserData } from '@/utils/mongoUserStorage';
import { useRouter } from 'next/navigation';
import { UserData } from '@/utils/userStorage';
import { motion } from 'framer-motion';

interface WellbeingData {
  date: string;
  moodScore: number;
  sleepHours: number;
  anxietyLevel: number;
  energyLevel: number;
}

interface CompletedTasksByCategory {
  category: string;
  count: number;
  color: string;
}

interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: 'activities' | 'music' | 'videos' | 'books' | 'meditation' | 'self-care';
  duration?: string;
  completed: boolean;
  videoId?: string;
}

interface WellbeingSummary {
  title: string;
  value: number | string;
  change: number;
  icon: React.ReactNode;
  color: string;
}

// Dummy data for charts
const wellbeingHistory: WellbeingData[] = [
  { date: 'Mon', moodScore: 6, sleepHours: 7, anxietyLevel: 4, energyLevel: 5 },
  { date: 'Tue', moodScore: 7, sleepHours: 8, anxietyLevel: 3, energyLevel: 7 },
  { date: 'Wed', moodScore: 5, sleepHours: 6, anxietyLevel: 6, energyLevel: 4 },
  { date: 'Thu', moodScore: 8, sleepHours: 8, anxietyLevel: 2, energyLevel: 8 },
  { date: 'Fri', moodScore: 7, sleepHours: 7, anxietyLevel: 3, energyLevel: 6 },
  { date: 'Sat', moodScore: 8, sleepHours: 9, anxietyLevel: 2, energyLevel: 8 },
  { date: 'Sun', moodScore: 9, sleepHours: 8, anxietyLevel: 1, energyLevel: 9 },
];

const completedTasksByCategory: CompletedTasksByCategory[] = [
  { category: 'Activities', count: 8, color: '#3b82f6' },
  { category: 'Music', count: 6, color: '#a855f7' },
  { category: 'Videos', count: 4, color: '#ef4444' },
  { category: 'Books', count: 3, color: '#10b981' },
  { category: 'Meditation', count: 10, color: '#6366f1' },
  { category: 'Self-Care', count: 7, color: '#ec4899' },
];

// Weekly goals dummy data
const weeklyGoals = [
  { id: 'g1', title: 'Meditation', target: 7, current: 5, unit: 'days' },
  { id: 'g2', title: 'Sleep', target: 8, current: 7.5, unit: 'hours/day' },
  { id: 'g3', title: 'Exercise', target: 150, current: 90, unit: 'minutes' },
  { id: 'g4', title: 'Reading', target: 3, current: 2, unit: 'books' },
];

const categoryIcons = {
  activities: Activity,
  music: Music,
  videos: Youtube,
  books: Book,
  meditation: Moon,
  'self-care': Heart
};

const categoryColors = {
  activities: 'from-blue-500 to-cyan-500',
  music: 'from-purple-500 to-pink-500',
  videos: 'from-red-500 to-orange-500',
  books: 'from-green-500 to-teal-500',
  meditation: 'from-indigo-500 to-violet-500',
  'self-care': 'from-rose-500 to-pink-500'
};

interface UserData {
  username: string;
  chatHistory: any[];
  suggestions: Suggestion[];
  taglines: {
    music: string;
    video: string;
    books: { booksnames: string[]; bookdetails: string[] };
    selfcare: { selfcarenames: string[]; selfcaredetails: string[] };
    meditationpractices: { meditationnames: string[]; meditationdetails: string[] };
    mindfulactivities: { mindfulactivitiesnames: string[]; mindfulactivitiesdetails: string[] };
    dailyAffirmation: string;
  };
  completedItems: Record<string, boolean>;
  dashboardData?: {
    journalEntries?: { id: string; content: string; date: string }[];
    moodData?: { rating: number; date: string }[];
    weeklyGoals?: { id: string; title: string; target: number; current: number; unit: string }[];
    suggestions?: Suggestion[];
    completedItems?: Record<string, boolean>;
  };
  // Legacy fields for backward compatibility
  journalEntries?: { id: string; content: string; date: string }[];
  moodData?: { rating: number; date: string }[];
  weeklyGoals?: { id: string; title: string; target: number; current: number; unit: string }[];
}
const dummyCompletedTasks: Suggestion[] = [
  {
    id: "dct1",
    title: "Morning Meditation",
    description: "10-minute guided meditation to start your day",
    category: "meditation",
    duration: "10 mins",
    completed: true
  },
  {
    id: "dct2",
    title: "Gratitude Journal",
    description: "Write down 3 things you're grateful for",
    category: "activities",
    completed: true
  },
  {
    id: "dct3",
    title: "Relaxing Piano Music",
    description: "Soothing music for stress relief",
    category: "music",
    completed: true
  }
];

const dummyUpcomingTasks: Suggestion[] = [
  {
    id: "dut1",
    title: "Evening Walk",
    description: "15-minute walk to unwind after work",
    category: "activities",
    duration: "15 mins",
    completed: false
  },
  {
    id: "dut2",
    title: "Read a Book",
    description: "Enjoy 20 minutes of reading",
    category: "books",
    duration: "20 mins",
    completed: false
  },
  {
    id: "dut3",
    title: "Deep Breathing",
    description: "5-minute breathing exercise",
    category: "meditation",
    duration: "5 mins",
    completed: false
  }
];

// Then modify the task extraction logic to use dummy data when user data is empty

const UserMentalWellbeingDashboard: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week');
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [journalEntries, setJournalEntries] = useState<{ id: string; content: string; date: string }[]>([]);
  const [newEntry, setNewEntry] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editEntryId, setEditEntryId] = useState<string | null>(null);
  const [moodLogSuccess, setMoodLogSuccess] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState(0);
  const [showGoalInput, setShowGoalInput] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [weeklyGoals, setWeeklyGoals] = useState<{ id: string; title: string; target: number; current: number; unit: string }[]>([]);
  const router = useRouter();
  
  useEffect(() => {
    const loadUserData = async () => {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (currentUser.username) {
        try {
          const data = await getUserData(currentUser.username);
          if (data) {
            setUserData(data);
            setCompletedItems(data.completedItems || {});
            // Load data from dashboardData field
            setJournalEntries(data.dashboardData?.journalEntries || []);
            // Set weekly goals from dashboardData
            setWeeklyGoals(data.dashboardData?.weeklyGoals || []);
            // Set mood data and weekly goals from dashboardData
            if (data.dashboardData) {
              setUserData(prev => prev ? ({
                ...prev,
                moodData: data.dashboardData.moodData || [],
                weeklyGoals: data.dashboardData.weeklyGoals || []
              }) : null);
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
  }, [router]);

  // Debugging: Check userData
  useEffect(() => {
    console.log("User Data:", userData);
  }, [userData]);

  // Extract upcoming and recently completed tasks from user data
  const upcomingTasks = (userData?.suggestions?.length ? 
    userData.suggestions.filter(task => !task.completed) : 
    dummyUpcomingTasks) || dummyUpcomingTasks;
  
  const recentlyCompletedTasks = (userData?.suggestions?.length ? 
    userData.suggestions.filter(task => task.completed) : 
    dummyCompletedTasks) || dummyCompletedTasks;
  // Debugging: Check upcoming and completed tasks
  useEffect(() => {
    console.log("Upcoming Tasks:", upcomingTasks);
    console.log("Recently Completed Tasks:", recentlyCompletedTasks);
  }, [upcomingTasks, recentlyCompletedTasks]);

  // Calculate wellbeing summary from user data
  const wellbeingSummary: WellbeingSummary[] = [
    { 
      title: 'Mood Score', 
      value: userData?.dashboardData?.moodData?.length 
        ? (userData.dashboardData.moodData.reduce((sum, entry) => sum + entry.rating, 0) / userData.dashboardData.moodData.length).toFixed(1) + '/10'
        : '7.8/10', 
      change: 12, 
      icon: <Smile size={20} />, 
      color: '#10b981' 
    },
    { 
      title: 'Tasks Completed', 
      value: Object.keys(userData?.completedItems || {}).length.toString(), 
      change: 24, 
      icon: <CheckCircle2 size={20} />, 
      color: '#3b82f6' 
    },
    { 
      title: 'Journal Entries', 
      value: userData?.dashboardData?.journalEntries?.length?.toString() || '0', 
      change: 8, 
      icon: <Book size={20} />, 
      color: '#6366f1' 
    },
    { 
      title: 'Goals Progress', 
      value: userData?.dashboardData?.weeklyGoals?.length 
        ? `${userData.dashboardData.weeklyGoals.filter(g => g.current >= g.target).length}/${userData.dashboardData.weeklyGoals.length}`
        : '0/0', 
      change: 15, 
      icon: <TrendingUp size={20} />, 
      color: '#f59e0b' 
    },
  ];

  const handleLogMood = async (rating: number) => {
    const newMoodData = [...(userData?.moodData || []), {
      rating,
      date: new Date().toISOString()
    }];
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.username) {
      try {
        await updateUserData(currentUser.username, {
          dashboardData: {
            ...userData?.dashboardData,
            moodData: newMoodData
          }
        });
        setUserData(prev => prev ? ({ 
          ...prev, 
          dashboardData: { ...prev.dashboardData, moodData: newMoodData }
        }) : null);
      } catch (error) {
        console.error('Error updating mood data:', error);
      }
    }
    
    setMoodLogSuccess(true);
    setTimeout(() => setMoodLogSuccess(false), 2000);
  };

  const handleAddEntry = async () => {
    if (newEntry.trim()) {
      const entry = {
        id: Date.now().toString(),
        content: newEntry,
        date: new Date().toLocaleDateString(),
      };
      
      const updatedEntries = [...journalEntries, entry];
      setJournalEntries(updatedEntries);
      setNewEntry('');
      
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (currentUser.username) {
        try {
          await updateUserData(currentUser.username, {
            dashboardData: {
              ...userData?.dashboardData,
              journalEntries: updatedEntries
            }
          });
          setUserData(prev => prev ? ({ 
            ...prev, 
            dashboardData: { ...prev.dashboardData, journalEntries: updatedEntries }
          }) : null);
        } catch (error) {
          console.error('Error updating journal entries:', error);
        }
      }
    }
  };

  const handleEditEntry = (id: string) => {
    const entryToEdit = journalEntries.find(entry => entry.id === id);
    if (entryToEdit) {
      setNewEntry(entryToEdit.content);
      setEditEntryId(id);
      setShowModal(false);
    }
  };

  const handleSaveEdit = async () => {
    if (editEntryId && newEntry.trim()) {
      const updatedEntries = journalEntries.map(entry => 
        entry.id === editEntryId ? { ...entry, content: newEntry } : entry
      );
      
      setJournalEntries(updatedEntries);
      setNewEntry('');
      setEditEntryId(null);
      
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (currentUser.username) {
        try {
          await updateUserData(currentUser.username, {
            dashboardData: {
              ...userData?.dashboardData,
              journalEntries: updatedEntries
            }
          });
          setUserData(prev => prev ? ({ 
            ...prev, 
            dashboardData: { ...prev.dashboardData, journalEntries: updatedEntries }
          }) : null);
        } catch (error) {
          console.error('Error updating journal entries:', error);
        }
      }
    }
  };

  const handleViewJournalHistory = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleDeleteEntry = async (id: string) => {
    const updatedEntries = journalEntries.filter(entry => entry.id !== id);
    setJournalEntries(updatedEntries);
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.username) {
      try {
        await updateUserData(currentUser.username, {
          dashboardData: {
            ...userData?.dashboardData,
            journalEntries: updatedEntries
          }
        });
        setUserData(prev => prev ? ({ 
          ...prev, 
          dashboardData: { ...prev.dashboardData, journalEntries: updatedEntries }
        }) : null);
      } catch (error) {
        console.error('Error updating journal entries:', error);
      }
    }
  };

  const handleAddGoal = async () => {
    if (newGoalTitle.trim() && newGoalTarget > 0) {
      const newGoal = {
        id: `g${Date.now()}`,
        title: newGoalTitle,
        target: newGoalTarget,
        current: 0,
        unit: 'days'
      };
      
      const updatedGoals = [...weeklyGoals, newGoal];
      setWeeklyGoals(updatedGoals);
      
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (currentUser.username) {
        try {
          await updateUserData(currentUser.username, {
            dashboardData: {
              ...userData?.dashboardData,
              weeklyGoals: updatedGoals
            }
          });
          setUserData(prev => prev ? ({ 
            ...prev, 
            dashboardData: { ...prev.dashboardData, weeklyGoals: updatedGoals }
          }) : null);
        } catch (error) {
          console.error('Error updating weekly goals:', error);
        }
      }
      
      setNewGoalTitle('');
      setNewGoalTarget(0);
      setShowGoalInput(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    if (userData) {
      const updatedSuggestions = userData.suggestions.map(task => 
        task.id === taskId ? { ...task, completed: true } : task
      );

      const updatedCompletedItems = { ...userData.completedItems, [taskId]: true };
      
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (currentUser.username) {
        try {
          await updateUserData(currentUser.username, {
            dashboardData: {
              ...userData?.dashboardData,
              suggestions: updatedSuggestions,
              completedItems: updatedCompletedItems
            }
          });
          setUserData(prev => prev ? ({ 
            ...prev, 
            dashboardData: { ...prev.dashboardData, suggestions: updatedSuggestions, completedItems: updatedCompletedItems }
          }) : null);
        } catch (error) {
          console.error('Error updating task completion:', error);
        }
      }
    }
  };

  const handleUpdateGoalProgress = async (goalId: string, increment: number = 1) => {
    const updatedGoals = weeklyGoals.map(goal => 
      goal.id === goalId ? { ...goal, current: Math.min(goal.current + increment, goal.target) } : goal
    );
    
    setWeeklyGoals(updatedGoals);
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.username) {
      try {
        await updateUserData(currentUser.username, {
          dashboardData: {
            ...userData?.dashboardData,
            weeklyGoals: updatedGoals
          }
        });
        setUserData(prev => prev ? ({ 
          ...prev, 
          dashboardData: { ...prev.dashboardData, weeklyGoals: updatedGoals }
        }) : null);
      } catch (error) {
        console.error('Error updating goal progress:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6">
      <Navbar />
      <div className="max-w-6xl mx-auto mt-10">
        {/* Header */}
        <header className="mb-6 text-center">
          <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            Your Mental Wellbeing
          </h1>
          <p className="text-lg text-gray-300 mt-2">
            Track your progress and nurture your mind, body, and soul
          </p>
        </header>

        {/* Time Frame Selector */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={16} className="text-gray-400" />
            <span className="text-gray-400">View by:</span>
            <div className="flex bg-gray-800 rounded-lg shadow-sm border border-gray-700">
              <button 
                className={`px-3 py-1.5 rounded-l-lg ${timeframe === 'week' ? 'bg-gray-700 text-white font-medium' : 'text-gray-400'}`}
                onClick={() => setTimeframe('week')}
              >
                Week
              </button>
              <button 
                className={`px-3 py-1.5 ${timeframe === 'month' ? 'bg-gray-700 text-white font-medium' : 'text-gray-400'}`}
                onClick={() => setTimeframe('month')}
              >
                Month
              </button>
              <button 
                className={`px-3 py-1.5 rounded-r-lg ${timeframe === 'year' ? 'bg-gray-700 text-white font-medium' : 'text-gray-400'}`}
                onClick={() => setTimeframe('year')}
              >
                Year
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {wellbeingSummary.map((stat, index) => (
            <div key={index} className="bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-md">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: stat.color + '20' }}>
                  {React.isValidElement(stat.icon) ? React.cloneElement(stat.icon as React.ReactElement, { style: { color: stat.color } }) : null}
                </div>
                <span className="text-gray-400">{stat.title}</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-white">{stat.value}</span>
                <span className={`flex items-center text-sm ${stat.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  <TrendingUp size={14} className="mr-1" />
                  {stat.change}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Charts Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mood & Energy Trends - Using dummy data */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-md">
              <h2 className="text-lg font-semibold mb-4">Wellbeing Trends</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={wellbeingHistory} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }} />
                  <Legend />
                  <Line type="monotone" dataKey="moodScore" stroke="#10b981" name="Mood" strokeWidth={2} />
                  <Line type="monotone" dataKey="energyLevel" stroke="#f59e0b" name="Energy" strokeWidth={2} />
                  <Line type="monotone" dataKey="anxietyLevel" stroke="#ef4444" name="Anxiety" strokeWidth={2} />
                  <Line type="monotone" dataKey="sleepHours" stroke="#6366f1" name="Sleep" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Task Completion - Using dummy data */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-md">
              <h2 className="text-lg font-semibold mb-4">Completed Activities by Category</h2>
              <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-4">
                <div className="w-full md:w-1/2 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={completedTasksByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      >
                        {completedTasksByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={completedTasksByCategory}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                      <XAxis type="number" stroke="#9ca3af" />
                      <YAxis dataKey="category" type="category" width={80} stroke="#9ca3af" />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }} />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        {completedTasksByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Weekly Goals - Using dummy data */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Weekly Goals</h2>
                <button 
                  onClick={() => setShowGoalInput(!showGoalInput)} 
                  className="text-sm px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition"
                >
                  {showGoalInput ? 'Cancel' : '+ Add Goal'}
                </button>
              </div>
              {showGoalInput && (
                <div className="mb-4">
                  <input 
                    type="text" 
                    placeholder="Goal Title" 
                    value={newGoalTitle}
                    onChange={(e) => setNewGoalTitle(e.target.value)}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                  />
                  <input 
                    type="number" 
                    placeholder="Target" 
                    value={newGoalTarget}
                    onChange={(e) => setNewGoalTarget(Number(e.target.value))}
                    className="w-full p-2 mt-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                  />
                  <button 
                    onClick={handleAddGoal}
                    className="mt-2 w-full py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition"
                  >
                    Save Goal
                  </button>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {weeklyGoals.map((goal) => (
                  <div key={goal.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-white">{goal.title}</h3>
                        <p className="text-gray-300 text-sm">{goal.current} / {goal.target} {goal.unit}</p>
                      </div>
                      <span className="text-sm text-white px-2 py-1 rounded-md" 
                        style={{ backgroundColor: goal.current >= goal.target ? '#10b981' : '#6366f1' }}>
                        {Math.round((goal.current / goal.target) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2.5 mt-2">
                      <div 
                        className="h-2.5 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, (goal.current / goal.target) * 100)}%`, 
                          backgroundColor: goal.current >= goal.target ? '#10b981' : '#6366f1' 
                        }}
                      />
                    </div>
                    {goal.current < goal.target && (
                      <button 
                        onClick={() => handleUpdateGoalProgress(goal.id, 1)}
                        className="mt-2 text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white transition"
                      >
                        +1 Progress
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Mood Check-in */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-md">
              <h2 className="text-lg font-semibold mb-3">Quick Mood Check-in</h2>
              <p className="text-gray-300 text-sm mb-3">How are you feeling right now?</p>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button 
                    key={rating} 
                    className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
                    onClick={() => handleLogMood(rating)}
                  >
                    <span className="text-2xl mb-1">
                      {rating === 1 ? '😔' : rating === 2 ? '😕' : rating === 3 ? '😐' : rating === 4 ? '🙂' : '😊'}
                    </span>
                    <span className="text-xs text-gray-300">
                      {rating === 1 ? 'Poor' : rating === 2 ? 'Low' : rating === 3 ? 'Okay' : rating === 4 ? 'Good' : 'Great'}
                    </span>
                  </button>
                ))}
              </div>
              {moodLogSuccess && <p className="text-green-500 text-center">Mood logged successfully!</p>}
            </div>

            {/* Mindfulness Journal */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Mindfulness Journal</h2>
                <button onClick={editEntryId ? handleSaveEdit : handleAddEntry} className="text-sm px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition">
                  {editEntryId ? 'Save Entry' : '+ New Entry'}
                </button>
              </div>
              
              <div className="mb-4">
                <textarea 
                  placeholder="What are you grateful for today?" 
                  value={newEntry}
                  onChange={(e) => setNewEntry(e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                ></textarea>
              </div>
              
              <div className="flex flex-col space-y-3 overflow-y-auto" style={{ maxHeight: '200px' }}>
                {journalEntries
                  .slice()
                  .sort((a, b) => (b.id > a.id ? 1 : -1))
                  .map(entry => (
                    <div key={entry.id} className="p-3 bg-gray-700 rounded-lg">
                      <div className="flex justify-between items-start">
                        <span className="text-xs text-gray-400">{entry.date}</span>
                        <div className="flex space-x-3">
                          <button onClick={() => handleEditEntry(entry.id)} className="text-xs text-blue-400 hover:underline px-2 py-1 rounded-md">Edit</button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 mt-1">{entry.content}</p>
                    </div>
                  ))}
              </div>
              
              <button onClick={handleViewJournalHistory} className="w-full mt-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition">
                View Journal History
              </button>
            </div>
          </div>

          {/* Right Column - Tasks & Recommendations */}
          <div className="space-y-6">
            {/* Today's Insights */}
            <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-xl p-4 border border-gray-700 shadow-md">
              <h3 className="text-lg font-semibold mb-2">Today's Reflection</h3>
              <p className="text-gray-300">
                {userData?.dashboardData?.moodData?.length 
                  ? `Your average mood score is ${(userData.dashboardData.moodData.reduce((sum, entry) => sum + entry.rating, 0) / userData.dashboardData.moodData.length).toFixed(1)}/10. Keep up the good work!`
                  : "Complete a mood check-in to get personalized insights"}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <Brain className="text-blue-300" size={18} />
                <span className="text-blue-300 text-sm">
                  {userData?.dashboardData?.journalEntries?.length 
                    ? `You have ${userData.dashboardData.journalEntries.length} journal entries`
                    : "Start journaling to track your thoughts"}
                </span>
              </div>
            </div>

            {/* Recently Completed */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-md">
              <h2 className="text-lg font-semibold mb-3">Recently Completed</h2>
              <div className="space-y-3">
                {recentlyCompletedTasks.length > 0 ? (
                  recentlyCompletedTasks.map(task => (
                    <div key={task.id} className="p-3 bg-gray-700 rounded-lg">
                      <h3 className="font-medium text-white">{task.title}</h3>
                      <p className="text-gray-300 text-sm">{task.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No recently completed tasks.</p>
                )}
              </div>
            </div>

            {/* Upcoming Tasks */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-md">
              <h2 className="text-lg font-semibold mb-3">Upcoming Tasks</h2>
              <div className="space-y-3">
                {upcomingTasks.length > 0 ? (
                  upcomingTasks.map(task => (
                    <div key={task.id} className="p-3 bg-gray-700 rounded-lg">
                      <h3 className="font-medium text-white">{task.title}</h3>
                      <p className="text-gray-300 text-sm">{task.description}</p>
                      <button onClick={() => handleCompleteTask(task.id)} className="mt-2 text-blue-500">Complete</button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No upcoming tasks.</p>
                )}
              </div>
              <button onClick={() => router.push('/suggestions')} className="w-full mt-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition">
                View All Tasks
              </button>
            </div>

            {/* Daily Affirmation */}
            <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-xl p-4 border border-gray-700 shadow-md">
              <h3 className="text-lg font-semibold mb-2">Today's Affirmation</h3>
              <p className="italic text-gray-200">
                {userData?.taglines?.dailyAffirmation || 
                  "I am worthy of love, peace, and happiness. Each day, I grow stronger and more resilient."}
              </p>
              <div className="mt-4 flex justify-between">
                <button 
                  onClick={() => {
                    router.push('/suggestions');
                  }}
                  className="px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition text-sm"
                >
                  More Affirmations
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Journal History Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-11/12 md:w-1/2 max-h-[80vh] flex flex-col">
            <h2 className="text-lg font-semibold mb-4">Journal History</h2>
            <div className="flex-1 overflow-y-auto mb-4">
              {journalEntries.length > 0 ? (
                journalEntries
                  .slice()
                  .sort((a, b) => (b.id > a.id ? 1 : -1))
                  .map(entry => (
                    <div key={entry.id} className="p-3 bg-gray-700 rounded-lg mb-2">
                      <div className="flex justify-between items-start">
                        <span className="text-xs text-gray-400">{entry.date}</span>
                        <div className="flex space-x-3">
                          <button onClick={() => handleEditEntry(entry.id)} className="text-xs text-blue-400 hover:underline px-2 py-1 rounded-md">Edit</button>
                          <button onClick={() => handleDeleteEntry(entry.id)} className="text-xs text-red-400 hover:underline px-2 py-1 rounded-md">Delete</button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 mt-1">{entry.content}</p>
                    </div>
                  ))
              ) : (
                <p className="text-gray-400 text-center py-4">No journal entries yet.</p>
              )}
            </div>
            <button onClick={handleCloseModal} className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMentalWellbeingDashboard;