import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Music, Youtube, Book, CheckCircle2, Heart, Moon, Sun, Coffee, Feather, Smile, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { Navbar } from '@/components/ui/navbar';
import '../app/globals.css';
import { getUserData } from '@/utils/userStorage';
import { useRouter } from 'next/router';
import { updateUserData } from '@/utils/userStorage';
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
const API_KEY = "AIzaSyAy5lzA9CqZUmb90Yxd5fj2uEWITgbcMC0";
const SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

// Default fallback data
const defaultMusicTagline = "peaceful meditation music";
const defaultVideoTagline = "Buddha meditation teachings";

const initialTaglines = {
    music: '',
    video: '',
    books: {
        booksnames: [],
        bookdetails: []
    },
    selfcare: {
        selfcarenames: [],
        selfcaredetails: []
    },
    meditationpractices: {
        meditationnames: [],
        meditationdetails: []
    },
    mindfulactivities: {
        mindfulactivitiesnames: [],
        mindfulactivitiesdetails: []
    },
    dailyAffirmation: ''
};

export default function SuggestionsPage() {
  const [videos, setVideos] = useState<Suggestion[]>([]);
  const [music, setMusic] = useState<Suggestion[]>([]);
  const [taglines, setTaglines] = useState(initialTaglines);
  
  const [isLoading, setIsLoading] = useState({
    music: true,
    videos: true
  });
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [userData, setUserData] = useState<UserData | null>(null);
  const router = useRouter();

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.username) {
      const data = getUserData(currentUser.username);
      if (data) {
        setUserData(data);
        setTaglines(data.taglines || initialTaglines);
        setCompletedItems(data.completedItems || {});
      } else {
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleComplete = (id: string) => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.username) {
      const newCompletedItems = {
        ...completedItems,
        [id]: !completedItems[id],
      };
      setCompletedItems(newCompletedItems);
      updateUserData(currentUser.username, {
        completedItems: newCompletedItems,
      });
    }
  };

  useEffect(() => {
    const fetchYouTubeData = async (query: string, category: 'music' | 'videos', setState: React.Dispatch<React.SetStateAction<Suggestion[]>>, duration: 'medium' | 'medium') => {
      try {
        const cachedData = localStorage.getItem(`${category}Data`);
        
        if (cachedData) {
          setState(JSON.parse(cachedData));
        }

        // Fetch the data from the YouTube API
        const response = await axios.get(SEARCH_URL, {
          params: {
            part: "snippet",
            q: query,
            type: "video",
            maxResults: 6,
            key: API_KEY,
            videoDuration: duration // Use the duration parameter here
          }
        });

        const results: Suggestion[] = response.data.items.map((video: { id: { videoId: string }; snippet: { title: string; channelTitle: string } }, index: number) => ({
          id: `yt-${category}-${index}`,
          title: video.snippet.title,
          description: video.snippet.channelTitle,
          category,
          completed: false,
          videoId: video.id.videoId
        }));

        setState(results);
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

    // Only fetch data if taglines have valid values
    if (taglines.music || taglines.video) {
      if (taglines.music) {
        fetchYouTubeData(taglines.music, "music", setMusic, 'short');
        console.log(taglines.music);
      } else {
        fetchYouTubeData(defaultMusicTagline, "music", setMusic, 'short');
        console.log(defaultMusicTagline);
      }

      if (taglines.video) {
        fetchYouTubeData(taglines.video + " Knowledge Content", "videos", setVideos, 'medium');
        console.log(taglines.video);
      } else {
        fetchYouTubeData(defaultVideoTagline, "videos", setVideos, 'medium');
        console.log(defaultVideoTagline);
      }
    }
  }, [taglines]); // Depend on the entire taglines object

  
  

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
        <div className="flex-grow">
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
              title="Mark as completed"
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
            title="Scroll left"
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
            title="Scroll right"
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
            {taglines.mindfulactivities.mindfulactivitiesnames.map((name, index) => (
              <SuggestionCard 
                key={`activity-${index}`} 
                item={{
                  id: `activity-${index}`,
                  title: name,
                  description: taglines.mindfulactivities.mindfulactivitiesdetails[index],
                  category: 'activities',
                  completed: completedItems[`activity-${index}`] || false
                }} 
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
            {taglines.meditationpractices.meditationnames.map((name, index) => (
              <SuggestionCard 
                key={`meditation-${index}`} 
                item={{
                  id: `meditation-${index}`,
                  title: name,
                  description: taglines.meditationpractices.meditationdetails[index],
                  category: 'meditation',
                  completed: completedItems[`meditation-${index}`] || false
                }} 
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
            {taglines.books.booksnames.map((name, index) => (
              <SuggestionCard 
                key={`book-${index}`} 
                item={{
                  id: `book-${index}`,
                  title: name,
                  description: taglines.books.bookdetails[index],
                  category: 'books',
                  completed: completedItems[`book-${index}`] || false
                }} 
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
            {taglines.selfcare.selfcarenames.map((name, index) => (
              <SuggestionCard 
                key={`selfcare-${index}`} 
                item={{
                  id: `selfcare-${index}`,
                  title: name,
                  description: taglines.selfcare.selfcaredetails[index],
                  category: 'self-care',
                  completed: completedItems[`selfcare-${index}`] || false
                }} 
              />
            ))}
          </div>
        </section>

        {/* Daily Affirmation */}
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-2xl p-8 text-center border border-gray-700">
          <h3 className="text-2xl font-semibold mb-4">Today&apos;s Affirmation</h3>
          <p className="text-xl italic text-gray-200">
            &quot;{taglines.dailyAffirmation}&quot;
          </p>
          <button className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition">
            Save Affirmation
          </button>
        </div>
      </div>
    </div>
  );
}