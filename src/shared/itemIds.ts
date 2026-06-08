export const ITEM_IDS = {
  trainTicket: "ticket_train",
  shipTicket: "ticket_ship",
  dungeonKey: "misc_dungeon_key",
  monarchAccessKey: "misc_high_dungeon_key",
  arenaCoin: "material_gold_coin",
  blueCoin: "material_blue_coin",
  oldStone: "material_old_stone",
  eranStone: "misc_eran",
  celena: "material_celena",
  midran: "material_midran",
  creationStone: "misc_stone_craft"
} as const;

export const TRAVEL_ITEM_IDS = {
  trainTicket: ITEM_IDS.trainTicket,
  shipTicket: ITEM_IDS.shipTicket
} as const;

export const ARENA_ITEM_IDS = {
  arenaCoin: ITEM_IDS.arenaCoin,
  blueCoin: ITEM_IDS.blueCoin,
  creationStone: ITEM_IDS.creationStone
} as const;

export const DUNGEON_ITEM_IDS = {
  dungeonKey: ITEM_IDS.dungeonKey,
  monarchAccessKey: ITEM_IDS.monarchAccessKey
} as const;

export const ENHANCEMENT_ITEM_IDS = {
  oldStone: ITEM_IDS.oldStone,
  eranStone: ITEM_IDS.eranStone,
  celena: ITEM_IDS.celena,
  midran: ITEM_IDS.midran,
  creationStone: ITEM_IDS.creationStone
} as const;

export type ImportantItemId = (typeof ITEM_IDS)[keyof typeof ITEM_IDS];
