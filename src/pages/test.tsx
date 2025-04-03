"use client";

import React, { useEffect, useState } from "react";
import Vapi from "@vapi-ai/web";
import { User, Mic, ArrowLeft, HeartPulse, MessageSquare, Volume2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import '../app/globals.css'

// Error checking helper function
export const isPublicKeyMissingError = ({ vapiError }) => {
  return (
    !!vapiError &&
    vapiError.error.statusCode === 403 &&
    vapiError.error.error === "Forbidden"
  );
};

const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY);

// Custom hook for API key validation
const usePublicKeyInvalid = () => {
  const [showMsg, setShowMsg] = useState(false);

  useEffect(() => {
    if (showMsg) {
      const timer = setTimeout(() => setShowMsg(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showMsg]);

  return { showMsg, setShowMsg };
};

// Voice level indicator component using DaisyUI progress
const VoiceIndicator = ({ volume, label }) => {
  // Calculate progress bar value (0-100)
  const progressValue = Math.round(volume * 100);
  
  // Determine color based on volume level
  const getProgressColor = () => {
    if (progressValue < 30) return "progress-accent";
    if (progressValue < 70) return "progress-primary";
    return "progress-secondary";
  };

  return (
    <div className="card bg-base-200 shadow-sm p-4">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="badge badge-primary">{progressValue}%</span>
      </div>
      <progress 
        className={`progress ${getProgressColor()} w-full`} 
        value={progressValue} 
        max="100"
      ></progress>
    </div>
  );
};

// Speaking status indicator using DaisyUI badge
const SpeakingStatus = ({ isSpeaking, name }) => {
  return (
    <div className="flex items-center mb-4">
      <div className={`badge ${isSpeaking ? 'badge-secondary' : 'badge-outline'} gap-2`}>
        <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-accent-content' : 'bg-base-content opacity-50'}`}></div>
        {isSpeaking ? `${name} is speaking` : `${name} is listening`}
      </div>
    </div>
  );
};

// Session status component with DaisyUI card
const SessionStatus = ({ timeElapsed, currentTopic }) => {
  return (
    <div className="card bg-base-200 shadow-md mb-6">
      <div className="card-body p-4">
        <div className="flex justify-between items-center">
          <h3 className="card-title text-lg">Therapy Session</h3>
          <div className="badge badge-neutral">{timeElapsed}</div>
        </div>
        <div className="divider my-2"></div>
        <div>
          <span className="text-primary font-medium">Current Topic:</span>
          <p className="mt-1">{currentTopic}</p>
        </div>
      </div>
    </div>
  );
};

export default function TherapistPage() {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [therapistIsSpeaking, setTherapistIsSpeaking] = useState(false);
  const [clientIsSpeaking, setClientIsSpeaking] = useState(false);
  const [therapistVolume, setTherapistVolume] = useState(0);
  const [clientVolume, setClientVolume] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState("00:00");
  const [currentTopic, setCurrentTopic] = useState(
    "Initial check-in and feelings assessment"
  );
  const { showMsg, setShowMsg } = usePublicKeyInvalid();
  const [micError, setMicError] = useState(false);
  const router = useRouter();

  // Timer effect for session duration
  useEffect(() => {
    let timer;
    if (connected) {
      let seconds = 0;
      timer = setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        setTimeElapsed(
          `${mins.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`
        );

        // Simulate changing topics based on time
        if (seconds === 30) setCurrentTopic("Exploring recent emotional challenges");
        if (seconds === 90) setCurrentTopic("Identifying thought patterns");
        if (seconds === 150) setCurrentTopic("Coping strategies discussion");
        if (seconds === 210) setCurrentTopic("Mindfulness exercise");
      }, 1000);
    }
    return () => timer && clearInterval(timer);
  }, [connected]);

  // Set up Vapi event listeners
  useEffect(() => {
    vapi.on("call-start", () => {
      setConnecting(false);
      setConnected(true);
      setShowMsg(false);
    });

    vapi.on("call-end", () => {
      setConnected(false);
      setConnecting(false);
      setShowMsg(false);
    });

    vapi.on("speech-start", () => {
      setTherapistIsSpeaking(true);
    });

    vapi.on("speech-end", () => {
      setTherapistIsSpeaking(false);
    });

    vapi.on("volume-level", (level) => {
      setTherapistVolume(level / 100);
    });

    vapi.on("error", (error) => {
      console.error(error);
      setConnecting(false);
      if (isPublicKeyMissingError({ vapiError: error })) {
        setShowMsg(true);
      }
    });

    return () => {
      vapi.off("call-start");
      vapi.off("call-end");
      vapi.off("speech-start");
      vapi.off("speech-end");
      vapi.off("volume-level");
      vapi.off("error");
    };
  }, [router, setShowMsg]);

  // Simulate client volume and speaking state updates when connected
  useEffect(() => {
    let volumeInterval, speakingInterval;
    if (connected) {
      volumeInterval = setInterval(() => {
        setClientVolume(Math.random());
      }, 200);

      speakingInterval = setInterval(() => {
        setClientIsSpeaking((prev) => !prev);
      }, 3000);
    }
    return () => {
      if (volumeInterval) clearInterval(volumeInterval);
      if (speakingInterval) clearInterval(speakingInterval);
    };
  }, [connected]);

  // Request microphone permission before starting the call
  const startCall = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicError(false);
      setConnecting(true);
      vapi.start(process.env.NEXT_PUBLIC_ASSISTANT_ID);
    } catch (error) {
      console.error("Microphone permission error:", error);
      setMicError(true);
      setTimeout(() => setMicError(false), 3000);
    }
  };

  const endCall = () => {
    vapi.stop();
  };

  return (
    <div className="min-h-screen bg-base-100" data-theme="light">
      {/* Navigation Bar */}
      <div className="navbar bg-base-100 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center w-full">
          <Link href="/" className="flex items-center gap-2">
            <HeartPulse className="w-7 h-7 text-primary" />
            <h1 className="text-2xl font-bold">MindSpace</h1>
          </Link>

          <Link
            href="/therapy"
            className="btn btn-sm btn-primary btn-outline gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold">Virtual Therapy Assistant</h1>
          <p className="mt-3 text-base-content/60 max-w-2xl mx-auto">
            Meet Maya, your empathetic AI therapy assistant, providing support and guidance through your mental health journey.
          </p>
        </div>

        {!connected ? (
          <div className="max-w-2xl mx-auto">
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <div className="flex items-center gap-3 mb-6">
                  <div className="avatar placeholder">
                    <div className="bg-primary text-primary-content rounded-full w-12">
                      <span><MessageSquare className="w-6 h-6" /></span>
                    </div>
                  </div>
                  <div>
                    <h2 className="card-title">Meet Maya</h2>
                    <p className="text-base-content/70">Therapeutic Assistant at MindSpace</p>
                  </div>
                </div>
                <p className="mb-6">
                  Maya will guide you through a therapeutic conversation, focusing on your emotional well-being, thought patterns, and coping strategies. This is a safe space for you to explore your feelings.
                </p>
                <h3 className="font-semibold mb-2">Session Guidelines:</h3>
                <ul className="steps steps-vertical mb-6">
                  <li className="step step-primary">Find a quiet, private space</li>
                  <li className="step step-primary">Ensure your microphone is working</li>
                  <li className="step step-primary">Stay present throughout the session</li>
                  <li className="step step-primary">Share only what feels comfortable</li>
                </ul>
                <div className="alert alert-info mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <span>This is not a replacement for professional therapy. If you're experiencing a crisis, please contact emergency services.</span>
                </div>
                <div className="card-actions justify-center">
                  <button 
                    className={`btn btn-primary ${connecting ? 'loading' : ''}`} 
                    onClick={startCall}
                    disabled={connecting}
                  >
                    {!connecting && <Mic className="w-5 h-5" />}
                    {connecting ? 'Connecting...' : 'Start Session'}
                  </button>
                </div>
              </div>
            </div>
            {showMsg && (
              <div className="toast toast-end">
                <div className="alert alert-error">
                  <span>API Key Error: Please check your Vapi Public Key configuration.</span>
                </div>
              </div>
            )}
            {micError && (
              <div className="toast toast-end">
                <div className="alert alert-error">
                  <span>Microphone permission is required to start the session.</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            <SessionStatus
              timeElapsed={timeElapsed}
              currentTopic={currentTopic}
            />
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Client Card */}
              <div className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <div className="flex items-center mb-4">
                    <User className="h-6 w-6 text-primary mr-2" />
                    <h2 className="card-title">You (Client)</h2>
                  </div>
                  <SpeakingStatus isSpeaking={clientIsSpeaking} name="You" />
                  <VoiceIndicator volume={clientVolume} label="Your Voice" />
                </div>
              </div>
              {/* Therapist Card */}
              <div className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <div className="flex items-center mb-4">
                    <Volume2 className="h-6 w-6 text-secondary mr-2" />
                    <h2 className="card-title">Maya (Therapist)</h2>
                  </div>
                  <SpeakingStatus isSpeaking={therapistIsSpeaking} name="Maya" />
                  <VoiceIndicator volume={therapistVolume} label="Maya's Voice" />
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <button
                className="btn btn-error"
                onClick={endCall}
              >
                End Session
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Footer */}
      <footer className="footer footer-center p-10 bg-base-200 text-base-content mt-20">
        <div>
          <div className="grid grid-flow-col gap-4">
            <a className="link link-hover">About us</a> 
            <a className="link link-hover">Contact</a> 
            <a className="link link-hover">Privacy Policy</a>
          </div>
          <div>
            <p>© 2025 MindSpace. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}