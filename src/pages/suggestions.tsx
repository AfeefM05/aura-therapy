"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Music, Youtube, Book, CheckCircle2, Heart, Moon, Sun, Coffee, Feather, Smile, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { Navbar } from '@/components/ui/navbar';
import '../app/globals.css';

interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: 'activities' | 'music' | 'videos' | 'books' | 'meditation' | 'self-care';
  duration?: string;
  completed: boolean;
  videoId?: string;
}

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

// YouTube API Key
const API_KEY = "AIzaSyCBKJiFRRw3mEKmHYXZASMJurExiQEr618";
const SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

// Default fallback data
const defaultMusicTagline = "peaceful meditation music";
const defaultVideoTagline = "Buddha meditation teachings";

// Dummy Data
const dummyActivities: Suggestion[] = [
  { id: "a1", title: "Morning Yoga Flow", description: "Gentle yoga sequence to start your day with positivity", category: "activities", duration: "20 mins", completed: false },
  { id: "a2", title: "Gratitude Journaling", description: "Write down 3 things you're grateful for today", category: "activities", duration: "10 mins", completed: false },
  { id: "a3", title: "Breathing Exercises", description: "4-7-8 breathing technique for relaxation", category: "activities", duration: "5 mins", completed: false },
  { id: "a4", title: "Nature Walk", description: "Connect with nature and clear your mind", category: "activities", duration: "30 mins", completed: false }
];

const dummyBooks: Suggestion[] = [
  { id: "b1", title: "The Power of Now", description: "Eckhart Tolle's guide to spiritual enlightenment", category: "books", completed: false },
  { id: "b2", title: "Atomic Habits", description: "Build good habits and break bad ones", category: "books", completed: false },
  { id: "b3", title: "The Untethered Soul", description: "Journey beyond yourself with Michael Singer", category: "books", completed: false },
  { id: "b4", title: "Wherever You Go, There You Are", description: "Mindfulness meditation in everyday life", category: "books", completed: false }
];

const dummyMeditation: Suggestion[] = [
  { id: "m1", title: "Body Scan Meditation", description: "Progressive relaxation technique", category: "meditation", duration: "15 mins", completed: false },
  { id: "m2", title: "Loving-Kindness Practice", description: "Cultivate compassion for yourself and others", category: "meditation", duration: "10 mins", completed: false },
  { id: "m3", title: "Mindful Breathing", description: "Focus on your breath to anchor in the present", category: "meditation", duration: "5 mins", completed: false }
];

const dummySelfCare: Suggestion[] = [
  { id: "s1", title: "Digital Detox", description: "Take 1 hour away from screens", category: "self-care", duration: "60 mins", completed: false },
  { id: "s2", title: "Warm Bath Relaxation", description: "Add Epsom salts and essential oils", category: "self-care", duration: "30 mins", completed: false },
  { id: "s3", title: "Positive Affirmations", description: "Repeat empowering statements to yourself", category: "self-care", duration: "5 mins", completed: false }
];

