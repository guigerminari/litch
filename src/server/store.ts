import type { BattleState, Character, ChatMessage, Clan, MarketListing, Player, PrivateMessage } from "../shared/types";

export interface GameStore {
  players: Map<string, Player>;
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
}

export const store: GameStore = {
  players: new Map(),
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
  nextRegenAt: Date.now() + 2 * 60 * 1000
};
