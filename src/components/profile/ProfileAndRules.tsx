import React, { useState } from 'react';
import {
  UserCheck,
  Zap,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  Dumbbell,
  Quote,
  Flame,
  Moon,
  Pill,
  Target
} from 'lucide-react';
import { useHitStorage } from '../../hooks/useHitStorage';
import { strokeQuotes } from '../../data/quotes';

interface ProfileAndRulesProps {
  storage: ReturnType<typeof useHitStorage>;
}

export const ProfileAndRules: React.FC<ProfileAndRulesProps> = ({ storage }) => {
  const { userProfile, updateUserProfile } = storage;
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [weightKg, setWeightKg] = useState<number>(userProfile.weightKg);
  const [bfPercent, setBfPercent] = useState<number>(userProfile.bfPercent);
  const [proteinG, setProteinG] = useState<number>(userProfile.targetProteinGrams);

  const handleSaveProfile = () => {
    updateUserProfile({
      weightKg,
      bfPercent,
      targetProteinGrams: proteinG
    });
    setIsEditing(false);
  };

  return (
    <div className="pb-28 max-w-4xl mx-auto px-3 sm:px-4 pt-3 space-y-6">
      {/* 1. HEADER */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <UserCheck className="w-5 h-5 text-red-500" />
          <h2 className="font-bebas text-2xl text-zinc-100 tracking-wider">USER PROFILE & HIT RECOMP RULES</h2>
        </div>
        <p className="text-xs font-mono-code text-zinc-400">
          Heavy Duty High Intensity Training philosophy inspired by Mike Mentzer, Dorian Yates & Arthur Jones.
        </p>
      </div>

      {/* 2. USER SPECIFICATIONS CARD */}
      <div className="brutalist-card rounded-xl p-4 sm:p-5">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bebas text-2xl text-zinc-100">BIO-METRICS & RECOMP PROFILE</h3>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-1 bg-zinc-900 border border-zinc-700 text-xs font-mono-code font-bold text-zinc-300 rounded"
          >
            {isEditing ? 'CANCEL' : 'EDIT STATS'}
          </button>
        </div>

        {isEditing ? (
          <div className="space-y-3 bg-zinc-950 p-4 rounded-lg border border-zinc-800 font-mono-code text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-zinc-500 block text-[10px]">WEIGHT (KG)</label>
                <input
                  type="number"
                  step="0.5"
                  value={weightKg}
                  onChange={e => setWeightKg(parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-1.5 text-red-400 font-bold"
                />
              </div>

              <div>
                <label className="text-zinc-500 block text-[10px]">BODY FAT %</label>
                <input
                  type="number"
                  step="0.5"
                  value={bfPercent}
                  onChange={e => setBfPercent(parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-1.5 text-amber-400 font-bold"
                />
              </div>

              <div>
                <label className="text-zinc-500 block text-[10px]">PROTEIN (G/DAY)</label>
                <input
                  type="number"
                  value={proteinG}
                  onChange={e => setProteinG(parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-1.5 text-emerald-400 font-bold"
                />
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              className="w-full brutalist-button-red py-2 rounded text-xs"
            >
              SAVE UPDATED SPECIFICATIONS
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono-code text-xs">
            <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
              <span className="text-zinc-500 block text-[10px]">AGE / HEIGHT</span>
              <span className="font-bold text-zinc-100 text-sm">{userProfile.age} YEARS • {userProfile.heightCm} CM</span>
            </div>

            <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
              <span className="text-zinc-500 block text-[10px]">WEIGHT & BF%</span>
              <span className="font-bold text-red-400 text-sm">{userProfile.weightKg} KG • {userProfile.bfPercent}% BF</span>
            </div>

            <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
              <span className="text-zinc-500 block text-[10px]">PROTEIN & CREATINE</span>
              <span className="font-bold text-emerald-400 text-sm">{userProfile.targetProteinGrams}G • 5G / DAY</span>
            </div>

            <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
              <span className="text-zinc-500 block text-[10px]">SLEEP REQUIREMENT</span>
              <span className="font-bold text-amber-400 text-sm">{userProfile.targetSleepHours} HOURS / NIGHT</span>
            </div>
          </div>
        )}

        {/* Ankle safe warning banner */}
        <div className="mt-4 bg-amber-950/40 border border-amber-700/60 rounded-lg p-3 flex items-start gap-2.5 text-xs font-mono-code text-amber-300">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold text-amber-200 uppercase mb-0.5">
              ANKLE MOBILITY LIMITATION PROTOCOL ACTIVE
            </strong>
            Left ankle dorsiflexion is restricted. Barbell squats are permanently removed to prevent joint strain. Quad loading is achieved via Pre-Exhaust Leg Extensions, Leg Press / Belt Squats (heel elevated), Seated Leg Curls, and Standing Calf Raises.
          </div>
        </div>
      </div>

      {/* 3. MENTZER & YATES HIT PRINCIPLES */}
      <div className="brutalist-card rounded-xl p-4 sm:p-5 space-y-4">
        <h3 className="font-bebas text-2xl text-red-500 flex items-center gap-2">
          <Zap className="w-5 h-5 text-red-500" />
          THE HEAVY DUTY HIT METHODOLOGY
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono-code">
          <div className="bg-zinc-900 p-3.5 rounded border border-zinc-800 space-y-1.5">
            <h4 className="font-bold text-zinc-100 text-sm flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-red-500" />
              1 WORKING SET TO COMPLETE FAILURE
            </h4>
            <p className="text-zinc-400 leading-relaxed">
              Warm up with 1-2 pyramid sets to prime joints and motor patterns. The single working set is taken to 100% positive failure where no additional full concentric rep can be produced with form.
            </p>
          </div>

          <div className="bg-zinc-900 p-3.5 rounded border border-zinc-800 space-y-1.5">
            <h4 className="font-bold text-zinc-100 text-sm flex items-center gap-1.5">
              <Dumbbell className="w-4 h-4 text-red-500" />
              STRICT 3/1/4 TEMPO CONTROL
            </h4>
            <p className="text-zinc-400 leading-relaxed">
              3 seconds concentric lifting, 1 second squeeze pause at peak contraction, and a strict 4-second negative eccentric lower. Controlled negatives maximize high-threshold motor unit recruitment.
            </p>
          </div>

          <div className="bg-zinc-900 p-3.5 rounded border border-zinc-800 space-y-1.5">
            <h4 className="font-bold text-zinc-100 text-sm flex items-center gap-1.5">
              <Target className="w-4 h-4 text-red-500" />
              BEYOND-FAILURE EXTENSIONS
            </h4>
            <p className="text-zinc-400 leading-relaxed">
              In Overload and Peak weeks, use Rest-Pause (rack weight 10-15s, perform +1-2 extra reps) and Drop Sets (immediately reduce load -20% on machines) to force adaptation.
            </p>
          </div>

          <div className="bg-zinc-900 p-3.5 rounded border border-zinc-800 space-y-1.5">
            <h4 className="font-bold text-zinc-100 text-sm flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-amber-400" />
              RECOVERY & RECOMP NUTRIENTS
            </h4>
            <p className="text-zinc-400 leading-relaxed">
              High intensity training drains the central nervous system. Maintain a 500 kcal deficit, consume 200g protein daily, take 5g creatine, and sleep 6-7 hours nightly for complete neural resynthesis.
            </p>
          </div>
        </div>
      </div>

      {/* 4. HEAVY DUTY QUOTES BANK */}
      <div className="brutalist-card rounded-xl p-4 sm:p-5">
        <h3 className="font-bebas text-xl text-zinc-100 mb-3 flex items-center gap-2">
          <Quote className="w-5 h-5 text-red-500" />
          TEMPLE GYM LOGBOOK QUOTES
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {strokeQuotes.map((q, idx) => (
            <div key={idx} className="bg-zinc-900/80 border border-zinc-800 p-3 rounded">
              <p className="text-xs text-zinc-300 italic">"{q.quote}"</p>
              <div className="text-[10px] font-mono-code text-red-400 font-bold mt-1.5">
                — {q.author} <span className="text-zinc-500">({q.context})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
