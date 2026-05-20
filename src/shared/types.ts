export type AttributeKey = "strength" | "constitution" | "agility";

export type EquipmentSlot = "weapon" | "armor" | "amulet";

export type ItemKind = "weapon" | "armor" | "amulet" | "potion" | "material" | "scroll" | "ticket" | "misc";

export type BattleMode = "pve" | "pvp" | "dungeon";

export type BattleStatus = "active" | "ended";

export type Currency = "gold" | "diamonds";

export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export type QuestType = "daily" | "fixed";

export type TalentCategory = "offensive" | "defensive" | "utility";

export type ClanBenefitCategory = "combat" | "defense" | "prosperity";

export interface Attributes {
  strength: number;
  constitution: number;
  agility: number;
}

export interface ItemStats extends Partial<Attributes> {
  defense?: number;
  heal?: number;
  healPercent?: number;
  energyPercent?: number;
}

export interface ItemDefinition {
  id: string;
  name: string;
  kind: ItemKind;
  slot?: EquipmentSlot;
  imageUrl?: string;
  minLevel: number;
  price: number;
  stats: ItemStats;
  description?: string;
  rarity?: Rarity;
}

export interface InventoryItem {
  instanceId: string;
  itemId: string;
  quantity: number;
  enhancementLevel?: number;
}

export interface EquipmentState {
  weapon: string | null;
  armor: string | null;
  amulet: string | null;
}

export interface Character {
  id: string;
  playerId: string;
  name: string;
  level: number;
  experience: number;
  gold: number;
  diamonds: number;
  currentHp: number;
  currentEnergy: number;
  cityId: string;
  attributes: Attributes;
  unspentAttributePoints: number;
  equipment: EquipmentState;
  inventory: InventoryItem[];
  activeBattleId: string | null;
  questProgress: QuestProgress;
  talentAllocations: Record<string, number>;
  clanId: string | null;
  lastRegenAt?: number;
  clanBenefitAllocations: Record<string, number>;
  arenaWins: number;
  arenaLosses: number;
  dungeonClears: number;
  pveAutoUntil?: number;
  royalSealUntil?: number;
}

export interface QuestProgress {
  dayKey: string;
  dailyEnemyDefeats: number;
  marketItemsSold: number;
  marketItemsBought: number;
  shopItemsBought: number;
  shopItemsSold: number;
  healthPotionsUsed: number;
  energyPotionsUsed: number;
  claimedDailyQuestIds: string[];
  claimedFixedQuestIds: string[];
}

export interface Player {
  id: string;
  username: string;
  createdAt: number;
}

export interface DerivedStats {
  maxHp: number;
  hpRegenBonusPercent: number;
  energyRegenBonusPercent: number;
  maxEnergy: number;
  totalStrength: number;
  defense: number;
  agility: number;
  criticalChance: number;
  dodgeChance: number;
  damageBonusPercent: number;
  criticalDamageMultiplier: number;
  xpBonusPercent: number;
  goldBonusPercent: number;
  dropBonusPercent: number;
  availableTalentPoints: number;
  spentTalentPoints: number;
}

export interface MonsterDrop {
  itemId: string;
  chance: number;
}

export interface MonsterDefinition {
  id: string;
  cityId: string;
  name: string;
  imageUrl?: string;
  level: number;
  maxHp: number;
  strength: number;
  defense: number;
  agility: number;
  experience: number;
  gold: number;
  drops: MonsterDrop[];
}

export interface CountryDefinition {
  id: string;
  name: string;
  description: string;
  portCityId: string;
}

export interface HuntingLocationDefinition {
  id: string;
  cityId: string;
  name: string;
  description: string;
  monsterIds: string[];
}

export interface CityDefinition {
  id: string;
  countryId: string;
  name: string;
  minLevel: number;
  travelCost: number;
  description: string;
  isPort?: boolean;
  inhabitants: string[];
  npcs: {
    armorer: string;
    apothecary: string;
    blacksmith?: string;
    alchemist?: string;
    moneyChanger?: string;
  };
  dungeonMonsterIds?: string[];
  blacksmithRecipeIds?: string[];
  blacksmithEnhancement?: boolean;
  alchemistRecipeIds?: string[];
  huntLocationIds: string[];
  huntMonsterIds: string[];
  armorerItemIds: string[];
  apothecaryItemIds: string[];
  moneyChangerItemIds?: string[];
}

