import {
  ArrowLeftRight,
  Binary,
  Braces,
  Brain,
  Building2,
  Gauge,
  GitBranch,
  Hash,
  Layers,
  Link,
  ListOrdered,
  Network,
  Repeat,
  Rows3,
  Search,
  Shuffle,
  Sigma,
  Split,
  Table,
  Target,
  TreeDeciduous,
  Trophy,
  Type,
  Undo2,
} from 'lucide-react';

/**
 * The 24 topics, in teaching order. `stage` is the journey stage a topic
 * belongs to; `unlockAfter` is the topic that must be mastered first.
 */
export const TOPICS = [
  { id: 'logic', name: 'Programming & Logic Building', short: 'Logic', stage: 'logic-builder', icon: Brain, hue: 1 },
  { id: 'complexity', name: 'Time & Space Complexity', short: 'Complexity', stage: 'foundation', icon: Gauge, hue: 2 },
  { id: 'arrays', name: 'Arrays', short: 'Arrays', stage: 'foundation', icon: Rows3, hue: 3 },
  { id: 'strings', name: 'Strings', short: 'Strings', stage: 'foundation', icon: Type, hue: 4 },
  { id: 'hashing', name: 'Hashing', short: 'Hashing', stage: 'foundation', icon: Hash, hue: 5 },
  { id: 'two-pointers', name: 'Two Pointers', short: 'Two Ptr', stage: 'problem-solver', icon: ArrowLeftRight, hue: 6 },
  { id: 'sliding-window', name: 'Sliding Window', short: 'Window', stage: 'problem-solver', icon: Split, hue: 7 },
  { id: 'prefix-sum', name: 'Prefix Sum', short: 'Prefix', stage: 'problem-solver', icon: Sigma, hue: 8 },
  { id: 'binary-search', name: 'Binary Search', short: 'Bin Search', stage: 'problem-solver', icon: Search, hue: 1 },
  { id: 'linked-lists', name: 'Linked Lists', short: 'Lists', stage: 'pattern-master', icon: Link, hue: 2 },
  { id: 'stacks', name: 'Stacks', short: 'Stacks', stage: 'pattern-master', icon: Layers, hue: 3 },
  { id: 'queues', name: 'Queues', short: 'Queues', stage: 'pattern-master', icon: ListOrdered, hue: 4 },
  { id: 'recursion', name: 'Recursion', short: 'Recursion', stage: 'pattern-master', icon: Repeat, hue: 5 },
  { id: 'backtracking', name: 'Backtracking', short: 'Backtrack', stage: 'intermediate', icon: Undo2, hue: 6 },
  { id: 'trees', name: 'Trees', short: 'Trees', stage: 'intermediate', icon: TreeDeciduous, hue: 7 },
  { id: 'bst', name: 'Binary Search Trees', short: 'BST', stage: 'intermediate', icon: GitBranch, hue: 8 },
  { id: 'heaps', name: 'Heaps / Priority Queues', short: 'Heaps', stage: 'intermediate', icon: Binary, hue: 1 },
  { id: 'greedy', name: 'Greedy Algorithms', short: 'Greedy', stage: 'advanced', icon: Target, hue: 2 },
  { id: 'graphs', name: 'Graphs', short: 'Graphs', stage: 'advanced', icon: Network, hue: 3 },
  { id: 'dp', name: 'Dynamic Programming', short: 'DP', stage: 'advanced', icon: Table, hue: 4 },
  { id: 'advanced-ds', name: 'Advanced Data Structures', short: 'Adv DS', stage: 'advanced', icon: Braces, hue: 5 },
  { id: 'advanced-algos', name: 'Advanced Algorithms', short: 'Adv Algo', stage: 'interview-ready', icon: Shuffle, hue: 6 },
  { id: 'mixed', name: 'Mixed Interview Problems', short: 'Mixed', stage: 'interview-ready', icon: Building2, hue: 7 },
  { id: 'faang', name: 'FAANG / MAANG Interview Prep', short: 'FAANG', stage: 'faang-ready', icon: Trophy, hue: 8 },
];

export const TOPIC_IDS = TOPICS.map((t) => t.id);

export const TOPIC_BY_ID = Object.fromEntries(TOPICS.map((t) => [t.id, t]));

export function topicIndex(id) {
  return TOPIC_IDS.indexOf(id);
}

export function hueVar(n) {
  return `var(--hue-${n})`;
}

/** A topic counts as "completed" at 70% solved with the easies cleared. */
export const MASTERY_THRESHOLD = 0.7;

/** Topics unlock in order: the previous one must hit the mastery threshold. */
export const UNLOCK_THRESHOLD = 0.6;
