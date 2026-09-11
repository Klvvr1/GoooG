import React, { useState } from 'react';
import { Character, Category, GameMode } from '../../types';
import { INITIAL_CATEGORIES } from '../../db/seed';
import { CategoryCard } from './CategoryCard';
import { GameSetupModal } from './GameSetupModal';

interface LobbyViewProps {
  characters: Character[];
  onStartGame: (category: Category, mode: GameMode, rounds: number) => void;
  onQuickSRS: () => void;
  dueCount: number;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  characters,
  onStartGame,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Group characters by category
  const getCategoryCharacters = (catId: string): Character[] => {
    if (catId === 'mix') {
      return characters;
    }
    return characters.filter(
      (c) => c.category.toLowerCase() === catId.toLowerCase()
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 min-h-[calc(100vh-5rem)] flex items-center justify-center">
      {/* 4 Cards Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {INITIAL_CATEGORIES.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            characters={getCategoryCharacters(category.id)}
            onSelect={(cat) => setSelectedCategory(cat)}
          />
        ))}
      </div>

      {/* Game Setup Modal */}
      {selectedCategory && (
        <GameSetupModal
          category={selectedCategory}
          characters={getCategoryCharacters(selectedCategory.id)}
          onClose={() => setSelectedCategory(null)}
          onStart={(cat, mode, rounds) => {
            setSelectedCategory(null);
            onStartGame(cat, mode, rounds);
          }}
        />
      )}
    </div>
  );
};

