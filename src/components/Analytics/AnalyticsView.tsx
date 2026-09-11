import React, { useMemo } from 'react';
import { Brain, CheckCircle, XCircle, TrendingUp, Calendar, Play, Sparkles } from 'lucide-react';
import { Character, Category, GameMode } from '../../types';
import { getRetentionStage, isDueForReview } from '../../db/srs';

interface AnalyticsViewProps {
  characters: Character[];
  onStartSRSGame: (dueCharacters: Character[]) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  characters,
  onStartSRSGame,
}) => {
  // Aggregate statistics
  const totalCharacters = characters.length;
  const totalAttempts = characters.reduce((acc, c) => acc + (c.stats?.timesSeen || 0), 0);
  const totalCorrect = characters.reduce((acc, c) => acc + (c.stats?.timesCorrect || 0), 0);
  const totalIncorrect = characters.reduce((acc, c) => acc + (c.stats?.timesIncorrect || 0), 0);
  const overallAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  // Characters due for review
  const dueCharacters = useMemo(() => {
    return characters.filter((c) => c.enabled && isDueForReview(c.stats));
  }, [characters]);

  // Mastered characters
  const masteredCount = characters.filter((c) => getRetentionStage(c.stats).label === 'Mastered').length;
  const learningCount = characters.filter((c) => getRetentionStage(c.stats).label === 'Learning').length;

  const formatDateDue = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    const diff = timestamp - Date.now();
    if (diff <= 0) return 'Due Now';
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days === 1) return 'Tomorrow';
    return `In ${days} days`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Brain className="w-3.5 h-3.5" />
            <span>SuperMemo SM-2 Adaptive Intelligence</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Analytics & Spaced Repetition (SRS)
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            Track individual character memory retention, success rates, and optimal review schedules.
          </p>
        </div>

        {/* Start SRS Session Button */}
        {dueCharacters.length > 0 ? (
          <button
            type="button"
            onClick={() => onStartSRSGame(dueCharacters)}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-sm shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 transition-all group"
          >
            <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
            <span>Start Review Session ({dueCharacters.length} Due)</span>
          </button>
        ) : (
          <div className="px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-400 text-xs font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>All active characters are caught up on review!</span>
          </div>
        )}
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Overall Accuracy
            </span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white">{overallAccuracy}%</div>
          <div className="w-full h-1.5 rounded-full bg-stone-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-500"
              style={{ width: `${overallAccuracy}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Correct Guesses
            </span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">{totalCorrect}</div>
          <p className="text-xs text-stone-500">out of {totalAttempts} total attempts</p>
        </div>

        <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Incorrect Guesses
            </span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-black text-rose-400">{totalIncorrect}</div>
          <p className="text-xs text-stone-500">Scheduled for tighter intervals</p>
        </div>

        <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Retention Health
            </span>
            <Brain className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white">{masteredCount} Mastered</div>
          <p className="text-xs text-stone-500">{learningCount} currently in active learning</p>
        </div>
      </div>

      {/* Detailed Character Performance Table */}
      <div className="rounded-3xl bg-stone-900/90 border border-stone-800 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-stone-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Character Retention Breakdown</h3>
            <p className="text-xs text-stone-400">Detailed answers and next due date per character</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-300">
            <thead className="bg-stone-950/60 text-xs uppercase tracking-wider text-stone-400 border-b border-stone-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Character</th>
                <th className="py-3.5 px-4 font-semibold">Category</th>
                <th className="py-3.5 px-4 font-semibold">Retention Stage</th>
                <th className="py-3.5 px-4 font-semibold text-center">Correct</th>
                <th className="py-3.5 px-4 font-semibold text-center">Incorrect</th>
                <th className="py-3.5 px-4 font-semibold">Accuracy</th>
                <th className="py-3.5 px-4 font-semibold">Interval / Next Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {characters.map((char) => {
                const stage = getRetentionStage(char.stats);
                const charSeen = char.stats?.timesSeen || 0;
                const charCorrect = char.stats?.timesCorrect || 0;
                const charIncorrect = char.stats?.timesIncorrect || 0;
                const charAcc = charSeen > 0 ? Math.round((charCorrect / charSeen) * 100) : 0;
                const isDue = isDueForReview(char.stats);

                return (
                  <tr key={char.id} className="hover:bg-stone-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={char.avatarUrl || char.images[0]}
                          alt={char.name}
                          className="w-9 h-11 object-cover rounded-lg border border-stone-700"
                        />
                        <div>
                          <span className="font-bold text-white block">{char.name}</span>
                          <span className="text-[11px] text-stone-500">
                            {char.images.length} photos
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-800 text-stone-300 border border-stone-700">
                        {char.category}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${stage.color}`}>
                        {stage.label}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-emerald-400">
                      {charCorrect}
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-rose-400">
                      {charIncorrect}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-stone-800 overflow-hidden">
                          <div
                            className={`h-full ${charAcc >= 70 ? 'bg-emerald-500' : charAcc >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${charAcc}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-stone-300">
                          {charSeen > 0 ? `${charAcc}%` : '-'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <span className={`text-xs font-semibold ${isDue ? 'text-amber-400 font-bold' : 'text-stone-400'}`}>
                          {formatDateDue(char.stats?.nextReviewDate)}
                        </span>
                        {char.stats?.interval > 0 && (
                          <span className="text-[10px] text-stone-500">
                            ({char.stats.interval}d interval)
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
