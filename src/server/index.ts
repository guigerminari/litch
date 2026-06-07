import { createServer, type ServerResponse } from "node:http";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { Server } from "socket.io";
import type {
  AllocatePayload,
  ArenaDuelPayload,
  AvatarSelectPayload,
  BattleActionPayload,
  Character,
  ChangePasswordPayload,
  ClanBenefitBuyPayload,
  ClanChatSendPayload,
  ClanCreatePayload,
  ClanDonatePayload,
  ClanKickPayload,
  ClanJoinPayload,
  ClanTransferLeadershipPayload,
  ClanUpdatePayload,
  CraftPayload,
  Currency,
  CurrencyExchangePayload,
  DestroyItemPayload,
  DeveloperMessagePayload,
  DungeonBuffType,
  DungeonRoomState,
  DungeonStartPayload,
  DungeonTrapType,
  EnhancePayload,
  ForgotPasswordPayload,
  EquipPayload,
  GameState,
  GameShopAdminGrantPayload,
  GameShopPurchasePayload,
  HuntStartPayload,
  InventoryItem,
  ItemTradeActionPayload,
  ItemTradeBundle,
  ItemTradeCounterPayload,
  ItemTradeCreatePayload,
  ItemTradeOffer,
  ItemDefinition,
  LoginPayload,
  MarketBuyPayload,
  MarketCreatePayload,
  MonarchEventState,
  MonarchRankingEntry,
  MonarchRewardEntry,
  Player,
  PlayerInspectPayload,
  PlayerPublicProfile,
  PlayerNotification,
  PlayerNotificationKind,
  PrivateReadPayload,
  PrivateSendPayload,
  QuestCategory,
  QuestClaimPayload,
  QuestView,
  Rarity,
  ReferralClaimPayload,
  RegisterPayload,
  ResetPayload,
  ResetPasswordPayload,
  SellPayload,
  ShopBuyPayload,
  TalentBuyPayload,
  TravelPayload,
  UseItemPayload,
  VerifyEmailPayload,
  WorkBonusClaimPayload,
  WorkReward,
  WorkServiceDefinition,
  WorkStartPayload
} from "../shared/types";
import { RARITY_PRICE_MULTIPLIER, getRarityFromRoll } from "../shared/rarity";
import {
  ENHANCEMENT_CREATION_STONE_BONUS,
  ENHANCEMENT_GOLD_STEP,
  ENHANCEMENT_ITEMS,
  canEnhanceLevelInCountry,
  describeEnhancementLevelRange,
  getEnhancementBaseChance,
  getEnhancementMaterialQuantity
} from "../shared/enhancement";
import {
  CITIES,
  AVATARS,
  CLAN_BENEFITS,
  CLAN_SUPER_BENEFITS,
  COUNTRIES,
  CRAFTING_RECIPES,
  DIAMOND_PACKAGES,
  HUNTING_LOCATIONS,
  ITEM_CATALOG,
  MONSTERS,
  SHIP_TICKET_ID,
  STARTING_CITY_ID,
  TEMPORARY_EVENTS,
  TRAIN_TICKET_ID,
  TALENTS,
  WORK_SERVICES
} from "./content";
import {
  createDungeonBattle,
  createMonarchBattle,
  createPveBattle,
  createPvpBattle,
  createRankedPvpBattle,
  fleeBattle,
  syncCharacterVitalsFromBattle,
  takeMonarchBattleTurn,
  takeBattleTurn,
  takeAutoPveTurn
} from "./domain/battle";
import { addItem, findInventoryItem, getInventoryCapacity, hasCapacity, inventoryUsed, isEquipped, removeItem } from "./domain/inventory";
import { deriveStats, experienceForNextLevel, grantExperience } from "./domain/stats";
import { store, type AuthAccount } from "./store";
import { closePersistentStore, flushPersistentStore, loadPersistentStore, persistStoreSoon } from "./persistence";
import { sendGameEmail } from "./mailer";
import { analyticsEnabled, shutdownAnalytics, trackEvent } from "./analytics";
import {
  calculateWorkReward,
  getDefaultWorkAptitude,
  isWorkInProgress,
  isWorkReady,
  normalizeWorkMinutes,
  progressWorkAptitude
} from "../shared/work";
import { getActiveTemporaryEventViews } from "../shared/temporaryEvents";
import { normalizeClanCrestId } from "../shared/clan";

const PORT = Number(process.env.PORT ?? 3001);
const TRADE_INTERACTION_TIMEOUT_MS = 24 * 60 * 60 * 1000;
const RENDER_EXTERNAL_URL = process.env.RENDER_EXTERNAL_URL?.trim() || undefined;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? RENDER_EXTERNAL_URL ?? "http://127.0.0.1:5173";
const PUBLIC_APP_URL = process.env.PUBLIC_APP_URL ?? RENDER_EXTERNAL_URL ?? CLIENT_ORIGIN;
const GAME_SHOP_ADMIN_EMAIL = (process.env.GAME_SHOP_ADMIN_EMAIL ?? "gags.guilherme@gmail.com").trim().toLowerCase();
const GAME_SHOP_PIX_HASH = (
  process.env.GAME_SHOP_PIX_HASH ??
  "00020101021126580014br.gov.bcb.pix01364f57dcbb-2df9-4171-8d60-ed74b1e525d55204000053039865802BR592352 3 6 G A G DOS SANTOS6013SAO JOAO DA B62070503***630400BC"
).trim();
const GAME_SHOP_WHATSAPP_URL = (process.env.GAME_SHOP_WHATSAPP_URL ?? "https://wa.me/5535984652456").trim();
const GAME_SHOP_CONTACT_EMAIL = (process.env.GAME_SHOP_CONTACT_EMAIL ?? "gags.guilherme@gmail.com").trim();
const PASSWORD_MIN_LENGTH = 6;
const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;
const POTION_MISSION_TARGETS = [5, 50, 100, 200];
const WORK_MISSION_TARGETS = [1, 10, 50, 100];
const MONARCH_MISSION_TARGETS = [1, 5, 20, 50];
const ARENA_BATTLE_MISSION_TARGETS = [1, 10, 50, 100];
const ARENA_WIN_MISSION_TARGETS = [1, 10, 50, 100];
const ENHANCEMENT_ATTEMPT_MISSION_TARGETS = [1, 10, 50, 100];
const ENHANCEMENT_SUCCESS_MISSION_TARGETS = [1, 5, 15, 30];
const CLAN_BASE_MEMBER_CAPACITY = 20;
const CLAN_CREATE_MIN_LEVEL = 15;
const CLAN_CREATE_DIAMOND_COST = 10;
const CLAN_BENEFIT_RESET_DIAMOND_COST = 1000;
const CLAN_BENEFIT_RESET_REFUND_RATE = 0.8;
const CLAN_JOIN_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const DEATH_XP_PENALTY_PERCENT = 0.2;
const DUNGEON_KEY_ITEM_ID = "misc_dungeon_key";
const DUNGEON_TOTAL_FLOORS = 20;
const DUNGEON_DAILY_KEYS = 5;
const DUNGEON_ROOM_TIME_LIMIT_MS = 60 * 1000;
const ROYAL_FRIEND_PACKAGE_ID = "friend_of_king";
const ROYAL_FRIEND_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
const CLIENT_DIST_DIR = resolve(process.cwd(), "dist");
const STATIC_MIME_TYPES: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".webp": "image/webp"
};

function getStaticMimeType(filePath: string) {
  return STATIC_MIME_TYPES[extname(filePath).toLowerCase()] ?? "application/octet-stream";
}

function resolveStaticPath(pathname: string) {
  let decoded = "/";
  try {
    decoded = decodeURIComponent(pathname.split("?")[0] || "/");
  } catch {
    return null;
  }
  const safePath = normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  const requestedPath = join(CLIENT_DIST_DIR, safePath === "/" ? "index.html" : safePath);
  const resolvedPath = resolve(requestedPath);
  if (!resolvedPath.startsWith(CLIENT_DIST_DIR)) {
    return null;
  }
  if (existsSync(resolvedPath) && statSync(resolvedPath).isFile()) {
    return resolvedPath;
  }
  const indexPath = join(CLIENT_DIST_DIR, "index.html");
  return existsSync(indexPath) ? indexPath : null;
}

function serveStaticFile(pathname: string, response: ServerResponse) {
  const filePath = resolveStaticPath(pathname);
  if (!filePath) {
    response.writeHead(404, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "not_found" }));
    return;
  }

  response.writeHead(200, {
    "content-type": getStaticMimeType(filePath),
    "cache-control": filePath.endsWith("index.html") ? "no-cache" : "public, max-age=31536000, immutable"
  });
  createReadStream(filePath).pipe(response);
}

function gameShopContactInfo() {
  return {
    pixHash: GAME_SHOP_PIX_HASH,
    whatsappUrl: GAME_SHOP_WHATSAPP_URL || undefined,
    contactEmail: GAME_SHOP_CONTACT_EMAIL || undefined
  };
}
const DEFAULT_AVATAR_ID = "recruta";
const LEGACY_AVATAR_ID_MAP: Record<string, string> = {
  wanderer: "andarilho",
  guardian: "recruta",
  duelist: "assassino",
  ember: "barbaro",
  arcane: "maga",
  shadow: "necromante",
  sovereign: "paladino",
  crystal: "dragao",
  arena_champion: "campeao_arena"
};
const REFERRAL_REWARD_LEVEL = 30;
const REFERRAL_REWARD_GOLD = 30000;
const REFERRAL_REWARD_DIAMONDS = 30;
const MORTHALY_COUNTRY_ID = "morthaly";
const MONARCH_ACCESS_KEY_ID = "misc_high_dungeon_key";
const MONARCH_DAILY_ATTEMPT_LIMIT = 10;
const MONARCH_EXPIRED_REWARD_RATE = 0.15;
const MONARCH_KING_REWARD_MULTIPLIER = 3;
const ARENA_RANKED_STARTING_POINTS = 100;
const ARENA_RANKED_WIN_POINTS = 5;
const ARENA_RANKED_LOSS_POINTS = 2;
const ARENA_RANKED_BLUE_COIN_COST = 1;
const ARENA_RANKED_DAILY_BLUE_COINS = 10;
const ARENA_RANKED_LOSS_GOLD = 5000;
const ARENA_RANKED_WIN_GOLD = 10000;
const ARENA_RANKED_WIN_CREATION_STONES = 1;
const ARENA_BLUE_COIN_ID = "material_blue_coin";
const ARENA_GOLD_COIN_ID = "material_gold_coin";
const ARENA_CHAMPION_AVATAR_ID = "campeao_arena";
const MONARCH_SCHEDULE = [
  {
    id: "rei-lich",
    name: "Rei Litch",
    title: "Monarca do Domingo",
    imageUrl: "/assets/monarchs/rei-lich.png",
    level: 50,
    maxHp: 51000000,
    strength: 520,
    defense: 240,
    agility: 72,
    experience: 120000,
    gold: 70000,
    isKing: true
  },
  {
    id: "monday",
    name: "General Mortis, o Estandarte Oco",
    title: "General Undead de Segunda",
    imageUrl: "/assets/monarchs/monday.png",
    level: 34,
    maxHp: 12500000,
    strength: 260,
    defense: 120,
    agility: 42,
    experience: 52000,
    gold: 26000
  },
  {
    id: "tuesday",
    name: "Guardião Vael",
    title: "General Undead de Terca",
    imageUrl: "/assets/monarchs/tuesday.png",
    level: 36,
    maxHp: 14500000,
    strength: 285,
    defense: 135,
    agility: 48,
    experience: 59000,
    gold: 30000
  },
  {
    id: "wednesday",
    name: "Carrasco Ossur",
    title: "General Undead de Quarta",
    imageUrl: "/assets/monarchs/wednesday.png",
    level: 38,
    maxHp: 16500000,
    strength: 315,
    defense: 148,
    agility: 44,
    experience: 66000,
    gold: 34000
  },
  {
    id: "thursday",
    name: "Profeta Nulgrave",
    title: "General Undead de Quinta",
    imageUrl: "/assets/monarchs/thursday.png",
    level: 40,
    maxHp: 18500000,
    strength: 340,
    defense: 160,
    agility: 55,
    experience: 74000,
    gold: 38000
  },
  {
    id: "friday",
    name: "Marechal Varkul",
    title: "General Undead de Sexta",
    imageUrl: "/assets/monarchs/friday.png",
    level: 42,
    maxHp: 21000000,
    strength: 370,
    defense: 178,
    agility: 58,
    experience: 83000,
    gold: 43000
  },
  {
    id: "saturday",
    name: "Dama Sepulcral Seralyth",
    title: "General Undead de Sábado",
    imageUrl: "/assets/monarchs/saturday.png",
    level: 48,
    maxHp: 21000000,
    strength: 420,
    defense: 198,
    agility: 98,
    experience: 100000,
    gold: 55000
  }
] as const;
const DAILY_MISSIONS = [
  { id: "daily-defeat-3", title: "Patrulha diária", target: 3, reward: { experience: 90, gold: 45 } },
  { id: "daily-defeat-8", title: "Limpeza das rotas", target: 8, reward: { experience: 220, gold: 110 } },
  { id: "daily-defeat-15", title: "Caçada longa", target: 15, reward: { experience: 480, gold: 240 } }
];

const DAILY_EXTRA_MISSIONS = [
  { id: "daily-work-1", category: "work" as const, title: "Expediente arcano", description: "Conclua 1 serviço de trabalho hoje.", progressKey: "dailyWorkServicesCompleted" as const, target: 1, reward: { experience: 160, gold: 90 } },
  { id: "daily-work-3", category: "work" as const, title: "Turno dobrado", description: "Conclua 3 serviços de trabalho hoje.", progressKey: "dailyWorkServicesCompleted" as const, target: 3, reward: { experience: 360, gold: 210 } },
  { id: "daily-monarch-1", category: "monarch" as const, title: "Chamado de Morthaly", description: "Enfrente o monarca do dia 1 vez.", progressKey: "dailyMonarchBattles" as const, target: 1, reward: { experience: 420, diamonds: 2 } },
  { id: "daily-arena-1", category: "arena" as const, title: "Sangue na arena", description: "Dispute 1 batalha de Arena hoje.", progressKey: "dailyArenaBattles" as const, target: 1, reward: { experience: 180, gold: 120 } },
  { id: "daily-arena-win-1", category: "arena" as const, title: "Glória da Arena", description: "Vença 1 batalha de Arena hoje.", progressKey: "dailyArenaWins" as const, target: 1, reward: { experience: 320, diamonds: 1 } }
];

const dungeonRoomTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

await loadPersistentStore();

function getCurrentSeasonKey() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

function maybeEndSeason() {
  const currentKey = getCurrentSeasonKey();
  if (store.arenaSeasonKey === currentKey) {
    return;
  }

  if (store.arenaSeasonKey !== "") {
    const ranked = Array.from(store.characters.values())
      .map((ch) => ({
        playerId: ch.playerId,
        name: ch.name,
        arenaRankedPoints: ch.arenaRankedPoints ?? ARENA_RANKED_STARTING_POINTS
      }))
      .sort((a, b) => b.arenaRankedPoints - a.arenaRankedPoints || a.name.localeCompare(b.name));

    const seasonRanking = ranked.map((entry, index) => ({ ...entry, rank: index + 1 }));
    store.lastArenaSeason = { seasonKey: store.arenaSeasonKey, ranking: seasonRanking.slice(0, 20) };

    for (const entry of seasonRanking) {
      const ch = store.characters.get(entry.playerId);
      if (!ch) continue;
      let goldCoins = 0;
      if (entry.rank === 1) {
        goldCoins = 50;
        if (!ch.unlockedAvatarIds) ch.unlockedAvatarIds = [];
        if (!ch.unlockedAvatarIds.includes(ARENA_CHAMPION_AVATAR_ID)) {
          ch.unlockedAvatarIds.push(ARENA_CHAMPION_AVATAR_ID);
        }
      } else if (entry.rank === 2) {
        goldCoins = 30;
      } else if (entry.rank === 3) {
        goldCoins = 20;
      } else if (entry.rank <= 10) {
        goldCoins = 10;
      } else if (entry.rank <= 20) {
        goldCoins = 5;
      }
      if (goldCoins > 0) {
        grantPackageStack(ch, ARENA_GOLD_COIN_ID, goldCoins);
      }
      pushPlayerNotification(
        entry.playerId,
        "arena_season",
        "Temporada da Arena encerrada",
        `Você terminou a temporada ${store.arenaSeasonKey} na posição #${entry.rank}. Recompensa: ${goldCoins > 0 ? `${goldCoins} moeda(s) de ouro da Arena` : "sem premiação"}.`,
        { seasonKey: store.arenaSeasonKey, rank: entry.rank, goldCoins }
      );
    }

    for (const ch of store.characters.values()) {
      ch.arenaRankedPoints = ARENA_RANKED_STARTING_POINTS;
    }
  }

  store.arenaSeasonKey = currentKey;
  persistStoreSoon();
}

maybeEndSeason();
setInterval(maybeEndSeason, 60 * 60 * 1000);

let activeTemporaryEventKey = getActiveTemporaryEventViews(TEMPORARY_EVENTS)
  .map((event) => `${event.id}:${event.startsAtMs}`)
  .sort()
  .join("|");
setInterval(() => {
  const nextKey = getActiveTemporaryEventViews(TEMPORARY_EVENTS)
    .map((event) => `${event.id}:${event.startsAtMs}`)
    .sort()
    .join("|");
  if (nextKey !== activeTemporaryEventKey) {
    activeTemporaryEventKey = nextKey;
    broadcastWorldState();
  }
}, 60 * 1000);

const httpServer = createServer((request, response) => {
  if (request.url === "/health") {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ ok: true }));
    return;
  }

  serveStaticFile(request.url ?? "/", response);
});

const isDevelopment = process.env.NODE_ENV !== "production";

const io = new Server(httpServer, {
  cors: {
    origin: isDevelopment ? true : [CLIENT_ORIGIN, "http://localhost:5173"],
    credentials: true
  }
});

console.log(`[analytics] PostHog ${analyticsEnabled() ? "enabled" : "disabled"}`);

type AuthedSocket = Parameters<Parameters<typeof io.on>[1]>[0] & {
  data: { playerId?: string; sessionToken?: string };
};

function createCharacter(player: Player): Character {
  const character: Character = {
    id: randomUUID(),
    playerId: player.id,
    name: player.username,
    level: 1,
    experience: 0,
    gold: 100,
    diamonds: 0,
    currentHp: 0,
    currentEnergy: 0,
    cityId: STARTING_CITY_ID,
    attributes: { strength: 1, constitution: 1, agility: 1 },
    unspentAttributePoints: 0,
    equipment: { weapon: null, armor: null, amulet: null },
    inventory: [],
    activeBattleId: null,
    questProgress: createQuestProgress(),
    talentAllocations: {},
    clanId: null,
    clanBenefitAllocations: {},
    arenaWins: 0,
    arenaLosses: 0,
    arenaRankedPoints: ARENA_RANKED_STARTING_POINTS,
    dungeonClears: 0,
    marketHistory: [],
    diamondPurchaseHistory: [],
    pveAutoUntil: 0,
    royalSealUntil: 0,
    avatarId: DEFAULT_AVATAR_ID,
    unlockedAvatarIds: AVATARS.filter((avatar) => avatar.priceDiamonds === 0 && !avatar.exclusive).map((avatar) => avatar.id),
    referralRewardsClaimedFor: [],
    monarchAttempts: { dayKey: "", count: 0 },
    activeWork: null,
    workAptitudes: {},
    workBonusClaims: {},
    clanJoinCooldownUntil: 0,
    dungeonProgress: {
      unlockedFloorByCountry: {},
      dailyKeyDayKey: "",
      activeRun: null
    }
  };

  addItem(character, "training_sword", ITEM_CATALOG, 1);
  addItem(character, "health_potion_light", ITEM_CATALOG, 15);
  addItem(character, "energy_potion_light", ITEM_CATALOG, 10);
  character.equipment.weapon = character.inventory.find((item) => item.itemId === "training_sword")?.instanceId ?? null;
  const stats = deriveStats(character, ITEM_CATALOG);
  character.currentHp = stats.maxHp;
  character.currentEnergy = stats.maxEnergy;

  return character;
}

function currentCharacter(playerId: string) {
  const character = store.characters.get(playerId);
  if (!character) {
    throw new Error("Personagem não encontrado.");
  }
  character.diamonds ??= 0;
  character.talentAllocations ??= {};
  character.clanId ??= null;
  syncClanBenefits(character);
  character.arenaWins ??= 0;
  character.arenaLosses ??= 0;
  character.arenaRankedPoints ??= ARENA_RANKED_STARTING_POINTS;
  character.dungeonClears ??= 0;
  character.marketHistory ??= [];
  character.diamondPurchaseHistory ??= [];
  character.pveAutoUntil ??= 0;
  character.royalSealUntil ??= 0;
  character.unlockedAvatarIds ??= AVATARS.filter((avatar) => avatar.priceDiamonds === 0 && !avatar.exclusive).map((avatar) => avatar.id);
  character.unlockedAvatarIds = Array.from(
    new Set(character.unlockedAvatarIds.map((avatarId) => LEGACY_AVATAR_ID_MAP[avatarId] ?? avatarId))
  );
  if (character.avatarId && LEGACY_AVATAR_ID_MAP[character.avatarId]) {
    character.avatarId = LEGACY_AVATAR_ID_MAP[character.avatarId];
  }
  character.referralRewardsClaimedFor ??= [];
  character.avatarId = AVATARS.some((avatar) => avatar.id === character.avatarId) ? character.avatarId : DEFAULT_AVATAR_ID;
  if (!character.unlockedAvatarIds.includes(DEFAULT_AVATAR_ID)) {
    character.unlockedAvatarIds.push(DEFAULT_AVATAR_ID);
  }
  if (character.avatarId && !character.unlockedAvatarIds.includes(character.avatarId)) {
    character.avatarId = DEFAULT_AVATAR_ID;
  }
  character.monarchAttempts ??= { dayKey: "", count: 0 };
  character.activeWork ??= null;
  normalizeActiveWorkDuration(character);
  character.workAptitudes ??= {};
  character.workBonusClaims ??= {};
  character.clanJoinCooldownUntil ??= 0;
  character.dungeonProgress ??= {};
  character.dungeonProgress.unlockedFloorByCountry ??= {};
  character.dungeonProgress.clearedFloorsByCountry ??= {};
  character.dungeonProgress.dailyKeyDayKey ??= "";
  character.dungeonProgress.activeRun ??= null;
  ensureQuestProgress(character);
  ensureDungeonRoomTimeout(character, playerId);
  return character;
}

function pushMarketHistory(
  character: Character,
  entry: {
    kind: "buy" | "sell";
    listingId: string;
    item: InventoryItem;
    price: number;
    currency: Currency;
    counterpartyPlayerId: string;
    counterpartyName: string;
  }
) {
  character.marketHistory = [
    {
      id: randomUUID(),
      createdAt: Date.now(),
      ...entry
    },
    ...(character.marketHistory ?? [])
  ].slice(0, 60);
}

function currentPlayer(playerId: string) {
  const player = store.players.get(playerId);
  if (!player) {
    throw new Error("Recruta não encontrado.");
  }
  player.email ??= "";
  ensureReferralCode(player);
  return player;
}

function buildReferralView(playerId: string) {
  const player = currentPlayer(playerId);
  const character = currentCharacter(playerId);
  const claimed = new Set(character.referralRewardsClaimedFor ?? []);
  const invitedFriends = Array.from(store.players.values())
    .filter((candidate) => candidate.referredByPlayerId === playerId)
    .map((candidate) => {
      const invitedCharacter = store.characters.get(candidate.id);
      const level = invitedCharacter?.level ?? 1;
      return {
        playerId: candidate.id,
        name: invitedCharacter?.name ?? candidate.username,
        level,
        eligible: level >= REFERRAL_REWARD_LEVEL,
        claimed: claimed.has(candidate.id)
      };
    })
    .sort((a, b) => Number(a.claimed) - Number(b.claimed) || b.level - a.level || a.name.localeCompare(b.name));

  return {
    code: ensureReferralCode(player),
    rewardLevel: REFERRAL_REWARD_LEVEL,
    reward: {
      gold: REFERRAL_REWARD_GOLD,
      diamonds: REFERRAL_REWARD_DIAMONDS
    },
    invitedFriends
  };
}

