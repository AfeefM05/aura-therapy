"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/ui/navbar';
import '../app/globals.css';
import { getUserData, createUser, userExists } from '@/utils/mongoUserStorage';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const exists = await userExists(username);
      
      if (!exists) {
        // Create new user
        const success = await createUser(username);
        if (success) {
          localStorage.setItem('currentUser', JSON.stringify({ username }));
          router.push('/questions');
        } else {
          alert('Failed to create user. Please try again.');
        }
      } else {
        // User exists, proceed to suggestions
        localStorage.setItem('currentUser', JSON.stringify({ username }));
        router.push('/suggestions');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex items-center justify-center flex-1">
        <div className="max-w-md w-full p-8 bg-gray-800 rounded-xl shadow-2xl backdrop-blur-lg border border-gray-700/30">
          <div className="mb-8 text-center">
            <div className="animate-pulse bg-gradient-to-r from-indigo-500 to-purple-500 w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <h2 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-300 bg-clip-text text-transparent">
              Welcome Back!
            </h2>
            <p className="mt-2 text-gray-400">Sign in to continue to your AI dashboard</p>
          </div>
          
          <form onSubmit={handleLogin}>
            <div className="mb-6 space-y-4">
              <div className="group relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full text-white pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
                  placeholder="Username"
                  required
                  disabled={isLoading}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>

              <div className="group relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-white pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
                  placeholder="Password"
                  required
                  disabled={isLoading}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white py-3.5 rounded-xl font-semibold transition-all transform hover:scale-[1.01] shadow-lg hover:shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Authenticating...' : 'Authenticate'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <a href="#" className="text-sm font-medium text-gray-400 hover:text-indigo-400 transition-colors">
              <span className="opacity-70">New to AI Platform?</span> Create Account
              <span className="ml-1.5">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;