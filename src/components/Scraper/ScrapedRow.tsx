import React from 'react';
import { Check, Plus, Image as ImageIcon, CheckCircle2, Loader2, Images } from 'lucide-react';
import { ScrapedCandidate } from '../../types';

interface ScrapedRowProps {
  item: ScrapedCandidate;
  onTogglePhoto: (characterId: string, photoUrl: string) => void;
  onImport: (characterId: string) => void;
  onFetchMorePhotos?: (characterId: string, profileUrl: string) => void;
  isImported: boolean;
}

export const ScrapedRow: React.FC<ScrapedRowProps> = ({
  item,
  onTogglePhoto,
  onImport,
  onFetchMorePhotos,
  isImported,
}) => {
  const selectedCount = item.selectedImages.length;
  const isValidCount = selectedCount >= 1 && selectedCount <= 6;

  return (
    <div
      className={`p-5 rounded-3xl border transition-all duration-200 space-y-4 ${
        isImported
          ? 'bg-emerald-950/20 border-emerald-500/40 shadow-sm'
          : 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700 shadow-md'
      }`}
    >
      {/* Upper Row: Avatar, Name, Category, Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-700 flex-shrink-0">
            <img
              src={item.avatarUrl || item.availableImages[0]}
              alt={item.name}
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-lg font-bold text-white tracking-tight">{item.name}</h4>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                {item.category}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-2">
              <span>{item.availableImages.length} photo{item.availableImages.length > 1 ? 's' : ''} available</span>
              <span>•</span>
              <span className={selectedCount > 6 || selectedCount < 1 ? 'text-amber-400 font-bold' : 'text-indigo-400 font-semibold'}>
                {selectedCount}/6 photos chosen
              </span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {item.profileUrl && onFetchMorePhotos && (
            <button
              type="button"
              disabled={item.isLoadingPhotos}
              onClick={() => onFetchMorePhotos(item.id, item.profileUrl!)}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Fetch more gallery photos for this character"
            >
              {item.isLoadingPhotos ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  <span>Loading Photos...</span>
                </>
              ) : (
                <>
                  <Images className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Fetch Gallery Photos</span>
                </>
              )}
            </button>
          )}

          {isImported ? (
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Imported</span>
            </div>
          ) : (
            <button
              type="button"
              disabled={!isValidCount}
              onClick={() => onImport(item.id)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Import Character ({selectedCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Horizontal Scrollable Photo Strip */}
      <div className="space-y-2 pt-1 border-t border-zinc-800/80">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Select photos to include (1 to 6 photos):</span>
          </span>
          <span className="text-[11px] text-zinc-500">Scroll horizontally to view all</span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1">
          {item.availableImages.map((photoUrl, idx) => {
            const isSelected = item.selectedImages.includes(photoUrl);

            return (
              <div
                key={idx}
                onClick={() => onTogglePhoto(item.id, photoUrl)}
                className={`relative w-24 h-28 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-200 select-none group ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/30 scale-100 shadow-md'
                    : 'border-zinc-800 opacity-60 hover:opacity-100 hover:border-zinc-600'
                }`}
              >
                <img
                  src={photoUrl}
                  alt={`Photo ${idx + 1}`}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform"
                  loading="lazy"
                />

                {/* Selection Checkbox Badge */}
                <div
                  className={`absolute top-2 right-2 w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-black/60 backdrop-blur-sm border border-white/20 text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                </div>

                {/* Photo index */}
                <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.2 rounded bg-black/60 backdrop-blur-sm text-[10px] text-zinc-300 font-mono">
                  #{idx + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

