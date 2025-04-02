import { motion } from "framer-motion";
import { Music, Book, Video, Activity } from "lucide-react";

export default function PersonalizedSuggestions() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl my-8"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-emerald-500/20 rounded-lg">
          <Activity className="w-6 h-6 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-medium text-white">Personalized Suggestions</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/5 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <Video className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-medium text-white">Video Content</h3>
          </div>
          <p className="text-gray-300">
            Curated video recommendations based on your emotional state and interests.
          </p>
        </div>

        <div className="bg-white/5 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <Music className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-medium text-white">Music Therapy</h3>
          </div>
          <p className="text-gray-300">
            Personalized playlists and music suggestions to match your mood and needs.
          </p>
        </div>

        <div className="bg-white/5 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <Book className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-medium text-white">Reading Material</h3>
          </div>
          <p className="text-gray-300">
            Book recommendations and articles tailored to your personality and growth areas.
          </p>
        </div>

        <div className="bg-white/5 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-medium text-white">Activities</h3>
          </div>
          <p className="text-gray-300">
            Customized activities and exercises to support your mental well-being journey.
          </p>
        </div>
      </div>
    </motion.div>
  );
} 