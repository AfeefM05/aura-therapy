import Link from 'next/link';
import { Home, MessageCircle, Activity, LayoutDashboard } from 'lucide-react';
import '../../app/globals.css';


export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          Mind & Soul
        </Link>
        
        <div className="flex items-center gap-6">
          <Link 
            href="/chatbot" 
            className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Chatbot
          </Link>
          
          <Link 
            href="/suggestions" 
            className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
          >
            <Activity className="w-5 h-5" />
            Suggestions
          </Link>
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          
        </div>
      </div>
    </nav>
  );
}