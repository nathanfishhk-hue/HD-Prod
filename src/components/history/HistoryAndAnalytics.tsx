import React, { useRef } from 'react';
import {
  Calendar,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  BarChart3,
  FileSpreadsheet,
  FileCode,
  Trash2,
  Clock,
  Dumbbell
} from 'lucide-react';
import { useHitStorage } from '../../hooks/useHitStorage';
import { LoggedWorkout, MuscleGroup } from '../../types/hit';

interface HistoryAndAnalyticsProps {
  storage: ReturnType<typeof useHitStorage>;
}

export const HistoryAndAnalytics: React.FC<HistoryAndAnalyticsProps> = ({ storage }) => {
  const {
    weeks,
    days,
    workoutLogs,
    exportDataCSV,
    exportDataJSON,
    importDataJSON,
    resetToDefaults
  } = storage;

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Calculate 18 planned workout slots (6 weeks x 3 days)
  const totalPlanned = weeks.length * days.length;
  const completedCount = workoutLogs.filter(l => l.completed).length;
  const adherencePercent = Math.round((completedCount / totalPlanned) * 100);

  // Volume per muscle group calculation (Total tonnage = Weight x Reps)
  const muscleVolumeMap: Record<MuscleGroup, number> = {
    Chest: 0,
    'Lats/Back': 0,
    Legs: 0,
    Shoulders: 0,
    Biceps: 0,
    Triceps: 0,
    Abs: 0
  };

  workoutLogs.forEach(log => {
    log.exercises.forEach(ex => {
      ex.sets.forEach(s => {
        if (s.type === 'working') {
          const tonnage = s.weightKg * s.reps;
          if (muscleVolumeMap[ex.muscleGroup] !== undefined) {
            muscleVolumeMap[ex.muscleGroup] += tonnage;
          }
        }
      });
    });
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        importDataJSON(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="pb-28 max-w-4xl mx-auto px-3 sm:px-4 pt-3 space-y-6">
      {/* 1. HEADER */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-red-500" />
            <h2 className="font-bebas text-2xl text-zinc-100 tracking-wider">WORKOUT HISTORY & ANALYTICS</h2>
          </div>
          <p className="text-xs font-mono-code text-zinc-400">
            18-Session Calendar Heatmap, Adherence Percentage, Muscle Tonnage & Data Backups.
          </p>
        </div>

        {/* Adherence Badge */}
        <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg text-right flex-shrink-0">
          <span className="text-[10px] font-mono-code text-zinc-500 uppercase block">PROGRAM ADHERENCE</span>
          <span className="font-bebas text-3xl text-emerald-400">{adherencePercent}%</span>
          <span className="text-[10px] font-mono-code text-zinc-400 block">
            ({completedCount} / {totalPlanned} Completed)
          </span>
        </div>
      </div>

      {/* 2. 18 WORKOUT CALENDAR HEATMAP GRID */}
      <div className="brutalist-card rounded-xl p-4 sm:p-5">
        <h3 className="font-bebas text-xl text-zinc-100 mb-2">6-WEEK PROGRAM HEATMAP GRID</h3>
        <p className="text-xs font-mono-code text-zinc-400 mb-4">
          Red tiles represent completed Heavy Duty failure sessions.
        </p>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {weeks.map(w => (
            <div key={w.weekNumber} className="bg-zinc-950 border border-zinc-800 p-2 rounded">
              <span className="text-[10px] font-mono-code font-bold text-zinc-500 block mb-1">
                WEEK {w.weekNumber}
              </span>
              <div className="grid grid-cols-3 gap-1">
                {days.map(d => {
                  const log = workoutLogs.find(l => l.weekNumber === w.weekNumber && l.dayKey === d.dayKey);
                  const isDone = !!log?.completed;

                  return (
                    <div
                      key={d.dayKey}
                      title={`Wk ${w.weekNumber} Day ${d.dayKey}: ${isDone ? 'Completed' : 'Pending'}`}
                      className={`h-9 rounded border flex items-center justify-center font-mono-code text-xs font-bold transition ${
                        isDone
                          ? 'bg-red-600 border-red-500 text-white shadow-[0_0_8px_rgba(220,38,38,0.5)]'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-600'
                      }`}
                    >
                      {d.dayKey}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. VOLUME TONNAGE BY MUSCLE GROUP */}
      <div className="brutalist-card rounded-xl p-4 sm:p-5">
        <h3 className="font-bebas text-xl text-zinc-100 mb-3 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-red-500" />
          TOTAL WORKING VOLUME BY MUSCLE GROUP (KG TONNAGE)
        </h3>

        <div className="space-y-2.5 font-mono-code text-xs">
          {Object.entries(muscleVolumeMap).map(([muscle, tonnage]) => {
            const maxTonnage = Math.max(...Object.values(muscleVolumeMap), 1000);
            const percent = Math.min(100, Math.round((tonnage / maxTonnage) * 100));

            return (
              <div key={muscle}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-zinc-300 font-bold">{muscle}</span>
                  <span className="text-red-400 font-bold">{tonnage.toLocaleString()} kg</span>
                </div>
                <div className="w-full h-2.5 bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-700 to-amber-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. WORKOUT LOGS LIST */}
      <div className="brutalist-card rounded-xl p-4 sm:p-5">
        <h3 className="font-bebas text-xl text-zinc-100 mb-3">WORKOUT LOG HISTORY</h3>

        {workoutLogs.length === 0 ? (
          <div className="py-8 text-center text-xs font-mono-code text-zinc-500 bg-zinc-900/50 rounded border border-dashed border-zinc-800">
            No completed workouts recorded yet. Start logging sessions in the WORKOUT RUNNER!
          </div>
        ) : (
          <div className="space-y-3">
            {workoutLogs.map(log => (
              <div key={log.id} className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-2 mb-2 gap-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="font-bebas text-lg text-zinc-100">{log.dayTitle}</span>
                    <span className="text-[10px] font-mono-code bg-red-950 text-red-400 px-2 py-0.5 rounded border border-red-800">
                      WK {log.weekNumber}
                    </span>
                  </div>
                  <span className="text-xs font-mono-code text-zinc-400">{log.date}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono-code">
                  {log.exercises.map(ex => {
                    const workingSet = ex.sets.find(s => s.type === 'working');
                    return (
                      <div key={ex.exerciseId} className="bg-zinc-950 p-2 rounded border border-zinc-800/80">
                        <span className="text-zinc-400 font-bold block truncate">{ex.exerciseName}</span>
                        {workingSet && (
                          <span className="text-red-400 font-bold">
                            {workingSet.weightKg}kg × {workingSet.reps} reps
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. BACKUP & EXPORT ACTIONS */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 shadow-xl space-y-3">
        <h3 className="font-bebas text-xl text-zinc-100">DATA PORTABILITY & BACKUP</h3>
        <p className="text-xs font-mono-code text-zinc-400">
          All data remains 100% offline in local browser storage. Export JSON/CSV backups anytime.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportDataJSON}
            className="px-3.5 py-2 bg-zinc-900 border border-zinc-700 hover:border-red-600 text-zinc-200 font-mono-code text-xs font-bold rounded flex items-center gap-1.5 transition"
          >
            <FileCode className="w-4 h-4 text-red-500" />
            <span>EXPORT JSON</span>
          </button>

          <button
            onClick={exportDataCSV}
            className="px-3.5 py-2 bg-zinc-900 border border-zinc-700 hover:border-emerald-600 text-zinc-200 font-mono-code text-xs font-bold rounded flex items-center gap-1.5 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>EXPORT CSV</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 bg-zinc-900 border border-zinc-700 hover:border-amber-500 text-zinc-200 font-mono-code text-xs font-bold rounded flex items-center gap-1.5 transition"
          >
            <Upload className="w-4 h-4 text-amber-400" />
            <span>IMPORT BACKUP</span>
          </button>

          <button
            onClick={resetToDefaults}
            className="px-3.5 py-2 bg-red-950/60 border border-red-800 text-red-400 hover:text-red-200 font-mono-code text-xs font-bold rounded flex items-center gap-1.5 transition ml-auto"
          >
            <Trash2 className="w-4 h-4" />
            <span>RESET ALL DATA</span>
          </button>
        </div>
      </div>
    </div>
  );
};
