export type AttributeKey = "strength" | "constitution" | "agility";

export type EquipmentSlot = "weapon" | "armor" | "amulet";

export type ItemKind = "weapon" | "armor" | "amulet" | "potion" | "material" | "scroll" | "ticket" | "misc";

export type BattleMode = "pve" | "pvp" | "dungeon" | "monarch";

export type BattleStatus = "active" | "ended";

export type ArenaBattleType = "duel" | "ranked";

export const MONARCH_BATTLE_ATTACK_LIMIT = 50;

export type Currency = "gold" | "diamonds";

export type DungeonBuffType = "heal_full" | "damage_50" | "defense_10" | "agility_20" | "strength_20";

export type DungeonTrapType = "hp_20" | "agility_20" | "defense_20";

export type DungeonRoomType = "horde" | "chest" | "trap" | "buff" | "boss";

export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export type QuestType = "daily" | "fixed";
export type QuestCategory = "combat" | "work" | "monarch" | "arena" | "enhancement" | "market" | "shop" | "potion" | "level";

export type TalentCategory = "offensive" | "defensive" | "utility";

export type ClanBenefitCategory = "combat" | "defense" | "prosperity";

export type AvatarIcon = "user" | "shield" | "swords" | "crown" | "flame" | "skull" | "sparkles" | "gem";

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
  energy?: number;
}

export interface ItemDefinition {
  id: string;
  name: string;
  kind: ItemKind;
  slot?: EquipmentSlot;
  imageUrl?: string;
  minLevel: number;
  price: number;
  goldCoinPrice?: number;
  stats: ItemStats;
  description?: string;
  rarity?: Rarity;
}

export interface InventoryItem {
  instanceId: string;
  itemId: string;
  quantity: number;
  enhancementLevel?: number;
  rarity?: Rarity;
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
  arenaRankedPoints: number;
  dungeonClears: number;
  marketHistory: MarketTransactionHistory[];
  diamondPurchaseHistory?: GameShopPurchaseHistoryEntry[];
  pveAutoUntil?: number;
  royalSealUntil?: number;
  avatarId?: string;
  unlockedAvatarIds?: string[];
  referralRewardsClaimedFor?: string[];
  monarchAttempts?: {
    dayKey: string;
    count: number;
  };
  activeWork?: WorkAssignment | null;
  workAptitudes?: Record<string, WorkAptitudeState>;
  workBonusClaims?: Record<string, number>;
  lastDailyBlueCoinGrantKey?: string;
  clanJoinCooldownUntil?: number;
  dungeonProgress?: {
    unlockedFloorByCountry?: Record<string, number>;
    clearedFloorsByCountry?: Record<string, number[]>;
    dailyKeyDayKey?: string;
    activeRun?: DungeonRunState | null;
  };
}

export interface DungeonPendingRewardItem {
  itemId: string;
  quantity: number;
  rarity?: Rarity;
}

export interface DungeonRoomState {
  index: number;
  type: DungeonRoomType;
  monsterIds?: string[];
  trap?: DungeonTrapType;
  buff?: DungeonBuffType;
  rewards?: DungeonPendingRewardItem[];
}

export interface DungeonRunState {
  countryId: string;
  floor: number;
  roomIndex: number;
  roomDeadlineAt?: number;
  rooms: DungeonRoomState[];
  activeBuffs: DungeonBuffType[];
  activeTraps: DungeonTrapType[];
  pendingExperience: number;
  pendingGold: number;
  pendingItems: DungeonPendingRewardItem[];
  currentEncounterMonsterIds?: string[];
}

export interface QuestProgress {
  dayKey: string;
  dailyEnemyDefeats: number;
  dailyWorkServicesCompleted: number;
  dailyMonarchBattles: number;
  dailyArenaBattles: number;
  dailyArenaWins: number;
  workServicesCompleted: number;
  monarchBattles: number;
  arenaBattles: number;
  equipmentEnhancementAttempts: number;
  equipmentEnhancementSuccesses: number;
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
  email: string;
  createdAt: number;
  referralCode?: string;
  referredByPlayerId?: string;
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
  accuracy: number;
  criticalResistance: number;
  damageBonusPercent: number;
  criticalDamageMultiplier: number;
  xpBonusPercent: number;
  goldBonusPercent: number;
  dropBonusPercent: number;
  availableTalentPoints: number;
  spentTalentPoints: number;
}

