export interface PullupRoadmapStep {
  step: number;
  title: string;
  targetRequirement: string;
  tempo: string;
  description: string;
  status: 'locked' | 'current' | 'completed';
}

export const DEFAULT_PULLUP_ROADMAP: PullupRoadmapStep[] = [
  {
    step: 1,
    title: "Lat Pulldown Mastery",
    targetRequirement: "1x10 @ 75% Bodyweight (75kg)",
    tempo: "3/1/4 Controlled",
    description: "Build foundational back lat width and bicep tendon strength with heavy chest-to-bar pulldowns.",
    status: "completed"
  },
  {
    step: 2,
    title: "Chest-Supported Row Overload",
    targetRequirement: "1x8 @ 85% Bodyweight (85kg)",
    tempo: "3/1/4 Squeeze at Peak",
    description: "Build upper back thickness and scapular retraction without loading the lower spine.",
    status: "current"
  },
  {
    step: 3,
    title: "Negative-Only Bodyweight Pull-Ups",
    targetRequirement: "3 x 5 Reps with 5-sec Eccentric Drop",
    tempo: "0/0/5 Negative Focus",
    description: "Use a box to step up to top position, then slow 5-second lower. High intensity neural adaptation.",
    status: "locked"
  },
  {
    step: 4,
    title: "Band-Assisted Full Range Pull-Up",
    targetRequirement: "1x8 Clean Reps with Light Band",
    tempo: "3/1/4 Full Lockout",
    description: "Transition to free hanging pull-ups. Focus on driving elbows into back pockets.",
    status: "locked"
  },
  {
    step: 5,
    title: "Bodyweight Unassisted Pull-Up",
    targetRequirement: "1x6-10 Strict Bodyweight Reps (100kg)",
    tempo: "3/1/4 Failure",
    description: "Achieve true unassisted pull-up failure at 100kg bodyweight! Temple Gym standard.",
    status: "locked"
  },
  {
    step: 6,
    title: "Heavy Duty Weighted Pull-Up",
    targetRequirement: "1x6-8 with +10kg Dip Belt",
    tempo: "3/1/4 Rest-Pause",
    description: "Dorian Yates Blood & Guts elite pull-up level with weighted dip belt.",
    status: "locked"
  }
];
