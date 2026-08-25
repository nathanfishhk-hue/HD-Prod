import { useState, useEffect, useCallback } from 'react';
import {
  UserProfile,
  WorkoutDayConfig,
  WeekPhaseConfig,
  LoggedWorkout,
  BodyStatEntry,
  ExerciseDefinition,
  WeightUnit,
  ProgramConfig
} from '../types/hit';
import {
  DEFAULT_USER_PROFILE,
  DEFAULT_WEEK_PHASES,
  DEFAULT_DAY_CONFIGS
} from '../data/defaultProgram';
import { EXERCISE_LIBRARY as DEFAULT_EXERCISE_LIBRARY } from '../data/exerciseLibrary';

const STORAGE_KEYS = {
  PROFILES: 'hit_profiles_v3',
  ACTIVE_ID: 'hit_active_profile_id_v3',
  PROGRAMS: 'hit_programs_v4',
  ACTIVE_PROGRAM_ID: 'hit_active_program_id_v4',
  EXERCISE_LIBRARY: 'hit_exercise_library_v4',
  UNIT_PREF: 'hit_unit_pref_v2',
  EDIT_LOCKED: 'hit_edit_locked_v2',
  SOUND_ENABLED: 'hit_sound_enabled_v2',
  LEGACY_PROFILE: 'hit_user_profile_v2',
  LEGACY_LOGS: 'hit_workout_logs_v2',
  LEGACY_STATS: 'hit_body_stats_v2',
  LEGACY_WEEK_PHASES: 'hit_week_phases_v2',
  LEGACY_DAY_CONFIGS: 'hit_day_configs_v2',
};

export interface ProfileData {
  id: string;
  profile: UserProfile;
  workoutLogs: LoggedWorkout[];
  bodyStats: BodyStatEntry[];
}

const DEFAULT_ROB_PROFILE: UserProfile = {
  name: "Rob",
  age: 32,
  heightCm: 183,
  weightKg: 92.0,
  bfPercent: 20.0,
  experienceLevel: "Intermediate",
  sessionsPerWeek: 3,
  ankleMobilityLimited: false,
  dislikesLegsLovesUpper: false,
  goal: "6-Month Heavy Duty Recomp",
  targetCalorieDeficit: 2000,
  targetProteinGrams: 185,
  targetCreatineGrams: 5,
  targetSleepHours: 7
};

const DEFAULT_BODY_STATS_ROB: BodyStatEntry[] = [
  { id: 'rob-stat-1', date: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0], weightKg: 93.0, waistCm: 92.0, bfPercent: 20.5, proteinIntakeG: 180, creatineTaken: true, sleepHours: 7.0, notes: 'Rob baseline.' },
  { id: 'rob-stat-2', date: new Date().toISOString().split('T')[0], weightKg: 92.0, waistCm: 91.0, bfPercent: 20.0, proteinIntakeG: 185, creatineTaken: true, sleepHours: 7.0, notes: 'Current.' }
];
const DEFAULT_ZITA_PROFILE: UserProfile = {
  name: "Zita",
  age: 30,
  heightCm: 168,
  weightKg: 68.0,
  bfPercent: 24.0,
  experienceLevel: "Intermediate",
  sessionsPerWeek: 3,
  ankleMobilityLimited: false,
  dislikesLegsLovesUpper: false,
  goal: "6-Month Heavy Duty Recomp",
  targetCalorieDeficit: 300,
  targetProteinGrams: 140,
  targetCreatineGrams: 5,
  targetSleepHours: 7
};
const DEFAULT_BODY_STATS_ZITA: BodyStatEntry[] = [
  { id: 'zita-stat-1', date: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0], weightKg: 69.0, waistCm: 76.0, bfPercent: 24.5, proteinIntakeG: 135, creatineTaken: true, sleepHours: 7.0, notes: 'Zita baseline.' },
  { id: 'zita-stat-2', date: new Date().toISOString().split('T')[0], weightKg: 68.0, waistCm: 75.0, bfPercent: 24.0, proteinIntakeG: 140, creatineTaken: true, sleepHours: 7.0, notes: 'Current.' }
];
const DEFAULT_BODY_STATS_NATE: BodyStatEntry[] = [
  { id: 'stat-1', date: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0], weightKg: 101.5, waistCm: 96.0, bfPercent: 25.5, proteinIntakeG: 190, creatineTaken: true, sleepHours: 6.5, notes: 'Initial baseline.' },
  { id: 'stat-2', date: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0], weightKg: 100.8, waistCm: 95.2, bfPercent: 25.1, proteinIntakeG: 205, creatineTaken: true, sleepHours: 7.0, notes: 'Incline press up +2.5kg.' },
  { id: 'stat-3', date: new Date().toISOString().split('T')[0], weightKg: 100.0, waistCm: 94.5, bfPercent: 25.0, proteinIntakeG: 210, creatineTaken: true, sleepHours: 7.0, notes: 'Current baseline.' }
];

