"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Music, Youtube, Book, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { Navbar } from '@/components/ui/navbar';
import '../app/globals.css';

interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: 'activities' | 'music' | 'videos' | 'books';
  duration?: string;
  completed: boolean;
  videoId?: string;
}

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

// YouTube API Key (Replace with your actual key)
const API_KEY = "AIzaSyAM1a4R40Nc9AkUPYUqE4WJaRXZWTme7oE";
const SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

// Dummy Data for Activities & Books
const dummyActivities: Suggestion[] = [
  { id: "a1", title: "Yoga Session", description: "A 30-minute relaxing yoga session.", category: "activities", duration: "30 mins", completed: false },
  { id: "a2", title: "Journaling", description: "Write down your thoughts and feelings for self-reflection.", category: "activities", duration: "15 mins", completed: false },
  { id: "a3", title: "Breathing Exercises", description: "Try deep breathing techniques to reduce stress.", category: "activities", duration: "10 mins", completed: false }
];

const dummyBooks: Suggestion[] = [
  { id: "b1", title: "The Power of Now", description: "A guide to spiritual enlightenment and living in the present moment.", category: "books", completed: false },
  { id: "b2", title: "Atomic Habits", description: "Learn how to build good habits and break bad ones.", category: "books", completed: false },
  { id: "b3", title: "The Subtle Art of Not Giving a F*ck", description: "A counterintuitive approach to living a good life.", category: "books", completed: false }
];

export default function SuggestionsPage() {
  const [videos, setVideos] = useState<Suggestion[]>([]);
  const [music, setMusic] = useState<Suggestion[]>([]);
  const tagline = "relaxing meditation"; // Dynamic tagline for fetching recommendations

  useEffect(() => {
    const fetchYouTubeData = async (query: string, category: 'videos' | 'music', setState: React.Dispatch<React.SetStateAction<Suggestion[]>>) => {
      try {
        const response = await axios.get(SEARCH_URL, {
          params: {
            part: "snippet",
            q: query,
            type: "video",
            maxResults: 5,
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
      } catch (error) {
        console.error(`Error fetching YouTube ${category}:`, error);
      }
    };

    fetchYouTubeData(`${tagline} music`, "music", setMusic);
    fetchYouTubeData(tagline, "videos", setVideos);
  }, []);

  const handleComplete = (id: string) => {
    if (dummyActivities.some(item => item.id === id)) {
      dummyActivities.find(item => item.id === id)!.completed = !dummyActivities.find(item => item.id === id)!.completed;
    } else if (dummyBooks.some(item => item.id === id)) {
      dummyBooks.find(item => item.id === id)!.completed = !dummyBooks.find(item => item.id === id)!.completed;
    }
  };

  const SuggestionCard = ({ item }: { item: Suggestion }) => {
    const Icon = categoryIcons[item.category];

    return (
      <motion.div
        whileHover={{ scale: 1.02, translateY: -5 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleComplete(item.id)}
        className="relative cursor-pointer rounded-xl p-6 shadow-lg transition-all bg-gradient-to-br bg-white/80 backdrop-blur-sm border border-white/20"
      >
        <div className="flex items-start justify-between">
          <div className={`rounded-full p-2 w-10 h-10 flex items-center justify-center bg-gradient-to-br ${categoryColors[item.category]}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          {item.completed && <CheckCircle2 className="w-6 h-6 text-green-500" />}
        </div>

        <h3 className="text-xl font-semibold mt-4 text-gray-800">{item.title}</h3>
        <p className="mt-2 text-gray-600">{item.description}</p>

        {item.duration && <div className="mt-4 text-sm text-gray-500">Duration: {item.duration}</div>}

        {item.videoId && (
          <div className="mt-4">
            <iframe
              width="100%"
              height="200"
              src={`https://www.youtube.com/embed/${item.videoId}`}
              title={item.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
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
        
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-6 h-6 text-gray-800" />
            <h2 className="text-2xl font-semibold text-gray-800">Activities</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dummyActivities.map(item => <SuggestionCard key={item.id} item={item} />)}
          </div>
        </section>

        {/* Books Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Book className="w-6 h-6 text-gray-800" />
            <h2 className="text-2xl font-semibold text-gray-800">Books</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dummyBooks.map(item => <SuggestionCard key={item.id} item={item} />)}
          </div>
        </section>

        {/* Music Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Music className="w-6 h-6 text-gray-800" />
            <h2 className="text-2xl font-semibold text-gray-800">Music</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {music.map((item) => (
              <SuggestionCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        {/* Videos Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Youtube className="w-6 h-6 text-gray-800" />
            <h2 className="text-2xl font-semibold text-gray-800">Videos</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((item) => (
              <SuggestionCard key={item.id} item={item} />
            ))}
          </div>
        </section>
        {/* Activities Section */}
        

        {/* Music and Videos Sections (Already Implemented) */}
      </div>
    </div>
  );
}