export interface BattleParticipant {
  id: string;
  ownerPlayerId: string | null;
  name: string;
  kind: "player" | "monster";
  imageUrl?: string;
  level: number;
  hp: number;
  maxHp: number;
  strength: number;
  defense: number;
  agility: number;
  criticalChance?: number;
  dodgeChance?: number;
  damageBonusPercent?: number;
  criticalDamageMultiplier?: number;
}

export interface BattleLogEntry {
  id: string;
  createdAt: number;
  text: string;
}

export interface BattleState {
  id: string;
  mode: BattleMode;
  status: BattleStatus;
  cityId: string;
  participants: BattleParticipant[];
  turnParticipantId: string | null;
  log: BattleLogEntry[];
  winnerParticipantId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  author: string;
  text: string;
  createdAt: number;
}

export interface PrivateMessage {
  id: string;
  fromPlayerId: string;
  fromName: string;
  toPlayerId: string;
  toName: string;
  text: string;
  createdAt: number;
}

export interface MarketListing {
  id: string;
  sellerPlayerId: string;
  sellerName: string;
  item: InventoryItem;
  price: number;
  currency: Currency;
  createdAt: number;
}

export interface QuestReward {
  experience?: number;
  gold?: number;
  diamonds?: number;
}

export interface QuestView {
  id: string;
  type: QuestType;
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: QuestReward;
  completed: boolean;
  claimed: boolean;
}

export interface CraftingIngredient {
  itemId: string;
  quantity: number;
}

export interface CraftingRecipe {
  id: string;
  station: "blacksmith" | "alchemist";
  cityIds: string[];
  name: string;
  resultItemId: string;
  resultQuantity: number;
  goldCost: number;
  ingredients: CraftingIngredient[];
}

export interface TalentDefinition {
  id: string;
  category: TalentCategory;
  name: string;
  description: string;
  maxRank: number;
  costPerRank: number;
  requires?: string;
}

export interface ClanBenefitCost {
  gold: number;
  diamonds: number;
}

export interface ClanBenefitDefinition {
  id: string;
  category: ClanBenefitCategory;
  name: string;
  description: string;
  maxRank: number;
  costPerRank: ClanBenefitCost;
  requires?: string;
  icon?: string;
}

export interface ClanSuperBenefitDefinition {
  id: string;
  category: ClanBenefitCategory;
  name: string;
  description: string;
  icon?: string;
}

export interface ClanMemberView {
  playerId: string;
  name: string;
  isLeader: boolean;
}

export interface Clan {
  id: string;
  name: string;
  icon: string;
  leaderPlayerId: string;
  memberPlayerIds: string[];
  level: number;
  memberCapacity: number;
  gold: number;
  diamonds: number;
  benefitAllocations: Record<string, number>;
  createdAt: number;
  members?: ClanMemberView[];
}

export interface ClanSummary {
  id: string;
  name: string;
  icon: string;
  leaderName: string;
  memberCount: number;
  memberCapacity: number;
  level: number;
  gold: number;
  diamonds: number;
}

export interface GameShopPackage {
  id: string;
  name: string;
  diamonds: number;
  priceLabel: string;
  bonusLabel?: string;
  description?: string;
  featured?: boolean;
}

export interface RankingEntry {
  playerId: string;
  name: string;
  level: number;
  arenaWins: number;
  arenaLosses: number;
}

export interface ClanRankingEntry {
  id: string;
  name: string;
  icon: string;
  leaderName: string;
  memberCount: number;
  memberCapacity: number;
  level: number;
  gold: number;
  diamonds: number;
}

