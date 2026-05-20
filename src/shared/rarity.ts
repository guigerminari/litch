import type { Rarity } from "./types";

// Chances de obter cada raridade (exceto comum que é o padrão)
export const RARITY_CHANCES: Record<Exclude<Rarity, "common">, number> = {
  uncommon: 0.20,  // 20%
  rare: 0.08,      // 8%
  epic: 0.03,      // 3%
  legendary: 0.01  // 1%
};

// Multiplicador de atributos por raridade (20% de aumento a cada nível)
export const RARITY_STAT_MULTIPLIER: Record<Rarity, number> = {
  common: 1.0,
  uncommon: 1.2,
  rare: 1.44,      // 1.2 * 1.2
  epic: 1.728,     // 1.44 * 1.2
  legendary: 2.0736 // 1.728 * 1.2
};

// Multiplicador de preço por raridade (mesmo que os atributos)
export const RARITY_PRICE_MULTIPLIER: Record<Rarity, number> = RARITY_STAT_MULTIPLIER;

export function getRarityFromRoll(): Rarity {
  const roll = Math.random();
  
  if (roll < RARITY_CHANCES.uncommon) return "uncommon";
  if (roll < RARITY_CHANCES.uncommon + RARITY_CHANCES.rare) return "rare";
  if (roll < RARITY_CHANCES.uncommon + RARITY_CHANCES.rare + RARITY_CHANCES.epic) return "epic";
  if (roll < RARITY_CHANCES.uncommon + RARITY_CHANCES.rare + RARITY_CHANCES.epic + RARITY_CHANCES.legendary) return "legendary";
  
  return "common";
}
