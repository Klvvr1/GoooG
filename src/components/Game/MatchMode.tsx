import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, ArrowLeft, ArrowRight, UserCheck } from 'lucide-react';
import { MatchQuestion } from '../../types';

interface MatchModeProps {
  question: MatchQuestion;
  onAnswer: (chosenOption: 'A' | 'B') => void;
  isAnswered: boolean;
  selectedChoice: 'A' | 'B' | null;
}

export const MatchMode: React.FC<MatchModeProps> = ({
  question,
  onAnswer,
  isAnswered,
  selectedChoice,
}) => {
  const { targetCharacter, optionA, optionB, correctOption } = question;

  // Keyboard shortcut support (ArrowLeft / ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnswered) return;
      if (e.key === 'ArrowLeft' || e.key === '1') onAnswer('A');
      if (e.key === 'ArrowRight' || e.key === '2') onAnswer('B');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, onAnswer]);

  const renderCard = (
    choice: 'A' | 'B',
    data: { character: { id: string; name: string }; image: string },
    shortcutLabel: string,
    shortcutIcon: React.ReactNode
  ) => {
    const isSelected = selectedChoice === choice;
    const isCorrect = correctOption === choice;

    let borderStyle = 'border-zinc-800 hover:border-indigo-500/60 hover:-translate-y-1';
    let overlay = null;

    if (isAnswered) {
      if (isCorrect) {
        borderStyle = 'border-emerald-500 ring-4 ring-emerald-500/30 shadow-2xl shadow-emerald-500/20';
        overlay = (
          <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-xs flex flex-col items-center justify-center text-emerald-300 font-bold p-4 text-center animate-in fade-in">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-2" />
            <span className="text-xl">Match Found!</span>
            <span className="text-sm text-emerald-200 mt-1">{data.character.name}</span>
          </div>
        );
      } else if (isSelected && !isCorrect) {
        borderStyle = 'border-rose-500 ring-4 ring-rose-500/30 shadow-2xl shadow-rose-500/20';
        overlay = (
          <div className="absolute inset-0 bg-rose-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-rose-300 font-bold p-4 text-center animate-in fade-in">
            <XCircle className="w-16 h-16 text-rose-400 mb-2" />
            <span className="text-xl">Incorrect</span>
            <span className="text-sm text-rose-200 mt-1">This is {data.character.name}</span>
          </div>
        );
      } else {
        borderStyle = 'opacity-30 border-zinc-900 grayscale';
      }
    }

    return (
      <div
        onClick={() => !isAnswered && onAnswer(choice)}
        className={`relative flex-1 aspect-[3/4] max-h-[480px] rounded-3xl overflow-hidden bg-zinc-900 border-2 cursor-pointer transition-all duration-300 shadow-2xl group select-none ${borderStyle}`}
      >
        <img
          src={data.image}
          alt={`Option ${choice}`}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="eager"
        />

        {/* Shortcut Badge */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-bold border border-white/20">
          <span>Option {choice}</span>
          <span className="text-zinc-400 flex items-center gap-0.5">({shortcutIcon} {shortcutLabel})</span>
        </div>

        {/* Hover Cue */}
        {!isAnswered && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-6">
            <span className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-lg">
              Pick Image {choice}
            </span>
          </div>
        )}

        {/* Result Overlay */}
        {overlay}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Target Name Header */}
      <div className="text-center space-y-2 p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
          <UserCheck className="w-3.5 h-3.5" />
          <span>Category: {targetCharacter.category}</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Find the portrait of <span className="text-indigo-400 underline decoration-indigo-500/40">{targetCharacter.name}</span>
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400">
          Click the matching photo or use <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-xs">←</kbd> and <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-xs">→</kbd> arrow keys.
        </p>
      </div>

      {/* Two Photos Side-by-Side */}
      <div className="flex flex-col sm:flex-row gap-6">
        {renderCard('A', optionA, 'Left', <ArrowLeft className="w-3 h-3" />)}
        {renderCard('B', optionB, 'Right', <ArrowRight className="w-3 h-3" />)}
      </div>
    </div>
  );
};
