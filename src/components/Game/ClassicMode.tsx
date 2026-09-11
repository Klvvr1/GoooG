import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Character, ClassicQuestion } from '../../types';

interface ClassicModeProps {
  question: ClassicQuestion;
  onAnswer: (chosenCharacterId: string) => void;
  isAnswered: boolean;
  selectedId: string | null;
}

export const ClassicMode: React.FC<ClassicModeProps> = ({
  question,
  onAnswer,
  isAnswered,
  selectedId,
}) => {
  const { targetCharacter, options } = question;
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Reset photo index when question changes
  useEffect(() => {
    setActivePhotoIndex(0);
  }, [targetCharacter.id]);

  // Keyboard shortcut support (1, 2, 3)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnswered) return;
      if (e.key === '1' && options[0]) onAnswer(options[0].id);
      if (e.key === '2' && options[1]) onAnswer(options[1].id);
      if (e.key === '3' && options[2]) onAnswer(options[2].id);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, options, onAnswer]);

  const images = targetCharacter.images || [targetCharacter.avatarUrl || ''];
  const currentImage = images[activePhotoIndex] || images[0];

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
      {/* Left Column: Character Image Viewport (7 Cols) */}
      <div className="lg:col-span-7 flex flex-col items-center">
        <div className="relative w-full max-w-md aspect-[3/4] rounded-3xl overflow-hidden bg-stone-900 border-2 border-stone-800 shadow-2xl shadow-black/50 group">
          <img
            src={currentImage}
            alt="Guess this character"
            className="w-full h-full object-cover object-center select-none"
            loading="eager"
          />

          {/* Photo Carousel Navigation (if more than 1 photo) */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevPhoto}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md opacity-80 group-hover:opacity-100 transition-all"
                title="Previous photo"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNextPhoto}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md opacity-80 group-hover:opacity-100 transition-all"
                title="Next photo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Photo Indicator Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePhotoIndex(idx);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === activePhotoIndex
                        ? 'w-5 bg-amber-400'
                        : 'bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Category Tag Overlay */}
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-white border border-white/20">
              {targetCharacter.category}
            </span>
          </div>
        </div>

        <p className="text-xs text-stone-500 mt-3 text-center">
          {images.length > 1
            ? `Viewing photo ${activePhotoIndex + 1} of ${images.length}. Use arrows or dots to browse photos.`
            : 'Single photo available for this character.'}
        </p>
      </div>

      {/* Right Column: 3 Name Options (5 Cols) */}
      <div className="lg:col-span-5 flex flex-col justify-center space-y-4">
        <div className="space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Identify Character</span>
          </div>
          <h3 className="text-xl font-bold text-white">Who is pictured here?</h3>
          <p className="text-xs text-stone-400">Click a name or press 1, 2, 3 on your keyboard.</p>
        </div>

        <div className="space-y-3 pt-2">
          {options.map((option: Character, index: number) => {
            const isSelected = selectedId === option.id;
            const isCorrectTarget = option.id === targetCharacter.id;

            let buttonStyle = 'bg-stone-800/80 hover:bg-stone-800 border-stone-700/80 text-stone-200 hover:border-stone-500';
            let icon = null;

            if (isAnswered) {
              if (isCorrectTarget) {
                buttonStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-bold shadow-lg shadow-emerald-500/20 animate-pulse';
                icon = <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
              } else if (isSelected && !isCorrectTarget) {
                buttonStyle = 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold shadow-lg shadow-rose-500/20';
                icon = <XCircle className="w-5 h-5 text-rose-400" />;
              } else {
                buttonStyle = 'opacity-40 bg-stone-900 border-stone-800 text-stone-500 cursor-not-allowed';
              }
            }

            return (
              <button
                key={option.id}
                type="button"
                disabled={isAnswered}
                onClick={() => onAnswer(option.id)}
                className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all duration-200 group ${buttonStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-xs font-bold text-stone-400 group-hover:text-white transition-colors">
                    {index + 1}
                  </span>
                  <span className="text-base font-semibold">{option.name}</span>
                </div>
                {icon}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
