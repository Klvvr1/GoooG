import React, { useState } from 'react';
import { Edit2, Trash2, Image as ImageIcon, Check, Eye } from 'lucide-react';
import { Character } from '../../types';
import { getRetentionStage } from '../../db/srs';

interface CharacterCardProps {
  character: Character;
  onToggleActive: (id: string, active: boolean) => void;
  onEdit: (character: Character) => void;
  onDelete: (id: string) => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onToggleActive,
  onEdit,
  onDelete,
}) => {
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);

  const images = character.images && character.images.length > 0
    ? character.images
    : [character.avatarUrl || ''];

  const retention = getRetentionStage(character.stats);
  const accuracy = character.stats.timesSeen > 0
    ? Math.round((character.stats.timesCorrect / character.stats.timesSeen) * 100)
    : null;

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl bg-zinc-900/90 border transition-all duration-300 overflow-hidden ${
        character.enabled
          ? 'border-zinc-800 hover:border-zinc-700 shadow-md hover:shadow-xl'
          : 'border-zinc-800/40 opacity-60 bg-zinc-950/80'
      }`}
    >
      {/* Top Image & Overlay */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-zinc-950">
        <img
          src={images[selectedPhotoIdx] || images[0]}
          alt={character.name}
          className={`w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105 ${
            !character.enabled ? 'grayscale' : ''
          }`}
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-white border border-white/10">
            {character.category}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${retention.color}`}>
            {retention.label}
          </span>
        </div>

        {/* Photo Count / Inspect overlay */}
        <button
          type="button"
          onClick={() => setShowPhotoViewer(!showPhotoViewer)}
          className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-xs font-semibold text-zinc-200 border border-white/10 hover:bg-black/90 transition-colors"
        >
          <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
          <span>{images.length}/6 photos</span>
        </button>

        {/* Photo Dot Carousel Preview */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur-md">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPhotoIdx(idx);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === selectedPhotoIdx ? 'w-3.5 bg-indigo-400' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Expanded Photos Strip (when toggled) */}
      {showPhotoViewer && images.length > 1 && (
        <div className="p-2.5 bg-zinc-950/90 border-t border-b border-zinc-800 flex items-center gap-2 overflow-x-auto">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt=""
              onClick={() => setSelectedPhotoIdx(idx)}
              className={`w-12 h-14 object-cover rounded-lg cursor-pointer flex-shrink-0 border-2 transition-all ${
                idx === selectedPhotoIdx ? 'border-indigo-500 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            />
          ))}
        </div>
      )}

      {/* Character Details & Controls */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-bold text-white text-base tracking-tight truncate max-w-[170px]" title={character.name}>
              {character.name}
            </h4>
            <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
              <span>{accuracy !== null ? `${accuracy}% acc` : 'Not tested yet'}</span>
              <span>•</span>
              <span>{character.stats.timesSeen} seen</span>
            </div>
          </div>

          {/* Active in Game Toggle Switch */}
          <div className="flex flex-col items-end">
            <button
              type="button"
              onClick={() => onToggleActive(character.id, !character.enabled)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                character.enabled ? 'bg-indigo-600' : 'bg-zinc-700'
              }`}
              title={character.enabled ? 'Enabled in game' : 'Disabled from game'}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  character.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-[10px] text-zinc-500 mt-0.5">
              {character.enabled ? 'In Game' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/80">
          <button
            type="button"
            onClick={() => onEdit(character)}
            className="flex-1 py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5 text-zinc-400" />
            <span>Edit</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Delete ${character.name}?`)) {
                onDelete(character.id);
              }
            }}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Delete character"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
