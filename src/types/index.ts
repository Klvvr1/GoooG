export type CategoryId = 'sluts' | 'trans' | 'twinks' | 'mix' | string;

export interface Category {
  id: string;
  name: string;
  description: string;
  badgeColor: string;
  gradient: string;
}

export interface SRSStats {
  timesSeen: number;
  timesCorrect: number;
  timesIncorrect: number;
  lastReviewed: number | null;
  nextReviewDate: number; // Unix timestamp ms
  interval: number; // Interval in days
  repetition: number; // Consecutive successful reviews
  easeFactor: number; // SM-2 ease factor, default 2.5
}

export interface Character {
  id: string;
  name: string;
  category: string;
  images: string[]; // 1 to 6 photo URLs
  avatarUrl?: string;
  enabled: boolean; // Toggle active in game
  createdAt: number;
  stats: SRSStats;
}

export type GameMode = 'classic' | 'match';

export interface ClassicQuestion {
  targetCharacter: Character;
  displayedImage: string;
  options: Character[]; // 3 options
  userAnswerId?: string;
  isCorrect?: boolean;
}

export interface MatchQuestion {
  targetCharacter: Character;
  optionA: { character: Character; image: string };
  optionB: { character: Character; image: string };
  correctOption: 'A' | 'B';
  userAnswer?: 'A' | 'B';
  isCorrect?: boolean;
}

export interface GameRoundResult {
  character: Character;
  imageShown: string;
  correctAnswer: string;
  userAnswer: string;
  isCorrect: boolean;
}

export interface GameSummary {
  category: string;
  mode: GameMode;
  totalQuestions: number;
  score: number;
  accuracy: number;
  durationSeconds: number;
  mistakes: GameRoundResult[];
  rounds: GameRoundResult[];
}

export interface ScrapedCandidate {
  id: string;
  name: string;
  category: string;
  avatarUrl: string;
  availableImages: string[];
  selectedImages: string[];
  isImported?: boolean;
}
