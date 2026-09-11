import React, { useState } from 'react';
import { X, Play, Target, Split, Layers } from 'lucide-react';
import { Category, GameMode, Character } from '../../types';

interface GameSetupModalProps {
  category: Category;
  characters: Character[];
  onClose: () => void;
  onStart: (category: Category, mode: GameMode, rounds: number) => void;
}

export const GameSetupModal: React.FC<GameSetupModalProps> = ({
  category,
  characters,
  onClose,
  onStart,
}) => {
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic');
  const activeCharacters = characters.filter((c) => c.enabled);
  const maxAvailable = activeCharacters.length;

  const defaultRounds = Math.min(10, maxAvailable > 0 ? maxAvailable : 10);
  const [rounds, setRounds] = useState<number>(defaultRounds);

  const roundOptions = [5, 10, 20, maxAvailable].filter(
    (val, idx, arr) => val > 0 && arr.indexOf(val) === idx && val <= Math.max(maxAvailable, 5)
  );

  const handleStart = () => {
    if (activeCharacters.length < 2) {
      alert('You need at least 2 active characters to play! Please add or enable characters in Gallery.');
      return;
    }
    const finalRounds = Math.min(rounds, maxAvailable);
    onStart(category, selectedMode, finalRounds);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 sm:p-8 space-y-6 overflow-hidden">
        {/* Background glow decoration */}
        <div className={`absolute -top-20 -right-20 w-48 h-48 rounded-full bg-gradient-to-br ${category.gradient} blur-3xl opacity-30 pointer-events-none`} />

        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${category.badgeColor}`}>
              {category.name}
            </span>
            <h2 className="text-2xl font-bold text-white mt-1">Configure Game</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Game Mode Selection */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Select Game Mode</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Classic Mode Card */}
            <button
              type="button"
              onClick={() => setSelectedMode('classic')}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                selectedMode === 'classic'
                  ? 'bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-500/10'
                  : 'bg-zinc-800/60 border-zinc-700/60 hover:bg-zinc-800 hover:border-zinc-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <Target className={`w-5 h-5 ${selectedMode === 'classic' ? 'text-indigo-400' : 'text-zinc-400'}`} />
                {selectedMode === 'classic' && (
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                )}
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Classic Mode</h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  1 photo on the left, pick the matching name from 3 choices on the right.
                </p>
              </div>
            </button>

            {/* Match Mode Card */}
            <button
              type="button"
              onClick={() => setSelectedMode('match')}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                selectedMode === 'match'
                  ? 'bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-500/10'
                  : 'bg-zinc-800/60 border-zinc-700/60 hover:bg-zinc-800 hover:border-zinc-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <Split className={`w-5 h-5 ${selectedMode === 'match' ? 'text-indigo-400' : 'text-zinc-400'}`} />
                {selectedMode === 'match' && (
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                )}
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Match Mode</h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  1 name shown at the top, choose the correct photo from 2 images side-by-side.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Rounds Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-zinc-300">
              Number of Rounds
            </label>
            <span className="text-xs text-zinc-400">
              Available pool: <strong className="text-zinc-200">{maxAvailable} characters</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {roundOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setRounds(opt)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                  rounds === opt
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                    : 'bg-zinc-800/80 text-zinc-300 border-zinc-700 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                {opt === maxAvailable && opt > 20 ? `All (${opt})` : `${opt} Rounds`}
              </button>
            ))}
          </div>
        </div>

        {/* Start Game Action */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleStart}
            disabled={activeCharacters.length < 2}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/50 flex items-center justify-center gap-2 transition-all"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Start {rounds} Rounds in {selectedMode === 'classic' ? 'Classic' : 'Match'} Mode</span>
          </button>
        </div>
      </div>
    </div>
  );
};
