import { dirname, join } from "node:path";
import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { createPool, type Pool, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";
import type { ArenaSeasonData, BattleState, Character, ChatMessage, Clan, MarketListing, MonarchEventState, Player, PrivateMessage } from "../shared/types";
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
  chatMessages: ChatMessage[];
  clanChatMessages: Array<[string, ChatMessage[]]>;
  allPrivateMessages: PrivateMessage[];
  arenaQueue: string[];
  arenaRecordedBattleIds: string[];
  nextRegenAt: number;
  monarchEvent: MonarchEventState | null;
  arenaSeasonKey?: string;
  lastArenaSeason?: ArenaSeasonData | null;
}

const DEFAULT_DATA_FILE = join(process.cwd(), "data", "game-state.json");
const DATA_FILE = process.env.LITCH_DATA_FILE ?? DEFAULT_DATA_FILE;
const MYSQL_URL = process.env.MYSQL_DATABASE_URL ?? (process.env.DATABASE_URL?.startsWith("mysql") ? process.env.DATABASE_URL : undefined);
const PERSISTENCE_DRIVER = (process.env.LITCH_PERSISTENCE ?? (MYSQL_URL ? "mysql" : "json")).toLowerCase();
const MYSQL_STATE_TABLE = sanitizeIdentifier(process.env.LITCH_MYSQL_STATE_TABLE ?? "litch_game_state");
const MYSQL_STATE_ID = process.env.LITCH_MYSQL_STATE_ID ?? "default";
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
    chatMessages: source.chatMessages,
    clanChatMessages: Array.from(source.clanChatMessages.entries()),
    allPrivateMessages: source.allPrivateMessages,
    arenaQueue: source.arenaQueue,
    arenaRecordedBattleIds: Array.from(source.arenaRecordedBattleIds.values()),
    nextRegenAt: source.nextRegenAt,
    monarchEvent: source.monarchEvent,
    arenaSeasonKey: source.arenaSeasonKey,
    lastArenaSeason: source.lastArenaSeason
  };
}

function sanitizeIdentifier(value: string) {
  if (!/^[A-Za-z0-9_]+$/.test(value)) {
    throw new Error(`Identificador MySQL inválido: ${value}`);
  }
  return value;
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

async function ensureMysqlSchema() {
  const pool = getMysqlPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS \`${MYSQL_STATE_TABLE}\` (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      version INT NOT NULL,
      saved_at DATETIME(3) NOT NULL,
      payload JSON NOT NULL,
      updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
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
  target.clans = new Map((persisted.clans ?? []).map((clan) => [clan.id, clan]));
  target.marketplace = new Map((persisted.marketplace ?? []).map((listing) => [listing.id, listing]));
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
}

function parseMysqlPayload(value: unknown): Partial<PersistedGameStore> {
  if (!value) {
    return {};
  }
  if (typeof value === "string") {
    return JSON.parse(value) as Partial<PersistedGameStore>;
  }
  if (Buffer.isBuffer(value)) {
    return JSON.parse(value.toString("utf8")) as Partial<PersistedGameStore>;
  }
  return value as Partial<PersistedGameStore>;
}

async function loadMysqlPersistentStore(target: GameStore) {
  await ensureMysqlSchema();
  const [rows] = await getMysqlPool().execute<Array<RowDataPacket & { payload: unknown }>>(
    `SELECT payload FROM \`${MYSQL_STATE_TABLE}\` WHERE id = ? LIMIT 1`,
    [MYSQL_STATE_ID]
  );
  if (rows.length === 0) {
    if (process.env.LITCH_MYSQL_IMPORT_JSON_ON_EMPTY !== "false" && existsSync(DATA_FILE)) {
      loadJsonPersistentStore(target);
      await saveMysqlStoreNow(target);
      console.log(`[persistence] MySQL vazio; estado importado de ${DATA_FILE}`);
    }
    return;
  }
  applyPersistedStore(target, parseMysqlPayload(rows[0].payload));
}

function loadJsonPersistentStore(target: GameStore) {
  if (!existsSync(DATA_FILE)) {
    return;
  }

  const persisted = JSON.parse(readFileSync(DATA_FILE, "utf8")) as Partial<PersistedGameStore>;
  applyPersistedStore(target, persisted);
}

export async function loadPersistentStore(target: GameStore = store) {
  if (mysqlEnabled()) {
    await loadMysqlPersistentStore(target);
    console.log(`[persistence] MySQL ativo em tabela ${MYSQL_STATE_TABLE}:${MYSQL_STATE_ID}`);
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

    // Windows can transiently deny rename while another handle has the target file open.
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

async function saveMysqlStoreNow(source: GameStore = store) {
  await ensureMysqlSchema();
  const persisted = toPersistedStore(source);
  const [result] = await getMysqlPool().execute<ResultSetHeader>(
    `INSERT INTO \`${MYSQL_STATE_TABLE}\` (id, version, saved_at, payload)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       version = VALUES(version),
       saved_at = VALUES(saved_at),
       payload = VALUES(payload)`,
    [MYSQL_STATE_ID, persisted.version, new Date(persisted.savedAt), JSON.stringify(persisted)]
  );
  void result;
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
