import { Character } from '../types';
import { createDefaultSRSStats } from './srs';

export const INITIAL_CATEGORIES = [
  {
    id: 'sluts',
    name: 'Sluts',
    description: 'Glamorous, bold, and expressive characters',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    gradient: 'from-rose-600/30 via-pink-700/20 to-purple-900/40',
  },
  {
    id: 'trans',
    name: 'Trans',
    description: 'Stunning transgender and non-binary icons',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    gradient: 'from-cyan-600/30 via-sky-700/20 to-indigo-900/40',
  },
  {
    id: 'twinks',
    name: 'Twinks',
    description: 'Youthful, slender, and aesthetic personalities',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    gradient: 'from-amber-600/30 via-orange-700/20 to-yellow-900/40',
  },
  {
    id: 'mix',
    name: 'Mix All',
    description: 'A dynamic random shuffle across all active categories',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    gradient: 'from-purple-600/30 via-violet-700/20 to-fuchsia-900/40',
  },
];

export const INITIAL_CHARACTERS: Character[] = [
  // Category: Sluts
  {
    id: 'char-s1',
    name: 'Scarlett Monroe',
    category: 'Sluts',
    images: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
    ],
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    enabled: true,
    createdAt: Date.now() - 86400000 * 5,
    stats: createDefaultSRSStats(),
  },
  {
    id: 'char-s2',
    name: 'Ruby Valentine',
    category: 'Sluts',
    images: [
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
    ],
    avatarUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80',
    enabled: true,
    createdAt: Date.now() - 86400000 * 4,
    stats: createDefaultSRSStats(),
  },
  {
    id: 'char-s3',
    name: 'Amber Fox',
    category: 'Sluts',
    images: [
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1503185912284-5271ff81b9a8?auto=format&fit=crop&w=600&q=80',
    ],
    avatarUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80',
    enabled: true,
    createdAt: Date.now() - 86400000 * 3,
    stats: createDefaultSRSStats(),
  },
  {
    id: 'char-s4',
    name: 'Chloe Vane',
    category: 'Sluts',
    images: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    ],
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    enabled: true,
    createdAt: Date.now() - 86400000 * 2,
    stats: createDefaultSRSStats(),
  },

  // Category: Trans
  {
    id: 'char-t1',
    name: 'Nikita Rivera',
    category: 'trans',
    images: [
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80',
    ],
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    enabled: true,
    createdAt: Date.now() - 86400000 * 5,
    stats: createDefaultSRSStats(),
  },
  {
    id: 'char-t2',
    name: 'Jordan Chen',
    category: 'trans',
    images: [
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    ],
    avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&q=80',
    enabled: true,
    createdAt: Date.now() - 86400000 * 4,
    stats: createDefaultSRSStats(),
  },
  {
    id: 'char-t3',
    name: 'Maya Sinclair',
    category: 'trans',
    images: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    ],
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
    enabled: true,
    createdAt: Date.now() - 86400000 * 3,
    stats: createDefaultSRSStats(),
  },
  {
    id: 'char-t4',
    name: 'Harper Nova',
    category: 'trans',
    images: [
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80',
    ],
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
    enabled: true,
    createdAt: Date.now() - 86400000 * 2,
    stats: createDefaultSRSStats(),
  },

  // Category: Twinks
  {
    id: 'char-w1',
    name: 'Felix Laurent',
    category: 'twinks',
    images: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    ],
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
    enabled: true,
    createdAt: Date.now() - 86400000 * 5,
    stats: createDefaultSRSStats(),
  },
  {
    id: 'char-w2',
    name: 'Milo Vance',
    category: 'twinks',
    images: [
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=600&q=80',
    ],
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80',
    enabled: true,
    createdAt: Date.now() - 86400000 * 4,
    stats: createDefaultSRSStats(),
  },
  {
    id: 'char-w3',
    name: 'Leo Sterling',
    category: 'twinks',
    images: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
    ],
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    enabled: true,
    createdAt: Date.now() - 86400000 * 3,
    stats: createDefaultSRSStats(),
  },
  {
    id: 'char-w4',
    name: 'Asher Grey',
    category: 'twinks',
    images: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
    ],
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
    enabled: true,
    createdAt: Date.now() - 86400000 * 2,
    stats: createDefaultSRSStats(),
  },
];
