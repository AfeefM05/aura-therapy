"use client";

import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Music, Youtube, Book, CheckCircle2, Heart, Moon, Brain, BatteryCharging, Calendar, TrendingUp, Smile } from 'lucide-react';
import '../app/globals.css';
import { Navbar } from '@/components/ui/navbar';
// Types
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

// Sample data
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

// Recent completed tasks
const recentCompletedTasks: Suggestion[] = [
  { id: "a1", title: "Morning Yoga Flow", description: "Gentle yoga sequence to start your day with positivity", category: "activities", duration: "20 mins", completed: true },
  { id: "m2", title: "Loving-Kindness Practice", description: "Cultivate compassion for yourself and others", category: "meditation", duration: "10 mins", completed: true },
  { id: "fm1", title: "Peaceful Piano", description: "Relaxing Music", category: "music", completed: true, videoId: "yJg-Y5byMMw" },
  { id: "s2", title: "Warm Bath Relaxation", description: "Add Epsom salts and essential oils", category: "self-care", duration: "30 mins", completed: true },
];

// Upcoming tasks
const upcomingTasks: Suggestion[] = [
  { id: "a4", title: "Nature Walk", description: "Connect with nature and clear your mind", category: "activities", duration: "30 mins", completed: false },
  { id: "b3", title: "The Untethered Soul", description: "Journey beyond yourself with Michael Singer", category: "books", completed: false },
  { id: "m3", title: "Mindful Breathing", description: "Focus on your breath to anchor in the present", category: "meditation", duration: "5 mins", completed: false },
];

