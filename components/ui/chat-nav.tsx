"use client";

import { useRouter, usePathname } from 'next/navigation';
import { MessageSquare, Lightbulb, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ChatNav() {
  const router = useRouter();
  const pathname = usePathname();

  const navigation = [
    { name: 'Chat', href: '/chatbot', icon: MessageSquare },
    { name: 'Suggestions', href: '/suggestions', icon: Lightbulb },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  ];

  return (
    <div className="sticky top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b p-4 z-50">
      <div className="max-w-4xl mx-auto flex justify-around">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              onClick={() => router.push(item.href)}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all",
                pathname === item.href
                  ? "text-primary bg-primary/10"
                  : "text-gray-600 hover:text-primary hover:bg-primary/5"
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-sm font-medium">{item.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}