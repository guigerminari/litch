import { dirname, join } from "node:path";
import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
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
let pendingSave: NodeJS.Timeout | null = null;

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

export function loadPersistentStore(target: GameStore = store) {
  if (!existsSync(DATA_FILE)) {
    return;
  }

  const persisted = JSON.parse(readFileSync(DATA_FILE, "utf8")) as Partial<PersistedGameStore>;

  target.players = new Map((persisted.players ?? []).map((player) => [player.id, { ...player, email: player.email ?? "" }]));
  target.accountsByEmail = new Map((persisted.accountsByEmail ?? []).map((account) => [account.email, account]));
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

export function saveStoreNow(source: GameStore = store) {
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

export function persistStoreSoon(source: GameStore = store) {
  if (pendingSave) {
    return;
  }

  pendingSave = setTimeout(() => {
    pendingSave = null;
    try {
      saveStoreNow(source);
    } catch (error) {
      console.error("Failed to persist game state:", error);
    }
  }, 250);
}

export function flushPersistentStore(source: GameStore = store) {
  if (pendingSave) {
    clearTimeout(pendingSave);
    pendingSave = null;
  }
  saveStoreNow(source);
}
