"use client";

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const questions = [
  {
    question: "If you were a character in a movie, what role would you play?",
    options: [
      { emoji: "🦸", text: "The Hero (brave and determined)" },
      { emoji: "🧙", text: "The Wise Mentor (helpful and insightful)" },
      { emoji: "🎭", text: "The Comedian (funny and lighthearted)" },
      { emoji: "🕵️", text: "The Detective (curious and analytical)" },
      { emoji: "🖤", text: "The Anti-Hero (flawed but relatable)" }
    ]
  },
  {
    question: "What's your go-to way to spend a free afternoon?",
    options: [
      { emoji: "📚", text: "Reading a book or learning something new" },
      { emoji: "🎨", text: "Creating art, music, or writing" },
      { emoji: "🏋️", text: "Exercising or playing sports" },
      { emoji: "👥", text: "Hanging out with friends or family" },
      { emoji: "🛋️", text: "Relaxing with a movie or video games" }
    ]
  },
  {
    question: "If you could instantly master any skill, what would it be?",
    options: [
      { emoji: "🎤", text: "Public speaking or performing" },
      { emoji: "🧠", text: "Solving complex problems" },
      { emoji: "🖌️", text: "Painting, drawing, or designing" },
      { emoji: "🧘", text: "Meditation or mindfulness" },
      { emoji: "🕹️", text: "Gaming or coding" }
    ]
  },
  {
    question: "What's your ideal weekend getaway?",
    options: [
      { emoji: "🌊", text: "A beach vacation (relaxing and sunny)" },
      { emoji: "🏔️", text: "A mountain retreat (peaceful and scenic)" },
      { emoji: "🏙️", text: "A city adventure (exploring and bustling)" },
      { emoji: "🏕️", text: "Camping in nature (outdoorsy and rustic)" },
      { emoji: "🏠", text: "Staying home (cozy and comfortable)" }
    ]
  },
  {
    question: "How do you usually make decisions?",
    options: [
      { emoji: "🧠", text: "Logic and reasoning (I weigh the pros and cons)" },
      { emoji: "💖", text: "Gut feeling (I trust my instincts)" },
      { emoji: "👥", text: "Advice from others (I ask friends or family)" },
      { emoji: "🎲", text: "Spontaneity (I go with the flow)" },
      { emoji: "🕵️", text: "Research (I gather all the facts first)" }
    ]
  },
  {
    question: "What's your superpower in a team setting?",
    options: [
      { emoji: "💡", text: "Coming up with creative ideas" },
      { emoji: "🤝", text: "Bringing people together and mediating" },
      { emoji: "🛠️", text: "Solving problems and fixing things" },
      { emoji: "👑", text: "Leading and organizing the group" },
      { emoji: "🔋", text: "Keeping everyone motivated and positive" }
    ]
  },
  {
    question: "If your life had a theme song, what would it be?",
    options: [
      { emoji: "🎵", text: "Upbeat and energetic (e.g., pop or rock)" },
      { emoji: "🎻", text: "Calm and soothing (e.g., classical or acoustic)" },
      { emoji: "🎤", text: "Bold and empowering (e.g., hip-hop or anthem)" },
      { emoji: "🎸", text: "Nostalgic and reflective (e.g., indie or folk)" },
      { emoji: "🎧", text: "Eclectic and unique (e.g., experimental or jazz)" }
    ]
  },
  {
    question: "What's your favorite way to connect with others?",
    options: [
      { emoji: "🗣️", text: "Deep conversations (one-on-one or small groups)" },
      { emoji: "🎉", text: "Social events (parties or gatherings)" },
      { emoji: "🎮", text: "Online gaming or virtual hangouts" },
      { emoji: "📱", text: "Texting or social media" },
      { emoji: "🧘", text: "Shared activities (yoga, sports, or hobbies)" }
    ]
  },
  {
    question: "What's your approach to solving a big problem?",
    options: [
      { emoji: "🧩", text: "Break it into smaller pieces and tackle them one by one" },
      { emoji: "🌀", text: "Jump in headfirst and figure it out as I go" },
      { emoji: "👥", text: "Ask for help or collaborate with others" },
      { emoji: "🧠", text: "Analyze it from every angle before taking action" },
      { emoji: "🧘", text: "Take a step back and reflect before deciding" }
    ]
  },
  {
    question: "Pick three emojis that best describe you:",
    options: [
      { emoji: "😊", text: "Friendly and approachable" },
      { emoji: "📊", text: "Analytical and detail-oriented" },
      { emoji: "🎨", text: "Creative and artistic" },
      { emoji: "🧠", text: "Curious and intellectual" },
      { emoji: "🏆", text: "Ambitious and driven" },
      { emoji: "🧘", text: "Calm and reflective" },
      { emoji: "🎉", text: "Fun-loving and energetic" },
      { emoji: "🤝", text: "Supportive and empathetic" },
      { emoji: "🧩", text: "Problem-solver and innovative" },
      { emoji: "🕵️", text: "Mysterious and introspective" }
    ],
    multiSelect: true,
    maxSelections: 3
  }
];

