import { randomUUID } from "node:crypto";
import type { Character, InventoryItem, ItemDefinition } from "../../shared/types";
import { INVENTORY_CAPACITY } from "../content";

export function inventoryUsed(character: Character) {
  return character.inventory.reduce((total, item) => total + item.quantity, 0);
}

export function hasCapacity(character: Character, quantity = 1) {
  return inventoryUsed(character) + quantity <= INVENTORY_CAPACITY;
}

export function findInventoryItem(character: Character, instanceId: string) {
  return character.inventory.find((item) => item.instanceId === instanceId) ?? null;
}

export function isEquipped(character: Character, instanceId: string) {
  return Object.values(character.equipment).includes(instanceId);
}

export function addItem(
  character: Character,
  itemId: string,
  itemCatalog: Record<string, ItemDefinition>,
  quantity = 1
): InventoryItem {
  if (!hasCapacity(character, quantity)) {
    throw new Error("Inventário cheio.");
  }

  const definition = itemCatalog[itemId];
  if (!definition) {
    throw new Error("Item inválido.");
  }

  if (definition.kind === "potion" || definition.kind === "material") {
    const stack = character.inventory.find((item) => item.itemId === itemId);
    if (stack) {
      stack.quantity += quantity;
      return stack;
    }
  }

  const item = { instanceId: randomUUID(), itemId, quantity };
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
