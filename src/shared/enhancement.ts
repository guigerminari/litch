export const ENHANCEMENT_GOLD_STEP = 10000;
export const ENHANCEMENT_CREATION_STONE_BONUS = 3;

export const ENHANCEMENT_ITEMS = {
  oldStone: "material_old_stone",
  eranStone: "material_eran_fragment",
  celena: "material_celena",
  midran: "material_midran",
  creationStone: "misc_stone_craft"
} as const;

export type EnhancementLevelRange = {
  minLevel: number;
  maxLevel: number | null;
  label: string;
};

const DEFAULT_LEVEL_RANGE: EnhancementLevelRange = {
  minLevel: 1,
  maxLevel: null,
  label: "+1 em diante"
};

const LEVEL_RANGES_BY_COUNTRY: Record<string, EnhancementLevelRange> = {
  aurevia: {
    minLevel: 1,
    maxLevel: 4,
    label: "+1 a +4"
  },
  valfria: {
    minLevel: 5,
    maxLevel: 10,
    label: "+5 a +10"
  },
  morthaly: {
    minLevel: 11,
    maxLevel: null,
    label: "+11 em diante"
  }
};

const SUCCESS_CHANCE_BY_LEVEL: Record<number, number> = {
  1: 100,
  2: 98,
  3: 95,
  4: 90,
  5: 85,
  6: 75,
  7: 66,
  8: 55,
  9: 45,
  10: 30,
  11: 15,
  12: 1,
  13: 1
};

export function getEnhancementBaseChance(nextLevel: number) {
  return SUCCESS_CHANCE_BY_LEVEL[nextLevel] ?? 1;
}

export function getEnhancementLevelRangeForCountry(countryId: string) {
  return LEVEL_RANGES_BY_COUNTRY[countryId] ?? DEFAULT_LEVEL_RANGE;
}

export function canEnhanceLevelInCountry(countryId: string, nextLevel: number) {
  const range = getEnhancementLevelRangeForCountry(countryId);
  return nextLevel >= range.minLevel && (range.maxLevel === null || nextLevel <= range.maxLevel);
}

export function describeEnhancementLevelRange(countryId: string) {
  return getEnhancementLevelRangeForCountry(countryId).label;
}

export function getEnhancementMaterialQuantity(nextLevel: number) {
  return Math.max(1, Math.floor(nextLevel));
}