export interface WorkReward {
  experience?: number;
  gold?: number;
  diamonds?: number;
  attributePoints?: number;
  items?: Array<{
    itemId: string;
    quantity: number;
  }>;
}

export interface WorkServiceBonus {
  level: number;
  description: string;
  attributes?: Partial<Attributes>;
  xpBonusPercent?: number;
  goldBonusPercent?: number;
  periodicHours?: number;
  periodicReward?: WorkReward;
}

export interface WorkServiceDefinition {
  id: string;
  countryId: string;
  name: string;
  specialty: string;
  description: string;
  minMinutes: number;
  maxMinutes: number;
  minuteOptions: number[];
  shortDurationBonusPercent: number;
  aptitudeRewardBonusPercent: number;
  rewardsPerHour: WorkReward;
  bonus: WorkServiceBonus;
}

export interface WorkAptitudeState {
  level: number;
  progressHours: number;
  totalHours: number;
  completions: number;
}

export interface WorkAssignment {
  serviceId: string;
  countryId: string;
  minutes: number;
  hours?: number;
  startedAt: number;
  endsAt: number;
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

export type TemporaryEventBonusScope = "hunt" | "dungeon" | "monarch" | "all";

export interface TemporaryEventBonusDefinition {
  scope: TemporaryEventBonusScope;
  xpBonusPercent?: number;
  goldBonusPercent?: number;
  dropChanceBonusPercent?: number;
  rewardMultiplier?: number;
}

export interface TemporaryEventDefinition {
  id: string;
  name: string;
  subtitle?: string;
  description: string;
  startsAt: string;
  endsAt: string;
  iconUrl?: string;
  bannerImageUrl?: string;
  accentColor?: string;
  bonuses: TemporaryEventBonusDefinition[];
}

export interface TemporaryEventView extends TemporaryEventDefinition {
  startsAtMs: number;
  endsAtMs: number;
  nowMs: number;
}

export type MonarchEventStatus = "active" | "defeated" | "expired";

export interface MonarchRankingEntry {
  playerId: string;
  name: string;
  damage: number;
  rank: number;
}

export interface MonarchRewardEntry extends MonarchRankingEntry {
  experience: number;
  gold: number;
  diamonds: number;
}

export interface MonarchEventState {
  dayKey: string;
  monarchId: string;
  name: string;
  title: string;
  imageUrl: string;
  level: number;
  maxHp: number;
  currentHp: number;
  strength: number;
  defense: number;
  agility: number;
  experience: number;
  gold: number;
  isKing: boolean;
  status: MonarchEventStatus;
  startsAt: number;
  endsAt: number;
  endedAt?: number;
  damageByPlayer: Record<string, number>;
  participantNames: Record<string, string>;
  attemptsByPlayer: Record<string, number>;
  rewardsGranted: boolean;
  rewardLog: MonarchRewardEntry[];
}

export interface MonarchEventView {
  dayKey: string;
  monarchId: string;
  name: string;
  title: string;
  imageUrl: string;
  level: number;
  maxHp: number;
  currentHp: number;
  strength: number;
  defense: number;
  agility: number;
  isKing: boolean;
  status: MonarchEventStatus;
  startsAt: number;
  endsAt: number;
  endedAt?: number;
  attemptsUsed: number;
  attemptsLimit: number;
  ranking: MonarchRankingEntry[];
  rewardLog: MonarchRewardEntry[];
}

export interface MonarchGeneralView {
  id: string;
  name: string;
  title: string;
  imageUrl: string;
  level: number;
  maxHp: number;
  strength: number;
  defense: number;
  agility: number;
  experience: number;
  gold: number;
  isKing: boolean;
}

export interface CountryDefinition {
  id: string;
  name: string;
  description: string;
  portCityId: string;
  imageUrl?: string;
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
    armorer?: string;
    apothecary?: string;
    blacksmith?: string;
    alchemist?: string;
    moneyChanger?: string;
    goldCoinMerchant?: string;
  };
  dungeonMonsterIds?: string[];
  blacksmithRecipeIds?: string[];
  blacksmithEnhancement?: boolean;
  alchemistRecipeIds?: string[];
  huntLocationIds: string[];
  huntMonsterIds: string[];
  armorerItemIds?: string[];
  apothecaryItemIds?: string[];
  moneyChangerItemIds?: string[];
  goldCoinMerchantItemIds?: string[];
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
  accuracy?: number;
  criticalResistance?: number;
  damageBonusPercent?: number;
  criticalDamageMultiplier?: number;
}

