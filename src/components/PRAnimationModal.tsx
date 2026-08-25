import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Flame, Sparkles, X, ArrowUpRight } from 'lucide-react';
import { getRandomQuote } from '../data/quotes';

interface PRAnimationModalProps {
  exerciseName: string;
  weightKg: number;
  reps: number;
  prType: 'WEIGHT' | 'REPS' | 'DOUBLE_PROGRESSION';
  suggestedNextWeightKg?: number;
  onClose: () => void;
}

export const PRAnimationModal: React.FC<PRAnimationModalProps> = ({
  exerciseName,
  weightKg,
  reps,
  prType,
  suggestedNextWeightKg,
  onClose
}) => {
  const quote = getRandomQuote();

  useEffect(() => {
    // Fire confetti particles
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#dc2626', '#f59e0b', '#ef4444', '#ffffff']
      });
    } catch {
      // Confetti fallback
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-950 border-2 border-amber-500/90 rounded-xl max-w-md w-full p-6 text-center shadow-[0_0_80px_rgba(245,158,11,0.4)] relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-zinc-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* PR Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-950 border-2 border-amber-500 flex items-center justify-center text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.6)] mb-3">
          <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
        </div>

        <div className="font-bebas text-3xl text-amber-400 tracking-wider text-shadow-amber">
          {prType === 'DOUBLE_PROGRESSION' ? 'DOUBLE PROGRESSION HIT!' : 'NEW HEAVY DUTY PR!'}
        </div>

        <p className="text-xs font-mono-code text-zinc-300 uppercase mt-1">
          {exerciseName}
        </p>

        {/* Stats badge */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 my-4 flex items-center justify-center gap-4">
          <div>
            <span className="text-[10px] font-mono-code text-zinc-400 block">WEIGHT LOGGED</span>
            <span className="font-bebas text-2xl text-zinc-100">{weightKg} KG</span>
          </div>
          <div className="h-8 w-px bg-zinc-800" />
          <div>
            <span className="text-[10px] font-mono-code text-zinc-400 block">REPS TO FAILURE</span>
            <span className="font-bebas text-2xl text-red-500">{reps} REPS</span>
          </div>
        </div>

        {/* Suggested Next Load if double progression */}
        {suggestedNextWeightKg && suggestedNextWeightKg > weightKg && (
          <div className="bg-amber-950/60 border border-amber-600/80 rounded-lg p-2.5 mb-4 text-left flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <span className="text-[11px] font-mono-code font-bold text-amber-300 block">
                AUTO-SUGGESTION FOR NEXT WEEK:
              </span>
              <span className="text-xs text-zinc-200">
                Target increased to <strong className="text-amber-400">{suggestedNextWeightKg} KG</strong> (+{(suggestedNextWeightKg - weightKg).toFixed(1)}kg).
              </span>
            </div>
          </div>
        )}

        {/* Blood & Guts Quote */}
        <div className="bg-zinc-900/80 border border-zinc-800 p-3 rounded text-left">
          <p className="text-xs text-zinc-300 italic">"{quote.quote}"</p>
          <div className="text-[10px] font-mono-code text-red-400 font-bold mt-1">
            — {quote.author}
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full brutalist-button-red py-2.5 rounded font-mono-code font-bold text-sm tracking-widest"
        >
          CONTINUE WORKOUT
        </button>
      </div>
    </div>
  );
};
