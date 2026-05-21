import type { Character, DerivedStats, InventoryItem, ItemDefinition, ItemStats } from "../../shared/types";
import { RARITY_STAT_MULTIPLIER } from "../../shared/rarity";
import { CLAN_BENEFITS, TALENTS } from "../content";

function isClanCategoryComplete(allocations: Record<string, number>, category: "combat" | "defense" | "prosperity") {
  const benefits = CLAN_BENEFITS.filter((benefit) => benefit.category === category);
  return benefits.length > 0 && benefits.every((benefit) => (allocations[benefit.id] ?? 0) >= benefit.maxRank);
}

export function getEquippedItems(character: Character, itemCatalog: Record<string, ItemDefinition>) {
  const equippedIds = Object.values(character.equipment).filter(Boolean);
  return character.inventory
    .filter((item) => equippedIds.includes(item.instanceId))
    .map((inventoryItem) => {
      const definition = itemCatalog[inventoryItem.itemId];
      return definition ? { inventoryItem, definition } : null;
    })
    .filter((entry): entry is { inventoryItem: InventoryItem; definition: ItemDefinition } => entry !== null);
}

export function getEnhancedItemStats(inventoryItem: InventoryItem, definition: ItemDefinition): ItemStats {
  if (!definition.slot) {
    return definition.stats;
  }

  const enhancementLevel = Math.max(0, inventoryItem.enhancementLevel ?? 0);
  const rarityMultiplier = RARITY_STAT_MULTIPLIER[inventoryItem.rarity ?? definition.rarity ?? "common"];
  const enhancementMultiplier = 1 + enhancementLevel * 0.2;
  const multiplier = rarityMultiplier * enhancementMultiplier;
  return {
    ...definition.stats,
    strength: definition.stats.strength === undefined ? undefined : Math.ceil(definition.stats.strength * multiplier),
    constitution:
      definition.stats.constitution === undefined ? undefined : Math.ceil(definition.stats.constitution * multiplier),
    agility: definition.stats.agility === undefined ? undefined : Math.ceil(definition.stats.agility * multiplier),
    defense: definition.stats.defense === undefined ? undefined : Math.ceil(definition.stats.defense * multiplier)
  };
}

export function getEffectiveAttributes(character: Character, itemCatalog: Record<string, ItemDefinition>) {
  const attributes = { ...character.attributes };
  const talentRanks = character.talentAllocations ?? {};
  const clanRanks = character.clanBenefitAllocations ?? {};

  for (const item of getEquippedItems(character, itemCatalog)) {
    const stats = getEnhancedItemStats(item.inventoryItem, item.definition);
    attributes.strength += stats.strength ?? 0;
    attributes.constitution += stats.constitution ?? 0;
    attributes.agility += stats.agility ?? 0;
  }

  attributes.strength += (talentRanks.off_strength_1 ?? 0) * 2;
  attributes.agility += (talentRanks.off_agility_1 ?? 0) * 2;
  attributes.constitution += (talentRanks.def_constitution_1 ?? 0) * 2;
  attributes.agility += (talentRanks.def_agility_1 ?? 0) * 2;
  attributes.strength += clanRanks.clan_strength_1 ?? 0;

  return attributes;
}

