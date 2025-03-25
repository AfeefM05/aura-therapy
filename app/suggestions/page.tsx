"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Music, Youtube, Book, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/ui/navbar';

interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: 'activities' | 'music' | 'videos' | 'books';
  duration?: string;
  completed: boolean;
}

// Move suggestions to localStorage for persistence
const initialSuggestions: Suggestion[] = [
  // Activities (First Priority)
  {
    id: '1',
    title: '10-minute Meditation',
    description: 'A guided meditation session to help you relax and center yourself.',
    category: 'activities',
    duration: '10 mins',
    completed: false
  },
  {
    id: '2',
    title: 'Morning Walk',
    description: 'A refreshing walk to start your day with positive energy.',
    category: 'activities',
    duration: '20 mins',
    completed: false
  },
  {
    id: '3',
    title: 'Deep Breathing Exercise',
    description: 'Simple breathing techniques to reduce stress and anxiety.',
    category: 'activities',
    duration: '5 mins',
    completed: false
  },
  // Music (Second Priority)
  {
    id: '4',
    title: 'Peaceful Piano',
    description: 'Calming piano melodies to help you relax and focus.',
    category: 'music',
    duration: '30 mins',
    completed: false
  },
  {
    id: '5',
    title: 'Nature Sounds',
    description: 'Soothing sounds from nature to create a peaceful atmosphere.',
    category: 'music',
    duration: '45 mins',
    completed: false
  },
  // Videos (Third Priority)
  {
    id: '6',
    title: 'Guided Meditation Video',
    description: 'Visual guidance for meditation and mindfulness practices.',
    category: 'videos',
    duration: '15 mins',
    completed: false
  },
  {
    id: '7',
    title: 'Stress Relief Techniques',
    description: 'Expert-led video on managing stress effectively.',
    category: 'videos',
    duration: '12 mins',
    completed: false
  },
  // Books (Last Priority)
  {
    id: '8',
    title: 'The Power of Now',
    description: 'A guide to spiritual enlightenment and living in the present moment.',
    category: 'books',
    completed: false
  },
  {
    id: '9',
    title: 'Atomic Habits',
    description: 'Learn how to build good habits and break bad ones.',
    category: 'books',
    completed: false
  }
];

const categoryIcons = {
  activities: Activity,
  music: Music,
  videos: Youtube,
  books: Book
};

const categoryColors = {
  activities: 'from-blue-500 to-cyan-500',
  music: 'from-purple-500 to-pink-500',
  videos: 'from-red-500 to-orange-500',
  books: 'from-green-500 to-teal-500'
};

export default function SuggestionsPage() {
  const [items, setItems] = useState<Suggestion[]>([]);

  useEffect(() => {
    // Load items from localStorage or use initial suggestions
    const savedItems = localStorage.getItem('suggestions');
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    } else {
      setItems(initialSuggestions);
      localStorage.setItem('suggestions', JSON.stringify(initialSuggestions));
    }
  }, []);

  const handleComplete = (id: string) => {
    const updatedItems = items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setItems(updatedItems);
    localStorage.setItem('suggestions', JSON.stringify(updatedItems));
  };

  const getCategoryItems = (category: Suggestion['category']) => {
    return items.filter(item => item.category === category);
  };

  const SuggestionCard = ({ item }: { item: Suggestion }) => {
    const Icon = categoryIcons[item.category];

    return (
      <motion.div
        whileHover={{ scale: 1.02, translateY: -5 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleComplete(item.id)}
        className={cn(
          "relative cursor-pointer rounded-xl p-6 shadow-lg transition-all",
          "bg-gradient-to-br bg-white/80 backdrop-blur-sm",
          "border border-white/20",
          item.completed && "opacity-75"
        )}
      >
        <div className="flex items-start justify-between">
          <div className={cn(
            "rounded-full p-2 w-10 h-10 flex items-center justify-center",
            `bg-gradient-to-br ${categoryColors[item.category]}`
          )}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          {item.completed && (
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          )}
        </div>
        
        <h3 className="text-xl font-semibold mt-4 text-gray-800">{item.title}</h3>
        <p className="mt-2 text-gray-600">{item.description}</p>
        
        {item.duration && (
          <div className="mt-4 text-sm text-gray-500">
            Duration: {item.duration}
          </div>
        )}

        {item.completed && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] rounded-xl flex items-center justify-center">
            <span className="text-green-600 font-semibold">Completed!</span>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
      <Navbar />
      <div className="max-w-7xl mx-auto pt-16">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Your Personalized Suggestions</h1>

        {/* Activities Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-semibold text-gray-800">Activities</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getCategoryItems('activities').map(item => (
              <SuggestionCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        {/* Music Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Music className="w-6 h-6 text-purple-500" />
            <h2 className="text-2xl font-semibold text-gray-800">Music</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getCategoryItems('music').map(item => (
              <SuggestionCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        {/* Videos Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Youtube className="w-6 h-6 text-red-500" />
            <h2 className="text-2xl font-semibold text-gray-800">Videos</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getCategoryItems('videos').map(item => (
              <SuggestionCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        {/* Books Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Book className="w-6 h-6 text-green-500" />
            <h2 className="text-2xl font-semibold text-gray-800">Books</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getCategoryItems('books').map(item => (
              <SuggestionCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}