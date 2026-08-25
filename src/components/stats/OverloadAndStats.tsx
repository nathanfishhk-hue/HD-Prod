import React, { useState } from 'react';
import {
  TrendingUp,
  Award,
  Activity,
  Plus,
  Trash2,
  Calendar,
  Flame,
  CheckCircle2,
  CheckSquare,
  Square,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';
import { useHitStorage } from '../../hooks/useHitStorage';
import { BodyStatEntry } from '../../types/hit';
import { EXERCISE_LIBRARY } from '../../data/exerciseLibrary';
import { DEFAULT_PULLUP_ROADMAP } from '../../data/pullupRoadmap';
import { calculateRecompMetrics, convertKgToLbs } from '../../utils/hitCalculators';

interface OverloadAndStatsProps {
  storage: ReturnType<typeof useHitStorage>;
}

export const OverloadAndStats: React.FC<OverloadAndStatsProps> = ({ storage }) => {
  const {
    userProfile,
    bodyStats,
    addBodyStatEntry,
    removeBodyStatEntry,
    getExerciseHistory,
    unitPreference
  } = storage;

  const [selectedExId, setSelectedExId] = useState<string>('ex-incline-press');

  // Form input state for new body stat entry
  const [statDate, setStatDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [statWeight, setStatWeight] = useState<number>(userProfile.weightKg);
  const [statWaist, setStatWaist] = useState<number>(95);
  const [statBf, setStatBf] = useState<number>(userProfile.bfPercent);
  const [statProtein, setStatProtein] = useState<number>(200);
  const [statCreatine, setStatCreatine] = useState<boolean>(true);
  const [statSleep, setStatSleep] = useState<number>(7);

  // Pull-up roadmap state
  const [roadmap, setRoadmap] = useState(DEFAULT_PULLUP_ROADMAP);

  const selectedEx = EXERCISE_LIBRARY.find(e => e.id === selectedExId) || EXERCISE_LIBRARY[0];
  const chartHistory = getExerciseHistory(selectedEx.name);

  const recompMetrics = calculateRecompMetrics(
    bodyStats.length > 0 ? bodyStats[0].weightKg : userProfile.weightKg,
    userProfile.heightCm,
    userProfile.age,
    bodyStats.length > 0 ? bodyStats[0].bfPercent : userProfile.bfPercent
  );

  const handleAddStat = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: BodyStatEntry = {
      id: `stat-${Date.now()}`,
      date: statDate,
      weightKg: statWeight,
      waistCm: statWaist,
      bfPercent: statBf,
      proteinIntakeG: statProtein,
      creatineTaken: statCreatine,
      sleepHours: statSleep
    };

    addBodyStatEntry(newEntry);
    alert('Body stat entry saved!');
  };

  const handleToggleRoadmap = (stepNum: number) => {
    setRoadmap(prev =>
      prev.map(step => {
        if (step.step === stepNum) {
          const nextStatus = step.status === 'completed' ? 'current' : 'completed';
          return { ...step, status: nextStatus };
        }
        return step;
      })
    );
  };

  return (
    <div className="pb-28 max-w-4xl mx-auto px-3 sm:px-4 pt-3 space-y-6">
      {/* 1. TOP OVERLOAD HEADER */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-5 h-5 text-red-500" />
          <h2 className="font-bebas text-2xl text-zinc-100 tracking-wider">PROGRESSIVE OVERLOAD & BODY STATS</h2>
        </div>
        <p className="text-xs font-mono-code text-zinc-400">
          Track Double Progression triggers, estimated 1RMs, body weight & BF% recomp trendlines over 6 months.
        </p>
      </div>

      {/* 2. EXERCISE PROGRESSION GRAPH */}
      <div className="brutalist-card rounded-xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-3 mb-4 gap-2">
          <div>
            <span className="text-[10px] font-mono-code text-zinc-500 uppercase block">SELECT EXERCISE TO CHART</span>
            <select
              value={selectedExId}
              onChange={e => setSelectedExId(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 font-mono-code text-sm font-bold text-red-400 focus:outline-none focus:border-red-600"
            >
              {EXERCISE_LIBRARY.map(ex => (
                <option key={ex.id} value={ex.id}>
                  {ex.name} ({ex.muscleGroup})
                </option>
              ))}
            </select>
          </div>

          <div className="text-right text-xs font-mono-code text-zinc-400">
            <span>SESSIONS LOGGED: </span>
            <strong className="text-red-500">{chartHistory.length}</strong>
          </div>
        </div>

        {/* Recharts Line Chart */}
        {chartHistory.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-xs font-mono-code text-zinc-500 bg-zinc-900/40 rounded border border-dashed border-zinc-800">
            No historical logs recorded for {selectedEx.name} yet. Complete a workout runner session to populate data.
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" tick={{ fontSize: 10 }} />
                <YAxis stroke="#71717a" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#7f1d1d', borderRadius: '8px', color: '#f1f5f9' }}
                />
                <Line
                  type="monotone"
                  dataKey="weightKg"
                  name="Weight (kg)"
                  stroke="#dc2626"
                  strokeWidth={3}
                  dot={{ fill: '#dc2626', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="e1rm"
                  name="Est 1RM (kg)"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ fill: '#f59e0b', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 3. RECOMP BODY STATS TRACKER */}
      <div className="brutalist-card rounded-xl p-4 sm:p-5">
        <div className="border-b border-zinc-800 pb-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bebas text-2xl text-zinc-100">BODY RECOMP METRICS & TRENDS</h3>
          </div>
          <span className="text-xs font-mono-code text-emerald-400 font-bold bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-800">
            TARGET DEFICIT: ~2100 KCAL
          </span>
        </div>

        {/* Calculated Recomp Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6 text-xs font-mono-code">
          <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded">
            <span className="text-zinc-500 block text-[10px]">LEAN MASS / FAT MASS</span>
            <span className="font-bold text-zinc-200">{recompMetrics.leanMassKg}kg / {recompMetrics.fatMassKg}kg</span>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded">
            <span className="text-zinc-500 block text-[10px]">ESTIMATED TDEE</span>
            <span className="font-bold text-amber-400">{recompMetrics.tdee} kcal</span>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded">
            <span className="text-zinc-500 block text-[10px]">RECOMP DEFICIT INTAKE</span>
            <span className="font-bold text-red-400">{recompMetrics.recommendedCalories} kcal</span>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded">
            <span className="text-zinc-500 block text-[10px]">DAILY PROTEIN TARGET</span>
            <span className="font-bold text-emerald-400">{recompMetrics.proteinGrams}g / day</span>
          </div>
        </div>

        {/* Recharts Body Weight Graph */}
        <div className="mb-6">
          <span className="text-xs font-mono-code text-zinc-400 uppercase font-semibold block mb-2">
            BODYWEIGHT (KG) & BODY FAT (%) TREND
          </span>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[...bodyStats].reverse()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" tick={{ fontSize: 10 }} />
                <YAxis stroke="#71717a" tick={{ fontSize: 10 }} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', color: '#f1f5f9' }}
                />
                <Line type="monotone" dataKey="weightKg" name="Weight (kg)" stroke="#ef4444" strokeWidth={3} />
                <Line type="monotone" dataKey="bfPercent" name="Body Fat (%)" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Entry Form */}
        <form onSubmit={handleAddStat} className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
          <span className="font-mono-code text-xs font-bold text-zinc-200 block uppercase">
            + RECORD TODAY'S BODY STATS & SUPPLEMENTS
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono-code">
            <div>
              <label className="text-zinc-500 block text-[10px]">DATE</label>
              <input
                type="date"
                value={statDate}
                onChange={e => setStatDate(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-zinc-200"
              />
            </div>

            <div>
              <label className="text-zinc-500 block text-[10px]">WEIGHT (KG)</label>
              <input
                type="number"
                step="0.1"
                value={statWeight}
                onChange={e => setStatWeight(parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-zinc-200 font-bold"
              />
            </div>

            <div>
              <label className="text-zinc-500 block text-[10px]">WAIST (CM)</label>
              <input
                type="number"
                step="0.5"
                value={statWaist}
                onChange={e => setStatWaist(parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-zinc-200 font-bold"
              />
            </div>

            <div>
              <label className="text-zinc-500 block text-[10px]">BODY FAT %</label>
              <input
                type="number"
                step="0.1"
                value={statBf}
                onChange={e => setStatBf(parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-zinc-200 font-bold"
              />
            </div>

            <div>
              <label className="text-zinc-500 block text-[10px]">PROTEIN (G)</label>
              <input
                type="number"
                value={statProtein}
                onChange={e => setStatProtein(parseInt(e.target.value) || 0)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-emerald-400 font-bold"
              />
            </div>

            <div>
              <label className="text-zinc-500 block text-[10px]">SLEEP (HOURS)</label>
              <input
                type="number"
                step="0.5"
                value={statSleep}
                onChange={e => setStatSleep(parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-amber-400 font-bold"
              />
            </div>

            <div className="col-span-2 flex items-center pt-3">
              <label className="flex items-center gap-2 cursor-pointer font-mono-code text-xs text-zinc-200 font-bold">
                <input
                  type="checkbox"
                  checked={statCreatine}
                  onChange={e => setStatCreatine(e.target.checked)}
                  className="w-4 h-4 accent-red-600"
                />
                <span>5G CREATINE MONOHYDRATE TAKEN TODAY</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full brutalist-button-red py-2.5 rounded font-mono-code font-bold text-xs tracking-wider"
          >
            LOG DAILY STATS
          </button>
        </form>
      </div>

      {/* 4. PULL-UP ROADMAP WIDGET */}
      <div className="brutalist-card rounded-xl p-4 sm:p-5">
        <div className="border-b border-zinc-800 pb-3 mb-4">
          <h3 className="font-bebas text-2xl text-zinc-100 flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-500" />
            100KG HEAVY DUTY PULL-UP ROADMAP
          </h3>
          <p className="text-xs font-mono-code text-zinc-400">
            Step-by-step back strength trajectory from lat pulldowns to 100kg bodyweight & weighted pull-ups.
          </p>
        </div>

        <div className="space-y-3">
          {roadmap.map(step => (
            <div
              key={step.step}
              onClick={() => handleToggleRoadmap(step.step)}
              className={`p-3 rounded-lg border transition cursor-pointer flex items-start gap-3 ${
                step.status === 'completed'
                  ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300'
                  : step.status === 'current'
                  ? 'bg-zinc-900 border-red-600 shadow-[0_0_12px_rgba(220,38,38,0.3)]'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-500 opacity-60'
              }`}
            >
              <div className="mt-0.5">
                {step.status === 'completed' ? (
                  <CheckSquare className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Square className="w-5 h-5 text-zinc-600" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bebas text-lg tracking-wide text-zinc-100">
                    STEP {step.step}: {step.title}
                  </span>
                  <span className="text-[10px] font-mono-code font-bold px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-red-400">
                    {step.targetRequirement}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
