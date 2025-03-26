'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/ui/navbar';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Heart, Music, Book, CheckCircle2 } from 'lucide-react';
import '../app/globals.css';

const mockProgressData = [
  { date: '2024-03-01', score: 65 },
  { date: '2024-03-02', score: 68 },
  { date: '2024-03-03', score: 75 },
  { date: '2024-03-04', score: 72 },
  { date: '2024-03-05', score: 80 },
  { date: '2024-03-06', score: 78 },
  { date: '2024-03-07', score: 85 },
];

interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: 'activities' | 'music' | 'videos' | 'books';
  duration?: string;
  completed: boolean;
}

const categoryIcons = {
  activities: Activity,
  music: Music,
  videos: Book,
  books: Book,
};

export default function DashboardPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [pendingActivities, setPendingActivities] = useState<Suggestion[]>([]);

  useEffect(() => {
    // Load activities from localStorage
    const savedItems = localStorage.getItem('suggestions');
    if (savedItems) {
      const allActivities = JSON.parse(savedItems) as Suggestion[];
      const pending = allActivities.filter(activity => !activity.completed);
      setPendingActivities(pending);
    }
  }, []);

  const handleComplete = (id: string) => {
    const savedItems = localStorage.getItem('suggestions');
    if (savedItems) {
      const allActivities = JSON.parse(savedItems) as Suggestion[];
      const updatedActivities = allActivities.map(item =>
        item.id === id ? { ...item, completed: true } : item
      );
      localStorage.setItem('suggestions', JSON.stringify(updatedActivities));
      
      // Update pending activities
      const pending = updatedActivities.filter(activity => !activity.completed);
      setPendingActivities(pending);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Navbar />
      
      <div className="pt-20 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Progress Graph */}
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Mental Health Progress</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockProgressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Calendar */}
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Activity Calendar</h2>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </Card>

            {/* Pending Activities */}
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Pending Activities</h2>
              <div className="space-y-4">
                {pendingActivities.map((activity) => {
                  const Icon = categoryIcons[activity.category];
                  return (
                    <div
                      key={activity.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-white/50 border hover:shadow-md transition-shadow"
                    >
                      <div className="p-2 rounded-full bg-primary/10">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium">{activity.title}</span>
                        {activity.duration && (
                          <span className="text-sm text-gray-500 ml-2">({activity.duration})</span>
                        )}
                      </div>
                      <button 
                        onClick={() => handleComplete(activity.id)}
                        className="btn btn-sm btn-outline gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Complete
                      </button>
                    </div>
                  );
                })}
                {pendingActivities.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    No pending activities. Visit the Suggestions page to find new activities!
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* User Information Sidebar */}
          <Card className="lg:col-span-1 p-6 space-y-6">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                <Heart className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold">John Doe</h2>
              <p className="text-muted-foreground">Member since March 2024</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}