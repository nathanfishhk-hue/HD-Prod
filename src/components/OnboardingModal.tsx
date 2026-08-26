import React from 'react';
import { ShieldCheck, Zap, Activity, Dumbbell, CheckCircle2, X } from 'lucide-react';
import { UserProfile } from '../types/hit';

interface OnboardingModalProps {
  userProfile: UserProfile;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ userProfile, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-zinc-950 border-2 border-red-700 rounded-xl max-w-2xl w-full p-4 sm:p-6 shadow-[0_0_60px_rgba(220,38,38,0.4)] relative my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-red-950 border border-red-600 flex items-center justify-center font-bebas text-lg text-red-500 font-bold">
              HIT
            </div>
            <div>
              <h2 className="font-bebas text-2xl text-zinc-100 tracking-wider">HEAVY DUTY RECOMP PROTOCOL</h2>
              <p className="text-xs font-mono-code text-red-400 uppercase">Mentzer • Yates • Jones System</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-red-400 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 text-zinc-300 text-sm">
          {/* User Profile Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3.5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2">
              <span className="font-bebas text-lg text-zinc-200 tracking-wide flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                USER SPECIFICATIONS & BIO-METRICS
              </span>
              <span className="text-[10px] font-mono-code bg-red-950 text-red-400 px-2 py-0.5 rounded border border-red-800">
                INTERMEDIATE
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono-code">
              <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">AGE / HEIGHT</span>
                <span className="font-bold text-zinc-200">{userProfile.age}y • {userProfile.heightCm}cm</span>
              </div>
              <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">WEIGHT / BF%</span>
                <span className="font-bold text-red-400">{userProfile.weightKg}kg • {userProfile.bfPercent}%</span>
              </div>
              <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">PROTEIN / CREATINE</span>
                <span className="font-bold text-emerald-400">{userProfile.targetProteinGrams}g • {userProfile.targetCreatineGrams}g/day</span>
              </div>
              <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">SLEEP TARGET</span>
                <span className="font-bold text-amber-400">{userProfile.targetSleepHours} Hours/night</span>
              </div>
            </div>

          </div>

          {/* Core HIT Principles */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3.5">
            <h3 className="font-bebas text-lg text-red-500 tracking-wide mb-2 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-red-500" />
              THE 5 IRON LAWS OF HEAVY DUTY HIT
            </h3>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-100">1 WORKING SET TO FAILURE:</strong> Warm up with 1-2 pyramid sets (gray), then take your ONE working set past 100% positive muscular failure.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-100">STRICT 3/1/4 TEMPO:</strong> 3s concentric lifting, 1s squeeze at peak contraction, and a mandatory 4-second negative eccentric lowering.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-100">BEYOND FAILURE EXTENSIONS:</strong> Use Rest-Pause (10-15s rest, +1-2 reps) and Drop Sets (-20% load) as configured per week phase.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-100">2-3 MINUTE REST PERIODS:</strong> Allow complete ATP-CP resynthesis between exercises to ensure maximum force production.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-100">DOUBLE PROGRESSION WAVE:</strong> Hitting the top prescribed reps (e.g. 10/12/15) triggers an auto-suggestion of +2.5kg or +5kg next week!
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="mt-5 w-full brutalist-button-red py-3 rounded font-mono-code font-bold text-sm tracking-widest"
        >
          ENTER TEMPLE GYM LOGBOOK
        </button>
      </div>
    </div>
  );
};
