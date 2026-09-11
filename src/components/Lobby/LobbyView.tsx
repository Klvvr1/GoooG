import React, { useState } from 'react';
import { Sparkles, Brain, Trophy, Flame } from 'lucide-react';
import { Character, Category, GameMode } from '../../types';
import { INITIAL_CATEGORIES } from '../../db/seed';
import { CategoryCard } from './CategoryCard';
import { GameSetupModal } from './GameSetupModal';

interface LobbyViewProps {
  characters: Character[];
  onStartGame: (category: Category, mode: GameMode, rounds: number) => void;
  onQuickSRS: () => void;
  dueCount: number;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  characters,
  onStartGame,
  onQuickSRS,
  dueCount,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Group characters by category
  const getCategoryCharacters = (catId: string): Character[] => {
    if (catId === 'mix') {
      return characters;
    }
    return characters.filter(
      (c) => c.category.toLowerCase() === catId.toLowerCase()
    );
  };

  const totalActive = characters.filter((c) => c.enabled).length;
  const totalReviewed = characters.reduce((acc, c) => acc + (c.stats?.timesSeen || 0), 0);
  const totalCorrect = characters.reduce((acc, c) => acc + (c.stats?.timesCorrect || 0), 0);
  const overallAccuracy = totalReviewed > 0 ? Math.round((totalCorrect / totalReviewed) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Hero Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Spaced Repetition Flashcard Engine</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Master Character Recognition
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl">
            Choose a category below to test your visual memory in Classic or Match mode.
            Fresh random portraits appear on every reload.
          </p>
        </div>

        {/* Quick SRS Action Banner */}
        {dueCount > 0 && (
          <div className="flex-shrink-0">
            <button
              onClick={onQuickSRS}
              className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-sm shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 transition-all group"
            >
              <Brain className="w-5 h-5 text-amber-200 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="text-xs text-amber-100 uppercase tracking-wider font-semibold">
                  Spaced Repetition
                </div>
                <div>Review {dueCount} Due Characters</div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* 4 Horizontal Cards Side-by-Side */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Select Category to Play
          </h2>
          <span className="text-xs text-zinc-400">
            Click any category card to configure game rules
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {INITIAL_CATEGORIES.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              characters={getCategoryCharacters(category.id)}
              onSelect={(cat) => setSelectedCategory(cat)}
            />
          ))}
        </div>
      </div>

      {/* Quick Stats Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm">
        <div className="space-y-1">
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Active Characters
          </span>
          <div className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <span>{totalActive}</span>
            <span className="text-xs font-normal text-zinc-500">in pool</span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Total Reviews
          </span>
          <div className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <span>{totalReviewed}</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Global Accuracy
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 flex items-center gap-2">
            <span>{overallAccuracy}%</span>
            <Trophy className="w-4 h-4 text-emerald-500" />
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            SRS Due Today
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 flex items-center gap-2">
            <span>{dueCount}</span>
            <Brain className="w-4 h-4 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Game Setup Modal */}
      {selectedCategory && (
        <GameSetupModal
          category={selectedCategory}
          characters={getCategoryCharacters(selectedCategory.id)}
          onClose={() => setSelectedCategory(null)}
          onStart={(cat, mode, rounds) => {
            setSelectedCategory(null);
            onStartGame(cat, mode, rounds);
          }}
        />
      )}
    </div>
  );
};
