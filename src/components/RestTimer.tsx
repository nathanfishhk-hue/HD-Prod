import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus, X, Volume2, Quote, Minimize2, Maximize2 } from 'lucide-react';
import { getRandomQuote, HitQuote } from '../data/quotes';
import { audioSynth } from '../utils/audio';

interface RestTimerProps {
  initialSeconds: number; // e.g. 120 or 180
  exerciseName: string;
  soundEnabled: boolean;
  onClose: () => void;
}

export const RestTimer: React.FC<RestTimerProps> = ({
  initialSeconds,
  exerciseName,
  soundEnabled,
  onClose
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(initialSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [quote, setQuote] = useState<HitQuote>(() => getRandomQuote());
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);

            // Play completion audio
            if (soundEnabled) {
              audioSynth.playTimerBeep();
            }

            // Haptic vibration
            if ('vibrate' in navigator) {
              try {
                navigator.vibrate([200, 100, 200, 100, 400]);
              } catch {
                // Ignore if not supported
              }
            }

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft, soundEnabled]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleAdjustTime = (delta: number) => {
    setTimeLeft(prev => Math.max(0, prev + delta));
  };

  const handleReset = () => {
    setTimeLeft(initialSeconds);
    setIsRunning(true);
    setQuote(getRandomQuote());
  };

  const progressPercent = Math.min(100, Math.max(0, ((initialSeconds - timeLeft) / initialSeconds) * 100));

  if (isMinimized) {
    return (
      <div className="fixed bottom-20 right-4 z-50 bg-zinc-900 border-2 border-red-600 rounded-lg shadow-2xl p-2.5 flex items-center gap-3 animate-bounce">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono-code text-zinc-400 uppercase">REST TIMER</span>
          <span className="font-mono-code font-bold text-lg text-red-500">{formatTime(timeLeft)}</span>
        </div>
        <button
          onClick={() => setIsMinimized(false)}
          className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={onClose}
          className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-red-400 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-16 inset-x-0 mx-auto max-w-lg z-50 p-3 sm:p-4">
      <div className="bg-zinc-950 border-2 border-red-700/80 rounded-xl shadow-[0_0_40px_rgba(220,38,38,0.3)] p-4 sm:p-5 relative overflow-hidden backdrop-blur-xl">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
            <span className="font-bebas text-lg tracking-wider text-red-500">HIT REST RECOVERY</span>
            <span className="text-xs font-mono-code text-zinc-400">({exerciseName})</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 text-zinc-400 hover:text-zinc-200 rounded"
              title="Minimize Timer"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-red-400 rounded"
              title="Close Timer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Timer Main display */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 my-2">
          {/* Circular/Digital Timer */}
          <div className="flex flex-col items-center justify-center">
            <div className="font-mono-code text-5xl sm:text-6xl font-black text-red-500 tracking-wider text-shadow-glow">
              {formatTime(timeLeft)}
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-[200px] h-2 bg-zinc-900 border border-zinc-800 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-700 to-amber-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Timer controls */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`p-3 rounded-lg font-mono-code font-bold flex items-center justify-center gap-1 transition ${
                isRunning
                  ? 'bg-amber-950/80 border border-amber-600 text-amber-400 hover:bg-amber-900'
                  : 'bg-emerald-950/80 border border-emerald-600 text-emerald-400 hover:bg-emerald-900'
              }`}
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              <span>{isRunning ? 'PAUSE' : 'RESUME'}</span>
            </button>

            <button
              onClick={() => handleAdjustTime(30)}
              className="px-2.5 py-3 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 rounded font-mono-code text-xs text-zinc-200 font-bold"
            >
              +30s
            </button>

            <button
              onClick={() => handleAdjustTime(-15)}
              className="px-2.5 py-3 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 rounded font-mono-code text-xs text-zinc-200 font-bold"
            >
              -15s
            </button>

            <button
              onClick={handleReset}
              className="p-3 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 rounded text-zinc-300"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mentzer/Yates Quote Display */}
        <div className="mt-3 pt-3 border-t border-zinc-800/80 bg-zinc-900/60 rounded p-2.5 flex items-start gap-2">
          <Quote className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-zinc-300 italic leading-snug">
              "{quote.quote}"
            </p>
            <div className="text-[10px] font-mono-code text-red-400 font-bold mt-1">
              — {quote.author} <span className="text-zinc-500">({quote.context})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
