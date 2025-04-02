import { motion } from "framer-motion";
import { MessageSquare, Brain, Shield } from "lucide-react";

export default function TherapyChatbot() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl my-8"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-purple-500/20 rounded-lg">
          <MessageSquare className="w-6 h-6 text-purple-400" />
        </div>
        <h2 className="text-2xl font-medium text-white">Therapy Chatbot</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-medium text-white">RAG-Powered</h3>
          </div>
          <p className="text-gray-300">
            Advanced Retrieval-Augmented Generation system for accurate and contextually relevant responses.
          </p>
        </div>

        <div className="bg-white/5 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-medium text-white">Therapy-Focused</h3>
          </div>
          <p className="text-gray-300">
            Fine-tuned specifically for therapeutic conversations and mental health support.
          </p>
        </div>

        <div className="bg-white/5 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-medium text-white">Safe & Supportive</h3>
          </div>
          <p className="text-gray-300">
            Trained to provide empathetic, non-judgmental support while maintaining professional boundaries.
          </p>
        </div>
      </div>

      <div className="mt-6 bg-white/5 p-6 rounded-lg">
        <p className="text-gray-300">
          Available 24/7 to provide immediate support, guidance, and resources for your mental well-being journey.
        </p>
      </div>
    </motion.div>
  );
} 