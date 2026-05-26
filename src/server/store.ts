import type { ArenaSeasonData, BattleState, Character, ChatMessage, Clan, MarketListing, MonarchEventState, Player, PrivateMessage } from "../shared/types";

export interface AuthAccount {
  playerId: string;
  email: string;
  passwordHash: string;
  recoveryCodeHash: string;
  createdAt: number;
  passwordUpdatedAt?: number;
  recoveryCodeUpdatedAt?: number;
  emailVerifiedAt?: number;
  emailVerificationTokenHash?: string;
  emailVerificationTokenExpiresAt?: number;
  passwordResetTokenHash?: string;
  passwordResetTokenExpiresAt?: number;
  passwordResetRequestedAt?: number;
}

export interface GameStore {
  players: Map<string, Player>;
  accountsByEmail: Map<string, AuthAccount>;
  characters: Map<string, Character>;
  sessions: Map<string, string>;
  battles: Map<string, BattleState>;
  clans: Map<string, Clan>;
  marketplace: Map<string, MarketListing>;
  chatMessages: ChatMessage[];
  clanChatMessages: Map<string, ChatMessage[]>;
  allPrivateMessages: PrivateMessage[];
  arenaQueue: string[];
  arenaRecordedBattleIds: Set<string>;
  socketsByPlayer: Map<string, Set<string>>;
  nextRegenAt: number;
  monarchEvent: MonarchEventState | null;
  arenaSeasonKey: string;
  lastArenaSeason: ArenaSeasonData | null;
}

export const store: GameStore = {
  players: new Map(),
  accountsByEmail: new Map(),
  characters: new Map(),
  sessions: new Map(),
  battles: new Map(),
  clans: new Map(),
  marketplace: new Map(),
  chatMessages: [],
  clanChatMessages: new Map(),
  allPrivateMessages: [],
  arenaQueue: [],
  arenaRecordedBattleIds: new Set(),
  socketsByPlayer: new Map(),
  nextRegenAt: Date.now() + 2 * 60 * 1000,
  monarchEvent: null,
  arenaSeasonKey: "",
  lastArenaSeason: null
};
