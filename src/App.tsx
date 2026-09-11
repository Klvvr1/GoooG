import React, { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, initializeDatabase } from './db/db';
import { Character, Category, GameMode } from './types';
import { isDueForReview } from './db/srs';
import { Navbar } from './components/Navbar';
import { LobbyView } from './components/Lobby/LobbyView';
import { GalleryView } from './components/Gallery/GalleryView';
import { AnalyticsView } from './components/Analytics/AnalyticsView';
import { ScraperView } from './components/Scraper/ScraperView';
import { GameContainer } from './components/Game/GameContainer';

export function App() {
  const [currentTab, setCurrentTab] = useState<'lobby' | 'gallery' | 'analytics' | 'scraper'>('lobby');
  const [isDbReady, setIsDbReady] = useState(false);
  const [activeGame, setActiveGame] = useState<{
    category: Category;
    mode: GameMode;
    rounds: number;
    pool: Character[];
  } | null>(null);

  // Initialize database with default seed data
  useEffect(() => {
    initializeDatabase().then(() => {
      setIsDbReady(true);
    });
  }, []);

  // Live query for all characters in IndexedDB
  const characters = useLiveQuery(() => db.characters.toArray(), [], []) || [];

  const activeCharacters = characters.filter((c) => c.enabled);
  const dueCharacters = activeCharacters.filter((c) => isDueForReview(c.stats));

  const handleDataChanged = useCallback(() => {
    // Triggers reactive updates
  }, []);

  // Start a regular game
  const handleStartGame = (category: Category, mode: GameMode, rounds: number) => {
    const pool =
      category.id === 'mix'
        ? activeCharacters
        : activeCharacters.filter(
            (c) => c.category.toLowerCase() === category.id.toLowerCase()
          );

    if (pool.length < 2) {
      alert('You need at least 2 active characters to start a game.');
      return;
    }

    setActiveGame({
      category,
      mode,
      rounds: Math.min(rounds, pool.length),
      pool,
    });
  };

  // Start an SRS review game
  const handleStartSRSGame = (duePool: Character[]) => {
    if (duePool.length < 2) {
      alert('Need at least 2 due characters to play. Practicing with full active pool.');
      duePool = activeCharacters;
    }

    const srsCategory: Category = {
      id: 'srs-review',
      name: 'SRS Due Review',
      description: 'Reviewing characters scheduled for today',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      gradient: 'from-amber-600/30 via-orange-700/20 to-yellow-900/40',
    };

    setActiveGame({
      category: srsCategory,
      mode: 'classic',
      rounds: Math.min(10, duePool.length),
      pool: duePool,
    });
  };

  if (!isDbReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090b10] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-zinc-400 font-medium">Initializing GoooG Engine...</span>
        </div>
      </div>
    );
  }

  // When active game is playing
  if (activeGame) {
    return (
      <div className="min-h-screen bg-[#090b10] text-gray-100 flex flex-col">
        <GameContainer
          category={activeGame.category}
          mode={activeGame.mode}
          roundsCount={activeGame.rounds}
          initialPool={activeGame.pool}
          allCharacters={activeCharacters}
          onExit={() => setActiveGame(null)}
          onDataChanged={handleDataChanged}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090b10] text-gray-100 flex flex-col">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        activeCount={activeCharacters.length}
        dueCount={dueCharacters.length}
        onDataChanged={handleDataChanged}
      />

      <main className="flex-1">
        {currentTab === 'lobby' && (
          <LobbyView
            characters={characters}
            onStartGame={handleStartGame}
            onQuickSRS={() => handleStartSRSGame(dueCharacters)}
            dueCount={dueCharacters.length}
          />
        )}

        {currentTab === 'gallery' && (
          <GalleryView
            characters={characters}
            onDataChanged={handleDataChanged}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView
            characters={characters}
            onStartSRSGame={handleStartSRSGame}
          />
        )}

        {currentTab === 'scraper' && (
          <ScraperView onDataChanged={handleDataChanged} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950/60 py-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>GoooG • Character Guessing & Spaced Repetition Game</span>
          <span>Ready for Cloudflare Pages & GitHub</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