function serializeGameState(playerId: string): GameState {
  const player = currentPlayer(playerId);
  const character = currentCharacter(playerId);
  ensureQuestProgress(character);
  normalizeVitals(character);
  const currentCity = CITIES.find((city) => city.id === character.cityId) ?? CITIES[0];
  const currentCountry = COUNTRIES.find((country) => country.id === currentCity.countryId) ?? COUNTRIES[0];
  const cityHuntLocations = (currentCity.huntLocationIds ?? [])
    .map((id) => HUNTING_LOCATIONS[id])
    .filter(Boolean);
  const activeBattle = character.activeBattleId ? store.battles.get(character.activeBattleId) ?? null : null;
  const activeEvents = getActiveTemporaryEventViews(TEMPORARY_EVENTS);
  ensureTemporaryEventNotifications(playerId, activeEvents);
  const availableRecipes = getAvailableCraftingRecipes(character.cityId);
  const clan = character.clanId ? store.clans.get(character.clanId) ?? null : null;
  const derived = deriveStats(character, ITEM_CATALOG);
  const regenHpAmount = Math.ceil(derived.maxHp * (0.10 + derived.hpRegenBonusPercent));
  const regenEnergyAmount = Math.ceil(derived.maxEnergy * (0.10 + derived.energyRegenBonusPercent));
  const clanChatMessages = character.clanId ? (store.clanChatMessages.get(character.clanId) ?? []) : [];
  const privateMessages = store.allPrivateMessages.filter(
    (msg) => msg.fromPlayerId === playerId || msg.toPlayerId === playerId
  );
  const onlinePlayers = Array.from(store.socketsByPlayer.keys())
    .map((pid) => {
      const ch = store.characters.get(pid);
      return ch
        ? {
            playerId: pid,
            name: ch.name,
            ...(ch.avatarId ? { avatarId: ch.avatarId } : {}),
            ...(ch.royalSealUntil ? { royalSealUntil: ch.royalSealUntil } : {})
          }
        : null;
    })
    .filter((entry): entry is { playerId: string; name: string; avatarId?: string; royalSealUntil?: number } => entry !== null);
  const playerDirectory = Array.from(store.characters.values())
    .map((character) => ({
      playerId: character.playerId,
      name: character.name,
      ...(character.avatarId ? { avatarId: character.avatarId } : {}),
      ...(character.royalSealUntil ? { royalSealUntil: character.royalSealUntil } : {})
    }))
    .filter((entry) => entry.playerId !== playerId)
    .sort((a, b) => a.name.localeCompare(b.name));
  const notifications = store.notifications
    .filter((notification) => notification.playerId === playerId)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 80);

  return {
    player,
    character,
    derived,
    inventoryUsed: inventoryUsed(character),
    inventoryCapacity: getInventoryCapacity(character),
    cities: CITIES,
    countries: COUNTRIES,
    currentCity,
    currentCountry,
    cityHuntLocations,
    huntingLocations: Object.values(HUNTING_LOCATIONS),
    cityMonsters: Array.from(
      new Set([
        ...cityHuntLocations.flatMap((location) => location.monsterIds),
        ...(currentCity.dungeonMonsterIds ?? [])
      ])
    )
      .map((id) => MONSTERS[id])
      .filter(Boolean),
    monsterCatalog: MONSTERS,
    itemCatalog: ITEM_CATALOG,
    avatarCatalog: AVATARS,
    activeBattle,
    chatMessages: store.chatMessages,
    marketplaceListings: Array.from(store.marketplace.values()).sort((a, b) => b.createdAt - a.createdAt),
    itemTrades: Array.from(store.itemTrades.values())
      .filter((trade) => trade.fromPlayerId === playerId || trade.toPlayerId === playerId)
      .sort((a, b) => b.createdAt - a.createdAt),
    quests: buildQuests(character),
    talents: TALENTS,
    clanBenefits: CLAN_BENEFITS,
    clanSuperBenefits: CLAN_SUPER_BENEFITS,
    clan: clan ? decorateClan(clan) : null,
    clanDirectory: buildClanDirectory(),
    diamondPackages: DIAMOND_PACKAGES,
    diamondPurchaseHistory: [...(character.diamondPurchaseHistory ?? [])].sort((a, b) => b.grantedAt - a.grantedAt).slice(0, 50),
    gameShopContact: gameShopContactInfo(),
    gameShopCanManualGrant: Boolean(GAME_SHOP_ADMIN_EMAIL) && (player.email ?? "").toLowerCase() === GAME_SHOP_ADMIN_EMAIL,
    availableCraftingRecipes: availableRecipes,
    rankings: buildRankings(),
    onlineCount: store.socketsByPlayer.size,
    registeredPlayersCount: store.players.size,
    arenaQueueSize: store.arenaQueue.length,
    nextRegenAt: store.nextRegenAt,
    monarchEvent: buildMonarchEventView(playerId),
    monarchGenerals: MONARCH_SCHEDULE.map((general) => ({
      ...general,
      isKing: "isKing" in general ? Boolean(general.isKing) : false
    })),
    activeEvents,
    regenHpAmount,
    regenEnergyAmount,
    clanChatMessages,
    privateMessages,
    onlinePlayers,
    playerDirectory,
    referrals: buildReferralView(playerId),
    workServices: WORK_SERVICES,
    arenaSeasonKey: store.arenaSeasonKey,
    lastArenaSeason: store.lastArenaSeason,
    notifications
  };
}

function emitState(playerId: string) {
  expireStaleItemTrades();
  const socketIds = store.socketsByPlayer.get(playerId);
  if (!socketIds) {
    return;
  }

  const state = serializeGameState(playerId);
  persistStoreSoon();
  for (const socketId of socketIds) {
    io.to(socketId).emit("game:state", state);
  }
}

function emitMany(playerIds: Iterable<string>) {
  const targetPlayerIds = new Set(playerIds);
  for (const expiredPlayerId of expireStaleItemTrades()) {
    targetPlayerIds.add(expiredPlayerId);
  }
  persistStoreSoon();
  for (const playerId of targetPlayerIds) {
    emitState(playerId);
  }
}

function broadcastWorldState() {
  persistStoreSoon();
  emitMany(store.players.keys());
}

function pushPlayerNotification(
  playerId: string,
  kind: PlayerNotificationKind,
  title: string,
  message: string,
  data?: PlayerNotification["data"]
) {
  if (!store.players.has(playerId)) {
    return null;
  }

  const notification: PlayerNotification = {
    id: randomUUID(),
    playerId,
    kind,
    title,
    message,
    createdAt: Date.now(),
    data
  };
  const playerNotifications = [notification, ...store.notifications.filter((entry) => entry.playerId === playerId)].slice(0, 80);
  const otherNotifications = store.notifications.filter((entry) => entry.playerId !== playerId);
  store.notifications = [...playerNotifications, ...otherNotifications];
  return notification;
}

function hasPlayerNotification(playerId: string, kind: PlayerNotificationKind, predicate: (notification: PlayerNotification) => boolean) {
  return store.notifications.some((notification) => notification.playerId === playerId && notification.kind === kind && predicate(notification));
}

function ensureTemporaryEventNotifications(playerId: string, activeEvents: ReturnType<typeof getActiveTemporaryEventViews>) {
  for (const event of activeEvents) {
    const alreadyNotified = hasPlayerNotification(
      playerId,
      "event_started",
      (notification) => notification.data?.eventId === event.id && notification.data?.startsAtMs === event.startsAtMs
    );
    if (alreadyNotified) {
      continue;
    }
    pushPlayerNotification(
      playerId,
      "event_started",
      "Novo evento iniciado",
      `${event.name} está ativo até ${new Date(event.endsAtMs).toLocaleDateString("pt-BR")}.`,
      { eventId: event.id, startsAtMs: event.startsAtMs, endsAtMs: event.endsAtMs }
    );
  }
}

function requirePlayer(socket: AuthedSocket) {
  const playerId = socket.data.playerId;
  if (!playerId) {
    throw new Error("Faça cadastro antes de jogar.");
  }
  return playerId;
}

function handleError(socket: AuthedSocket, error: unknown) {
  const message = error instanceof Error ? error.message : "Erro inesperado.";
  trackEvent(socket.data.playerId, "game_error", {
    message
  });
  socket.emit("game:error", { message });
}

function trackCharacterEvent(playerId: string, event: string, character: Character, properties: Record<string, string | number | boolean | null | undefined> = {}) {
  trackEvent(playerId, event, {
    characterLevel: character.level,
    cityId: character.cityId,
    countryId: getCharacterCountryId(character),
    ...properties
  });
}

function trackLevelUps(playerId: string, beforeLevel: number, character: Character, source: string) {
  if (character.level <= beforeLevel) {
    return;
  }

  for (let level = beforeLevel + 1; level <= character.level; level += 1) {
    trackCharacterEvent(playerId, "level_up", character, {
      level,
      source
    });
  }
}

