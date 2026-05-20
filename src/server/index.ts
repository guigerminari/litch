import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { Server } from "socket.io";
import type {
  AllocatePayload,
  BattleActionPayload,
  Character,
  ClanBenefitBuyPayload,
  ClanChatSendPayload,
  ClanCreatePayload,
  ClanDonatePayload,
  ClanJoinPayload,
  CraftPayload,
  CurrencyExchangePayload,
  DungeonStartPayload,
  EquipPayload,
  GameState,
  GameShopPurchasePayload,
  HuntStartPayload,
  MarketBuyPayload,
  MarketCreatePayload,
  Player,
  PrivateSendPayload,
  QuestClaimPayload,
  QuestView,
  RegisterPayload,
  ResetPayload,
  SellPayload,
  ShopBuyPayload,
  TalentBuyPayload,
  TravelPayload,
  UseItemPayload
} from "../shared/types";
import {
  CITIES,
  CLAN_BENEFITS,
  CRAFTING_RECIPES,
  DIAMOND_PACKAGES,
  INVENTORY_CAPACITY,
  ITEM_CATALOG,
  MONSTERS,
  STARTING_CITY_ID,
  TALENTS
} from "./content";
import {
  createDungeonBattle,
  createPveBattle,
  createPvpBattle,
  fleeBattle,
  syncCharacterVitalsFromBattle,
  takeBattleTurn
} from "./domain/battle";
import { addItem, findInventoryItem, hasCapacity, inventoryUsed, isEquipped, removeItem } from "./domain/inventory";
import { deriveStats, grantExperience } from "./domain/stats";
import { store } from "./store";

const PORT = Number(process.env.PORT ?? 3001);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://127.0.0.1:5173";
const POTION_MISSION_TARGETS = [5, 50, 100, 200];
const DAILY_MISSIONS = [
  { id: "daily-defeat-3", title: "Patrulha diária", target: 3, reward: { experience: 90, gold: 45 } },
  { id: "daily-defeat-8", title: "Limpeza das rotas", target: 8, reward: { experience: 220, gold: 110 } },
  { id: "daily-defeat-15", title: "Caçada longa", target: 15, reward: { experience: 480, gold: 240 } }
];

const httpServer = createServer((request, response) => {
  if (request.url === "/health") {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ ok: true }));
    return;
  }

  response.writeHead(404, { "content-type": "application/json" });
  response.end(JSON.stringify({ error: "not_found" }));
});

const io = new Server(httpServer, {
  cors: {
    origin: [CLIENT_ORIGIN, "http://localhost:5173"],
    credentials: true
  }
});

type AuthedSocket = Parameters<Parameters<typeof io.on>[1]>[0] & {
  data: { playerId?: string };
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
    dungeonClears: 0
  };

  addItem(character, "training_sword", ITEM_CATALOG, 1);
  addItem(character, "health_potion", ITEM_CATALOG, 3);
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
  character.dungeonClears ??= 0;
  ensureQuestProgress(character);
  return character;
}

function currentPlayer(playerId: string) {
  const player = store.players.get(playerId);
  if (!player) {
    throw new Error("Jogador não encontrado.");
  }
  return player;
}

function serializeGameState(playerId: string): GameState {
  const player = currentPlayer(playerId);
  const character = currentCharacter(playerId);
  ensureQuestProgress(character);
  normalizeVitals(character);
  const currentCity = CITIES.find((city) => city.id === character.cityId) ?? CITIES[0];
  const activeBattle = character.activeBattleId ? store.battles.get(character.activeBattleId) ?? null : null;
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
      return ch ? { playerId: pid, name: ch.name } : null;
    })
    .filter((entry): entry is { playerId: string; name: string } => entry !== null);

  return {
    player,
    character,
    derived,
    inventoryUsed: inventoryUsed(character),
    inventoryCapacity: INVENTORY_CAPACITY,
    cities: CITIES,
    currentCity,
    cityMonsters: Array.from(new Set([...(currentCity.huntMonsterIds ?? []), ...(currentCity.dungeonMonsterIds ?? [])]))
      .map((id) => MONSTERS[id])
      .filter(Boolean),
    itemCatalog: ITEM_CATALOG,
    activeBattle,
    chatMessages: store.chatMessages,
    marketplaceListings: Array.from(store.marketplace.values()).sort((a, b) => b.createdAt - a.createdAt),
    quests: buildQuests(character),
    talents: TALENTS,
    clanBenefits: CLAN_BENEFITS,
    clan,
    clanDirectory: buildClanDirectory(),
    diamondPackages: DIAMOND_PACKAGES,
    availableCraftingRecipes: availableRecipes,
    rankings: buildRankings(),
    onlineCount: store.socketsByPlayer.size,
    arenaQueueSize: store.arenaQueue.length,
    nextRegenAt: store.nextRegenAt,
    regenHpAmount,
    regenEnergyAmount,
    clanChatMessages,
    privateMessages,
    onlinePlayers
  };
}