export interface BattleLogEntry {
  id: string;
  createdAt: number;
  text: string;
}

export interface MonarchBattleProgress {
  attacksUsed: number;
  attackLimit: number;
}

export interface ArenaBattleState {
  type: ArenaBattleType;
  challengerPlayerId?: string;
  opponentPlayerId?: string;
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
  monarch?: MonarchBattleProgress;
  arena?: ArenaBattleState;
  deathPenaltyAppliedPlayerIds?: string[];
  dungeon?: {
    countryId: string;
    floor: number;
    roomIndex: number;
    roomType: "horde" | "boss";
    roomLabel: string;
    remainingMonsters: number;
    activeBuffs: DungeonBuffType[];
    activeTraps: DungeonTrapType[];
  };
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

export type MarketTransactionKind = "buy" | "sell";

export interface MarketTransactionHistory {
  id: string;
  kind: MarketTransactionKind;
  listingId: string;
  item: InventoryItem;
  price: number;
  currency: Currency;
  counterpartyPlayerId: string;
  counterpartyName: string;
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
  category: QuestCategory;
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
  icon?: string;
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
  description: string;
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
  description: string;
  icon: string;
  leaderPlayerId: string;
  leaderName: string;
  memberCount: number;
  memberCapacity: number;
  level: number;
  gold: number;
  diamonds: number;
  members?: ClanMemberView[];
  benefitCategoryLevels?: Record<ClanBenefitCategory, number>;
}

export interface GameShopPackage {
  id: string;
  name: string;
  diamonds: number;
  priceLabel: string;
  bonusLabel?: string;
  description?: string;
  featured?: boolean;
  bestValue?: boolean;
}

export interface GameShopPurchaseHistoryEntry {
  id: string;
  packageId: string;
  packageName: string;
  diamonds: number;
  priceLabel: string;
  pixHash: string;
  receiptNote?: string;
  createdAt: number;
  grantedAt: number;
  grantedByPlayerId?: string;
}

export interface GameShopContactInfo {
  pixHash: string;
  whatsappUrl?: string;
  contactEmail?: string;
}

export interface RankingEntry {
  playerId: string;
  name: string;
  level: number;
  arenaWins: number;
  arenaLosses: number;
  arenaRankedPoints: number;
  dungeonFloorsTotal?: number;
  dungeonFloorsByCountry?: Record<string, number>;
}

export interface PlayerPublicProfile {
  playerId: string;
  name: string;
  avatarId?: string;
  level: number;
  cityName: string;
  countryName: string;
  clanName?: string;
  clanIcon?: string;
  clanLevel?: number;
  arenaWins: number;
  arenaLosses: number;
  arenaRankedPoints: number;
  dungeonClears: number;
  royalSealUntil?: number;
  pveAutoUntil?: number;
  equipment: Array<{ slot: EquipmentSlot; item: InventoryItem | null }>;
  online: boolean;
}

export interface AvatarDefinition {
  id: string;
  name: string;
  icon: AvatarIcon;
  accent: string;
  imageUrl?: string;
  priceDiamonds: number;
  exclusive?: boolean;
  unlockHint?: string;
}

export interface ArenaSeasonEntry {
  playerId: string;
  name: string;
  arenaRankedPoints: number;
  rank: number;
}

export interface ArenaSeasonData {
  seasonKey: string;
  ranking: ArenaSeasonEntry[];
}

export interface ClanRankingEntry {
  id: string;
  name: string;
  icon: string;
  leaderPlayerId: string;
  leaderName: string;
  memberCount: number;
  memberCapacity: number;
  level: number;
  gold: number;
  diamonds: number;
}

export interface ReferralFriendView {
  playerId: string;
  name: string;
  level: number;
  eligible: boolean;
  claimed: boolean;
}

export interface ReferralView {
  code: string;
  rewardLevel: number;
  reward: {
    gold: number;
    diamonds: number;
  };
  invitedFriends: ReferralFriendView[];
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
  huntingLocations: HuntingLocationDefinition[];
  cityMonsters: MonsterDefinition[];
  monsterCatalog: Record<string, MonsterDefinition>;
  itemCatalog: Record<string, ItemDefinition>;
  avatarCatalog: AvatarDefinition[];
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
  diamondPurchaseHistory: GameShopPurchaseHistoryEntry[];
  gameShopContact: GameShopContactInfo;
  gameShopCanManualGrant: boolean;
  availableCraftingRecipes: {
    blacksmith: CraftingRecipe[];
    alchemist: CraftingRecipe[];
  };
  rankings: {
    level: RankingEntry[];
    arena: RankingEntry[];
    dungeonTotal: RankingEntry[];
    dungeonByCountry: Record<string, RankingEntry[]>;
    clans: ClanRankingEntry[];
  };
  onlineCount: number;
  registeredPlayersCount: number;
  arenaQueueSize: number;
  nextRegenAt: number;
  monarchEvent: MonarchEventView | null;
  monarchGenerals: MonarchGeneralView[];
  activeEvents: TemporaryEventView[];
  regenHpAmount: number;
  regenEnergyAmount: number;
  clanChatMessages: ChatMessage[];
  privateMessages: PrivateMessage[];
  onlinePlayers: Array<{ playerId: string; name: string }>;
  playerDirectory: Array<{ playerId: string; name: string }>;
  referrals: ReferralView;
  workServices: WorkServiceDefinition[];
  arenaSeasonKey: string;
  lastArenaSeason: ArenaSeasonData | null;
}

export interface ServerError {
  message: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  inviteCode?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface VerifyEmailPayload {
  token: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface DeveloperMessagePayload {
  subject?: string;
  message: string;
}

export interface AuthOkPayload {
  sessionToken: string;
  playerId: string;
}

export interface AuthNoticePayload {
  message: string;
  mode?: "login" | "register" | "forgot" | "reset";
}

export interface AllocatePayload extends Partial<Attributes> {}

export interface TravelPayload {
  cityId: string;
}

export interface ShopBuyPayload {
  itemId: string;
  quantity?: number;
  shop?: "armorer" | "apothecary" | "moneyChanger" | "goldCoinMerchant";
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

export interface DestroyItemPayload {
  instanceId: string;
  quantity?: number;
}

export interface HuntStartPayload {
  monsterId: string;
}

export interface DungeonStartPayload {
  floor?: number;
  monsterId?: string;
}

export interface ArenaDuelPayload {
  playerId: string;
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
  targetPlayerName?: string;
  targetPlayerId?: string;
  text: string;
}

export interface PlayerInspectPayload {
  playerId: string;
}

export interface ReferralClaimPayload {
  playerId: string;
}

export interface CraftPayload {
  recipeId: string;
}

export interface EnhancePayload {
  instanceId: string;
  creationStones?: number;
}

export interface WorkStartPayload {
  serviceId: string;
  minutes?: number;
  hours?: number;
}

export interface WorkBonusClaimPayload {
  serviceId: string;
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

export interface GameShopAdminGrantPayload {
  packageId: string;
  targetPlayerId: string;
  pixHash?: string;
  receiptNote?: string;
}

export interface AvatarSelectPayload {
  avatarId: string;
}

export interface ClanCreatePayload {
  name: string;
  icon?: string;
}

export interface ClanUpdatePayload {
  name: string;
  icon?: string;
  description?: string;
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
