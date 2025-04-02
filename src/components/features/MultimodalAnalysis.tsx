import { motion } from "framer-motion";
import { Video, Mic, FileText } from "lucide-react";

export default function MultimodalAnalysis() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl my-8"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-pink-500/20 rounded-lg">
          <Video className="w-6 h-6 text-pink-400" />
        </div>
        <h2 className="text-2xl font-medium text-white">Multimodal Analysis</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <Video className="w-5 h-5 text-pink-400" />
            <h3 className="text-lg font-medium text-white">Video Analysis</h3>
          </div>
          <p className="text-gray-300">
            Custom-trained video model for real-time emotion detection through facial expressions and body language.
          </p>
        </div>

        <div className="bg-white/5 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <Mic className="w-5 h-5 text-pink-400" />
            <h3 className="text-lg font-medium text-white">Audio Analysis</h3>
          </div>
          <p className="text-gray-300">
            Custom-trained audio model for voice tone and speech pattern analysis to understand emotional state.
          </p>
        </div>

        <div className="bg-white/5 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-5 h-5 text-pink-400" />
            <h3 className="text-lg font-medium text-white">Text Analysis</h3>
          </div>
          <p className="text-gray-300">
            Advanced NLP models for understanding written content and emotional context in your messages.
          </p>
        </div>
      </div>
    </motion.div>
  );
} 