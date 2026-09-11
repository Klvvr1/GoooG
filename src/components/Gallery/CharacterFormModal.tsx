import React, { useState } from 'react';
import { X, Plus, Trash2, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Character } from '../../types';
import { createDefaultSRSStats } from '../../db/srs';
import { generateId } from '../../utils/helpers';
import { INITIAL_CATEGORIES } from '../../db/seed';

interface CharacterFormModalProps {
  initialCharacter?: Character | null;
  existingCategories: string[];
  onClose: () => void;
  onSave: (character: Character) => Promise<void>;
}

export const CharacterFormModal: React.FC<CharacterFormModalProps> = ({
  initialCharacter,
  existingCategories,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(initialCharacter?.name || '');
  const [category, setCategory] = useState(initialCharacter?.category || 'Sluts');
  const [customCategory, setCustomCategory] = useState('');
  const [images, setImages] = useState<string[]>(
    initialCharacter?.images && initialCharacter.images.length > 0
      ? initialCharacter.images
      : ['']
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Combine default and existing categories
  const categoriesList = Array.from(
    new Set([
      ...INITIAL_CATEGORIES.filter((c) => c.id !== 'mix').map((c) => c.name),
      ...existingCategories,
    ])
  );

  const handleAddImageUrl = () => {
    if (images.length < 6) {
      setImages([...images, '']);
    }
  };

  const handleRemoveImageUrl = (index: number) => {
    if (images.length === 1) {
      setImages(['']);
    } else {
      setImages(images.filter((_, idx) => idx !== index));
    }
  };

  const handleImageUrlChange = (index: number, val: string) => {
    const updated = [...images];
    updated[index] = val;
    setImages(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a character name.');
      return;
    }

    const filteredImages = images.map((u) => u.trim()).filter(Boolean);
    if (filteredImages.length === 0) {
      alert('Please provide at least 1 valid photo URL (up to 6 photos).');
      return;
    }

    const finalCategory = category === '__custom__' ? customCategory.trim() : category;
    if (!finalCategory) {
      alert('Please select or specify a category.');
      return;
    }

    setIsSubmitting(true);

    try {
      const characterData: Character = {
        id: initialCharacter?.id || generateId(),
        name: name.trim(),
        category: finalCategory,
        images: filteredImages.slice(0, 6),
        avatarUrl: filteredImages[0],
        enabled: initialCharacter ? initialCharacter.enabled : true,
        createdAt: initialCharacter?.createdAt || Date.now(),
        stats: initialCharacter?.stats || createDefaultSRSStats(),
      };

      await onSave(characterData);
      onClose();
    } catch (err) {
      alert('Failed to save character: ' + String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl my-8 rounded-3xl bg-stone-900 border border-stone-800 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {initialCharacter ? 'Edit Character' : 'Add New Character'}
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Characters require a name, category, and between 1 and 6 photo URLs.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-300">
              Character Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Scarlett Monroe"
              className="w-full px-4 py-3 rounded-xl bg-stone-800/80 border border-stone-700 text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors text-sm"
            />
          </div>

          {/* Category Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-300">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-stone-800/80 border border-stone-700 text-white focus:outline-none focus:border-amber-500 transition-colors text-sm"
            >
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="__custom__">+ Add Custom Category...</option>
            </select>

            {category === '__custom__' && (
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Type custom category name..."
                className="w-full mt-2 px-4 py-2.5 rounded-xl bg-stone-800/80 border border-amber-500/50 text-white placeholder-stone-500 focus:outline-none text-sm"
              />
            )}
          </div>

          {/* Photos URL Manager (1 to 6) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>Photos ({images.filter((u) => u.trim()).length} of 6 max) *</span>
              </label>
              {images.length < 6 && (
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Another Photo URL</span>
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {images.map((url, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-stone-800 border border-stone-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {url.trim() ? (
                      <img
                        src={url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/80?text=Invalid';
                        }}
                      />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-stone-600" />
                    )}
                  </div>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                    placeholder={`Photo URL #${idx + 1} (https://...)`}
                    className="flex-1 px-3 py-2 rounded-xl bg-stone-800/80 border border-stone-700 text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImageUrl(idx)}
                    className="p-2 rounded-lg text-stone-500 hover:text-rose-400 hover:bg-stone-800 transition-colors"
                    title="Remove URL"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-stone-500">
              Each character can have between 1 and 6 distinct photos. In Classic mode, you can inspect each photo, and random photos will be drawn during games.
            </p>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center gap-3 pt-3 border-t border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{initialCharacter ? 'Update Character' : 'Save Character'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