export default function QuestionsPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | number[]>>({});
  const [multiSelectAnswers, setMultiSelectAnswers] = useState<number[]>([]);
  const [showTextInput, setShowTextInput] = useState(false);
  const [description, setDescription] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const progress = ((currentQuestion) / questions.length) * 100;

  const handleAnswer = (value: number) => {
    const currentQ = questions[currentQuestion];
    
    if (currentQ.multiSelect) {
      // Handle multi-select question (last question)
      const newMultiAnswers = [...multiSelectAnswers];
      
      if (newMultiAnswers.includes(value)) {
        // Remove if already selected
        const index = newMultiAnswers.indexOf(value);
        newMultiAnswers.splice(index, 1);
      } else {
        // Add if not already selected and under max
        if (newMultiAnswers.length < (currentQ.maxSelections || 3)) {
          newMultiAnswers.push(value);
        }
      }
      
      setMultiSelectAnswers(newMultiAnswers);
      setAnswers({ ...answers, [currentQuestion]: newMultiAnswers });
      
      // Don't advance automatically for multi-select
    } else {
      // Handle single-select questions
      setAnswers({ ...answers, [currentQuestion]: value });
      
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setShowTextInput(true);
      }
    }
  };

  const handleSubmitMultiSelect = () => {
    if (multiSelectAnswers.length > 0) {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setShowTextInput(true);
      }
    }
  };

  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      const tracks = (videoRef.current?.srcObject as MediaStream)?.getTracks();
      tracks?.forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleSubmitAssessment = () => {
    // Store assessment data in localStorage for use in chatbot
    localStorage.setItem('personalityAnswers', JSON.stringify(answers));
    localStorage.setItem('userDescription', description);
    
    // Navigate to the chatbot page
    router.push('/chatbot');
  };

  const currentQ = questions[currentQuestion];
  const isMultiSelect = currentQ?.multiSelect;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {!showTextInput ? (
          <motion.div
            key="questions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-2xl w-full bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl"
          >
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">Personality Profile</h2>
                <span className="text-sm text-gray-500">Question {currentQuestion + 1} of {questions.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-primary h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            <h3 className="text-xl mb-6 text-gray-700">{currentQ.question}</h3>

            <div className="grid grid-cols-1 gap-3">
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className={cn(
                    "btn btn-lg flex justify-start gap-3 text-left",
                    isMultiSelect 
                      ? multiSelectAnswers.includes(index) 
                        ? "btn-primary text-white" 
                        : "btn-outline hover:bg-primary/10"
                      : answers[currentQuestion] === index 
                        ? "btn-primary text-white" 
                        : "btn-outline hover:bg-primary/10"
                  )}
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <span>{option.text}</span>
                </button>
              ))}
            </div>

            {isMultiSelect && (
              <div className="mt-6 flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Select {currentQ.maxSelections} options that best describe you 
                  ({multiSelectAnswers.length}/{currentQ.maxSelections})
                </p>
                <button
                  onClick={handleSubmitMultiSelect}
                  disabled={multiSelectAnswers.length === 0}
                  className="btn btn-primary"
                >
                  Continue
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="description"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-2xl w-full bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Describe Your Concerns</h2>
            
            <div className="mb-6">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-32 p-4 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Please describe any specific concerns or challenges you're facing..."
              />
            </div>

            <div className="flex gap-4 mb-6">
              <button
                onClick={isRecording ? stopVideoRecording : startVideoRecording}
                className={cn(
                  "btn btn-outline gap-2",
                  isRecording && "btn-error"
                )}
              >
                <Camera className="w-5 h-5" />
                {isRecording ? "Stop Recording" : "Record Video"}
              </button>
              
              <button className="btn btn-outline gap-2">
                <Mic className="w-5 h-5" />
                Record Audio
              </button>
            </div>

            {isRecording && (
              <div className="mb-6">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full rounded-lg"
                />
              </div>
            )}

            <button 
              className="btn btn-primary w-full"
              onClick={handleSubmitAssessment}
            >
              Submit Answers
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}