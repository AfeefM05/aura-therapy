"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Check, ChevronRight, Star, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import "../app/globals.css";

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
      {
        emoji: "🥳",
        text: "Party with 100 strangers (The more chaos, the better!)",
      },
      {
        emoji: "🎲",
        text: "Game night with close friends (Small circles rule!)",
      },
      {
        emoji: "🚗",
        text: "Spontaneous road trip (Adventure is my middle name!)",
      },
    ],
  },
  {
    question: "🌱 How do you handle a super stressful day?",
    options: [
      {
        emoji: "🍦",
        text: "Cry into a pint of ice cream (Emotions? I own them!)",
      },
      { emoji: "🧘", text: "Yoga + meditation (Zen mode activated.)" },
      { emoji: "💬", text: "Vent to your group chat (Drama = therapy.)" },
      {
        emoji: "🎮",
        text: "Ignore it and play video games (Stress? Never heard of her.)",
      },
    ],
  },
  {
    question: "If you were a meme, you'd be…",
    options: [
      {
        imageUrl: "/images/memes/meme1.jpg",
        text: '"This is fine" dog in a burning room (I\'m chill… mostly.)',
      },
      {
        imageUrl: "/images/memes/meme2.webp",
        text: '"Distracted boyfriend" (Ooh, shiny!)',
      },
      {
        imageUrl: "/images/memes/meme3.jpg",
        text: '"Evil Kermit" (I\'m the devil on your shoulder.)',
      },
      {
        imageUrl: "/images/memes/meme4.jpg",
        text: '"Drake rejecting veggies" (I know what I want!)',
      },
    ],
  },
  {
    question: "🧐 When making plans, you're the friend who…",
    options: [
      {
        emoji: "📊",
        text: "Creates a color-coded spreadsheet (Organized or obsessed? Yes.)",
      },
      { emoji: "🕊️", text: 'Says "Let\'s wing it!" (Plans are for mortals.)' },
      { emoji: "⏰", text: "Forgets until the last minute (Oops, my bad!)" },
      {
        emoji: "👩",
        text: "Delegates tasks like a CEO (I'm the leader leader.)",
      },
    ],
  },
  {
    question: "🚀 Your life motto is…",
    options: [
      { emoji: "💤", text: '"Sleep is my superpower" (Nap champion!)' },
      { emoji: "🤪", text: '"Why be normal?" (Chaotic good vibes!)' },
      { emoji: "🧠", text: '"Trust the process" (Slow and steady!)' },
      { emoji: "🚀", text: '"Go big or go home" (Maximum effort, always!)' },
    ],
  },
];

