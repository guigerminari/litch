import type { Rarity } from "./types";

export const RARITY_ORDER: Rarity[] = ["common", "uncommon", "rare", "epic", "legendary"];

// Chances de obter cada raridade (exceto comum que e o padrao)
export const RARITY_CHANCES: Record<Exclude<Rarity, "common">, number> = {
  uncommon: 0.20,
  rare: 0.08,
  epic: 0.03,
  legendary: 0.01
};

// Multiplicador de atributos por raridade (20% de aumento a cada nivel)
export const RARITY_STAT_MULTIPLIER: Record<Rarity, number> = {
  common: 1.0,
  uncommon: 1.2,
  rare: 1.44,
  epic: 1.728,
  legendary: 2.0736
};

// Multiplicador de preco por raridade (mesmo que os atributos)
export const RARITY_PRICE_MULTIPLIER: Record<Rarity, number> = RARITY_STAT_MULTIPLIER;

export type RarityChanceTable = Record<Rarity, number>;

export const BASE_RARITY_CHANCES: RarityChanceTable = {
  common: 1 - RARITY_CHANCES.uncommon - RARITY_CHANCES.rare - RARITY_CHANCES.epic - RARITY_CHANCES.legendary,
  uncommon: RARITY_CHANCES.uncommon,
  rare: RARITY_CHANCES.rare,
  epic: RARITY_CHANCES.epic,
  legendary: RARITY_CHANCES.legendary
};

const CRAFT_RARITY_BONUS_PER_TIER: Record<Exclude<Rarity, "common">, number> = {
  uncommon: 0.05,
  rare: 0.04,
  epic: 0.04,
  legendary: 0.03
};

export function getRarityTier(rarity: Rarity) {
  return Math.max(0, RARITY_ORDER.indexOf(rarity));
}

export function getCraftRarityBoostTier(baseRarities: Rarity[] = []) {
  if (baseRarities.length === 0) {
    return 0;
  }
  const averageTier = baseRarities.reduce((total, rarity) => total + getRarityTier(rarity), 0) / baseRarities.length;
  return Math.max(0, Math.min(4, Math.ceil(averageTier)));
}

export function getCraftRarityChances(baseRarities: Rarity[] = []): RarityChanceTable {
  const boostTier = getCraftRarityBoostTier(baseRarities);
  return {
    common: Math.max(0, BASE_RARITY_CHANCES.common - boostTier * 0.16),
    uncommon: BASE_RARITY_CHANCES.uncommon + boostTier * CRAFT_RARITY_BONUS_PER_TIER.uncommon,
    rare: BASE_RARITY_CHANCES.rare + boostTier * CRAFT_RARITY_BONUS_PER_TIER.rare,
    epic: BASE_RARITY_CHANCES.epic + boostTier * CRAFT_RARITY_BONUS_PER_TIER.epic,
    legendary: BASE_RARITY_CHANCES.legendary + boostTier * CRAFT_RARITY_BONUS_PER_TIER.legendary
  };
}

export function getRarityFromChanceTable(chances: RarityChanceTable, roll = Math.random()): Rarity {
  let accumulated = 0;
  for (const rarity of RARITY_ORDER) {
    accumulated += chances[rarity];
    if (roll < accumulated) {
      return rarity;
    }
  }
  return "common";
}

export function getCraftRarityFromRoll(baseRarities: Rarity[] = []): Rarity {
  return getRarityFromChanceTable(getCraftRarityChances(baseRarities));
}

export function getRarityFromRoll(): Rarity {
  return getRarityFromChanceTable(BASE_RARITY_CHANCES);
}