function loadProfiles(): { profiles: Record<string, ProfileData>; activeId: string } {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILES);
    const activeSaved = localStorage.getItem(STORAGE_KEYS.ACTIVE_ID);
    if (saved) {
      const parsed = JSON.parse(saved) as Record<string, ProfileData>;
      if (!parsed['nate']) parsed['nate'] = { id: 'nate', profile: { ...DEFAULT_USER_PROFILE, name: 'Nate' }, workoutLogs: [], bodyStats: DEFAULT_BODY_STATS_NATE };
      if (!parsed['rob']) parsed['rob'] = { id: 'rob', profile: DEFAULT_ROB_PROFILE, workoutLogs: [], bodyStats: DEFAULT_BODY_STATS_ROB };
      if (!parsed['zita']) parsed['zita'] = { id: 'zita', profile: DEFAULT_ZITA_PROFILE, workoutLogs: [], bodyStats: DEFAULT_BODY_STATS_ZITA };
      parsed['nate'].profile.name = 'Nate';
      parsed['rob'].profile.name = 'Rob';
      parsed['zita'].profile.name = 'Zita';
      const active = activeSaved && parsed[activeSaved] ? activeSaved : 'nate';
      return { profiles: parsed, activeId: active };
    }
  } catch {}
  let legacyProfile: UserProfile | null = null;
  let legacyLogs: LoggedWorkout[] = [];
  let legacyStats: BodyStatEntry[] = [];
  try {
    const p = localStorage.getItem(STORAGE_KEYS.LEGACY_PROFILE);
    if (p) legacyProfile = JSON.parse(p);
    const l = localStorage.getItem(STORAGE_KEYS.LEGACY_LOGS);
    if (l) legacyLogs = JSON.parse(l);
    const s = localStorage.getItem(STORAGE_KEYS.LEGACY_STATS);
    if (s) legacyStats = JSON.parse(s);
  } catch {}
  const nateProfile = legacyProfile ? { ...legacyProfile, name: 'Nate' } : { ...DEFAULT_USER_PROFILE, name: 'Nate' };
  const nateStats = legacyStats.length ? legacyStats : DEFAULT_BODY_STATS_NATE;
  return { profiles: { nate: { id: 'nate', profile: nateProfile, workoutLogs: legacyLogs, bodyStats: nateStats }, rob: { id: 'rob', profile: DEFAULT_ROB_PROFILE, workoutLogs: [], bodyStats: DEFAULT_BODY_STATS_ROB }, zita: { id: 'zita', profile: DEFAULT_ZITA_PROFILE, workoutLogs: [], bodyStats: DEFAULT_BODY_STATS_ZITA } }, activeId: 'nate' };
}

function loadExerciseLibrary(): ExerciseDefinition[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.EXERCISE_LIBRARY);
    if (saved) {
      const parsed = JSON.parse(saved) as ExerciseDefinition[];
      if (Array.isArray(parsed) && parsed.length) {
        const existingIds = new Set(parsed.map(e => e.id));
        const missing = DEFAULT_EXERCISE_LIBRARY.filter(e => !existingIds.has(e.id));
        let merged = missing.length ? [...parsed, ...missing] : parsed;
        // force-replace Nautilus-era names with small-gym common equivalents (same IDs, new names)
        const NAUTILUS_REPLACE = new Set(['ex-nautilus-fly','ex-nautilus-press','ex-nautilus-pullover-machine','ex-nautilus-tricep-ext','ex-nautilus-leg-press','ex-nautilus-bicep-curl']);
        let replaced = false;
        merged = merged.map(e => {
          if (NAUTILUS_REPLACE.has(e.id)) {
            const def = DEFAULT_EXERCISE_LIBRARY.find(d => d.id === e.id);
            if (def && e.name !== def.name) { replaced = true; return { ...def }; }
          }
          // also patch stale alternative strings that still reference Nautilus
          if (e.alternatives?.some(a => a.includes('Nautilus'))) {
            const def = DEFAULT_EXERCISE_LIBRARY.find(d => d.id === e.id);
            if (def) { replaced = true; return { ...def }; }
          }
          return e;
        });
        if (missing.length || replaced) {
          try { localStorage.setItem(STORAGE_KEYS.EXERCISE_LIBRARY, JSON.stringify(merged)); } catch {}
        }
        return merged;
      }
    }
  } catch {}
  return DEFAULT_EXERCISE_LIBRARY;
}

