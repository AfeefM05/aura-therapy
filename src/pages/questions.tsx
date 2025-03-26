"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Mic, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import '../app/globals.css';

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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingType, setRecordingType] = useState<'video' | 'audio' | null>(null);

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
  const startRecording = async (type: 'video' | 'audio') => {
    try {
      setRecordingType(type);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === 'video',
        audio: true,
      });

      if (type === 'video' && videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mediaRecorder.mimeType });
        if (type === 'video') setVideoBlob(blob);
        else setAudioBlob(blob);
      };

      mediaRecorder.start();
    } catch (err) {
      console.error('Error accessing media devices:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setRecordingType(null);
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    
    // Add text data
    formData.append('answers', JSON.stringify(answers));
    formData.append('description', description);
    
    // Add media files
    if (videoBlob) {
      formData.append('video', new File([videoBlob], 'video.webm', { type: 'video/webm' }));
    }
    if (audioBlob) {
      formData.append('audio', new File([audioBlob], 'audio.webm', { type: 'audio/webm' }));
    }

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        router.push('/chatbot')
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
                    <span className="text-3xl">{option.emoji}</span>
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

            {(questions[currentQuestion].multiSelect && multiSelectAnswers.length > 0) && (
              <div className="mt-8 flex justify-end">
                <button
                  onClick={nextQuestion}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  disabled={multiSelectAnswers.length < (questions[currentQuestion].maxSelections || 3)}
                >
                  Next →
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
            
            <div className="mt-6 flex gap-4">
            <button
              type="button"
              onClick={() => recordingType === 'video' ? stopRecording() : startRecording('video')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <Camera size={18} />
              {recordingType === 'video' ? 'Stop Recording' : 'Record Video'}
            </button>
            <button
              type="button"
              onClick={() => recordingType === 'audio' ? stopRecording() : startRecording('audio')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <Mic size={18} />
              {recordingType === 'audio' ? 'Stop Recording' : 'Record Audio'}
            </button>
          </div>
          {recordingType === 'video' && (
            <video ref={videoRef} autoPlay muted className="mt-4 w-full rounded-lg" />
          )}

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