// Weekly goals data - new feature
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
  
  useEffect(() => {
    // Load completed items from local storage
    const storedCompleted = localStorage.getItem('completedSuggestions');
    if (storedCompleted) {
      setCompletedItems(JSON.parse(storedCompleted));
    }

    // Load journal entries from local storage
    const storedJournalEntries = localStorage.getItem('journalEntries');
    if (storedJournalEntries) {
      setJournalEntries(JSON.parse(storedJournalEntries));
    }
  }, []);
  
  const wellbeingSummary: WellbeingSummary[] = [
    { 
      title: 'Mood Score', 
      value: '7.8/10', 
      change: 12, 
      icon: <Smile size={20} />, 
      color: '#10b981' 
    },
    { 
      title: 'Sleep Quality', 
      value: '8.2/10', 
      change: 8, 
      icon: <Moon size={20} />, 
      color: '#6366f1' 
    },
    { 
      title: 'Energy Level', 
      value: '7.5/10', 
      change: 15, 
      icon: <BatteryCharging size={20} />, 
      color: '#f59e0b' 
    },
    { 
      title: 'Tasks Completed', 
      value: '38', 
      change: 24, 
      icon: <CheckCircle2 size={20} />, 
      color: '#3b82f6' 
    },
  ];

  const SuggestionCard = ({ item }: { item: Suggestion }) => {
    const Icon = categoryIcons[item.category];
    const colorClass = categoryColors[item.category];
    
    const handleComplete = () => {
      setCompletedItems(prev => ({ ...prev, [item.id]: true }));
      localStorage.setItem('completedSuggestions', JSON.stringify({ ...completedItems, [item.id]: true }));
    };

    return (
      <div className="relative rounded-xl p-4 shadow-md bg-gray-800 border border-gray-700 overflow-hidden flex flex-col">
        <div className="flex-grow">
          <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${colorClass}`}></div>
          
          <div className="flex items-start justify-between">
            <div className={`rounded-lg p-2 flex items-center justify-center bg-gradient-to-br ${colorClass}`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <span className={`text-sm text-gray-300`}>
              {item.duration || ""}
            </span>
          </div>
  
          <h3 className="text-base font-semibold mt-3 text-white">{item.title}</h3>
          <p className="mt-1 text-sm text-gray-300">{item.description}</p>
          <button onClick={handleComplete} className="mt-2 text-blue-500">Complete</button>
        </div>
      </div>
    );
  };

  // Progress bar component for goals
  const ProgressBar = ({ current, target, color }: { current: number, target: number, color: string }) => {
    const percentage = Math.min(Math.round((current / target) * 100), 100);
    return (
      <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
        <div 
          className="h-2.5 rounded-full" 
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    );
  };

  const handleLogMood = (rating: number) => {
    console.log(`Mood logged: ${rating}`);
    // Save mood rating to local storage
    const moodData = JSON.parse(localStorage.getItem('moodData') || '[]');
    moodData.push({ rating, date: new Date().toISOString() });
    localStorage.setItem('moodData', JSON.stringify(moodData));

    // Show success message
    setMoodLogSuccess(true);
    setTimeout(() => setMoodLogSuccess(false), 2000); // Hide after 2 seconds
  };

  const handleAddEntry = () => {
    if (newEntry.trim()) {
      const entry = {
        id: Date.now().toString(),
        content: newEntry,
        date: 'Today', // You can modify this to the actual date
      };
      setJournalEntries(prev => {
        const updatedEntries = [...prev, entry];
        // Save to local storage
        localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
        return updatedEntries;
      });
      setNewEntry('');
    }
  };

  const handleEditEntry = (id: string) => {
    const entryToEdit = journalEntries.find(entry => entry.id === id);
    if (entryToEdit) {
      setNewEntry(entryToEdit.content);
      setEditEntryId(id);
      setShowModal(false); // Close the modal when editing
    }
  };

  const handleSaveEdit = () => {
    if (editEntryId && newEntry.trim()) {
      setJournalEntries(prev => prev.map(entry => 
        entry.id === editEntryId ? { ...entry, content: newEntry } : entry
      ));
      setNewEntry('');
      setEditEntryId(null);
      // Save updated entries to local storage
      localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
    }
  };

  const handleViewJournalHistory = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleDeleteEntry = (id: string) => {
    setJournalEntries(prev => {
      const updatedEntries = prev.filter(entry => entry.id !== id);
      // Update local storage
      localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
      return updatedEntries;
    });
  };

  const handleAddGoal = () => {
    if (newGoalTitle.trim() && newGoalTarget > 0) {
      const newGoal = {
        id: `g${Date.now()}`, // Unique ID for the goal
        title: newGoalTitle,
        target: newGoalTarget,
        current: 0, // Initialize current progress
        unit: 'days' // You can modify this based on the goal type
      };
      weeklyGoals.push(newGoal); // Add the new goal to the existing goals
      setNewGoalTitle(''); // Clear the input field
      setNewGoalTarget(0); // Reset the target input
      setShowGoalInput(false); // Hide input fields after adding
      // Save updated goals to local storage if needed
      localStorage.setItem('weeklyGoals', JSON.stringify(weeklyGoals));
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
            {/* Mood & Energy Trends */}
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

            {/* Task Completion - Fixed Layout */}
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

            {/* Weekly Goals - New Feature */}
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
                    <ProgressBar 
                      current={goal.current} 
                      target={goal.target} 
                      color={goal.current >= goal.target ? '#10b981' : '#6366f1'} 
                    />
                  </div>
                ))}
              </div>
            </div>
            {/* New Feature: Quick Mood Check-in */}
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
              <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition">
                Log Mood
              </button>
              {moodLogSuccess && <p className="text-green-500 mt-2">Mood logged successfully!</p>}
            </div>

            {/* Mindfulness Journal Feature */}
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
                  .slice() // Create a copy of the array to avoid mutating the original state
                  .sort((a, b) => (b.id > a.id ? 1 : -1)) // Sort by ID in descending order
                  .map(entry => (
                    <div key={entry.id} className="p-3 bg-gray-700 rounded-lg">
                      <div className="flex justify-between items-start">
                        <span className="text-xs text-gray-400">{entry.date} · Gratitude</span>
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
                Your mood has improved by 12% this week. Keep up with your meditation practices - they&apos;re making a difference!
              </p>
              <div className="mt-4 flex items-center gap-2">
                <Brain className="text-blue-300" size={18} />
                <span className="text-blue-300 text-sm">Track your mindfulness streak: 7 days</span>
              </div>
            </div>

            {/* Recently Completed */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-md">
              <h2 className="text-lg font-semibold mb-3">Recently Completed</h2>
              <div className="space-y-3">
                {recentCompletedTasks.map(task => (
                  <SuggestionCard key={task.id} item={task} />
                ))}
              </div>
            </div>

            {/* Upcoming Tasks */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-md">
              <h2 className="text-lg font-semibold mb-3">Upcoming Tasks</h2>
              <div className="space-y-3">
                {upcomingTasks.map(task => (
                  <SuggestionCard key={task.id} item={task} />
                ))}
              </div>
              <button className="w-full mt-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition">
                View All Tasks
              </button>
            </div>

            {/* Daily Affirmation */}
            <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-xl p-4 border border-gray-700 shadow-md">
              <h3 className="text-lg font-semibold mb-2">Today's Affirmation</h3>
              <p className="italic text-gray-200">
                &quot;I am worthy of love, peace, and happiness. Each day, I grow stronger and more resilient.&quot;
              </p>
              <div className="mt-4 flex justify-between">
                <button className="px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition text-sm">
                  Save
                </button>
                <button className="px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition text-sm">
                  New Affirmation
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 rounded-lg p-6 w-11/12 md:w-1/2">
            <h2 className="text-lg font-semibold mb-4">Journal History</h2>
            <div className="flex flex-col space-y-3 overflow-y-auto" style={{ maxHeight: '300px' }}>
              {journalEntries.map(entry => (
                <div key={entry.id} className="p-3 bg-gray-700 rounded-lg">
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-gray-400">{entry.date} · Gratitude</span>
                    <div className="flex space-x-3">
                      <button onClick={() => handleEditEntry(entry.id)} className="text-xs text-blue-400 hover:underline px-2 py-1 rounded-md">Edit</button>
                      <button onClick={() => handleDeleteEntry(entry.id)} className="text-xs text-red-400 hover:underline px-2 py-1 rounded-md">Delete</button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">{entry.content}</p>
                </div>
              ))}
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