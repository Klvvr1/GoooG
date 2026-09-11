import { SRSStats } from '../types';

export function createDefaultSRSStats(): SRSStats {
  return {
    timesSeen: 0,
    timesCorrect: 0,
    timesIncorrect: 0,
    lastReviewed: null,
    nextReviewDate: Date.now(),
    interval: 0,
    repetition: 0,
    easeFactor: 2.5,
  };
}

/**
 * SuperMemo SM-2 Spaced Repetition Algorithm
 * Computes next review schedule based on whether the user guessed correctly.
 */
export function calculateNextSRS(current: SRSStats, isCorrect: boolean): SRSStats {
  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  let repetition = current.repetition || 0;
  let interval = current.interval || 0;
  let easeFactor = current.easeFactor || 2.5;

  if (isCorrect) {
    // Quality rating between 4 (good) and 5 (perfect)
    const quality = 4;
    
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }

    repetition += 1;

    // SM-2 formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    const qDiff = 5 - quality;
    easeFactor = easeFactor + (0.1 - qDiff * (0.08 + qDiff * 0.02));
    if (easeFactor < 1.3) {
      easeFactor = 1.3;
    }
  } else {
    // Failure resets repetition and schedules review for tomorrow
    repetition = 0;
    interval = 1;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  }

  const nextReviewDate = now + interval * ONE_DAY_MS;

  return {
    timesSeen: (current.timesSeen || 0) + 1,
    timesCorrect: (current.timesCorrect || 0) + (isCorrect ? 1 : 0),
    timesIncorrect: (current.timesIncorrect || 0) + (isCorrect ? 0 : 1),
    lastReviewed: now,
    nextReviewDate,
    interval,
    repetition,
    easeFactor: Number(easeFactor.toFixed(2)),
  };
}

export function isDueForReview(stats: SRSStats): boolean {
  if (!stats || !stats.nextReviewDate) return true;
  return Date.now() >= stats.nextReviewDate;
}

export function getRetentionStage(stats: SRSStats): {
  label: 'New' | 'Learning' | 'Reviewing' | 'Mastered';
  color: string;
} {
  if (!stats || stats.timesSeen === 0) {
    return { label: 'New', color: 'bg-zinc-700 text-zinc-300' };
  }
  if (stats.repetition >= 5 && stats.interval >= 21) {
    return { label: 'Mastered', color: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' };
  }
  if (stats.repetition >= 2) {
    return { label: 'Reviewing', color: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' };
  }
  return { label: 'Learning', color: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' };
}
