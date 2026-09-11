import React, { useMemo } from 'react';
import { Play, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Character, Category } from '../../types';

interface CategoryCardProps {
  category: Category;
  characters: Character[];
  onSelect: (category: Category) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  characters,
  onSelect,
}) => {
  // Select a random photo from the available characters in this category
  const randomPhoto = useMemo(() => {
    if (characters.length === 0) return null;
    // Collect all available photos across enabled characters
    const allPhotos: string[] = [];
    characters.forEach((char) => {
      if (char.images && char.images.length > 0) {
        allPhotos.push(...char.images);
      }
    });
    if (allPhotos.length === 0) return null;
    return allPhotos[Math.floor(Math.random() * allPhotos.length)];
  }, [characters]);

  const activeCount = characters.filter((c) => c.enabled).length;

  return (
    <div
      onClick={() => onSelect(category)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-indigo-500/60 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 cursor-pointer select-none min-h-[380px]"
    >
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {randomPhoto ? (
          <img
            src={randomPhoto}
            alt={category.name}
            className="w-full h-full object-cover object-center transform scale-100 group-hover:scale-110 transition-transform duration-700 ease-out brightness-75 group-hover:brightness-90"
            loading="lazy"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${category.gradient} opacity-50`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-40 mix-blend-overlay`} />
      </div>

      {/* Top Badges */}
      <div className="relative z-10 p-5 flex items-center justify-between">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-md border ${category.badgeColor}`}
        >
          {category.name}
        </span>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-xs font-medium text-zinc-300 border border-white/10">
          <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
          <span>{activeCount} Active</span>
        </div>
      </div>

      {/* Bottom Content Area */}
      <div className="relative z-10 p-6 space-y-3">
        <div>
          <h3 className="text-2xl font-bold text-white tracking-tight group-hover:text-indigo-300 transition-colors flex items-center gap-2">
            {category.name}
            <Sparkles className="w-4 h-4 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
          <p className="text-sm text-zinc-300 line-clamp-2 mt-1 font-normal leading-relaxed">
            {category.description}
          </p>
        </div>

        <div className="pt-2">
          <button className="w-full py-3 px-4 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 group-hover:shadow-indigo-500/50 transition-all">
            <Play className="w-4 h-4 fill-current" />
            <span>Play Category</span>
          </button>
        </div>
      </div>
    </div>
  );
};
