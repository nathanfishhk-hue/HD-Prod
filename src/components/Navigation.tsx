import React from 'react';
import { Dumbbell, Wrench, TrendingUp, Calendar, UserCheck } from 'lucide-react';

export type TabType = 'runner' | 'builder' | 'stats' | 'history' | 'profile';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const tabs: { id: TabType; label: string; shortLabel: string; icon: React.ReactNode }[] = [
    {
      id: 'runner',
      label: 'WORKOUT RUNNER',
      shortLabel: 'RUNNER',
      icon: <Dumbbell className="w-5 h-5" />
    },
    {
      id: 'builder',
      label: 'PROGRAM BUILDER',
      shortLabel: 'BUILDER',
      icon: <Wrench className="w-5 h-5" />
    },
    {
      id: 'stats',
      label: 'OVERLOAD & STATS',
      shortLabel: 'STATS',
      icon: <TrendingUp className="w-5 h-5" />
    },
    {
      id: 'history',
      label: 'HISTORY & LOGS',
      shortLabel: 'LOGS',
      icon: <Calendar className="w-5 h-5" />
    },
    {
      id: 'profile',
      label: 'RECOMP & RULES',
      shortLabel: 'RULES',
      icon: <UserCheck className="w-5 h-5" />
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 pb-safe">
      <div className="max-w-6xl mx-auto px-2">
        <div className="flex items-center justify-around">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-col items-center justify-center py-2 px-2 sm:px-4 transition-all duration-150 ${
                  isActive
                    ? 'text-red-500 font-bold'
                    : 'text-zinc-500 hover:text-zinc-300 font-medium'
                }`}
              >
                {/* Active Indicator Line top */}
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-red-600 rounded-b-sm shadow-[0_2px_10px_rgba(220,38,38,0.8)]" />
                )}

                <div className={`transition-transform ${isActive ? 'scale-110 text-red-500' : ''}`}>
                  {tab.icon}
                </div>

                <span className="text-[10px] sm:text-xs font-mono-code mt-1 tracking-wider uppercase">
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