function emitState(playerId: string) {
  const socketIds = store.socketsByPlayer.get(playerId);
  if (!socketIds) {
    return;
  }

  const state = serializeGameState(playerId);
  for (const socketId of socketIds) {
    io.to(socketId).emit("game:state", state);
  }
}

function emitMany(playerIds: Iterable<string>) {
  for (const playerId of playerIds) {
    emitState(playerId);
  }
}

function broadcastWorldState() {
  emitMany(store.players.keys());
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
  socket.emit("game:error", { message });
}

function sanitizeName(value: string) {
  return value.trim().replace(/\s+/g, " ").slice(0, 24);
}

function currentDayKey() {
  return new Date().toISOString().slice(0, 10);
}

function createQuestProgress() {
  return {
    dayKey: currentDayKey(),
    dailyEnemyDefeats: 0,
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

  const today = currentDayKey();
  if (character.questProgress.dayKey !== today) {
    character.questProgress.dayKey = today;
    character.questProgress.dailyEnemyDefeats = 0;
    character.questProgress.claimedDailyQuestIds = [];
  }
}

function buildQuests(character: Character) {
  ensureQuestProgress(character);
  const progress = character.questProgress;

  const daily: QuestView[] = DAILY_MISSIONS.map((mission) => ({
    id: mission.id,
    type: "daily",
    title: mission.title,
    description: `Derrote ${mission.target} inimigos hoje.`,
    progress: Math.min(progress.dailyEnemyDefeats, mission.target),
    target: mission.target,
    reward: mission.reward,
    completed: progress.dailyEnemyDefeats >= mission.target,
    claimed: progress.claimedDailyQuestIds.includes(mission.id)
  }));

  const levelTargets = buildLevelTargets(character.level);
  const fixed: QuestView[] = [
    ...levelTargets.map((target) => ({
      id: `level-${target}`,
      type: "fixed" as const,
      title: `Alcance nível ${target}`,
      description: `Evolua seu personagem até o nível ${target}.`,
      progress: Math.min(character.level, target),
      target,
      reward: { diamonds: levelDiamondReward(target) },
      completed: character.level >= target,
      claimed: progress.claimedFixedQuestIds.includes(`level-${target}`)
    })),
    fixedCounterQuest("market-sell-1", "Venda um item no mercado", progress.marketItemsSold, 1, 6, progress),
    fixedCounterQuest("market-buy-1", "Compre um item no mercado", progress.marketItemsBought, 1, 6, progress),
    fixedCounterQuest("shop-buy-1", "Compre um item na loja", progress.shopItemsBought, 1, 4, progress),
    fixedCounterQuest("shop-sell-1", "Venda um item na loja", progress.shopItemsSold, 1, 4, progress),
    ...POTION_MISSION_TARGETS.map((target) =>
      fixedCounterQuest(
        `health-potion-${target}`,
        `Use ${target} poções de cura`,
        progress.healthPotionsUsed,
        target,
        potionDiamondReward(target),
        progress
      )
    ),
    ...POTION_MISSION_TARGETS.map((target) =>
      fixedCounterQuest(
        `energy-potion-${target}`,
        `Use ${target} poções de energia`,
        progress.energyPotionsUsed,
        target,
        potionDiamondReward(target),
        progress
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

function fixedCounterQuest(
  id: string,
  title: string,
  progressValue: number,
  target: number,
  diamonds: number,
  progress: Character["questProgress"]
): QuestView {
  return {
    id,
    type: "fixed",
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

function normalizeVitals(character: Character) {
  character.diamonds ??= 0;
  character.talentAllocations ??= {};
  character.clanId ??= null;
  syncClanBenefits(character);
  character.arenaWins ??= 0;
  character.arenaLosses ??= 0;
  character.dungeonClears ??= 0;
  ensureQuestProgress(character);
  const stats = deriveStats(character, ITEM_CATALOG);
  character.currentHp = Math.min(Math.max(0, character.currentHp ?? stats.maxHp), stats.maxHp);
  character.currentEnergy = Math.min(Math.max(0, character.currentEnergy ?? stats.maxEnergy), stats.maxEnergy);
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
    playerId: character.playerId,
    name: character.name,
    level: character.level,
    arenaWins: character.arenaWins ?? 0,
    arenaLosses: character.arenaLosses ?? 0
  }));

  return {
    level: [...entries].sort((a, b) => b.level - a.level || b.arenaWins - a.arenaWins).slice(0, 20),
    arena: [...entries].sort((a, b) => b.arenaWins - a.arenaWins || a.arenaLosses - b.arenaLosses).slice(0, 20)
  };
}

function buildClanDirectory() {
  return Array.from(store.clans.values())
    .map((clan) => ({
      id: clan.id,
      name: clan.name,
      leaderName: currentPlayer(clan.leaderPlayerId).username,
      memberCount: clan.memberPlayerIds.length,
      gold: clan.gold,
      diamonds: clan.diamonds
    }))
    .sort((a, b) => b.memberCount - a.memberCount || b.gold + b.diamonds * 100 - (a.gold + a.diamonds * 100));
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

function createClan(character: Character, name: string) {
  if (character.clanId) {
    throw new Error("Você já participa de um clã.");
  }
  const normalized = name.trim().replace(/\s+/g, " ").slice(0, 28);
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
    leaderPlayerId: character.playerId,
    memberPlayerIds: [character.playerId],
    gold: 0,
    diamonds: 0,
    benefitAllocations: {},
    createdAt: Date.now()
  };
  store.clans.set(clan.id, clan);
  character.clanId = clan.id;
  syncClanBenefits(character);
}

function joinClan(character: Character, clanId: string) {
  if (character.clanId) {
    throw new Error("Você já participa de um clã.");
  }
  const clan = store.clans.get(clanId);
  if (!clan) {
    throw new Error("Clã não encontrado.");
  }
  clan.memberPlayerIds.push(character.playerId);
  character.clanId = clan.id;
  syncClanBenefits(character);
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
  syncClanMembers(clan.id);
}

function buyDiamondPackage(character: Character, packageId: string) {
  const pack = DIAMOND_PACKAGES.find((entry) => entry.id === packageId);
  if (!pack) {
    throw new Error("Pacote não encontrado.");
  }
  character.diamonds += pack.diamonds;
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
  if (winner?.ownerPlayerId) {
    currentCharacter(winner.ownerPlayerId).arenaWins += 1;
  }
  if (loser?.ownerPlayerId) {
    currentCharacter(loser.ownerPlayerId).arenaLosses += 1;
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

function craftItem(character: Character, recipeId: string) {
  const recipe = CRAFTING_RECIPES[recipeId];
  if (!recipe) {
    throw new Error("Receita não encontrada.");
  }
  if (!recipe.cityIds.includes(character.cityId)) {
    throw new Error("Esta receita não está disponível nesta cidade.");
  }
  if (character.gold < recipe.goldCost) {
    throw new Error("Ouro insuficiente para criar o item.");
  }
  for (const ingredient of recipe.ingredients) {
    if (countItem(character, ingredient.itemId) < ingredient.quantity) {
      throw new Error(`Falta ${ITEM_CATALOG[ingredient.itemId]?.name ?? ingredient.itemId}.`);
    }
  }

  character.gold -= recipe.goldCost;
  for (const ingredient of recipe.ingredients) {
    removeItemByItemId(character, ingredient.itemId, ingredient.quantity);
  }
  addItem(character, recipe.resultItemId, ITEM_CATALOG, recipe.resultQuantity);
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

function activePlayerIdsForBattle(battleId: string) {
  const battle = store.battles.get(battleId);
  return battle?.participants
    .map((participant) => participant.ownerPlayerId)
    .filter((playerId): playerId is string => Boolean(playerId)) ?? [];
}

io.on("connection", (socket: AuthedSocket) => {
  socket.on("auth:resume", (sessionToken: string) => {
    try {
      const playerId = store.sessions.get(sessionToken);
      if (!playerId) {
        throw new Error("Sessão expirada.");
      }
      socket.data.playerId = playerId;
      socket.join(`player:${playerId}`);
      const sockets = store.socketsByPlayer.get(playerId) ?? new Set<string>();
      sockets.add(socket.id);
      store.socketsByPlayer.set(playerId, sockets);
      socket.emit("auth:ok", { sessionToken, playerId });
      broadcastWorldState();
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("auth:register", (payload: RegisterPayload) => {
    try {
      const username = sanitizeName(payload.username);
      if (username.length < 3) {
        throw new Error("Use um nome com pelo menos 3 caracteres.");
      }

      const player: Player = { id: randomUUID(), username, createdAt: Date.now() };
      const character = createCharacter(player);
      const sessionToken = randomUUID();

      store.players.set(player.id, player);
      store.characters.set(player.id, character);
      store.sessions.set(sessionToken, player.id);
      socket.data.playerId = player.id;
      socket.join(`player:${player.id}`);
      store.socketsByPlayer.set(player.id, new Set([socket.id]));

      socket.emit("auth:ok", { sessionToken, playerId: player.id });
      broadcastWorldState();
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
      if (character.level < city.minLevel) {
        throw new Error(`Nível ${city.minLevel} necessário para viajar até ${city.name}.`);
      }
      if (character.gold < city.travelCost) {
        throw new Error("Ouro insuficiente para a viagem.");
      }

      character.gold -= city.travelCost;
      character.cityId = city.id;
      leaveArenaQueue(playerId);
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

      const available = [...city.armorerItemIds, ...city.apothecaryItemIds].includes(item.id);
      if (!available) {
        throw new Error("Este comerciante não vende o item aqui.");
      }
      const quantity = item.slot ? 1 : Math.max(1, Math.min(999, Math.floor(payload.quantity ?? 1)));
      const totalPrice = item.price * quantity;
      if (character.gold < totalPrice) {
        throw new Error("Ouro insuficiente.");
      }
      addItem(character, item.id, ITEM_CATALOG, quantity);
      character.gold -= totalPrice;
      character.questProgress.shopItemsBought += 1;
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
      const quantity = Math.max(1, Math.floor(payload.quantity ?? 1));
      if (quantity > item.quantity) {
        throw new Error("Quantidade indisponível.");
      }

      removeItem(character, item.instanceId, quantity);
      character.gold += Math.max(1, Math.floor((definition.price * quantity) / 2));
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
      } else {
        throw new Error("Esta poção não tem efeito definido.");
      }
      removeItem(character, item.instanceId, 1);
      if (definition.stats.healPercent) {
        character.questProgress.healthPotionsUsed += 1;
      }
      if (definition.stats.energyPercent) {
        character.questProgress.energyPotionsUsed += 1;
      }
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
      craftItem(character, payload.recipeId);
      emitState(playerId);
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
      buyDiamondPackage(character, payload.packageId);
      emitState(playerId);
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("clan:create", (payload: ClanCreatePayload) => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      ensureNotInBattle(character);
      createClan(character, payload.name);
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

  socket.on("hunt:start", (payload: HuntStartPayload) => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      clearEndedBattle(character);
      ensureNotInBattle(character);
      normalizeVitals(character);

      const city = CITIES.find((entry) => entry.id === character.cityId) ?? CITIES[0];
      if (!city.huntMonsterIds.includes(payload.monsterId)) {
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
      normalizeVitals(character);

      const city = CITIES.find((entry) => entry.id === character.cityId) ?? CITIES[0];
      if (!city.dungeonMonsterIds?.includes(payload.monsterId)) {
        throw new Error("Esta masmorra não está disponível nesta cidade.");
      }

      const monster = MONSTERS[payload.monsterId];
      const energyCost = monster.level + 1;
      if (character.currentHp <= 0) {
        throw new Error("Você precisa recuperar vida antes de entrar na masmorra.");
      }
      if (character.currentEnergy < energyCost) {
        throw new Error(`Energia insuficiente. Esta masmorra exige ${energyCost} energia.`);
      }
      character.currentEnergy -= energyCost;
      const battle = createDungeonBattle(character, monster);
      store.battles.set(battle.id, battle);
      leaveArenaQueue(playerId);
      emitState(playerId);
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

  socket.on("battle:action", (payload: BattleActionPayload) => {
    try {
      const playerId = requirePlayer(socket);
      const character = currentCharacter(playerId);
      const battle = store.battles.get(payload.battleId);
      if (!battle || character.activeBattleId !== battle.id) {
        throw new Error("Batalha não encontrada.");
      }

      const wasActive = battle.status === "active";
      const potionUsed = payload.instanceId ? findInventoryItem(character, payload.instanceId) : null;
      const potionDefinition = potionUsed ? ITEM_CATALOG[potionUsed.itemId] : null;
      takeBattleTurn(battle, character, payload.action, payload.instanceId);
      if (payload.action === "usePotion" && potionDefinition?.stats.healPercent) {
        character.questProgress.healthPotionsUsed += 1;
      }
      if ((battle.mode === "pve" || battle.mode === "dungeon") && wasActive && battle.status === "ended") {
        const winner = battle.participants.find((participant) => participant.id === battle.winnerParticipantId);
        if (winner?.ownerPlayerId === playerId) {
          character.questProgress.dailyEnemyDefeats += 1;
          if (battle.mode === "dungeon") {
            character.dungeonClears += 1;
          }
        }
      }
      if (battle.mode === "pvp" && wasActive && battle.status === "ended") {
        recordArenaResult(battle.id);
      }
      emitMany(syncBattleVitals(battle.id));
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
      const maxQuantity = itemDef?.slot ? 1 : inventoryItem.quantity;
      const quantity = Math.max(1, Math.min(maxQuantity, Math.floor(payload.quantity ?? 1)));
      const listingItem = { instanceId: randomUUID(), itemId: inventoryItem.itemId, quantity };
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
      if (!hasCapacity(buyer, 1)) {
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
      addItem(buyer, listing.item.itemId, ITEM_CATALOG, listing.item.quantity);
      buyer.questProgress.marketItemsBought += listing.item.quantity;
      seller.questProgress.marketItemsSold += listing.item.quantity;
      store.marketplace.delete(listing.id);
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
      addItem(character, listing.item.itemId, ITEM_CATALOG, listing.item.quantity);
      store.marketplace.delete(listing.id);
      broadcastWorldState();
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

      const targetName = String(payload.targetPlayerName ?? "").trim();
      const targetPlayer = Array.from(store.players.values()).find(
        (p) => p.username.toLowerCase() === targetName.toLowerCase()
      );
      if (!targetPlayer) throw new Error("Jogador não encontrado.");
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
      claimQuest(character, payload.questId);
      emitState(playerId);
    } catch (error) {
      handleError(socket, error);
    }
  });

  socket.on("disconnect", () => {
    const playerId = socket.data.playerId;
    if (!playerId) {
      return;
    }

    const sockets = store.socketsByPlayer.get(playerId);
    sockets?.delete(socket.id);
    if (!sockets || sockets.size === 0) {
      store.socketsByPlayer.delete(playerId);
    }
    broadcastWorldState();
  });
});

httpServer.listen(PORT, () => {
  console.log(`Litch realtime server running on http://127.0.0.1:${PORT}`);
});

// Regen tick: every 2 real minutes restore 10% HP and Energy
const REGEN_INTERVAL_MS = 2 * 60 * 1000;
store.nextRegenAt = Date.now() + REGEN_INTERVAL_MS;

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