export default function QuestionsPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | number[]>>({});
  const [multiSelectAnswers, setMultiSelectAnswers] = useState<number[]>([]);
  const [showTextInput, setShowTextInput] = useState(false);
  const [description, setDescription] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [taglines, setTaglines] = useState<string[]>([]);
  const [particlePositions, setParticlePositions] = useState<
    { top: string; left: string; size: number }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const positions = Array.from({ length: 15 }).map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 80 + 20,
    }));
    setParticlePositions(positions);
  }, []);

  const progress = (currentQuestion / questions.length) * 100;

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
        setTimeout(() => setCurrentQuestion((c) => c + 1), 300);
      }
    }
  };

  const startRecording = async () => {
    try {
      // Initialize audio context
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // Get both audio and video streams
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
        video: true,
      });
      streamRef.current = stream;

      // Setup video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current
          .play()
          .catch((e) => console.error("Video play error:", e));
      }

      // Create media recorder for audio
      const audioStream = new MediaStream(stream.getAudioTracks());
      const audioOptions = { mimeType: "audio/webm" };
      mediaRecorderRef.current = new MediaRecorder(audioStream, audioOptions);

      // Create media recorder for video
      const videoStream = new MediaStream(stream.getVideoTracks());
      const videoOptions = { mimeType: "video/webm;codecs=vp9" };
      const videoRecorder = new MediaRecorder(videoStream, videoOptions);

      // Reset chunks
      audioChunksRef.current = [];
      const videoChunks: Blob[] = [];

      // Audio recorder setup
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      // Video recorder setup
      videoRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          videoChunks.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        // Combine all audio chunks
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        // Convert to WAV
        try {
          const wavBlob = await convertToWav(audioBlob);
          setAudioBlob(wavBlob);
        } catch (error) {
          console.error("Error converting to WAV:", error);
        }
      };

      videoRecorder.onstop = () => {
        const videoBlob = new Blob(videoChunks, { type: "video/webm" });
        setVideoBlob(videoBlob);
      };

      // Start both recorders
      mediaRecorderRef.current.start(100); // Collect data every 100ms
      videoRecorder.start(100);
      setIsRecording(true);

      // Store video recorder reference
      mediaRecorderRef.current["videoRecorder"] = videoRecorder;
    } catch (err) {
      console.error("Error accessing media devices:", err);
      stopRecording();
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();

      // Stop the video recorder if it exists
      if (mediaRecorderRef.current["videoRecorder"]) {
        mediaRecorderRef.current["videoRecorder"].stop();
      }
    }

    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    setIsRecording(false);
  };

  const convertToWav = async (audioBlob: Blob): Promise<Blob> => {
    if (!audioContextRef.current) {
      throw new Error("AudioContext not initialized");
    }

    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContextRef.current.decodeAudioData(
      arrayBuffer
    );

    // Create WAV file from audio buffer
    const wavBlob = encodeWAV(audioBuffer);
    return wavBlob;
  };

  const encodeWAV = (audioBuffer: AudioBuffer): Blob => {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const length = audioBuffer.length;
    const bitsPerSample = 16;
    const bytesPerSample = bitsPerSample / 8;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = length * blockAlign;

    // Buffer size: 44 bytes for header + audio data
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // Helper function to write strings to the DataView
    const writeString = (view: DataView, offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    // Write WAV header
    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + dataSize, true); // File size - 8
    writeString(view, 8, "WAVE");
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(view, 36, "data");
    view.setUint32(40, dataSize, true);

    // Write PCM audio data
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        const sample = Math.max(
          -1,
          Math.min(1, audioBuffer.getChannelData(channel)[i])
        );
        view.setInt16(
          offset,
          sample < 0 ? sample * 0x8000 : sample * 0x7fff,
          true
        );
        offset += 2;
      }
    }

    return new Blob([view], { type: "audio/wav" });
  };

  const LoadingComponent = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div className="text-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-20 h-20 mx-auto mb-4"
        >
          <Sparkles className="w-full h-full text-purple-500" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Analyzing Your Responses
        </h2>
        <p className="text-gray-300">
          We're crafting personalized insights just for you...
        </p>
        <div className="mt-4 flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-purple-500 rounded-full"
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );

  const handleSubmit = async () => {
    if (!videoBlob) {
      console.error("No video recorded");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("answers", JSON.stringify(Object.values(answers)));
    formData.append("description", description);
    formData.append(
      "video",
      new File([videoBlob], "video.webm", {
        type: "video/webm",
      })
    );

    if (audioBlob) {
      formData.append(
        "audio",
        new File([audioBlob], "audio.wav", {
          type: "audio/wav",
        })
      );
    }

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const result = await response.json();
      console.log("Submission successful:", result);

      const {
        textAnalysis,
        audioAnalysis,
        videoAnalysis,
        answers,
        description,
      } = result;

      const taglineResponse = await fetch("/api/generate-taglines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          textAnalysis,
          audioAnalysis,
          videoAnalysis,
          answers,
          description,
        }),
      });

      if (!taglineResponse.ok) throw new Error("Tagline generation failed");

      const taglineResult = await taglineResponse.json();
      console.log("Taglines generated:", taglineResult.taglines);

      localStorage.setItem(
        "recommendationTaglines",
        JSON.stringify(taglineResult.taglines)
      );
      localStorage.removeItem("videosData");
      localStorage.removeItem("musicData");
      localStorage.removeItem("completedSuggestions");

      router.push("/suggestions");
    } catch (error) {
      console.error("Error submitting form:", error);
      setIsLoading(false);
    }
  };
  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((c) => c + 1);
    } else {
      setShowTextInput(true);
    }
  };

  useEffect(() => {
    // Retrieve taglines from local storage when the component mounts
    const storedTaglines = localStorage.getItem("taglines");
    if (storedTaglines) {
      setTaglines(JSON.parse(storedTaglines));
    }

    // Clean up on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white overflow-hidden relative flex flex-col moving-background">
      {isLoading && <LoadingComponent />}
      {/* Floating particles background */}
      <div className="fixed inset-0 z-0">
        {particlePositions.map((position, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white opacity-5"
            style={{
              width: position.size,
              height: position.size,
              top: position.top,
              left: position.left,
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              x: [0, Math.random() * 100 - 50],
            }}
            transition={{
              duration: Math.random() * 15 + 5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Main container with flex column to use full height */}
      <div className="w-full max-w-6xl mx-auto px-4 pt-4 pb-4 flex flex-col flex-1 relative z-10">
        {/* Reduced top margin for header */}
        <motion.div
          className="text-center mb-3"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-emerald-300 to-blue-500">
              Personality Quest
            </span>
          </h1>
          <p className="text-purple-300 text-lg">
            Discover your inner potential & unlock your hidden talents
          </p>
        </motion.div>

        {/* Slimmer progress bar */}
        <div className="w-full max-w-2xl mx-auto h-2 bg-gray-800 rounded-full overflow-hidden mb-8 mt-4">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Main content area with flex layout - taking remaining height */}
        <div className="flex flex-col md:flex-row gap-4 flex-1 overflow-hidden">
          {/* Left section: Questions - using flex-1 to take available space */}
          <div className="w-full md:w-2/3 flex-1 flex flex-col">
            <AnimatePresence mode="wait">
              {!showTextInput ? (
                <motion.div
                  key={`question-${currentQuestion}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gradient-to-b from-gray-900 to-black rounded-xl overflow-hidden shadow-xl border border-gray-800 flex flex-col mt-10"
                >
                  {/* Question header - more compact */}
                  <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 p-3 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full text-white font-bold shrink-0">
                        {currentQuestion + 1}
                      </div>
                      <h3 className="text-xl font-bold text-white">
                        {questions[currentQuestion].question}
                      </h3>
                    </div>
                  </div>

                  {/* Options with scrollable area - flex-1 to take available space */}
                  <div className="p-3  overflow-y-auto space-y-2">
                    {questions[currentQuestion].options.map((option, index) => {
                      const isSelected = questions[currentQuestion].multiSelect
                        ? multiSelectAnswers.includes(index)
                        : answers[currentQuestion] === index;

                      return (
                        <motion.button
                          key={index}
                          onClick={() => handleAnswer(index)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`w-full p-3 rounded-lg ${
                            isSelected
                              ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                              : "bg-gray-900/70 hover:bg-gray-800 border border-gray-700"
                          } transition-all flex items-center gap-3`}
                        >
                          {isSelected && (
                            <motion.div
                              className="absolute inset-0 bg-blue-500/10 rounded-lg"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: [0, 0.5, 0] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          )}

                          <div className="flex items-center justify-center bg-gray-900 w-10 h-10 rounded-lg shrink-0">
                            {option.emoji && (
                              <span className="text-2xl">{option.emoji}</span>
                            )}
                            {option.imageUrl && (
                              <img
                                src={option.imageUrl}
                                alt={option.text}
                                className="w-10 h-10 object-cover rounded"
                              />
                            )}
                          </div>

                          <span className="text-left flex-1">
                            {option.text}
                          </span>

                          <div
                            className={`w-6 h-6 flex items-center justify-center rounded-full shrink-0
                            ${
                              isSelected
                                ? "bg-white text-blue-600"
                                : "bg-gray-800 border border-gray-600"
                            }`}
                          >
                            {isSelected && <Check size={12} />}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Footer with navigation buttons - more compact */}
                  <div className="p-3 border-t border-gray-800 flex justify-between items-center">
                    <div className="flex space-x-1">
                      {questions.map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-2 h-2 rounded-full ${
                            idx === currentQuestion
                              ? "bg-purple-500"
                              : idx < currentQuestion
                              ? "bg-blue-500"
                              : "bg-gray-700"
                          }`}
                        />
                      ))}
                    </div>

                    {(!questions[currentQuestion].multiSelect ||
                      (questions[currentQuestion].multiSelect &&
                        multiSelectAnswers.length > 0)) && (
                      <motion.button
                        onClick={nextQuestion}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                      >
                        {currentQuestion === questions.length - 1
                          ? "Finish"
                          : "Next"}
                        <ChevronRight size={16} />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="description"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gradient-to-b from-gray-900 to-black rounded-xl overflow-hidden shadow-xl border border-gray-800 mt-10  flex flex-col"
                >
                  <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 p-3 border-b border-gray-800">
                    <h2 className="text-xl font-bold text-white flex items-center">
                      <Star className="mr-2 text-purple-400" size={20} />
                      Final Step: Tell Us More
                    </h2>
                  </div>

                  <div className="p-3 space-y-4 overflow-y-auto">
                    <div className="space-y-2">
                      <p className="text-purple-300">
                        Share anything specific you'd like help with:
                      </p>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full h-32 p-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-900 text-white resize-none"
                        placeholder="I'm feeling stuck with my career choices..."
                      />
                    </div>

                    <div className="space-y-2">
                      <p className="text-purple-300 flex items-center">
                        <Camera className="mr-2 text-purple-400" size={16} />
                        Record your message Here:
                      </p>

                      <motion.button
                        type="button"
                        onClick={isRecording ? stopRecording : startRecording}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors w-full ${
                          isRecording
                            ? "bg-red-600 text-white"
                            : "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                        }`}
                      >
                        {isRecording ? (
                          <>
                            <Camera size={16} />
                            Stop Recording
                          </>
                        ) : (
                          <>
                            <Camera size={16} />
                            {videoBlob ? "Record Again" : "Start Recording"}
                          </>
                        )}
                      </motion.button>

                      {!isRecording && (videoBlob || audioBlob) && (
                        <div className="space-y-2 mt-2">
                          {videoBlob && (
                            <div className="text-xs bg-gray-800 p-2 rounded-lg flex items-center gap-2">
                              <Check className="text-green-400" size={12} />
                              <span>
                                Video recorded (
                                {Math.round(videoBlob.size / 1024)} KB)
                              </span>
                              <button
                                onClick={() =>
                                  window.open(
                                    URL.createObjectURL(videoBlob),
                                    "_blank"
                                  )
                                }
                                className="text-blue-400 hover:underline ml-auto"
                              >
                                Preview
                              </button>
                            </div>
                          )}
                          {audioBlob && (
                            <div className="text-xs bg-gray-800 p-2 rounded-lg flex items-center gap-2">
                              <Check className="text-green-400" size={12} />
                              <span>
                                Audio recorded (
                                {Math.round(audioBlob.size / 1024)} KB)
                              </span>
                              <button
                                onClick={() => {
                                  const audio = new Audio(
                                    URL.createObjectURL(audioBlob)
                                  );
                                  audio.play();
                                }}
                                className="text-blue-400 hover:underline ml-auto"
                              >
                                Play
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-3 border-t border-gray-800">
                    <motion.button
                      className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white py-3 rounded-lg hover:shadow-lg transition-colors font-bold"
                      onClick={handleSubmit}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Reveal My Results
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right section: Insights */}
          <motion.div
            className="w-full md:w-1/3 flex flex-col gap-3 max-h-full"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="bg-gradient-to-b from-gray-900 to-black rounded-xl overflow-hidden shadow-xl border border-gray-800">
              <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 p-3 border-b border-gray-800">
                <h2 className="text-lg font-bold text-white flex items-center">
                  <Sparkles className="mr-2 text-purple-400" size={16} />
                  Your Personality Insights
                </h2>
              </div>

              <div className="p-3 space-y-2">
                {Object.keys(answers).length === 0 ? (
                  <p className="text-gray-400 italic">
                    Complete the questions to see your personality insights...
                  </p>
                ) : (
                  <>
                    {[
                      { title: "Your Cosmic Twin", value: "Tony Stark" },
                      { title: "Your Spirit Animal", value: "A Strategic Fox" },
                      {
                        title: "Your Superpower",
                        value: "Turning Ideas Into Reality",
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-800/50 p-3 rounded-lg flex justify-between items-center"
                      >
                        <span className="text-purple-300">{item.title}</span>
                        <span className="text-white font-medium">
                          {item.value}
                        </span>
                      </div>
                    ))}

                    <div className="mt-3 bg-blue-900/20 border border-blue-800/30 rounded-lg p-2">
                      <h3 className="text-blue-300 text-xs uppercase font-bold mb-1">
                        Completion Stats
                      </h3>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-xs">
                          Questions Completed
                        </span>
                        <span className="text-white text-xs font-medium">
                          {Object.keys(answers).length} / {questions.length}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Tips section - larger text for better readability */}
            <div className="bg-gradient-to-b from-gray-900 to-black rounded-xl overflow-hidden shadow-xl border border-gray-800 flex-1">
              <div className="p-3">
                <h3 className="text-purple-300 font-bold mb-2 text-lg">
                  💡 Pro Tips
                </h3>
                <ul className="text-gray-300 space-y-2 text-base">
                  <li className="flex gap-2 items-center">
                    <span className="text-blue-400 text-xl">•</span>
                    <p>Answer honestly for the most accurate results</p>
                  </li>
                  <li className="flex gap-2 items-center">
                    <span className="text-blue-400 text-xl">•</span>
                    <p>Go with your first instinct</p>
                  </li>
                  <li className="flex gap-2 items-center">
                    <span className="text-blue-400 text-xl">•</span>
                    <p>
                      Add details in the final step for personalized insights
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Display taglines if available */}
      {taglines.length > 0 && (
        <div className="p-4 bg-gray-800 rounded-lg mt-4">
          <h2 className="text-lg font-bold text-purple-300">
            Generated Taglines:
          </h2>
          <ul className="list-disc pl-5">
            {taglines.map((tagline, index) => (
              <li key={index} className="text-gray-300">
                {tagline}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
