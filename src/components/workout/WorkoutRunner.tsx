import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Play,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ChevronLeft,
  ChevronRight,
  Calculator,
  Timer,
  Sparkles,
  ArrowRight,
  Activity,
  Zap,
  Info,
  RefreshCw
} from 'lucide-react';
import {
  LoggedWorkout,
  LoggedExercise,
  LoggedSet,
  ExerciseDefinition,
  WeightUnit
} from '../../types/hit';
import { useHitStorage } from '../../hooks/useHitStorage';
import {
  calculateAutoSuggestWeight,
  convertKgToLbs,
  convertLbsToKg,
  calculateEstimated1RM
} from '../../utils/hitCalculators';
import { audioSynth } from '../../utils/audio';
import { RestTimer } from '../RestTimer';
import { PlateCalculatorModal } from '../PlateCalculatorModal';
import { PRAnimationModal } from '../PRAnimationModal';

interface WorkoutRunnerProps {
  storage: ReturnType<typeof useHitStorage>;
}

export const WorkoutRunner: React.FC<WorkoutRunnerProps> = ({ storage }) => {
  const {
    weeks,
    days,
    workoutLogs,
    logWorkoutSession,
    getExerciseHistory,
    unitPreference,
    soundEnabled,
    exerciseLibrary,
    swapExercise,
    editModeLocked
  } = storage;

  const [selectedWeekNum, setSelectedWeekNum] = useState<number>(1);
  const [selectedDayKey, setSelectedDayKey] = useState<string>('A');
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number>(0);

  // Active workout state
  const currentWeek = weeks.find(w => w.weekNumber === selectedWeekNum) || weeks[0];
  const currentDay = days.find(d => d.dayKey === selectedDayKey) || days[0];
  const currentExercise = currentDay?.exercises[activeExerciseIndex] || currentDay?.exercises[0];

  // Working inputs state for active exercise
  const [warmupWeights, setWarmupWeights] = useState<number[]>([]);
  const [warmupReps, setWarmupReps] = useState<number[]>([]);
  const [warmupLogged, setWarmupLogged] = useState<boolean[]>([]);

  const [workingWeight, setWorkingWeight] = useState<number>(60);
  const [workingReps, setWorkingReps] = useState<number>(8);
  const [workingRpe, setWorkingRpe] = useState<number>(10);
  const [reachedFailure, setReachedFailure] = useState<boolean>(true);

  const [enableRestPause, setEnableRestPause] = useState<boolean>(false);
  const [restPauseReps, setRestPauseReps] = useState<number>(2);

  const [enableDropSet, setEnableDropSet] = useState<boolean>(false);
  const [dropSetWeight, setDropSetWeight] = useState<number>(48);
  const [dropSetReps, setDropSetReps] = useState<number>(4);

  // Modals & Timers
  const [showPlateCalc, setShowPlateCalc] = useState<boolean>(false);
  const [showRestTimer, setShowRestTimer] = useState<boolean>(false);
  const [activeRestSeconds, setActiveRestSeconds] = useState<number>(120);
  const [prModalData, setPrModalData] = useState<{
    exerciseName: string;
    weightKg: number;
    reps: number;
    prType: 'WEIGHT' | 'REPS' | 'DOUBLE_PROGRESSION';
    suggestedNextWeightKg?: number;
  } | null>(null);

  // Session completed log state for current week & day
  const [loggedExerciseMap, setLoggedExerciseMap] = useState<Record<string, LoggedExercise>>({});

  // Sync inputs whenever exercise or week/day changes
  useEffect(() => {
    if (!currentExercise) return;

    // Fetch previous workout history for this exercise
    const history = getExerciseHistory(currentExercise.name);
    const lastLog = history.length > 0 ? history[history.length - 1] : null;

    let initialWeight = 60;
    if (lastLog) {
      const autoObj = calculateAutoSuggestWeight(
        lastLog.weightKg,
        lastLog.reps,
        currentExercise.targetRepsMax,
        currentExercise.muscleGroup
      );
      initialWeight = autoObj.nextWeightKg;
    } else {
      // Default starting weights based on exercise
      if (currentExercise.name.includes('Press')) initialWeight = 60;
      else if (currentExercise.name.includes('Leg Extension')) initialWeight = 50;
      else if (currentExercise.name.includes('Leg Press')) initialWeight = 140;
      else if (currentExercise.name.includes('Pullover')) initialWeight = 45;
      else if (currentExercise.name.includes('Curl')) initialWeight = 16;
      else initialWeight = 40;
    }

    setWorkingWeight(initialWeight);
    setWorkingReps(currentExercise.targetRepsMin);
    setWorkingRpe(10);
    setReachedFailure(true);

    // Warmups
    const warmupsCount = currentExercise.defaultWarmups || 1;
    setWarmupWeights(Array(warmupsCount).fill(Math.round(initialWeight * 0.6)));
    setWarmupReps(Array(warmupsCount).fill(10));
    setWarmupLogged(Array(warmupsCount).fill(false));

    // Drop set auto-calculate (-20%)
    setDropSetWeight(Math.round(initialWeight * 0.8));

    // Check beyond failure defaults based on week phase
    if (currentWeek.phase === 'Overload' || currentWeek.phase === 'Peak') {
      setEnableRestPause(true);
    } else {
      setEnableRestPause(activeExerciseIndex === currentDay.exercises.length - 1);
    }

    if (currentWeek.phase === 'Peak') {
      setEnableDropSet(true);
    } else {
      setEnableDropSet(false);
    }
  }, [currentExercise?.id, selectedWeekNum, selectedDayKey]);

  // Update drop set weight automatically when working weight changes
  useEffect(() => {
    setDropSetWeight(Math.round(workingWeight * 0.8 * 10) / 10);
  }, [workingWeight]);

  if (!currentExercise) return null;

  const historyList = getExerciseHistory(currentExercise.name);
  const prevWorkout = historyList.length > 0 ? historyList[historyList.length - 1] : null;

  const doubleProgressionCheck = calculateAutoSuggestWeight(
    prevWorkout?.weightKg || workingWeight,
    workingReps,
    currentExercise.targetRepsMax,
    currentExercise.muscleGroup
  );

  const handleLogWorkingSet = () => {
    if (!currentExercise) return;

    // Haptic feedback
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([100, 50, 100]);
      } catch {
        // ignore
      }
    }

    if (soundEnabled) {
      audioSynth.playLogSuccessBeep();
    }

    // Build logged set
    const sets: LoggedSet[] = [];

    // Warmup sets
    warmupWeights.forEach((w, idx) => {
      sets.push({
        id: `warmup-${idx}-${Date.now()}`,
        type: 'warmup',
        setIndex: idx + 1,
        weightKg: w,
        reps: warmupReps[idx] || 10,
        rpe: 6,
        reachedFailure: false,
        timestamp: new Date().toISOString()
      });
    });

    // Working set
    const workingSetObj: LoggedSet = {
      id: `working-${Date.now()}`,
      type: 'working',
      setIndex: warmupWeights.length + 1,
      weightKg: workingWeight,
      reps: workingReps,
      rpe: workingRpe,
      reachedFailure,
      restPauseReps: enableRestPause ? restPauseReps : undefined,
      dropSetWeightKg: enableDropSet ? dropSetWeight : undefined,
      dropSetReps: enableDropSet ? dropSetReps : undefined,
      timestamp: new Date().toISOString()
    };
    sets.push(workingSetObj);

    // Double progression met?
    const dpMet = workingReps >= currentExercise.targetRepsMax;
    const autoNext = doubleProgressionCheck.nextWeightKg;

    // Check PR
    let isPr = false;
    if (prevWorkout && workingWeight > prevWorkout.weightKg) {
      isPr = true;
    }

    const loggedEx: LoggedExercise = {
      exerciseId: currentExercise.id,
      exerciseName: currentExercise.name,
      muscleGroup: currentExercise.muscleGroup,
      sets,
      doubleProgressionMet: dpMet,
      autoSuggestedNextWeightKg: autoNext,
      prAchieved: isPr,
      prType: dpMet ? 'DOUBLE_PROGRESSION' : isPr ? 'WEIGHT' : undefined
    };

    setLoggedExerciseMap(prev => ({
      ...prev,
      [currentExercise.id]: loggedEx
    }));

    // Show PR modal if hit double progression or PR
    if (dpMet || isPr) {
      setPrModalData({
        exerciseName: currentExercise.name,
        weightKg: workingWeight,
        reps: workingReps,
        prType: dpMet ? 'DOUBLE_PROGRESSION' : 'WEIGHT',
        suggestedNextWeightKg: autoNext
      });
    }

    // Trigger Rest Timer
    setActiveRestSeconds(currentExercise.restSeconds || 120);
    setShowRestTimer(true);
  };

  const handleFinishWorkout = () => {
    const exercisesList = Object.values(loggedExerciseMap);
    if (exercisesList.length === 0) {
      alert('Please log at least one exercise set before completing the session.');
      return;
    }

    const newLog: LoggedWorkout = {
      id: `workout-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      weekNumber: selectedWeekNum,
      dayKey: selectedDayKey,
      dayTitle: currentDay.title,
      exercises: exercisesList,
      durationMinutes: 45,
      ratingRpe: 10,
      notes: `HIT Session completed. Week ${selectedWeekNum} ${currentWeek.phase}.`,
      completed: true
    };

    logWorkoutSession(newLog);
    alert(`⚡ WORKOUT SAVED! Week ${selectedWeekNum} - ${currentDay.title} logged in Heavy Duty history.`);
  };

  const isCurrentLogged = !!loggedExerciseMap[currentExercise.id];

  const similarPool = exerciseLibrary.filter(e => e.muscleGroup === currentExercise.muscleGroup);
  const handleCycleSimilar = () => {
    if (editModeLocked) { alert('Unlock editing (header LOCKED → EDITING) to cycle exercises.'); return; }
    if (similarPool.length <= 1) return;
    const curIdx = similarPool.findIndex(e => e.id === currentExercise.id);
    const next = similarPool[(curIdx + 1) % similarPool.length];
    // swap in active program day
    swapExercise(currentDay.dayKey, activeExerciseIndex, next);
  };

  return (
    <div className="pb-28 max-w-4xl mx-auto px-3 sm:px-4 pt-3 overflow-x-hidden">
      {/* 1. WEEK & DAY SELECTOR HEADER */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 mb-4 shadow-xl overflow-hidden">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Week Selector */}
          <div>
            <span className="text-[10px] font-mono-code text-zinc-500 uppercase block mb-1">
              SELECT PROGRAM WEEK
            </span>
            <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
              {weeks.map(w => (
                <button
                  key={w.weekNumber}
                  onClick={() => {
                    setSelectedWeekNum(w.weekNumber);
                    setActiveExerciseIndex(0);
                  }}
                  className={`px-2.5 py-1.5 rounded font-mono-code text-xs font-bold transition flex-shrink-0 ${
                    selectedWeekNum === w.weekNumber
                      ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.5)]'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  WK {w.weekNumber}
                </button>
              ))}
            </div>
          </div>

          {/* Day Selector */}
          <div>
            <span className="text-[10px] font-mono-code text-zinc-500 uppercase block mb-1">
              SELECT WORKOUT DAY
            </span>
            <div className="flex items-center gap-1">
              {days.map(d => (
                <button
                  key={d.dayKey}
                  onClick={() => {
                    setSelectedDayKey(d.dayKey);
                    setActiveExerciseIndex(0);
                  }}
                  className={`px-3 py-1.5 rounded font-bebas text-sm sm:text-base tracking-wider transition ${
                    selectedDayKey === d.dayKey
                      ? 'bg-zinc-100 text-zinc-950 font-bold'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  DAY {d.dayKey}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Intensity Phase Banner */}
        <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded font-mono-code text-[10px] font-black uppercase bg-red-950 text-red-400 border border-red-800">
              {currentWeek.phase} PHASE
            </span>
            <span className="font-mono-code text-zinc-300 font-semibold truncate">
              {currentDay.title}
            </span>
          </div>
          <div className="text-[11px] font-mono-code text-zinc-400">
            {currentWeek.phaseRules[1] || currentWeek.phaseRules[0]}
          </div>
        </div>
      </div>

      {/* 2. EXERCISE CAROUSEL / STEPPER */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs font-mono-code text-zinc-400 mb-1.5">
          <span>EXERCISE {activeExerciseIndex + 1} OF {currentDay.exercises.length}</span>
          <span className="text-red-500 font-bold">{currentExercise.muscleGroup.toUpperCase()}</span>
        </div>

        {/* Quick jump tabs */}
        <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5">
          {currentDay.exercises.map((ex, idx) => {
            const isLogged = !!loggedExerciseMap[ex.id];
            const isActive = idx === activeExerciseIndex;
            return (
              <button
                key={ex.id}
                onClick={() => setActiveExerciseIndex(idx)}
                className={`py-2 px-1 rounded border text-center transition flex flex-col items-center justify-center relative ${
                  isActive
                    ? 'bg-zinc-900 border-red-600 text-red-400 shadow-[0_0_12px_rgba(220,38,38,0.3)]'
                    : isLogged
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {isLogged && (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 absolute top-1 right-1" />
                )}
                <span className="font-mono-code font-bold text-xs">{idx + 1}</span>
                <span className="text-[9px] font-sans truncate w-full px-0.5 text-zinc-400">
                  {ex.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MAIN ACTIVE EXERCISE CARD */}
      <div className="brutalist-card rounded-xl p-3 sm:p-5 relative mb-6 overflow-hidden">
        {/* Exercise Header */}
        <div className="flex flex-col gap-2 border-b border-zinc-800 pb-3">
          <div className="flex items-start justify-between gap-2 min-w-0">
            <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-bebas text-xl sm:text-3xl text-zinc-100 tracking-wider leading-none break-words">
                {currentExercise.name}
              </h2>
              {currentExercise.isAnkleSafe && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono-code font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1 flex-shrink-0">
                  <CheckCircle2 className="w-3 h-3" />
                  ANKLE SAFE
                </span>
              )}
            </div>
            <p className="text-xs font-mono-code text-zinc-400 mt-1 break-words">
              TEMPO: <strong className="text-red-400">{currentExercise.tempo}</strong> (3s concentric / 1s pause / 4s negative) • REST: <strong>{currentExercise.restSeconds}s</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-center">
            <button
              onClick={handleCycleSimilar}
              disabled={similarPool.length <= 1}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-mono-code font-bold border transition flex-shrink-0 ${editModeLocked ? 'bg-zinc-900 border-zinc-800 text-zinc-500 opacity-60' : 'bg-sky-950/60 border-sky-800 text-sky-300 hover:bg-sky-900 hover:border-sky-700'}`}
              title={editModeLocked ? 'Unlock editing to cycle' : `Cycle similar: ${currentExercise.muscleGroup} (${similarPool.length} options)`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">CYCLE</span>
              <span className="xs:hidden">↻</span>
            </button>
            <button
              onClick={() => setShowPlateCalc(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 hover:border-red-600 rounded text-xs font-mono-code text-zinc-200 transition flex-shrink-0"
              title="Open Plate Calculator"
            >
              <Calculator className="w-3.5 h-3.5 text-red-500" />
              <span>PLATES</span>
            </button>
          </div>
          </div>
        </div>

        {/* Previous History & Double Progression Hint */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-3">
          <div className="bg-zinc-900/80 border border-zinc-800 p-2.5 rounded text-xs font-mono-code">
            <span className="text-zinc-500 block text-[10px] uppercase">PREVIOUS SESSION LOG</span>
            {prevWorkout ? (
              <span className="font-bold text-zinc-200">
                {unitPreference === 'lbs' ? convertKgToLbs(prevWorkout.weightKg) : prevWorkout.weightKg} {unitPreference.toUpperCase()} × {prevWorkout.reps} reps (@ RPE {prevWorkout.rpe})
              </span>
            ) : (
              <span className="text-zinc-500 italic">No previous logs for this exercise. Establish baseline.</span>
            )}
          </div>

          <div className="bg-red-950/30 border border-red-900/60 p-2.5 rounded text-xs font-mono-code">
            <span className="text-red-400 font-bold block text-[10px] uppercase flex items-center gap-1">
              <Flame className="w-3 h-3 text-red-500" />
              DOUBLE PROGRESSION TARGET
            </span>
            <span className="text-zinc-200">
              TARGET: <strong className="text-red-400">{currentExercise.targetRepsMin}-{currentExercise.targetRepsMax} REPS</strong> TO FAILURE
            </span>
          </div>
        </div>

        {/* 4. WARMUP SETS SECTION */}
        {warmupWeights.length > 0 && (
          <div className="mb-4 overflow-hidden">
            <div className="text-xs font-mono-code text-zinc-500 uppercase font-semibold mb-2">
              PYRAMID WARMUP SETS (GRAY - NOT TRACKED AS WORKING FAILURE)
            </div>
            <div className="space-y-2">
              {warmupWeights.map((w, idx) => (
                <div key={idx} className="flex flex-wrap items-center gap-2 bg-zinc-900/60 border border-zinc-800 p-2 rounded min-w-0">
                  <span className="font-mono-code text-xs font-bold text-zinc-500 w-16">
                    WARMUP {idx + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="2.5"
                      value={unitPreference === 'lbs' ? convertKgToLbs(w) : w}
                      onChange={e => {
                        const val = parseFloat(e.target.value) || 0;
                        const newW = [...warmupWeights];
                        newW[idx] = unitPreference === 'lbs' ? convertLbsToKg(val) : val;
                        setWarmupWeights(newW);
                      }}
                      className="w-20 bg-zinc-950 border border-zinc-700 rounded px-2 py-1 font-mono-code text-xs font-bold text-zinc-300"
                    />
                    <span className="text-[10px] font-mono-code text-zinc-500">{unitPreference}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={warmupReps[idx] || 10}
                      onChange={e => {
                        const val = parseInt(e.target.value) || 0;
                        const newR = [...warmupReps];
                        newR[idx] = val;
                        setWarmupReps(newR);
                      }}
                      className="w-16 bg-zinc-950 border border-zinc-700 rounded px-2 py-1 font-mono-code text-xs font-bold text-zinc-300"
                    />
                    <span className="text-[10px] font-mono-code text-zinc-500">reps</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const newL = [...warmupLogged];
                      newL[idx] = !newL[idx];
                      setWarmupLogged(newL);
                    }}
                    className={`ml-auto px-2.5 py-1 rounded text-[11px] font-mono-code font-bold transition ${
                      warmupLogged[idx]
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {warmupLogged[idx] ? 'DONE' : 'MARK DONE'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. HEAVY DUTY WORKING SET SECTION */}
        <div className="bg-gradient-to-b from-red-950/40 to-zinc-950 border-2 border-red-600/80 rounded-xl p-3.5 sm:p-4 shadow-[0_0_20px_rgba(220,38,38,0.2)]">
          <div className="flex items-center justify-between border-b border-red-900/60 pb-2 mb-3">
            <span className="font-bebas text-lg text-red-500 tracking-wider flex items-center gap-1.5">
              <Zap className="w-5 h-5 text-red-500 animate-pulse" />
              1 WORKING SET TO POSITIVE FAILURE
            </span>
            <span className="text-xs font-mono-code text-zinc-400">
              TEMPO: <strong className="text-red-400">3/1/4</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {/* Weight Input */}
            <div>
              <label className="block text-xs font-mono-code text-zinc-300 uppercase mb-1">
                WORKING WEIGHT ({unitPreference.toUpperCase()})
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="2.5"
                  value={unitPreference === 'lbs' ? convertKgToLbs(workingWeight) : workingWeight}
                  onChange={e => {
                    const val = parseFloat(e.target.value) || 0;
                    setWorkingWeight(unitPreference === 'lbs' ? convertLbsToKg(val) : val);
                  }}
                  className="w-full bg-zinc-900 border-2 border-red-700/80 rounded px-3 py-2 font-mono-code text-3xl font-black text-red-500 focus:outline-none focus:border-red-500"
                />
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => setWorkingWeight(prev => prev + 2.5)}
                    className="px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-xs font-mono-code font-bold hover:bg-zinc-800 text-zinc-200 rounded"
                  >
                    +2.5
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkingWeight(prev => Math.max(0, prev - 2.5))}
                    className="px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-xs font-mono-code font-bold hover:bg-zinc-800 text-zinc-200 rounded"
                  >
                    -2.5
                  </button>
                </div>
              </div>
            </div>

            {/* Reps Input */}
            <div>
              <label className="block text-xs font-mono-code text-zinc-300 uppercase mb-1">
                REPS ACHIEVED (FAILURE)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={workingReps}
                  onChange={e => setWorkingReps(parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-900 border-2 border-red-700/80 rounded px-3 py-2 font-mono-code text-3xl font-black text-red-500 focus:outline-none focus:border-red-500"
                />
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => setWorkingReps(prev => prev + 1)}
                    className="px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-xs font-mono-code font-bold hover:bg-zinc-800 text-zinc-200 rounded"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkingReps(prev => Math.max(0, prev - 1))}
                    className="px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-xs font-mono-code font-bold hover:bg-zinc-800 text-zinc-200 rounded"
                  >
                    -1
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RPE Picker & Failure Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-950 p-2.5 rounded border border-zinc-800 mb-4">
            <div>
              <span className="text-[11px] font-mono-code text-zinc-400 block mb-1">
                RATE OF PERCEIVED EXERTION (RPE)
              </span>
              <div className="flex items-center gap-1">
                {[7, 8, 9, 10].map(rpe => (
                  <button
                    key={rpe}
                    type="button"
                    onClick={() => setWorkingRpe(rpe)}
                    className={`px-3 py-1 rounded font-mono-code text-xs font-bold ${
                      workingRpe === rpe
                        ? 'bg-red-600 text-white'
                        : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {rpe === 10 ? '10 (FAILURE)' : rpe}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setReachedFailure(!reachedFailure)}
              className={`px-3 py-2 rounded font-mono-code text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                reachedFailure
                  ? 'bg-red-950 border border-red-600 text-red-400 shadow-[0_0_10px_rgba(220,38,38,0.4)]'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-500'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>{reachedFailure ? '100% FAILURE REACHED' : 'NOT AT FAILURE'}</span>
            </button>
          </div>

          {/* Beyond-Failure Techniques (Rest-Pause & Drop-Set) */}
          <div className="space-y-2 mb-4">
            {/* Rest-Pause Toggle */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableRestPause}
                  onChange={e => setEnableRestPause(e.target.checked)}
                  className="w-4 h-4 accent-red-600"
                />
                <span className="font-mono-code text-xs font-bold text-zinc-200">
                  REST-PAUSE (10-15s Rest + Extra Reps)
                </span>
              </label>

              {enableRestPause && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono-code text-zinc-400">EXTRA REPS:</span>
                  <input
                    type="number"
                    value={restPauseReps}
                    onChange={e => setRestPauseReps(parseInt(e.target.value) || 0)}
                    className="w-16 bg-zinc-950 border border-zinc-700 rounded px-2 py-0.5 font-mono-code text-xs text-amber-400 font-bold"
                  />
                </div>
              )}
            </div>

            {/* Drop Set Toggle */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableDropSet}
                  onChange={e => setEnableDropSet(e.target.checked)}
                  className="w-4 h-4 accent-red-600"
                />
                <span className="font-mono-code text-xs font-bold text-zinc-200">
                  DROP SET (-20% Weight immediately after)
                </span>
              </label>

              {enableDropSet && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono-code text-zinc-400">DROP WEIGHT:</span>
                    <input
                      type="number"
                      value={unitPreference === 'lbs' ? convertKgToLbs(dropSetWeight) : dropSetWeight}
                      onChange={e => setDropSetWeight(parseFloat(e.target.value) || 0)}
                      className="w-20 bg-zinc-950 border border-zinc-700 rounded px-2 py-0.5 font-mono-code text-xs text-red-400 font-bold"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono-code text-zinc-400">REPS:</span>
                    <input
                      type="number"
                      value={dropSetReps}
                      onChange={e => setDropSetReps(parseInt(e.target.value) || 0)}
                      className="w-14 bg-zinc-950 border border-zinc-700 rounded px-2 py-0.5 font-mono-code text-xs text-red-400 font-bold"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* LOG WORKING SET BUTTON */}
          <button
            type="button"
            onClick={handleLogWorkingSet}
            className={`w-full py-3.5 rounded font-mono-code font-black text-base sm:text-lg tracking-widest flex items-center justify-center gap-2 shadow-lg transition ${
              isCurrentLogged
                ? 'bg-emerald-950 border border-emerald-600 text-emerald-300 hover:bg-emerald-900'
                : 'brutalist-button-red'
            }`}
          >
            <Dumbbell className="w-5 h-5" />
            <span>{isCurrentLogged ? 'UPDATE LOGGED WORKING SET' : 'LOG WORKING SET TO FAILURE'}</span>
          </button>
        </div>

        {/* Stepper Navigation */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800">
          <button
            onClick={() => setActiveExerciseIndex(prev => Math.max(0, prev - 1))}
            disabled={activeExerciseIndex === 0}
            className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded font-mono-code text-xs font-bold disabled:opacity-30 flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> PREV EXERCISE
          </button>

          <button
            onClick={() => setActiveExerciseIndex(prev => Math.min(currentDay.exercises.length - 1, prev + 1))}
            disabled={activeExerciseIndex === currentDay.exercises.length - 1}
            className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded font-mono-code text-xs font-bold disabled:opacity-30 flex items-center gap-1"
          >
            NEXT EXERCISE <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 6. COMPLETE WORKOUT SESSION ACTION */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl">
        <div>
          <h3 className="font-bebas text-xl text-zinc-100">FINISH TEMPLE GYM SESSION</h3>
          <p className="text-xs font-mono-code text-zinc-400">
            {Object.keys(loggedExerciseMap).length} of {currentDay.exercises.length} exercises logged.
          </p>
        </div>

        <button
          onClick={handleFinishWorkout}
          className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-mono-code font-black text-sm rounded tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>SAVE WORKOUT SESSION</span>
        </button>
      </div>

      {/* REST TIMER OVERLAY */}
      {showRestTimer && (
        <RestTimer
          initialSeconds={activeRestSeconds}
          exerciseName={currentExercise.name}
          soundEnabled={soundEnabled}
          onClose={() => setShowRestTimer(false)}
        />
      )}

      {/* PLATE CALCULATOR MODAL */}
      {showPlateCalc && (
        <PlateCalculatorModal
          initialWeightKg={workingWeight}
          unitPreference={unitPreference}
          onClose={() => setShowPlateCalc(false)}
        />
      )}

      {/* PR / DOUBLE PROGRESSION MODAL */}
      {prModalData && (
        <PRAnimationModal
          exerciseName={prModalData.exerciseName}
          weightKg={prModalData.weightKg}
          reps={prModalData.reps}
          prType={prModalData.prType}
          suggestedNextWeightKg={prModalData.suggestedNextWeightKg}
          onClose={() => setPrModalData(null)}
        />
      )}
    </div>
  );
};
