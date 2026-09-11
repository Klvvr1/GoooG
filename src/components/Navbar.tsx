import React from 'react';
import { Gamepad2, Users, BarChart3, Globe, RotateCcw, Download, Upload } from 'lucide-react';
import { exportCharactersJSON, importCharactersJSON, resetDatabaseToDefaults } from '../db/db';

interface NavbarProps {
  currentTab: 'lobby' | 'gallery' | 'analytics' | 'scraper';
  setCurrentTab: (tab: 'lobby' | 'gallery' | 'analytics' | 'scraper') => void;
  activeCount: number;
  dueCount: number;
  onDataChanged: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  activeCount,
  dueCount,
  onDataChanged,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      const json = await exportCharactersJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gooog_characters_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Export failed: ' + String(e));
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const count = await importCharactersJSON(text);
      alert(`Successfully imported ${count} characters!`);
      onDataChanged();
    } catch (err) {
      alert('Failed to import JSON: ' + String(err));
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset all character data and progress to defaults?')) {
      await resetDatabaseToDefaults();
      onDataChanged();
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div
            onClick={() => setCurrentTab('lobby')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              G
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                  GoooG
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  SRS Engine
                </span>
              </div>
              <p className="text-xs text-zinc-400 hidden sm:block">Character Guessing Game</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setCurrentTab('lobby')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'lobby'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Play</span>
            </button>

            <button
              onClick={() => setCurrentTab('gallery')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'gallery'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Gallery</span>
              <span className="text-xs px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-300">
                {activeCount}
              </span>
            </button>

            <button
              onClick={() => setCurrentTab('analytics')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'analytics'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics & SRS</span>
              {dueCount > 0 && (
                <span className="text-xs px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold animate-pulse">
                  {dueCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('scraper')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'scraper'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Smart Scraper</span>
            </button>
          </nav>

          {/* Action Tools */}
          <div className="hidden md:flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Import JSON Backup"
              className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              onClick={handleExport}
              title="Export JSON Backup"
              className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              title="Reset to Defaults"
              className="p-2 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-900 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
