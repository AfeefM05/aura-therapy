import Link from 'next/link';
import { Home, MessageCircle, Activity, LayoutDashboard } from 'lucide-react';
import '../../app/globals.css';


export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          Mind & Soul
        </Link>
        
        <div className="flex items-center gap-6">
          <Link 
            href="/chatbot" 
            className="flex items-center gap-2 text-gray-300 hover:text-indigo-400 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Chatbot
          </Link>
          
          <Link 
            href="/suggestions" 
            className="flex items-center gap-2 text-gray-300 hover:text-indigo-400 transition-colors"
          >
            <Activity className="w-5 h-5" />
            Suggestions
          </Link>
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 text-gray-300 hover:text-indigo-400 transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          
        </div>
      </div>
    </nav>
  );
}