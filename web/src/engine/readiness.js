/**
 * Interview readiness is deliberately NOT "problems solved".
 * It is a weighted blend of coverage, difficulty, independence, consistency
 * and speed — the things that actually decide a real loop.
 */
export const READINESS_BANDS = [
  { id: 'not-ready', label: 'Not Ready', min: 0, hue: 'var(--danger)' },
  { id: 'foundation', label: 'Building Foundation', min: 20, hue: 'var(--streak)' },
  { id: 'developing', label: 'Developing', min: 40, hue: 'var(--warn)' },
  { id: 'capable', label: 'Interview Capable', min: 58, hue: 'var(--hue-2)' },
  { id: 'strong', label: 'Strong', min: 74, hue: 'var(--hue-3)' },
  { id: 'faang', label: 'FAANG / MAANG Ready', min: 88, hue: 'var(--success)' },
];

export function bandFor(score) {
  let band = READINESS_BANDS[0];
  for (const b of READINESS_BANDS) if (score >= b.min) band = b;
  return band;
}

const clamp01 = (x) => Math.max(0, Math.min(1, x));

/**
 * @returns {{score:number, band:object, factors:Array}}
 */
export function computeReadiness(input) {
  const {
    topicsCompleted,
    totalTopics,
    mediumSolved,
    hardSolved,
    accuracy,
    independentRate,
    currentStreak,
    activeDaysLast30,
    avgMediumMinutes,
    masteredPatterns,
    totalPatterns,
    weakTopicCount,
  } = input;

  const factors = [
    {
      id: 'coverage',
      label: 'Topic coverage',
      weight: 20,
      value: clamp01(topicsCompleted / Math.max(1, totalTopics)),
      hint: `${topicsCompleted} of ${totalTopics} topics completed`,
    },
    {
      id: 'medium',
      label: 'Medium volume',
      weight: 18,
      value: clamp01(mediumSolved / 100),
      hint: `${mediumSolved} mediums solved (100 is full marks)`,
    },
    {
      id: 'hard',
      label: 'Hard volume',
      weight: 12,
      value: clamp01(hardSolved / 25),
      hint: `${hardSolved} hards solved (25 is full marks)`,
    },
    {
      id: 'independence',
      label: 'Independent solving',
      weight: 16,
      value: clamp01(independentRate),
      hint: `${Math.round(independentRate * 100)}% of solves needed no hints`,
    },
    {
      id: 'accuracy',
      label: 'Accuracy',
      weight: 10,
      value: clamp01(accuracy / 85),
      hint: `${Math.round(accuracy)}% of attempts end in a solve`,
    },
    {
      id: 'patterns',
      label: 'Pattern mastery',
      weight: 10,
      value: clamp01(masteredPatterns / Math.max(1, totalPatterns)),
      hint: `${masteredPatterns} of ${totalPatterns} patterns above 60%`,
    },
    {
      id: 'consistency',
      label: 'Consistency',
      weight: 8,
      value: clamp01((activeDaysLast30 / 24) * 0.7 + clamp01(currentStreak / 14) * 0.3),
      hint: `${activeDaysLast30} active days in the last 30`,
    },
    {
      id: 'speed',
      label: 'Speed on mediums',
      weight: 6,
      // 45 min → 0, 20 min or faster → 1.
      value: avgMediumMinutes ? clamp01((45 - avgMediumMinutes) / 25) : 0,
      hint: avgMediumMinutes
        ? `${Math.round(avgMediumMinutes)} min average on mediums`
        : 'No mediums timed yet',
    },
  ];

  const raw = factors.reduce((sum, f) => sum + f.weight * f.value, 0);

  // Unaddressed weak topics hold the score back — coverage without
  // competence should not read as readiness.
  const penalty = Math.min(10, weakTopicCount * 2.5);
  const score = Math.max(0, Math.round(raw - penalty));

  return { score, band: bandFor(score), factors, penalty };
}
