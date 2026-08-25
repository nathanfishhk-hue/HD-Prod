import { MuscleGroup } from '../types/hit';

export function calculateEstimated1RM(weightKg: number, reps: number): number {
  if (reps <= 0 || weightKg <= 0) return 0;
  if (reps === 1) return weightKg;
  // Epley Formula
  return Math.round((weightKg * (1 + reps / 30)) * 10) / 10;
}

export function calculateAutoSuggestWeight(
  currentWeightKg: number,
  repsAchieved: number,
  targetRepsMax: number,
  muscleGroup: MuscleGroup
): { suggestIncrement: boolean; nextWeightKg: number; reason: string } {
  if (repsAchieved >= targetRepsMax) {
    // Upper body or arms: +2.5kg, Legs or Rack pull: +5kg
    const increment = (muscleGroup === 'Legs' || muscleGroup === 'Lats/Back') ? 5.0 : 2.5;
    const nextWeightKg = Math.round((currentWeightKg + increment) * 10) / 10;
    return {
      suggestIncrement: true,
      nextWeightKg,
      reason: `DOUBLE PROGRESSION HIT! You hit top rep target (${repsAchieved}/${targetRepsMax} reps). Load auto-increased by +${increment}kg for next session.`
    };
  }
  return {
    suggestIncrement: false,
    nextWeightKg: currentWeightKg,
    reason: `Maintain current load (${currentWeightKg}kg) until hitting ${targetRepsMax} reps with 3/1/4 tempo.`
  };
}

export function convertKgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

export function convertLbsToKg(lbs: number): number {
  return Math.round((lbs / 2.20462) * 10) / 10;
}

export interface PlateBreakdown {
  plateKg: number;
  countPerSide: number;
  color: string;
}

export function calculatePlates(
  totalTargetKg: number,
  barWeightKg: number = 20
): { perSideKg: number; plates: PlateBreakdown[] } {
  if (totalTargetKg <= barWeightKg) {
    return { perSideKg: 0, plates: [] };
  }

  const remainingKgPerSide = (totalTargetKg - barWeightKg) / 2;
  let currentRem = remainingKgPerSide;

  const availablePlates: { plateKg: number; color: string }[] = [
    { plateKg: 25, color: '#dc2626' }, // Red
    { plateKg: 20, color: '#2563eb' }, // Blue
    { plateKg: 15, color: '#eab308' }, // Yellow
    { plateKg: 10, color: '#16a34a' }, // Green
    { plateKg: 5, color: '#e2e8f0' },  // White
    { plateKg: 2.5, color: '#9333ea' }, // Purple
    { plateKg: 1.25, color: '#71717a' } // Zinc Gray
  ];

  const breakdown: PlateBreakdown[] = [];

  for (const plate of availablePlates) {
    if (currentRem >= plate.plateKg) {
      const count = Math.floor(currentRem / plate.plateKg);
      currentRem = Math.round((currentRem - count * plate.plateKg) * 100) / 100;
      breakdown.push({
        plateKg: plate.plateKg,
        countPerSide: count,
        color: plate.color
      });
    }
  }

  return {
    perSideKg: Math.round(remainingKgPerSide * 10) / 10,
    plates: breakdown
  };
}

export interface RecompStats {
  fatMassKg: number;
  leanMassKg: number;
  bmr: number; // Basal Metabolic Rate
  tdee: number; // Total Daily Energy Expenditure (lightly active gym + 3x HIT)
  recommendedCalories: number;
  proteinGrams: number;
  weeklyFatLossKgEst: number;
}

export function calculateRecompMetrics(
  weightKg: number,
  heightCm: number,
  age: number,
  bfPercent: number
): RecompStats {
  const fatMassKg = Math.round((weightKg * (bfPercent / 100)) * 10) / 10;
  const leanMassKg = Math.round((weightKg - fatMassKg) * 10) / 10;

  // Katch-McArdle Formula based on Lean Mass
  const bmr = Math.round(370 + 21.6 * leanMassKg);
  // Activity factor for 3x Heavy Duty HIT + daily life ~ 1.45
  const tdee = Math.round(bmr * 1.45);
  // Recomp Deficit ~ 500 kcal
  const recommendedCalories = tdee - 500;
  // Protein target: 2g per kg of total bodyweight = ~200g
  const proteinGrams = Math.round(weightKg * 2.0);
  // Est weekly fat loss ~ 500 kcal * 7 = 3500 kcal = ~0.45 kg fat per week
  const weeklyFatLossKgEst = 0.45;

  return {
    fatMassKg,
    leanMassKg,
    bmr,
    tdee,
    recommendedCalories,
    proteinGrams,
    weeklyFatLossKgEst
  };
}
