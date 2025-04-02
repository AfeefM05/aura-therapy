import { motion } from "framer-motion";
import { User, Brain, Heart } from "lucide-react";

export default function PersonalityAvatar() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl my-8"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-indigo-500/20 rounded-lg">
          <User className="w-6 h-6 text-indigo-400" />
        </div>
        <h2 className="text-2xl font-medium text-white">Personality Avatar</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-medium text-white">Personality Analysis</h3>
          </div>
          <p className="text-gray-300">
            Comprehensive personality assessment through carefully crafted questions and emotional analysis.
          </p>
        </div>

        <div className="bg-white/5 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-medium text-white">Emotional Profile</h3>
          </div>
          <p className="text-gray-300">
            Deep emotional understanding to create a unique avatar that represents your personality and emotional state.
          </p>
        </div>
      </div>

      <div className="mt-6 bg-white/5 p-6 rounded-lg">
        <p className="text-gray-300">
          Your personalized avatar evolves with you, reflecting your growth and emotional journey through our platform.
        </p>
      </div>
    </motion.div>
  );
} 