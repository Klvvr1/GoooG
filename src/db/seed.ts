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

export const INITIAL_CHARACTERS: Character[] = [];

