import {
  ArrowLeftRight,
  Gauge,
  GitBranch,
  Hash,
  Layers,
  LayoutGrid,
  Link,
  Network,
  Repeat,
  Search,
  Table,
  Triangle,
  Trophy,
  Type,
} from 'lucide-react';

/** One icon per phase — keyed by phase id so reordering data can't desync it. */
export const PHASE_ICONS = {
  p0: Gauge,
  p1: LayoutGrid,
  p2: Type,
  p3: ArrowLeftRight,
  p4: Search,
  p5: Hash,
  p6: Repeat,
  p7: Link,
  p8: Layers,
  p9: GitBranch,
  p10: Triangle,
  p11: Network,
  p12: Table,
  p13: Trophy,
};

const HUES = [
  'var(--hue-1)',
  'var(--hue-2)',
  'var(--hue-3)',
  'var(--hue-4)',
  'var(--hue-5)',
  'var(--hue-6)',
  'var(--hue-7)',
  'var(--hue-8)',
];

/** Hue follows the phase's position in the roadmap, so a phase keeps its
 *  colour no matter which subset is being rendered. */
export function hueFor(index) {
  return HUES[index % HUES.length];
}

/** Difficulty is the spine of this dashboard — one place defines its
 *  label, colour and whether it counts toward the "problems solved" total. */
export const DIFFICULTY = {
  concept: { label: 'Concept', short: 'C', color: 'var(--hue-2)', counts: false },
  easy: { label: 'Easy', short: 'E', color: 'var(--success)', counts: true },
  medium: { label: 'Medium', short: 'M', color: 'var(--warn)', counts: true },
  hard: { label: 'Hard', short: 'H', color: 'var(--danger)', counts: true },
};

export const SOLVABLE = ['easy', 'medium', 'hard'];
