import { useState, useEffect, useCallback } from 'react';
import {
  UserProfile,
  WorkoutDayConfig,
  WeekPhaseConfig,
  LoggedWorkout,
  BodyStatEntry,
  ExerciseDefinition,
  WeightUnit
} from '../types/hit';
import {
  DEFAULT_USER_PROFILE,
  DEFAULT_WEEK_PHASES,
  DEFAULT_DAY_CONFIGS
} from '../data/defaultProgram';

const STORAGE_KEYS = {
  PROFILES: 'hit_profiles_v3',
  ACTIVE_ID: 'hit_active_profile_id_v3',
  WEEK_PHASES: 'hit_week_phases_v2',
  DAY_CONFIGS: 'hit_day_configs_v2',
  UNIT_PREF: 'hit_unit_pref_v2',
  EDIT_LOCKED: 'hit_edit_locked_v2',
  SOUND_ENABLED: 'hit_sound_enabled_v2',
  // legacy single-profile keys for migration
  LEGACY_PROFILE: 'hit_user_profile_v2',
  LEGACY_LOGS: 'hit_workout_logs_v2',
  LEGACY_STATS: 'hit_body_stats_v2',
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
  {
    id: 'rob-stat-1',
    date: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
    weightKg: 93.0,
    waistCm: 92.0,
    bfPercent: 20.5,
    proteinIntakeG: 180,
    creatineTaken: true,
    sleepHours: 7.0,
    notes: 'Rob baseline - start of HIT block.'
  },
  {
    id: 'rob-stat-2',
    date: new Date().toISOString().split('T')[0],
    weightKg: 92.0,
    waistCm: 91.0,
    bfPercent: 20.0,
    proteinIntakeG: 185,
    creatineTaken: true,
    sleepHours: 7.0,
    notes: 'Current.'
  }
];

const DEFAULT_BODY_STATS_NATE: BodyStatEntry[] = [
  {
    id: 'stat-1',
    date: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
    weightKg: 101.5,
    waistCm: 96.0,
    bfPercent: 25.5,
    proteinIntakeG: 190,
    creatineTaken: true,
    sleepHours: 6.5,
    notes: 'Initial baseline intake. Ankle feels fine during leg press.'
  },
  {
    id: 'stat-2',
    date: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    weightKg: 100.8,
    waistCm: 95.2,
    bfPercent: 25.1,
    proteinIntakeG: 205,
    creatineTaken: true,
    sleepHours: 7.0,
    notes: 'Feeling solid pump. Incline press up +2.5kg.'
  },
  {
    id: 'stat-3',
    date: new Date().toISOString().split('T')[0],
    weightKg: 100.0,
    waistCm: 94.5,
    bfPercent: 25.0,
    proteinIntakeG: 210,
    creatineTaken: true,
    sleepHours: 7.0,
    notes: 'Current baseline. Deficit target active.'
  }
];

function loadProfiles(): { profiles: Record<string, ProfileData>; activeId: string } {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILES);
    const activeSaved = localStorage.getItem(STORAGE_KEYS.ACTIVE_ID);
    if (saved) {
      const parsed = JSON.parse(saved) as Record<string, ProfileData>;
      // ensure both exist
      if (!parsed['nate']) {
        parsed['nate'] = {
          id: 'nate',
          profile: { ...DEFAULT_USER_PROFILE, name: 'Nate' },
          workoutLogs: [],
          bodyStats: DEFAULT_BODY_STATS_NATE
        };
      }
      if (!parsed['rob']) {
        parsed['rob'] = {
          id: 'rob',
          profile: DEFAULT_ROB_PROFILE,
          workoutLogs: [],
          bodyStats: DEFAULT_BODY_STATS_ROB
        };
      }
      // migrate display names
      parsed['nate'].profile.name = 'Nate';
      parsed['rob'].profile.name = 'Rob';
      const active = activeSaved && parsed[activeSaved] ? activeSaved : 'nate';
      return { profiles: parsed, activeId: active };
    }
  } catch {}

  // migration from legacy single profile
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
  const nateLogs = legacyLogs;

  const profiles: Record<string, ProfileData> = {
    nate: { id: 'nate', profile: nateProfile, workoutLogs: nateLogs, bodyStats: nateStats },
    rob: { id: 'rob', profile: DEFAULT_ROB_PROFILE, workoutLogs: [], bodyStats: DEFAULT_BODY_STATS_ROB }
  };
  return { profiles, activeId: 'nate' };
}

