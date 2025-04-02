import { motion } from "framer-motion";
import { Calendar, Clipboard, BookOpen, BarChart } from "lucide-react";

export default function Dashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl my-8"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-blue-500/20 rounded-lg">
          <BarChart className="w-6 h-6 text-blue-400" />
        </div>
        <h2 className="text-2xl font-medium text-white">Personal Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-medium text-white">Daily Check-ins</h3>
          </div>
          <p className="text-gray-300">
            Personalized daily questions to track your mood, progress, and well-being journey.
          </p>
        </div>

        <div className="bg-white/5 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <Clipboard className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-medium text-white">Progress Tracking</h3>
          </div>
          <p className="text-gray-300">
            Visualize your growth and improvements through comprehensive analytics and insights.
          </p>
        </div>

        <div className="bg-white/5 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-medium text-white">Digital Journal</h3>
          </div>
          <p className="text-gray-300">
            Secure space to record your thoughts, feelings, and daily experiences.
          </p>
        </div>

        <div className="bg-white/5 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <BarChart className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-medium text-white">Recovery Insights</h3>
          </div>
          <p className="text-gray-300">
            Track your recovery journey with detailed analytics and personalized recommendations.
          </p>
        </div>
      </div>

      <div className="mt-6 bg-white/5 p-6 rounded-lg">
        <p className="text-gray-300">
          Your personal dashboard provides a comprehensive view of your mental health journey, helping you track progress and stay motivated.
        </p>
      </div>
    </motion.div>
  );
} 