import { WorkoutDayConfig, WeekPhaseConfig, UserProfile } from '../types/hit';
import { EXERCISE_LIBRARY } from './exerciseLibrary';

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: "Heavy Duty Lifter",
  age: 35,
  heightCm: 185,
  weightKg: 100.0,
  bfPercent: 25.0,
  experienceLevel: "Intermediate",
  sessionsPerWeek: 3,
  dislikesLegsLovesUpper: true,
  goal: "6-Month Heavy Duty Recomp",
  targetCalorieDeficit: 2100, // kcal (~500 deficit)
  targetProteinGrams: 200, // g/day
  targetCreatineGrams: 5, // g/day
  targetSleepHours: 7
};

export const DEFAULT_WEEK_PHASES: WeekPhaseConfig[] = [
  {
    weekNumber: 1,
    phase: 'Foundation',
    phaseTitle: 'WEEK 1: FOUNDATION INTENSITY',
    phaseRules: [
      'Working sets taken to 100% positive muscular failure.',
      'Beyond-failure ONLY on last exercise of the day via Rest-Pause (10-15s rest + 1-2 extra reps).',
      'Maintain strict 3/1/4 tempo.'
    ],
    progressionNotes: 'Establish baseline working weights. Do not overtax central nervous system prematurely.'
  },
  {
    weekNumber: 2,
    phase: 'Foundation',
    phaseTitle: 'WEEK 2: FOUNDATION INTENSITY',
    phaseRules: [
      'Working sets taken to 100% positive muscular failure.',
      'Beyond-failure ONLY on last exercise of the day via Rest-Pause (10-15s rest + 1-2 extra reps).',
      'Double progression check: Add +2.5kg if top rep reached.'
    ],
    progressionNotes: 'Beat Week 1 reps or load on every single exercise.'
  },
  {
    weekNumber: 3,
    phase: 'Overload',
    phaseTitle: 'WEEK 3: BEYOND FAILURE OVERLOAD',
    phaseRules: [
      'ALL working sets taken to failure + Rest-Pause (10-15s rest, +1-2 reps).',
      'Machines & cables: Add Drop Set (-20% load immediately after Rest-Pause).',
      'Strict 4-second eccentric negatives.'
    ],
    progressionNotes: 'Overload phase initiated. Maximal motor unit recruitment.'
  },
  {
    weekNumber: 4,
    phase: 'Overload',
    phaseTitle: 'WEEK 4: BEYOND FAILURE OVERLOAD',
    phaseRules: [
      'ALL working sets taken to failure + Rest-Pause.',
      'Machine exercises add -20% Drop Set.',
      'Ensure 6-7 hrs quality sleep & 200g protein daily for optimal neural recovery.'
    ],
    progressionNotes: 'Double progression targets active. Push through psychological friction.'
  },
  {
    weekNumber: 5,
    phase: 'Peak',
    phaseTitle: 'WEEK 5: PEAK INTENSITY WAVE',
    phaseRules: [
      'MAXIMAL INTENSITY: Working set failure + Rest-Pause + 20% Drop Set on ALL working sets.',
      'Push every fiber to complete absolute structural failure.',
      'Maximum recovery protocol outside Temple Gym.'
    ],
    progressionNotes: 'Peak 2-week cycle. Highest volume of mechanical tension.'
  },
  {
    weekNumber: 6,
    phase: 'Peak',
    phaseTitle: 'WEEK 6: PEAK INTENSITY & RECOMP TEST',
    phaseRules: [
      'MAXIMAL INTENSITY: All sets failure + Rest-Pause + Drop Set.',
      'Final test of 6-week wave. Attempt all-time 6-week PRs.',
      'Prepare for body re-assessment and program extension.'
    ],
    progressionNotes: 'Record final body stats (weight, waist, BF%). Celebrate PRs!'
  }
];

export const DEFAULT_DAY_CONFIGS: WorkoutDayConfig[] = [
  {
    dayKey: 'A',
    title: 'DAY A: CHEST & BACK',
    subtitle: 'Torso Destruction & Lat Width',
    description: 'Pre-exhaust chest with flies before compound incline press. High intensity pullover & chest-supported row.',
    exercises: [
      EXERCISE_LIBRARY.find(e => e.id === 'ex-pec-deck')!,
      EXERCISE_LIBRARY.find(e => e.id === 'ex-incline-press')!,
      EXERCISE_LIBRARY.find(e => e.id === 'ex-machine-pullover')!,
      EXERCISE_LIBRARY.find(e => e.id === 'ex-chest-supp-row')!,
      EXERCISE_LIBRARY.find(e => e.id === 'ex-rack-pull')!
    ]
  },
  {
    dayKey: 'B',
    title: 'DAY B: LEGS & ABS',
    subtitle: 'Quads, Hamstrings & Core',
    description: 'Pre-exhaust quad extensions followed by heavy leg press. Complete leg destruction.',
    exercises: [
      EXERCISE_LIBRARY.find(e => e.id === 'ex-leg-extension')!,
      EXERCISE_LIBRARY.find(e => e.id === 'ex-leg-press')!,
      EXERCISE_LIBRARY.find(e => e.id === 'ex-seated-leg-curl')!,
      EXERCISE_LIBRARY.find(e => e.id === 'ex-calf-raise')!,
      EXERCISE_LIBRARY.find(e => e.id === 'ex-cable-crunch')!,
      EXERCISE_LIBRARY.find(e => e.id === 'ex-hanging-knee-raise')!
    ]
  },
  {
    dayKey: 'C',
    title: 'DAY C: SHOULDERS & ARMS',
    subtitle: '3D Deltoids & Heavy Arms',
    description: 'Seated DB Overhead press, side & rear delts, followed by high-tension tricep cable pushdowns and bicep preacher curls.',
    exercises: [
      EXERCISE_LIBRARY.find(e => e.id === 'ex-seated-db-press')!,
      EXERCISE_LIBRARY.find(e => e.id === 'ex-cable-lateral-raise')!,
      EXERCISE_LIBRARY.find(e => e.id === 'ex-rear-delt-fly')!,
      EXERCISE_LIBRARY.find(e => e.id === 'ex-rope-pushdown')!,
      EXERCISE_LIBRARY.find(e => e.id === 'ex-incline-db-curl')!,
      EXERCISE_LIBRARY.find(e => e.id === 'ex-machine-preacher')!
    ]
  }
];
