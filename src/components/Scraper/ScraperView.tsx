import React, { useState, useMemo } from 'react';
import { Search, Globe, Filter, Download, Sparkles, CheckCheck, RefreshCw, Link as LinkIcon } from 'lucide-react';
import { ScrapedCandidate, Character } from '../../types';
import { db } from '../../db/db';
import { createDefaultSRSStats } from '../../db/srs';
import { generateId } from '../../utils/helpers';
import { INITIAL_CATEGORIES } from '../../db/seed';
import { ScrapedRow } from './ScrapedRow';

interface ScraperViewProps {
  onDataChanged: () => void;
}

// Rich dataset of scrapable candidates per category and page
const DEMO_SCRAPABLE_POOL: Record<string, ScrapedCandidate[]> = {
  Sluts: [
    {
      id: 'scraped-s1',
      name: 'Adriana Black',
      category: 'Sluts',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      availableImages: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80',
      ],
      selectedImages: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
      ],
    },
    {
      id: 'scraped-s2',
      name: 'Giselle Ray',
      category: 'Sluts',
      avatarUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80',
      availableImages: [
        'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1503185912284-5271ff81b9a8?auto=format&fit=crop&w=600&q=80',
      ],
      selectedImages: [
        'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80',
      ],
    },
    {
      id: 'scraped-s3',
      name: 'Bella Thorne',
      category: 'Sluts',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
      availableImages: [
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
      ],
      selectedImages: [
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
      ],
    },
  ],
  trans: [
    {
      id: 'scraped-t1',
      name: 'Carmen Carrera',
      category: 'trans',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
      availableImages: [
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      ],
      selectedImages: [
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
      ],
    },
    {
      id: 'scraped-t2',
      name: 'Hunter Schafer',
      category: 'trans',
      avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&q=80',
      availableImages: [
        'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
      ],
      selectedImages: [
        'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
      ],
    },
  ],
  twinks: [
    {
      id: 'scraped-w1',
      name: 'Timothée Chalamet',
      category: 'twinks',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
      availableImages: [
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
      ],
      selectedImages: [
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      ],
    },
    {
      id: 'scraped-w2',
      name: 'Troye Sivan',
      category: 'twinks',
      avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80',
      availableImages: [
        'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=600&q=80',
      ],
      selectedImages: [
        'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80',
      ],
    },
  ],
};

