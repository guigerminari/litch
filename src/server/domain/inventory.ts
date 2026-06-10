import { randomUUID } from "node:crypto";
import type { Character, InventoryItem, ItemDefinition, Rarity } from "../../shared/types";
import { CLAN_BENEFITS, INVENTORY_CAPACITY } from "../content";

function isProsperitySuperActive(character: Character) {
  const clanRanks = character.clanBenefitAllocations ?? {};
  const benefits = CLAN_BENEFITS.filter((benefit) => benefit.category === "prosperity");
  return benefits.length > 0 && benefits.every((benefit) => (clanRanks[benefit.id] ?? 0) >= benefit.maxRank);
}

export function inventoryUsed(character: Character) {
  return character.inventory.length; // 1 slot per unique stack entry
}

export function getInventoryCapacity(character: Character) {
  const clanRanks = character.clanBenefitAllocations ?? {};
  return (
    INVENTORY_CAPACITY +
    (clanRanks.clan_inventory_1 ?? 0) * 2 +
    (clanRanks.clan_inventory_2 ?? 0) * 3 +
    (clanRanks.clan_inventory_3 ?? 0) * 5 +
    (isProsperitySuperActive(character) ? 10 : 0)
  );
}

export function hasCapacity(character: Character, quantity = 1) {
  return character.inventory.length + quantity <= getInventoryCapacity(character);
}

export function findInventoryItem(character: Character, instanceId: string) {
  return character.inventory.find((item) => item.instanceId === instanceId) ?? null;
}

export function isEquipped(character: Character, instanceId: string) {
  return Object.values(character.equipment).includes(instanceId);
}

export function normalizeInventory(character: Character, itemCatalog: Record<string, ItemDefinition>) {
  const originalLength = character.inventory.length;
  character.inventory = character.inventory.filter((item) => Boolean(itemCatalog[item.itemId]));

  const inventoryInstanceIds = new Set(character.inventory.map((item) => item.instanceId));
  let changed = character.inventory.length !== originalLength;

  for (const slot of Object.keys(character.equipment) as Array<keyof typeof character.equipment>) {
    const equippedInstanceId = character.equipment[slot];
    if (equippedInstanceId && !inventoryInstanceIds.has(equippedInstanceId)) {
      character.equipment[slot] = null;
      changed = true;
    }
  }

  return changed;
}

export function addItem(
  character: Character,
  itemId: string,
  itemCatalog: Record<string, ItemDefinition>,
  quantity = 1,
  options?: { rarity?: Rarity }
): InventoryItem {
  const definition = itemCatalog[itemId];
  if (!definition) {
    throw new Error("Item inválido.");
  }

  // Stackable items: merge into existing stack (no new slot needed)
  if (
    definition.kind === "potion" ||
    definition.kind === "material" ||
    definition.kind === "scroll" ||
    definition.kind === "ticket" ||
    definition.kind === "misc"
  ) {
    const stack = character.inventory.find((item) => item.itemId === itemId);
    if (stack) {
      stack.quantity += quantity;
      return stack;
    }
  }

  // Need a new slot — check capacity now
  if (!hasCapacity(character, 1)) {
    throw new Error("Inventário cheio.");
  }

  const item: InventoryItem = {
    instanceId: randomUUID(),
    itemId,
    quantity,
    rarity: definition.slot ? options?.rarity : undefined
  };
  character.inventory.push(item);
  return item;
}

export function removeItem(character: Character, instanceId: string, quantity = 1) {
  const item = findInventoryItem(character, instanceId);
  if (!item) {
    throw new Error("Item não encontrado.");
  }
  if (item.quantity < quantity) {
    throw new Error("Quantidade indisponível.");
  }

  item.quantity -= quantity;
  if (item.quantity <= 0) {
    character.inventory = character.inventory.filter((entry) => entry.instanceId !== instanceId);
    for (const slot of Object.keys(character.equipment) as Array<keyof typeof character.equipment>) {
      if (character.equipment[slot] === instanceId) {
        character.equipment[slot] = null;
      }
    }
  }

  return item;
}
