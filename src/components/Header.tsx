import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Volume2, VolumeX, ShieldAlert, Sparkles, Download } from 'lucide-react';
import { WeightUnit } from '../types/hit';

interface HeaderProps {
  unitPreference: WeightUnit;
  setUnitPreference: (unit: WeightUnit) => void;
  editModeLocked: boolean;
  toggleEditModeLock: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  onOpenProfile: () => void;
  onOpenRules: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  unitPreference,
  setUnitPreference,
  editModeLocked,
  toggleEditModeLock,
  soundEnabled,
  toggleSound,
  onOpenProfile,
  onOpenRules
}) => {
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<unknown>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running as PWA standalone
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPWA = () => {
    if (deferredInstallPrompt) {
      const promptEvent = deferredInstallPrompt as { prompt: () => void; userChoice: Promise<{ outcome: string }> };
      promptEvent.prompt();
      promptEvent.userChoice.then((choice) => {
        if (choice.outcome === 'accepted') {
          setDeferredInstallPrompt(null);
        }
      });
    } else {
      alert('To install as PWA: Tap your browser menu (3 dots or share icon) and select "Add to Home Screen".');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 px-3 py-2.5 sm:px-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        {/* Branding */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={onOpenRules}>
          <div className="relative flex items-center justify-center w-9 h-9 bg-red-950 border border-red-600/80 rounded font-bebas text-xl font-bold text-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)]">
            HD
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bebas text-xl sm:text-2xl tracking-wider text-zinc-100 leading-none">
                HEAVY DUTY <span className="text-red-600">RECOMP</span>
              </h1>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono-code uppercase font-semibold bg-zinc-900 border border-zinc-700 text-zinc-300 rounded">
                HIT 6-WK
              </span>
            </div>
            <p className="text-[10px] font-mono-code text-zinc-400 hidden xs:block">
              MENTZER • YATES • JONES METRICS
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* KG/LBS Toggle */}
          <button
            onClick={() => setUnitPreference(unitPreference === 'kg' ? 'lbs' : 'kg')}
            className="flex items-center bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs font-mono-code font-bold hover:border-zinc-700 transition"
            title="Toggle Weight Unit (KG / LBS)"
          >
            <span className={unitPreference === 'kg' ? 'text-red-500 font-black' : 'text-zinc-500'}>KG</span>
            <span className="text-zinc-600 mx-1">/</span>
            <span className={unitPreference === 'lbs' ? 'text-red-500 font-black' : 'text-zinc-500'}>LBS</span>
          </button>

          {/* Edit Lock / Unlock button */}
          <button
            onClick={toggleEditModeLock}
            className={`flex items-center gap-1 text-xs font-mono-code font-semibold px-2 py-1 rounded border transition ${
              editModeLocked
                ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                : 'bg-amber-950/80 border-amber-600/80 text-amber-400 font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)]'
            }`}
            title={editModeLocked ? "Program Edits Locked (Click to unlock)" : "Edit Mode Unlocked (Click to lock)"}
          >
            {editModeLocked ? (
              <>
                <Lock className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden md:inline">LOCKED</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">EDITING</span>
              </>
            )}
          </button>

          {/* Audio toggle */}
          <button
            onClick={toggleSound}
            className="p-1.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-400 hover:text-zinc-100 transition"
            title={soundEnabled ? "Mute Timer Audio" : "Enable Timer Audio"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
          </button>

          {/* PWA Install Button */}
          {!isStandalone && (
            <button
              onClick={handleInstallPWA}
              className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-red-950/80 border border-red-700/80 hover:bg-red-900 rounded text-xs font-mono-code font-bold text-red-200 transition"
              title="Install PWA to Home Screen"
            >
              <Download className="w-3.5 h-3.5 text-red-400" />
              <span>INSTALL</span>
            </button>
          )}

          {/* Profile Badge */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 hover:border-red-900/80 px-2 py-1 rounded text-xs font-mono-code font-medium text-zinc-300 transition"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">100kg • 25% BF</span>
            <span className="sm:hidden">PROFILE</span>
          </button>
        </div>
      </div>
    </header>
  );
};
