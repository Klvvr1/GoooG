import React, { useState, useMemo } from 'react';
import { Search, Plus, Filter, ArrowUpDown, Users, CheckSquare, Square } from 'lucide-react';
import { Character } from '../../types';
import { db } from '../../db/db';
import { CharacterCard } from './CharacterCard';
import { CharacterFormModal } from './CharacterFormModal';

interface GalleryViewProps {
  characters: Character[];
  onDataChanged: () => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  characters,
  onDataChanged,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'acc-low' | 'acc-high' | 'seen' | 'recent'>('name');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);

  // Derive all unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    characters.forEach((c) => {
      if (c.category) cats.add(c.category);
    });
    return Array.from(cats);
  }, [characters]);

  // Filter and sort
  const filteredCharacters = useMemo(() => {
    return characters
      .filter((c) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = c.name.toLowerCase().includes(q);
          const matchCat = c.category.toLowerCase().includes(q);
          if (!matchName && !matchCat) return false;
        }
        // Category filter
        if (selectedCategory !== 'all') {
          if (c.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
        }
        // Active filter
        if (activeFilter === 'active' && !c.enabled) return false;
        if (activeFilter === 'inactive' && c.enabled) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'recent') return b.createdAt - a.createdAt;
        if (sortBy === 'seen') return (b.stats.timesSeen || 0) - (a.stats.timesSeen || 0);
        
        const accA = a.stats.timesSeen > 0 ? (a.stats.timesCorrect / a.stats.timesSeen) * 100 : 0;
        const accB = b.stats.timesSeen > 0 ? (b.stats.timesCorrect / b.stats.timesSeen) * 100 : 0;
        if (sortBy === 'acc-low') return accA - accB;
        if (sortBy === 'acc-high') return accB - accA;
        return 0;
      });
  }, [characters, searchQuery, selectedCategory, activeFilter, sortBy]);

  // Toggle single active state
  const handleToggleActive = async (id: string, active: boolean) => {
    await db.characters.update(id, { enabled: active });
    onDataChanged();
  };

  // Delete character
  const handleDelete = async (id: string) => {
    await db.characters.delete(id);
    onDataChanged();
  };

  // Save character
  const handleSave = async (character: Character) => {
    await db.characters.put(character);
    onDataChanged();
  };

  // Bulk enable/disable
  const handleBulkToggle = async (enable: boolean) => {
    const ids = filteredCharacters.map((c) => c.id);
    await Promise.all(ids.map((id) => db.characters.update(id, { enabled: enable })));
    onDataChanged();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Character Gallery</span>
            <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {characters.length} Total
            </span>
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            Manage, customize photos (1-6 per character), and toggle game eligibility.
          </p>
        </div>

        {/* Add Character CTA */}
        <button
          onClick={() => {
            setEditingCharacter(null);
            setIsModalOpen(true);
          }}
          className="px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-xl shadow-amber-600/30 flex items-center justify-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Character</span>
        </button>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or category..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-800/80 border border-stone-700 text-white placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Active Status Filter */}
          <div className="md:col-span-3">
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800/80 border border-stone-700 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
            >
              <option value="all">All Statuses (Active & Inactive)</option>
              <option value="active">Active Only in Game</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-4 flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-stone-400 flex-shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'acc-low' | 'acc-high' | 'seen' | 'recent')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800/80 border border-stone-700 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
            >
              <option value="name">Alphabetical (A - Z)</option>
              <option value="acc-low">Accuracy: Hardest First</option>
              <option value="acc-high">Accuracy: Easiest First</option>
              <option value="seen">Most Practiced</option>
              <option value="recent">Recently Added</option>
            </select>
          </div>
        </div>

        {/* Category Pills & Bulk Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-800/80">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-800 text-stone-400 hover:text-white'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? 'bg-amber-600 text-white'
                    : 'bg-stone-800 text-stone-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Bulk Toggle Buttons */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => handleBulkToggle(true)}
              className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
            >
              Enable All Filtered
            </button>
            <button
              onClick={() => handleBulkToggle(false)}
              className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
            >
              Disable All Filtered
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Characters */}
      {filteredCharacters.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCharacters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              onToggleActive={handleToggleActive}
              onEdit={(char) => {
                setEditingCharacter(char);
                setIsModalOpen(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-3xl bg-stone-900/50 border border-stone-800/80 space-y-3">
          <Users className="w-12 h-12 text-stone-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No characters match your criteria</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            Try adjusting your search query, changing category filters, or click "Add New Character" to create one.
          </p>
        </div>
      )}

      {/* Add / Edit Character Modal */}
      {isModalOpen && (
        <CharacterFormModal
          initialCharacter={editingCharacter}
          existingCategories={categories}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCharacter(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
};
