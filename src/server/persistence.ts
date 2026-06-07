import "./env";
import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createPool, type Pool, type PoolConnection, type RowDataPacket } from "mysql2/promise";
import type {
  ArenaSeasonData,
  BattleState,
  Character,
  ChatMessage,
  Clan,
  InventoryItem,
  ItemTradeOffer,
  MarketListing,
  MonarchEventState,
  Player,
  PlayerNotification,
  PrivateMessage
} from "../shared/types";
import { store, type AuthAccount, type GameStore } from "./store";

interface PersistedGameStore {
  version: number;
  savedAt: number;
  players: Player[];
  accountsByEmail: AuthAccount[];
  characters: Character[];
  sessions: Array<[string, string]>;
  battles: BattleState[];
  clans: Clan[];
  marketplace: MarketListing[];
  itemTrades?: ItemTradeOffer[];
  chatMessages: ChatMessage[];
  clanChatMessages: Array<[string, ChatMessage[]]>;
  allPrivateMessages: PrivateMessage[];
  arenaQueue: string[];
  arenaRecordedBattleIds: string[];
  nextRegenAt: number;
  monarchEvent: MonarchEventState | null;
  arenaSeasonKey?: string;
  lastArenaSeason?: ArenaSeasonData | null;
  notifications?: PlayerNotification[];
}

type JsonValue = string | number | boolean | null | Record<string, unknown> | unknown[];
const TRADE_INTERACTION_TIMEOUT_MS = 24 * 60 * 60 * 1000;

const DEFAULT_DATA_FILE = join(process.cwd(), "data", "game-state.json");
const DATA_FILE = process.env.LITCH_DATA_FILE ?? DEFAULT_DATA_FILE;
const MYSQL_URL = process.env.MYSQL_DATABASE_URL ?? (process.env.DATABASE_URL?.startsWith("mysql") ? process.env.DATABASE_URL : undefined);
const MYSQL_DATABASE = process.env.MYSQL_DATABASE;
const MYSQL_DRIVER_DEFAULT = MYSQL_URL || MYSQL_DATABASE ? "mysql" : "json";
const PERSISTENCE_DRIVER = (process.env.LITCH_PERSISTENCE ?? MYSQL_DRIVER_DEFAULT).toLowerCase();
const MYSQL_TABLE_PREFIX = sanitizeIdentifier(process.env.LITCH_MYSQL_TABLE_PREFIX ?? "litch");
const LEGACY_MYSQL_STATE_TABLE = sanitizeIdentifier(process.env.LITCH_MYSQL_STATE_TABLE ?? "litch_game_state");
const LEGACY_MYSQL_STATE_ID = process.env.LITCH_MYSQL_STATE_ID ?? "default";
let pendingSave: NodeJS.Timeout | null = null;
let mysqlPool: Pool | null = null;
let saveChain: Promise<void> = Promise.resolve();

function toPersistedStore(source: GameStore): PersistedGameStore {
  return {
    version: 1,
    savedAt: Date.now(),
    players: Array.from(source.players.values()),
    accountsByEmail: Array.from(source.accountsByEmail.values()),
    characters: Array.from(source.characters.values()),
    sessions: Array.from(source.sessions.entries()),
    battles: Array.from(source.battles.values()),
    clans: Array.from(source.clans.values()),
    marketplace: Array.from(source.marketplace.values()),
    itemTrades: Array.from(source.itemTrades.values()),
    chatMessages: source.chatMessages,
    clanChatMessages: Array.from(source.clanChatMessages.entries()),
    allPrivateMessages: source.allPrivateMessages,
    arenaQueue: source.arenaQueue,
    arenaRecordedBattleIds: Array.from(source.arenaRecordedBattleIds.values()),
    nextRegenAt: source.nextRegenAt,
    monarchEvent: source.monarchEvent,
    arenaSeasonKey: source.arenaSeasonKey,
    lastArenaSeason: source.lastArenaSeason,
    notifications: source.notifications
  };
}

function sanitizeIdentifier(value: string) {
  if (!/^[A-Za-z0-9_]+$/.test(value)) {
    throw new Error(`Invalid MySQL identifier: ${value}`);
  }
  return value;
}

function table(name: string) {
  return `\`${MYSQL_TABLE_PREFIX}_${name}\``;
}

function legacyStateTable() {
  return `\`${LEGACY_MYSQL_STATE_TABLE}\``;
}

function mysqlEnabled() {
  return PERSISTENCE_DRIVER === "mysql";
}

function createMysqlPool() {
  if (MYSQL_URL) {
    return createPool({
      uri: MYSQL_URL,
      waitForConnections: true,
      connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT ?? 10)
    });
  }

  const database = process.env.MYSQL_DATABASE;
  if (!database) {
    throw new Error("MySQL persistence requires MYSQL_DATABASE_URL, DATABASE_URL or MYSQL_DATABASE.");
  }

  return createPool({
    host: process.env.MYSQL_HOST ?? "127.0.0.1",
    port: Number(process.env.MYSQL_PORT ?? 3306),
    user: process.env.MYSQL_USER ?? "root",
    password: process.env.MYSQL_PASSWORD ?? "",
    database,
    waitForConnections: true,
    connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT ?? 10)
  });
}

function getMysqlPool() {
  mysqlPool ??= createMysqlPool();
  return mysqlPool;
}

