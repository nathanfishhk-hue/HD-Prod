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
  defaultWarmups: number; // 1 or 2
  defaultWorkingSets: number; // usually 1 for HIT
  tempo: string; // e.g., "3/1/4"
  restSeconds: number; // e.g., 120 or 180
  isAnkleSafe: boolean;
  notes: string;
  alternatives: string[]; // exercise names for quick swap
}

export interface WorkoutDayConfig {
  dayKey: string; // 'A', 'B', 'C', 'D'
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
  rpe: number; // 6-10
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
  date: string; // YYYY-MM-DD
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
  date: string; // YYYY-MM-DD
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
  ankleMobilityLimited: boolean;
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