export default function SuggestionsPage() {
  const [videos, setVideos] = useState<Suggestion[]>([]);
  const [music, setMusic] = useState<Suggestion[]>([]);
  const [taglines, setTaglines] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState({
    music: true,
    videos: true
  });
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const storedTaglines = localStorage.getItem('recommendationTaglines');
    const storedCompleted = localStorage.getItem('completedSuggestion');
    // const storedCompleted = localStorage.getItem('completedSuggestions');
    console.log(storedTaglines);
    if (storedTaglines) {
      setTaglines(JSON.parse(storedTaglines));
    } else {
      setTaglines({
        music: defaultMusicTagline,
        video: defaultVideoTagline,
        books: 'Seeking solace: Stories to heal a heavy heart.',
        activities: 'Seeking solace and joy amidst the sadness.'
      });
    }

    if (storedCompleted) {
      setCompletedItems(JSON.parse(storedCompleted));
    }
  }, []);

  useEffect(() => {
    const fetchYouTubeData = async (query: string, category: 'videos' | 'music', setState: React.Dispatch<React.SetStateAction<Suggestion[]>>) => {
      try {
        const cachedData = localStorage.getItem(`${category}Data`);
        if (cachedData) {
          // If data exists in localStorage, use it
          setState(JSON.parse(cachedData));
          return;
        }

        // Otherwise, fetch the data from the YouTube API
        const response = await axios.get(SEARCH_URL, {
          params: {
            part: "snippet",
            q: query,
            type: "video",
            maxResults: 6,
            videoCategoryId: category === "music" ? "10" : undefined,
            key: API_KEY
          }
        });

        const results = response.data.items.map((video: any, index: number) => ({
          id: `yt-${category}-${index}`,
          title: video.snippet.title,
          description: video.snippet.channelTitle,
          category,
          completed: false,
          videoId: video.id.videoId
        }));

        setState(results);
        // Store the fetched data in localStorage for future use
        localStorage.setItem(`${category}Data`, JSON.stringify(results));
      } catch (error) {
        console.error(`Error fetching YouTube ${category}:`, error);
        // Fallback dummy data
        if (category === 'music') {
          setState([
            {
              id: "fm1", title: "Peaceful Piano", description: "Relaxing Music", category: "music", 
              completed: false, videoId: "yJg-Y5byMMw"
            },
            {
              id: "fm2", title: "Meditation Music", description: "Calm Music", category: "music", 
              completed: false, videoId: "1ZYbU82GVz4"
            },
            {
              id: "fm3", title: "Healing Frequencies", description: "Sound Therapy", category: "music", 
              completed: false, videoId: "YpA0lN1hD5E"
            }
          ]);
        } else {
          setState([
            {
              id: "fv1", title: "Buddha's Teachings", description: "Wisdom Channel", category: "videos", 
              completed: false, videoId: "s1Lq9arUSc0"
            },
            {
              id: "fv2", title: "Mindfulness Guide", description: "Meditation Channel", category: "videos", 
              completed: false, videoId: "ssss7tt1WW0"
            },
            {
              id: "fv3", title: "Zen Philosophy", description: "Peaceful Living", category: "videos", 
              completed: false, videoId: "mEELwH_0A5w"
            }
          ]);
        }
      } finally {
        setIsLoading(prev => ({ ...prev, [category]: false }));
      }
    };

    if (taglines.music) {
      fetchYouTubeData(taglines.music, "music", setMusic);
    } else {
      fetchYouTubeData(defaultMusicTagline, "music", setMusic);
    }

    if (taglines.video) {
      fetchYouTubeData(taglines.video, "videos", setVideos);
    } else {
      fetchYouTubeData(defaultVideoTagline, "videos", setVideos);
    }
  }, [taglines]);

  const handleComplete = (id: string) => {
    const newCompletedItems = {
      ...completedItems,
      [id]: !completedItems[id] // This toggles the current state
    };
    setCompletedItems(newCompletedItems);
    localStorage.setItem('completedSuggestions', JSON.stringify(newCompletedItems));
  };
  

  const SuggestionCard = ({ item }: { item: Suggestion }) => {
    const Icon = categoryIcons[item.category];
    const colorClass = categoryColors[item.category];
    const isCompleted = completedItems[item.id] || false;
  
    return (
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        className={`relative h-full rounded-xl p-5 shadow-lg transition-all bg-gray-800 border border-gray-700 overflow-hidden flex flex-col ${isCompleted ? 'opacity-70' : ''}`}
      >
        {/* Rest of the card content remains the same */}
        <div className="flex-grow">
          {/* Gradient accent bar */}
          <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${colorClass}`}></div>
          
          <div className="flex items-start justify-between">
            <div className={`rounded-lg p-2 flex items-center justify-center bg-gradient-to-br ${colorClass}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleComplete(item.id);
              }}
              className={`p-1 rounded-full ${isCompleted ? 'text-green-400' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <CheckCircle2 className="w-5 h-5" />
            </button>
          </div>
  
          <h3 className="text-lg font-semibold mt-4 text-white">{item.title}</h3>
          <p className="mt-2 text-gray-300">{item.description}</p>
  
          {item.duration && (
            <div className="mt-3 px-3 py-1 bg-gray-700 rounded-full inline-block text-sm text-gray-300">
              ⏱️ {item.duration}
            </div>
          )}
        </div>
  
        {item.videoId && (
          <div className="mt-4 rounded-lg overflow-hidden">
            <iframe
              width="100%"
              height="160"
              src={`https://www.youtube.com/embed/${item.videoId}?modestbranding=1`}
              title={item.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-lg"
            ></iframe>
          </div>
        )}
  
        {isCompleted && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] rounded-xl flex items-center justify-center">
            <span className="text-green-400 font-semibold bg-gray-800 px-3 py-1 rounded-full shadow-sm flex items-center gap-1 text-sm">
              <CheckCircle2 className="w-4 h-4" /> Completed
            </span>
          </div>
        )}
      </motion.div>
    );
  };

  const HorizontalScrollSection = ({ items, title, icon: Icon, loading }: {
    items: Suggestion[], 
    title: string, 
    icon: React.ComponentType<{ className?: string }>,
    loading?: boolean
  }) => {
    const scrollRef = React.useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
      if (scrollRef.current) {
        const scrollAmount = direction === 'right' ? 300 : -300;
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    };

    return (
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <Icon className="w-6 h-6 text-white" />
          <h2 className="text-2xl font-semibold text-white">{title}</h2>
          {loading && <span className="text-sm text-gray-400 ml-2">Loading...</span>}
        </div>
        
        <div className="relative">
          <button 
            onClick={() => scroll('left')} 
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-800/80 hover:bg-gray-700/90 rounded-full p-2 ml-2"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          
          <div 
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide"
            style={{ scrollbarWidth: 'none' }}
          >
            {items.map((item) => (
              <div key={item.id} className="flex-shrink-0 w-72">
                <SuggestionCard item={item} />
              </div>
            ))}
          </div>
          
          <button 
            onClick={() => scroll('right')} 
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gray-800/80 hover:bg-gray-700/90 rounded-full p-2 mr-2"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 py-16 px-4 mt-16">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Your Wellness Journey</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-gray-300">
            Personalized suggestions to nurture your mind, body, and soul
          </p>
          <div className="mt-8 flex justify-center gap-4">
            {[Heart, Sun, Coffee, Feather, Smile].map((Icon, index) => (
              <div key={index} className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition">
                <Icon className="w-6 h-6 text-white" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-12 px-4">
        {/* Activities Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-semibold text-white">Mindful Activities</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dummyActivities.map(item => (
              <SuggestionCard 
                key={item.id} 
                item={{ ...item, completed: completedItems[item.id] || false }} 
              />
            ))}
          </div>
        </section>

        {/* Meditation Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Moon className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-semibold text-white">Meditation Practices</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dummyMeditation.map(item => (
              <SuggestionCard 
                key={item.id} 
                item={{ ...item, completed: completedItems[item.id] || false }} 
              />
            ))}
          </div>
        </section>

        {/* Music Section - Horizontal Scroll */}
        <HorizontalScrollSection 
          items={music.map(item => ({ ...item, completed: completedItems[item.id] || false }))}
          title="Soothing Music"
          icon={Music}
          loading={isLoading.music}
        />

        {/* Videos Section - Horizontal Scroll */}
        <HorizontalScrollSection 
          items={videos.map(item => ({ ...item, completed: completedItems[item.id] || false }))}
          title="Inspirational Videos"
          icon={Youtube}
          loading={isLoading.videos}
        />

        {/* Books Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Book className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-semibold text-white">Healing Reads</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dummyBooks.map(item => (
              <SuggestionCard 
                key={item.id} 
                item={{ ...item, completed: completedItems[item.id] || false }} 
              />
            ))}
          </div>
        </section>

        {/* Self-Care Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Heart className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-semibold text-white">Self-Care Rituals</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dummySelfCare.map(item => (
              <SuggestionCard 
                key={item.id} 
                item={{ ...item, completed: completedItems[item.id] || false }} 
              />
            ))}
          </div>
        </section>

        {/* Daily Affirmation */}
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-2xl p-8 text-center border border-gray-700">
          <h3 className="text-2xl font-semibold mb-4">Today's Affirmation</h3>
          <p className="text-xl italic text-gray-200">
            "I am worthy of love, peace, and happiness. Each day, I grow stronger and more resilient."
          </p>
          <button className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition">
            Save Affirmation
          </button>
        </div>
      </div>
    </div>
  );
}