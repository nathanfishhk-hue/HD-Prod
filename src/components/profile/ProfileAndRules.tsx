import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Dumbbell,
  Quote,
  Flame,
  Moon,
  Target
} from 'lucide-react';
import { useHitStorage } from '../../hooks/useHitStorage';
import { strokeQuotes } from '../../data/quotes';

interface ProfileAndRulesProps {
  storage: ReturnType<typeof useHitStorage>;
}

export const ProfileAndRules: React.FC<ProfileAndRulesProps> = ({ storage }) => {
  const { userProfile, updateUserProfile, profiles, activeProfileId, switchProfile } = storage;
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [weightKg, setWeightKg] = useState<number>(userProfile.weightKg);
  const [bfPercent, setBfPercent] = useState<number>(userProfile.bfPercent);
  const [proteinG, setProteinG] = useState<number>(userProfile.targetProteinGrams);

  useEffect(() => {
    setWeightKg(userProfile.weightKg);
    setBfPercent(userProfile.bfPercent);
    setProteinG(userProfile.targetProteinGrams);
  }, [userProfile.weightKg, userProfile.bfPercent, userProfile.targetProteinGrams, activeProfileId]);

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
      {/* 1. PROFILE SWITCHER */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-red-500" />
            <h2 className="font-bebas text-xl text-zinc-100 tracking-wider">PROFILES</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono-code text-zinc-500 hidden sm:block">ACTIVE:</span>
            <div className="flex bg-zinc-900 border border-zinc-800 rounded overflow-hidden">
              {Object.values(profiles).map(p => (
                <button
                  key={p.id}
                  onClick={() => switchProfile(p.id)}
                  className={`px-4 py-1.5 text-xs font-mono-code font-black transition ${
                    activeProfileId === p.id ? 'bg-red-600 text-white' : 'text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  {p.profile.name.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
        <p className="text-xs font-mono-code text-zinc-500 mt-2">
          Each profile has isolated logs, body stats, and PRs. Switch in header or here. Current: <span className="text-red-400 font-bold">{userProfile.name}</span> — {userProfile.weightKg}kg • {userProfile.bfPercent}% BF
        </p>
      </div>

      {/* 2. USER SPECIFICATIONS CARD */}
      <div className="brutalist-card rounded-xl p-4 sm:p-5">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className={`w-5 h-5 ${activeProfileId === 'nate' ? 'text-red-400' : 'text-sky-400'}`} />
            <h3 className="font-bebas text-2xl text-zinc-100">{userProfile.name.toUpperCase()} — BIO-METRICS</h3>
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
              SAVE {userProfile.name.toUpperCase()} SPECIFICATIONS
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

        {/* Show both profiles summary */}
        <div className="mt-4 grid grid-cols-2 gap-2 font-mono-code text-[11px]">
          {Object.values(profiles).map(p => (
            <div key={p.id} className={`p-2.5 rounded border ${activeProfileId === p.id ? 'bg-red-950/30 border-red-800' : 'bg-zinc-900 border-zinc-800'}`}>
              <div className="font-bold flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${p.id === 'nate' ? 'bg-red-500' : 'bg-sky-500'}`} />
                {p.profile.name.toUpperCase()} {activeProfileId === p.id && <span className="text-[9px] bg-red-600 text-white px-1 rounded">ACTIVE</span>}
              </div>
              <div className="text-zinc-400">{p.profile.weightKg}kg • {p.profile.bfPercent}% • {p.workoutLogs.length} workouts • {p.bodyStats.length} stats</div>
            </div>
          ))}
        </div>

        {userProfile.ankleMobilityLimited && (
          <div className="mt-4 bg-amber-950/40 border border-amber-700/60 rounded-lg p-3 flex items-start gap-2.5 text-xs font-mono-code text-amber-300">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold text-amber-200 uppercase mb-0.5">
                ANKLE MOBILITY LIMITATION PROTOCOL ACTIVE ({userProfile.name})
              </strong>
              Left ankle dorsiflexion is restricted. Barbell squats removed. Use Pre-Exhaust Leg Extensions, Leg Press / Belt Squats (heel elevated).
            </div>
          </div>
        )}
      </div>

      {/* 3. HIT PRINCIPLES */}
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
              1-2 pyramid warmups, then single working set to 100% positive failure. Shared program, isolated per-profile logs.
            </p>
          </div>
          <div className="bg-zinc-900 p-3.5 rounded border border-zinc-800 space-y-1.5">
            <h4 className="font-bold text-zinc-100 text-sm flex items-center gap-1.5">
              <Dumbbell className="w-4 h-4 text-red-500" />
              STRICT 3/1/4 TEMPO
            </h4>
            <p className="text-zinc-400 leading-relaxed">
              3s concentric, 1s squeeze, 4s negative. Negatives drive high-threshold recruitment.
            </p>
          </div>
          <div className="bg-zinc-900 p-3.5 rounded border border-zinc-800 space-y-1.5">
            <h4 className="font-bold text-zinc-100 text-sm flex items-center gap-1.5">
              <Target className="w-4 h-4 text-red-500" />
              BEYOND-FAILURE
            </h4>
            <p className="text-zinc-400 leading-relaxed">
              Rest-Pause (10-15s +1-2 reps) and Drop Sets (-20% machines) in Overload/Peak.
            </p>
          </div>
          <div className="bg-zinc-900 p-3.5 rounded border border-zinc-800 space-y-1.5">
            <h4 className="font-bold text-zinc-100 text-sm flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-amber-400" />
              RECOVERY
            </h4>
            <p className="text-zinc-400 leading-relaxed">
              500 kcal deficit, 200g protein, 5g creatine, 6-7h sleep. Per-profile tracking.
            </p>
          </div>
        </div>
      </div>

      {/* 4. QUOTES */}
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