function loadPrograms(): { programs: Record<string, ProgramConfig>; activeProgramId: string } {
  const defaultProgram: ProgramConfig = {
    id: 'hd-recomp-6wk',
    name: 'HD RECOMP 6-WK',
    description: 'Original Heavy Duty Recomp - Chest/Back, Legs-AnkleSafe, Shoulders/Arms - 6 week wave. Do not edit if you want to preserve.',
    weeks: DEFAULT_WEEK_PHASES,
    days: DEFAULT_DAY_CONFIGS,
    createdAt: new Date().toISOString(),
    isDefault: true
  };
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PROGRAMS);
    const activeSaved = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROGRAM_ID);
    if (saved) {
      const parsed = JSON.parse(saved) as Record<string, ProgramConfig>;
      if (!parsed['hd-recomp-6wk']) parsed['hd-recomp-6wk'] = defaultProgram;
      // migrate legacy weeks/days if program was default and legacy storage exists
      const legacyWeeks = localStorage.getItem(STORAGE_KEYS.LEGACY_WEEK_PHASES);
      const legacyDays = localStorage.getItem(STORAGE_KEYS.LEGACY_DAY_CONFIGS);
      // if user edited weeks/days before programs existed, keep those as active program's content once
      if (legacyWeeks && legacyDays && parsed['hd-recomp-6wk'] && !localStorage.getItem('hit_programs_migrated_v4')) {
        try {
          const w = JSON.parse(legacyWeeks);
          const d = JSON.parse(legacyDays);
          if (Array.isArray(w) && Array.isArray(d)) {
            parsed['hd-recomp-6wk'].weeks = w;
            parsed['hd-recomp-6wk'].days = d;
            localStorage.setItem('hit_programs_migrated_v4', 'true');
          }
        } catch {}
      }
      const active = activeSaved && parsed[activeSaved] ? activeSaved : 'hd-recomp-6wk';
      return { programs: parsed, activeProgramId: active };
    }
  } catch {}
  // no saved programs - try migrate legacy weeks/days into default
  let weeks = DEFAULT_WEEK_PHASES;
  let days = DEFAULT_DAY_CONFIGS;
  try {
    const w = localStorage.getItem(STORAGE_KEYS.LEGACY_WEEK_PHASES);
    const d = localStorage.getItem(STORAGE_KEYS.LEGACY_DAY_CONFIGS);
    if (w) { const pw = JSON.parse(w); if (Array.isArray(pw)) weeks = pw; }
    if (d) { const pd = JSON.parse(d); if (Array.isArray(pd)) days = pd; }
  } catch {}
  const migratedDefault = { ...defaultProgram, weeks, days };
  return { programs: { 'hd-recomp-6wk': migratedDefault }, activeProgramId: 'hd-recomp-6wk' };
}

