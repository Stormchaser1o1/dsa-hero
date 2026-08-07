import {
  Award,
  BookOpenCheck,
  BrainCircuit,
  CalendarCheck,
  Crown,
  Droplet,
  Flame,
  Gem,
  Medal,
  Mountain,
  Rocket,
  ShieldCheck,
  Sparkles,
  Sunrise,
  Target,
  Timer,
  TrendingUp,
  Zap,
} from 'lucide-react';

/**
 * Every badge is a pure predicate over the derived stats object, so the
 * achievement list can be re-evaluated from scratch at any time.
 */
export const ACHIEVEMENTS = [
  { id: 'first-blood', name: 'First Blood', desc: 'Solve your first problem', icon: Droplet, hue: 'var(--danger)', xp: 25, test: (s) => s.solved >= 1 },
  { id: 'getting-going', name: 'Keep Going', desc: 'Solve 10 problems', icon: Target, hue: 'var(--success)', xp: 50, test: (s) => s.solved >= 10 },
  { id: 'half-century', name: 'Half Century', desc: 'Solve 50 problems', icon: Medal, hue: 'var(--hue-2)', xp: 150, test: (s) => s.solved >= 50 },
  { id: 'century', name: 'Century', desc: 'Solve 100 problems', icon: Crown, hue: 'var(--hue-8)', xp: 300, test: (s) => s.solved >= 100 },
  { id: 'double-century', name: 'Double Century', desc: 'Solve 200 problems', icon: Gem, hue: 'var(--accent)', xp: 600, test: (s) => s.solved >= 200 },

  { id: 'consistency', name: 'Consistency', desc: 'Hold a 3-day streak', icon: Zap, hue: 'var(--streak)', xp: 40, test: (s) => s.bestStreak >= 3 },
  { id: 'week-warrior', name: 'Week Warrior', desc: 'Hold a 7-day streak', icon: Flame, hue: 'var(--streak)', xp: 100, test: (s) => s.bestStreak >= 7 },
  { id: 'month-machine', name: 'Month Machine', desc: 'Hold a 30-day streak', icon: CalendarCheck, hue: 'var(--warn)', xp: 400, test: (s) => s.bestStreak >= 30 },

  { id: 'first-medium', name: 'Level Up', desc: 'Solve your first medium', icon: TrendingUp, hue: 'var(--warn)', xp: 60, test: (s) => s.byDifficulty.medium.solved >= 1 },
  { id: 'first-hard', name: 'Into the Deep', desc: 'Solve your first hard', icon: Mountain, hue: 'var(--danger)', xp: 120, test: (s) => s.byDifficulty.hard.solved >= 1 },
  { id: 'medium-30', name: 'Medium Grinder', desc: 'Solve 30 mediums', icon: Award, hue: 'var(--warn)', xp: 200, test: (s) => s.byDifficulty.medium.solved >= 30 },
  { id: 'hard-10', name: 'Hard Mode', desc: 'Solve 10 hards', icon: ShieldCheck, hue: 'var(--danger)', xp: 350, test: (s) => s.byDifficulty.hard.solved >= 10 },

  { id: 'topic-1', name: 'Topic Cleared', desc: 'Complete your first topic', icon: BookOpenCheck, hue: 'var(--hue-3)', xp: 80, test: (s) => s.topicsCompleted >= 1 },
  { id: 'topic-5', name: 'Five Down', desc: 'Complete 5 topics', icon: Sparkles, hue: 'var(--hue-3)', xp: 200, test: (s) => s.topicsCompleted >= 5 },
  { id: 'pattern-5', name: 'Pattern Spotter', desc: 'Reach 60% mastery on 5 patterns', icon: BrainCircuit, hue: 'var(--hue-7)', xp: 220, test: (s) => s.masteredPatterns >= 5 },

  { id: 'no-hints-10', name: 'Unassisted', desc: 'Solve 10 problems with no hints', icon: Sunrise, hue: 'var(--hue-4)', xp: 150, test: (s) => s.independentSolves >= 10 },
  { id: 'speed', name: 'Quick Draw', desc: 'Solve an easy in under 8 minutes', icon: Timer, hue: 'var(--hue-2)', xp: 60, test: (s) => s.fastestEasy != null && s.fastestEasy <= 8 },
  { id: 'accuracy-75', name: 'Sharp Shooter', desc: 'Hold 75% accuracy over 30+ attempts', icon: Target, hue: 'var(--success)', xp: 180, test: (s) => s.attempted >= 30 && s.accuracy >= 75 },
  { id: 'weekend-4', name: 'Weekend Warrior', desc: 'Complete a full 4-problem weekend', icon: Rocket, hue: 'var(--accent)', xp: 90, test: (s) => s.weekendsCleared >= 1 },
  { id: 'interview-ready', name: 'Interview Ready', desc: 'Reach an interview readiness score of 70', icon: Crown, hue: 'var(--hue-8)', xp: 500, test: (s) => s.readiness.score >= 70 },
];

export const ACHIEVEMENT_BY_ID = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));

export function evaluateAchievements(stats) {
  return ACHIEVEMENTS.map((a) => ({ ...a, unlocked: Boolean(a.test(stats)) }));
}
