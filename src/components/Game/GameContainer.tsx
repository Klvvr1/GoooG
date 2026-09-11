import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, Flame, Timer, Sparkles } from 'lucide-react';
import { Character, Category, GameMode, ClassicQuestion, MatchQuestion, GameRoundResult, GameSummary } from '../../types';
import { shuffleArray, getRandomItem, formatTime } from '../../utils/helpers';
import { calculateNextSRS } from '../../db/srs';
import { db } from '../../db/db';
import { ClassicMode } from './ClassicMode';
import { MatchMode } from './MatchMode';
import { ResultsModal } from './ResultsModal';

interface GameContainerProps {
  category: Category;
  mode: GameMode;
  roundsCount: number;
  initialPool: Character[];
  allCharacters: Character[];
  onExit: () => void;
  onDataChanged: () => void;
}

export const GameContainer: React.FC<GameContainerProps> = ({
  category,
  mode,
  roundsCount,
  initialPool,
  allCharacters,
  onExit,
  onDataChanged,
}) => {
  const [activeMode, setActiveMode] = useState<GameMode>(mode);
  const [currentPool, setCurrentPool] = useState<Character[]>(initialPool);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [results, setResults] = useState<GameRoundResult[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<'A' | 'B' | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Timer tick
  useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isGameOver]);

  // Generate question deck
  const questionsDeck = useMemo(() => {
    const pool = shuffleArray(currentPool).slice(0, roundsCount);
    return pool;
  }, [currentPool, roundsCount]);

  const currentTarget = questionsDeck[currentIndex] || null;

  // Prepare current classic question
  const currentClassicQuestion = useMemo<ClassicQuestion | null>(() => {
    if (!currentTarget) return null;
    const randomImg = getRandomItem(currentTarget.images) || currentTarget.avatarUrl || '';

    // Distractors from same category or active pool
    const candidates = allCharacters.filter(
      (c) => c.id !== currentTarget.id && c.enabled
    );
    const shuffledCandidates = shuffleArray(candidates);
    const distractors = shuffledCandidates.slice(0, 2);

    const options = shuffleArray([currentTarget, ...distractors]);

    return {
      targetCharacter: currentTarget,
      displayedImage: randomImg,
      options,
    };
  }, [currentTarget, allCharacters]);

  // Prepare current match question
  const currentMatchQuestion = useMemo<MatchQuestion | null>(() => {
    if (!currentTarget) return null;
    const targetImg = getRandomItem(currentTarget.images) || currentTarget.avatarUrl || '';

    const candidates = allCharacters.filter(
      (c) => c.id !== currentTarget.id && c.enabled
    );
    const distractor = shuffleArray(candidates)[0] || currentTarget;
    const distractorImg = getRandomItem(distractor.images) || distractor.avatarUrl || targetImg;

    const isTargetA = Math.random() > 0.5;

    return {
      targetCharacter: currentTarget,
      optionA: isTargetA
        ? { character: currentTarget, image: targetImg }
        : { character: distractor, image: distractorImg },
      optionB: isTargetA
        ? { character: distractor, image: distractorImg }
        : { character: currentTarget, image: targetImg },
      correctOption: isTargetA ? 'A' : 'B',
    };
  }, [currentTarget, allCharacters]);

  // Handle Classic Answer
  const handleClassicAnswer = useCallback(
    async (chosenId: string) => {
      if (isAnswered || !currentClassicQuestion) return;
      setIsAnswered(true);
      setSelectedId(chosenId);

      const target = currentClassicQuestion.targetCharacter;
      const isCorrect = chosenId === target.id;
      const chosenChar = currentClassicQuestion.options.find((o) => o.id === chosenId);

      if (isCorrect) {
        setScore((s) => s + 1);
        setStreak((str) => {
          const next = str + 1;
          setMaxStreak((m) => Math.max(m, next));
          return next;
        });
      } else {
        setStreak(0);
      }

      // Update Spaced Repetition in IndexedDB
      try {
        const nextStats = calculateNextSRS(target.stats, isCorrect);
        await db.characters.update(target.id, { stats: nextStats });
        onDataChanged();
      } catch (err) {
        console.error('Failed to update SRS stats', err);
      }

      // Record round result
      const roundResult: GameRoundResult = {
        character: target,
        imageShown: currentClassicQuestion.displayedImage,
        correctAnswer: target.name,
        userAnswer: chosenChar?.name || 'Unknown',
        isCorrect,
      };
      setResults((prev) => [...prev, roundResult]);

      // Delay before advancing
      setTimeout(() => {
        if (currentIndex + 1 < questionsDeck.length) {
          setCurrentIndex((idx) => idx + 1);
          setIsAnswered(false);
          setSelectedId(null);
        } else {
          setIsGameOver(true);
        }
      }, 1100);
    },
    [isAnswered, currentClassicQuestion, currentIndex, questionsDeck.length, onDataChanged]
  );

  // Handle Match Answer
  const handleMatchAnswer = useCallback(
    async (choice: 'A' | 'B') => {
      if (isAnswered || !currentMatchQuestion) return;
      setIsAnswered(true);
      setSelectedChoice(choice);

      const target = currentMatchQuestion.targetCharacter;
      const isCorrect = choice === currentMatchQuestion.correctOption;
      const chosenObj = choice === 'A' ? currentMatchQuestion.optionA : currentMatchQuestion.optionB;

      if (isCorrect) {
        setScore((s) => s + 1);
        setStreak((str) => {
          const next = str + 1;
          setMaxStreak((m) => Math.max(m, next));
          return next;
        });
      } else {
        setStreak(0);
      }

      // Update Spaced Repetition in IndexedDB
      try {
        const nextStats = calculateNextSRS(target.stats, isCorrect);
        await db.characters.update(target.id, { stats: nextStats });
        onDataChanged();
      } catch (err) {
        console.error('Failed to update SRS stats', err);
      }

      const roundResult: GameRoundResult = {
        character: target,
        imageShown: chosenObj.image,
        correctAnswer: target.name,
        userAnswer: chosenObj.character.name,
        isCorrect,
      };
      setResults((prev) => [...prev, roundResult]);

      setTimeout(() => {
        if (currentIndex + 1 < questionsDeck.length) {
          setCurrentIndex((idx) => idx + 1);
          setIsAnswered(false);
          setSelectedChoice(null);
        } else {
          setIsGameOver(true);
        }
      }, 1100);
    },
    [isAnswered, currentMatchQuestion, currentIndex, questionsDeck.length, onDataChanged]
  );

  // Mistake Review Action
  const handleReviewMistakes = () => {
    const mistakes = results.filter((r) => !r.isCorrect);
    if (mistakes.length === 0) return;
    const missedCharacters = mistakes.map((m) => m.character);

    setCurrentPool(missedCharacters);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setResults([]);
    setIsAnswered(false);
    setSelectedId(null);
    setSelectedChoice(null);
    setIsGameOver(false);
  };

  // Play Again
  const handlePlayAgain = () => {
    setCurrentPool(initialPool);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setResults([]);
    setIsAnswered(false);
    setSelectedId(null);
    setSelectedChoice(null);
    setIsGameOver(false);
  };

  const progressPercent = Math.round(((currentIndex + 1) / questionsDeck.length) * 100);

  const gameSummary: GameSummary = {
    category: category.name,
    mode: activeMode,
    totalQuestions: questionsDeck.length,
    score,
    accuracy: questionsDeck.length > 0 ? Math.round((score / questionsDeck.length) * 100) : 0,
    durationSeconds: elapsedSeconds,
    mistakes: results.filter((r) => !r.isCorrect),
    rounds: results,
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Top Status Bar */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between">
          {/* Round & Mode Info */}
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 border border-zinc-700">
              {category.name}
            </span>
            <span className="text-sm font-semibold text-white">
              Round <span className="text-indigo-400 font-bold">{currentIndex + 1}</span> of{' '}
              {questionsDeck.length}
            </span>
          </div>

          {/* Quick Metrics (Timer & Streak) */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300">
              <Timer className="w-3.5 h-3.5 text-zinc-400" />
              <span>{formatTime(elapsedSeconds)}</span>
            </div>

            {streak > 1 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-xs font-bold text-orange-400 animate-bounce">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>{streak} Streak!</span>
              </div>
            )}

            <button
              onClick={onExit}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Quit to Lobby"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Game Screen */}
      <div className="flex-1 flex items-center justify-center">
        {activeMode === 'classic' && currentClassicQuestion && (
          <ClassicMode
            question={currentClassicQuestion}
            onAnswer={handleClassicAnswer}
            isAnswered={isAnswered}
            selectedId={selectedId}
          />
        )}

        {activeMode === 'match' && currentMatchQuestion && (
          <MatchMode
            question={currentMatchQuestion}
            onAnswer={handleMatchAnswer}
            isAnswered={isAnswered}
            selectedChoice={selectedChoice}
          />
        )}
      </div>

      {/* Footer Navigation */}
      <div className="pt-6 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        <span>GoooG Spaced Repetition Engine • SuperMemo SM-2 Adaptive Algorithm</span>
      </div>

      {/* Results Modal */}
      {isGameOver && (
        <ResultsModal
          summary={gameSummary}
          onPlayAgain={handlePlayAgain}
          onReviewMistakes={handleReviewMistakes}
          onBackToLobby={onExit}
        />
      )}
    </div>
  );
};
