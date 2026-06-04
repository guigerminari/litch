const XP_GROWTH = 1.1;
const XP_BASE = 35;

export function getBaseXpByLevel(level: number): number {
  if (level <= 0) return 0;

  return Math.floor(XP_BASE * ((Math.pow(XP_GROWTH, level) - 1) / (XP_GROWTH - 1)));
}

export function getRequiredVictoriesToLevel(level: number): number {
  return Math.ceil(3 + Math.pow(level, 1.25) / 4);
}

export function experienceForNextLevel(level: number): number {
  const baseXp = getBaseXpByLevel(level);
  const requiredVictories = getRequiredVictoriesToLevel(level);

  return Math.floor(baseXp * requiredVictories);
}