function json(value: unknown) {
  return JSON.stringify(value ?? null);
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (value === undefined || value === null) {
    return fallback;
  }
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  if (Buffer.isBuffer(value)) {
    try {
      return JSON.parse(value.toString("utf8")) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

function maybeNumber(value: unknown) {
  return value === null || value === undefined ? undefined : Number(value);
}

function normalizeItemTradeStatus(status: unknown): ItemTradeOffer["status"] {
  if (status === "pending") {
    return "pending_response";
  }
  if (status === "pending_response" || status === "countered" || status === "accepted" || status === "declined" || status === "cancelled") {
    return status;
  }
  return "pending_response";
}

function normalizeItemTradeOffer(trade: ItemTradeOffer): ItemTradeOffer {
  const legacyOfferedItem = trade.offeredItem ? [trade.offeredItem] : [];
  const status = normalizeItemTradeStatus(trade.status);
  const fallbackExpiresAt =
    status === "pending_response"
      ? trade.createdAt + TRADE_INTERACTION_TIMEOUT_MS
      : status === "countered"
        ? (trade.respondedAt ?? trade.createdAt) + TRADE_INTERACTION_TIMEOUT_MS
        : undefined;
  return {
    ...trade,
    offer: {
      items: trade.offer?.items ?? legacyOfferedItem,
      gold: Number(trade.offer?.gold ?? 0)
    },
    counter: {
      items: trade.counter?.items ?? [],
      gold: Number(trade.counter?.gold ?? 0)
    },
    status,
    ...(trade.expiresAt || fallbackExpiresAt ? { expiresAt: trade.expiresAt ?? fallbackExpiresAt } : {})
  };
}

function applyPersistedStore(target: GameStore, persisted: Partial<PersistedGameStore>) {
  target.players = new Map((persisted.players ?? []).map((player) => [player.id, { ...player, email: player.email ?? "" }]));
  target.accountsByEmail = new Map(
    (persisted.accountsByEmail ?? []).map((account) => [
      account.email,
      {
        ...account,
        emailVerifiedAt: account.emailVerifiedAt ?? account.createdAt
      }
    ])
  );
  target.characters = new Map((persisted.characters ?? []).map((character) => [character.playerId, character]));
  target.sessions = new Map(persisted.sessions ?? []);
  target.battles = new Map((persisted.battles ?? []).map((battle) => [battle.id, battle]));
  target.clans = new Map((persisted.clans ?? []).map((clan) => [
    clan.id,
    { ...clan, description: clan.description ?? "", donationHistory: clan.donationHistory ?? [] }
  ]));
  target.marketplace = new Map((persisted.marketplace ?? []).map((listing) => [listing.id, listing]));
  target.itemTrades = new Map((persisted.itemTrades ?? []).map((trade) => {
    const normalized = normalizeItemTradeOffer(trade);
    return [normalized.id, normalized];
  }));
  target.chatMessages = persisted.chatMessages ?? [];
  target.clanChatMessages = new Map(persisted.clanChatMessages ?? []);
  target.allPrivateMessages = persisted.allPrivateMessages ?? [];
  target.arenaQueue = persisted.arenaQueue ?? [];
  target.arenaRecordedBattleIds = new Set(persisted.arenaRecordedBattleIds ?? []);
  target.socketsByPlayer = new Map();
  target.nextRegenAt = persisted.nextRegenAt ?? Date.now() + 2 * 60 * 1000;
  target.monarchEvent = persisted.monarchEvent ?? null;
  target.arenaSeasonKey = persisted.arenaSeasonKey ?? "";
  target.lastArenaSeason = persisted.lastArenaSeason ?? null;
  target.notifications = persisted.notifications ?? [];
}

async function ensureMysqlSchema() {
  const pool = getMysqlPool();

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS ${table("players")} (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      username VARCHAR(80) NOT NULL,
      email VARCHAR(255) NOT NULL,
      created_at BIGINT NOT NULL,
      referral_code VARCHAR(64) NULL,
      referred_by_player_id VARCHAR(64) NULL,
      UNIQUE KEY uq_players_email (email),
      UNIQUE KEY uq_players_referral_code (referral_code),
      KEY idx_players_referred_by (referred_by_player_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS ${table("auth_accounts")} (
      email VARCHAR(255) NOT NULL PRIMARY KEY,
      player_id VARCHAR(64) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      recovery_code_hash VARCHAR(255) NOT NULL,
      created_at BIGINT NOT NULL,
      password_updated_at BIGINT NULL,
      recovery_code_updated_at BIGINT NULL,
      email_verified_at BIGINT NULL,
      email_verification_token_hash VARCHAR(255) NULL,
      email_verification_token_expires_at BIGINT NULL,
      password_reset_token_hash VARCHAR(255) NULL,
      password_reset_token_expires_at BIGINT NULL,
      password_reset_requested_at BIGINT NULL,
      UNIQUE KEY uq_auth_player (player_id),
      CONSTRAINT fk_auth_player FOREIGN KEY (player_id) REFERENCES ${table("players")}(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS ${table("clans")} (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      name VARCHAR(80) NOT NULL,
      description TEXT NOT NULL,
      icon VARCHAR(80) NOT NULL,
      leader_player_id VARCHAR(64) NOT NULL,
      level INT NOT NULL,
      member_capacity INT NOT NULL,
      gold BIGINT NOT NULL,
      diamonds BIGINT NOT NULL,
      benefit_allocations JSON NOT NULL,
      donation_history JSON NULL,
      created_at BIGINT NOT NULL,
      KEY idx_clans_leader (leader_player_id),
      CONSTRAINT fk_clans_leader FOREIGN KEY (leader_player_id) REFERENCES ${table("players")}(id) ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  await ensureMysqlColumn(pool, `${MYSQL_TABLE_PREFIX}_clans`, "description", "TEXT NOT NULL");
  await ensureMysqlColumn(pool, `${MYSQL_TABLE_PREFIX}_clans`, "donation_history", "JSON NULL");

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS ${table("characters")} (
      player_id VARCHAR(64) NOT NULL PRIMARY KEY,
      id VARCHAR(64) NOT NULL,
      name VARCHAR(80) NOT NULL,
      level INT NOT NULL,
      experience BIGINT NOT NULL,
      gold BIGINT NOT NULL,
      diamonds BIGINT NOT NULL,
      current_hp BIGINT NOT NULL,
      current_energy BIGINT NOT NULL,
      city_id VARCHAR(80) NOT NULL,
      strength INT NOT NULL,
      constitution INT NOT NULL,
      agility INT NOT NULL,
      unspent_attribute_points INT NOT NULL,
      equipment JSON NOT NULL,
      active_battle_id VARCHAR(64) NULL,
      quest_progress JSON NOT NULL,
      talent_allocations JSON NOT NULL,
      clan_id VARCHAR(64) NULL,
      last_regen_at BIGINT NULL,
      clan_benefit_allocations JSON NOT NULL,
      arena_wins INT NOT NULL,
      arena_losses INT NOT NULL,
      arena_ranked_points INT NOT NULL,
      dungeon_clears INT NOT NULL,
      market_history JSON NOT NULL,
      diamond_purchase_history JSON NULL,
      pve_auto_until BIGINT NULL,
      royal_seal_until BIGINT NULL,
      avatar_id VARCHAR(80) NULL,
      unlocked_avatar_ids JSON NOT NULL,
      referral_rewards_claimed_for JSON NOT NULL,
      monarch_attempts JSON NULL,
      active_work JSON NULL,
      work_aptitudes JSON NOT NULL,
      work_bonus_claims JSON NOT NULL,
      dungeon_progress JSON NULL,
      last_daily_blue_coin_grant_key VARCHAR(32) NULL,
      clan_join_cooldown_until BIGINT NULL,
      UNIQUE KEY uq_characters_id (id),
      KEY idx_characters_clan (clan_id),
      CONSTRAINT fk_characters_player FOREIGN KEY (player_id) REFERENCES ${table("players")}(id) ON DELETE CASCADE,
      CONSTRAINT fk_characters_clan FOREIGN KEY (clan_id) REFERENCES ${table("clans")}(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  await ensureMysqlColumn(pool, `${MYSQL_TABLE_PREFIX}_characters`, "clan_join_cooldown_until", "BIGINT NULL");
  await ensureMysqlColumn(pool, `${MYSQL_TABLE_PREFIX}_characters`, "dungeon_progress", "JSON NULL");
  await ensureMysqlColumn(pool, `${MYSQL_TABLE_PREFIX}_characters`, "diamond_purchase_history", "JSON NULL");

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS ${table("character_inventory")} (
      character_player_id VARCHAR(64) NOT NULL,
      instance_id VARCHAR(64) NOT NULL,
      item_id VARCHAR(120) NOT NULL,
      quantity INT NOT NULL,
      enhancement_level INT NULL,
      rarity VARCHAR(32) NULL,
      PRIMARY KEY (character_player_id, instance_id),
      UNIQUE KEY uq_inventory_instance (instance_id),
      CONSTRAINT fk_inventory_character FOREIGN KEY (character_player_id) REFERENCES ${table("characters")}(player_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS ${table("clan_members")} (
      clan_id VARCHAR(64) NOT NULL,
      player_id VARCHAR(64) NOT NULL,
      position INT NOT NULL,
      PRIMARY KEY (clan_id, player_id),
      CONSTRAINT fk_clan_members_clan FOREIGN KEY (clan_id) REFERENCES ${table("clans")}(id) ON DELETE CASCADE,
      CONSTRAINT fk_clan_members_player FOREIGN KEY (player_id) REFERENCES ${table("players")}(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS ${table("sessions")} (
      session_token VARCHAR(128) NOT NULL PRIMARY KEY,
      player_id VARCHAR(64) NOT NULL,
      CONSTRAINT fk_sessions_player FOREIGN KEY (player_id) REFERENCES ${table("players")}(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS ${table("battles")} (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      mode VARCHAR(24) NOT NULL,
      status VARCHAR(24) NOT NULL,
      city_id VARCHAR(80) NOT NULL,
      participants JSON NOT NULL,
      turn_participant_id VARCHAR(128) NULL,
      log JSON NOT NULL,
      winner_participant_id VARCHAR(128) NULL,
      created_at BIGINT NOT NULL,
      updated_at BIGINT NOT NULL,
      monarch JSON NULL,
      arena JSON NULL,
      death_penalty_applied_player_ids JSON NULL,
      dungeon JSON NULL,
      KEY idx_battles_status (status),
      KEY idx_battles_city (city_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  await ensureMysqlColumn(pool, `${MYSQL_TABLE_PREFIX}_battles`, "death_penalty_applied_player_ids", "JSON NULL");
  await ensureMysqlColumn(pool, `${MYSQL_TABLE_PREFIX}_battles`, "dungeon", "JSON NULL");

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS ${table("market_listings")} (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      seller_player_id VARCHAR(64) NOT NULL,
      seller_name VARCHAR(80) NOT NULL,
      item JSON NOT NULL,
      price BIGINT NOT NULL,
      currency VARCHAR(16) NOT NULL,
      created_at BIGINT NOT NULL,
      KEY idx_market_seller (seller_player_id),
      KEY idx_market_created (created_at),
      CONSTRAINT fk_market_seller FOREIGN KEY (seller_player_id) REFERENCES ${table("players")}(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS ${table("item_trades")} (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      from_player_id VARCHAR(64) NOT NULL,
      from_name VARCHAR(80) NOT NULL,
      to_player_id VARCHAR(64) NOT NULL,
      to_name VARCHAR(80) NOT NULL,
      offered_item JSON NOT NULL,
      requested_item_id VARCHAR(120) NOT NULL,
      requested_quantity INT NOT NULL,
      offer_items JSON NULL,
      offer_gold BIGINT NOT NULL DEFAULT 0,
      counter_items JSON NULL,
      counter_gold BIGINT NOT NULL DEFAULT 0,
      status VARCHAR(24) NOT NULL,
      created_at BIGINT NOT NULL,
      responded_at BIGINT NULL,
      expires_at BIGINT NULL,
      resolved_at BIGINT NULL,
      KEY idx_item_trades_from (from_player_id),
      KEY idx_item_trades_to (to_player_id),
      KEY idx_item_trades_status (status),
      KEY idx_item_trades_created (created_at),
      CONSTRAINT fk_item_trades_from FOREIGN KEY (from_player_id) REFERENCES ${table("players")}(id) ON DELETE CASCADE,
      CONSTRAINT fk_item_trades_to FOREIGN KEY (to_player_id) REFERENCES ${table("players")}(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  await ensureMysqlColumn(pool, `${MYSQL_TABLE_PREFIX}_item_trades`, "offer_items", "JSON NULL");
  await ensureMysqlColumn(pool, `${MYSQL_TABLE_PREFIX}_item_trades`, "offer_gold", "BIGINT NOT NULL DEFAULT 0");
  await ensureMysqlColumn(pool, `${MYSQL_TABLE_PREFIX}_item_trades`, "counter_items", "JSON NULL");
  await ensureMysqlColumn(pool, `${MYSQL_TABLE_PREFIX}_item_trades`, "counter_gold", "BIGINT NOT NULL DEFAULT 0");
  await ensureMysqlColumn(pool, `${MYSQL_TABLE_PREFIX}_item_trades`, "responded_at", "BIGINT NULL");
  await ensureMysqlColumn(pool, `${MYSQL_TABLE_PREFIX}_item_trades`, "expires_at", "BIGINT NULL");

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS ${table("chat_messages")} (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      player_id VARCHAR(64) NOT NULL,
      author VARCHAR(80) NOT NULL,
      text TEXT NOT NULL,
      created_at BIGINT NOT NULL,
      KEY idx_chat_created (created_at),
      KEY idx_chat_player (player_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS ${table("clan_chat_messages")} (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      clan_id VARCHAR(64) NOT NULL,
      player_id VARCHAR(64) NOT NULL,
      author VARCHAR(80) NOT NULL,
      text TEXT NOT NULL,
      created_at BIGINT NOT NULL,
      KEY idx_clan_chat_clan_created (clan_id, created_at),
      CONSTRAINT fk_clan_chat_clan FOREIGN KEY (clan_id) REFERENCES ${table("clans")}(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS ${table("private_messages")} (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      from_player_id VARCHAR(64) NOT NULL,
      from_name VARCHAR(80) NOT NULL,
      to_player_id VARCHAR(64) NOT NULL,
      to_name VARCHAR(80) NOT NULL,
      text TEXT NOT NULL,
      created_at BIGINT NOT NULL,
      read_at BIGINT NULL,
      KEY idx_private_from (from_player_id),
      KEY idx_private_to (to_player_id),
      KEY idx_private_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  await ensureMysqlColumn(pool, `${MYSQL_TABLE_PREFIX}_private_messages`, "read_at", "BIGINT NULL");

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS ${table("notifications")} (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      player_id VARCHAR(64) NOT NULL,
      kind VARCHAR(48) NOT NULL,
      title VARCHAR(160) NOT NULL,
      message TEXT NOT NULL,
      created_at BIGINT NOT NULL,
      read_at BIGINT NULL,
      data JSON NULL,
      KEY idx_notifications_player_created (player_id, created_at),
      CONSTRAINT fk_notifications_player FOREIGN KEY (player_id) REFERENCES ${table("players")}(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS ${table("arena_queue")} (
      position INT NOT NULL PRIMARY KEY,
      player_id VARCHAR(64) NOT NULL,
      UNIQUE KEY uq_arena_queue_player (player_id),
      CONSTRAINT fk_arena_queue_player FOREIGN KEY (player_id) REFERENCES ${table("players")}(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS ${table("arena_recorded_battles")} (
      battle_id VARCHAR(64) NOT NULL PRIMARY KEY
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS ${table("monarch_event")} (
      id VARCHAR(32) NOT NULL PRIMARY KEY,
      day_key VARCHAR(16) NOT NULL,
      monarch_id VARCHAR(80) NOT NULL,
      name VARCHAR(160) NOT NULL,
      title VARCHAR(160) NOT NULL,
      image_url VARCHAR(255) NOT NULL,
      level INT NOT NULL,
      max_hp BIGINT NOT NULL,
      current_hp BIGINT NOT NULL,
      strength INT NOT NULL,
      defense INT NOT NULL,
      agility INT NOT NULL,
      experience BIGINT NOT NULL,
      gold BIGINT NOT NULL,
      is_king BOOLEAN NOT NULL,
      status VARCHAR(24) NOT NULL,
      starts_at BIGINT NOT NULL,
      ends_at BIGINT NOT NULL,
      ended_at BIGINT NULL,
      damage_by_player JSON NOT NULL,
      participant_names JSON NOT NULL,
      attempts_by_player JSON NOT NULL,
      rewards_granted BOOLEAN NOT NULL,
      reward_log JSON NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS ${table("game_meta")} (
      meta_key VARCHAR(80) NOT NULL PRIMARY KEY,
      json_value JSON NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

function loadJsonPersistentStore(target: GameStore) {
  if (!existsSync(DATA_FILE)) {
    return false;
  }

  const persisted = JSON.parse(readFileSync(DATA_FILE, "utf8")) as Partial<PersistedGameStore>;
  applyPersistedStore(target, persisted);
  return true;
}

async function mysqlTableExists(connection: PoolConnection, tableName: string) {
  const [rows] = await connection.execute<Array<RowDataPacket & { count: number }>>(
    "SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?",
    [tableName]
  );
  return Number(rows[0]?.count ?? 0) > 0;
}

async function ensureMysqlColumn(pool: Pool, tableName: string, columnName: string, definition: string) {
  const [rows] = await pool.execute<Array<RowDataPacket & { count: number }>>(
    "SELECT COUNT(*) AS count FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?",
    [tableName, columnName]
  );
  if (Number(rows[0]?.count ?? 0) > 0) {
    return;
  }
  await pool.execute(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${definition}`);
}

async function loadLegacyMysqlSnapshot(target: GameStore, connection: PoolConnection) {
  if (!(await mysqlTableExists(connection, LEGACY_MYSQL_STATE_TABLE))) {
    return false;
  }

  const [rows] = await connection.execute<Array<RowDataPacket & { payload: unknown }>>(
    `SELECT payload FROM ${legacyStateTable()} WHERE id = ? LIMIT 1`,
    [LEGACY_MYSQL_STATE_ID]
  );
  if (rows.length === 0) {
    return false;
  }

  applyPersistedStore(target, parseJson<Partial<PersistedGameStore>>(rows[0].payload, {}));
  return true;
}

async function mysqlHasRelationalData(connection: PoolConnection) {
  const [rows] = await connection.execute<Array<RowDataPacket & { count: number }>>(`SELECT COUNT(*) AS count FROM ${table("players")}`);
  return Number(rows[0]?.count ?? 0) > 0;
}

async function loadMysqlPersistentStore(target: GameStore) {
  await ensureMysqlSchema();
  const connection = await getMysqlPool().getConnection();
  try {
    if (!(await mysqlHasRelationalData(connection))) {
      if (await loadLegacyMysqlSnapshot(target, connection)) {
        await saveMysqlStoreNow(target);
        console.log(`[persistence] MySQL relacional vazio; estado importado de ${LEGACY_MYSQL_STATE_TABLE}`);
        return;
      }
      if (process.env.LITCH_MYSQL_IMPORT_JSON_ON_EMPTY !== "false" && loadJsonPersistentStore(target)) {
        await saveMysqlStoreNow(target);
        console.log(`[persistence] MySQL relacional vazio; estado importado de ${DATA_FILE}`);
        return;
      }
      return;
    }

    await loadRelationalMysqlStore(target, connection);
  } finally {
    connection.release();
  }
}

async function loadRelationalMysqlStore(target: GameStore, connection: PoolConnection) {
  const [playerRows] = await connection.execute<Array<RowDataPacket & Player & {
    created_at: number;
    referral_code: string | null;
    referred_by_player_id: string | null;
  }>>(`SELECT * FROM ${table("players")} ORDER BY created_at ASC`);
  const players: Player[] = playerRows.map((row) => ({
    id: row.id,
    username: row.username,
    email: row.email ?? "",
    createdAt: Number(row.created_at),
    referralCode: row.referral_code ?? undefined,
    referredByPlayerId: row.referred_by_player_id ?? undefined
  }));

  const [accountRows] = await connection.execute<Array<RowDataPacket & {
    email: string;
    player_id: string;
    password_hash: string;
    recovery_code_hash: string;
    created_at: number;
    password_updated_at: number | null;
    recovery_code_updated_at: number | null;
    email_verified_at: number | null;
    email_verification_token_hash: string | null;
    email_verification_token_expires_at: number | null;
    password_reset_token_hash: string | null;
    password_reset_token_expires_at: number | null;
    password_reset_requested_at: number | null;
  }>>(`SELECT * FROM ${table("auth_accounts")}`);
  const accounts = accountRows.map((row): AuthAccount => ({
    email: row.email,
    playerId: row.player_id,
    passwordHash: row.password_hash,
    recoveryCodeHash: row.recovery_code_hash,
    createdAt: Number(row.created_at),
    passwordUpdatedAt: maybeNumber(row.password_updated_at),
    recoveryCodeUpdatedAt: maybeNumber(row.recovery_code_updated_at),
    emailVerifiedAt: maybeNumber(row.email_verified_at) ?? Number(row.created_at),
    emailVerificationTokenHash: row.email_verification_token_hash ?? undefined,
    emailVerificationTokenExpiresAt: maybeNumber(row.email_verification_token_expires_at),
    passwordResetTokenHash: row.password_reset_token_hash ?? undefined,
    passwordResetTokenExpiresAt: maybeNumber(row.password_reset_token_expires_at),
    passwordResetRequestedAt: maybeNumber(row.password_reset_requested_at)
  }));

  const [clanRows] = await connection.execute<Array<RowDataPacket & {
    id: string;
    name: string;
    description: string | null;
    icon: string;
    leader_player_id: string;
    level: number;
    member_capacity: number;
    gold: number;
    diamonds: number;
    benefit_allocations: unknown;
    donation_history: unknown;
    created_at: number;
  }>>(`SELECT * FROM ${table("clans")} ORDER BY created_at ASC`);
  const clans = new Map<string, Clan>(
    clanRows.map((row) => [
      row.id,
      {
        id: row.id,
        name: row.name,
        description: row.description ?? "",
        icon: row.icon,
        leaderPlayerId: row.leader_player_id,
        memberPlayerIds: [],
        level: Number(row.level),
        memberCapacity: Number(row.member_capacity),
        gold: Number(row.gold),
        diamonds: Number(row.diamonds),
        benefitAllocations: parseJson<Record<string, number>>(row.benefit_allocations, {}),
        donationHistory: parseJson(row.donation_history, []),
        createdAt: Number(row.created_at)
      }
    ])
  );

  const [clanMemberRows] = await connection.execute<Array<RowDataPacket & { clan_id: string; player_id: string }>>(
    `SELECT clan_id, player_id FROM ${table("clan_members")} ORDER BY clan_id ASC, position ASC`
  );
  for (const row of clanMemberRows) {
    clans.get(row.clan_id)?.memberPlayerIds.push(row.player_id);
  }

  const [characterRows] = await connection.execute<Array<RowDataPacket & {
    player_id: string;
    id: string;
    name: string;
    level: number;
    experience: number;
    gold: number;
    diamonds: number;
    current_hp: number;
    current_energy: number;
    city_id: string;
    strength: number;
    constitution: number;
    agility: number;
    unspent_attribute_points: number;
    equipment: unknown;
    active_battle_id: string | null;
    quest_progress: unknown;
    talent_allocations: unknown;
    clan_id: string | null;
    last_regen_at: number | null;
    clan_benefit_allocations: unknown;
    arena_wins: number;
    arena_losses: number;
    arena_ranked_points: number;
    dungeon_clears: number;
    market_history: unknown;
    diamond_purchase_history: unknown;
    pve_auto_until: number | null;
    royal_seal_until: number | null;
    avatar_id: string | null;
    unlocked_avatar_ids: unknown;
    referral_rewards_claimed_for: unknown;
    monarch_attempts: unknown;
    active_work: unknown;
    work_aptitudes: unknown;
    work_bonus_claims: unknown;
    dungeon_progress: unknown;
    last_daily_blue_coin_grant_key: string | null;
    clan_join_cooldown_until: number | null;
  }>>(`SELECT * FROM ${table("characters")}`);
  const characters = new Map<string, Character>();
  for (const row of characterRows) {
    characters.set(row.player_id, {
      id: row.id,
      playerId: row.player_id,
      name: row.name,
      level: Number(row.level),
      experience: Number(row.experience),
      gold: Number(row.gold),
      diamonds: Number(row.diamonds),
      currentHp: Number(row.current_hp),
      currentEnergy: Number(row.current_energy),
      cityId: row.city_id,
      attributes: {
        strength: Number(row.strength),
        constitution: Number(row.constitution),
        agility: Number(row.agility)
      },
      unspentAttributePoints: Number(row.unspent_attribute_points),
      equipment: parseJson(row.equipment, { weapon: null, armor: null, amulet: null }),
      inventory: [],
      activeBattleId: row.active_battle_id,
      questProgress: parseJson(row.quest_progress, {
        dayKey: "",
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
      }),
      talentAllocations: parseJson<Record<string, number>>(row.talent_allocations, {}),
      clanId: row.clan_id,
      lastRegenAt: maybeNumber(row.last_regen_at),
      clanBenefitAllocations: parseJson<Record<string, number>>(row.clan_benefit_allocations, {}),
      arenaWins: Number(row.arena_wins),
      arenaLosses: Number(row.arena_losses),
      arenaRankedPoints: Number(row.arena_ranked_points),
      dungeonClears: Number(row.dungeon_clears),
      marketHistory: parseJson(row.market_history, []),
      diamondPurchaseHistory: parseJson(row.diamond_purchase_history, []),
      pveAutoUntil: maybeNumber(row.pve_auto_until),
      royalSealUntil: maybeNumber(row.royal_seal_until),
      avatarId: row.avatar_id ?? undefined,
      unlockedAvatarIds: parseJson<string[]>(row.unlocked_avatar_ids, []),
      referralRewardsClaimedFor: parseJson<string[]>(row.referral_rewards_claimed_for, []),
      monarchAttempts: parseJson(row.monarch_attempts, undefined),
      activeWork: parseJson(row.active_work, null),
      workAptitudes: parseJson(row.work_aptitudes, {}),
      workBonusClaims: parseJson(row.work_bonus_claims, {}),
      dungeonProgress: parseJson(row.dungeon_progress, undefined),
      lastDailyBlueCoinGrantKey: row.last_daily_blue_coin_grant_key ?? undefined,
      clanJoinCooldownUntil: maybeNumber(row.clan_join_cooldown_until) ?? 0
    });
  }

  const [inventoryRows] = await connection.execute<Array<RowDataPacket & {
    character_player_id: string;
    instance_id: string;
    item_id: string;
    quantity: number;
    enhancement_level: number | null;
    rarity: InventoryItem["rarity"] | null;
  }>>(`SELECT * FROM ${table("character_inventory")} ORDER BY character_player_id ASC`);
  for (const row of inventoryRows) {
    const inventoryItem: InventoryItem = {
      instanceId: row.instance_id,
      itemId: row.item_id,
      quantity: Number(row.quantity),
      enhancementLevel: maybeNumber(row.enhancement_level),
      rarity: row.rarity ?? undefined
    };
    characters.get(row.character_player_id)?.inventory.push(inventoryItem);
  }

  const [sessionRows] = await connection.execute<Array<RowDataPacket & { session_token: string; player_id: string }>>(
    `SELECT session_token, player_id FROM ${table("sessions")}`
  );

  const [battleRows] = await connection.execute<Array<RowDataPacket & {
    id: string;
    mode: BattleState["mode"];
    status: BattleState["status"];
    city_id: string;
    participants: unknown;
    turn_participant_id: string | null;
    log: unknown;
    winner_participant_id: string | null;
    created_at: number;
    updated_at: number;
    monarch: unknown;
    arena: unknown;
    death_penalty_applied_player_ids: unknown;
    dungeon: unknown;
  }>>(`SELECT * FROM ${table("battles")}`);
  const battles: BattleState[] = battleRows.map((row) => ({
    id: row.id,
    mode: row.mode,
    status: row.status,
    cityId: row.city_id,
    participants: parseJson(row.participants, []),
    turnParticipantId: row.turn_participant_id,
    log: parseJson(row.log, []),
    winnerParticipantId: row.winner_participant_id,
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
    monarch: parseJson(row.monarch, undefined),
    arena: parseJson(row.arena, undefined),
    deathPenaltyAppliedPlayerIds: parseJson(row.death_penalty_applied_player_ids, undefined),
    dungeon: parseJson(row.dungeon, undefined)
  }));

  const [marketRows] = await connection.execute<Array<RowDataPacket & {
    id: string;
    seller_player_id: string;
    seller_name: string;
    item: unknown;
    price: number;
    currency: MarketListing["currency"];
    created_at: number;
  }>>(`SELECT * FROM ${table("market_listings")} ORDER BY created_at DESC`);
  const marketplace = marketRows.map((row): MarketListing => ({
    id: row.id,
    sellerPlayerId: row.seller_player_id,
    sellerName: row.seller_name,
    item: parseJson(row.item, { instanceId: "", itemId: "", quantity: 1 }),
    price: Number(row.price),
    currency: row.currency,
    createdAt: Number(row.created_at)
  }));

  const [tradeRows] = await connection.execute<Array<RowDataPacket & {
    id: string;
    from_player_id: string;
    from_name: string;
    to_player_id: string;
    to_name: string;
    offered_item: unknown;
    requested_item_id: string;
    requested_quantity: number;
    offer_items: unknown;
    offer_gold: number;
    counter_items: unknown;
    counter_gold: number;
    status: ItemTradeOffer["status"];
    created_at: number;
    responded_at: number | null;
    expires_at: number | null;
    resolved_at: number | null;
  }>>(`SELECT * FROM ${table("item_trades")} ORDER BY created_at DESC`);
  const itemTrades = tradeRows.map((row): ItemTradeOffer => {
    const legacyOfferedItem = parseJson<InventoryItem>(row.offered_item, { instanceId: "", itemId: "", quantity: 1 });
    const offerItems = row.offer_items
      ? parseJson<InventoryItem[]>(row.offer_items, [])
      : legacyOfferedItem.itemId
        ? [legacyOfferedItem]
        : [];
    return normalizeItemTradeOffer({
      id: row.id,
      fromPlayerId: row.from_player_id,
      fromName: row.from_name,
      toPlayerId: row.to_player_id,
      toName: row.to_name,
      offer: {
        items: offerItems,
        gold: Number(row.offer_gold ?? 0)
      },
      counter: {
        items: parseJson<InventoryItem[]>(row.counter_items, []),
        gold: Number(row.counter_gold ?? 0)
      },
      offeredItem: legacyOfferedItem.itemId ? legacyOfferedItem : undefined,
      requestedItemId: row.requested_item_id,
      requestedQuantity: Number(row.requested_quantity),
      status: row.status,
      createdAt: Number(row.created_at),
      ...(row.responded_at ? { respondedAt: Number(row.responded_at) } : {}),
      ...(row.expires_at ? { expiresAt: Number(row.expires_at) } : {}),
      ...(row.resolved_at ? { resolvedAt: Number(row.resolved_at) } : {})
    });
  });

  const [chatRows] = await connection.execute<Array<RowDataPacket & ChatMessage>>(
    `SELECT id, player_id AS playerId, author, text, created_at AS createdAt FROM ${table("chat_messages")} ORDER BY created_at DESC`
  );
  const chatMessages = chatRows.map((row) => ({
    id: row.id,
    playerId: row.playerId,
    author: row.author,
    text: row.text,
    createdAt: Number(row.createdAt)
  }));

  const [clanChatRows] = await connection.execute<Array<RowDataPacket & { clan_id: string } & ChatMessage>>(
    `SELECT clan_id, id, player_id AS playerId, author, text, created_at AS createdAt FROM ${table("clan_chat_messages")} ORDER BY clan_id ASC, created_at DESC`
  );
  const clanChatMessages = new Map<string, ChatMessage[]>();
  for (const row of clanChatRows) {
    const messages = clanChatMessages.get(row.clan_id) ?? [];
    messages.push({ id: row.id, playerId: row.playerId, author: row.author, text: row.text, createdAt: Number(row.createdAt) });
    clanChatMessages.set(row.clan_id, messages);
  }

  const [privateRows] = await connection.execute<Array<RowDataPacket & PrivateMessage>>(
    `SELECT id, from_player_id AS fromPlayerId, from_name AS fromName, to_player_id AS toPlayerId, to_name AS toName, text, created_at AS createdAt, read_at AS readAt FROM ${table("private_messages")} ORDER BY created_at DESC`
  );
  const privateMessages = privateRows.map((row) => ({
    id: row.id,
    fromPlayerId: row.fromPlayerId,
    fromName: row.fromName,
    toPlayerId: row.toPlayerId,
    toName: row.toName,
    text: row.text,
    createdAt: Number(row.createdAt),
    ...(row.readAt ? { readAt: Number(row.readAt) } : {})
  }));

  const [notificationRows] = await connection.execute<Array<RowDataPacket & {
    id: string;
    player_id: string;
    kind: PlayerNotification["kind"];
    title: string;
    message: string;
    created_at: number;
    read_at: number | null;
    data: unknown;
  }>>(`SELECT * FROM ${table("notifications")} ORDER BY created_at DESC`);
  const notifications = notificationRows.map((row): PlayerNotification => ({
    id: row.id,
    playerId: row.player_id,
    kind: row.kind,
    title: row.title,
    message: row.message,
    createdAt: Number(row.created_at),
    readAt: maybeNumber(row.read_at),
    data: parseJson<PlayerNotification["data"]>(row.data, undefined)
  }));

  const [arenaQueueRows] = await connection.execute<Array<RowDataPacket & { player_id: string }>>(
    `SELECT player_id FROM ${table("arena_queue")} ORDER BY position ASC`
  );

  const [arenaRecordedRows] = await connection.execute<Array<RowDataPacket & { battle_id: string }>>(
    `SELECT battle_id FROM ${table("arena_recorded_battles")}`
  );

  const [monarchRows] = await connection.execute<Array<RowDataPacket & {
    day_key: string;
    monarch_id: string;
    name: string;
    title: string;
    image_url: string;
    level: number;
    max_hp: number;
    current_hp: number;
    strength: number;
    defense: number;
    agility: number;
    experience: number;
    gold: number;
    is_king: boolean | number;
    status: MonarchEventState["status"];
    starts_at: number;
    ends_at: number;
    ended_at: number | null;
    damage_by_player: unknown;
    participant_names: unknown;
    attempts_by_player: unknown;
    rewards_granted: boolean | number;
    reward_log: unknown;
  }>>(`SELECT * FROM ${table("monarch_event")} WHERE id = 'current' LIMIT 1`);

  const [metaRows] = await connection.execute<Array<RowDataPacket & { meta_key: string; json_value: unknown }>>(
    `SELECT meta_key, json_value FROM ${table("game_meta")}`
  );
  const meta = new Map(metaRows.map((row) => [row.meta_key, row.json_value]));

  target.players = new Map(players.map((player) => [player.id, player]));
  target.accountsByEmail = new Map(accounts.map((account) => [account.email, account]));
  target.characters = characters;
  target.sessions = new Map(sessionRows.map((row) => [row.session_token, row.player_id]));
  target.battles = new Map(battles.map((battle) => [battle.id, battle]));
  target.clans = clans;
  target.marketplace = new Map(marketplace.map((listing) => [listing.id, listing]));
  target.itemTrades = new Map(itemTrades.map((trade) => [trade.id, trade]));
  target.chatMessages = chatMessages;
  target.clanChatMessages = clanChatMessages;
  target.allPrivateMessages = privateMessages;
  target.notifications = notifications;
  target.arenaQueue = arenaQueueRows.map((row) => row.player_id);
  target.arenaRecordedBattleIds = new Set(arenaRecordedRows.map((row) => row.battle_id));
  target.socketsByPlayer = new Map();
  target.nextRegenAt = Number(parseJson<number>(meta.get("nextRegenAt"), Date.now() + 2 * 60 * 1000));
  target.arenaSeasonKey = parseJson<string>(meta.get("arenaSeasonKey"), String(meta.get("arenaSeasonKey") ?? ""));
  target.lastArenaSeason = parseJson<ArenaSeasonData | null>(meta.get("lastArenaSeason"), null);
  target.monarchEvent = monarchRows[0]
    ? {
        dayKey: monarchRows[0].day_key,
        monarchId: monarchRows[0].monarch_id,
        name: monarchRows[0].name,
        title: monarchRows[0].title,
        imageUrl: monarchRows[0].image_url,
        level: Number(monarchRows[0].level),
        maxHp: Number(monarchRows[0].max_hp),
        currentHp: Number(monarchRows[0].current_hp),
        strength: Number(monarchRows[0].strength),
        defense: Number(monarchRows[0].defense),
        agility: Number(monarchRows[0].agility),
        experience: Number(monarchRows[0].experience),
        gold: Number(monarchRows[0].gold),
        isKing: Boolean(monarchRows[0].is_king),
        status: monarchRows[0].status,
        startsAt: Number(monarchRows[0].starts_at),
        endsAt: Number(monarchRows[0].ends_at),
        endedAt: maybeNumber(monarchRows[0].ended_at),
        damageByPlayer: parseJson(monarchRows[0].damage_by_player, {}),
        participantNames: parseJson(monarchRows[0].participant_names, {}),
        attemptsByPlayer: parseJson(monarchRows[0].attempts_by_player, {}),
        rewardsGranted: Boolean(monarchRows[0].rewards_granted),
        rewardLog: parseJson(monarchRows[0].reward_log, [])
      }
    : null;
}

async function clearMysqlTables(connection: PoolConnection) {
  for (const name of [
    "game_meta",
    "monarch_event",
    "arena_recorded_battles",
    "arena_queue",
    "notifications",
    "private_messages",
    "clan_chat_messages",
    "chat_messages",
    "item_trades",
    "market_listings",
    "battles",
    "sessions",
    "character_inventory",
    "clan_members",
    "characters",
    "auth_accounts",
    "clans",
    "players"
  ]) {
    await connection.execute(`DELETE FROM ${table(name)}`);
  }
}

async function saveMysqlStoreNow(source: GameStore = store) {
  await ensureMysqlSchema();
  const connection = await getMysqlPool().getConnection();
  try {
    await connection.beginTransaction();
    await clearMysqlTables(connection);

    for (const player of source.players.values()) {
      await connection.execute(
        `INSERT INTO ${table("players")} (id, username, email, created_at, referral_code, referred_by_player_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [player.id, player.username, player.email ?? "", player.createdAt, player.referralCode ?? null, player.referredByPlayerId ?? null]
      );
    }

    for (const account of source.accountsByEmail.values()) {
      await connection.execute(
        `INSERT INTO ${table("auth_accounts")} (
          email, player_id, password_hash, recovery_code_hash, created_at, password_updated_at, recovery_code_updated_at,
          email_verified_at, email_verification_token_hash, email_verification_token_expires_at,
          password_reset_token_hash, password_reset_token_expires_at, password_reset_requested_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          account.email,
          account.playerId,
          account.passwordHash,
          account.recoveryCodeHash,
          account.createdAt,
          account.passwordUpdatedAt ?? null,
          account.recoveryCodeUpdatedAt ?? null,
          account.emailVerifiedAt ?? null,
          account.emailVerificationTokenHash ?? null,
          account.emailVerificationTokenExpiresAt ?? null,
          account.passwordResetTokenHash ?? null,
          account.passwordResetTokenExpiresAt ?? null,
          account.passwordResetRequestedAt ?? null
        ]
      );
    }

    for (const clan of source.clans.values()) {
      await connection.execute(
        `INSERT INTO ${table("clans")} (
          id, name, description, icon, leader_player_id, level, member_capacity, gold, diamonds, benefit_allocations, donation_history, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          clan.id,
          clan.name,
          clan.description ?? "",
          clan.icon ?? "",
          clan.leaderPlayerId,
          clan.level ?? 1,
          clan.memberCapacity ?? 20,
          clan.gold ?? 0,
          clan.diamonds ?? 0,
          json(clan.benefitAllocations ?? {}),
          json(clan.donationHistory ?? []),
          clan.createdAt ?? Date.now()
        ]
      );
      for (const [index, playerId] of clan.memberPlayerIds.entries()) {
        await connection.execute(`INSERT INTO ${table("clan_members")} (clan_id, player_id, position) VALUES (?, ?, ?)`, [
          clan.id,
          playerId,
          index
        ]);
      }
    }

    for (const character of source.characters.values()) {
      const attributes = character.attributes ?? { strength: 0, constitution: 0, agility: 0 };
      await connection.execute(
        `INSERT INTO ${table("characters")} (
          player_id, id, name, level, experience, gold, diamonds, current_hp, current_energy, city_id,
          strength, constitution, agility, unspent_attribute_points, equipment, active_battle_id, quest_progress,
          talent_allocations, clan_id, last_regen_at, clan_benefit_allocations, arena_wins, arena_losses,
          arena_ranked_points, dungeon_clears, market_history, diamond_purchase_history, pve_auto_until, royal_seal_until, avatar_id,
          unlocked_avatar_ids, referral_rewards_claimed_for, monarch_attempts, active_work, work_aptitudes,
          work_bonus_claims, dungeon_progress, last_daily_blue_coin_grant_key, clan_join_cooldown_until
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          character.playerId,
          character.id,
          character.name,
          character.level ?? 1,
          character.experience ?? 0,
          character.gold ?? 0,
          character.diamonds ?? 0,
          character.currentHp ?? 0,
          character.currentEnergy ?? 0,
          character.cityId ?? "ravenspire",
          attributes.strength ?? 0,
          attributes.constitution ?? 0,
          attributes.agility ?? 0,
          character.unspentAttributePoints ?? 0,
          json(character.equipment ?? {}),
          character.activeBattleId ?? null,
          json(character.questProgress ?? {}),
          json(character.talentAllocations ?? {}),
          character.clanId ?? null,
          character.lastRegenAt ?? null,
          json(character.clanBenefitAllocations ?? {}),
          character.arenaWins ?? 0,
          character.arenaLosses ?? 0,
          character.arenaRankedPoints ?? 100,
          character.dungeonClears ?? 0,
          json(character.marketHistory ?? []),
          json(character.diamondPurchaseHistory ?? []),
          character.pveAutoUntil ?? null,
          character.royalSealUntil ?? null,
          character.avatarId ?? null,
          json(character.unlockedAvatarIds ?? []),
          json(character.referralRewardsClaimedFor ?? []),
          json(character.monarchAttempts ?? null),
          json(character.activeWork ?? null),
          json(character.workAptitudes ?? {}),
          json(character.workBonusClaims ?? {}),
          json(character.dungeonProgress ?? null),
          character.lastDailyBlueCoinGrantKey ?? null,
          character.clanJoinCooldownUntil ?? null
        ]
      );
      for (const item of character.inventory ?? []) {
        await connection.execute(
          `INSERT INTO ${table("character_inventory")} (
            character_player_id, instance_id, item_id, quantity, enhancement_level, rarity
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [character.playerId, item.instanceId, item.itemId, item.quantity, item.enhancementLevel ?? null, item.rarity ?? null]
        );
      }
    }

    for (const [sessionToken, playerId] of source.sessions) {
      await connection.execute(`INSERT INTO ${table("sessions")} (session_token, player_id) VALUES (?, ?)`, [sessionToken, playerId]);
    }

    for (const battle of source.battles.values()) {
      await connection.execute(
        `INSERT INTO ${table("battles")} (
          id, mode, status, city_id, participants, turn_participant_id, log, winner_participant_id, created_at, updated_at,
          monarch, arena, death_penalty_applied_player_ids, dungeon
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          battle.id,
          battle.mode,
          battle.status,
          battle.cityId ?? null,
          json(battle.participants ?? []),
          battle.turnParticipantId ?? null,
          json(battle.log ?? []),
          battle.winnerParticipantId ?? null,
          battle.createdAt ?? Date.now(),
          battle.updatedAt ?? Date.now(),
          json(battle.monarch ?? null),
          json(battle.arena ?? null),
          json(battle.deathPenaltyAppliedPlayerIds ?? null),
          json(battle.dungeon ?? null)
        ]
      );
    }

    for (const listing of source.marketplace.values()) {
      await connection.execute(
        `INSERT INTO ${table("market_listings")} (id, seller_player_id, seller_name, item, price, currency, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [listing.id, listing.sellerPlayerId, listing.sellerName, json(listing.item), listing.price, listing.currency, listing.createdAt]
      );
    }

    for (const trade of source.itemTrades.values()) {
      const normalizedTrade = normalizeItemTradeOffer(trade);
      const legacyOfferedItem = normalizedTrade.offeredItem ?? normalizedTrade.offer.items[0] ?? { instanceId: "", itemId: "", quantity: 1 };
      await connection.execute(
        `INSERT INTO ${table("item_trades")} (id, from_player_id, from_name, to_player_id, to_name, offered_item, requested_item_id, requested_quantity, offer_items, offer_gold, counter_items, counter_gold, status, created_at, responded_at, expires_at, resolved_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          normalizedTrade.id,
          normalizedTrade.fromPlayerId,
          normalizedTrade.fromName,
          normalizedTrade.toPlayerId,
          normalizedTrade.toName,
          json(legacyOfferedItem),
          normalizedTrade.requestedItemId ?? "",
          normalizedTrade.requestedQuantity ?? 0,
          json(normalizedTrade.offer.items),
          normalizedTrade.offer.gold,
          json(normalizedTrade.counter.items),
          normalizedTrade.counter.gold,
          normalizedTrade.status,
          normalizedTrade.createdAt,
          normalizedTrade.respondedAt ?? null,
          normalizedTrade.expiresAt ?? null,
          normalizedTrade.resolvedAt ?? null
        ]
      );
    }

    for (const message of source.chatMessages) {
      await connection.execute(
        `INSERT INTO ${table("chat_messages")} (id, player_id, author, text, created_at) VALUES (?, ?, ?, ?, ?)`,
        [message.id, message.playerId, message.author, message.text, message.createdAt]
      );
    }

    for (const [clanId, messages] of source.clanChatMessages) {
      for (const message of messages) {
        await connection.execute(
          `INSERT INTO ${table("clan_chat_messages")} (id, clan_id, player_id, author, text, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
          [message.id, clanId, message.playerId, message.author, message.text, message.createdAt]
        );
      }
    }

    for (const message of source.allPrivateMessages) {
      await connection.execute(
        `INSERT INTO ${table("private_messages")} (id, from_player_id, from_name, to_player_id, to_name, text, created_at, read_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [message.id, message.fromPlayerId, message.fromName, message.toPlayerId, message.toName, message.text, message.createdAt, message.readAt ?? null]
      );
    }

    for (const notification of source.notifications) {
      await connection.execute(
        `INSERT INTO ${table("notifications")} (id, player_id, kind, title, message, created_at, read_at, data)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          notification.id,
          notification.playerId,
          notification.kind,
          notification.title,
          notification.message,
          notification.createdAt,
          notification.readAt ?? null,
          json(notification.data ?? null)
        ]
      );
    }

    for (const [index, playerId] of source.arenaQueue.entries()) {
      await connection.execute(`INSERT INTO ${table("arena_queue")} (position, player_id) VALUES (?, ?)`, [index, playerId]);
    }

    for (const battleId of source.arenaRecordedBattleIds) {
      await connection.execute(`INSERT INTO ${table("arena_recorded_battles")} (battle_id) VALUES (?)`, [battleId]);
    }

    if (source.monarchEvent) {
      const event = source.monarchEvent;
      await connection.execute(
        `INSERT INTO ${table("monarch_event")} (
          id, day_key, monarch_id, name, title, image_url, level, max_hp, current_hp, strength, defense, agility,
          experience, gold, is_king, status, starts_at, ends_at, ended_at, damage_by_player, participant_names,
          attempts_by_player, rewards_granted, reward_log
        ) VALUES ('current', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          event.dayKey,
          event.monarchId,
          event.name,
          event.title,
          event.imageUrl,
          event.level,
          event.maxHp,
          event.currentHp,
          event.strength,
          event.defense,
          event.agility,
          event.experience,
          event.gold,
          event.isKing,
          event.status,
          event.startsAt,
          event.endsAt,
          event.endedAt ?? null,
          json(event.damageByPlayer),
          json(event.participantNames),
          json(event.attemptsByPlayer),
          event.rewardsGranted,
          json(event.rewardLog)
        ]
      );
    }

    for (const [key, value] of [
      ["nextRegenAt", source.nextRegenAt],
      ["arenaSeasonKey", source.arenaSeasonKey],
      ["lastArenaSeason", source.lastArenaSeason]
    ] as Array<[string, unknown]>) {
      await connection.execute(`INSERT INTO ${table("game_meta")} (meta_key, json_value) VALUES (?, ?)`, [
        key,
        json(value)
      ]);
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function loadPersistentStore(target: GameStore = store) {
  if (mysqlEnabled()) {
    await loadMysqlPersistentStore(target);
    console.log(`[persistence] MySQL relacional ativo com prefixo ${MYSQL_TABLE_PREFIX}_`);
    return;
  }

  loadJsonPersistentStore(target);
  console.log(`[persistence] JSON ativo em ${DATA_FILE}`);
}

function saveJsonStoreNow(source: GameStore = store) {
  mkdirSync(dirname(DATA_FILE), { recursive: true });
  const tempFile = `${DATA_FILE}.tmp`;
  const payload = JSON.stringify(toPersistedStore(source), null, 2);

  writeFileSync(tempFile, payload);
  try {
    renameSync(tempFile, DATA_FILE);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;

    if (code === "EPERM" || code === "EACCES" || code === "EBUSY") {
      writeFileSync(DATA_FILE, payload);
      try {
        unlinkSync(tempFile);
      } catch {
        // Best-effort cleanup for temp file.
      }
      return;
    }

    throw error;
  }
}

export async function saveStoreNow(source: GameStore = store) {
  if (mysqlEnabled()) {
    await saveMysqlStoreNow(source);
    return;
  }
  saveJsonStoreNow(source);
}

function enqueueSave(source: GameStore) {
  saveChain = saveChain.catch(() => undefined).then(() => saveStoreNow(source));
  return saveChain;
}

export function persistStoreSoon(source: GameStore = store) {
  if (pendingSave) {
    return;
  }

  pendingSave = setTimeout(() => {
    pendingSave = null;
    void enqueueSave(source).catch((error) => {
      console.error("Failed to persist game state:", error);
    });
  }, 250);
}

export async function flushPersistentStore(source: GameStore = store) {
  if (pendingSave) {
    clearTimeout(pendingSave);
    pendingSave = null;
  }
  await enqueueSave(source);
}

export async function closePersistentStore() {
  if (!mysqlPool) {
    return;
  }
  await mysqlPool.end();
  mysqlPool = null;
}