function sanitizeName(value: string) {
  return value.trim().replace(/\s+/g, " ").slice(0, 24);
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeRecoveryCode(value: string) {
  return value.trim().replace(/[\s-]+/g, "").toUpperCase();
}

function normalizeReferralCode(value: string) {
  return value.trim().replace(/[\s-]+/g, "").toUpperCase();
}

function createRecoveryCode() {
  const raw = randomBytes(6).toString("hex").toUpperCase();
  return raw.match(/.{1,4}/g)?.join("-") ?? raw;
}

function createEmailToken() {
  return randomBytes(32).toString("base64url");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function publicLink(path: "verify-email" | "reset-password", token: string) {
  const url = new URL(PUBLIC_APP_URL);
  url.searchParams.set(path === "verify-email" ? "verifyEmail" : "resetPassword", token);
  return url.toString();
}

async function sendVerificationEmail(account: AuthAccount, playerName: string) {
  const token = createEmailToken();
  const link = publicLink("verify-email", token);
  const safePlayerName = escapeHtml(playerName);
  account.emailVerificationTokenHash = hashSecret(token);
  account.emailVerificationTokenExpiresAt = Date.now() + EMAIL_VERIFICATION_TTL_MS;

  await sendGameEmail({
    to: account.email,
    subject: "Confirme seu e-mail em Litch",
    text: [
      `Olá, ${playerName}.`,
      "Confirme seu e-mail para liberar sua conta em Litch:",
      link,
      "Este link expira em 24 horas."
    ].join("\n\n"),
    html: [
      `<p>Olá, <strong>${safePlayerName}</strong>.</p>`,
      `<p>Confirme seu e-mail para liberar sua conta em <strong>Litch</strong>.</p>`,
      `<p><a href="${link}">Confirmar e-mail</a></p>`,
      "<p>Este link expira em 24 horas.</p>"
    ].join("")
  });
}

async function sendPasswordResetEmail(account: AuthAccount, playerName: string) {
  const token = createEmailToken();
  const link = publicLink("reset-password", token);
  const safePlayerName = escapeHtml(playerName);
  account.passwordResetTokenHash = hashSecret(token);
  account.passwordResetTokenExpiresAt = Date.now() + PASSWORD_RESET_TTL_MS;
  account.passwordResetRequestedAt = Date.now();

  await sendGameEmail({
    to: account.email,
    subject: "Redefina sua senha em Litch",
    text: [
      `Olá, ${playerName}.`,
      "Use este link para redefinir sua senha em Litch:",
      link,
      "O código de recuperação fica oculto no link e expira em 1 hora."
    ].join("\n\n"),
    html: [
      `<p>Olá, <strong>${safePlayerName}</strong>.</p>`,
      "<p>Use o link abaixo para redefinir sua senha em <strong>Litch</strong>.</p>",
      `<p><a href="${link}">Redefinir senha</a></p>`,
      "<p>O código de recuperação fica oculto no link e expira em 1 hora.</p>"
    ].join("")
  });
}

function createReferralCode(username: string, playerId: string) {
  const prefix = username.replace(/[^a-z0-9]/gi, "").slice(0, 5).toUpperCase() || "LITCH";
  return normalizeReferralCode(`${prefix}${playerId.slice(0, 6)}`);
}

function ensureReferralCode(player: Player) {
  if (!player.referralCode) {
    player.referralCode = createReferralCode(player.username, player.id);
  }
  return player.referralCode;
}

function findInviterByReferralCode(code: string) {
  const normalized = normalizeReferralCode(code);
  if (!normalized) {
    return null;
  }
  for (const player of store.players.values()) {
    if (ensureReferralCode(player) === normalized) {
      return player;
    }
  }
  return null;
}

function hashSecret(secret: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(secret, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

function verifySecret(secret: string, storedHash: string) {
  const [scheme, salt, expectedHash] = storedHash.split(":");
  if (scheme !== "scrypt" || !salt || !expectedHash) {
    return false;
  }

  const expected = Buffer.from(expectedHash, "hex");
  const actual = scryptSync(secret, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function assertPassword(password: string) {
  if (password.length < PASSWORD_MIN_LENGTH) {
    throw new Error(`Use uma senha com pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`);
  }
}

function accountForPlayer(playerId: string) {
  const account = Array.from(store.accountsByEmail.values()).find((entry) => entry.playerId === playerId);
  if (!account) {
    throw new Error("Conta não encontrada.");
  }
  return account;
}

function findAccountByToken(token: string, kind: "email" | "password") {
  if (!token) {
    return null;
  }
  const now = Date.now();
  for (const account of store.accountsByEmail.values()) {
    const hash = kind === "email" ? account.emailVerificationTokenHash : account.passwordResetTokenHash;
    const expiresAt = kind === "email" ? account.emailVerificationTokenExpiresAt : account.passwordResetTokenExpiresAt;
    if (!hash || !expiresAt || expiresAt < now) {
      continue;
    }
    if (verifySecret(token, hash)) {
      return account;
    }
  }
  return null;
}

function attachSocketSession(socket: AuthedSocket, playerId: string, sessionToken: string) {
  socket.data.playerId = playerId;
  socket.data.sessionToken = sessionToken;
  socket.join(`player:${playerId}`);
  const sockets = store.socketsByPlayer.get(playerId) ?? new Set<string>();
  sockets.add(socket.id);
  store.socketsByPlayer.set(playerId, sockets);
}

function detachSocketSession(socket: AuthedSocket) {
  const playerId = socket.data.playerId;
  if (!playerId) {
    return null;
  }

  const sockets = store.socketsByPlayer.get(playerId);
  sockets?.delete(socket.id);
  if (!sockets || sockets.size === 0) {
    store.socketsByPlayer.delete(playerId);
  }
  socket.leave(`player:${playerId}`);
  socket.data.playerId = undefined;
  socket.data.sessionToken = undefined;
  return playerId;
}

function deleteSessionsForPlayer(playerId: string) {
  for (const [sessionToken, sessionPlayerId] of store.sessions) {
    if (sessionPlayerId === playerId) {
      store.sessions.delete(sessionToken);
    }
  }
}

function forceLogoutPlayerSockets(playerId: string, exceptSocketId?: string) {
  const socketIds = Array.from(store.socketsByPlayer.get(playerId) ?? []);
  for (const socketId of socketIds) {
    if (socketId === exceptSocketId) {
      continue;
    }
    const playerSocket = io.sockets.sockets.get(socketId) as AuthedSocket | undefined;
    playerSocket?.emit("auth:logout");
    if (playerSocket) {
      detachSocketSession(playerSocket);
    }
  }
}

function createSession(socket: AuthedSocket, playerId: string) {
  if (socket.data.sessionToken) {
    store.sessions.delete(socket.data.sessionToken);
  }
  detachSocketSession(socket);
  const sessionToken = randomUUID();
  store.sessions.set(sessionToken, playerId);
  attachSocketSession(socket, playerId, sessionToken);
  return sessionToken;
}

function currentDayKey() {
  return new Date().toISOString().slice(0, 10);
}

function createQuestProgress() {
  return {
    dayKey: currentDayKey(),
    dailyEnemyDefeats: 0,
    dailyWorkServicesCompleted: 0,
    dailyMonarchBattles: 0,
    dailyArenaBattles: 0,
    dailyArenaWins: 0,
    workServicesCompleted: 0,
    monarchBattles: 0,
    arenaBattles: 0,
    equipmentEnhancementAttempts: 0,
    equipmentEnhancementSuccesses: 0,
    marketItemsSold: 0,
    marketItemsBought: 0,
    shopItemsBought: 0,
    shopItemsSold: 0,
    healthPotionsUsed: 0,
    energyPotionsUsed: 0,
    claimedDailyQuestIds: [],
    claimedFixedQuestIds: []
  };
}

function ensureQuestProgress(character: Character) {
  character.questProgress ??= createQuestProgress();
  character.questProgress.dailyEnemyDefeats ??= 0;
  character.questProgress.dailyWorkServicesCompleted ??= 0;
  character.questProgress.dailyMonarchBattles ??= 0;
  character.questProgress.dailyArenaBattles ??= 0;
  character.questProgress.dailyArenaWins ??= 0;
  character.questProgress.workServicesCompleted ??= 0;
  character.questProgress.monarchBattles ??= 0;
  character.questProgress.arenaBattles ??= (character.arenaWins ?? 0) + (character.arenaLosses ?? 0);
  character.questProgress.equipmentEnhancementAttempts ??= 0;
  character.questProgress.equipmentEnhancementSuccesses ??= 0;
  character.questProgress.marketItemsSold ??= 0;
  character.questProgress.marketItemsBought ??= 0;
  character.questProgress.shopItemsBought ??= 0;
  character.questProgress.shopItemsSold ??= 0;
  character.questProgress.healthPotionsUsed ??= 0;
  character.questProgress.energyPotionsUsed ??= 0;
  character.questProgress.claimedDailyQuestIds ??= [];
  character.questProgress.claimedFixedQuestIds ??= [];

  const today = currentDayKey();
  if (character.questProgress.dayKey !== today) {
    character.questProgress.dayKey = today;
    character.questProgress.dailyEnemyDefeats = 0;
    character.questProgress.dailyWorkServicesCompleted = 0;
    character.questProgress.dailyMonarchBattles = 0;
    character.questProgress.dailyArenaBattles = 0;
    character.questProgress.dailyArenaWins = 0;
    character.questProgress.claimedDailyQuestIds = [];
  }
}

function buildQuests(character: Character) {
  ensureQuestProgress(character);
  const progress = character.questProgress;

  const dailyCombat: QuestView[] = DAILY_MISSIONS.map((mission) => ({
    id: mission.id,
    type: "daily",
    category: "combat",
    title: mission.title,
    description: `Derrote ${mission.target} inimigos hoje.`,
    progress: Math.min(progress.dailyEnemyDefeats, mission.target),
    target: mission.target,
    reward: mission.reward,
    completed: progress.dailyEnemyDefeats >= mission.target,
    claimed: progress.claimedDailyQuestIds.includes(mission.id)
  }));
  const dailyExtra: QuestView[] = DAILY_EXTRA_MISSIONS.map((mission) => {
    const progressValue = progress[mission.progressKey] ?? 0;
    return {
      id: mission.id,
      type: "daily" as const,
      category: mission.category,
      title: mission.title,
      description: mission.description,
      progress: Math.min(progressValue, mission.target),
      target: mission.target,
      reward: mission.reward,
      completed: progressValue >= mission.target,
      claimed: progress.claimedDailyQuestIds.includes(mission.id)
    };
  });
  const daily = [...dailyCombat, ...dailyExtra];

  const levelTargets = buildLevelTargets(character.level);
  const fixed: QuestView[] = [
    ...levelTargets.map((target) => ({
      id: `level-${target}`,
      type: "fixed" as const,
      category: "level" as const,
      title: `Alcance nível ${target}`,
      description: `Evolua seu personagem até o nível ${target}.`,
      progress: Math.min(character.level, target),
      target,
      reward: { diamonds: levelDiamondReward(target) },
      completed: character.level >= target,
      claimed: progress.claimedFixedQuestIds.includes(`level-${target}`)
    })),
    fixedCounterQuest("market-sell-1", "Venda um item no mercado", progress.marketItemsSold, 1, 6, progress, "market"),
    fixedCounterQuest("market-buy-1", "Compre um item no mercado", progress.marketItemsBought, 1, 6, progress, "market"),
    fixedCounterQuest("shop-buy-1", "Compre um item na loja", progress.shopItemsBought, 1, 4, progress, "shop"),
    fixedCounterQuest("shop-sell-1", "Venda um item na loja", progress.shopItemsSold, 1, 4, progress, "shop"),
    ...WORK_MISSION_TARGETS.map((target) =>
      fixedCounterQuest(
        `work-service-${target}`,
        `Conclua ${target} serviços de trabalho`,
        progress.workServicesCompleted,
        target,
        fixedActivityDiamondReward(target),
        progress,
        "work"
      )
    ),
    ...MONARCH_MISSION_TARGETS.map((target) =>
      fixedCounterQuest(
        `monarch-battle-${target}`,
        `Enfrente monarcas ${target} vez(es)`,
        progress.monarchBattles,
        target,
        fixedActivityDiamondReward(target) + 2,
        progress,
        "monarch"
      )
    ),
    ...ARENA_BATTLE_MISSION_TARGETS.map((target) =>
      fixedCounterQuest(
        `arena-battle-${target}`,
        `Dispute ${target} batalhas de Arena`,
        progress.arenaBattles,
        target,
        fixedActivityDiamondReward(target),
        progress,
        "arena"
      )
    ),
    ...ARENA_WIN_MISSION_TARGETS.map((target) =>
      fixedCounterQuest(
        `arena-win-${target}`,
        `Vença ${target} batalhas de Arena`,
        character.arenaWins,
        target,
        fixedActivityDiamondReward(target) + 1,
        progress,
        "arena"
      )
    ),
    ...ENHANCEMENT_ATTEMPT_MISSION_TARGETS.map((target) =>
      fixedCounterQuest(
        `enhancement-attempt-${target}`,
        `Tente aprimorar equipamentos ${target} vez(es)`,
        progress.equipmentEnhancementAttempts,
        target,
        fixedActivityDiamondReward(target),
        progress,
        "enhancement"
      )
    ),
    ...ENHANCEMENT_SUCCESS_MISSION_TARGETS.map((target) =>
      fixedCounterQuest(
        `enhancement-success-${target}`,
        `Aprimore equipamentos com sucesso ${target} vez(es)`,
        progress.equipmentEnhancementSuccesses,
        target,
        fixedActivityDiamondReward(target) + 2,
        progress,
        "enhancement"
      )
    ),
    ...POTION_MISSION_TARGETS.map((target) =>
      fixedCounterQuest(
        `health-potion-${target}`,
        `Use ${target} poções de cura`,
        progress.healthPotionsUsed,
        target,
        potionDiamondReward(target),
        progress,
        "potion"
      )
    ),
    ...POTION_MISSION_TARGETS.map((target) =>
      fixedCounterQuest(
        `energy-potion-${target}`,
        `Use ${target} poções de energia`,
        progress.energyPotionsUsed,
        target,
        potionDiamondReward(target),
        progress,
        "potion"
      )
    )
  ];

  return { daily, fixed };
}

function buildLevelTargets(level: number) {
  const maxGenerated = Math.max(100, Math.ceil((level + 10) / 10) * 10);
  const targets = new Set([3, 5, 10, 15, 20]);
  for (let target = 30; target <= maxGenerated; target += 10) {
    targets.add(target);
  }
  return Array.from(targets).sort((a, b) => a - b);
}

function levelDiamondReward(level: number) {
  return Math.max(3, Math.floor(level * 1.5));
}

function potionDiamondReward(target: number) {
  if (target >= 200) return 90;
  if (target >= 100) return 45;
  if (target >= 50) return 22;
  return 5;
}

function fixedActivityDiamondReward(target: number) {
  if (target >= 100) return 45;
  if (target >= 50) return 24;
  if (target >= 20) return 12;
  if (target >= 10) return 8;
  if (target >= 5) return 6;
  return 4;
}

function recordPotionProgress(character: Character, definition: ItemDefinition | null | undefined) {
  if (!definition || definition.kind !== "potion") {
    return;
  }
  if (definition.stats.healPercent !== undefined || definition.stats.heal !== undefined) {
    character.questProgress.healthPotionsUsed += 1;
  }
  if (definition.stats.energyPercent !== undefined || definition.stats.energy !== undefined) {
    character.questProgress.energyPotionsUsed += 1;
  }
}

function fixedCounterQuest(
  id: string,
  title: string,
  progressValue: number,
  target: number,
  diamonds: number,
  progress: Character["questProgress"],
  category: QuestCategory = "combat"
): QuestView {
  return {
    id,
    type: "fixed",
    category,
    title,
    description: title,
    progress: Math.min(progressValue, target),
    target,
    reward: { diamonds },
    completed: progressValue >= target,
    claimed: progress.claimedFixedQuestIds.includes(id)
  };
}

function claimQuest(character: Character, questId: string) {
  const quests = buildQuests(character);
  const quest = [...quests.daily, ...quests.fixed].find((entry) => entry.id === questId);
  if (!quest) {
    throw new Error("Missão não encontrada.");
  }
  if (!quest.completed) {
    throw new Error("Missão ainda não concluída.");
  }
  if (quest.claimed) {
    throw new Error("Recompensa já resgatada.");
  }

  if (quest.reward.experience) {
    grantExperience(character, quest.reward.experience);
  }
  character.gold += quest.reward.gold ?? 0;
  character.diamonds += quest.reward.diamonds ?? 0;

  if (quest.type === "daily") {
    character.questProgress.claimedDailyQuestIds.push(quest.id);
  } else {
    character.questProgress.claimedFixedQuestIds.push(quest.id);
  }
  normalizeVitals(character);
  return quest;
}

function clearEndedBattle(character: Character) {
  if (!character.activeBattleId) {
    return;
  }
  const battle = store.battles.get(character.activeBattleId);
  if (battle?.status === "ended") {
    character.activeBattleId = null;
  }
}

function getActiveBattle(character: Character) {
  if (!character.activeBattleId) {
    return null;
  }

  const battle = store.battles.get(character.activeBattleId);
  return battle?.status === "active" ? battle : null;
}

function ensureNotInBattle(character: Character) {
  if (getActiveBattle(character)) {
    throw new Error("Você está em batalha. Apenas inventário, detalhes do personagem e ações de combate estão disponíveis.");
  }
}

function ensureNotWorking(character: Character) {
  if (isWorkInProgress(character.activeWork)) {
    throw new Error("Você está trabalhando. Conclua ou abandone o serviço antes desta ação.");
  }
}

function normalizeVitals(character: Character) {
  character.diamonds ??= 0;
  character.talentAllocations ??= {};
  character.clanId ??= null;
  syncClanBenefits(character);
  character.arenaWins ??= 0;
  character.arenaLosses ??= 0;
  character.arenaRankedPoints ??= ARENA_RANKED_STARTING_POINTS;
  character.dungeonClears ??= 0;
  character.monarchAttempts ??= { dayKey: "", count: 0 };
  character.activeWork ??= null;
  normalizeActiveWorkDuration(character);
  character.workAptitudes ??= {};
  character.workBonusClaims ??= {};
  character.lastDailyBlueCoinGrantKey ??= "";
  character.dungeonProgress ??= {};
  character.dungeonProgress.unlockedFloorByCountry ??= {};
  character.dungeonProgress.clearedFloorsByCountry ??= {};
  character.dungeonProgress.dailyKeyDayKey ??= "";
  character.dungeonProgress.activeRun ??= null;
  normalizeDungeonDailyKeys(character);
  ensureQuestProgress(character);
  const stats = deriveStats(character, ITEM_CATALOG);
  character.currentHp = Math.min(Math.max(0, character.currentHp ?? stats.maxHp), stats.maxHp);
  character.currentEnergy = Math.min(Math.max(0, character.currentEnergy ?? stats.maxEnergy), stats.maxEnergy);
}

function getWorkMinutesFromAssignment(activeWork: NonNullable<Character["activeWork"]>) {
  return Math.max(1, Math.round(activeWork.minutes ?? (activeWork.hours ?? 0) * 60));
}

function normalizeActiveWorkDuration(character: Character) {
  if (!character.activeWork) {
    return;
  }
  character.activeWork.minutes = getWorkMinutesFromAssignment(character.activeWork);
}

function getCharacterCountryId(character: Character) {
  const city = CITIES.find((entry) => entry.id === character.cityId) ?? CITIES[0];
  return city.countryId;
}

function getWorkService(serviceId: string): WorkServiceDefinition {
  const service = WORK_SERVICES.find((entry) => entry.id === serviceId);
  if (!service) {
    throw new Error("Serviço indisponível.");
  }
  return service;
}

function grantWorkReward(character: Character, reward: WorkReward) {
  const stats = deriveStats(character, ITEM_CATALOG);
  const granted: WorkReward = {};
  const levelMessages: string[] = [];

  if (reward.experience) {
    granted.experience = Math.max(1, Math.round(reward.experience * (1 + stats.xpBonusPercent)));
    levelMessages.push(...grantExperience(character, granted.experience));
  }
  if (reward.gold) {
    granted.gold = Math.max(1, Math.round(reward.gold * (1 + stats.goldBonusPercent)));
    character.gold += granted.gold;
  }
  if (reward.diamonds) {
    granted.diamonds = reward.diamonds;
    character.diamonds += granted.diamonds;
  }
  if (reward.attributePoints) {
    granted.attributePoints = reward.attributePoints;
    character.unspentAttributePoints += granted.attributePoints;
  }
  if (reward.items?.length) {
    granted.items = [];
    for (const item of reward.items) {
      addItem(character, item.itemId, ITEM_CATALOG, item.quantity);
      granted.items.push(item);
    }
  }

  normalizeVitals(character);
  return { granted, levelMessages };
}

function startWork(character: Character, payload: WorkStartPayload) {
  if (character.activeWork) {
    throw new Error(isWorkReady(character.activeWork) ? "Receba a recompensa do serviço atual antes de iniciar outro." : "Você já está trabalhando.");
  }

  const service = getWorkService(String(payload.serviceId ?? ""));
  const countryId = getCharacterCountryId(character);
  if (service.countryId !== countryId) {
    throw new Error("Este serviço pertence à agência de outro país.");
  }

  const requestedMinutes = payload.minutes ?? (payload.hours ?? 0) * 60;
  const minutes = normalizeWorkMinutes(service, requestedMinutes);
  const now = Date.now();
  character.activeWork = {
    serviceId: service.id,
    countryId: service.countryId,
    minutes,
    startedAt: now,
    endsAt: now + minutes * 60 * 1000
  };
}

function claimWork(character: Character) {
  const activeWork = character.activeWork;
  if (!activeWork) {
    throw new Error("Não há serviço em andamento.");
  }
  if (!isWorkReady(activeWork)) {
    throw new Error("O expediente ainda não terminou.");
  }
  if (activeWork.countryId !== getCharacterCountryId(character)) {
    throw new Error("Volte à agência do país do serviço para receber.");
  }

  const service = getWorkService(activeWork.serviceId);
  const aptitude = character.workAptitudes?.[service.id] ?? getDefaultWorkAptitude();
  const minutes = getWorkMinutesFromAssignment(activeWork);
  const reward = calculateWorkReward(service, aptitude, minutes);
  const beforeLevel = aptitude.level;
  const result = grantWorkReward(character, reward);
  character.workAptitudes ??= {};
  character.workAptitudes[service.id] = progressWorkAptitude(aptitude, minutes);
  character.questProgress.dailyWorkServicesCompleted += 1;
  character.questProgress.workServicesCompleted += 1;
  character.activeWork = null;
  return {
    service,
    reward: result.granted,
    levelMessages: result.levelMessages,
    beforeLevel,
    afterLevel: character.workAptitudes[service.id].level
  };
}

function abandonWork(character: Character) {
  if (!character.activeWork) {
    throw new Error("Não há serviço em andamento.");
  }
  character.activeWork = null;
}

function claimWorkBonus(character: Character, payload: WorkBonusClaimPayload) {
  const service = getWorkService(String(payload.serviceId ?? ""));
  const aptitude = character.workAptitudes?.[service.id] ?? getDefaultWorkAptitude();
  if (aptitude.level < service.bonus.level) {
    throw new Error(`Aptidão nível ${service.bonus.level} necessária.`);
  }
  if (!service.bonus.periodicReward || !service.bonus.periodicHours) {
    throw new Error("Este bônus não possui recompensa resgatável.");
  }
  const now = Date.now();
  const lastClaim = character.workBonusClaims?.[service.id] ?? 0;
  const nextClaimAt = lastClaim + service.bonus.periodicHours * 60 * 60 * 1000;
  if (lastClaim > 0 && now < nextClaimAt) {
    throw new Error("Este bônus ainda não está pronto para resgate.");
  }
  character.workBonusClaims ??= {};
  character.workBonusClaims[service.id] = now;
  return grantWorkReward(character, service.bonus.periodicReward).granted;
}

function getLocalDayKey(now = new Date()) {
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getNextLocalDayStart(now = new Date()) {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
}

function getTodayMonarchDefinition(now = new Date()) {
  const day = now.getDay();
  
  return MONARCH_SCHEDULE[Math.max(0, day)];
}

function buildMonarchRanking(event: MonarchEventState): MonarchRankingEntry[] {
  return Object.keys(event.participantNames ?? {})
    .map((playerId) => ({
      playerId,
      name: event.participantNames[playerId],
      damage: event.damageByPlayer[playerId] ?? 0,
      rank: 0
    }))
    .sort((a, b) => b.damage - a.damage || a.name.localeCompare(b.name))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

function createMonarchEvent(now = new Date()): MonarchEventState {
  const definition = getTodayMonarchDefinition(now);
  return {
    dayKey: getLocalDayKey(now),
    monarchId: definition.id,
    name: definition.name,
    title: definition.title,
    imageUrl: definition.imageUrl,
    level: definition.level,
    maxHp: definition.maxHp,
    currentHp: definition.maxHp,
    strength: definition.strength,
    defense: definition.defense,
    agility: definition.agility,
    experience: definition.experience,
    gold: definition.gold,
    isKing: "isKing" in definition && Boolean(definition.isKing),
    status: "active",
    startsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime(),
    endsAt: getNextLocalDayStart(now),
    damageByPlayer: {},
    participantNames: {},
    attemptsByPlayer: {},
    rewardsGranted: false,
    rewardLog: []
  };
}

function ensureMonarchEvent(now = new Date()) {
  const dayKey = getLocalDayKey(now);
  if (store.monarchEvent?.dayKey === dayKey) {
    return store.monarchEvent;
  }

  if (store.monarchEvent && store.monarchEvent.status === "active") {
    finalizeMonarchEvent(store.monarchEvent, "expired");
  }

  store.monarchEvent = createMonarchEvent(now);
  return store.monarchEvent;
}

function monarchAsMonster(event: MonarchEventState) {
  return {
    id: event.monarchId,
    cityId: "necropole_de_morthaly",
    name: event.name,
    imageUrl: event.imageUrl,
    level: event.level,
    maxHp: event.maxHp,
    strength: event.strength,
    defense: event.defense,
    agility: event.agility,
    experience: event.experience,
    gold: event.gold,
    drops: []
  };
}

function syncMonarchBattles(event: MonarchEventState, options?: { sourceBattleId?: string; sourceName?: string; damage?: number }) {
  const playerIds = new Set<string>();
  for (const battle of store.battles.values()) {
    if (battle.mode !== "monarch" || battle.status !== "active") {
      continue;
    }
    const monarch = battle.participants.find((participant) => participant.kind === "monster");
    const player = battle.participants.find((participant) => participant.ownerPlayerId);
    if (player?.ownerPlayerId) {
      playerIds.add(player.ownerPlayerId);
    }
    if (monarch) {
      monarch.hp = Math.min(Math.max(0, event.currentHp), monarch.maxHp);
    }
    if (options?.damage && battle.id !== options.sourceBattleId) {
      battle.log.unshift({
        id: randomUUID(),
        createdAt: Date.now(),
        text: `${options.sourceName} causou ${options.damage} de dano em ${event.name}.`
      });
    }
    if (event.status !== "active") {
      battle.status = "ended";
      battle.turnParticipantId = null;
      battle.winnerParticipantId = event.status === "defeated" ? player?.id ?? null : monarch?.id ?? null;
      battle.updatedAt = Date.now();
      battle.log.unshift({
        id: randomUUID(),
        createdAt: Date.now(),
        text:
          event.status === "defeated"
            ? `${event.name} foi derrotado pelos heróis de Morthaly.`
            : `${event.name} desapareceu com a troca do dia.`
      });
    }
  }
  return playerIds;
}

function finalizeMonarchEvent(event: MonarchEventState, status: "defeated" | "expired") {
  if (event.rewardsGranted) {
    return;
  }

  event.status = status;
  event.endedAt = Date.now();
  if (status === "defeated") {
    event.currentHp = 0;
  }

  const ranking = buildMonarchRanking(event);
  const statusMultiplier = status === "defeated" ? 1 : MONARCH_EXPIRED_REWARD_RATE;
  const kingMultiplier = event.isKing ? MONARCH_KING_REWARD_MULTIPLIER : 1;
  const rewards: MonarchRewardEntry[] = [];
  for (const entry of ranking) {
    const character = store.characters.get(entry.playerId);
    if (!character) {
      continue;
    }
    const rankMultiplier = entry.rank === 1 ? 1 : entry.rank === 2 ? 0.75 : entry.rank === 3 ? 0.55 : 0.28;
    const damageMultiplier = entry.damage > 0 ? 1 : 0.18;
    const totalMultiplier = (rankMultiplier + damageMultiplier + statusMultiplier) * kingMultiplier;
    const experience = Math.max(25, Math.ceil(event.experience * totalMultiplier));
    const gold = Math.max(10, Math.ceil(event.gold * totalMultiplier));
    const diamonds = status === "defeated" && entry.rank <= 3 ? (event.isKing ? 300 : 100) : 0;
    character.gold += gold;
    character.diamonds += diamonds;
    for (const levelMessage of grantExperience(character, experience)) {
      store.chatMessages = [
        { id: randomUUID(), playerId: "system", author: "Oraculo", text: levelMessage, createdAt: Date.now() },
        ...store.chatMessages
      ].slice(0, 50);
    }
    rewards.push({ ...entry, experience, gold, diamonds });
    pushPlayerNotification(
      entry.playerId,
      "monarch_reward",
      "Recompensa do Monarca",
      `Você ficou em #${entry.rank} contra ${event.name} e recebeu ${experience} XP, ${gold} ouro${diamonds > 0 ? ` e ${diamonds} diamantes` : ""}.`,
      { monarchId: event.monarchId, rank: entry.rank, experience, gold, diamonds }
    );
  }

  event.rewardLog = rewards;
  event.rewardsGranted = true;
  const outcome = status === "defeated" ? "foi derrotado" : "desapareceu com a alvorada";
  store.chatMessages = [
    {
      id: randomUUID(),
      playerId: "system",
      author: "Morthaly",
      text: `${event.name} ${outcome}. Recompensas distribuidas para ${rewards.length} participante(s).`,
      createdAt: Date.now()
    },
    ...store.chatMessages
  ].slice(0, 50);
  syncMonarchBattles(event);
}

function buildMonarchEventView(playerId: string) {
  const event = ensureMonarchEvent();
  return {
    dayKey: event.dayKey,
    monarchId: event.monarchId,
    name: event.name,
    title: event.title,
    imageUrl: event.imageUrl,
    level: event.level,
    maxHp: event.maxHp,
    currentHp: event.currentHp,
    strength: event.strength,
    defense: event.defense,
    agility: event.agility,
    isKing: event.isKing,
    status: event.status,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    endedAt: event.endedAt,
    attemptsUsed: event.attemptsByPlayer[playerId] ?? 0,
    attemptsLimit: MONARCH_DAILY_ATTEMPT_LIMIT,
    ranking: buildMonarchRanking(event).slice(0, 20),
    rewardLog: event.rewardLog
  };
}

function syncBattleVitals(battleId: string) {
  const battle = store.battles.get(battleId);
  if (!battle) {
    return [];
  }

  const playerIds = activePlayerIdsForBattle(battleId);
  for (const playerId of playerIds) {
    syncCharacterVitalsFromBattle(battle, currentCharacter(playerId));
  }
  return playerIds;
}

function getAvailableCraftingRecipes(cityId: string) {
  const recipes = Object.values(CRAFTING_RECIPES).filter((recipe) => recipe.cityIds.includes(cityId));
  return {
    blacksmith: recipes.filter((recipe) => recipe.station === "blacksmith"),
    alchemist: recipes.filter((recipe) => recipe.station === "alchemist")
  };
}

function buildRankings() {
  const entries = Array.from(store.characters.values()).map((character) => ({
    dungeonFloorsByCountry: Object.fromEntries(
      Object.entries(character.dungeonProgress?.clearedFloorsByCountry ?? {}).map(([countryId, floors]) => [countryId, floors.length])
    ),
    playerId: character.playerId,
    name: character.name,
    level: character.level,
    arenaWins: character.arenaWins ?? 0,
    arenaLosses: character.arenaLosses ?? 0,
    arenaRankedPoints: character.arenaRankedPoints ?? ARENA_RANKED_STARTING_POINTS,
    dungeonFloorsTotal: Object.values(character.dungeonProgress?.clearedFloorsByCountry ?? {}).reduce((total, floors) => total + floors.length, 0)
  }));

  const dungeonTotal = [...entries]
    .sort((a, b) => b.dungeonFloorsTotal - a.dungeonFloorsTotal || b.level - a.level || a.name.localeCompare(b.name))
    .slice(0, 20);

  const dungeonByCountry = Object.fromEntries(
    COUNTRIES.map((country) => {
      const top = [...entries]
        .sort(
          (a, b) =>
            (b.dungeonFloorsByCountry[country.id] ?? 0) - (a.dungeonFloorsByCountry[country.id] ?? 0) ||
            b.level - a.level ||
            a.name.localeCompare(b.name)
        )
        .slice(0, 20);
      return [country.id, top];
    })
  );

  return {
    level: [...entries].sort((a, b) => b.level - a.level || b.arenaWins - a.arenaWins).slice(0, 20),
    arena: [...entries].sort((a, b) => b.arenaRankedPoints - a.arenaRankedPoints || b.arenaWins - a.arenaWins || a.name.localeCompare(b.name)).slice(0, 20),
    dungeonTotal,
    dungeonByCountry,
    clans: buildClanDirectory().slice(0, 20)
  };
}

function buildPlayerPublicProfile(playerId: string): PlayerPublicProfile | null {
  const character = store.characters.get(playerId);
  const player = store.players.get(playerId);
  if (!character && !player) {
    return null;
  }

  const city = character ? CITIES.find((entry) => entry.id === character.cityId) ?? CITIES[0] : CITIES[0];
  const country = COUNTRIES.find((entry) => entry.id === city.countryId) ?? COUNTRIES[0];
  const clan = character?.clanId ? store.clans.get(character.clanId) : null;
  const clanView = clan ? decorateClan(clan) : null;
  const equipment = (["weapon", "armor", "amulet"] as const).map((slot) => {
    const instanceId = character?.equipment[slot];
    const item = instanceId ? character?.inventory.find((entry) => entry.instanceId === instanceId) ?? null : null;
    return { slot, item };
  });

  return {
    playerId,
    name: character?.name ?? player?.username ?? playerId,
    avatarId: character?.avatarId ?? DEFAULT_AVATAR_ID,
    level: character?.level ?? 1,
    cityName: city.name,
    countryName: country.name,
    clanName: clanView?.name,
    clanIcon: clanView?.icon,
    clanLevel: clanView?.level,
    arenaWins: character?.arenaWins ?? 0,
    arenaLosses: character?.arenaLosses ?? 0,
    arenaRankedPoints: character?.arenaRankedPoints ?? ARENA_RANKED_STARTING_POINTS,
    dungeonClears: character?.dungeonClears ?? 0,
    royalSealUntil: character?.royalSealUntil ?? 0,
    pveAutoUntil: character?.pveAutoUntil ?? 0,
    equipment,
    online: store.socketsByPlayer.has(playerId)
  };
}

function getClanLevel(clan: { benefitAllocations: Record<string, number> }) {
  return Object.values(clan.benefitAllocations ?? {}).reduce((total, rank) => total + rank, 0);
}

function isClanCategoryComplete(allocations: Record<string, number>, category: "combat" | "defense" | "prosperity") {
  const benefits = CLAN_BENEFITS.filter((benefit) => benefit.category === category);
  return benefits.length > 0 && benefits.every((benefit) => (allocations[benefit.id] ?? 0) >= benefit.maxRank);
}

function getClanMemberCapacity(clan: { benefitAllocations: Record<string, number> }) {
  const ranks = clan.benefitAllocations ?? {};
  const prosperitySuperActive = isClanCategoryComplete(ranks, "prosperity");
  return (
    CLAN_BASE_MEMBER_CAPACITY +
    (ranks.clan_members_1 ?? 0) * 2 +
    (ranks.clan_members_2 ?? 0) * 3 +
    (ranks.clan_members_3 ?? 0) * 5 +
    (prosperitySuperActive ? 10 : 0)
  );
}

function getClanBenefitCategoryLevels(clan: { benefitAllocations: Record<string, number> }) {
  const ranks = clan.benefitAllocations ?? {};
  return {
    combat: CLAN_BENEFITS.filter((benefit) => benefit.category === "combat").reduce((total, benefit) => total + (ranks[benefit.id] ?? 0), 0),
    defense: CLAN_BENEFITS.filter((benefit) => benefit.category === "defense").reduce((total, benefit) => total + (ranks[benefit.id] ?? 0), 0),
    prosperity: CLAN_BENEFITS.filter((benefit) => benefit.category === "prosperity").reduce((total, benefit) => total + (ranks[benefit.id] ?? 0), 0)
  };
}

function normalizeClanIcon(icon?: string) {
  return normalizeClanCrestId(icon);
}

function normalizeClanName(name: string) {
  return name.trim().replace(/\s+/g, " ").slice(0, 28);
}

function normalizeClanDescription(description: string) {
  return description.trim().replace(/\s+/g, " ").slice(0, 220);
}

function formatServerDuration(ms: number) {
  const totalMinutes = Math.max(1, Math.ceil(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
}

function ensureClanJoinCooldownExpired(character: Character) {
  const remaining = Math.max(0, (character.clanJoinCooldownUntil ?? 0) - Date.now());
  if (remaining > 0) {
    throw new Error(`Você precisa aguardar ${formatServerDuration(remaining)} para entrar em outro clã.`);
  }
}

function buildClanMembers(clan: { leaderPlayerId: string; memberPlayerIds: string[] }) {
  return clan.memberPlayerIds.map((memberPlayerId) => {
    const memberCharacter = store.characters.get(memberPlayerId);
    const memberPlayer = store.players.get(memberPlayerId);
    return {
      playerId: memberPlayerId,
      name: memberCharacter?.name ?? memberPlayer?.username ?? memberPlayerId,
      isLeader: memberPlayerId === clan.leaderPlayerId
    };
  });
}

function getBattleMonsterId(battle: { participants: Array<{ kind: "player" | "monster"; id: string }> }) {
  const monster = battle.participants.find((participant) => participant.kind === "monster");
  return monster ? monster.id.replace("monster:", "") : null;
}

function applyDeathPenaltyForBattle(battle: NonNullable<GameState["activeBattle"]>) {
  if (battle.status !== "ended") {
    return;
  }

  // Arena battles should not change XP; keep only arena-specific rewards/penalties.
  if (battle.mode === "pvp") {
    return;
  }

  battle.deathPenaltyAppliedPlayerIds ??= [];
  const alreadyApplied = new Set(battle.deathPenaltyAppliedPlayerIds);

  for (const participant of battle.participants) {
    if (!participant.ownerPlayerId || participant.hp > 0 || alreadyApplied.has(participant.ownerPlayerId)) {
      continue;
    }

    const character = store.characters.get(participant.ownerPlayerId);
    if (!character) {
      continue;
    }

    const penalty = Math.max(1, Math.floor(experienceForNextLevel(character.level) * DEATH_XP_PENALTY_PERCENT));
    const lost = Math.min(character.experience, penalty);
    character.experience = Math.max(0, character.experience - penalty);
    battle.deathPenaltyAppliedPlayerIds.push(participant.ownerPlayerId);
    if (lost > 0) {
      battle.log.unshift({
        id: randomUUID(),
        createdAt: Date.now(),
        text: `${character.name} perdeu ${lost} XP pela derrota.`
      });
    }
  }
}

function applyBattleProgress(character: Character, playerId: string, battle: GameState["activeBattle"], wasActive: boolean) {
  if (!battle) {
    return;
  }

  if (wasActive && battle.status === "ended") {
    applyDeathPenaltyForBattle(battle);
  }

  if ((battle.mode === "pve" || battle.mode === "dungeon") && wasActive && battle.status === "ended") {
    const winner = battle.participants.find((participant) => participant.id === battle.winnerParticipantId);
    if (winner?.ownerPlayerId === playerId) {
      character.questProgress.dailyEnemyDefeats += 1;
    }
  }

  if (battle.mode === "pvp" && wasActive && battle.status === "ended") {
    recordArenaResult(battle.id);
  }

  if (wasActive && battle.status === "ended") {
    const winner = battle.participants.find((participant) => participant.id === battle.winnerParticipantId);
    trackCharacterEvent(playerId, "battle_finished", character, {
      battleMode: battle.mode,
      won: winner?.ownerPlayerId === playerId,
      monsterId: getBattleMonsterId(battle),
      participantCount: battle.participants.length
    });
  }
}

function takeAutoPveUntilStopped(character: Character, playerId: string, initialBattle: NonNullable<GameState["activeBattle"]>) {
  let battle = initialBattle;
  let loops = 0;

  while (loops < 120) {
    const wasActive = battle.status === "active";
    takeAutoPveTurn(battle, character);
    applyBattleProgress(character, playerId, battle, wasActive);

    const winner = battle.participants.find((participant) => participant.id === battle.winnerParticipantId);
    const playerWon = battle.status === "ended" && winner?.ownerPlayerId === playerId;
    if (!playerWon || (battle.mode !== "pve" && battle.mode !== "dungeon")) {
      break;
    }

    const monsterId = getBattleMonsterId(battle);
    const monster = monsterId ? MONSTERS[monsterId] : null;
    if (!monster) {
      break;
    }

    const energyCost = battle.mode === "dungeon" ? monster.level + 1 : monster.level;
    if (character.currentHp <= 0 || character.currentEnergy < energyCost) {
      break;
    }

    clearEndedBattle(character);
    character.currentEnergy -= energyCost;
    const nextBattle = battle.mode === "dungeon" ? createDungeonBattle(character, monster) : createPveBattle(character, monster);
    store.battles.set(nextBattle.id, nextBattle);
    battle = nextBattle;
    loops += 1;
  }
}

function decorateClan<T extends { benefitAllocations: Record<string, number>; leaderPlayerId: string; memberPlayerIds: string[]; icon?: string; donationHistory?: unknown }>(clan: T) {
  return {
    ...clan,
    icon: normalizeClanIcon(clan.icon),
    level: getClanLevel(clan),
    memberCapacity: getClanMemberCapacity(clan),
    benefitCategoryLevels: getClanBenefitCategoryLevels(clan),
    donationHistory: Array.isArray(clan.donationHistory) ? clan.donationHistory : [],
    members: buildClanMembers(clan)
  };
}

function buildClanDirectory() {
  return Array.from(store.clans.values())
    .map((clan) => {
      const clanView = decorateClan(clan);
      const leaderPlayer = store.players.get(clan.leaderPlayerId);
      const leaderCharacter = store.characters.get(clan.leaderPlayerId);
      return {
        id: clan.id,
        name: clan.name,
        description: clan.description ?? "",
        icon: clanView.icon,
        leaderPlayerId: clan.leaderPlayerId,
        leaderName: leaderCharacter?.name ?? leaderPlayer?.username ?? clan.leaderPlayerId,
        memberCount: clan.memberPlayerIds.length,
        memberCapacity: clanView.memberCapacity,
        level: clanView.level,
        gold: clan.gold,
        diamonds: clan.diamonds,
        members: clanView.members,
        benefitCategoryLevels: clanView.benefitCategoryLevels
      };
    })
    .sort((a, b) => b.level - a.level || b.memberCount - a.memberCount || b.gold + b.diamonds * 100 - (a.gold + a.diamonds * 100));
}

function syncClanBenefits(character: Character) {
  const clan = character.clanId ? store.clans.get(character.clanId) : null;
  character.clanBenefitAllocations = clan ? { ...clan.benefitAllocations } : {};
}

function syncClanMembers(clanId: string) {
  const clan = store.clans.get(clanId);
  if (!clan) {
    return;
  }
  for (const playerId of clan.memberPlayerIds) {
    const character = store.characters.get(playerId);
    if (character) {
      syncClanBenefits(character);
      normalizeVitals(character);
    }
  }
}

function createClan(character: Character, name: string, icon?: string) {
  if (character.clanId) {
    throw new Error("Você já participa de um clã.");
  }
  ensureClanJoinCooldownExpired(character);
  if (character.level < CLAN_CREATE_MIN_LEVEL) {
    throw new Error(`Você precisa estar no nível ${CLAN_CREATE_MIN_LEVEL} para criar um clã.`);
  }
  if (character.diamonds < CLAN_CREATE_DIAMOND_COST) {
    throw new Error(`Criar um clã custa ${CLAN_CREATE_DIAMOND_COST} diamantes.`);
  }
  const normalized = normalizeClanName(name);
  if (normalized.length < 3) {
    throw new Error("Use um nome de clã com pelo menos 3 caracteres.");
  }
  const exists = Array.from(store.clans.values()).some((clan) => clan.name.toLowerCase() === normalized.toLowerCase());
  if (exists) {
    throw new Error("Já existe um clã com este nome.");
  }

  const clan = {
    id: randomUUID(),
    name: normalized,
    description: "",
    icon: normalizeClanIcon(icon),
    leaderPlayerId: character.playerId,
    memberPlayerIds: [character.playerId],
    level: 0,
    memberCapacity: CLAN_BASE_MEMBER_CAPACITY,
    gold: 0,
    diamonds: 0,
    benefitAllocations: {},
    donationHistory: [],
    createdAt: Date.now()
  };
  store.clans.set(clan.id, clan);
  character.diamonds -= CLAN_CREATE_DIAMOND_COST;
  character.clanId = clan.id;
  character.clanJoinCooldownUntil = 0;
  syncClanBenefits(character);
}

function updateClan(character: Character, name: string, icon?: string, description?: string) {
  const clan = character.clanId ? store.clans.get(character.clanId) : null;
  if (!clan) {
    throw new Error("Você não participa de um clã.");
  }
  if (clan.leaderPlayerId !== character.playerId) {
    throw new Error("Apenas o líder pode editar o clã.");
  }

  const normalized = normalizeClanName(name);
  if (normalized.length < 3) {
    throw new Error("Use um nome de clã com pelo menos 3 caracteres.");
  }
  const exists = Array.from(store.clans.values()).some(
    (entry) => entry.id !== clan.id && entry.name.toLowerCase() === normalized.toLowerCase()
  );
  if (exists) {
    throw new Error("Já existe um clã com este nome.");
  }

  clan.name = normalized;
  clan.icon = normalizeClanIcon(icon);
  if (description !== undefined) {
    clan.description = normalizeClanDescription(description);
  }
}

function kickClanMember(character: Character, memberPlayerId: string) {
  const clan = character.clanId ? store.clans.get(character.clanId) : null;
  if (!clan) {
    throw new Error("Você não participa de um clã.");
  }
  if (clan.leaderPlayerId !== character.playerId) {
    throw new Error("Apenas o líder pode remover membros.");
  }
  if (memberPlayerId === clan.leaderPlayerId) {
    throw new Error("O líder não pode remover a si mesmo.");
  }
  if (!clan.memberPlayerIds.includes(memberPlayerId)) {
    throw new Error("Membro não encontrado neste clã.");
  }

  clan.memberPlayerIds = clan.memberPlayerIds.filter((playerId) => playerId !== memberPlayerId);
  const memberCharacter = store.characters.get(memberPlayerId);
  if (memberCharacter) {
    memberCharacter.clanId = null;
    syncClanBenefits(memberCharacter);
    normalizeVitals(memberCharacter);
  }
  syncClanMembers(clan.id);
}

function transferClanLeadership(character: Character, memberPlayerId: string) {
  const clan = character.clanId ? store.clans.get(character.clanId) : null;
  if (!clan) {
    throw new Error("Você não participa de um clã.");
  }
  if (clan.leaderPlayerId !== character.playerId) {
    throw new Error("Apenas o líder pode nomear outro líder.");
  }
  if (memberPlayerId === clan.leaderPlayerId) {
    throw new Error("Este membro já é líder.");
  }
  if (!clan.memberPlayerIds.includes(memberPlayerId)) {
    throw new Error("Membro não encontrado neste clã.");
  }

  clan.leaderPlayerId = memberPlayerId;
}

function joinClan(character: Character, clanId: string) {
  if (character.clanId) {
    throw new Error("Você já participa de um clã.");
  }
  ensureClanJoinCooldownExpired(character);
  const clan = store.clans.get(clanId);
  if (!clan) {
    throw new Error("Clã não encontrado.");
  }
  if (clan.memberPlayerIds.length >= getClanMemberCapacity(clan)) {
    throw new Error("Este clã atingiu o limite de membros.");
  }
  clan.memberPlayerIds.push(character.playerId);
  character.clanId = clan.id;
  character.clanJoinCooldownUntil = 0;
  syncClanBenefits(character);
}

function leaveClan(character: Character) {
  const clan = character.clanId ? store.clans.get(character.clanId) : null;
  if (!clan) {
    throw new Error("Você não participa de um clã.");
  }

  if (clan.leaderPlayerId === character.playerId) {
    throw new Error("O líder não pode sair do clã. Transfira a liderança antes de sair.");
  }

  clan.memberPlayerIds = clan.memberPlayerIds.filter((playerId) => playerId !== character.playerId);
  character.clanId = null;
  character.clanJoinCooldownUntil = Date.now() + CLAN_JOIN_COOLDOWN_MS;
  syncClanBenefits(character);

  if (clan.memberPlayerIds.length === 0) {
    store.clans.delete(clan.id);
    return;
  }

  if (clan.leaderPlayerId === character.playerId) {
    clan.leaderPlayerId = clan.memberPlayerIds[0];
  }
  syncClanMembers(clan.id);
}

function donateToClan(character: Character, goldValue?: number, diamondValue?: number) {
  const clan = character.clanId ? store.clans.get(character.clanId) : null;
  if (!clan) {
    throw new Error("Você não participa de um clã.");
  }
  const gold = Math.max(0, Math.floor(goldValue ?? 0));
  const diamonds = Math.max(0, Math.floor(diamondValue ?? 0));
  if (gold + diamonds <= 0) {
    throw new Error("Informe uma doação.");
  }
  if (character.gold < gold) {
    throw new Error("Ouro insuficiente.");
  }
  if (character.diamonds < diamonds) {
    throw new Error("Diamantes insuficientes.");
  }
  character.gold -= gold;
  character.diamonds -= diamonds;
  clan.gold += gold;
  clan.diamonds += diamonds;
  clan.donationHistory ??= [];
  clan.donationHistory = [
    {
      id: randomUUID(),
      playerId: character.playerId,
      playerName: character.name,
      gold,
      diamonds,
      createdAt: Date.now()
    },
    ...clan.donationHistory
  ].slice(0, 120);
}

function buyClanBenefit(character: Character, benefitId: string) {
  const clan = character.clanId ? store.clans.get(character.clanId) : null;
  if (!clan) {
    throw new Error("Você não participa de um clã.");
  }
  if (clan.leaderPlayerId !== character.playerId) {
    throw new Error("Apenas o líder pode comprar benefícios.");
  }
  const benefit = CLAN_BENEFITS.find((entry) => entry.id === benefitId);
  if (!benefit) {
    throw new Error("Benefício não encontrado.");
  }
  const rank = clan.benefitAllocations[benefit.id] ?? 0;
  if (rank >= benefit.maxRank) {
    throw new Error("Benefício no nível máximo.");
  }
  if (benefit.requires && (clan.benefitAllocations[benefit.requires] ?? 0) <= 0) {
    throw new Error("Compre o benefício anterior da ramificação.");
  }
  if (clan.gold < benefit.costPerRank.gold || clan.diamonds < benefit.costPerRank.diamonds) {
    throw new Error("Riqueza do clã insuficiente.");
  }
  clan.gold -= benefit.costPerRank.gold;
  clan.diamonds -= benefit.costPerRank.diamonds;
  clan.benefitAllocations[benefit.id] = rank + 1;
  clan.level = getClanLevel(clan);
  clan.memberCapacity = getClanMemberCapacity(clan);
  syncClanMembers(clan.id);
}

function resetClanBenefits(character: Character) {
  const clan = character.clanId ? store.clans.get(character.clanId) : null;
  if (!clan) {
    throw new Error("Você não participa de um clã.");
  }
  if (clan.leaderPlayerId !== character.playerId) {
    throw new Error("Apenas o líder pode resetar os benefícios.");
  }
  if (character.diamonds < CLAN_BENEFIT_RESET_DIAMOND_COST) {
    throw new Error(`Resetar benefícios custa ${CLAN_BENEFIT_RESET_DIAMOND_COST} diamantes.`);
  }

  const spent = CLAN_BENEFITS.reduce(
    (total, benefit) => {
      const rank = clan.benefitAllocations[benefit.id] ?? 0;
      total.gold += benefit.costPerRank.gold * rank;
      total.diamonds += benefit.costPerRank.diamonds * rank;
      return total;
    },
    { gold: 0, diamonds: 0 }
  );

  character.diamonds -= CLAN_BENEFIT_RESET_DIAMOND_COST;
  clan.gold += Math.floor(spent.gold * CLAN_BENEFIT_RESET_REFUND_RATE);
  clan.diamonds += Math.floor(spent.diamonds * CLAN_BENEFIT_RESET_REFUND_RATE);
  clan.benefitAllocations = {};
  clan.level = 0;
  clan.memberCapacity = CLAN_BASE_MEMBER_CAPACITY;
  syncClanMembers(clan.id);
}

function buyDiamondPackage(character: Character, packageId: string) {
  const pack = DIAMOND_PACKAGES.find((entry) => entry.id === packageId);
  if (!pack) {
    throw new Error("Pacote não encontrado.");
  }
  character.diamonds += pack.diamonds;
  if (pack.id === ROYAL_FRIEND_PACKAGE_ID) {
    grantPackageStack(character, TRAIN_TICKET_ID, 100);
    grantPackageStack(character, SHIP_TICKET_ID, 30);
    const baseUntil = Math.max(Date.now(), character.pveAutoUntil ?? 0, character.royalSealUntil ?? 0);
    character.pveAutoUntil = baseUntil + ROYAL_FRIEND_DURATION_MS;
    character.royalSealUntil = baseUntil + ROYAL_FRIEND_DURATION_MS;
  }

  return pack;
}

function pushDiamondPurchaseHistory(character: Character, entry: {
  packageId: string;
  packageName: string;
  diamonds: number;
  priceLabel: string;
  pixHash: string;
  receiptNote?: string;
  grantedByPlayerId?: string;
}) {
  character.diamondPurchaseHistory ??= [];
  character.diamondPurchaseHistory = [
    {
      id: randomUUID(),
      createdAt: Date.now(),
      grantedAt: Date.now(),
      ...entry
    },
    ...character.diamondPurchaseHistory
  ].slice(0, 80);
}

function selectAvatar(character: Character, avatarId: string) {
  const avatar = AVATARS.find((entry) => entry.id === avatarId);
  if (!avatar) {
    throw new Error("Avatar não encontrado.");
  }
  character.unlockedAvatarIds ??= AVATARS.filter((entry) => entry.priceDiamonds === 0 && !entry.exclusive).map((entry) => entry.id);
  if (!character.unlockedAvatarIds.includes(avatar.id)) {
    if (avatar.exclusive) {
      throw new Error(avatar.unlockHint ?? "Este avatar é uma recompensa exclusiva.");
    }
    if (avatar.priceDiamonds <= 0) {
      character.unlockedAvatarIds.push(avatar.id);
    } else {
      if (character.diamonds < avatar.priceDiamonds) {
        throw new Error(`São necessários ${avatar.priceDiamonds} diamantes para comprar este avatar.`);
      }
      character.diamonds -= avatar.priceDiamonds;
      character.unlockedAvatarIds.push(avatar.id);
    }
  }
  character.avatarId = avatar.id;
}

function grantPackageStack(character: Character, itemId: string, quantity: number) {
  if (!ITEM_CATALOG[itemId]) {
    throw new Error("Item de pacote inválido.");
  }
  const stack = character.inventory.find((item) => item.itemId === itemId);
  if (stack) {
    stack.quantity += quantity;
    return;
  }
  character.inventory.push({ instanceId: randomUUID(), itemId, quantity });
}

function recordArenaResult(battleId: string) {
  if (store.arenaRecordedBattleIds.has(battleId)) {
    return;
  }
  const battle = store.battles.get(battleId);
  if (!battle || battle.mode !== "pvp" || battle.status !== "ended" || !battle.winnerParticipantId) {
    return;
  }

  const winner = battle.participants.find((participant) => participant.id === battle.winnerParticipantId);
  const loser = battle.participants.find((participant) => participant.id !== battle.winnerParticipantId);
  if (battle.arena?.type === "ranked") {
    const challengerPlayerId = battle.arena.challengerPlayerId;
    if (!challengerPlayerId) {
      store.arenaRecordedBattleIds.add(battleId);
      return;
    }
    const challenger = currentCharacter(challengerPlayerId);
    const challengerWon = winner?.ownerPlayerId === challengerPlayerId;
    if (challengerWon) {
      challenger.arenaWins += 1;
      challenger.arenaRankedPoints = (challenger.arenaRankedPoints ?? ARENA_RANKED_STARTING_POINTS) + ARENA_RANKED_WIN_POINTS;
      challenger.questProgress.dailyArenaWins += 1;
    } else {
      challenger.arenaLosses += 1;
      challenger.arenaRankedPoints = Math.max(0, (challenger.arenaRankedPoints ?? ARENA_RANKED_STARTING_POINTS) - ARENA_RANKED_LOSS_POINTS);
    }
    challenger.questProgress.dailyArenaBattles += 1;
    challenger.questProgress.arenaBattles += 1;
    if (challengerWon) {
      grantPackageStack(challenger, ENHANCEMENT_ITEMS.creationStone, ARENA_RANKED_WIN_CREATION_STONES);
      challenger.gold += ARENA_RANKED_WIN_GOLD;
    } else {
      challenger.gold += ARENA_RANKED_LOSS_GOLD;
    }
    battle.log.unshift({
      id: randomUUID(),
      createdAt: Date.now(),
      text: challengerWon
        ? `${challenger.name} ganhou ${ARENA_RANKED_WIN_POINTS} pontos ranqueados.`
        : `${challenger.name} perdeu ${ARENA_RANKED_LOSS_POINTS} pontos ranqueados.`
    });
    battle.log.unshift({
      id: randomUUID(),
      createdAt: Date.now(),
      text: challengerWon
        ? `${challenger.name} recebeu ${ARENA_RANKED_WIN_GOLD} ouro e Pedra de Criação.`
        : `${challenger.name} recebeu ${ARENA_RANKED_LOSS_GOLD} ouro.`
    });
    store.arenaRecordedBattleIds.add(battleId);
    return;
  }

  if (winner?.ownerPlayerId) {
    const winnerCharacter = currentCharacter(winner.ownerPlayerId);
    winnerCharacter.arenaWins += 1;
    winnerCharacter.questProgress.dailyArenaBattles += 1;
    winnerCharacter.questProgress.dailyArenaWins += 1;
    winnerCharacter.questProgress.arenaBattles += 1;
  }
  if (loser?.ownerPlayerId) {
    const loserCharacter = currentCharacter(loser.ownerPlayerId);
    loserCharacter.arenaLosses += 1;
    loserCharacter.questProgress.dailyArenaBattles += 1;
    loserCharacter.questProgress.arenaBattles += 1;
  }
  store.arenaRecordedBattleIds.add(battleId);
}

function countItem(character: Character, itemId: string) {
  return character.inventory
    .filter((item) => item.itemId === itemId)
    .reduce((total, item) => total + item.quantity, 0);
}

function removeItemByItemId(character: Character, itemId: string, quantity: number) {
  let remaining = quantity;
  for (const item of [...character.inventory]) {
    if (item.itemId !== itemId || remaining <= 0) {
      continue;
    }
    const used = Math.min(item.quantity, remaining);
    removeItem(character, item.instanceId, used);
    remaining -= used;
  }
  if (remaining > 0) {
    throw new Error("Ingredientes insuficientes.");
  }
}

function getCityHuntMonsterIds(cityId: string) {
  const city = CITIES.find((entry) => entry.id === cityId);
  if (!city) {
    return [];
  }
  const fromLocations = (city.huntLocationIds ?? [])
    .map((locationId) => HUNTING_LOCATIONS[locationId])
    .filter(Boolean)
    .flatMap((location) => location.monsterIds);
  return Array.from(new Set([...fromLocations, ...(city.huntMonsterIds ?? [])]));
}

function normalizeDungeonDailyKeys(character: Character) {
  const today = currentDayKey();
  character.dungeonProgress ??= {};
  character.dungeonProgress.unlockedFloorByCountry ??= {};
  character.dungeonProgress.activeRun ??= null;
  if (character.dungeonProgress.dailyKeyDayKey === today) {
    return;
  }
  const ownedKeys = countItem(character, DUNGEON_KEY_ITEM_ID);
  if (ownedKeys > 0) {
    removeItemByItemId(character, DUNGEON_KEY_ITEM_ID, ownedKeys);
  }
  try {
    addItem(character, DUNGEON_KEY_ITEM_ID, ITEM_CATALOG, DUNGEON_DAILY_KEYS);
  } catch {
    // Skip key refresh when inventory has no free slot to avoid crashing the realtime loop.
  }
  character.dungeonProgress.dailyKeyDayKey = today;
}

function countryMonsterPool(countryId: string) {
  const cityIds = new Set(CITIES.filter((city) => city.countryId === countryId).map((city) => city.id));
  return Object.values(MONSTERS)
    .filter((monster) => cityIds.has(monster.cityId))
    .sort((a, b) => a.level - b.level);
}

function dungeonFloorMonsterBand(countryId: string, floor: number) {
  const monsterPool = countryMonsterPool(countryId);
  if (monsterPool.length <= 1) {
    return monsterPool;
  }

  const normalizedFloor = Math.max(1, Math.min(DUNGEON_TOTAL_FLOORS, floor));
  const bandSize = normalizedFloor >= DUNGEON_TOTAL_FLOORS ? 4 : 3;
  const maxStartIndex = Math.max(0, monsterPool.length - bandSize);
  const floorProgress = (normalizedFloor - 1) / Math.max(1, DUNGEON_TOTAL_FLOORS - 1);
  const startIndex = Math.min(maxStartIndex, Math.round(floorProgress * maxStartIndex));
  const endIndex = Math.min(monsterPool.length, startIndex + bandSize);
  const band = monsterPool.slice(startIndex, endIndex);

  return band.length > 0 ? band : [monsterPool[Math.min(monsterPool.length - 1, startIndex)]];
}

function floorUnlockByCountry(character: Character, countryId: string) {
  character.dungeonProgress ??= {};
  character.dungeonProgress.unlockedFloorByCountry ??= {};
  return Math.max(1, Math.min(DUNGEON_TOTAL_FLOORS, character.dungeonProgress.unlockedFloorByCountry[countryId] ?? 1));
}

function hashSeed(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function createSeededRng(seedValue: string) {
  let seed = hashSeed(seedValue) || 123456789;
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function pickDeterministic<T>(values: T[], rng: () => number) {
  return values[Math.min(values.length - 1, Math.floor(rng() * values.length))];
}

function pickWeightedDeterministic<T>(values: T[], rng: () => number, weightFor: (value: T) => number) {
  const weighted = values
    .map((value) => ({ value, weight: Math.max(0, weightFor(value)) }))
    .filter((entry) => entry.weight > 0);
  if (weighted.length === 0) {
    return pickDeterministic(values, rng);
  }

  const totalWeight = weighted.reduce((total, entry) => total + entry.weight, 0);
  let cursor = rng() * totalWeight;
  for (const entry of weighted) {
    cursor -= entry.weight;
    if (cursor <= 0) {
      return entry.value;
    }
  }
  return weighted[weighted.length - 1].value;
}

function equipmentPowerScore(item: ItemDefinition) {
  const statsPower = Object.values(item.stats ?? {}).reduce((total, value) => total + (typeof value === "number" ? Math.max(0, value) : 0), 0);
  return item.minLevel * 2 + statsPower + item.price / 500;
}

function buildDungeonChestRewards(countryId: string, floor: number, roomIndex: number): Array<{ itemId: string; quantity: number; rarity?: Rarity }> {
  const rng = createSeededRng(`chest:${countryId}:${floor}:${roomIndex}`);
  const maxLevelForFloor = Math.min(100, floor * 6 + 8);
  const minLevelForFloor = Math.max(1, maxLevelForFloor - 35);

  const equipmentPool = Object.values(ITEM_CATALOG)
    .filter((item) => Boolean(item.slot))
    .filter((item) => item.minLevel >= minLevelForFloor && item.minLevel <= maxLevelForFloor);

  const fallbackEquipmentPool = Object.values(ITEM_CATALOG)
    .filter((item) => Boolean(item.slot))
    .filter((item) => item.minLevel <= maxLevelForFloor);

  const craftMaterialIds = new Set(
    Object.values(CRAFTING_RECIPES)
      .flatMap((recipe) => recipe.ingredients.map((ingredient) => ingredient.itemId))
      .filter((itemId) => {
        const item = ITEM_CATALOG[itemId];
        return Boolean(item) && !item.slot;
      })
  );

  const materialPool = Array.from(craftMaterialIds)
    .map((itemId) => ITEM_CATALOG[itemId])
    .filter((item): item is ItemDefinition => Boolean(item))
    .filter((item) => item.minLevel <= maxLevelForFloor)
    .filter((item) => item.kind !== "ticket");

  const chestEquipmentPool = equipmentPool.length > 0 ? equipmentPool : fallbackEquipmentPool;

  if (chestEquipmentPool.length === 0) {
    return [];
  }

  const equipmentCount = 2 + Math.floor(rng() * 2);
  const materialCount = 3 + Math.floor(rng() * 5);
  const rewards: Array<{ itemId: string; quantity: number; rarity?: Rarity }> = [];

  for (let index = 0; index < equipmentCount; index += 1) {
    // Itens mais fortes aparecem com chance menor no baú.
    const item = pickWeightedDeterministic(chestEquipmentPool, rng, (candidate) => {
      const power = equipmentPowerScore(candidate);
      return 1 / Math.max(1, power);
    });
    if (!item) {
      continue;
    }

    const power = equipmentPowerScore(item);
    const legendaryChance = Math.max(0.05, 0.2 - power * 0.0022);
    const epicChance = Math.max(0.2, 0.42 - power * 0.0012);
    const rarityRoll = rng();
    const rarity: Rarity =
      rarityRoll < legendaryChance
        ? "legendary"
        : rarityRoll < legendaryChance + epicChance
          ? "epic"
          : "rare";
    rewards.push({
      itemId: item.id,
      quantity: 1,
      rarity
    });
  }

  for (let index = 0; index < materialCount; index += 1) {
    const material = pickDeterministic(materialPool, rng);
    if (!material) {
      continue;
    }

    const existing = rewards.find((entry) => entry.itemId === material.id && !entry.rarity);
    if (existing) {
      existing.quantity += 1;
    } else {
      rewards.push({ itemId: material.id, quantity: 1 });
    }
  }

  return rewards;
}

function buildDungeonRooms(countryId: string, floor: number): DungeonRoomState[] {
  const rng = createSeededRng(`rooms:${countryId}:${floor}`);
  const monsterPool = countryMonsterPool(countryId);
  const floorMonsters = dungeonFloorMonsterBand(countryId, floor);
  const trapOptions: DungeonTrapType[] = ["hp_20", "agility_20", "defense_20"];
  const buffOptions: DungeonBuffType[] = ["heal_full", "damage_50", "defense_10", "agility_20", "strength_20"];

  const totalRooms = floor === DUNGEON_TOTAL_FLOORS ? 10 : 3 + Math.floor(rng() * 5);
  const chestCount = floor === DUNGEON_TOTAL_FLOORS ? 2 : 1 + Math.floor(rng() * 2);
  const buffCount = floor === DUNGEON_TOTAL_FLOORS ? 2 : Math.floor(rng() * 3);
  const trapCount = floor === DUNGEON_TOTAL_FLOORS ? 0 : Math.floor(rng() * 2);
  const bossCount = 1;
  const hordeCount = floor === DUNGEON_TOTAL_FLOORS ? 5 : Math.max(1, totalRooms - chestCount - buffCount - trapCount - bossCount);

  const nonBoss: DungeonRoomState[] = [];

  for (let index = 0; index < hordeCount; index += 1) {
    const hordeSize = 3 + Math.floor(rng() * 8);
    const monsterIds: string[] = [];
    for (let hordeIndex = 0; hordeIndex < hordeSize; hordeIndex += 1) {
      const monster = pickDeterministic(floorMonsters.length > 0 ? floorMonsters : monsterPool, rng);
      if (monster) {
        monsterIds.push(monster.id);
      }
    }
    nonBoss.push({ index: nonBoss.length, type: "horde", monsterIds });
  }

  for (let index = 0; index < chestCount; index += 1) {
    nonBoss.push({ index: nonBoss.length, type: "chest", rewards: buildDungeonChestRewards(countryId, floor, index) });
  }

  for (let index = 0; index < buffCount; index += 1) {
    nonBoss.push({ index: nonBoss.length, type: "buff", buff: pickDeterministic(buffOptions, rng) });
  }

  for (let index = 0; index < trapCount; index += 1) {
    nonBoss.push({ index: nonBoss.length, type: "trap", trap: pickDeterministic(trapOptions, rng) });
  }

  for (let index = nonBoss.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    const current = nonBoss[index];
    nonBoss[index] = nonBoss[swapIndex];
    nonBoss[swapIndex] = current;
  }

  const bossSource = [...(floorMonsters.length > 0 ? floorMonsters : monsterPool)].sort((a, b) => b.level - a.level)[0];
  const bossRoom: DungeonRoomState = {
    index: nonBoss.length,
    type: "boss",
    monsterIds: bossSource ? [bossSource.id] : []
  };

  return [...nonBoss.map((room, index) => ({ ...room, index })), bossRoom];
}

function dungeonBuffLabel(buff: DungeonBuffType) {
  switch (buff) {
    case "heal_full":
      return "Regenerar toda a vida";
    case "damage_50":
      return "+50% de dano";
    case "defense_10":
      return "+10% defesa";
    case "agility_20":
      return "+20% agilidade";
    case "strength_20":
      return "+20% força";
  }
}

function dungeonTrapLabel(trap: DungeonTrapType) {
  switch (trap) {
    case "hp_20":
      return "Armadilha: dano de 20% da vida";
    case "agility_20":
      return "Armadilha: -20% de agilidade";
    case "defense_20":
      return "Armadilha: -20% de defesa";
  }
}

function createDungeonRun(character: Character, countryId: string, floor: number) {
  const rooms = buildDungeonRooms(countryId, floor);
  character.dungeonProgress ??= {};
  character.dungeonProgress.activeRun = {
    countryId,
    floor,
    roomIndex: 0,
    rooms,
    activeBuffs: [],
    activeTraps: [],
    pendingExperience: 0,
    pendingGold: 0,
    pendingItems: [],
    currentEncounterMonsterIds: []
  };
  armDungeonRoomTimer(character, character.playerId);
}

function clearDungeonRoomTimeout(playerId: string) {
  const timeout = dungeonRoomTimeouts.get(playerId);
  if (timeout) {
    clearTimeout(timeout);
    dungeonRoomTimeouts.delete(playerId);
  }
}

function expireDungeonRun(character: Character, playerId: string, message: string) {
  clearDungeonRoomTimeout(playerId);
  failDungeonRun(character);
  socketByPlayer(playerId)?.emit("game:error", { message });
}

function dungeonCurrentRoomUsesTimer(run: NonNullable<Character["dungeonProgress"]>["activeRun"]) {
  if (!run) {
    return false;
  }
  const room = run.rooms[run.roomIndex];
  return Boolean(room && room.type !== "horde" && room.type !== "boss");
}

function armDungeonRoomTimer(character: Character, playerId: string) {
  clearDungeonRoomTimeout(playerId);
  const run = character.dungeonProgress?.activeRun;
  if (!run) {
    return;
  }
  if (!dungeonCurrentRoomUsesTimer(run)) {
    delete run.roomDeadlineAt;
    return;
  }
  run.roomDeadlineAt = Date.now() + DUNGEON_ROOM_TIME_LIMIT_MS;
  ensureDungeonRoomTimeout(character, playerId);
}

function ensureDungeonRoomTimeout(character: Character, playerId: string) {
  const run = character.dungeonProgress?.activeRun;
  clearDungeonRoomTimeout(playerId);
  if (!run) {
    return;
  }
  if (!dungeonCurrentRoomUsesTimer(run)) {
    delete run.roomDeadlineAt;
    return;
  }

  const now = Date.now();
  if (!run.roomDeadlineAt) {
    run.roomDeadlineAt = now + DUNGEON_ROOM_TIME_LIMIT_MS;
  }

  if (now >= run.roomDeadlineAt) {
    expireDungeonRun(character, playerId, "Você demorou demais para avançar de sala e morreu na masmorra.");
    return;
  }

  dungeonRoomTimeouts.set(playerId, setTimeout(() => {
    const currentCharacterState = store.characters.get(playerId);
    if (!currentCharacterState) {
      clearDungeonRoomTimeout(playerId);
      return;
    }
    const currentRun = currentCharacterState.dungeonProgress?.activeRun;
    if (!currentRun || currentRun.roomDeadlineAt !== run.roomDeadlineAt) {
      clearDungeonRoomTimeout(playerId);
      return;
    }
    expireDungeonRun(currentCharacterState, playerId, "Você demorou demais para avançar de sala e morreu na masmorra.");
    emitState(playerId);
  }, run.roomDeadlineAt - now));
}

function clearDungeonRun(character: Character) {
  const run = character.dungeonProgress?.activeRun;
  if (!run) {
    return;
  }
  const playerId = character.playerId;
  clearDungeonRoomTimeout(playerId);
  run.activeBuffs = [];
  run.activeTraps = [];
  run.pendingItems = [];
  run.pendingExperience = 0;
  run.pendingGold = 0;
  run.currentEncounterMonsterIds = [];
  character.activeBattleId = null;
  character.dungeonProgress!.activeRun = null;
}

function queueDungeonReward(character: Character, reward: { itemId: string; quantity: number; rarity?: Rarity }) {
  const run = character.dungeonProgress?.activeRun;
  if (!run || reward.quantity <= 0) {
    return;
  }
  const stackable = !ITEM_CATALOG[reward.itemId]?.slot;
  const existing = stackable
    ? run.pendingItems.find((item) => item.itemId === reward.itemId && !item.rarity)
    : null;
  if (existing) {
    existing.quantity += reward.quantity;
  } else {
    run.pendingItems.push({ ...reward });
  }
}

function createScaledDungeonMonster(monsterId: string, floor: number, isBoss: boolean) {
  const base = MONSTERS[monsterId];
  if (!base) {
    return null;
  }
  const scalar = 1 + Math.max(0, floor - 1) * 0.055;
  const bossScalar = isBoss ? 2 : 1;
  const total = scalar * bossScalar;
  return {
    ...base,
    maxHp: Math.max(1, Math.floor(base.maxHp * total)),
    strength: Math.max(1, Math.floor(base.strength * total)),
    defense: Math.max(0, Math.floor(base.defense * total)),
    agility: Math.max(1, Math.floor(base.agility * total)),
    experience: Math.max(1, Math.floor(base.experience * scalar)),
    gold: Math.max(1, Math.floor(base.gold * scalar))
  };
}

function applyDungeonStatModifiers(character: Character, battle: NonNullable<GameState["activeBattle"]>) {
  const run = character.dungeonProgress?.activeRun;
  if (!run) {
    return;
  }
  const me = battle.participants.find((participant) => participant.ownerPlayerId === character.playerId);
  if (!me) {
    return;
  }

  const damageBuff = run.activeBuffs.includes("damage_50") ? 0.5 : 0;
  const defenseBuff = run.activeBuffs.includes("defense_10") ? 0.1 : 0;
  const agilityBuff = run.activeBuffs.includes("agility_20") ? 0.2 : 0;
  const strengthBuff = run.activeBuffs.includes("strength_20") ? 0.2 : 0;
  const defenseDebuff = run.activeTraps.includes("defense_20") ? 0.2 : 0;
  const agilityDebuff = run.activeTraps.includes("agility_20") ? 0.2 : 0;

  me.strength = Math.max(1, Math.floor(me.strength * (1 + strengthBuff)));
  me.defense = Math.max(0, Math.floor(me.defense * (1 + defenseBuff - defenseDebuff)));
  me.agility = Math.max(1, Math.floor(me.agility * (1 + agilityBuff - agilityDebuff)));
  me.damageBonusPercent = (me.damageBonusPercent ?? 0) + damageBuff;
}

function startNextDungeonCombat(character: Character) {
  const run = character.dungeonProgress?.activeRun;
  if (!run) {
    return;
  }
  clearDungeonRoomTimeout(character.playerId);
  delete run.roomDeadlineAt;
  const room = run.rooms[run.roomIndex];
  if (!room || (room.type !== "horde" && room.type !== "boss")) {
    return;
  }
  if (!run.currentEncounterMonsterIds || run.currentEncounterMonsterIds.length === 0) {
    run.currentEncounterMonsterIds = [...(room.monsterIds ?? [])];
  }
  const monsterId = run.currentEncounterMonsterIds[0];
  const monster = createScaledDungeonMonster(monsterId, run.floor, room.type === "boss");
  if (!monster) {
    throw new Error("Monstro da masmorra inválido.");
  }
  const battle = createDungeonBattle(character, monster);
  battle.dungeon = {
    countryId: run.countryId,
    floor: run.floor,
    roomIndex: run.roomIndex,
    roomType: room.type,
    roomLabel: room.type === "boss" ? "Chefe" : `Horda ${run.roomIndex + 1}`,
    remainingMonsters: run.currentEncounterMonsterIds.length,
    activeBuffs: [...run.activeBuffs],
    activeTraps: [...run.activeTraps]
  };
  applyDungeonStatModifiers(character, battle);
  store.battles.set(battle.id, battle);
}

function progressToNextDungeonRoom(character: Character) {
  const run = character.dungeonProgress?.activeRun;
  if (!run) {
    return;
  }
  run.roomIndex += 1;
  run.currentEncounterMonsterIds = [];
  armDungeonRoomTimer(character, character.playerId);
}

function socketByPlayer(playerId: string) {
  const socketIds = store.socketsByPlayer.get(playerId);
  if (!socketIds || socketIds.size === 0) {
    return null;
  }
  const firstSocketId = Array.from(socketIds)[0];
  return io.sockets.sockets.get(firstSocketId) ?? null;
}

function appendDungeonMonsterRewards(character: Character, battle: NonNullable<GameState["activeBattle"]>) {
  const run = character.dungeonProgress?.activeRun;
  if (!run) {
    return;
  }
  const monsterParticipant = battle.participants.find((participant) => participant.kind === "monster");
  if (!monsterParticipant) {
    return;
  }
  const monster = MONSTERS[monsterParticipant.id.replace("monster:", "")];
  if (!monster) {
    return;
  }
  const stats = deriveStats(character, ITEM_CATALOG);
  const xp = Math.max(1, Math.ceil(monster.experience * (1 + stats.xpBonusPercent) * 2));
  const gold = Math.max(1, Math.ceil(monster.gold * (1 + stats.goldBonusPercent) * 2));
  run.pendingExperience += xp;
  run.pendingGold += gold;

  for (const drop of monster.drops) {
    const dropChance = Math.min(0.95, drop.chance + stats.dropBonusPercent);
    if (Math.random() <= dropChance) {
      const definition = ITEM_CATALOG[drop.itemId];
      queueDungeonReward(character, {
        itemId: drop.itemId,
        quantity: 1,
        rarity: definition?.slot ? getRarityFromRoll() : undefined
      });
    }
  }
}

function failDungeonRun(character: Character) {
  clearDungeonRun(character);
}

function applyDungeonRoomAction(character: Character, playerId: string) {
  const run = character.dungeonProgress?.activeRun;
  if (!run) {
    return;
  }
  if (run.roomIndex >= run.rooms.length) {
    return;
  }

  const room = run.rooms[run.roomIndex];
  if (room.type === "horde" || room.type === "boss") {
    startNextDungeonCombat(character);
    return;
  }

  if (room.type === "buff" && room.buff) {
    if (room.buff === "heal_full") {
      const stats = deriveStats(character, ITEM_CATALOG);
      character.currentHp = stats.maxHp;
    }
    if (!run.activeBuffs.includes(room.buff)) {
      run.activeBuffs.push(room.buff);
    }
    progressToNextDungeonRoom(character);
    return;
  }

  if (room.type === "trap" && room.trap) {
    if (room.trap === "hp_20") {
      const stats = deriveStats(character, ITEM_CATALOG);
      const damage = Math.max(1, Math.floor(stats.maxHp * 0.2));
      character.currentHp = Math.max(0, character.currentHp - damage);
    } else if (!run.activeTraps.includes(room.trap)) {
      run.activeTraps.push(room.trap);
    }
    if (character.currentHp <= 0) {
      clearDungeonRun(character);
      socketByPlayer(playerId)?.emit("game:error", { message: "Você morreu na armadilha da masmorra e perdeu os espólios pendentes." });
      return;
    }
    progressToNextDungeonRoom(character);
    return;
  }

  if (room.type === "chest") {
    for (const reward of room.rewards ?? []) {
      queueDungeonReward(character, reward);
    }
    progressToNextDungeonRoom(character);
  }
}

function completeDungeonRun(character: Character, playerId: string) {
  const run = character.dungeonProgress?.activeRun;
  if (!run) {
    return;
  }
  character.dungeonProgress ??= {};
  character.dungeonProgress.unlockedFloorByCountry ??= {};
  character.dungeonProgress.clearedFloorsByCountry ??= {};

  const clearedFloors = character.dungeonProgress.clearedFloorsByCountry[run.countryId] ?? [];
  const firstClear = !clearedFloors.includes(run.floor);
  if (firstClear) {
    character.dungeonProgress.clearedFloorsByCountry[run.countryId] = [...clearedFloors, run.floor].sort((a, b) => a - b);
  }

  const discardedItems: string[] = [];
  character.gold += run.pendingGold;
  grantExperience(character, run.pendingExperience);
  for (const reward of run.pendingItems) {
    try {
      addItem(character, reward.itemId, ITEM_CATALOG, reward.quantity, { rarity: reward.rarity });
    } catch {
      const itemName = ITEM_CATALOG[reward.itemId]?.name ?? reward.itemId;
      discardedItems.push(`${itemName}${reward.quantity > 1 ? ` x${reward.quantity}` : ""}`);
    }
  }
  if (firstClear) {
    try {
      addItem(character, DUNGEON_KEY_ITEM_ID, ITEM_CATALOG, 1);
    } catch {
      discardedItems.push(ITEM_CATALOG[DUNGEON_KEY_ITEM_ID]?.name ?? DUNGEON_KEY_ITEM_ID);
    }
  }
  character.dungeonClears += 1;
  const nextUnlocked = Math.min(DUNGEON_TOTAL_FLOORS, run.floor + 1);
  character.dungeonProgress.unlockedFloorByCountry[run.countryId] = Math.max(
    character.dungeonProgress.unlockedFloorByCountry[run.countryId] ?? 1,
    nextUnlocked
  );
  clearDungeonRun(character);
  socketByPlayer(playerId)?.emit("game:error", {
    message: `Andar ${run.floor} concluído. Recompensas recebidas: ${run.pendingExperience} XP, ${run.pendingGold} ouro${firstClear ? " e +1 Chave de Masmorra" : ""}.${discardedItems.length > 0 ? ` Itens descartados por falta de espaço: ${discardedItems.join(", ")}.` : ""}`
  });
}

function resolveDungeonProgress(character: Character, playerId: string, battle: NonNullable<GameState["activeBattle"]>) {
  const run = character.dungeonProgress?.activeRun;
  if (!run || battle.mode !== "dungeon" || battle.status !== "ended") {
    return;
  }
  syncCharacterVitalsFromBattle(battle, character);
  const winner = battle.participants.find((participant) => participant.id === battle.winnerParticipantId);
  if (winner?.ownerPlayerId !== playerId) {
    failDungeonRun(character);
    return;
  }

  appendDungeonMonsterRewards(character, battle);
  if (run.currentEncounterMonsterIds && run.currentEncounterMonsterIds.length > 0) {
    run.currentEncounterMonsterIds.shift();
  }

  if (run.currentEncounterMonsterIds && run.currentEncounterMonsterIds.length > 0) {
    // More horde monsters remain. Keep the ended battle in activeBattleId so the
    // client can finish playing the death animation; the client will then call
    // dungeon:advance automatically to start the next combat.
    return;
  }

  character.activeBattleId = null;
  progressToNextDungeonRoom(character);

  if (!character.dungeonProgress?.activeRun) {
    return;
  }
  const updatedRun = character.dungeonProgress.activeRun;
  if (updatedRun.roomIndex >= updatedRun.rooms.length) {
    completeDungeonRun(character, playerId);
    return;
  }

  const nextRoom = updatedRun.rooms[updatedRun.roomIndex];
  if (nextRoom?.type === "horde") {
    startNextDungeonCombat(character);
  }
}

type EnhancementRequirement = {
  itemId: string;
  quantity: number;
};

function getEnhancementRequirements(nextLevel: number, creationStones: number): EnhancementRequirement[] {
  const materialQuantity = getEnhancementMaterialQuantity(nextLevel);
  const requirements: EnhancementRequirement[] = [
    { itemId: ENHANCEMENT_ITEMS.oldStone, quantity: materialQuantity }
  ];

  if (nextLevel >= 4) {
    requirements.push({ itemId: ENHANCEMENT_ITEMS.eranStone, quantity: materialQuantity });
  }
  if (nextLevel >= 6) {
    requirements.push({ itemId: ENHANCEMENT_ITEMS.celena, quantity: materialQuantity });
  }
  if (nextLevel >= 9) {
    requirements.push({ itemId: ENHANCEMENT_ITEMS.midran, quantity: materialQuantity });
  }
  if (creationStones > 0) {
    requirements.push({ itemId: ENHANCEMENT_ITEMS.creationStone, quantity: creationStones });
  }

  return requirements;
}

function getEnhancementPlan(item: InventoryItem, requestedCreationStones?: number) {
  const nextLevel = Math.max(0, item.enhancementLevel ?? 0) + 1;
  const baseChance = getEnhancementBaseChance(nextLevel);
  const requested = Math.max(0, Math.floor(requestedCreationStones ?? 0));
  const usefulCreationStones = Math.max(0, Math.ceil((100 - baseChance) / ENHANCEMENT_CREATION_STONE_BONUS));
  const creationStones = Math.min(requested, usefulCreationStones);
  const successChance = Math.min(100, baseChance + creationStones * ENHANCEMENT_CREATION_STONE_BONUS);

  return {
    nextLevel,
    goldCost: nextLevel * ENHANCEMENT_GOLD_STEP,
    baseChance,
    creationStones,
    successChance,
    requirements: getEnhancementRequirements(nextLevel, creationStones)
  };
}

function enhanceEquipment(character: Character, payload: EnhancePayload) {
  const city = CITIES.find((entry) => entry.id === character.cityId);
  if (!city?.blacksmithEnhancement) {
    throw new Error("Este ferreiro não faz aprimoramentos.");
  }

  const inventoryItem = findInventoryItem(character, payload.instanceId);
  if (!inventoryItem) {
    throw new Error("Item não encontrado.");
  }
  const definition = ITEM_CATALOG[inventoryItem.itemId];
  if (!definition?.slot) {
    throw new Error("Apenas equipamentos podem ser aprimorados.");
  }

  const plan = getEnhancementPlan(inventoryItem, payload.creationStones);
  if (!canEnhanceLevelInCountry(city.countryId, plan.nextLevel)) {
    throw new Error(`Este ferreiro aprimora apenas equipamentos de ${describeEnhancementLevelRange(city.countryId)}.`);
  }
  if (character.gold < plan.goldCost) {
    throw new Error("Ouro insuficiente para o serviço.");
  }
  for (const requirement of plan.requirements) {
    if (countItem(character, requirement.itemId) < requirement.quantity) {
      throw new Error(`Falta ${ITEM_CATALOG[requirement.itemId]?.name ?? requirement.itemId}.`);
    }
  }

  character.gold -= plan.goldCost;
  for (const requirement of plan.requirements) {
    removeItemByItemId(character, requirement.itemId, requirement.quantity);
  }

  const success = Math.random() * 100 < plan.successChance;
  character.questProgress.equipmentEnhancementAttempts += 1;
  if (success) {
    inventoryItem.enhancementLevel = plan.nextLevel;
    character.questProgress.equipmentEnhancementSuccesses += 1;
  }
  normalizeVitals(character);

  return {
    success,
    itemName: definition.name,
    nextLevel: plan.nextLevel,
    successChance: plan.successChance
  };
}

function grantInventoryEntry(character: Character, item: InventoryItem) {
  const definition = ITEM_CATALOG[item.itemId];
  if (!definition) {
    throw new Error("Item inválido.");
  }

  if (!definition.slot) {
    addItem(character, item.itemId, ITEM_CATALOG, item.quantity);
    return;
  }

  if (!hasCapacity(character, 1)) {
    throw new Error("Inventário cheio.");
  }

  character.inventory.push({
    instanceId: randomUUID(),
    itemId: item.itemId,
    quantity: 1,
    enhancementLevel: item.enhancementLevel,
    rarity: item.rarity
  });
}

function returnInventoryEntry(character: Character, item: InventoryItem) {
  const definition = ITEM_CATALOG[item.itemId];
  if (!definition) {
    throw new Error("Item inválido.");
  }

  if (!definition.slot) {
    const stack = character.inventory.find((entry) => entry.itemId === item.itemId);
    if (stack) {
      stack.quantity += item.quantity;
      return;
    }
    character.inventory.push({
      instanceId: randomUUID(),
      itemId: item.itemId,
      quantity: item.quantity
    });
    return;
  }

  character.inventory.push({
    instanceId: randomUUID(),
    itemId: item.itemId,
    quantity: 1,
    enhancementLevel: item.enhancementLevel,
    rarity: item.rarity
  });
}

function canReceiveInventoryEntry(character: Character, item: InventoryItem) {
  const definition = ITEM_CATALOG[item.itemId];
  if (!definition) {
    return false;
  }
  if (!definition.slot && character.inventory.some((entry) => entry.itemId === item.itemId)) {
    return true;
  }
  return hasCapacity(character, 1);
}

function canReceiveItemAfterRemoval(character: Character, item: InventoryItem, removedInstanceId: string | null) {
  const definition = ITEM_CATALOG[item.itemId];
  if (!definition) {
    return false;
  }
  if (!definition.slot && character.inventory.some((entry) => entry.itemId === item.itemId && entry.instanceId !== removedInstanceId)) {
    return true;
  }
  const usedAfterRemoval = inventoryUsed(character) - (removedInstanceId ? 1 : 0);
  return usedAfterRemoval + 1 <= getInventoryCapacity(character);
}

function createEscrowItem(character: Character, instanceId: string, quantity: number) {
  const inventoryItem = findInventoryItem(character, instanceId);
  if (!inventoryItem) {
    throw new Error("Item não encontrado.");
  }
  if (isEquipped(character, inventoryItem.instanceId)) {
    throw new Error("Desequipe o item antes de oferecer em troca.");
  }
  const definition = ITEM_CATALOG[inventoryItem.itemId];
  if (!definition) {
    throw new Error("Item inválido.");
  }
  if (inventoryItem.itemId === DUNGEON_KEY_ITEM_ID) {
    throw new Error("Chave de Masmorra não pode ser trocada.");
  }

  const requestedQuantity = Math.max(1, Math.floor(quantity));
  const safeQuantity = definition.slot ? 1 : requestedQuantity;
  if (safeQuantity > inventoryItem.quantity) {
    throw new Error("Quantidade indisponível para troca.");
  }
  const escrowItem: InventoryItem = {
    instanceId: safeQuantity === inventoryItem.quantity ? inventoryItem.instanceId : randomUUID(),
    itemId: inventoryItem.itemId,
    quantity: safeQuantity,
    enhancementLevel: inventoryItem.enhancementLevel,
    rarity: inventoryItem.rarity
  };
  removeItem(character, inventoryItem.instanceId, safeQuantity);
  return escrowItem;
}

function createEscrowItems(character: Character, entries: Array<{ instanceId: string; quantity: number }> = []) {
  const normalized = new Map<string, number>();
  for (const entry of entries) {
    const instanceId = String(entry.instanceId ?? "");
    const quantity = Math.floor(Number(entry.quantity) || 0);
    if (!instanceId || quantity <= 0) {
      continue;
    }
    normalized.set(instanceId, (normalized.get(instanceId) ?? 0) + quantity);
  }

  if (normalized.size > 12) {
    throw new Error("Selecione no máximo 12 itens por proposta.");
  }

  const prepared = Array.from(normalized.entries()).map(([instanceId, quantity]) => {
    const inventoryItem = findInventoryItem(character, instanceId);
    if (!inventoryItem) {
      throw new Error("Item não encontrado.");
    }
    if (isEquipped(character, inventoryItem.instanceId)) {
      throw new Error("Desequipe o item antes de oferecer em troca.");
    }
    const definition = ITEM_CATALOG[inventoryItem.itemId];
    if (!definition) {
      throw new Error("Item inválido.");
    }
    if (inventoryItem.itemId === DUNGEON_KEY_ITEM_ID) {
      throw new Error("Chave de Masmorra não pode ser trocada.");
    }
    const safeQuantity = definition.slot ? 1 : Math.max(1, Math.floor(quantity));
    if (safeQuantity > inventoryItem.quantity) {
      throw new Error("Quantidade indisponível para troca.");
    }
    return {
      instanceId: inventoryItem.instanceId,
      quantity: safeQuantity,
      escrowItem: {
        instanceId: safeQuantity === inventoryItem.quantity ? inventoryItem.instanceId : randomUUID(),
        itemId: inventoryItem.itemId,
        quantity: safeQuantity,
        enhancementLevel: inventoryItem.enhancementLevel,
        rarity: inventoryItem.rarity
      } as InventoryItem
    };
  });

  for (const entry of prepared) {
    removeItem(character, entry.instanceId, entry.quantity);
  }
  return prepared.map((entry) => entry.escrowItem);
}

function createTradeBundle(character: Character, items: Array<{ instanceId: string; quantity: number }> = [], gold = 0, requireContent = true): ItemTradeBundle {
  const safeGold = Math.max(0, Math.floor(Number(gold) || 0));
  if (safeGold > character.gold) {
    throw new Error("Ouro insuficiente para a proposta.");
  }

  const escrowItems = createEscrowItems(character, items);
  if (requireContent && escrowItems.length === 0 && safeGold <= 0) {
    throw new Error("Inclua pelo menos um item ou ouro na proposta.");
  }

  character.gold -= safeGold;
  return { items: escrowItems, gold: safeGold };
}

function canReceiveTradeBundle(character: Character, bundle: ItemTradeBundle) {
  let usedSlots = inventoryUsed(character);
  const stackableItemIds = new Set(
    character.inventory
      .filter((item) => {
        const definition = ITEM_CATALOG[item.itemId];
        return definition && !definition.slot;
      })
      .map((item) => item.itemId)
  );

  for (const item of bundle.items) {
    const definition = ITEM_CATALOG[item.itemId];
    if (!definition) {
      return false;
    }
    if (!definition.slot) {
      if (stackableItemIds.has(item.itemId)) {
        continue;
      }
      stackableItemIds.add(item.itemId);
    }
    usedSlots += 1;
    if (usedSlots > getInventoryCapacity(character)) {
      return false;
    }
  }
  return true;
}

function grantTradeBundle(character: Character, bundle: ItemTradeBundle) {
  for (const item of bundle.items) {
    grantInventoryEntry(character, item);
  }
  character.gold += Math.max(0, Math.floor(bundle.gold ?? 0));
}

function describeTradeBundle(bundle: ItemTradeBundle) {
  const parts: string[] = [];
  const itemQuantity = bundle.items.reduce((total, item) => total + Math.max(1, item.quantity), 0);
  if (itemQuantity > 0) {
    parts.push(`${itemQuantity} item${itemQuantity > 1 ? "s" : ""}`);
  }
  if ((bundle.gold ?? 0) > 0) {
    parts.push(`${Math.floor(bundle.gold).toLocaleString("pt-BR")} ouro`);
  }
  return parts.join(" e ") || "nenhum item";
}

function pushTradeNotification(playerId: string, title: string, message: string, trade: ItemTradeOffer) {
  pushPlayerNotification(playerId, "trade", title, message, {
    tradeId: trade.id,
    status: trade.status,
    fromPlayerId: trade.fromPlayerId,
    toPlayerId: trade.toPlayerId
  });
}

function getTradeExpiresAt(trade: ItemTradeOffer) {
  if (trade.status === "pending_response") {
    return trade.expiresAt ?? trade.createdAt + TRADE_INTERACTION_TIMEOUT_MS;
  }
  if (trade.status === "countered") {
    return trade.expiresAt ?? (trade.respondedAt ?? trade.createdAt) + TRADE_INTERACTION_TIMEOUT_MS;
  }
  return trade.expiresAt;
}

function expireTradeIfNeeded(trade: ItemTradeOffer, now = Date.now()) {
  if (trade.status !== "pending_response" && trade.status !== "countered") {
    return false;
  }
  const expiresAt = getTradeExpiresAt(trade);
  trade.expiresAt = expiresAt;
  if (!expiresAt || expiresAt > now) {
    return false;
  }

  grantTradeBundle(currentCharacter(trade.fromPlayerId), trade.offer);
  if (trade.status === "countered") {
    grantTradeBundle(currentCharacter(trade.toPlayerId), trade.counter);
  }
  trade.status = "declined";
  trade.resolvedAt = now;
  pushTradeNotification(
    trade.fromPlayerId,
    "Troca recusada por expiração",
    `A troca com ${trade.toName} expirou após 24 horas. Seus itens e ouro foram devolvidos.`,
    trade
  );
  pushTradeNotification(
    trade.toPlayerId,
    "Troca recusada por expiração",
    `A troca com ${trade.fromName} expirou após 24 horas.`,
    trade
  );
  return true;
}

function expireStaleItemTrades(now = Date.now()) {
  const affectedPlayerIds = new Set<string>();
  for (const trade of store.itemTrades.values()) {
    if (expireTradeIfNeeded(trade, now)) {
      affectedPlayerIds.add(trade.fromPlayerId);
      affectedPlayerIds.add(trade.toPlayerId);
    }
  }
  if (affectedPlayerIds.size > 0) {
    persistStoreSoon();
  }
  return affectedPlayerIds;
}

function getItemValue(item: InventoryItem) {
  const definition = ITEM_CATALOG[item.itemId];
  if (!definition) {
    return 1;
  }

  const rarity = definition.slot ? item.rarity ?? definition.rarity ?? "common" : definition.rarity ?? "common";
  return Math.max(1, Math.floor(definition.price * RARITY_PRICE_MULTIPLIER[rarity]));
}

function craftItem(character: Character, recipeId: string, quantity = 1) {
  const recipe = CRAFTING_RECIPES[recipeId];
  if (!recipe) {
    throw new Error("Receita não encontrada.");
  }
  const amount = Math.max(1, Math.min(999, Math.floor(quantity)));
  if (!recipe.cityIds.includes(character.cityId)) {
    throw new Error("Esta receita não está disponível nesta cidade.");
  }
  const resultDefinition = ITEM_CATALOG[recipe.resultItemId];
  if (!resultDefinition) {
    throw new Error("Resultado da receita inválido.");
  }
  if (character.gold < recipe.goldCost * amount) {
    throw new Error("Ouro insuficiente para criar o item.");
  }
  for (const ingredient of recipe.ingredients) {
    if (countItem(character, ingredient.itemId) < ingredient.quantity * amount) {
      throw new Error(`Falta ${ITEM_CATALOG[ingredient.itemId]?.name ?? ingredient.itemId}.`);
    }
  }
  if (resultDefinition.slot) {
    if (!hasCapacity(character, amount * recipe.resultQuantity)) {
      throw new Error("Inventário cheio.");
    }
  } else if (!character.inventory.some((item) => item.itemId === recipe.resultItemId) && !hasCapacity(character, 1)) {
    throw new Error("Inventário cheio.");
  }

  character.gold -= recipe.goldCost * amount;
  for (const ingredient of recipe.ingredients) {
    removeItemByItemId(character, ingredient.itemId, ingredient.quantity * amount);
  }
  for (let index = 0; index < amount; index += 1) {
    addItem(character, recipe.resultItemId, ITEM_CATALOG, recipe.resultQuantity);
  }
}

function buyTalent(character: Character, talentId: string) {
  const talent = TALENTS.find((entry) => entry.id === talentId);
  if (!talent) {
    throw new Error("Talento não encontrado.");
  }
  const currentRank = character.talentAllocations[talent.id] ?? 0;
  if (currentRank >= talent.maxRank) {
    throw new Error("Talento no nível máximo.");
  }
  if (talent.requires && (character.talentAllocations[talent.requires] ?? 0) <= 0) {
    throw new Error("Adquira o talento anterior da ramificação.");
  }
  const stats = deriveStats(character, ITEM_CATALOG);
  if (stats.availableTalentPoints < talent.costPerRank) {
    throw new Error("Pontos de talento insuficientes.");
  }
  character.talentAllocations[talent.id] = currentRank + 1;
  normalizeVitals(character);
}

function resetTalents(character: Character, method: ResetPayload["method"]) {
  if (method === "scroll") {
    const scroll = character.inventory.find((item) => item.itemId === "oblivion_scroll");
    if (!scroll) {
      throw new Error("Pergaminho do esquecimento indisponível.");
    }
    removeItem(character, scroll.instanceId, 1);
  } else {
    const cost = 25;
    if (character.diamonds < cost) {
      throw new Error(`São necessários ${cost} diamantes.`);
    }
    character.diamonds -= cost;
  }
  character.talentAllocations = {};
  normalizeVitals(character);
}

function resetAttributes(character: Character, method: ResetPayload["method"]) {
  if (method === "scroll") {
    const scroll = character.inventory.find((item) => item.itemId === "memory_scroll");
    if (!scroll) {
      throw new Error("Pergaminho da memória indisponível.");
    }
    removeItem(character, scroll.instanceId, 1);
  } else {
    const cost = 20;
    if (character.diamonds < cost) {
      throw new Error(`São necessários ${cost} diamantes.`);
    }
    character.diamonds -= cost;
  }
  character.attributes = { strength: 1, constitution: 1, agility: 1 };
  character.unspentAttributePoints = Math.max(0, (character.level - 1) * 3);
  normalizeVitals(character);
}

function leaveArenaQueue(playerId: string) {
  store.arenaQueue = store.arenaQueue.filter((queued) => queued !== playerId);
}

function findRankedArenaOpponent(character: Character) {
  const currentPoints = character.arenaRankedPoints ?? ARENA_RANKED_STARTING_POINTS;
  const closest = Array.from(store.characters.values())
    .filter((candidate) => candidate.playerId !== character.playerId)
    .sort((left, right) => {
      const leftDiff = Math.abs((left.arenaRankedPoints ?? ARENA_RANKED_STARTING_POINTS) - currentPoints);
      const rightDiff = Math.abs((right.arenaRankedPoints ?? ARENA_RANKED_STARTING_POINTS) - currentPoints);
      return leftDiff - rightDiff || right.level - left.level || left.name.localeCompare(right.name);
    })
    .slice(0, 10);
  return closest[Math.floor(Math.random() * closest.length)] ?? null;
}

function activePlayerIdsForBattle(battleId: string) {
  const battle = store.battles.get(battleId);
  return battle?.participants
    .map((participant) => participant.ownerPlayerId)
    .filter((playerId): playerId is string => Boolean(playerId)) ?? [];
}

io.on("connection", (socket: AuthedSocket) => {
  socket.on("auth:resume", (sessionToken: string) => {
    try {
      const token = String(sessionToken ?? "");
      const playerId = store.sessions.get(token);
      if (!playerId || !store.players.has(playerId)) {
        throw new Error("Sessão expirada.");
      }
      attachSocketSession(socket, playerId, token);
      socket.emit("auth:ok", { sessionToken: token, playerId });
      trackEvent(playerId, "session_started", {
        method: "resume"
      });
      broadcastWorldState();
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("auth:login", async (payload: LoginPayload) => {
    try {
      const email = normalizeEmail(String(payload.email ?? ""));
      const password = String(payload.password ?? "");
      const account = store.accountsByEmail.get(email);
      if (!account || !verifySecret(password, account.passwordHash)) {
        throw new Error("E-mail ou senha invalidos.");
      }

      const sessionToken = createSession(socket, account.playerId);
      socket.emit("auth:ok", { sessionToken, playerId: account.playerId });
      trackEvent(account.playerId, "session_started", {
        method: "password"
      });
      broadcastWorldState();
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("auth:register", async (payload: RegisterPayload) => {
    try {
      const username = sanitizeName(String(payload.username ?? ""));
      const email = normalizeEmail(String(payload.email ?? ""));
      const password = String(payload.password ?? "");
      const inviteCode = normalizeReferralCode(String(payload.inviteCode ?? ""));
      if (username.length < 3) {
        throw new Error("Use um nome com pelo menos 3 caracteres.");
      }
      if (!validateEmail(email)) {
        throw new Error("Informe um e-mail valido.");
      }
      assertPassword(password);
      if (store.accountsByEmail.has(email)) {
        throw new Error("Já existe uma conta com este e-mail.");
      }
      const usernameTaken = Array.from(store.players.values()).some(
        (player) => player.username.toLowerCase() === username.toLowerCase()
      );
      if (usernameTaken) {
        throw new Error("Este nome de recruta já está em uso.");
      }
      const inviter = inviteCode ? findInviterByReferralCode(inviteCode) : null;
      if (inviteCode && !inviter) {
        throw new Error("Código de convite inválido.");
      }

      const player: Player = {
        id: randomUUID(),
        username,
        email,
        createdAt: Date.now(),
        referredByPlayerId: inviter?.id
      };
      player.referralCode = createReferralCode(username, player.id);
      const character = createCharacter(player);
      const recoveryCode = createRecoveryCode();

      store.players.set(player.id, player);
      store.characters.set(player.id, character);
      const account: AuthAccount = {
        playerId: player.id,
        email,
        passwordHash: hashSecret(password),
        recoveryCodeHash: hashSecret(normalizeRecoveryCode(recoveryCode)),
        createdAt: Date.now(),
        emailVerifiedAt: Date.now()
      };
      store.accountsByEmail.set(email, account);
      if (inviter) {
        pushPlayerNotification(
          inviter.id,
          "invite_used",
          "Código de convite utilizado",
          `${character.name} criou uma conta usando seu código de convite.`,
          { invitedPlayerId: player.id }
        );
      }

      persistStoreSoon();
      trackEvent(player.id, "user_registered", {
        referralUsed: Boolean(inviter)
      });
      const sessionToken = createSession(socket, player.id);
      socket.emit("auth:ok", { sessionToken, playerId: player.id });
      broadcastWorldState();
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("auth:verifyEmail", (payload: VerifyEmailPayload) => {
    try {
      const token = String(payload.token ?? "");
      const account = findAccountByToken(token, "email");
      if (!account) {
        throw new Error("Link de confirmação inválido ou expirado.");
      }
      account.emailVerifiedAt = Date.now();
      account.emailVerificationTokenHash = undefined;
      account.emailVerificationTokenExpiresAt = undefined;
      persistStoreSoon();
      trackEvent(account.playerId, "email_verified");
      socket.emit("auth:notice", {
        message: "E-mail confirmado. Você já pode entrar em Litch.",
        mode: "login"
      });
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("auth:forgotPassword", async (payload: ForgotPasswordPayload) => {
    try {
      void payload;
      socket.emit("auth:notice", {
        message: "Recuperação por e-mail está temporariamente desabilitada.",
        mode: "login"
      });
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("auth:resetPassword", (payload: ResetPasswordPayload) => {
    try {
      const token = String(payload.token ?? "");
      const newPassword = String(payload.newPassword ?? "");
      const account = findAccountByToken(token, "password");
      if (!account) {
        throw new Error("Link de redefinição inválido ou expirado.");
      }
      assertPassword(newPassword);

      const nextRecoveryCode = createRecoveryCode();
      account.passwordHash = hashSecret(newPassword);
      account.recoveryCodeHash = hashSecret(normalizeRecoveryCode(nextRecoveryCode));
      account.passwordUpdatedAt = Date.now();
      account.recoveryCodeUpdatedAt = Date.now();
      account.passwordResetTokenHash = undefined;
      account.passwordResetTokenExpiresAt = undefined;
      account.emailVerifiedAt ??= Date.now();
      deleteSessionsForPlayer(account.playerId);
      forceLogoutPlayerSockets(account.playerId, socket.id);

      const sessionToken = createSession(socket, account.playerId);
      socket.emit("auth:ok", { sessionToken, playerId: account.playerId });
      broadcastWorldState();
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("account:changePassword", (payload: ChangePasswordPayload) => {
    try {
      const playerId = requirePlayer(socket);
      const account = accountForPlayer(playerId);
      const currentPassword = String(payload.currentPassword ?? "");
      const newPassword = String(payload.newPassword ?? "");
      if (!verifySecret(currentPassword, account.passwordHash)) {
        throw new Error("Senha atual invalida.");
      }
      assertPassword(newPassword);
      account.passwordHash = hashSecret(newPassword);
      account.passwordUpdatedAt = Date.now();
      persistStoreSoon();
      socket.emit("account:passwordChanged");
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("auth:logout", (sessionToken?: string) => {
    const token = socket.data.sessionToken ?? String(sessionToken ?? "");
    if (token) {
      store.sessions.delete(token);
    }
    const playerId = detachSocketSession(socket);
    if (playerId) {
      leaveArenaQueue(playerId);
    }
    socket.emit("auth:logout");
    persistStoreSoon();
    broadcastWorldState();
  });

  socket.on("notifications:read", (payload?: { ids?: string[] }) => {
    try {
      const playerId = requirePlayer(socket);
      const ids = new Set((payload?.ids ?? []).map(String));
      const now = Date.now();
      for (const notification of store.notifications) {
        if (notification.playerId !== playerId || notification.readAt) {
          continue;
        }
        if (ids.size === 0 || ids.has(notification.id)) {
          notification.readAt = now;
        }
      }
      emitState(playerId);
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("character:allocate", (payload: AllocatePayload) => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      ensureNotInBattle(character);
      const strength = Math.max(0, Math.floor(payload.strength ?? 0));
      const constitution = Math.max(0, Math.floor(payload.constitution ?? 0));
      const agility = Math.max(0, Math.floor(payload.agility ?? 0));
      const total = strength + constitution + agility;
      if (total <= 0 || total > character.unspentAttributePoints) {
        throw new Error("Pontos de atributo insuficientes.");
      }

      character.attributes.strength += strength;
      character.attributes.constitution += constitution;
      character.attributes.agility += agility;
      character.unspentAttributePoints -= total;
      normalizeVitals(character);
      emitState(playerId);
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("character:avatar", (payload: AvatarSelectPayload) => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      ensureNotInBattle(character);
      selectAvatar(character, String(payload.avatarId ?? ""));
      emitState(playerId);
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("city:travel", (payload: TravelPayload) => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      clearEndedBattle(character);
      ensureNotInBattle(character);

      const city = CITIES.find((entry) => entry.id === payload.cityId);
      if (!city) {
        throw new Error("Cidade inválida.");
      }
      if (city.id === character.cityId) {
        emitState(playerId);
        return;
      }
      const currentCity = CITIES.find((entry) => entry.id === character.cityId) ?? CITIES[0];
      const sameCountry = currentCity.countryId === city.countryId;
      if (!sameCountry && isWorkInProgress(character.activeWork)) {
        throw new Error("Você está trabalhando e não pode viajar para outro país.");
      }
      const destinationCountry = COUNTRIES.find((country) => country.id === city.countryId);
      if (!sameCountry && !city.isPort) {
        const destinationPort = CITIES.find((entry) => entry.id === destinationCountry?.portCityId);
        throw new Error(`Viaje primeiro para ${destinationPort?.name ?? "o porto"} antes de acessar cidades internas.`);
      }
      const destinationCity = sameCountry
        ? city
        : CITIES.find((entry) => entry.id === destinationCountry?.portCityId) ?? city;
      const ticketId = sameCountry ? TRAIN_TICKET_ID : SHIP_TICKET_ID;
      const ticketName = ITEM_CATALOG[ticketId]?.name ?? ticketId;

      if (character.level < destinationCity.minLevel) {
        throw new Error(`Nível ${destinationCity.minLevel} necessário para viajar até ${destinationCity.name}.`);
      }
      if (countItem(character, ticketId) < 1) {
        throw new Error(`Você precisa de 1 ${ticketName}.`);
      }

      removeItemByItemId(character, ticketId, 1);
      character.cityId = destinationCity.id;
      leaveArenaQueue(playerId);
      emitState(playerId);
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("work:start", (payload: WorkStartPayload) => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      clearEndedBattle(character);
      ensureNotInBattle(character);
      startWork(character, payload);
      if (character.activeWork) {
        trackCharacterEvent(playerId, "work_started", character, {
          serviceId: character.activeWork.serviceId,
          minutes: character.activeWork.minutes
        });
      }
      leaveArenaQueue(playerId);
      emitState(playerId);
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("work:claim", () => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      const beforeLevel = character.level;
      const workMinutes = character.activeWork ? getWorkMinutesFromAssignment(character.activeWork) : 0;
      const result = claimWork(character);
      trackCharacterEvent(playerId, "work_claimed", character, {
        serviceId: result.service.id,
        minutes: workMinutes,
        xpGained: result.reward.experience ?? 0,
        goldGained: result.reward.gold ?? 0,
        diamondsGained: result.reward.diamonds ?? 0,
        workAptitudeBefore: result.beforeLevel,
        workAptitudeAfter: result.afterLevel
      });
      trackLevelUps(playerId, beforeLevel, character, "work");
      emitState(playerId);
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("work:abandon", () => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      abandonWork(character);
      emitState(playerId);
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("work:claimBonus", (payload: WorkBonusClaimPayload) => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      claimWorkBonus(character, payload);
      emitState(playerId);
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("shop:buy", (payload: ShopBuyPayload) => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      ensureNotInBattle(character);
      const city = CITIES.find((entry) => entry.id === character.cityId) ?? CITIES[0];
      const item = ITEM_CATALOG[payload.itemId];
      if (!item) {
        throw new Error("Item inválido.");
      }

      const requestedShop = payload.shop ?? "apothecary";
      const available =
        requestedShop === "armorer"
          ? (city.armorerItemIds ?? []).includes(item.id)
          : requestedShop === "apothecary"
            ? (city.apothecaryItemIds ?? []).includes(item.id) && item.kind !== "scroll" && item.kind !== "ticket"
            : requestedShop === "goldCoinMerchant"
              ? Boolean(city.goldCoinMerchantItemIds?.includes(item.id) && item.goldCoinPrice && item.goldCoinPrice > 0)
              : Boolean(city.isPort && city.moneyChangerItemIds?.includes(item.id) && (item.kind === "scroll" || item.kind === "ticket"));
      if (!available) {
        throw new Error("Este comerciante não vende o item aqui.");
      }
      const quantity = item.slot ? 1 : Math.max(1, Math.min(999, Math.floor(payload.quantity ?? 1)));

      if (requestedShop === "goldCoinMerchant") {
        const goldCoinCost = (item.goldCoinPrice ?? 0) * quantity;
        if (countItem(character, ARENA_GOLD_COIN_ID) < goldCoinCost) {
          throw new Error("Moedas de Arena insuficientes.");
        }
        addItem(character, item.id, ITEM_CATALOG, quantity);
        removeItemByItemId(character, ARENA_GOLD_COIN_ID, goldCoinCost);
        character.questProgress.shopItemsBought += 1;
        trackCharacterEvent(playerId, "shop_item_bought", character, {
          shop: requestedShop,
          itemId: item.id,
          itemKind: item.kind,
          quantity,
          currency: "arena_gold_coin",
          totalPrice: goldCoinCost
        });
        emitState(playerId);
        return;
      }

      const totalPrice = item.price * quantity;
      if (character.gold < totalPrice) {
        throw new Error("Ouro insuficiente.");
      }
      addItem(character, item.id, ITEM_CATALOG, quantity);
      character.gold -= totalPrice;
      character.questProgress.shopItemsBought += 1;
      trackCharacterEvent(playerId, "shop_item_bought", character, {
        shop: requestedShop,
        itemId: item.id,
        itemKind: item.kind,
        quantity,
        currency: "gold",
        totalPrice
      });
      emitState(playerId);
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("shop:sell", (payload: SellPayload) => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      ensureNotInBattle(character);
      const item = findInventoryItem(character, payload.instanceId);
      if (!item) {
        throw new Error("Item não encontrado.");
      }
      if (isEquipped(character, item.instanceId)) {
        throw new Error("Desequipe o item antes de vender.");
      }

      const definition = ITEM_CATALOG[item.itemId];
      if (item.itemId === DUNGEON_KEY_ITEM_ID) {
        throw new Error("Chave de Masmorra não pode ser vendida.");
      }
      const quantity = Math.max(1, Math.floor(payload.quantity ?? 1));
      if (quantity > item.quantity) {
        throw new Error("Quantidade indisponível.");
      }

      removeItem(character, item.instanceId, quantity);
      character.gold += Math.max(1, Math.floor((getItemValue(item) * quantity) / 2));
      character.questProgress.shopItemsSold += quantity;
      emitState(playerId);
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("inventory:equip", (payload: EquipPayload) => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      ensureNotInBattle(character);
      const item = findInventoryItem(character, payload.instanceId);
      if (!item) {
        throw new Error("Item não encontrado.");
      }

      const definition = ITEM_CATALOG[item.itemId];
      if (!definition.slot) {
        throw new Error("Este item não é equipável.");
      }
      if (character.level < definition.minLevel) {
        throw new Error(`Nível ${definition.minLevel} necessário.`);
      }

      character.equipment[definition.slot] = item.instanceId;
      normalizeVitals(character);
      emitState(playerId);
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("inventory:use", (payload: UseItemPayload) => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      ensureNotInBattle(character);
      const item = findInventoryItem(character, payload.instanceId);
      if (!item) {
        throw new Error("Item não encontrado.");
      }
      const definition = ITEM_CATALOG[item.itemId];
      if (definition.kind !== "potion") {
        throw new Error("Este item não pode ser consumido.");
      }
      const stats = deriveStats(character, ITEM_CATALOG);
      if (definition.stats.healPercent) {
        if (character.currentHp >= stats.maxHp) {
          throw new Error("Sua vida já está cheia.");
        }
        character.currentHp = Math.min(stats.maxHp, character.currentHp + Math.ceil(stats.maxHp * definition.stats.healPercent));
      } else if (definition.stats.energyPercent) {
        if (character.currentEnergy >= stats.maxEnergy) {
          throw new Error("Sua energia já está cheia.");
        }
        character.currentEnergy = Math.min(
          stats.maxEnergy,
          character.currentEnergy + Math.ceil(stats.maxEnergy * definition.stats.energyPercent)
        );
      } else if (definition.stats.heal) {
        if (character.currentHp >= stats.maxHp) {
          throw new Error("Sua vida já está cheia.");
        }
        character.currentHp = Math.min(stats.maxHp, character.currentHp + definition.stats.heal);
      } else if (definition.stats.energy) {
        if (character.currentEnergy >= stats.maxEnergy) {
          throw new Error("Sua energia já está cheia.");
        }
        character.currentEnergy = Math.min(stats.maxEnergy, character.currentEnergy + definition.stats.energy);
      } else {
        throw new Error("Esta poção não tem efeito definido.");
      }
      removeItem(character, item.instanceId, 1);
      recordPotionProgress(character, definition);
      emitState(playerId);
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("craft:create", (payload: CraftPayload) => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      ensureNotInBattle(character);
      craftItem(character, payload.recipeId, payload.quantity ?? 1);
      emitState(playerId);
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("inventory:destroy", (payload: DestroyItemPayload) => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      ensureNotInBattle(character);
      const item = findInventoryItem(character, payload.instanceId);
      if (!item) {
        throw new Error("Item não encontrado.");
      }

      const definition = ITEM_CATALOG[item.itemId];
      if (definition?.slot) {
        if (isEquipped(character, item.instanceId)) {
          throw new Error("Desequipe o item antes de destruir.");
        }
        removeItem(character, item.instanceId, item.quantity);
        emitState(playerId);
        return;
      }

      const itemInstances = character.inventory.filter((entry) => entry.itemId === item.itemId);
      const hasEquippedInstance = itemInstances.some((entry) => isEquipped(character, entry.instanceId));
      if (hasEquippedInstance) {
        throw new Error("Desequipe todos os itens desse tipo antes de destruir.");
      }

      const totalQuantity = itemInstances.reduce((sum, entry) => sum + entry.quantity, 0);
      if (totalQuantity <= 0) {
        throw new Error("Quantidade indisponível.");
      }

      removeItemByItemId(character, item.itemId, totalQuantity);
      emitState(playerId);
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("blacksmith:enhance", (payload: EnhancePayload) => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      ensureNotInBattle(character);
      const result = enhanceEquipment(character, payload);
      emitState(playerId);
      socket.emit("blacksmith:enhanceResult", {
        success: result.success,
        itemName: result.itemName,
        nextLevel: result.nextLevel,
        successChance: result.successChance
      });
      socket.emit("game:error", {
        message: result.success
          ? `${result.itemName} aprimorado para +${result.nextLevel}.`
          : `Aprimoramento falhou (${result.successChance}% de chance).`
      });
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("talent:buy", (payload: TalentBuyPayload) => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      ensureNotInBattle(character);
      buyTalent(character, payload.talentId);
      emitState(playerId);
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("talent:reset", (payload: ResetPayload) => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      ensureNotInBattle(character);
      resetTalents(character, payload.method);
      emitState(playerId);
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("attribute:reset", (payload: ResetPayload) => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      ensureNotInBattle(character);
      resetAttributes(character, payload.method);
      emitState(playerId);
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("game:buyDiamonds", (payload: GameShopPurchasePayload) => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      ensureNotInBattle(character);
      const requestedPack = DIAMOND_PACKAGES.find((entry) => entry.id === payload.packageId);
      if (!requestedPack) {
        throw new Error("Pacote não encontrado.");
      }
      trackCharacterEvent(playerId, "diamond_purchase_requested", character, {
        packageId: requestedPack.id,
        packageName: requestedPack.name,
        diamonds: requestedPack.diamonds,
        priceLabel: requestedPack.priceLabel
      });
      throw new Error("Compra de diamantes via Pix manual. Abra o pacote, realize o pagamento e envie o comprovante ao desenvolvedor.");
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("game:adminGrantDiamonds", (payload: GameShopAdminGrantPayload) => {
    try {
      const adminPlayerId = requirePlayer(socket);
      const adminPlayer = currentPlayer(adminPlayerId);
      if (!GAME_SHOP_ADMIN_EMAIL) {
        throw new Error("Configure GAME_SHOP_ADMIN_EMAIL no servidor para liberar a inclusão manual de compras.");
      }
      if ((adminPlayer.email ?? "").toLowerCase() !== GAME_SHOP_ADMIN_EMAIL) {
        throw new Error("Apenas o desenvolvedor pode incluir compras manualmente.");
      }

      const targetPlayerId = String(payload.targetPlayerId ?? "").trim();
      const packageId = String(payload.packageId ?? "").trim();
      if (!targetPlayerId || !packageId) {
        throw new Error("Informe o jogador e o pacote para incluir a compra.");
      }

      const targetCharacter = currentCharacter(targetPlayerId);
      const grantedPack = buyDiamondPackage(targetCharacter, packageId);
      const pixHash = String(payload.pixHash ?? "").trim() || GAME_SHOP_PIX_HASH;
      const receiptNote = String(payload.receiptNote ?? "").trim() || undefined;
      pushDiamondPurchaseHistory(targetCharacter, {
        packageId: grantedPack.id,
        packageName: grantedPack.name,
        diamonds: grantedPack.diamonds,
        priceLabel: grantedPack.priceLabel,
        pixHash,
        receiptNote,
        grantedByPlayerId: adminPlayerId
      });
      pushPlayerNotification(
        targetPlayerId,
        "purchase_approved",
        "Compra Aprovada",
        `${grantedPack.name} foi aprovado. ${grantedPack.diamonds} diamantes foram adicionados à sua conta.`,
        { packageId: grantedPack.id, diamonds: grantedPack.diamonds }
      );

      emitState(targetPlayerId);
      if (targetPlayerId !== adminPlayerId) {
        emitState(adminPlayerId);
      }
      trackCharacterEvent(targetPlayerId, "diamond_purchase_granted", targetCharacter, {
        packageId: grantedPack.id,
        packageName: grantedPack.name,
        diamonds: grantedPack.diamonds,
        priceLabel: grantedPack.priceLabel
      });
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("clan:create", (payload: ClanCreatePayload) => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      ensureNotInBattle(character);
      createClan(character, payload.name, payload.icon);
      trackCharacterEvent(playerId, "clan_created", character, {
        clanId: character.clanId ?? null,
        diamondCost: CLAN_CREATE_DIAMOND_COST
      });
      broadcastWorldState();
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("clan:update", (payload: ClanUpdatePayload) => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      ensureNotInBattle(character);
      updateClan(character, payload.name, payload.icon, payload.description);
      broadcastWorldState();
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("clan:join", (payload: ClanJoinPayload) => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      ensureNotInBattle(character);
      joinClan(character, payload.clanId);
      broadcastWorldState();
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("clan:leave", () => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      ensureNotInBattle(character);
      leaveClan(character);
      broadcastWorldState();
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("clan:kick", (payload: ClanKickPayload) => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      ensureNotInBattle(character);
      kickClanMember(character, payload.memberPlayerId);
      broadcastWorldState();
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("clan:leadership:transfer", (payload: ClanTransferLeadershipPayload) => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      ensureNotInBattle(character);
      transferClanLeadership(character, payload.memberPlayerId);
      broadcastWorldState();
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("clan:donate", (payload: ClanDonatePayload) => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      ensureNotInBattle(character);
      donateToClan(character, payload.gold, payload.diamonds);
      broadcastWorldState();
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("clan:benefit:buy", (payload: ClanBenefitBuyPayload) => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      ensureNotInBattle(character);
      buyClanBenefit(character, payload.benefitId);
      broadcastWorldState();
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("clan:benefit:reset", () => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      ensureNotInBattle(character);
      resetClanBenefits(character);
      broadcastWorldState();
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("hunt:start", (payload: HuntStartPayload) => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      clearEndedBattle(character);
      ensureNotInBattle(character);
      ensureNotWorking(character);
      normalizeVitals(character);
      if (character.dungeonProgress?.activeRun) {
        throw new Error("Você já está em uma masmorra ativa.");
      }

      const cityMonsterIds = getCityHuntMonsterIds(character.cityId);
      if (!cityMonsterIds.includes(payload.monsterId)) {
        throw new Error("Este monstro não aparece nesta cidade.");
      }

      const monster = MONSTERS[payload.monsterId];
      if (character.currentHp <= 0) {
        throw new Error("Você precisa recuperar vida antes de caçar.");
      }
      if (character.currentEnergy < monster.level) {
        throw new Error(`Energia insuficiente. Esta caça exige ${monster.level} energia.`);
      }
      character.currentEnergy -= monster.level;
      const battle = createPveBattle(character, monster);
      store.battles.set(battle.id, battle);
      leaveArenaQueue(playerId);
      trackCharacterEvent(playerId, "hunt_started", character, {
        monsterId: monster.id,
        monsterLevel: monster.level,
        energyCost: monster.level,
        battleId: battle.id
      });
      emitState(playerId);
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("dungeon:start", (payload: DungeonStartPayload) => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      clearEndedBattle(character);
      ensureNotInBattle(character);
      ensureNotWorking(character);
      normalizeVitals(character);

      normalizeDungeonDailyKeys(character);
      const countryId = getCharacterCountryId(character);
      const floor = Math.max(1, Math.min(DUNGEON_TOTAL_FLOORS, Math.floor(payload.floor ?? 1)));
      const unlocked = floorUnlockByCountry(character, countryId);
      if (floor > unlocked) {
        throw new Error(`Andar bloqueado. Complete o andar ${unlocked} primeiro.`);
      }
      if (countItem(character, DUNGEON_KEY_ITEM_ID) < 1) {
        throw new Error("Você precisa de 1 Chave de Masmorra para entrar.");
      }
      if (character.currentHp <= 0) {
        throw new Error("Você precisa recuperar vida antes de entrar na masmorra.");
      }
      removeItemByItemId(character, DUNGEON_KEY_ITEM_ID, 1);
      createDungeonRun(character, countryId, floor);
      leaveArenaQueue(playerId);
      emitState(playerId);
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("dungeon:advance", () => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      clearEndedBattle(character);
      if (character.activeBattleId) {
        throw new Error("Conclua a batalha atual antes de seguir na masmorra.");
      }
      const run = character.dungeonProgress?.activeRun;
      if (!run) {
        throw new Error("Nenhuma masmorra ativa.");
      }
      if (run.roomIndex >= run.rooms.length) {
        completeDungeonRun(character, playerId);
        emitState(playerId);
        return;
      }
      applyDungeonRoomAction(character, playerId);
      const updatedRun = character.dungeonProgress?.activeRun;
      if (updatedRun && updatedRun.roomIndex >= updatedRun.rooms.length && !character.activeBattleId) {
        completeDungeonRun(character, playerId);
      } else if (updatedRun && !character.activeBattleId) {
        const pendingRoom = updatedRun.rooms[updatedRun.roomIndex];
        if (pendingRoom?.type === "horde") {
          startNextDungeonCombat(character);
        }
      }
      emitState(playerId);
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("monarch:start", () => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      clearEndedBattle(character);
      ensureNotInBattle(character);
      ensureNotWorking(character);
      normalizeVitals(character);

      const city = CITIES.find((entry) => entry.id === character.cityId) ?? CITIES[0];
      if (city.countryId !== MORTHALY_COUNTRY_ID) {
        throw new Error("O monarca so pode ser enfrentado em Morthaly.");
      }
      if (character.currentHp <= 0) {
        throw new Error("Recupere sua vida antes de enfrentar o monarca.");
      }

      const event = ensureMonarchEvent();
      if (event.status !== "active" || event.currentHp <= 0) {
        throw new Error("O monarca de hoje já foi encerrado.");
      }
      const attempts = event.attemptsByPlayer[playerId] ?? 0;
      if (attempts >= MONARCH_DAILY_ATTEMPT_LIMIT) {
        throw new Error("Limite diário de 10 confrontos contra o monarca atingido.");
      }
      if (countItem(character, MONARCH_ACCESS_KEY_ID) < 1) {
        throw new Error(`Você precisa de 1 ${ITEM_CATALOG[MONARCH_ACCESS_KEY_ID]?.name ?? "chave"}.`);
      }

      removeItemByItemId(character, MONARCH_ACCESS_KEY_ID, 1);
      event.attemptsByPlayer[playerId] = attempts + 1;
      character.monarchAttempts = { dayKey: event.dayKey, count: event.attemptsByPlayer[playerId] };
      character.questProgress.dailyMonarchBattles += 1;
      character.questProgress.monarchBattles += 1;
      event.participantNames[playerId] = character.name;
      event.damageByPlayer[playerId] ??= 0;
      const battle = createMonarchBattle(character, monarchAsMonster(event), event.currentHp);
      store.battles.set(battle.id, battle);
      leaveArenaQueue(playerId);
      broadcastWorldState();
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("arena:join", () => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      clearEndedBattle(character);
      ensureNotInBattle(character);
      ensureNotWorking(character);
      normalizeVitals(character);
      if (character.currentHp <= 0) {
        throw new Error("Você precisa recuperar vida antes de entrar na Arena.");
      }

      const opponentId = store.arenaQueue.find((queuedPlayerId) => queuedPlayerId !== playerId);
      if (!opponentId) {
        if (!store.arenaQueue.includes(playerId)) {
          store.arenaQueue.push(playerId);
        }
        broadcastWorldState();
        return;
      }

      const opponent = currentCharacter(opponentId);
      store.arenaQueue = store.arenaQueue.filter((queued) => queued !== playerId && queued !== opponentId);
      const battle = createPvpBattle(character, opponent);
      store.battles.set(battle.id, battle);
      emitMany([playerId, opponentId]);
      broadcastWorldState();
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("arena:leave", () => {
    try {
      const playerId = requirePlayer(socket);
      ensureNotInBattle(currentCharacter(playerId));
      leaveArenaQueue(playerId);
      broadcastWorldState();
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("arena:duel", (payload: ArenaDuelPayload) => {
    try {
      const playerId = requirePlayer(socket);
      const targetPlayerId = String(payload?.playerId ?? "");
      if (!targetPlayerId || targetPlayerId === playerId) {
        throw new Error("Escolha outro jogador para o duelo.");
      }
      if (!store.socketsByPlayer.has(targetPlayerId)) {
        throw new Error("O jogador precisa estar online para duelar.");
      }

      const character = currentCharacter(playerId);
      const target = currentCharacter(targetPlayerId);
      clearEndedBattle(character);
      clearEndedBattle(target);
      ensureNotInBattle(character);
      ensureNotInBattle(target);
      ensureNotWorking(character);
      ensureNotWorking(target);
      normalizeVitals(character);
      normalizeVitals(target);
      if (character.currentHp <= 0 || target.currentHp <= 0) {
        throw new Error("Ambos os jogadores precisam ter vida para duelar.");
      }

      leaveArenaQueue(playerId);
      leaveArenaQueue(targetPlayerId);
      const battle = createPvpBattle(character, target);
      store.battles.set(battle.id, battle);
      emitMany([playerId, targetPlayerId]);
      broadcastWorldState();
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("arena:ranked", (ack?: (response: { ok: boolean; message?: string }) => void) => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      clearEndedBattle(character);
      ensureNotInBattle(character);
      ensureNotWorking(character);
      normalizeVitals(character);
      if (character.currentHp <= 0) {
        throw new Error("Você precisa recuperar vida antes de entrar na Arena Ranqueada.");
      }

      const today = currentDayKey();
      if (character.lastDailyBlueCoinGrantKey !== today) {
        grantPackageStack(character, ARENA_BLUE_COIN_ID, ARENA_RANKED_DAILY_BLUE_COINS);
        character.lastDailyBlueCoinGrantKey = today;
      }

      if (countItem(character, ARENA_BLUE_COIN_ID) < ARENA_RANKED_BLUE_COIN_COST) {
        throw new Error(`Você precisa de ${ARENA_RANKED_BLUE_COIN_COST} Moeda(s) Azul para disputar um duelo ranqueado.`);
      }
      removeItemByItemId(character, ARENA_BLUE_COIN_ID, ARENA_RANKED_BLUE_COIN_COST);

      const opponent = findRankedArenaOpponent(character);
      if (!opponent) {
        grantPackageStack(character, ARENA_BLUE_COIN_ID, ARENA_RANKED_BLUE_COIN_COST);
        throw new Error("Ainda não há outro jogador disponível para a Arena Ranqueada.");
      }

      leaveArenaQueue(playerId);
      const battle = createRankedPvpBattle(character, opponent);
      store.battles.set(battle.id, battle);
      emitState(playerId);
      broadcastWorldState();
      ack?.({ ok: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro inesperado.";
      ack?.({ ok: false, message });
      handleError(socket, error);
    }
  });

  socket.on("arena:claimDailyCoins", () => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      normalizeVitals(character);
      const today = currentDayKey();
      if (character.lastDailyBlueCoinGrantKey === today) {
        throw new Error("Você já recebeu as moedas diárias hoje.");
      }
      grantPackageStack(character, ARENA_BLUE_COIN_ID, ARENA_RANKED_DAILY_BLUE_COINS);
      character.lastDailyBlueCoinGrantKey = today;
      emitState(playerId);
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("battle:action", (payload: BattleActionPayload) => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      const beforeLevel = character.level;
      const battle = store.battles.get(payload.battleId);
      if (!battle || character.activeBattleId !== battle.id) {
        throw new Error("Batalha não encontrada.");
      }

      const wasActive = battle.status === "active";
      const potionUsed = payload.instanceId ? findInventoryItem(character, payload.instanceId) : null;
      const potionDefinition = potionUsed ? ITEM_CATALOG[potionUsed.itemId] : null;
      if (battle.mode === "monarch") {
        if (payload.action === "auto") {
          throw new Error("Auto PvE não está disponível contra monarcas.");
        }
        const event = ensureMonarchEvent();
        if (event.status !== "active") {
          throw new Error("O monarca de hoje já foi encerrado.");
        }
        const beforeHp = event.currentHp;
        const result = takeMonarchBattleTurn(battle, character, event.currentHp, payload.action, payload.instanceId);
        const damage = Math.min(beforeHp, result.damageToMonarch);
        if (damage > 0) {
          event.currentHp = Math.max(0, event.currentHp - damage);
          event.participantNames[playerId] = character.name;
          event.damageByPlayer[playerId] = (event.damageByPlayer[playerId] ?? 0) + damage;
        }
        if (event.currentHp <= 0) {
          finalizeMonarchEvent(event, "defeated");
        } else {
          syncMonarchBattles(event, { sourceBattleId: battle.id, sourceName: character.name, damage });
        }
        if (payload.action === "usePotion") {
          recordPotionProgress(character, potionDefinition);
        }
        if (wasActive && battle.status === "ended") {
          applyDeathPenaltyForBattle(battle);
          const winner = battle.participants.find((participant) => participant.id === battle.winnerParticipantId);
          trackCharacterEvent(playerId, "battle_finished", character, {
            battleMode: battle.mode,
            won: winner?.ownerPlayerId === playerId,
            monsterId: getBattleMonsterId(battle),
            participantCount: battle.participants.length
          });
          trackLevelUps(playerId, beforeLevel, character, "battle");
        }
        syncBattleVitals(battle.id);
        broadcastWorldState();
        return;
      }
      if (payload.action === "auto") {
        takeAutoPveTurn(battle, character);
      } else {
        takeBattleTurn(battle, character, payload.action, payload.instanceId);
      }
      if (payload.action === "usePotion") {
        recordPotionProgress(character, potionDefinition);
      }
      applyBattleProgress(character, playerId, battle, wasActive);
      if (wasActive && battle.status === "ended") {
        trackLevelUps(playerId, beforeLevel, character, "battle");
      }
      if (battle.mode === "dungeon" && wasActive && battle.status === "ended") {
        resolveDungeonProgress(character, playerId, battle);
      }
      const playerIds = syncBattleVitals(battle.id);
      if (playerIds.length > 0) {
        emitMany(playerIds);
      } else {
        emitState(playerId);
      }
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("battle:flee", () => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      const battle = character.activeBattleId ? store.battles.get(character.activeBattleId) : null;
      if (!battle) {
        throw new Error("Batalha não encontrada.");
      }

      if (battle.mode === "dungeon" && character.dungeonProgress?.activeRun) {
        throw new Error("Você não pode fugir da masmorra antes de concluir o andar ou morrer.");
      }

      fleeBattle(battle, character);
      if (battle.mode === "pvp") {
        recordArenaResult(battle.id);
      }
      emitMany(syncBattleVitals(battle.id));
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("battle:leave", () => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      if (character.dungeonProgress?.activeRun) {
        throw new Error("Finalize o andar da masmorra ou morra para sair.");
      }
      clearEndedBattle(character);
      emitState(playerId);
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("market:create", (payload: MarketCreatePayload) => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      ensureNotInBattle(character);
      const player = currentPlayer(playerId);
      const inventoryItem = findInventoryItem(character, payload.instanceId);
      if (!inventoryItem) {
        throw new Error("Item não encontrado.");
      }
      if (isEquipped(character, inventoryItem.instanceId)) {
        throw new Error("Desequipe o item antes de oferecer no mercado.");
      }

      const price = Math.max(1, Math.floor(payload.price));
      const currency: "gold" | "diamonds" = payload.currency === "diamonds" ? "diamonds" : "gold";
      const itemDef = ITEM_CATALOG[inventoryItem.itemId];
      if (inventoryItem.itemId === DUNGEON_KEY_ITEM_ID) {
        throw new Error("Chave de Masmorra não pode ser comercializada no mercado.");
      }
      const maxQuantity = itemDef?.slot ? 1 : inventoryItem.quantity;
      const quantity = Math.max(1, Math.min(maxQuantity, Math.floor(payload.quantity ?? 1)));
      const listingItem: InventoryItem = {
        instanceId: randomUUID(),
        itemId: inventoryItem.itemId,
        quantity,
        enhancementLevel: itemDef?.slot ? inventoryItem.enhancementLevel : undefined,
        rarity: itemDef?.slot ? inventoryItem.rarity : undefined
      };
      removeItem(character, inventoryItem.instanceId, quantity);
      const listing = {
        id: randomUUID(),
        sellerPlayerId: playerId,
        sellerName: player.username,
        item: listingItem,
        price,
        currency,
        createdAt: Date.now()
      };
      store.marketplace.set(listing.id, listing);
      trackCharacterEvent(playerId, "market_listing_created", character, {
        itemId: listing.item.itemId,
        quantity,
        currency,
        price,
        itemRarity: listing.item.rarity ?? null,
        enhancementLevel: listing.item.enhancementLevel ?? 0
      });
      broadcastWorldState();
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("market:buy", (payload: MarketBuyPayload) => {
    try {
      const playerId = requirePlayer(socket);
      const buyer = currentCharacter(playerId);
      ensureNotInBattle(buyer);
      const listing = store.marketplace.get(payload.listingId);
      if (!listing) {
        throw new Error("Oferta não encontrada.");
      }
      if (listing.sellerPlayerId === playerId) {
        throw new Error("Você não pode comprar sua própria oferta.");
      }
      if (listing.currency === "gold" && buyer.gold < listing.price) {
        throw new Error("Ouro insuficiente.");
      }
      if (listing.currency === "diamonds" && buyer.diamonds < listing.price) {
        throw new Error("Diamantes insuficientes.");
      }
      const listedItem = ITEM_CATALOG[listing.item.itemId];
      const canReceiveListedItem =
        listedItem?.slot || !buyer.inventory.some((inventoryItem) => inventoryItem.itemId === listing.item.itemId)
          ? hasCapacity(buyer, 1)
          : true;
      if (!canReceiveListedItem) {
        throw new Error("Inventário cheio.");
      }

      const seller = currentCharacter(listing.sellerPlayerId);
      if (listing.currency === "gold") {
        buyer.gold -= listing.price;
        seller.gold += listing.price;
      } else {
        buyer.diamonds -= listing.price;
        seller.diamonds += listing.price;
      }
      grantInventoryEntry(buyer, listing.item);
      buyer.questProgress.marketItemsBought += listing.item.quantity;
      seller.questProgress.marketItemsSold += listing.item.quantity;
      pushMarketHistory(buyer, {
        kind: "buy",
        listingId: listing.id,
        item: listing.item,
        price: listing.price,
        currency: listing.currency,
        counterpartyPlayerId: listing.sellerPlayerId,
        counterpartyName: listing.sellerName
      });
      pushMarketHistory(seller, {
        kind: "sell",
        listingId: listing.id,
        item: listing.item,
        price: listing.price,
        currency: listing.currency,
        counterpartyPlayerId: playerId,
        counterpartyName: currentCharacter(playerId).name
      });
      store.marketplace.delete(listing.id);
      trackCharacterEvent(playerId, "market_item_bought", buyer, {
        itemId: listing.item.itemId,
        quantity: listing.item.quantity,
        currency: listing.currency,
        price: listing.price,
        itemRarity: listing.item.rarity ?? null,
        enhancementLevel: listing.item.enhancementLevel ?? 0
      });
      trackCharacterEvent(listing.sellerPlayerId, "market_item_sold", seller, {
        itemId: listing.item.itemId,
        quantity: listing.item.quantity,
        currency: listing.currency,
        price: listing.price,
        itemRarity: listing.item.rarity ?? null,
        enhancementLevel: listing.item.enhancementLevel ?? 0
      });
      emitMany([playerId, listing.sellerPlayerId]);
      broadcastWorldState();
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("market:cancel", (payload: MarketBuyPayload) => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      ensureNotInBattle(character);
      const listing = store.marketplace.get(payload.listingId);
      if (!listing) {
        throw new Error("Oferta não encontrada.");
      }
      if (listing.sellerPlayerId !== playerId) {
        throw new Error("Você só pode cancelar suas próprias ofertas.");
      }
      grantInventoryEntry(character, listing.item);
      store.marketplace.delete(listing.id);
      broadcastWorldState();
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("trade:create", (payload: ItemTradeCreatePayload) => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      ensureNotInBattle(character);
      const targetPlayerId = String(payload.targetPlayerId ?? "");
      if (!targetPlayerId || targetPlayerId === playerId) {
        throw new Error("Jogador alvo inválido.");
      }
      const targetPlayer = store.players.get(targetPlayerId);
      const targetCharacter = store.characters.get(targetPlayerId);
      if (!targetPlayer || !targetCharacter) {
        throw new Error("Jogador alvo não encontrado.");
      }
      const offer = createTradeBundle(character, payload.offeredItems, payload.offeredGold ?? 0);
      const now = Date.now();
      const trade: ItemTradeOffer = {
        id: randomUUID(),
        fromPlayerId: playerId,
        fromName: character.name,
        toPlayerId: targetPlayerId,
        toName: targetCharacter.name ?? targetPlayer.username,
        offer,
        counter: { items: [], gold: 0 },
        status: "pending_response",
        createdAt: now,
        expiresAt: now + TRADE_INTERACTION_TIMEOUT_MS
      };
      store.itemTrades.set(trade.id, trade);
      pushTradeNotification(
        targetPlayerId,
        "Oferta de troca recebida",
        `${character.name} enviou uma oferta com ${describeTradeBundle(offer)}.`,
        trade
      );
      emitMany([playerId, targetPlayerId]);
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("trade:counter", (payload: ItemTradeCounterPayload) => {
    try {
      const playerId = requirePlayer(socket);
      const receiver = currentCharacter(playerId);
      ensureNotInBattle(receiver);
      expireStaleItemTrades();
      const trade = store.itemTrades.get(String(payload.tradeId ?? ""));
      if (!trade || trade.status !== "pending_response") {
        throw new Error("Proposta de troca não encontrada.");
      }
      if (trade.toPlayerId !== playerId) {
        throw new Error("Apenas o destinatário pode responder esta troca.");
      }

      const counter = createTradeBundle(receiver, payload.counterItems ?? [], payload.counterGold ?? 0, false);
      const now = Date.now();
      trade.counter = counter;
      trade.status = "countered";
      trade.respondedAt = now;
      trade.expiresAt = now + TRADE_INTERACTION_TIMEOUT_MS;
      pushTradeNotification(
        trade.fromPlayerId,
        "Resposta de troca recebida",
        counter.items.length > 0 || counter.gold > 0
          ? `${trade.toName} respondeu com uma contra-proposta de ${describeTradeBundle(counter)}.`
          : `${trade.toName} aceitou sua oferta sem inserir itens ou ouro.`,
        trade
      );
      emitMany([trade.fromPlayerId, trade.toPlayerId]);
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("trade:accept", (payload: ItemTradeActionPayload) => {
    try {
      const playerId = requirePlayer(socket);
      const sender = currentCharacter(playerId);
      ensureNotInBattle(sender);
      expireStaleItemTrades();
      const trade = store.itemTrades.get(String(payload.tradeId ?? ""));
      if (!trade || trade.status !== "countered") {
        throw new Error("Proposta de troca não encontrada.");
      }
      if (trade.fromPlayerId !== playerId) {
        throw new Error("Apenas quem criou a proposta pode aceitar a resposta.");
      }
      const receiver = currentCharacter(trade.toPlayerId);
      ensureNotInBattle(receiver);
      if (!canReceiveTradeBundle(sender, trade.counter)) {
        throw new Error("O inventário do jogador que enviou a proposta está cheio.");
      }
      if (!canReceiveTradeBundle(receiver, trade.offer)) {
        throw new Error("O inventário do destinatário está cheio para receber a oferta.");
      }

      grantTradeBundle(sender, trade.counter);
      grantTradeBundle(receiver, trade.offer);
      trade.status = "accepted";
      trade.resolvedAt = Date.now();
      pushTradeNotification(
        trade.toPlayerId,
        "Troca aprovada",
        `${trade.fromName} aceitou a resposta da troca. Os itens e ouro foram entregues.`,
        trade
      );
      emitMany([trade.fromPlayerId, trade.toPlayerId]);
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("trade:decline", (payload: ItemTradeActionPayload) => {
    try {
      const playerId = requirePlayer(socket);
      expireStaleItemTrades();
      const trade = store.itemTrades.get(String(payload.tradeId ?? ""));
      if (!trade || trade.status !== "pending_response") {
        throw new Error("Proposta de troca não encontrada.");
      }
      if (trade.toPlayerId !== playerId) {
        throw new Error("Apenas o destinatário pode recusar esta troca.");
      }
      const sender = currentCharacter(trade.fromPlayerId);
      grantTradeBundle(sender, trade.offer);
      trade.status = "declined";
      trade.resolvedAt = Date.now();
      pushTradeNotification(
        trade.fromPlayerId,
        "Troca recusada",
        `${trade.toName} recusou sua oferta de troca.`,
        trade
      );
      emitMany([trade.fromPlayerId, trade.toPlayerId]);
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("trade:cancel", (payload: ItemTradeActionPayload) => {
    try {
      const playerId = requirePlayer(socket);
      expireStaleItemTrades();
      const trade = store.itemTrades.get(String(payload.tradeId ?? ""));
      if (!trade || (trade.status !== "pending_response" && trade.status !== "countered")) {
        throw new Error("Proposta de troca não encontrada.");
      }
      if (trade.fromPlayerId !== playerId) {
        throw new Error("Apenas quem criou a proposta pode cancelar.");
      }
      const sender = currentCharacter(playerId);
      grantTradeBundle(sender, trade.offer);
      if (trade.status === "countered") {
        grantTradeBundle(currentCharacter(trade.toPlayerId), trade.counter);
      }
      trade.status = "cancelled";
      trade.resolvedAt = Date.now();
      pushTradeNotification(
        trade.toPlayerId,
        "Troca cancelada",
        trade.respondedAt
          ? `${trade.fromName} não aceitou a contra-proposta. Seus itens e ouro foram devolvidos.`
          : `${trade.fromName} cancelou a oferta de troca.`,
        trade
      );
      emitMany([trade.fromPlayerId, trade.toPlayerId]);
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("chat:send", (text: string) => {
    try {
      const playerId = requirePlayer(socket);
      ensureNotInBattle(currentCharacter(playerId));
      const player = currentPlayer(playerId);
      const normalized = String(text).trim().replace(/\s+/g, " ").slice(0, 240);
      if (!normalized) {
        return;
      }

      store.chatMessages = [
        {
          id: randomUUID(),
          playerId,
          author: player.username,
          text: normalized,
          createdAt: Date.now()
        },
        ...store.chatMessages
      ].slice(0, 50);

      broadcastWorldState();
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("clan:chat:send", (payload: ClanChatSendPayload) => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      if (!character.clanId) throw new Error("Você não pertence a um clã.");
      const player = currentPlayer(playerId);
      const normalized = String(payload.text ?? "").trim().replace(/\s+/g, " ").slice(0, 240);
      if (!normalized) return;

      const msgs = store.clanChatMessages.get(character.clanId) ?? [];
      msgs.unshift({
        id: randomUUID(),
        playerId,
        author: player.username,
        text: normalized,
        createdAt: Date.now()
      });
      store.clanChatMessages.set(character.clanId, msgs.slice(0, 50));

      // Emit to all online clan members
      const clan = store.clans.get(character.clanId);
      if (clan) emitMany(clan.memberPlayerIds);
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("private:send", (payload: PrivateSendPayload) => {
    try {
      const playerId = requirePlayer(socket);
      const player = currentPlayer(playerId);
      const normalized = String(payload.text ?? "").trim().replace(/\s+/g, " ").slice(0, 240);
      if (!normalized) return;

      const targetPlayerId = String(payload.targetPlayerId ?? "");
      const targetName = String(payload.targetPlayerName ?? "").trim();
      const targetPlayer = targetPlayerId
        ? store.players.get(targetPlayerId)
        : Array.from(store.players.values()).find(
            (p) => p.username.toLowerCase() === targetName.toLowerCase()
          );
      if (!targetPlayer) throw new Error("Recruta não encontrado.");
      if (targetPlayer.id === playerId) throw new Error("Você não pode enviar mensagem para si mesmo.");

      const targetCharacter = store.characters.get(targetPlayer.id);
      const toName = targetCharacter?.name ?? targetPlayer.username;

      const msg = {
        id: randomUUID(),
        fromPlayerId: playerId,
        fromName: player.username,
        toPlayerId: targetPlayer.id,
        toName,
        text: normalized,
        createdAt: Date.now()
      };
      store.allPrivateMessages = [msg, ...store.allPrivateMessages].slice(0, 500);

      emitMany([playerId, targetPlayer.id]);
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("private:read", (payload: PrivateReadPayload) => {
    try {
      const playerId = requirePlayer(socket);
      const targetPlayerId = String(payload?.targetPlayerId ?? "");
      if (!targetPlayerId) return;

      const readAt = Date.now();
      let changed = false;
      for (const message of store.allPrivateMessages) {
        if (message.fromPlayerId === targetPlayerId && message.toPlayerId === playerId && !message.readAt) {
          message.readAt = readAt;
          changed = true;
        }
      }

      if (changed) {
        emitMany([playerId]);
      }
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("player:inspect", (payload: PlayerInspectPayload) => {
    try {
      requirePlayer(socket);
      const targetPlayerId = String(payload?.playerId ?? "");
      const profile = buildPlayerPublicProfile(targetPlayerId);
      if (!profile) {
        throw new Error("Recruta não encontrado.");
      }
      socket.emit("player:profile", profile);
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("referral:claim", (payload: ReferralClaimPayload) => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      ensureNotInBattle(character);
      const invitedPlayerId = String(payload.playerId ?? "");
      const invitedPlayer = store.players.get(invitedPlayerId);
      const invitedCharacter = store.characters.get(invitedPlayerId);
      if (!invitedPlayer || invitedPlayer.referredByPlayerId !== playerId || !invitedCharacter) {
        throw new Error("Convite não encontrado.");
      }
      if (invitedCharacter.level < REFERRAL_REWARD_LEVEL) {
        throw new Error(`O amigo precisa chegar ao nível ${REFERRAL_REWARD_LEVEL}.`);
      }
      character.referralRewardsClaimedFor ??= [];
      if (character.referralRewardsClaimedFor.includes(invitedPlayerId)) {
        throw new Error("Recompensa já resgatada.");
      }
      character.gold += REFERRAL_REWARD_GOLD;
      character.diamonds += REFERRAL_REWARD_DIAMONDS;
      character.referralRewardsClaimedFor.push(invitedPlayerId);
      emitState(playerId);
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("developer:message", (payload: DeveloperMessagePayload) => {
    try {
      const playerId = requirePlayer(socket);
      const player = currentPlayer(playerId);
      const subject = String(payload.subject ?? "").trim().replace(/\s+/g, " ").slice(0, 80);
      const message = String(payload.message ?? "").trim().replace(/\s+/g, " ").slice(0, 1000);
      if (!message) {
        throw new Error("Escreva uma mensagem para enviar ao desenvolvedor.");
      }

      const kalibahn = Array.from(store.players.values()).find(
        (entry) => entry.username.toLowerCase() === "kalibahn"
      );
      if (kalibahn && kalibahn.id !== playerId) {
        const targetCharacter = store.characters.get(kalibahn.id);
        const privateText = subject ? `[Dev] ${subject}: ${message}` : `[Dev] ${message}`;
        const privateMessage = {
          id: randomUUID(),
          fromPlayerId: playerId,
          fromName: player.username,
          toPlayerId: kalibahn.id,
          toName: targetCharacter?.name ?? kalibahn.username,
          text: privateText,
          createdAt: Date.now()
        };
        store.allPrivateMessages = [privateMessage, ...store.allPrivateMessages].slice(0, 500);
        emitMany([playerId, kalibahn.id]);
      }

      console.log(`[developer-message] ${player.username} <${player.email}> ${subject || "Sem assunto"}: ${message}`);
      socket.emit("developer:message:ok");
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("currency:exchange", (payload: CurrencyExchangePayload) => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      ensureNotInBattle(character);
      const amount = Math.max(1, Math.floor(payload.amount ?? 1));

      if (payload.direction === "diamondsToGold") {
        if (character.diamonds < amount) throw new Error("Diamantes insuficientes.");
        character.diamonds -= amount;
        character.gold += amount * 1000;
      } else {
        const goldCost = amount * 1200;
        if (character.gold < goldCost) throw new Error("Ouro insuficiente. Custo: " + goldCost + " ouro.");
        character.gold -= goldCost;
        character.diamonds += amount;
      }
      normalizeVitals(character);
      emitState(playerId);
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("quest:claim", (payload: QuestClaimPayload) => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      ensureNotInBattle(character);
      const beforeLevel = character.level;
      const quest = claimQuest(character, payload.questId);
      trackCharacterEvent(playerId, "quest_claimed", character, {
        questId: quest.id,
        questType: quest.type,
        questCategory: quest.category,
        xpGained: quest.reward.experience ?? 0,
        goldGained: quest.reward.gold ?? 0,
        diamondsGained: quest.reward.diamonds ?? 0
      });
      trackLevelUps(playerId, beforeLevel, character, "quest");
      emitState(playerId);
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("disconnect", () => {
    if (detachSocketSession(socket)) {
      broadcastWorldState();
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Litch realtime server running on port ${PORT}`);
});

let shuttingDown = false;
let beforeExitFlushed = false;

async function flushAndExit(code = 0) {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  try {
    await flushPersistentStore();
    await closePersistentStore();
    await shutdownAnalytics();
  } catch (error) {
    console.error("Failed to flush persistent store:", error);
  } finally {
    process.exit(code);
  }
}

process.on("SIGINT", () => void flushAndExit(0));
process.on("SIGTERM", () => void flushAndExit(0));
process.on("beforeExit", () => {
  if (beforeExitFlushed) {
    return;
  }
  beforeExitFlushed = true;
  void flushPersistentStore()
    .then(() => closePersistentStore())
    .then(() => shutdownAnalytics())
    .catch((error) => console.error("Failed to flush persistent store:", error));
});

// Regen tick: every 2 real minutes restore 10% HP and Energy
const REGEN_INTERVAL_MS = 2 * 60 * 1000;
if (!store.nextRegenAt || store.nextRegenAt <= Date.now()) {
  store.nextRegenAt = Date.now() + REGEN_INTERVAL_MS;
}

setInterval(() => {
  store.nextRegenAt = Date.now() + REGEN_INTERVAL_MS;
  for (const [playerId, character] of store.characters) {
    const activeBattle = character.activeBattleId ? store.battles.get(character.activeBattleId) : null;
    if (activeBattle?.status === "active") continue;
    const stats = deriveStats(character, ITEM_CATALOG);
    const hpRegen = Math.ceil(stats.maxHp * (0.10 + stats.hpRegenBonusPercent));
    const energyRegen = Math.ceil(stats.maxEnergy * (0.10 + stats.energyRegenBonusPercent));
    character.currentHp = Math.min(stats.maxHp, (character.currentHp ?? 0) + hpRegen);
    character.currentEnergy = Math.min(stats.maxEnergy, (character.currentEnergy ?? 0) + energyRegen);
    character.lastRegenAt = Date.now();
  }
  broadcastWorldState();
}, REGEN_INTERVAL_MS);