export function useHitStorage() {
  const [{ profiles: initialProfiles, activeId: initialActive }] = useState(() => loadProfiles());

  const [profiles, setProfiles] = useState<Record<string, ProfileData>>(initialProfiles);
  const [activeProfileId, setActiveProfileId] = useState<string>(initialActive);

  const [weeks, setWeeks] = useState<WeekPhaseConfig[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WEEK_PHASES);
    return saved ? JSON.parse(saved) : DEFAULT_WEEK_PHASES;
  });

  const [days, setDays] = useState<WorkoutDayConfig[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DAY_CONFIGS);
    return saved ? JSON.parse(saved) : DEFAULT_DAY_CONFIGS;
  });

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

  // Persist profiles + active id
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, activeProfileId);
  }, [activeProfileId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WEEK_PHASES, JSON.stringify(weeks));
  }, [weeks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DAY_CONFIGS, JSON.stringify(days));
  }, [days]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.UNIT_PREF, unitPreference);
  }, [unitPreference]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EDIT_LOCKED, JSON.stringify(editModeLocked));
  }, [editModeLocked]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  // Profile actions
  const switchProfile = useCallback((id: string) => {
    if (profiles[id]) setActiveProfileId(id);
  }, [profiles]);

  const updateUserProfile = useCallback((profileUpdates: Partial<UserProfile>) => {
    setProfiles(prev => ({
      ...prev,
      [activeProfileId]: {
        ...prev[activeProfileId],
        profile: { ...prev[activeProfileId].profile, ...profileUpdates, name: prev[activeProfileId].profile.name }
      }
    }));
  }, [activeProfileId]);

  const renameActiveProfile = useCallback((newName: string) => {
    setProfiles(prev => ({
      ...prev,
      [activeProfileId]: {
        ...prev[activeProfileId],
        profile: { ...prev[activeProfileId].profile, name: newName }
      }
    }));
  }, [activeProfileId]);

  const setUnitPreference = useCallback((unit: WeightUnit) => {
    setUnitPreferenceState(unit);
  }, []);

  const toggleEditModeLock = useCallback(() => {
    setEditModeLockedState(prev => !prev);
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabledState(prev => !prev);
  }, []);

  const updateExercise = useCallback((dayKey: string, exerciseIndex: number, updatedExercise: ExerciseDefinition) => {
    setDays(prevDays =>
      prevDays.map(d => {
        if (d.dayKey === dayKey) {
          const newExercises = [...d.exercises];
          newExercises[exerciseIndex] = updatedExercise;
          return { ...d, exercises: newExercises };
        }
        return d;
      })
    );
  }, []);

  const swapExercise = useCallback((dayKey: string, exerciseIndex: number, newExercise: ExerciseDefinition) => {
    updateExercise(dayKey, exerciseIndex, newExercise);
  }, [updateExercise]);

  const addExerciseToDay = useCallback((dayKey: string, exercise: ExerciseDefinition) => {
    setDays(prevDays =>
      prevDays.map(d => {
        if (d.dayKey === dayKey) {
          return { ...d, exercises: [...d.exercises, exercise] };
        }
        return d;
      })
    );
  }, []);

  const removeExerciseFromDay = useCallback((dayKey: string, exerciseIndex: number) => {
    setDays(prevDays =>
      prevDays.map(d => {
        if (d.dayKey === dayKey) {
          const newExercises = d.exercises.filter((_, idx) => idx !== exerciseIndex);
          return { ...d, exercises: newExercises };
        }
        return d;
      })
    );
  }, []);

  const reorderExerciseInDay = useCallback((dayKey: string, fromIndex: number, toIndex: number) => {
    setDays(prevDays =>
      prevDays.map(d => {
        if (d.dayKey === dayKey) {
          const newExercises = [...d.exercises];
          const [moved] = newExercises.splice(fromIndex, 1);
          newExercises.splice(toIndex, 0, moved);
          return { ...d, exercises: newExercises };
        }
        return d;
      })
    );
  }, []);

  const addCustomDay = useCallback((newDay: WorkoutDayConfig) => {
    setDays(prev => [...prev, newDay]);
  }, []);

  const extendProgramWeeks = useCallback((newTotalWeeks: number) => {
    setWeeks(prevWeeks => {
      const currentCount = prevWeeks.length;
      if (newTotalWeeks <= currentCount) return prevWeeks;

      const added: WeekPhaseConfig[] = [];
      for (let w = currentCount + 1; w <= newTotalWeeks; w++) {
        let phase: WeekPhaseConfig['phase'] = 'Foundation';
        if (w % 6 === 3 || w % 6 === 4) phase = 'Overload';
        if (w % 6 === 5 || w % 6 === 0) phase = 'Peak';

        added.push({
          weekNumber: w,
          phase,
          phaseTitle: `WEEK ${w}: ${phase.toUpperCase()} INTENSITY`,
          phaseRules: [
            `Week ${w} ${phase} protocol active.`,
            'Maintain strict 3/1/4 tempo on all working sets.',
            'Track double progression.'
          ],
          progressionNotes: `Extended week ${w}. Maintain progressive overload.`
        });
      }
      return [...prevWeeks, ...added];
    });
  }, []);

  const duplicateWeek = useCallback((sourceWeek: number, targetWeek: number) => {
    setWeeks(prevWeeks => {
      const source = prevWeeks.find(w => w.weekNumber === sourceWeek);
      if (!source) return prevWeeks;
      return prevWeeks.map(w => {
        if (w.weekNumber === targetWeek) {
          return { ...source, weekNumber: targetWeek, phaseTitle: `WEEK ${targetWeek}: ${source.phase.toUpperCase()} INTENSITY` };
        }
        return w;
      });
    });
  }, []);

  const logWorkoutSession = useCallback((newLog: LoggedWorkout) => {
    setProfiles(prev => {
      const cur = prev[activeProfileId];
      const existsIndex = cur.workoutLogs.findIndex(l => l.weekNumber === newLog.weekNumber && l.dayKey === newLog.dayKey);
      let newLogs: LoggedWorkout[];
      if (existsIndex >= 0) {
        newLogs = [...cur.workoutLogs];
        newLogs[existsIndex] = newLog;
      } else {
        newLogs = [newLog, ...cur.workoutLogs];
      }
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
          historyList.push({
            date: log.date,
            weekNumber: log.weekNumber,
            weightKg: workingSet.weightKg,
            reps: workingSet.reps,
            rpe: workingSet.rpe,
            e1rm
          });
        }
      }
    });

    return historyList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [workoutLogs]);

  const resetToDefaults = useCallback(() => {
    if (confirm('Reset ALL profiles, program, logs? This wipes Nate & Rob.')) {
      const fresh: Record<string, ProfileData> = {
        nate: { id: 'nate', profile: { ...DEFAULT_USER_PROFILE, name: 'Nate' }, workoutLogs: [], bodyStats: DEFAULT_BODY_STATS_NATE },
        rob: { id: 'rob', profile: DEFAULT_ROB_PROFILE, workoutLogs: [], bodyStats: DEFAULT_BODY_STATS_ROB }
      };
      setProfiles(fresh);
      setActiveProfileId('nate');
      setWeeks(DEFAULT_WEEK_PHASES);
      setDays(DEFAULT_DAY_CONFIGS);
      setUnitPreferenceState('kg');
      setEditModeLockedState(true);
      setSoundEnabledState(true);
      localStorage.removeItem(STORAGE_KEYS.WEEK_PHASES);
      localStorage.removeItem(STORAGE_KEYS.DAY_CONFIGS);
    }
  }, []);

  const exportDataJSON = useCallback(() => {
    const exportObj = {
      profiles,
      activeProfileId,
      weeks,
      days,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Heavy_Duty_HIT_Backup_${activeData.profile.name}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [profiles, activeProfileId, weeks, days, activeData.profile.name]);

  const exportDataCSV = useCallback(() => {
    let csvContent = 'Date,Week,Day,Exercise,SetType,Weight_kg,Reps,RPE,FailureReached,RestPauseReps,DropSetWeight_kg,DropSetReps\n';

    workoutLogs.forEach(log => {
      log.exercises.forEach(ex => {
        ex.sets.forEach(s => {
          csvContent += `"${log.date}",${log.weekNumber},"${log.dayKey}","${ex.exerciseName}","${s.type}",${s.weightKg},${s.reps},${s.rpe},${s.reachedFailure ? 1 : 0},${s.restPauseReps || 0},${s.dropSetWeightKg || 0},${s.dropSetReps || 0}\n`;
        });
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Heavy_Duty_Workout_History_${activeData.profile.name}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [workoutLogs, activeData.profile.name]);

  const importDataJSON = useCallback((jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.profiles && data.activeProfileId) {
        setProfiles(data.profiles);
        setActiveProfileId(data.activeProfileId);
      } else if (data.userProfile) {
        // legacy single profile import -> merge into active
        setProfiles(prev => ({
          ...prev,
          [activeProfileId]: {
            ...prev[activeProfileId],
            profile: data.userProfile,
            workoutLogs: data.workoutLogs || prev[activeProfileId].workoutLogs,
            bodyStats: data.bodyStats || prev[activeProfileId].bodyStats
          }
        }));
      }
      if (data.weeks) setWeeks(data.weeks);
      if (data.days) setDays(data.days);
      alert('Data imported successfully!');
    } catch {
      alert('Invalid backup file.');
    }
  }, [activeProfileId]);

  return {
    // multi-profile
    profiles,
    activeProfileId,
    activeData,
    switchProfile,
    renameActiveProfile,
    // derived active
    userProfile,
    workoutLogs,
    bodyStats,
    // global
    weeks,
    days,
    unitPreference,
    setUnitPreference,
    editModeLocked,
    toggleEditModeLock,
    soundEnabled,
    toggleSound,
    updateUserProfile,
    updateExercise,
    swapExercise,
    addExerciseToDay,
    removeExerciseFromDay,
    reorderExerciseInDay,
    addCustomDay,
    extendProgramWeeks,
    duplicateWeek,
    logWorkoutSession,
    addBodyStatEntry,
    removeBodyStatEntry,
    getExerciseHistory,
    resetToDefaults,
    exportDataJSON,
    exportDataCSV,
    importDataJSON
  };
}