export interface GameState {
  player: Player;
  character: Character;
  derived: DerivedStats;
  inventoryUsed: number;
  inventoryCapacity: number;
  cities: CityDefinition[];
  countries: CountryDefinition[];
  currentCity: CityDefinition;
  currentCountry: CountryDefinition;
  cityHuntLocations: HuntingLocationDefinition[];
  cityMonsters: MonsterDefinition[];
  itemCatalog: Record<string, ItemDefinition>;
  activeBattle: BattleState | null;
  chatMessages: ChatMessage[];
  marketplaceListings: MarketListing[];
  quests: {
    daily: QuestView[];
    fixed: QuestView[];
  };
  talents: TalentDefinition[];
  clanBenefits: ClanBenefitDefinition[];
  clanSuperBenefits: ClanSuperBenefitDefinition[];
  clan: Clan | null;
  clanDirectory: ClanSummary[];
  diamondPackages: GameShopPackage[];
  availableCraftingRecipes: {
    blacksmith: CraftingRecipe[];
    alchemist: CraftingRecipe[];
  };
  rankings: {
    level: RankingEntry[];
    arena: RankingEntry[];
    clans: ClanRankingEntry[];
  };
  onlineCount: number;
  arenaQueueSize: number;
  nextRegenAt: number;
  regenHpAmount: number;
  regenEnergyAmount: number;
  clanChatMessages: ChatMessage[];
  privateMessages: PrivateMessage[];
  onlinePlayers: Array<{ playerId: string; name: string }>;
}

export interface ServerError {
  message: string;
}

export interface RegisterPayload {
  username: string;
}

export interface AuthOkPayload {
  sessionToken: string;
  playerId: string;
}

export interface AllocatePayload extends Partial<Attributes> {}

export interface TravelPayload {
  cityId: string;
}

export interface ShopBuyPayload {
  itemId: string;
  quantity?: number;
  shop?: "armorer" | "apothecary" | "moneyChanger";
}

export interface SellPayload {
  instanceId: string;
  quantity?: number;
}

export interface EquipPayload {
  instanceId: string;
}

export interface UseItemPayload {
  instanceId: string;
}

export interface HuntStartPayload {
  monsterId: string;
}

export interface DungeonStartPayload {
  monsterId: string;
}

export interface BattleActionPayload {
  battleId: string;
  action: "attack" | "usePotion" | "auto";
  instanceId?: string;
  continueUntilStopped?: boolean;
}

export interface MarketCreatePayload {
  instanceId: string;
  price: number;
  currency: Currency;
  quantity?: number;
}

export interface MarketBuyPayload {
  listingId: string;
}

export interface QuestClaimPayload {
  questId: string;
}

export interface CurrencyExchangePayload {
  direction: "diamondsToGold" | "goldToDiamonds";
  amount: number;
}

export interface ClanChatSendPayload {
  text: string;
}

export interface PrivateSendPayload {
  targetPlayerName: string;
  text: string;
}

export interface CraftPayload {
  recipeId: string;
}

export interface EnhancePayload {
  instanceId: string;
  creationStones?: number;
}

export interface TalentBuyPayload {
  talentId: string;
}

export interface ResetPayload {
  method: "diamonds" | "scroll";
}

export interface GameShopPurchasePayload {
  packageId: string;
}

export interface ClanCreatePayload {
  name: string;
  icon?: string;
}

export interface ClanUpdatePayload {
  name: string;
  icon?: string;
}

export interface ClanJoinPayload {
  clanId: string;
}

export interface ClanKickPayload {
  memberPlayerId: string;
}

export interface ClanTransferLeadershipPayload {
  memberPlayerId: string;
}

export interface ClanDonatePayload {
  gold?: number;
  diamonds?: number;
}

export interface ClanBenefitBuyPayload {
  benefitId: string;
}

export const ATTRIBUTE_LABEL: Record<AttributeKey, string> = {
  strength: "FORÇA",
  constitution: "CONSTITUIÇÃO",
  agility: "AGILIDADE"
};

export const EQUIPMENT_LABEL: Record<EquipmentSlot, string> = {
  weapon: "Arma",
  armor: "Armadura",
  amulet: "Amuleto"
};
