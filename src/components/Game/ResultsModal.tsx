import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, AlertTriangle, ArrowRight, Clock, Award, CheckCircle2 } from 'lucide-react';
import { GameSummary } from '../../types';
import { formatTime } from '../../utils/helpers';

interface ResultsModalProps {
  summary: GameSummary;
  onPlayAgain: () => void;
  onReviewMistakes: () => void;
  onBackToLobby: () => void;
}

export const ResultsModal: React.FC<ResultsModalProps> = ({
  summary,
  onPlayAgain,
  onReviewMistakes,
  onBackToLobby,
}) => {
  const { score, totalQuestions, accuracy, durationSeconds, mistakes } = summary;
  const hasMistakes = mistakes.length > 0;

  useEffect(() => {
    // Fire confetti if score >= 70%
    if (accuracy >= 70) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [accuracy]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl my-8 rounded-3xl bg-stone-900 border border-stone-800 shadow-2xl p-6 sm:p-8 space-y-8">
        {/* Header & Trophy */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-600 shadow-xl shadow-amber-500/20 text-white mx-auto">
            <Trophy className="w-10 h-10" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              {summary.category} • {summary.mode === 'classic' ? 'Classic Mode' : 'Match Mode'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
              Game Complete!
            </h2>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-stone-800/60 border border-stone-700/50 text-center">
            <span className="text-xs text-stone-400 uppercase font-semibold">Final Score</span>
            <div className="text-2xl font-black text-white mt-1">
              {score} / {totalQuestions}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-800/60 border border-stone-700/50 text-center">
            <span className="text-xs text-stone-400 uppercase font-semibold">Accuracy</span>
            <div className={`text-2xl font-black mt-1 ${accuracy >= 80 ? 'text-emerald-400' : accuracy >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
              {accuracy}%
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-800/60 border border-stone-700/50 text-center">
            <span className="text-xs text-stone-400 uppercase font-semibold">Duration</span>
            <div className="text-2xl font-black text-white mt-1 flex items-center justify-center gap-1">
              <Clock className="w-4 h-4 text-stone-400" />
              <span>{formatTime(durationSeconds)}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-800/60 border border-stone-700/50 text-center">
            <span className="text-xs text-stone-400 uppercase font-semibold">Mistakes</span>
            <div className={`text-2xl font-black mt-1 ${hasMistakes ? 'text-rose-400' : 'text-emerald-400'}`}>
              {mistakes.length}
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {hasMistakes && (
            <button
              type="button"
              onClick={onReviewMistakes}
              className="flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-sm shadow-xl shadow-rose-600/20 hover:shadow-rose-500/40 flex items-center justify-center gap-2 transition-all group"
            >
              <RotateCcw className="w-4 h-4 group-hover:-rotate-45 transition-transform" />
              <span>Review Mistakes Only ({mistakes.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={onPlayAgain}
            className="flex-1 py-3.5 px-5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>

          <button
            type="button"
            onClick={onBackToLobby}
            className="py-3.5 px-5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-sm transition-all"
          >
            Lobby
          </button>
        </div>

        {/* Mistakes Review List */}
        <div className="space-y-3 pt-2 border-t border-stone-800">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              {hasMistakes ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Characters to Practice ({mistakes.length})</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">Perfect Score! No mistakes made.</span>
                </>
              )}
            </h3>
            {hasMistakes && (
              <span className="text-xs text-stone-400">
                Spaced Repetition intervals adjusted for these characters.
              </span>
            )}
          </div>

          {hasMistakes && (
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {mistakes.map((m, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-xl bg-stone-800/40 border border-stone-700/60"
                >
                  <img
                    src={m.imageShown || m.character.avatarUrl || m.character.images[0]}
                    alt={m.correctAnswer}
                    className="w-12 h-14 object-cover rounded-lg flex-shrink-0 border border-stone-700"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm truncate">
                        {m.correctAnswer}
                      </span>
                      <span className="px-2 py-0.2 text-[10px] uppercase font-bold rounded-full bg-stone-700 text-stone-300">
                        {m.character.category}
                      </span>
                    </div>
                    <div className="text-xs text-stone-400 mt-0.5">
                      You guessed: <span className="text-rose-400 font-semibold">{m.userAnswer || 'None'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] px-2 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
                      Need Review
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