export function useHitStorage() {
  const [{ profiles: initialProfiles, activeId: initialActive }] = useState(() => loadProfiles());
  const [profiles, setProfiles] = useState<Record<string, ProfileData>>(initialProfiles);
  const [activeProfileId, setActiveProfileId] = useState<string>(initialActive);

  const [{ programs: initialPrograms, activeProgramId: initialProgId }] = useState(() => loadPrograms());
  const [programs, setPrograms] = useState<Record<string, ProgramConfig>>(initialPrograms);
  const [activeProgramId, setActiveProgramId] = useState<string>(initialProgId);

  const [exerciseLibrary, setExerciseLibrary] = useState<ExerciseDefinition[]>(() => loadExerciseLibrary());

  const [unitPreference, setUnitPreferenceState] = useState<WeightUnit>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.UNIT_PREF);
    return saved === 'lbs' ? 'lbs' : 'kg';
  });
  const [editModeLocked, setEditModeLockedState] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EDIT_LOCKED);
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
    return saved !== null ? JSON.parse(saved) : true;
  });

  const activeData = profiles[activeProfileId] || profiles['nate'];
  const userProfile = activeData.profile;
  const workoutLogs = activeData.workoutLogs;
  const bodyStats = activeData.bodyStats;

  const activeProgram = programs[activeProgramId] || programs['hd-recomp-6wk'];
  const weeks = activeProgram.weeks;
  const days = activeProgram.days;

  // Persist
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles)); }, [profiles]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, activeProfileId); }, [activeProfileId]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programs)); }, [programs]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ACTIVE_PROGRAM_ID, activeProgramId); }, [activeProgramId]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.EXERCISE_LIBRARY, JSON.stringify(exerciseLibrary)); }, [exerciseLibrary]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.UNIT_PREF, unitPreference); }, [unitPreference]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.EDIT_LOCKED, JSON.stringify(editModeLocked)); }, [editModeLocked]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, JSON.stringify(soundEnabled)); }, [soundEnabled]);

  // helpers to update active program's days/weeks immutably
  const updateActiveProgram = useCallback((updater: (p: ProgramConfig) => ProgramConfig) => {
    setPrograms(prev => {
      const cur = prev[activeProgramId];
      if (!cur) return prev;
      return { ...prev, [activeProgramId]: updater(cur) };
    });
  }, [activeProgramId]);

  // Profile actions
  const switchProfile = useCallback((id: string) => { if (profiles[id]) setActiveProfileId(id); }, [profiles]);
  const updateUserProfile = useCallback((upd: Partial<UserProfile>) => {
    setProfiles(prev => ({ ...prev, [activeProfileId]: { ...prev[activeProfileId], profile: { ...prev[activeProfileId].profile, ...upd, name: prev[activeProfileId].profile.name } } }));
  }, [activeProfileId]);

  const setUnitPreference = useCallback((unit: WeightUnit) => setUnitPreferenceState(unit), []);
  const toggleEditModeLock = useCallback(() => setEditModeLockedState(prev => !prev), []);
  const toggleSound = useCallback(() => setSoundEnabledState(prev => !prev), []);

  // Program actions
  const switchProgram = useCallback((id: string) => { if (programs[id]) setActiveProgramId(id); }, [programs]);
  const createProgram = useCallback((name: string, description: string, copyFromId?: string) => {
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36).slice(0,4);
    let newProg: ProgramConfig;
    if (copyFromId && programs[copyFromId]) {
      const src = programs[copyFromId];
      newProg = { id, name: name.toUpperCase(), description, weeks: JSON.parse(JSON.stringify(src.weeks)), days: JSON.parse(JSON.stringify(src.days)), createdAt: new Date().toISOString() };
    } else {
      newProg = { id, name: name.toUpperCase(), description, weeks: JSON.parse(JSON.stringify(DEFAULT_WEEK_PHASES.slice(0,6))), days: JSON.parse(JSON.stringify(DEFAULT_DAY_CONFIGS)), createdAt: new Date().toISOString() };
    }
    setPrograms(prev => ({ ...prev, [id]: newProg }));
    setActiveProgramId(id);
    return id;
  }, [programs]);

  const duplicateProgram = useCallback((sourceId: string) => {
    const src = programs[sourceId];
    if (!src) return;
    const id = src.id + '-copy-' + Date.now().toString(36).slice(0,4);
    const copy: ProgramConfig = { ...JSON.parse(JSON.stringify(src)), id, name: src.name + ' COPY', createdAt: new Date().toISOString(), isDefault: false };
    setPrograms(prev => ({ ...prev, [id]: copy }));
    setActiveProgramId(id);
  }, [programs]);

  const deleteProgram = useCallback((id: string) => {
    if (programs[id]?.isDefault) { alert('Cannot delete default HD RECOMP program.'); return; }
    if (!confirm(`Delete program "${programs[id]?.name}"? This cannot be undone.`)) return;
    const remaining = Object.keys(programs).filter(k => k !== id);
    if (!remaining.length) { alert('Cannot delete last program.'); return; }
    setPrograms(prev => { const n = { ...prev }; delete n[id]; return n; });
    if (activeProgramId === id) setActiveProgramId(remaining[0]);
  }, [programs, activeProgramId]);

  const renameProgram = useCallback((id: string, newName: string, newDesc?: string) => {
    setPrograms(prev => ({ ...prev, [id]: { ...prev[id], name: newName.toUpperCase(), description: newDesc ?? prev[id].description } }));
  }, []);

  // Exercise library CRUD
  const addExerciseToLibrary = useCallback((ex: ExerciseDefinition) => {
    setExerciseLibrary(prev => [...prev, ex]);
  }, []);
  const updateExerciseInLibrary = useCallback((id: string, updates: Partial<ExerciseDefinition>) => {
    setExerciseLibrary(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    // also update any program days that reference this exercise
    setPrograms(prevProgs => {
      const next = { ...prevProgs };
      Object.keys(next).forEach(pid => {
        next[pid] = { ...next[pid], days: next[pid].days.map(d => ({ ...d, exercises: d.exercises.map(ex => ex.id === id ? { ...ex, ...updates } : ex) })) };
      });
      return next;
    });
  }, []);
  const deleteExerciseFromLibrary = useCallback((id: string) => {
    if (!confirm('Delete exercise from library? Existing program references will remain but library entry removed.')) return;
    setExerciseLibrary(prev => prev.filter(e => e.id !== id));
  }, []);
  const resetExerciseLibrary = useCallback(() => {
    if (!confirm('Reset exercise library to defaults? Custom exercises will be lost.')) return;
    setExerciseLibrary(DEFAULT_EXERCISE_LIBRARY);
  }, []);

  // Day/Exercise ops on active program
  const updateExercise = useCallback((dayKey: string, exerciseIndex: number, updatedExercise: ExerciseDefinition) => {
    updateActiveProgram(p => ({ ...p, days: p.days.map(d => d.dayKey === dayKey ? { ...d, exercises: d.exercises.map((e,i) => i===exerciseIndex ? updatedExercise : e) } : d) }));
  }, [updateActiveProgram]);
  const swapExercise = useCallback((dayKey: string, exerciseIndex: number, newExercise: ExerciseDefinition) => {
    updateExercise(dayKey, exerciseIndex, newExercise);
  }, [updateExercise]);
  const addExerciseToDay = useCallback((dayKey: string, exercise: ExerciseDefinition) => {
    updateActiveProgram(p => ({ ...p, days: p.days.map(d => d.dayKey === dayKey ? { ...d, exercises: [...d.exercises, exercise] } : d) }));
  }, [updateActiveProgram]);
  const removeExerciseFromDay = useCallback((dayKey: string, exerciseIndex: number) => {
    updateActiveProgram(p => ({ ...p, days: p.days.map(d => d.dayKey === dayKey ? { ...d, exercises: d.exercises.filter((_, i) => i !== exerciseIndex) } : d) }));
  }, [updateActiveProgram]);
  const reorderExerciseInDay = useCallback((dayKey: string, fromIndex: number, toIndex: number) => {
    updateActiveProgram(p => ({ ...p, days: p.days.map(d => {
      if (d.dayKey !== dayKey) return d;
      const ne = [...d.exercises]; const [m] = ne.splice(fromIndex,1); ne.splice(toIndex,0,m); return { ...d, exercises: ne };
    })}));
  }, [updateActiveProgram]);
  const addCustomDay = useCallback((newDay: WorkoutDayConfig) => {
    updateActiveProgram(p => ({ ...p, days: [...p.days, newDay] }));
  }, [updateActiveProgram]);
  const deleteDay = useCallback((dayKey: string) => {
    if (activeProgram.days.length <= 1) { alert('Cannot delete last day.'); return; }
    if (!confirm(`Delete ${dayKey}?`)) return;
    updateActiveProgram(p => ({ ...p, days: p.days.filter(d => d.dayKey !== dayKey) }));
  }, [activeProgram.days.length, updateActiveProgram]);

  const extendProgramWeeks = useCallback((newTotalWeeks: number) => {
    updateActiveProgram(p => {
      const cur = p.weeks.length;
      if (newTotalWeeks <= cur) return p;
      const added: WeekPhaseConfig[] = [];
      for (let w = cur+1; w <= newTotalWeeks; w++) {
        let phase: WeekPhaseConfig['phase'] = 'Foundation';
        if (w % 6 === 3 || w % 6 === 4) phase = 'Overload';
        if (w % 6 === 5 || w % 6 === 0) phase = 'Peak';
        added.push({ weekNumber: w, phase, phaseTitle: `WEEK ${w}: ${phase.toUpperCase()} INTENSITY`, phaseRules: [`Week ${w} ${phase} protocol active.`, 'Maintain strict 3/1/4 tempo.', 'Track double progression.'], progressionNotes: `Extended week ${w}. Maintain progressive overload.` });
      }
      return { ...p, weeks: [...p.weeks, ...added] };
    });
  }, [updateActiveProgram]);

  const duplicateWeek = useCallback((sourceWeek: number, targetWeek: number) => {
    updateActiveProgram(p => {
      const source = p.weeks.find(w => w.weekNumber === sourceWeek);
      if (!source) return p;
      return { ...p, weeks: p.weeks.map(w => w.weekNumber === targetWeek ? { ...source, weekNumber: targetWeek, phaseTitle: `WEEK ${targetWeek}: ${source.phase.toUpperCase()} INTENSITY` } : w) };
    });
  }, [updateActiveProgram]);

  const logWorkoutSession = useCallback((newLog: LoggedWorkout) => {
    // attach program id to log for future filtering? keep as is but store per profile regardless of program
    setProfiles(prev => {
      const cur = prev[activeProfileId];
      const existsIndex = cur.workoutLogs.findIndex(l => l.weekNumber === newLog.weekNumber && l.dayKey === newLog.dayKey);
      let newLogs: LoggedWorkout[];
      if (existsIndex >= 0) { newLogs = [...cur.workoutLogs]; newLogs[existsIndex] = newLog; } else { newLogs = [newLog, ...cur.workoutLogs]; }
      return { ...prev, [activeProfileId]: { ...cur, workoutLogs: newLogs } };
    });
  }, [activeProfileId]);

  const addBodyStatEntry = useCallback((entry: BodyStatEntry) => {
    setProfiles(prev => {
      const cur = prev[activeProfileId];
      return { ...prev, [activeProfileId]: { ...cur, bodyStats: [entry, ...cur.bodyStats.filter(s => s.date !== entry.date)] } };
    });
  }, [activeProfileId]);
  const removeBodyStatEntry = useCallback((id: string) => {
    setProfiles(prev => {
      const cur = prev[activeProfileId];
      return { ...prev, [activeProfileId]: { ...cur, bodyStats: cur.bodyStats.filter(s => s.id !== id) } };
    });
  }, [activeProfileId]);

  const getExerciseHistory = useCallback((exerciseName: string) => {
    const historyList: { date: string; weekNumber: number; weightKg: number; reps: number; rpe: number; e1rm: number }[] = [];
    workoutLogs.forEach(log => {
      const matchedEx = log.exercises.find(e => e.exerciseName.toLowerCase() === exerciseName.toLowerCase());
      if (matchedEx) {
        const workingSet = matchedEx.sets.find(s => s.type === 'working');
        if (workingSet) {
          const e1rm = Math.round((workingSet.weightKg * (1 + workingSet.reps / 30)) * 10) / 10;
          historyList.push({ date: log.date, weekNumber: log.weekNumber, weightKg: workingSet.weightKg, reps: workingSet.reps, rpe: workingSet.rpe, e1rm });
        }
      }
    });
    return historyList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [workoutLogs]);

  const resetToDefaults = useCallback(() => {
    if (confirm('Reset ALL profiles, programs, library? This wipes everything.')) {
      const freshProfiles: Record<string, ProfileData> = {
        nate: { id: 'nate', profile: { ...DEFAULT_USER_PROFILE, name: 'Nate' }, workoutLogs: [], bodyStats: [{ id: 'stat-1', date: new Date().toISOString().split('T')[0], weightKg: 100, waistCm: 94.5, bfPercent: 25, proteinIntakeG: 210, creatineTaken: true, sleepHours: 7, notes: 'Reset.' }] },
        rob: { id: 'rob', profile: DEFAULT_ROB_PROFILE, workoutLogs: [], bodyStats: [{ id: 'rob-stat-1', date: new Date().toISOString().split('T')[0], weightKg: 92, waistCm: 91, bfPercent: 20, proteinIntakeG: 185, creatineTaken: true, sleepHours: 7, notes: 'Reset.' }] },
        zita: { id: 'zita', profile: DEFAULT_ZITA_PROFILE, workoutLogs: [], bodyStats: [{ id: 'zita-stat-1', date: new Date().toISOString().split('T')[0], weightKg: 68, waistCm: 75, bfPercent: 24, proteinIntakeG: 140, creatineTaken: true, sleepHours: 7, notes: 'Reset.' }] }
      };
      const defProg: ProgramConfig = { id: 'hd-recomp-6wk', name: 'HD RECOMP 6-WK', description: 'Original Heavy Duty Recomp.', weeks: DEFAULT_WEEK_PHASES, days: DEFAULT_DAY_CONFIGS, createdAt: new Date().toISOString(), isDefault: true };
      setProfiles(freshProfiles); setActiveProfileId('nate');
      setPrograms({ 'hd-recomp-6wk': defProg }); setActiveProgramId('hd-recomp-6wk');
      setExerciseLibrary(DEFAULT_EXERCISE_LIBRARY);
      setUnitPreferenceState('kg'); setEditModeLockedState(true); setSoundEnabledState(true);
      localStorage.clear();
    }
  }, []);

  const exportDataJSON = useCallback(() => {
    const exportObj = { profiles, activeProfileId, programs, activeProgramId, exerciseLibrary, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `HD_Backup_${activeData.profile.name}_${activeProgram.name.replace(/\s+/g,'_')}_${new Date().toISOString().split('T')[0]}.json`; a.click(); URL.revokeObjectURL(url);
  }, [profiles, activeProfileId, programs, activeProgramId, exerciseLibrary, activeData.profile.name, activeProgram.name]);

  const exportDataCSV = useCallback(() => {
    let csvContent = 'Date,Week,Day,Exercise,SetType,Weight_kg,Reps,RPE,FailureReached,RestPauseReps,DropSetWeight_kg,DropSetReps\n';
    workoutLogs.forEach(log => { log.exercises.forEach(ex => { ex.sets.forEach(s => { csvContent += `"${log.date}",${log.weekNumber},"${log.dayKey}","${ex.exerciseName}","${s.type}",${s.weightKg},${s.reps},${s.rpe},${s.reachedFailure?1:0},${s.restPauseReps||0},${s.dropSetWeightKg||0},${s.dropSetReps||0}\n`; }); }); });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `HD_History_${activeData.profile.name}_${new Date().toISOString().split('T')[0]}.csv`; a.click(); URL.revokeObjectURL(url);
  }, [workoutLogs, activeData.profile.name]);

  const importDataJSON = useCallback((jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.profiles) setProfiles(data.profiles);
      if (data.activeProfileId) setActiveProfileId(data.activeProfileId);
      if (data.programs) setPrograms(data.programs);
      if (data.activeProgramId) setActiveProgramId(data.activeProgramId);
      if (data.exerciseLibrary) setExerciseLibrary(data.exerciseLibrary);
      if (data.weeks && !data.programs) { // legacy program import
        setPrograms(prev => ({ ...prev, [activeProgramId]: { ...prev[activeProgramId], weeks: data.weeks, days: data.days || prev[activeProgramId].days } }));
      }
      if (data.userProfile && !data.profiles) {
        setProfiles(prev => ({ ...prev, [activeProfileId]: { ...prev[activeProfileId], profile: data.userProfile, workoutLogs: data.workoutLogs || prev[activeProfileId].workoutLogs, bodyStats: data.bodyStats || prev[activeProfileId].bodyStats } }));
      }
      alert('Data imported successfully!');
    } catch { alert('Invalid backup file.'); }
  }, [activeProfileId, activeProgramId]);

  return {
    profiles, activeProfileId, activeData, switchProfile, updateUserProfile,
    programs, activeProgramId, activeProgram, switchProgram, createProgram, duplicateProgram, deleteProgram, renameProgram,
    exerciseLibrary, addExerciseToLibrary, updateExerciseInLibrary, deleteExerciseFromLibrary, resetExerciseLibrary,
    userProfile, workoutLogs, bodyStats, weeks, days,
    unitPreference, setUnitPreference, editModeLocked, toggleEditModeLock, soundEnabled, toggleSound,
    updateExercise, swapExercise, addExerciseToDay, removeExerciseFromDay, reorderExerciseInDay, addCustomDay, deleteDay, extendProgramWeeks, duplicateWeek,
    logWorkoutSession, addBodyStatEntry, removeBodyStatEntry, getExerciseHistory,
    resetToDefaults, exportDataJSON, exportDataCSV, importDataJSON
  };
}