export function deriveStats(character: Character, itemCatalog: Record<string, ItemDefinition>): DerivedStats {
  const attributes = getEffectiveAttributes(character, itemCatalog);
  const talentRanks = character.talentAllocations ?? {};
  const clanRanks = character.clanBenefitAllocations ?? {};
  const combatSuperActive = isClanCategoryComplete(clanRanks, "combat");
  const defenseSuperActive = isClanCategoryComplete(clanRanks, "defense");
  const prosperitySuperActive = isClanCategoryComplete(clanRanks, "prosperity");
  const equippedDefense = getEquippedItems(character, itemCatalog).reduce(
    (total, item) => total + (getEnhancedItemStats(item.inventoryItem, item.definition).defense ?? 0),
    0
  );
  const spentTalentPoints = getSpentTalentPoints(character);
  const damageBonusPercent =
    (talentRanks.off_power_1 ?? 0) * 0.04 +
    (talentRanks.off_power_2 ?? 0) * 0.07 +
    (clanRanks.clan_damage_1 ?? 0) * 0.01 +
    (clanRanks.clan_damage_2 ?? 0) * 0.015 +
    (clanRanks.clan_damage_3 ?? 0) * 0.01 +
    (clanRanks.clan_damage_4 ?? 0) * 0.015 +
    (combatSuperActive ? 0.1 : 0);
  const maxHpBonusPercent =
    (talentRanks.def_vitality_1 ?? 0) * 0.05 +
    (talentRanks.def_vitality_2 ?? 0) * 0.08 +
    (clanRanks.clan_vitality_1 ?? 0) * 0.02 +
    (clanRanks.clan_vitality_2 ?? 0) * 0.015 +
    (defenseSuperActive ? 0.1 : 0);

  return {
    maxHp: Math.floor((character.level * 50 + 2 * attributes.constitution) * (1 + maxHpBonusPercent)),
    maxEnergy:
      10 +
      attributes.constitution +
      character.level +
      (talentRanks.util_energy_1 ?? 0) +
      (clanRanks.clan_energy_1 ?? 0) +
      (clanRanks.clan_energy_2 ?? 0) +
      (prosperitySuperActive ? 5 : 0),
    totalStrength: character.level * 10 + attributes.strength,
    defense:
      equippedDefense +
      (talentRanks.def_armor_1 ?? 0) * 2 +
      (clanRanks.clan_guard_1 ?? 0) +
      (clanRanks.clan_guard_2 ?? 0) +
      (defenseSuperActive ? 5 : 0),
    agility: attributes.agility,
    criticalChance: Math.min(
      0.6,
        attributes.agility * 0.01 +
        (talentRanks.off_crit_1 ?? 0) * 0.02 +
        (clanRanks.clan_crit_1 ?? 0) * 0.005 +
        (clanRanks.clan_crit_2 ?? 0) * 0.005 +
        (combatSuperActive ? 0.03 : 0)
    ),
    dodgeChance: Math.min(
      0.45,
        attributes.agility * 0.008 +
        (talentRanks.def_dodge_1 ?? 0) * 0.02 +
        (clanRanks.clan_dodge_1 ?? 0) * 0.005 +
        (clanRanks.clan_dodge_2 ?? 0) * 0.005 +
        (defenseSuperActive ? 0.03 : 0)
    ),
    damageBonusPercent,
    criticalDamageMultiplier: 1.5 + (talentRanks.off_crit_damage_1 ?? 0) * 0.15 + (combatSuperActive ? 0.2 : 0),
    xpBonusPercent:
      (talentRanks.util_xp_1 ?? 0) * 0.05 +
      (talentRanks.util_xp_2 ?? 0) * 0.08 +
      (clanRanks.clan_xp_1 ?? 0) * 0.02 +
      (clanRanks.clan_xp_2 ?? 0) * 0.02 +
      (prosperitySuperActive ? 0.1 : 0),
    goldBonusPercent:
      (talentRanks.util_gold_1 ?? 0) * 0.05 +
      (clanRanks.clan_gold_1 ?? 0) * 0.02 +
      (clanRanks.clan_gold_2 ?? 0) * 0.015 +
      (prosperitySuperActive ? 0.1 : 0),
    dropBonusPercent:
      (talentRanks.util_drop_1 ?? 0) * 0.04 +
      (talentRanks.util_drop_2 ?? 0) * 0.08 +
      (clanRanks.clan_drop_1 ?? 0) * 0.015 +
      (clanRanks.clan_drop_2 ?? 0) * 0.01 +
      (prosperitySuperActive ? 0.05 : 0),
    hpRegenBonusPercent: (talentRanks.regen_hp_1 ?? 0) * 0.03,
    energyRegenBonusPercent: (talentRanks.regen_energy_1 ?? 0) * 0.03,
    availableTalentPoints: getTotalTalentPoints(character.level) - spentTalentPoints,
    spentTalentPoints
  };
}

export function getTotalTalentPoints(level: number) {
  return Math.floor(level / 2);
}

export function getSpentTalentPoints(character: Character) {
  const allocations = character.talentAllocations ?? {};
  return TALENTS.reduce((total, talent) => total + (allocations[talent.id] ?? 0) * talent.costPerRank, 0);
}

export function grantExperience(character: Character, amount: number) {
  const messages: string[] = [];
  character.experience += amount;

  while (character.experience >= experienceForNextLevel(character.level)) {
    character.experience -= experienceForNextLevel(character.level);
    character.level += 1;
    character.unspentAttributePoints += 3;
    messages.push(
      `${character.name} subiu para o nível ${character.level} e ganhou 3 pontos de atributo${
        character.level % 2 === 0 ? " e 1 ponto de talento" : ""
      }.`
    );
  }

  return messages;
}

const XP_GROWTH = 1.1;
const XP_BASE = 35;

export function getBaseXpByLevel(level: number): number {
  if (level <= 0) return 0;

  return Math.floor(
    XP_BASE * ((Math.pow(XP_GROWTH, level) - 1) / (XP_GROWTH - 1))
  );
}

export function getRequiredVictoriesToLevel(level: number): number {
  return Math.ceil(5 + Math.pow(level, 1.25) / 4);
}

export function experienceForNextLevel(level: number): number {
  const baseXp = getBaseXpByLevel(level);
  const requiredVictories = getRequiredVictoriesToLevel(level);

  return Math.floor(baseXp * requiredVictories);
}