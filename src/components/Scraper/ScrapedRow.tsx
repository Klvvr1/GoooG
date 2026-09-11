import React, { useEffect, useRef } from 'react';
import { Check, Plus, Image as ImageIcon, CheckCircle2, Loader2 } from 'lucide-react';
import { ScrapedCandidate } from '../../types';
import { isAvatarMatch } from '../../utils/helpers';

interface ScrapedRowProps {
  item: ScrapedCandidate;
  onTogglePhoto: (characterId: string, photoUrl: string) => void;
  onImport: (characterId: string) => void;
  onLazyLoadPhotos?: (characterId: string, profileUrl: string, avatarUrl?: string) => void;
  isImported: boolean;
}

export const ScrapedRow: React.FC<ScrapedRowProps> = ({
  item,
  onTogglePhoto,
  onImport,
  onLazyLoadPhotos,
  isImported,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);

  // Gallery photos strictly exclude any avatar profile URL
  const galleryPhotos = item.availableImages.filter(
    (photoUrl) => !isAvatarMatch(photoUrl, item.avatarUrl)
  );
  const validSelectedPhotos = item.selectedImages.filter(
    (photoUrl) => !isAvatarMatch(photoUrl, item.avatarUrl)
  );

  const selectedCount = validSelectedPhotos.length;
  const isValidCount = selectedCount >= 1 && selectedCount <= 6;

  // IntersectionObserver for lazy loading character gallery photos when scrolled near
  useEffect(() => {
    if (!item.profileUrl || item.hasLoadedPhotos || item.isLoadingPhotos || !onLazyLoadPhotos) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          onLazyLoadPhotos(item.id, item.profileUrl!, item.avatarUrl);
          observer.disconnect();
        }
      },
      {
        rootMargin: '400px', // start loading 400px before appearing on screen
        threshold: 0.01,
      }
    );

    if (rowRef.current) {
      observer.observe(rowRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [item.id, item.profileUrl, item.avatarUrl, item.hasLoadedPhotos, item.isLoadingPhotos, onLazyLoadPhotos]);

  return (
    <div
      ref={rowRef}
      className={`p-6 sm:p-7 rounded-3xl border transition-all duration-200 space-y-5 ${
        isImported
          ? 'bg-emerald-950/20 border-emerald-500/40 shadow-sm'
          : 'bg-stone-900/90 border-stone-800 hover:border-stone-700 shadow-md'
      }`}
    >
      {/* Upper Row: Avatar Profile Square (+30% larger), Name, Category, Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Avatar Profile Square - Exclusively displays the profile avatar from the site */}
          <div className="relative w-[76px] h-[76px] sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-stone-950 border border-stone-700 flex-shrink-0 shadow-inner">
            {item.avatarUrl ? (
              <img
                src={item.avatarUrl}
                alt={item.name}
                className="w-full h-full object-cover object-center"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (item.availableImages[0] && target.src !== item.availableImages[0]) {
                    target.src = item.availableImages[0];
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-600">
                <ImageIcon className="w-8 h-8" />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h4 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {item.name}
              </h4>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-stone-800 text-stone-300 border border-stone-700">
                {item.category}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-400 mt-1 flex items-center gap-2.5 flex-wrap">
              <span>{galleryPhotos.length} gallery photo{galleryPhotos.length !== 1 ? 's' : ''} available</span>
              <span>•</span>
              <span className={selectedCount > 6 || selectedCount < 1 ? 'text-amber-400 font-bold' : 'text-amber-400 font-semibold'}>
                {selectedCount}/6 gallery photos chosen
              </span>
              {item.isLoadingPhotos && (
                <span className="flex items-center gap-1.5 text-xs text-amber-400 animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Loading gallery...</span>
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Actions (+30% larger buttons) */}
        <div className="flex items-center gap-3 flex-wrap">
          {isImported ? (
            <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Imported</span>
            </div>
          ) : (
            <button
              type="button"
              disabled={!isValidCount}
              onClick={() => onImport(item.id)}
              className="px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-amber-600/30 flex items-center gap-2 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Import Character ({selectedCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Horizontal Scrollable Photo Strip (Avatar is excluded, cards +30% larger: w-32 h-40) */}
      <div className="space-y-3 pt-2 border-t border-stone-800/80">
        <div className="flex items-center justify-between text-xs sm:text-sm text-stone-400">
          <span className="flex items-center gap-2 font-medium text-stone-300">
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <span>Select gallery photos to include (1 to 6 photos):</span>
          </span>
          <span className="text-xs text-stone-500">Scroll horizontally to view all</span>
        </div>

        <div className="flex items-center gap-3.5 overflow-x-auto pb-2 pt-1">
          {galleryPhotos.length > 0 ? (
            galleryPhotos.map((photoUrl, idx) => {
              const isSelected = validSelectedPhotos.includes(photoUrl);

              return (
                <div
                  key={photoUrl || idx}
                  onClick={() => onTogglePhoto(item.id, photoUrl)}
                  className={`relative w-32 h-40 flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-200 select-none group ${
                    isSelected
                      ? 'border-amber-500 ring-2 ring-amber-500/30 scale-100 shadow-lg'
                      : 'border-stone-800 opacity-60 hover:opacity-100 hover:border-stone-600'
                  }`}
                >
                  <img
                    src={photoUrl}
                    alt={`Gallery ${idx + 1}`}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform"
                    loading="lazy"
                    decoding="async"
                  />

                  {/* Selection Checkbox Badge */}
                  <div
                    className={`absolute top-2.5 right-2.5 w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'bg-black/60 backdrop-blur-sm border border-white/20 text-transparent'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                  </div>

                  {/* Photo index */}
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-xs text-stone-300 font-mono">
                    #{idx + 1}
                  </div>
                </div>
              );
            })
          ) : !item.isLoadingPhotos ? (
            <div className="py-6 px-4 text-center rounded-2xl bg-stone-950/40 border border-dashed border-stone-800/80 text-xs sm:text-sm text-stone-500 w-full">
              {item.hasLoadedPhotos
                ? 'No additional gallery photos found on profile'
                : 'Scroll into view to automatically load gallery photos...'}
            </div>
          ) : null}

          {/* Skeleton placeholders while loading gallery photos (+30% larger: w-32 h-40) */}
          {item.isLoadingPhotos && (
            <>
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={`skeleton-${s}`}
                  className="w-32 h-40 flex-shrink-0 rounded-2xl bg-stone-800/60 border border-stone-700/50 animate-pulse flex items-center justify-center"
                >
                  <Loader2 className="w-5 h-5 text-stone-500 animate-spin" />
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};


