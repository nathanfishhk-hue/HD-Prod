import React, { useState } from 'react';
import {
  Wrench,
  Lock,
  Unlock,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  PlusCircle,
  Copy,
  Check,
  ShieldAlert,
  Edit3
} from 'lucide-react';
import { useHitStorage } from '../../hooks/useHitStorage';
import { ExerciseDefinition, WorkoutDayConfig, MuscleGroup } from '../../types/hit';
import { EXERCISE_LIBRARY } from '../../data/exerciseLibrary';

interface ProgramBuilderProps {
  storage: ReturnType<typeof useHitStorage>;
}

export const ProgramBuilder: React.FC<ProgramBuilderProps> = ({ storage }) => {
  const {
    weeks,
    days,
    updateExercise,
    swapExercise,
    addExerciseToDay,
    removeExerciseFromDay,
    reorderExerciseInDay,
    addCustomDay,
    extendProgramWeeks,
    duplicateWeek,
    editModeLocked,
    toggleEditModeLock
  } = storage;

  const [activeDayKey, setActiveDayKey] = useState<string>('A');
  const [editingExerciseIdx, setEditingExerciseIndex] = useState<number | null>(null);

  // New exercise modal/drawer
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedLibId, setSelectedLibId] = useState<string>(EXERCISE_LIBRARY[0].id);

  // New Day form
  const [showAddDayModal, setShowAddDayModal] = useState<boolean>(false);
  const [newDayTitle, setNewDayTitle] = useState<string>('DAY D: ARMS & CORE SPECIAL');

  // Week extension
  const [extendWeeksCount, setExtendWeeksCount] = useState<number>(12);

  const activeDay = days.find(d => d.dayKey === activeDayKey) || days[0];

  const handleSwapSelected = (exerciseIdx: number, newExId: string) => {
    const found = EXERCISE_LIBRARY.find(e => e.id === newExId);
    if (found) {
      swapExercise(activeDayKey, exerciseIdx, found);
    }
  };

  const handleAddSelectedFromLibrary = () => {
    const found = EXERCISE_LIBRARY.find(e => e.id === selectedLibId);
    if (found) {
      addExerciseToDay(activeDayKey, found);
      setShowAddModal(false);
    }
  };

  const handleCreateCustomDay = () => {
    if (!newDayTitle.trim()) return;
    const nextKey = String.fromCharCode(65 + days.length); // 'D', 'E', etc.
    const customDayObj: WorkoutDayConfig = {
      dayKey: nextKey,
      title: newDayTitle.toUpperCase(),
      subtitle: 'Custom HIT Routine',
      description: 'User created high intensity session.',
      exercises: [EXERCISE_LIBRARY[0], EXERCISE_LIBRARY[1]]
    };
    addCustomDay(customDayObj);
    setActiveDayKey(nextKey);
    setShowAddDayModal(false);
  };

  return (
    <div className="pb-28 max-w-4xl mx-auto px-3 sm:px-4 pt-3">
      {/* Top Banner & Edit Lock status */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 mb-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-red-500" />
            <h2 className="font-bebas text-2xl text-zinc-100 tracking-wider">HIT PROGRAM BUILDER & EDITOR</h2>
          </div>
          <p className="text-xs font-mono-code text-zinc-400">
            Customize 6-12 Week Heavy Duty exercises, tempos, rest periods, and ankle-safe tags.
          </p>
        </div>

        <button
          onClick={toggleEditModeLock}
          className={`px-4 py-2 rounded font-mono-code font-bold text-xs flex items-center justify-center gap-2 transition ${
            editModeLocked
              ? 'bg-zinc-900 border border-zinc-700 text-zinc-300 hover:border-amber-500'
              : 'bg-amber-950 border-2 border-amber-500 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
          }`}
        >
          {editModeLocked ? (
            <>
              <Lock className="w-4 h-4 text-zinc-400" />
              <span>EDIT MODE LOCKED</span>
            </>
          ) : (
            <>
              <Unlock className="w-4 h-4 text-amber-400" />
              <span>EDIT MODE UNLOCKED</span>
            </>
          )}
        </button>
      </div>

      {editModeLocked && (
        <div className="bg-amber-950/40 border border-amber-800/80 rounded-lg p-3 mb-4 flex items-center gap-2 text-xs font-mono-code text-amber-300">
          <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            Program editing is locked to prevent accidental modifications during workouts. Click <strong>EDIT MODE UNLOCKED</strong> above to edit.
          </span>
        </div>
      )}

      {/* 1. DAY TABS & CUSTOM DAY ADDITION */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 mb-4">
        <div className="flex items-center gap-1.5">
          {days.map(d => (
            <button
              key={d.dayKey}
              onClick={() => setActiveDayKey(d.dayKey)}
              className={`px-3 py-2 rounded font-bebas text-lg tracking-wider transition ${
                activeDayKey === d.dayKey
                  ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.5)]'
                  : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {d.title.split(':')[0]}
            </button>
          ))}
        </div>

        {!editModeLocked && (
          <button
            onClick={() => setShowAddDayModal(true)}
            className="px-3 py-2 bg-zinc-900 border border-zinc-700 hover:border-red-600 rounded font-mono-code text-xs font-bold text-zinc-200 flex items-center gap-1.5 flex-shrink-0"
          >
            <Plus className="w-4 h-4 text-red-500" />
            <span>ADD CUSTOM DAY</span>
          </button>
        )}
      </div>

      {/* 2. ACTIVE DAY EXERCISE LIST */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 mb-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
          <div>
            <h3 className="font-bebas text-2xl text-zinc-100">{activeDay.title}</h3>
            <p className="text-xs font-mono-code text-zinc-400">{activeDay.description}</p>
          </div>

          {!editModeLocked && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 bg-red-950 border border-red-600 hover:bg-red-900 rounded font-mono-code text-xs font-bold text-red-200 flex items-center gap-1"
            >
              <PlusCircle className="w-4 h-4" />
              <span>ADD EXERCISE</span>
            </button>
          )}
        </div>

        {/* Exercises */}
        <div className="space-y-3">
          {activeDay.exercises.map((ex, idx) => (
            <div
              key={ex.id || idx}
              className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-3.5 flex flex-col gap-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-red-950 border border-red-700 text-red-400 font-mono-code font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="font-bebas text-xl text-zinc-100">{ex.name}</h4>
                    <span className="text-[10px] font-mono-code text-zinc-500 uppercase">
                      {ex.muscleGroup} • TEMPO: {ex.tempo} • REST: {ex.restSeconds}s
                    </span>
                  </div>
                </div>

                {/* Actions when unlocked */}
                {!editModeLocked && (
                  <div className="flex items-center gap-1">
                    {/* Swap Dropdown */}
                    <select
                      value={ex.id}
                      onChange={e => handleSwapSelected(idx, e.target.value)}
                      className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs font-mono-code text-zinc-300 focus:outline-none focus:border-red-600"
                    >
                      <option value={ex.id}>SWAP WITH...</option>
                      {EXERCISE_LIBRARY.map(lib => (
                        <option key={lib.id} value={lib.id}>
                          {lib.name} ({lib.muscleGroup})
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => reorderExerciseInDay(activeDayKey, idx, Math.max(0, idx - 1))}
                      disabled={idx === 0}
                      className="p-1.5 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-100 rounded disabled:opacity-30"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => reorderExerciseInDay(activeDayKey, idx, Math.min(activeDay.exercises.length - 1, idx + 1))}
                      disabled={idx === activeDay.exercises.length - 1}
                      className="p-1.5 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-100 rounded disabled:opacity-30"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => removeExerciseFromDay(activeDayKey, idx)}
                      className="p-1.5 bg-red-950/60 border border-red-800 text-red-400 hover:text-red-200 rounded"
                      title="Remove Exercise"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Editable Fields when Unlocked */}
              {!editModeLocked && (
                <div className="bg-zinc-950 p-3 rounded border border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono-code">
                  <div>
                    <label className="text-zinc-500 block text-[10px]">MIN REPS</label>
                    <input
                      type="number"
                      value={ex.targetRepsMin}
                      onChange={e => {
                        const val = parseInt(e.target.value) || 0;
                        updateExercise(activeDayKey, idx, { ...ex, targetRepsMin: val });
                      }}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-zinc-200 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-500 block text-[10px]">MAX REPS</label>
                    <input
                      type="number"
                      value={ex.targetRepsMax}
                      onChange={e => {
                        const val = parseInt(e.target.value) || 0;
                        updateExercise(activeDayKey, idx, { ...ex, targetRepsMax: val });
                      }}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-zinc-200 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-500 block text-[10px]">WARMUP SETS</label>
                    <input
                      type="number"
                      value={ex.defaultWarmups}
                      onChange={e => {
                        const val = parseInt(e.target.value) || 0;
                        updateExercise(activeDayKey, idx, { ...ex, defaultWarmups: val });
                      }}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-zinc-200 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-500 block text-[10px]">REST (SECONDS)</label>
                    <input
                      type="number"
                      value={ex.restSeconds}
                      onChange={e => {
                        const val = parseInt(e.target.value) || 0;
                        updateExercise(activeDayKey, idx, { ...ex, restSeconds: val });
                      }}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-zinc-200 font-bold"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. PROGRAM EXTENSION & DURATION MANAGEMENT */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
          <h3 className="font-bebas text-xl text-zinc-100">EXTEND PROGRAM DURATION & WEEKS</h3>
          <span className="text-xs font-mono-code text-red-500 font-bold">
            CURRENT: {weeks.length} WEEKS
          </span>
        </div>

        <p className="text-xs font-mono-code text-zinc-400 mb-3">
          Extend your 6-week HIT Recomp wave to 12 weeks for prolonged muscular overload.
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={() => extendProgramWeeks(12)}
            disabled={weeks.length >= 12}
            className="px-4 py-2 bg-red-950 border border-red-600 hover:bg-red-900 text-red-200 font-mono-code text-xs font-bold rounded disabled:opacity-40 transition"
          >
            EXTEND TO 12 WEEKS
          </button>
        </div>
      </div>

      {/* ADD EXERCISE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border-2 border-red-700 rounded-xl max-w-md w-full p-5">
            <h3 className="font-bebas text-2xl text-zinc-100 mb-3">SELECT EXERCISE FROM LIBRARY</h3>
            <select
              value={selectedLibId}
              onChange={e => setSelectedLibId(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 font-mono-code text-sm text-zinc-200 mb-4"
            >
              {EXERCISE_LIBRARY.map(lib => (
                <option key={lib.id} value={lib.id}>
                  {lib.name} — {lib.muscleGroup}
                </option>
              ))}
            </select>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 bg-zinc-800 text-zinc-300 font-mono-code text-xs rounded"
              >
                CANCEL
              </button>
              <button
                onClick={handleAddSelectedFromLibrary}
                className="px-4 py-1.5 brutalist-button-red text-xs rounded"
              >
                ADD TO DAY {activeDayKey}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD CUSTOM DAY MODAL */}
      {showAddDayModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border-2 border-red-700 rounded-xl max-w-md w-full p-5">
            <h3 className="font-bebas text-2xl text-zinc-100 mb-3">CREATE CUSTOM WORKOUT DAY</h3>
            <input
              type="text"
              value={newDayTitle}
              onChange={e => setNewDayTitle(e.target.value)}
              placeholder="e.g. DAY D: ARMS & CORE"
              className="w-full bg-zinc-900 border border-zinc-700 rounded p-2.5 font-mono-code text-sm text-zinc-100 mb-4"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowAddDayModal(false)}
                className="px-3 py-1.5 bg-zinc-800 text-zinc-300 font-mono-code text-xs rounded"
              >
                CANCEL
              </button>
              <button
                onClick={handleCreateCustomDay}
                className="px-4 py-1.5 brutalist-button-red text-xs rounded"
              >
                CREATE DAY
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
