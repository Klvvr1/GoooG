import React, { useState } from 'react';
import { Search, Globe, Download, Sparkles, RefreshCw, Link as LinkIcon, Images, Loader2, ExternalLink } from 'lucide-react';
import { ScrapedCandidate, Character } from '../../types';
import { db } from '../../db/db';
import { createDefaultSRSStats } from '../../db/srs';
import { generateId, isAvatarMatch } from '../../utils/helpers';
import { INITIAL_CATEGORIES } from '../../db/seed';
import { ScrapedRow } from './ScrapedRow';

interface ScraperViewProps {
  onDataChanged: () => void;
}

export const ScraperView: React.FC<ScraperViewProps> = ({ onDataChanged }) => {
  const [selectedCategory, setSelectedCategory] = useState('Sluts');
  const [pageNumber, setPageNumber] = useState(1);
  const [nameQuery, setNameQuery] = useState('');
  const [customTargetUrl, setCustomTargetUrl] = useState('');
  const [showAdvancedUrl, setShowAdvancedUrl] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSourceUrl, setActiveSourceUrl] = useState<string>('');
  const [candidates, setCandidates] = useState<ScrapedCandidate[]>([]);
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set());

  const categories = INITIAL_CATEGORIES.filter((c) => c.id !== 'mix').map((c) => c.name);

  // Lazy load photos for a single character on demand / viewport intersection
  const handleLazyLoadPhotos = React.useCallback(async (characterId: string, profileUrl: string, avatarUrl?: string) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === characterId ? { ...c, isLoadingPhotos: true } : c))
    );

    try {
      let endpoint = `/api/scrape?profileUrl=${encodeURIComponent(profileUrl)}`;
      if (avatarUrl) {
        endpoint += `&avatarUrl=${encodeURIComponent(avatarUrl)}`;
      }

      const res = await fetch(endpoint);
      const data = await res.json();

      if (data.success && Array.isArray(data.images)) {
        setCandidates((prev) =>
          prev.map((item) => {
            if (item.id !== characterId) return item;

            // Update avatar to proxied URL if server returned one
            const finalAvatar = data.avatarUrl || item.avatarUrl;

            // Merge existing gallery images with newly loaded ones
            // Exclude any avatar matches
            const merged = Array.from(new Set([...item.availableImages, ...data.images]))
              .filter((img) => !isAvatarMatch(img, finalAvatar));

            // Auto-select up to 3 gallery photos if none chosen yet or only initial thumb was selected
            const currentGallerySelected = item.selectedImages.filter(
              (img) => !isAvatarMatch(img, finalAvatar)
            );
            const autoSelected =
              currentGallerySelected.length <= 1
                ? merged.slice(0, Math.min(3, merged.length))
                : currentGallerySelected;

            return {
              ...item,
              avatarUrl: finalAvatar,
              availableImages: merged,
              selectedImages: autoSelected,
              isLoadingPhotos: false,
              hasLoadedPhotos: true,
            };
          })
        );
      } else {
        setCandidates((prev) =>
          prev.map((c) => (c.id === characterId ? { ...c, isLoadingPhotos: false, hasLoadedPhotos: true } : c))
        );
      }
    } catch (e) {
      console.error('Error lazy loading gallery photos:', e);
      setCandidates((prev) =>
        prev.map((c) => (c.id === characterId ? { ...c, isLoadingPhotos: false, hasLoadedPhotos: true } : c))
      );
    }
  }, []);

  // Perform Scrape / Fetch for all characters on page
  const handleFetch = async () => {
    setIsLoading(true);

    try {
      let endpoint = `/api/scrape?category=${encodeURIComponent(selectedCategory)}&page=${pageNumber}`;
      if (customTargetUrl.trim()) {
        endpoint += `&target=${encodeURIComponent(customTargetUrl.trim())}`;
      }

      const res = await fetch(endpoint);
      const data = await res.json();

      if (data.success && Array.isArray(data.candidates)) {
        let results: ScrapedCandidate[] = data.candidates.map((c: ScrapedCandidate) => ({
          ...c,
          isLoadingPhotos: false,
          hasLoadedPhotos: false,
        }));
        setActiveSourceUrl(data.sourceUrl || '');

        if (nameQuery.trim()) {
          const q = nameQuery.toLowerCase().trim();
          results = results.filter((c) => c.name.toLowerCase().includes(q));
        }

        setCandidates(results);

        // Preload gallery photos for the first 6 characters immediately for instant UX
        const topChars = results.slice(0, 6).filter((c) => c.profileUrl);
        topChars.forEach((c) => {
          handleLazyLoadPhotos(c.id, c.profileUrl!, c.avatarUrl);
        });
      } else {
        throw new Error(data.error || 'Failed to parse characters from source');
      }
    } catch (err) {
      console.error('Scraping error:', err);
      alert('Failed to scrape: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle photo selection
  const handleTogglePhoto = (characterId: string, photoUrl: string) => {
    setCandidates((prev) =>
      prev.map((item) => {
        if (item.id !== characterId) return item;
        // Never allow toggling the avatar into gallery photos
        if (isAvatarMatch(photoUrl, item.avatarUrl)) return item;

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

    // Filter out avatarUrl from character gallery images
    const galleryImages = item.selectedImages
      .filter((u) => !isAvatarMatch(u, item.avatarUrl))
      .slice(0, 6);

    if (galleryImages.length === 0) {
      alert('Please select at least 1 gallery photo for this character.');
      return;
    }

    const newChar: Character = {
      id: generateId(),
      name: item.name,
      category: item.category,
      images: galleryImages, // Strictly gallery photos - avatar is not added here!
      avatarUrl: item.avatarUrl, // Profile avatar (proxied through /api/avatar)
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
    const toImport = candidates.filter((c) => {
      if (importedIds.has(c.id)) return false;
      const validPhotos = c.selectedImages.filter((u) => !isAvatarMatch(u, c.avatarUrl));
      return validPhotos.length > 0;
    });

    if (toImport.length === 0) {
      alert('No new characters ready to import. Please ensure gallery photos are selected.');
      return;
    }

    for (const item of toImport) {
      const galleryImages = item.selectedImages
        .filter((u) => !isAvatarMatch(u, item.avatarUrl))
        .slice(0, 6);

      const newChar: Character = {
        id: generateId(),
        name: item.name,
        category: item.category,
        images: galleryImages, // Strictly gallery photos - avatar is not added here!
        avatarUrl: item.avatarUrl,
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Globe className="w-3.5 h-3.5" />
            <span>Smart Scraper & Lazy-Loading Importer</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Smart Character Scraper
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            Browse and scrape characters from PornPics. Photos are lazy-loaded smoothly on scroll for optimal performance.
          </p>
          {activeSourceUrl && (
            <div className="mt-2 flex items-center gap-2 text-xs text-amber-300">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Source:</span>
              <a
                href={activeSourceUrl}
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-amber-200 font-mono"
              >
                {activeSourceUrl}
              </a>
            </div>
          )}
        </div>

        {candidates.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleImportAll}
              className="px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-xl shadow-amber-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Import All Visible ({candidates.length})</span>
            </button>
          </div>
        )}
      </div>


      {/* Scraper Control Filters */}
      <div className="p-6 rounded-3xl bg-stone-900/90 border border-stone-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          {/* Category Selector */}
          <div className="sm:col-span-4 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-300">
              Target Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl bg-stone-800/80 border border-stone-700 text-white text-sm focus:outline-none focus:border-amber-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat} {cat === 'Sluts' ? '(Female)' : cat === 'Trans' ? '(Shemale)' : '(Gay/Twink)'}
                </option>
              ))}
            </select>
          </div>

          {/* Page Number */}
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-300">
              Page #
            </label>
            <input
              type="number"
              min="1"
              max="999"
              value={pageNumber}
              onChange={(e) => setPageNumber(parseInt(e.target.value) || 1)}
              className="w-full px-3.5 py-3 rounded-xl bg-stone-800/80 border border-stone-700 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Search by Character Name Only */}
          <div className="sm:col-span-4 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-300">
              Filter by Name
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={nameQuery}
                onChange={(e) => setNameQuery(e.target.value)}
                placeholder="Optional filter query..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-800/80 border border-stone-700 text-white placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Fetch CTA */}
          <div className="sm:col-span-2 flex items-end">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleFetch}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 transition-all"
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
        <div className="pt-2 border-t border-stone-800/80">
          <button
            type="button"
            onClick={() => setShowAdvancedUrl(!showAdvancedUrl)}
            className="text-xs font-semibold text-stone-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors"
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
                placeholder="https://www.pornpics.com/pornstars/..."
                className="w-full px-3.5 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white text-xs placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
              <p className="text-[11px] text-stone-500">
                Proxied through Cloudflare Pages Functions <code className="text-stone-400 font-mono">/api/scrape</code> for CORS bypass.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Scraped Results (Row by Row) */}
      <div className="space-y-6">
        {candidates.length > 0 ? (
          candidates.map((item) => (
            <ScrapedRow
              key={item.id}
              item={item}
              onTogglePhoto={handleTogglePhoto}
              onImport={handleImportSingle}
              onLazyLoadPhotos={handleLazyLoadPhotos}
              isImported={importedIds.has(item.id)}
            />
          ))
        ) : (
          <div className="py-16 text-center rounded-3xl bg-stone-900/40 border border-stone-800 space-y-3">
            <Globe className="w-12 h-12 text-stone-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No scraped characters loaded yet</h3>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              Select your category (Sluts, Trans, or Twinks), choose page number, and click <strong>"Scrape"</strong> to fetch characters directly from PornPics.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

