"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Mic, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import '../app/globals.css';

interface Question {
  question: string;
  options: { 
    emoji?: string; 
    text: string; 
    imageUrl?: string;
  }[];
  multiSelect?: boolean;
  maxSelections?: number;
}

const questions: Question[] = [
  {
    question: "🎉 Your ideal Friday night is…",
    options: [
      { emoji: "🍿", text: "Netflix, PJs, and snacks (I'm a cozy hermit!)" },
      { emoji: "🥳", text: "Party with 100 strangers (The more chaos, the better!)" },
      { emoji: "🎲", text: "Game night with close friends (Small circles rule!)" },
      { emoji: "🚗", text: "Spontaneous road trip (Adventure is my middle name!)" }
    ]
  },
  {
    question: "🌱 How do you handle a super stressful day?",
    options: [
      { emoji: "🍦", text: "Cry into a pint of ice cream (Emotions? I own them!)" },
      { emoji: "🧘", text: "Yoga + meditation (Zen mode activated.)" },
      { emoji: "💬", text: "Vent to your group chat (Drama = therapy.)" },
      { emoji: "🎮", text: "Ignore it and play video games (Stress? Never heard of her.)" }
    ]
  },
  {
    question: "If you were a meme, you'd be…",
    options: [
      { 
        imageUrl: "/images/memes/meme1.jpg",
        text: "\"This is fine\" dog in a burning room (I'm chill… mostly.)" 
      },
      { 
        imageUrl: "/images/memes/meme2.webp",
        text: "\"Distracted boyfriend\" (Ooh, shiny!)" 
      },
      { 
        imageUrl: "/images/memes/meme3.jpg",
        text: "\"Evil Kermit\" (I'm the devil on your shoulder.)" 
      },
      { 
        imageUrl: "/images/memes/meme4.jpg",
        text: "\"Drake rejecting veggies\" (I know what I want!)" 
      }
    ]
  },
  {
    question: "🧐 When making plans, you're the friend who…",
    options: [
      { emoji: "📊", text: "Creates a color-coded spreadsheet (Organized or obsessed? Yes.)" },
      { emoji: "🕊️", text: "Says \"Let's wing it!\" (Plans are for mortals.)" },
      { emoji: "⏰", text: "Forgets until the last minute (Oops, my bad!)" },
      { emoji: "👩", text: "Delegates tasks like a CEO (I'm the leader leader.)" }
    ]
  },
  {
    question: "🚀 Your life motto is…",
    options: [
      { emoji: "💤", text: "\"Sleep is my superpower\" (Nap champion!)" },
      { emoji: "🤪", text: "\"Why be normal?\" (Chaotic good vibes!)" },
      { emoji: "🧠", text: "\"Trust the process\" (Slow and steady!)" },
      { emoji: "🚀", text: "\"Go big or go home\" (Maximum effort, always!)" }
    ]
  }
];

export default function QuestionsPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | number[]>>({});
  const [multiSelectAnswers, setMultiSelectAnswers] = useState<number[]>([]);
  const [showTextInput, setShowTextInput] = useState(false);
  const [description, setDescription] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const progress = ((currentQuestion) / questions.length) * 100;

  const handleAnswer = (value: number) => {
    const currentQ = questions[currentQuestion];
    
    if (currentQ.multiSelect) {
      const newMultiAnswers = [...multiSelectAnswers];
      const index = newMultiAnswers.indexOf(value);
      
      if (index > -1) {
        newMultiAnswers.splice(index, 1);
      } else {
        if (newMultiAnswers.length < (currentQ.maxSelections || 3)) {
          newMultiAnswers.push(value);
        }
      }
      
      setMultiSelectAnswers(newMultiAnswers);
      setAnswers({ ...answers, [currentQuestion]: newMultiAnswers });
    } else {
      setAnswers({ ...answers, [currentQuestion]: value });
      if (currentQuestion < questions.length - 1) {
        setTimeout(() => setCurrentQuestion(c => c + 1), 300);
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mediaRecorder.mimeType });
        // Split the combined stream into video and audio
        setVideoBlob(blob);
        setAudioBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing media devices:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('answers', JSON.stringify(answers));
    formData.append('description', description);
    
    if (videoBlob) {
      formData.append('video', new File([videoBlob], 'video.webm', { type: 'video/webm' }));
    }
    if (audioBlob) {
      formData.append('audio', new File([audioBlob], 'audio.wav', { type: 'audio/wav' }));
    }

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('recommendationTaglines', JSON.stringify(data.taglines));
        router.push('/chatbot');
      } else {
        console.error('Submission failed');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(c => c + 1);
    } else {
      setShowTextInput(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-4 relative">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gray-200">
        <motion.div
          className="h-full bg-purple-600 transition-all duration-300 ease-out"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        {!showTextInput ? (
          <motion.div
            key={`question-${currentQuestion}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-2xl w-full bg-white backdrop-blur-lg rounded-2xl p-8 shadow-lg border border-white/20"
          >
            <h3 className="text-2xl font-semibold text-gray-800 mb-8">
              {questions[currentQuestion].question}
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {questions[currentQuestion].options.map((option, index) => {
                const isSelected = questions[currentQuestion].multiSelect 
                  ? multiSelectAnswers.includes(index)
                  : answers[currentQuestion] === index;
                
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className={`p-4 rounded-xl transition-all duration-200 flex items-center gap-4
                      ${isSelected 
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-white hover:bg-purple-50 border border-gray-200 hover:border-purple-200'}
                      ${questions[currentQuestion].multiSelect ? 'pr-6' : ''}`}
                  >
                    {option.emoji && (
                      <span className="text-3xl">{option.emoji}</span>
                    )}
                    {option.imageUrl && (
                      <img 
                        src={option.imageUrl} 
                        alt={option.text} 
                        className="w-24 h-24 object-contain rounded-lg bg-gray-50"
                      />
                    )}
                    <span className="text-left flex-1">{option.text}</span>
                    {questions[currentQuestion].multiSelect && (
                      <div className={`w-5 h-5 flex items-center justify-center rounded-full 
                        ${isSelected ? 'bg-white text-purple-600' : 'bg-gray-200'}`}>
                        {isSelected && <Check size={14} />}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {(!questions[currentQuestion].multiSelect || 
              (questions[currentQuestion].multiSelect && multiSelectAnswers.length > 0)) && (
              <div className="mt-8 flex justify-end">
                <button
                  onClick={nextQuestion}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  disabled={questions[currentQuestion].multiSelect && 
                    multiSelectAnswers.length < (questions[currentQuestion].maxSelections || 3)}
                >
                  {currentQuestion === questions.length - 1 ? 'Next →' : 'Next →'}
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
            className="max-w-2xl w-full bg-white backdrop-blur-lg rounded-2xl p-8 shadow-lg border border-white/20"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Describe Your Concerns</h2>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-32 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Please describe any specific concerns or challenges you're facing..."
            />
            
            <div className="mt-6 space-y-4">
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                {isRecording ? (
                  <>
                    <Camera size={18} />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Camera size={18} />
                    Start Recording
                  </>
                )}
              </button>
              {isRecording && (
                <video ref={videoRef} autoPlay muted className="mt-4 w-full rounded-lg" />
              )}
            </div>
            
            <button
              className="mt-8 w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
              onClick={handleSubmit}
            >
              Submit
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}