export type MuscleGroup =
  | 'Chest'
  | 'Lats/Back'
  | 'Legs'
  | 'Shoulders'
  | 'Biceps'
  | 'Triceps'
  | 'Abs';

export type IntensityPhase = 'Foundation' | 'Overload' | 'Peak';

export interface ExerciseDefinition {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  targetRepsMin: number;
  targetRepsMax: number;
  defaultWarmups: number;
  defaultWorkingSets: number;
  tempo: string;
  restSeconds: number;
  notes: string;
  alternatives: string[];
}

export interface WorkoutDayConfig {
  dayKey: string;
  title: string;
  subtitle: string;
  description: string;
  exercises: ExerciseDefinition[];
}

export interface WeekPhaseConfig {
  weekNumber: number;
  phase: IntensityPhase;
  phaseTitle: string;
  phaseRules: string[];
  progressionNotes: string;
}

export interface LoggedSet {
  id: string;
  type: 'warmup' | 'working';
  setIndex: number;
  weightKg: number;
  reps: number;
  rpe: number;
  reachedFailure: boolean;
  restPauseReps?: number;
  dropSetWeightKg?: number;
  dropSetReps?: number;
  timestamp: string;
}

export interface LoggedExercise {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
  sets: LoggedSet[];
  doubleProgressionMet: boolean;
  autoSuggestedNextWeightKg?: number;
  prAchieved?: boolean;
  prType?: 'WEIGHT' | 'REPS' | 'ESTIMATED_1RM' | 'DOUBLE_PROGRESSION';
}

export interface LoggedWorkout {
  id: string;
  date: string;
  weekNumber: number;
  dayKey: string;
  dayTitle: string;
  exercises: LoggedExercise[];
  durationMinutes: number;
  ratingRpe: number;
  notes: string;
  completed: boolean;
}

export interface BodyStatEntry {
  id: string;
  date: string;
  weightKg: number;
  waistCm: number;
  bfPercent: number;
  proteinIntakeG: number;
  creatineTaken: boolean;
  sleepHours: number;
  notes?: string;
}

export interface UserProfile {
  name: string;
  age: number;
  heightCm: number;
  weightKg: number;
  bfPercent: number;
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  sessionsPerWeek: number;
  dislikesLegsLovesUpper: boolean;
  goal: string;
  targetCalorieDeficit: number;
  targetProteinGrams: number;
  targetCreatineGrams: number;
  targetSleepHours: number;
}

export type WeightUnit = 'kg' | 'lbs';

export interface ProgramConfig {
  id: string;
  name: string;
  description: string;
  weeks: WeekPhaseConfig[];
  days: WorkoutDayConfig[];
  createdAt: string;
  isDefault?: boolean;
}
