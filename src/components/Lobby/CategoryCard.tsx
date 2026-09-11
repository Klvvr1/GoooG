import React, { useMemo } from 'react';
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
    const allPhotos: string[] = [];
    characters.forEach((char) => {
      if (char.images && char.images.length > 0) {
        allPhotos.push(...char.images);
      }
    });
    if (allPhotos.length === 0) return null;
    return allPhotos[Math.floor(Math.random() * allPhotos.length)];
  }, [characters]);

  return (
    <div
      onClick={() => onSelect(category)}
      className="group relative flex flex-col justify-end overflow-hidden rounded-3xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-600 transition-all duration-300 hover:shadow-2xl hover:shadow-black/60 hover:-translate-y-1.5 cursor-pointer select-none h-[420px]"
    >
      {/* Background Image with Subtle Gradient */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {randomPhoto ? (
          <img
            src={randomPhoto}
            alt={category.name}
            className="w-full h-full object-cover object-center transform scale-100 group-hover:scale-105 transition-transform duration-700 ease-out brightness-[0.72] group-hover:brightness-[0.85]"
            loading="lazy"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${category.gradient} opacity-40`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />
      </div>

      {/* Bottom Area: ONLY category name (slim/thin) & character count */}
      <div className="relative z-10 p-6 flex items-baseline justify-between bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent">
        <h3 className="text-2xl font-extralight tracking-widest text-zinc-100 group-hover:text-white transition-colors">
          {category.name}
        </h3>
        <span className="text-sm font-light text-zinc-400 tracking-wider">
          {characters.length} {characters.length === 1 ? 'character' : 'characters'}
        </span>
      </div>
    </div>
  );
};

