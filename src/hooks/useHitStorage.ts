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
  USER_PROFILE: 'hit_user_profile_v2',
  WEEK_PHASES: 'hit_week_phases_v2',
  DAY_CONFIGS: 'hit_day_configs_v2',
  WORKOUT_LOGS: 'hit_workout_logs_v2',
  BODY_STATS: 'hit_body_stats_v2',
  UNIT_PREF: 'hit_unit_pref_v2',
  EDIT_LOCKED: 'hit_edit_locked_v2',
  SOUND_ENABLED: 'hit_sound_enabled_v2'
};

const DEFAULT_BODY_STATS: BodyStatEntry[] = [
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

export function useHitStorage() {
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return saved ? JSON.parse(saved) : DEFAULT_USER_PROFILE;
  });

  const [weeks, setWeeks] = useState<WeekPhaseConfig[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WEEK_PHASES);
    return saved ? JSON.parse(saved) : DEFAULT_WEEK_PHASES;
  });

  const [days, setDays] = useState<WorkoutDayConfig[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DAY_CONFIGS);
    return saved ? JSON.parse(saved) : DEFAULT_DAY_CONFIGS;
  });

  const [workoutLogs, setWorkoutLogs] = useState<LoggedWorkout[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WORKOUT_LOGS);
    return saved ? JSON.parse(saved) : [];
  });

  const [bodyStats, setBodyStats] = useState<BodyStatEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BODY_STATS);
    return saved ? JSON.parse(saved) : DEFAULT_BODY_STATS;
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

  // Save changes to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WEEK_PHASES, JSON.stringify(weeks));
  }, [weeks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DAY_CONFIGS, JSON.stringify(days));
  }, [days]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WORKOUT_LOGS, JSON.stringify(workoutLogs));
  }, [workoutLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BODY_STATS, JSON.stringify(bodyStats));
  }, [bodyStats]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.UNIT_PREF, unitPreference);
  }, [unitPreference]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EDIT_LOCKED, JSON.stringify(editModeLocked));
  }, [editModeLocked]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  // Actions
  const updateUserProfile = useCallback((profileUpdates: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...profileUpdates }));
  }, []);

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
        // Cycle phase logic: Foundation -> Overload -> Peak
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
    setWorkoutLogs(prev => {
      const existsIndex = prev.findIndex(l => l.weekNumber === newLog.weekNumber && l.dayKey === newLog.dayKey);
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = newLog;
        return updated;
      }
      return [newLog, ...prev];
    });
  }, []);

  const addBodyStatEntry = useCallback((entry: BodyStatEntry) => {
    setBodyStats(prev => [entry, ...prev.filter(s => s.date !== entry.date)]);
  }, []);

  const removeBodyStatEntry = useCallback((id: string) => {
    setBodyStats(prev => prev.filter(s => s.id !== id));
  }, []);

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
    if (confirm('Are you sure you want to reset all program configurations, stats, and logs back to default Temple Gym HIT settings?')) {
      setUserProfile(DEFAULT_USER_PROFILE);
      setWeeks(DEFAULT_WEEK_PHASES);
      setDays(DEFAULT_DAY_CONFIGS);
      setWorkoutLogs([]);
      setBodyStats(DEFAULT_BODY_STATS);
      setUnitPreferenceState('kg');
      setEditModeLockedState(true);
      setSoundEnabledState(true);
      localStorage.clear();
    }
  }, []);

  const exportDataJSON = useCallback(() => {
    const exportObj = {
      userProfile,
      weeks,
      days,
      workoutLogs,
      bodyStats,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Heavy_Duty_HIT_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [userProfile, weeks, days, workoutLogs, bodyStats]);

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
    a.download = `Heavy_Duty_Workout_History_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [workoutLogs]);

  const importDataJSON = useCallback((jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.userProfile) setUserProfile(data.userProfile);
      if (data.weeks) setWeeks(data.weeks);
      if (data.days) setDays(data.days);
      if (data.workoutLogs) setWorkoutLogs(data.workoutLogs);
      if (data.bodyStats) setBodyStats(data.bodyStats);
      alert('Data imported successfully!');
    } catch {
      alert('Invalid backup file. Please upload a valid Heavy Duty JSON file.');
    }
  }, []);

  return {
    userProfile,
    updateUserProfile,
    weeks,
    days,
    workoutLogs,
    bodyStats,
    unitPreference,
    setUnitPreference,
    editModeLocked,
    toggleEditModeLock,
    soundEnabled,
    toggleSound,
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