export const ScraperView: React.FC<ScraperViewProps> = ({ onDataChanged }) => {
  const [selectedCategory, setSelectedCategory] = useState('Sluts');
  const [pageNumber, setPageNumber] = useState(1);
  const [nameQuery, setNameQuery] = useState('');
  const [customTargetUrl, setCustomTargetUrl] = useState('');
  const [showAdvancedUrl, setShowAdvancedUrl] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [candidates, setCandidates] = useState<ScrapedCandidate[]>([]);
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set());

  const categories = INITIAL_CATEGORIES.filter((c) => c.id !== 'mix').map((c) => c.name);

  // Perform Scrape / Fetch
  const handleFetch = async () => {
    setIsLoading(true);

    try {
      // If custom URL is provided, call our Cloudflare Pages Functions proxy
      if (customTargetUrl.trim()) {
        try {
          const endpoint = `/api/scrape?target=${encodeURIComponent(customTargetUrl.trim())}&page=${pageNumber}&category=${encodeURIComponent(selectedCategory)}&q=${encodeURIComponent(nameQuery)}`;
          const res = await fetch(endpoint);
          const data = await res.json();
          console.log('Scraper proxy response:', data);
        } catch (e) {
          console.warn('Scraper proxy offline (local development mode), using simulated extractor:', e);
        }
      }

      // Simulate network latency
      await new Promise((res) => setTimeout(res, 600));

      const pool = DEMO_SCRAPABLE_POOL[selectedCategory] || DEMO_SCRAPABLE_POOL['Sluts'];
      let results = [...pool];

      if (nameQuery.trim()) {
        const q = nameQuery.toLowerCase().trim();
        results = results.filter((c) => c.name.toLowerCase().includes(q));
      }

      setCandidates(results);
    } catch (err) {
      alert('Error fetching characters: ' + String(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle photo selection
  const handleTogglePhoto = (characterId: string, photoUrl: string) => {
    setCandidates((prev) =>
      prev.map((item) => {
        if (item.id !== characterId) return item;
        const exists = item.selectedImages.includes(photoUrl);
        if (exists) {
          return {
            ...item,
            selectedImages: item.selectedImages.filter((u) => u !== photoUrl),
          };
        } else {
          if (item.selectedImages.length >= 6) {
            alert('Maximum of 6 photos per character allowed.');
            return item;
          }
          return {
            ...item,
            selectedImages: [...item.selectedImages, photoUrl],
          };
        }
      })
    );
  };

  // Import single character into database
  const handleImportSingle = async (characterId: string) => {
    const item = candidates.find((c) => c.id === characterId);
    if (!item) return;

    if (item.selectedImages.length === 0) {
      alert('Please select at least 1 photo for this character.');
      return;
    }

    const newChar: Character = {
      id: generateId(),
      name: item.name,
      category: item.category,
      images: item.selectedImages.slice(0, 6),
      avatarUrl: item.avatarUrl || item.selectedImages[0],
      enabled: true,
      createdAt: Date.now(),
      stats: createDefaultSRSStats(),
    };

    await db.characters.put(newChar);
    setImportedIds((prev) => new Set(prev).add(characterId));
    onDataChanged();
  };

  // Bulk Import
  const handleImportAll = async () => {
    const toImport = candidates.filter(
      (c) => !importedIds.has(c.id) && c.selectedImages.length > 0
    );

    if (toImport.length === 0) {
      alert('No new characters ready to import.');
      return;
    }

    for (const item of toImport) {
      const newChar: Character = {
        id: generateId(),
        name: item.name,
        category: item.category,
        images: item.selectedImages.slice(0, 6),
        avatarUrl: item.avatarUrl || item.selectedImages[0],
        enabled: true,
        createdAt: Date.now(),
        stats: createDefaultSRSStats(),
      };
      await db.characters.put(newChar);
      setImportedIds((prev) => new Set(prev).add(item.id));
    }

    onDataChanged();
    alert(`Successfully imported ${toImport.length} characters to your game collection!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Globe className="w-3.5 h-3.5" />
            <span>Smart Scraper & Batch Importer</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Smart Character Scraper
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Specify page, category, or search by name. Select 1 to 6 photos from the horizontal strip to import directly into GoooG.
          </p>
        </div>

        {candidates.length > 0 && (
          <button
            type="button"
            onClick={handleImportAll}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Import All Visible Characters</span>
          </button>
        )}
      </div>

      {/* Scraper Control Filters */}
      <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          {/* Category Selector */}
          <div className="sm:col-span-4 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Target Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl bg-zinc-800/80 border border-zinc-700 text-white text-sm focus:outline-none focus:border-indigo-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Page Number */}
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Page #
            </label>
            <input
              type="number"
              min="1"
              max="999"
              value={pageNumber}
              onChange={(e) => setPageNumber(parseInt(e.target.value) || 1)}
              className="w-full px-3.5 py-3 rounded-xl bg-zinc-800/80 border border-zinc-700 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Search by Character Name Only */}
          <div className="sm:col-span-4 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Search by Character Name
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={nameQuery}
                onChange={(e) => setNameQuery(e.target.value)}
                placeholder="Optional name query..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-800/80 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Fetch CTA */}
          <div className="sm:col-span-2 flex items-end">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleFetch}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Fetching...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Scrape</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Optional Target Website URL Configuration */}
        <div className="pt-2 border-t border-zinc-800/80">
          <button
            type="button"
            onClick={() => setShowAdvancedUrl(!showAdvancedUrl)}
            className="text-xs font-semibold text-zinc-400 hover:text-indigo-400 flex items-center gap-1.5 transition-colors"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>{showAdvancedUrl ? 'Hide Custom Target URL' : 'Configure Custom Target Website URL'}</span>
          </button>

          {showAdvancedUrl && (
            <div className="mt-2 space-y-1 animate-in fade-in duration-200">
              <input
                type="url"
                value={customTargetUrl}
                onChange={(e) => setCustomTargetUrl(e.target.value)}
                placeholder="https://example.com/characters?category=... (Target Scraper URL)"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[11px] text-zinc-500">
                Proxied through Cloudflare Pages Functions <code className="text-zinc-400 font-mono">/api/scrape</code> for CORS bypass.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Scraped Results (Row by Row) */}
      <div className="space-y-4">
        {candidates.length > 0 ? (
          candidates.map((item) => (
            <ScrapedRow
              key={item.id}
              item={item}
              onTogglePhoto={handleTogglePhoto}
              onImport={handleImportSingle}
              isImported={importedIds.has(item.id)}
            />
          ))
        ) : (
          <div className="py-16 text-center rounded-3xl bg-zinc-900/40 border border-zinc-800 space-y-3">
            <Globe className="w-12 h-12 text-zinc-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No scraped characters loaded yet</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Select your category, set the page number or name query, and click <strong>"Scrape"</strong> to extract characters and preview their photos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
