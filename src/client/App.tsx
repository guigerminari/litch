import { createContext, FormEvent, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeftRight,
  Backpack,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Coins,
  Copy,
  Crown,
  BriefcaseBusiness,
  ChevronDown,
  ChevronRight,
  Flame,
  FlaskConical,
  Gavel,
  Gem,
  Hammer,
  Heart,
  Info,
  KeyRound,
  Lock,
  LogIn,
  LogOut,
  Mail,
  MapPinned,
  MessageCircle,
  ScrollText,
  Send,
  Settings,
  Ship,
  Skull,
  Sparkles,
  Star,
  Shield,
  ShoppingBag,
  Swords,
  Trophy,
  User,
  UserPlus,
  Users,
  X,
  Zap,
  Crosshair,
  PencilRuler
} from "lucide-react";
import type {
  AttributeKey,
  Attributes,
  AvatarDefinition,
  AvatarIcon,
  BattleLogEntry,
  BattleParticipant,
  ChatMessage,
  ClanRankingEntry,
  ClanSummary,
  Currency,
  GameState,
  InventoryItem,
  ItemDefinition,
  ItemKind,
  ItemStats,
  MarketListing,
  MarketTransactionHistory,
  PrivateMessage,
  PlayerPublicProfile,
  ClanBenefitCategory,
  TalentCategory,
  QuestView,
  QuestCategory,
  CraftingRecipe,
  Rarity,
  TalentDefinition,
  TemporaryEventBonusDefinition,
  WorkReward,
  WorkServiceDefinition
} from "../shared/types";
import { RARITY_CHANCES, RARITY_PRICE_MULTIPLIER, RARITY_STAT_MULTIPLIER } from "../shared/rarity";
import { experienceForNextLevel } from "../shared/progression";
import { ATTRIBUTE_LABEL, EQUIPMENT_LABEL, MONARCH_BATTLE_ATTACK_LIMIT } from "../shared/types";
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
  calculateWorkReward,
  getDefaultWorkAptitude,
  getHoursForNextWorkLevel,
  isWorkInProgress,
  isWorkReady,
  normalizeWorkMinutes
} from "../shared/work";
import { formatTemporaryEventBonusPercent } from "../shared/temporaryEvents";
import { CLAN_CRESTS, getClanCrestDefinition, normalizeClanCrestId, type ClanCrestId } from "../shared/clan";
import { CRAFTING_RECIPES } from "../server/content";
import { socket } from "./socket";

type View =
  | "city"
  | "hunt"
  | "arena"
  | "armorer"
  | "apothecary"
  | "moneyChanger"
  | "goldCoinMerchant"
  | "agency"
  | "travel"
  | "inventory"
  | "market"
  | "missions"
  | "blacksmith"
  | "alchemist"
  | "dungeon"
  | "monarch"
  | "rankings"
  | "gameShop"
  | "clan";

type AuthMode = "login" | "register" | "forgot" | "reset";

type BattleAnimationCue = {
  kind: "damage" | "dodge";
  attackerId: string;
  defenderId: string;
  damage?: number;
  critical?: boolean;
  sequence: number;
};

type BattleVisualEvent = {
  entry: BattleLogEntry;
  cue: Omit<BattleAnimationCue, "sequence"> | null;
};

type BattleHpChange = {
  participantId: string;
  delta: number;
};

type QuickPotionSlot = "health" | "energy";

type QuickPotionPreferences = Record<QuickPotionSlot, string>;

type PotionQuickOption = {
  itemId: string;
  definition: ItemDefinition;
  inventoryItem: InventoryItem;
  quantity: number;
};

type InventorySlotEntry = {
  instanceId: string;
  itemId: string;
  quantity: number;
  enhancementLevel?: number;
  rarity?: Rarity;
};

type FirstClickNoticeKey = "exchange" | "diamonds" | "ranking" | "guide";

const BATTLE_CUE_DURATION_MS = 680;
const BATTLE_LOG_STEP_MS = 280;
const BATTLE_RESULT_PAUSE_MS = 420;
const QUICK_POTION_STORAGE_KEY = "litch:quick-potions";
const FIRST_CLICK_NOTICE_STORAGE_PREFIX = "litch:first-click-notice";
const DEFAULT_QUICK_POTION_PREFERENCES: QuickPotionPreferences = {
  health: "",
  energy: ""
};
const FIRST_CLICK_NOTICE_KEYS: FirstClickNoticeKey[] = ["exchange", "diamonds", "ranking", "guide"];

type GameIconName =
  | "agency"
  | "alchemist"
  | "apothecary"
  | "arena"
  | "armorer"
  | "blacksmith"
  | "city"
  | "clan"
  | "dungeon"
  | "goldCoinMerchant"
  | "hunt"
  | "inventory"
  | "market"
  | "missions"
  | "monarch"
  | "moneyChanger"
  | "ship"
  | "train"
  | "travel"
  | "pin"
  | "faq"
  | "history"
  | "dev"
  | "stats"
  | "craft";

const GAME_ICON_SRC: Record<GameIconName, string> = {
  agency: "/assets/icons/agency.png",
  alchemist: "/assets/icons/alchemist.png",
  apothecary: "/assets/icons/apothecary.png",
  arena: "/assets/icons/arena.png",
  armorer: "/assets/icons/armorer.png",
  blacksmith: "/assets/icons/blacksmith.png",
  city: "/assets/icons/city.png",
  clan: "/assets/icons/clan.png",
  dungeon: "/assets/icons/dungeon.png",
  goldCoinMerchant: "/assets/icons/goldCoinMerchant.png",
  hunt: "/assets/icons/hunt.png",
  inventory: "/assets/icons/inventory.png",
  market: "/assets/icons/market.png",
  missions: "/assets/icons/missions.png",
  monarch: "/assets/icons/monarch.png",
  moneyChanger: "/assets/icons/moneyChanger.png",
  ship: "/assets/icons/ship.png",
  train: "/assets/icons/train.png",
  travel: "/assets/icons/travel.png",
  pin: "/assets/icons/pin.png",
  dev: "/assets/icons/dev.png",
  faq: "/assets/icons/faq.png",
  history: "/assets/icons/history.png",
  stats: "/assets/icons/stats.png",
  craft: "/assets/icons/craft.png"
};

const TRAVEL_MAP_POINTS: Record<string, { x: number; y: number }> = {
  eldoria: { x: 25, y: 55.5 },
  ravenspire: { x: 36.5, y: 41.5 },
  ironhold: { x: 29.5, y: 13.5 },
  vila_de_valfria: { x: 31.5, y: 75.5 },
  kheredu: { x: 50, y: 65.5 },
  rosindale: { x: 63.5, y: 75.5 },
  porto_sombrio: { x: 55.5, y: 28 },
  necropole_de_morthaly: { x: 74.5, y: 33 }
};

const TRAVEL_COUNTRY_LABELS: Record<string, { x: number; y: number }> = {
  aurevia: { x: 23, y: 40 },
  valfria: { x: 49, y: 87 },
  morthaly: { x: 77, y: 18 }
};

const CITY_HUNT_MAP_IMAGE_BY_CITY: Record<string, string> = {
  eldoria: "/assets/locals/city/aurevia_euroria.png",
  ravenspire: "/assets/locals/city/aurevia_ravenspire.png",
  ironhold: "/assets/locals/city/aurevia_ironhold.png",
  vila_de_valfria: "/assets/locals/city/valfria_vila_de_valfria.png",
  kheredu: "/assets/locals/city/valfria_kheredu.png",
  rosindale: "/assets/locals/city/valfria_rosindale.png",
  porto_sombrio: "/assets/locals/city/morthaly_porto_sombrio.png",
  necropole_de_morthaly: "/assets/locals/city/morthay_necropole.png"
};

const CITY_HUNT_MAP_POINT_BY_LOCATION: Record<string, { x: number; y: number }> = {
  eldoria_training_fields: { x: 19, y: 75 },
  eldoria_old_woods: { x: 80, y: 30 },
  eldoria_sunken_ruins: { x: 86, y: 78 },
  ravenspire_bandit_road: { x: 22, y: 69 },
  ravenspire_damned_lands: { x: 82, y: 73 },
  ravenspire_desert_pass: { x: 88, y: 23 },
  ironhold_ember_mines: { x: 12, y: 56 },
  ironhold_beast_caves: { x: 57, y: 79 },
  ironhold_giant_valley: { x: 85, y: 67 },
  valfria_orc_marsh: { x: 32, y: 80 },
  valfria_bone_fields: { x: 21, y: 33 },
  valfria_spectral_mire: { x: 86, y: 28 },
  kheredu_scarab_labyrinth: { x: 35, y: 75 },
  kheredu_bronze_kings_forge: { x: 70, y: 60 },
  kheredu_tears_of_isis_aqueduct: { x: 27, y: 35 },
  rosindale_infected_coast: { x: 22, y: 33 },
  rosindale_zombie_quarter: { x: 87, y: 72 },
  morthaly_black_docks: { x: 62, y: 80 },
  morthaly_tide_catacombs: { x: 16, y: 58 },
  morthaly_wailing_breakwater: { x: 85, y: 50 },
  morthaly_runic_wastes: { x: 26, y: 56 },
  morthaly_lich_spire: { x: 58, y: 22 },
  morthaly_ossuary_labs: { x: 28, y: 80 },
  morthaly_violet_apex: { x: 78, y: 46 }
};

const viewLabels: Record<View, string> = {
  city: "Cidade",
  hunt: "Caçar",
  arena: "Arena",
  armorer: "Armeiro",
  apothecary: "Boticário",
  moneyChanger: "Cambista",
  goldCoinMerchant: "Mercador",
  agency: "Agência",
  travel: "Viajar",
  inventory: "Inventário",
  market: "Mercado",
  missions: "Missões",
  blacksmith: "Ferreiro",
  alchemist: "Alquimista",
  dungeon: "Masmorra",
  monarch: "Monarca",
  rankings: "Ranking",
  gameShop: "Loja do Jogo",
  clan: "Clã"
};

const attributes: AttributeKey[] = ["strength", "constitution", "agility"];
const ATTRIBUTE_RELEVANCE: Record<AttributeKey, string> = {
  strength: "Aumenta o impacto dos ataques e ajuda a encerrar combates mais rápido.",
  constitution: "Aumenta sua sobrevivência e ajuda a resistir a acertos críticos.",
  agility: "Melhora crítico, dano crítico, precisão, esquiva e resistência crítica."
};
const QUEST_FILTER_LABELS: Record<QuestCategory | "all", string> = {
  all: "Todas",
  combat: "Combate",
  work: "Trabalho",
  monarch: "Monarcas",
  arena: "Arena",
  enhancement: "Aprimoramento",
  market: "Mercado",
  shop: "Lojas",
  potion: "Poções",
  level: "Nível"
};
const ITEM_KIND_LABELS: Record<ItemKind, string> = {
  weapon: "Arma",
  armor: "Armadura",
  amulet: "Amuleto",
  potion: "Poção",
  material: "Material",
  scroll: "Pergaminho",
  ticket: "Ticket",
  misc: "Diverso"
};

const ITEM_KIND_EMOJI: Record<ItemKind, string> = {
  weapon: "⚔️",
  armor: "🛡️",
  amulet: "📿",
  potion: "🧪",
  material: "📦",
  scroll: "📜",
  ticket: "Ticket",
  misc: "✦"
};

const RARITY_LABELS: Record<Rarity, string> = {
  common: "Comum",
  uncommon: "Incomum",
  rare: "Raro",
  epic: "Épico",
  legendary: "Lendário"
};

const RARITY_COLORS: Record<Rarity, string> = {
  common: "#9ca3af",
  uncommon: "#10b981",
  rare: "#fbff00",
  epic: "#8b5cf6",
  legendary: "#ff9102"
};

const ENHANCEMENT_STAT_STEP = 0.2;
const TRAIN_TICKET_ID = "ticket_train";
const SHIP_TICKET_ID = "ticket_ship";
const MEMORY_SCROLL_ID = "memory_scroll";
const OBLIVION_SCROLL_ID = "oblivion_scroll";
const ATTRIBUTE_RESET_DIAMOND_COST = 20;
const TALENT_RESET_DIAMOND_COST = 25;
const AVATAR_OPTIONS_SEEN_STORAGE_PREFIX = "litch:avatar-options-seen";
const BRAND_ICON_URL = "/assets/brand/litch-logo-square-512x512.png";
const BRAND_WORDMARK_URL = "/assets/brand/litch-1500x1500.png";
const EQUIPMENT_STAT_LABELS: Partial<Record<keyof ItemStats, string>> = {
  strength: "Força",
  constitution: "Constituição",
  agility: "Agilidade",
  defense: "Defesa"
};
const EQUIPMENT_STAT_KEYS: Array<keyof typeof EQUIPMENT_STAT_LABELS> = ["strength", "constitution", "agility", "defense"];

type PlayerReference = {
  playerId: string;
  name: string;
};

type PlayerActionContextValue = {
  currentPlayerId: string;
  openPlayerActions: (player: PlayerReference) => void;
};

type QuickPotionContextValue = {
  preferences: QuickPotionPreferences;
  setPreference: (slot: QuickPotionSlot, itemId: string) => void;
};

const PlayerActionContext = createContext<PlayerActionContextValue | null>(null);
const QuickPotionContext = createContext<QuickPotionContextValue | null>(null);

function usePlayerActions() {
  return useContext(PlayerActionContext);
}

function useQuickPotionSettings() {
  const context = useContext(QuickPotionContext);
  if (!context) {
    return {
      preferences: DEFAULT_QUICK_POTION_PREFERENCES,
      setPreference: () => {}
    };
  }
  return context;
}

function readQuickPotionPreferences(): QuickPotionPreferences {
  try {
    const stored = localStorage.getItem(QUICK_POTION_STORAGE_KEY);
    if (!stored) {
      return DEFAULT_QUICK_POTION_PREFERENCES;
    }
    const parsed = JSON.parse(stored) as Partial<QuickPotionPreferences>;
    return {
      health: typeof parsed.health === "string" ? parsed.health : "",
      energy: typeof parsed.energy === "string" ? parsed.energy : ""
    };
  } catch {
    return DEFAULT_QUICK_POTION_PREFERENCES;
  }
}

function getFirstClickNoticeStorageKey(playerId: string, key: FirstClickNoticeKey) {
  return `${FIRST_CLICK_NOTICE_STORAGE_PREFIX}:${playerId}:${key}`;
}

function readFirstClickNoticeSeen(playerId: string) {
  return FIRST_CLICK_NOTICE_KEYS.reduce<Record<FirstClickNoticeKey, boolean>>((seen, key) => {
    try {
      seen[key] = localStorage.getItem(getFirstClickNoticeStorageKey(playerId, key)) === "1";
    } catch {
      seen[key] = false;
    }
    return seen;
  }, { exchange: false, diamonds: false, ranking: false, guide: false });
}

function markFirstClickNoticeSeen(playerId: string, key: FirstClickNoticeKey) {
  try {
    localStorage.setItem(getFirstClickNoticeStorageKey(playerId, key), "1");
  } catch {
    // Local storage can be unavailable in private browsing or strict embeds.
  }
}

export function App() {
  const [game, setGame] = useState<GameState | null>(null);
  const [quickPotionPreferences, setQuickPotionPreferences] = useState<QuickPotionPreferences>(readQuickPotionPreferences);
  const [firstClickNoticeSeen, setFirstClickNoticeSeen] = useState<Record<FirstClickNoticeKey, boolean>>({
    exchange: false,
    diamonds: false,
    ranking: false,
    guide: false
  });
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordResetToken, setPasswordResetToken] = useState("");
  const [view, setView] = useState<View>("city");
  const [utilityModal, setUtilityModal] = useState<"settings" | "guide" | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(socket.connected);
  const [showDetails, setShowDetails] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showExchange, setShowExchange] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerReference | null>(null);
  const [privateChatTarget, setPrivateChatTarget] = useState<PlayerReference | null>(null);
  const [playerProfiles, setPlayerProfiles] = useState<Record<string, PlayerPublicProfile>>({});
  const [loadingPlayerProfileId, setLoadingPlayerProfileId] = useState<string | null>(null);
  const [regenMs, setRegenMs] = useState(0);

  const setViewSafely = useCallback((nextView: View) => {
    if (game?.character.dungeonProgress?.activeRun && nextView !== "dungeon") {
      setError("Finalize o andar da masmorra antes de navegar para outra área.");
      window.setTimeout(() => setError(null), 3200);
      return;
    }
    setView(nextView);
  }, [game]);

  useEffect(() => {
    const resume = () => {
      setConnected(true);
      const token = localStorage.getItem("litch:session");
      if (token) {
        socket.emit("auth:resume", token);
      }
    };

    const onAuthOk = (payload: { sessionToken: string }) => {
      localStorage.setItem("litch:session", payload.sessionToken);
      setPassword("");
      setInviteCode("");
      setNewPassword("");
      setPasswordResetToken("");
    };

    const onAuthLogout = () => {
      localStorage.removeItem("litch:session");
      setGame(null);
      setAuthMode("login");
    };

    const onGameState = (state: GameState) => {
      setGame(state);
    };

    const onPlayerProfile = (profile: PlayerPublicProfile) => {
      setPlayerProfiles((current) => ({ ...current, [profile.playerId]: profile }));
      setLoadingPlayerProfileId((current) => (current === profile.playerId ? null : current));
    };

    const onPasswordChanged = () => {
      setNotice("Senha alterada com sucesso.");
      window.setTimeout(() => setNotice(null), 3200);
    };

    const onDeveloperMessageOk = () => {
      setNotice("Mensagem enviada ao desenvolvedor.");
      window.setTimeout(() => setNotice(null), 3200);
    };

    const onAuthNotice = (payload: { message: string; mode?: AuthMode }) => {
      setNotice(payload.message);
      if (payload.mode) {
        setAuthMode(payload.mode);
      }
      setPassword("");
      setNewPassword("");
      window.setTimeout(() => setNotice(null), 5200);
    };

    const onError = (payload: { message: string }) => {
      setError(payload.message);
      setLoadingPlayerProfileId(null);
      if (payload.message.toLowerCase().includes("sess")) {
        localStorage.removeItem("litch:session");
        setGame(null);
      }
      window.setTimeout(() => setError(null), 3200);
    };

    const onDisconnect = () => setConnected(false);

    socket.on("connect", resume);
    socket.on("disconnect", onDisconnect);
    socket.on("auth:ok", onAuthOk);
    socket.on("auth:logout", onAuthLogout);
    socket.on("game:state", onGameState);
    socket.on("player:profile", onPlayerProfile);
    socket.on("account:passwordChanged", onPasswordChanged);
    socket.on("developer:message:ok", onDeveloperMessageOk);
    socket.on("auth:notice", onAuthNotice);
    socket.on("game:error", onError);

    if (socket.connected) {
      resume();
    }

    return () => {
      socket.off("connect", resume);
      socket.off("disconnect", onDisconnect);
      socket.off("auth:ok", onAuthOk);
      socket.off("auth:logout", onAuthLogout);
      socket.off("game:state", onGameState);
      socket.off("player:profile", onPlayerProfile);
      socket.off("account:passwordChanged", onPasswordChanged);
      socket.off("developer:message:ok", onDeveloperMessageOk);
      socket.off("auth:notice", onAuthNotice);
      socket.off("game:error", onError);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verifyEmailToken = params.get("verifyEmail");
    const resetToken = params.get("resetPassword");
    if (!verifyEmailToken && !resetToken) {
      return;
    }

    if (verifyEmailToken) {
      setNotice("Confirmando e-mail...");
      socket.emit("auth:verifyEmail", { token: verifyEmailToken });
      setAuthMode("login");
    }
    if (resetToken) {
      setPasswordResetToken(resetToken);
      setAuthMode("reset");
      setNotice("Link de redefinição carregado. Defina sua nova senha.");
    }
    window.history.replaceState({}, document.title, window.location.pathname);
  }, []);

  useEffect(() => {
    if (!game) return;
    const update = () => setRegenMs(Math.max(0, game.nextRegenAt - Date.now()));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [game?.nextRegenAt]);

  useEffect(() => {
    localStorage.setItem(QUICK_POTION_STORAGE_KEY, JSON.stringify(quickPotionPreferences));
  }, [quickPotionPreferences]);

  useEffect(() => {
    if (!game) {
      return;
    }
    setFirstClickNoticeSeen(readFirstClickNoticeSeen(game.player.id));
  }, [game?.player.id]);

  const submitAuth = (event: FormEvent) => {
    event.preventDefault();
    if (authMode === "login") {
      socket.emit("auth:login", { email, password });
      return;
    }
    if (authMode === "register") {
      socket.emit("auth:register", { username, email, password, inviteCode });
      return;
    }
    if (authMode === "forgot") {
      socket.emit("auth:forgotPassword", { email });
      return;
    }
    socket.emit("auth:resetPassword", { token: passwordResetToken, newPassword });
  };

  const logout = () => {
    const token = localStorage.getItem("litch:session");
    socket.emit("auth:logout", token ?? "");
    localStorage.removeItem("litch:session");
    setGame(null);
    setAuthMode("login");
  };

  const setQuickPotionPreference = (slot: QuickPotionSlot, itemId: string) => {
    setQuickPotionPreferences((current) => ({ ...current, [slot]: itemId }));
  };

  const canSubmitAuth =
    connected &&
    (authMode === "reset" || email.trim().length > 0) &&
    (authMode === "forgot" ? true : authMode === "reset" ? passwordResetToken.length > 0 && newPassword.length >= 6 : password.length >= 6) &&
    (authMode !== "register" || username.trim().length >= 3);

  if (!game) {
    return (
      <main className="auth-screen" style={{ backgroundColor:"#020007" }}>
        <form className="auth-panel" style={{ border: "none", boxShadow: "none"}} onSubmit={submitAuth}>
          <h1 className="sr-only">Litch RPG</h1>
          <img className="auth-wordmark" src={BRAND_WORDMARK_URL} alt="Litch RPG" />
          <div className="auth-tabs">
            <button type="button" className={authMode === "login" ? "active" : ""} onClick={() => setAuthMode("login")}>
              <LogIn size={15} /> Entrar
            </button>
            <button type="button" className={authMode === "register" ? "active" : ""} onClick={() => setAuthMode("register")}>
              <UserPlus size={15} /> Registrar
            </button>
            <button type="button" className={authMode === "forgot" ? "active" : ""} onClick={() => setAuthMode("forgot")}>
              <KeyRound size={15} /> Senha
            </button>
            {authMode === "reset" && (
              <button type="button" className="active">
                <Lock size={15} /> Redefinir
              </button>
            )}
          </div>
          {authMode === "register" && (
            <label>
              <span className="auth-label"><User size={15} /> Nome do recruta</span>
              <input
                value={username}
                maxLength={24}
                autoComplete="username"
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Ex: Arthen"
              />
            </label>
          )}
          {authMode === "register" && (
            <label>
              <span className="auth-label"><UserPlus size={15} /> Código de convite</span>
              <input
                value={inviteCode}
                maxLength={24}
                autoComplete="off"
                onChange={(event) => setInviteCode(event.target.value)}
                placeholder="Opcional"
              />
            </label>
          )}
          {authMode !== "reset" && (
            <label>
              <span className="auth-label"><Mail size={15} /> E-mail</span>
              <input
                type="email"
                value={email}
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seu@email.com"
              />
            </label>
          )}
          {authMode === "forgot" ? (
            <p className="auth-hint">Informe seu e-mail para receber um link seguro de redefinição. O código fica oculto no link.</p>
          ) : authMode === "reset" ? (
            <>
              <label>
                <span className="auth-label"><Lock size={15} /> Nova senha</span>
                <input
                  type="password"
                  value={newPassword}
                  minLength={6}
                  autoComplete="new-password"
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="Mínimo de 6 caracteres"
                />
              </label>
            </>
          ) : (
            <label>
              <span className="auth-label"><Lock size={15} /> Senha</span>
              <input
                type="password"
                value={password}
                minLength={6}
                autoComplete={authMode === "register" ? "new-password" : "current-password"}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Mínimo de 6 caracteres"
              />
            </label>
          )}
          <button className="primary-button" type="submit" disabled={!canSubmitAuth}>
            {authMode === "login" ? "Entrar" : authMode === "register" ? "Criar conta" : authMode === "forgot" ? "Enviar link" : "Redefinir senha"}
          </button>
          <span className={connected ? "status-dot online" : "status-dot"}>{connected ? "Online" : "Conectando"}</span>
        </form>
        {notice && <Toast message={notice} kind="success" />}
        {error && <Toast message={error} />}
      </main>
    );
  }

  const gameShellClass = `game-shell country-${game.currentCountry.id} city-${game.currentCity.id}`;
  const openPlayerActions = (player: PlayerReference) => {
    if (!player.playerId || player.playerId === "system" || player.playerId === game.player.id) {
      return;
    }
    setSelectedPlayer(player);
    if (!playerProfiles[player.playerId]) {
      setLoadingPlayerProfileId(player.playerId);
      socket.emit("player:inspect", { playerId: player.playerId });
    }
  };
  const inspectPlayer = (player: PlayerReference) => {
    setLoadingPlayerProfileId(player.playerId);
    socket.emit("player:inspect", { playerId: player.playerId });
  };
  const startPrivateChat = (player: PlayerReference) => {
    setPrivateChatTarget(player);
    setShowChat(true);
    setSelectedPlayer(null);
  };
  const clearFirstClickNotice = (key: FirstClickNoticeKey) => {
    markFirstClickNoticeSeen(game.player.id, key);
    setFirstClickNoticeSeen((current) => ({ ...current, [key]: true }));
  };

  return (
    <main className={gameShellClass}>
      <QuickPotionContext.Provider value={{ preferences: quickPotionPreferences, setPreference: setQuickPotionPreference }}>
        <PlayerActionContext.Provider value={{ currentPlayerId: game.player.id, openPlayerActions }}>
        <Header
          game={game}
          regenMs={regenMs}
          onDetails={() => setShowDetails(true)}
          onGameShop={() => {
            clearFirstClickNotice("diamonds");
            setViewSafely("gameShop");
          }}
          onExchange={() => {
            clearFirstClickNotice("exchange");
            setShowExchange(true);
          }}
          onRanking={() => {
            clearFirstClickNotice("ranking");
            setViewSafely("rankings");
          }}
          onSettings={() => setUtilityModal("settings")}
          onGuide={() => {
            clearFirstClickNotice("guide");
            setUtilityModal("guide");
          }}
          onLogout={logout}
          firstClickNotices={{
            exchange: !firstClickNoticeSeen.exchange,
            diamonds: !firstClickNoticeSeen.diamonds,
            ranking: !firstClickNoticeSeen.ranking,
            guide: !firstClickNoticeSeen.guide
          }}
        />
        <div className={game.activeBattle ? "game-grid in-battle" : "game-grid"}>
          <section className="city-stage">
            {!game.activeBattle && view === "city" && <CityHero game={game} view={view} setView={setViewSafely} />}
            <GamePane game={game} view={view} setView={setViewSafely} />
          </section>
        </div>
        <BottomNav game={game} view={view} setView={setViewSafely} />
        <FloatingChat
          game={game}
          open={showChat}
          setOpen={setShowChat}
          privateTarget={privateChatTarget}
          setPrivateTarget={setPrivateChatTarget}
        />
        <FloatingAgencyNotice game={game} onOpenAgency={() => setViewSafely("agency")} />
        <FloatingEvents game={game} open={showEvents} setOpen={setShowEvents} />
        {showDetails && <CharacterDrawer game={game} onClose={() => setShowDetails(false)} />}
        {showExchange && <CurrencyExchangeModal game={game} onClose={() => setShowExchange(false)} />}
        {utilityModal === "settings" && <SettingsModal game={game} onClose={() => setUtilityModal(null)} />}
        {utilityModal === "guide" && <GuideModal game={game} onClose={() => setUtilityModal(null)} />}
        {selectedPlayer && (
          <PlayerActionModal
            player={selectedPlayer}
            profile={playerProfiles[selectedPlayer.playerId]}
            avatarCatalog={game.avatarCatalog}
            itemCatalog={game.itemCatalog}
            loading={loadingPlayerProfileId === selectedPlayer.playerId}
            onInspect={() => inspectPlayer(selectedPlayer)}
            onMessage={() => startPrivateChat(selectedPlayer)}
            onDuel={() => {
              socket.emit("arena:duel", { playerId: selectedPlayer.playerId });
              setSelectedPlayer(null);
            }}
            onClose={() => setSelectedPlayer(null)}
          />
        )}
        {notice && <Toast message={notice} kind="success" />}
        {error && <Toast message={error} />}
        </PlayerActionContext.Provider>
      </QuickPotionContext.Provider>
    </main>
  );
}

function PlayerName({ playerId, name, className }: PlayerReference & { className?: string }) {
  const actions = usePlayerActions();
  if (!actions || !playerId || playerId === "system" || playerId === actions.currentPlayerId) {
    return <span className={className}>{name}</span>;
  }

  return (
    <button
      type="button"
      className={className ? `player-name-link ${className}` : "player-name-link"}
      onClick={(event) => {
        event.stopPropagation();
        actions.openPlayerActions({ playerId, name });
      }}
    >
      {name}
    </button>
  );
}

function GameIcon({ name, size = 24, className = "", alt = "" }: { name: GameIconName; size?: number; className?: string; alt?: string }) {
  return (
    <img
      className={className ? `game-icon ${className}` : "game-icon"}
      src={GAME_ICON_SRC[name]}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      loading="lazy"
      decoding="async"
      style={{ "--game-icon-size": `${size}px` } as React.CSSProperties}
    />
  );
}

function FloatingAgencyNotice({ game, onOpenAgency }: { game: GameState; onOpenAgency: () => void }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const activeWorkReady = isWorkReady(game.character.activeWork, now);
  const readyBonuses = getClaimableWorkBonuses(game, now);
  const totalRewards = (activeWorkReady ? 1 : 0) + readyBonuses.length;

  if (totalRewards <= 0 || typeof document === "undefined") {
    return null;
  }

  const detail =
    activeWorkReady && readyBonuses.length > 0
      ? "Serviço e bônus disponíveis"
      : activeWorkReady
        ? "Serviço concluído"
        : readyBonuses.length === 1
          ? "Bônus de aptidão disponível"
          : `${readyBonuses.length} bônus de aptidão disponíveis`;

  return createPortal(
    <div className={`floating-agency-layer country-${game.currentCountry.id}${game.activeBattle ? " in-battle" : ""}`}>
      <button className="floating-agency-button" type="button" onClick={onOpenAgency}>
        <span className="floating-agency-icon">
          <GameIcon name="agency" size={30} />
        </span>
        <span>
          <strong>Ir à Agência</strong>
          <small>{detail}</small>
        </span>
        {totalRewards > 1 && <b>{totalRewards}</b>}
      </button>
    </div>,
    document.body
  );
}

function FloatingEvents({
  game,
  open,
  setOpen
}: {
  game: GameState;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const activeEvents = game.activeEvents ?? [];
  if (activeEvents.length === 0 || typeof document === "undefined") {
    return null;
  }

  const primaryEvent = activeEvents[0];
  const content = (
    <div className="floating-event-layer">
      {open && (
        <button
          className="floating-event-backdrop"
          type="button"
          aria-label="Fechar detalhes dos eventos"
          onClick={() => setOpen(false)}
        />
      )}
      <button className="floating-event-button" type="button" title="Eventos ativos" onClick={() => setOpen(!open)}>
        {primaryEvent.iconUrl ? <img src={primaryEvent.iconUrl} alt="" /> : <Sparkles size={22} />}
        {activeEvents.length > 1 && <span>{activeEvents.length}</span>}
      </button>
      {open && (
        <aside className="floating-event-panel" role="dialog" aria-label="Eventos temporários">
          <div className="floating-event-header">
            <div>
              <span className="eyebrow">Eventos temporários</span>
              <h2>{activeEvents.length === 1 ? "Evento ativo" : `${activeEvents.length} eventos ativos`}</h2>
            </div>
            <button className="floating-event-close" type="button" title="Fechar eventos" onClick={() => setOpen(false)}>
              <X size={16} />
            </button>
          </div>
          <div className="floating-event-list">
            {activeEvents.map((event) => (
              <TemporaryEventBanner event={event} key={event.id} />
            ))}
          </div>
        </aside>
      )}
    </div>
  );

  return createPortal(content, document.body);
}

function TemporaryEventBanner({ event }: { event: GameState["activeEvents"][number] }) {
  return (
    <article
      className="temporary-event-banner"
      style={{ "--event-accent": event.accentColor ?? "#9D6BFF" } as React.CSSProperties}
    >
      {event.bannerImageUrl && <img className="temporary-event-watermark" src={event.bannerImageUrl} alt="" />}
      <div className="temporary-event-content">
        <span className="eyebrow">Evento</span>
        <h3>{event.name}</h3>
        {event.subtitle && <strong>{event.subtitle}</strong>}
        <p>{event.description}</p>
        <div className="temporary-event-bonuses">
          {event.bonuses.flatMap((bonus, index) => renderTemporaryEventBonusChips(bonus, index))}
        </div>
        <small>Ativo até {formatTemporaryEventDate(event.endsAtMs)}</small>
      </div>
    </article>
  );
}

function renderTemporaryEventBonusChips(bonus: TemporaryEventBonusDefinition, index: number) {
  const chips = [
    <span className="scope" key={`scope-${index}`}>
      {formatTemporaryEventScope(bonus.scope)}
    </span>
  ];

  if (bonus.xpBonusPercent) {
    chips.push(<span key={`xp-${index}`}>XP {formatTemporaryEventBonusPercent(bonus.xpBonusPercent)}</span>);
  }
  if (bonus.goldBonusPercent) {
    chips.push(<span key={`gold-${index}`}>Ouro {formatTemporaryEventBonusPercent(bonus.goldBonusPercent)}</span>);
  }
  if (bonus.dropChanceBonusPercent) {
    chips.push(<span key={`drop-${index}`}>Drop {formatTemporaryEventBonusPercent(bonus.dropChanceBonusPercent)}</span>);
  }
  if (bonus.rewardMultiplier && bonus.rewardMultiplier !== 1) {
    chips.push(<span key={`reward-${index}`}>Recompensas x{bonus.rewardMultiplier}</span>);
  }

  return chips;
}

function formatTemporaryEventScope(scope: TemporaryEventBonusDefinition["scope"]) {
  if (scope === "hunt") return "Caçadas";
  if (scope === "dungeon") return "Masmorras";
  if (scope === "monarch") return "Monarcas";
  return "Todo o jogo";
}

function formatTemporaryEventDate(timestamp: number) {
  if (!timestamp) return "data indefinida";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(timestamp));
}

function PlayerActionModal({
  player,
  profile,
  avatarCatalog,
  itemCatalog,
  loading,
  onInspect,
  onMessage,
  onDuel,
  onClose
}: {
  player: PlayerReference;
  profile?: PlayerPublicProfile;
  avatarCatalog: AvatarDefinition[];
  itemCatalog: Record<string, ItemDefinition>;
  loading: boolean;
  onInspect: () => void;
  onMessage: () => void;
  onDuel: () => void;
  onClose: () => void;
}) {
  const royalFriendUntil = Math.max(profile?.pveAutoUntil ?? 0, profile?.royalSealUntil ?? 0);

  return (
    <div className="drawer-backdrop" role="presentation" onClick={onClose}>
      <div className="player-action-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <button className="close-button" title="Fechar" onClick={onClose}>
          <X size={18} />
        </button>
        <div className="player-action-header">
          <CharacterAvatar
            avatar={avatarCatalog.find((avatar) => avatar.id === profile?.avatarId) ?? avatarCatalog[0]}
            size={58}
            royal={royalFriendUntil > Date.now()}
            className="player-action-avatar"
          />
          <div>
            <span className="eyebrow">Recruta</span>
            <h2>{profile?.name ?? player.name}</h2>
            {profile ? (
              <small>Nível {profile.level} - {profile.online ? "Online" : "Offline"} - {profile.cityName}, {profile.countryName}</small>
            ) : (
              <small>{loading ? "Carregando perfil..." : "Perfil público"}</small>
            )}
          </div>
        </div>
        <div className="player-action-buttons">
          <button className="primary-button" onClick={onMessage}>
            <MessageCircle size={15} /> Mensagem privada
          </button>
          <button className="ghost-button" onClick={onDuel} disabled={!profile?.online}>
            <Swords size={16} /> Convidar para duelo
          </button>
        </div>
        {profile && (
          <>
            {royalFriendUntil > Date.now() && (
              <div className="player-public-status">
                <Crown size={15} /> Amigo do Rei
              </div>
            )}
            {profile.clanName && (
              <div className="player-profile-clan">
                <span>{getClanCrestIcon(profile.clanIcon ?? "shield", 18)}</span>
                <div>
                  <strong>{profile.clanName}</strong>
                  <small>Nv. {profile.clanLevel ?? 0}</small>
                </div>
              </div>
            )}
            <div className="player-profile-grid">
              <div><span>Ranqueada</span><strong>{profile.arenaRankedPoints} pts</strong></div>
              <div><span>Masmorras</span><strong>{profile.dungeonClears}</strong></div>
            </div>
            <section className="player-public-equipment">
              <h3>Equipamentos</h3>
              {profile.equipment.map(({ slot, item }) => {
                const definition = item ? itemCatalog[item.itemId] : null;
                return (
                  <article className={definition ? "equip-slot has-item" : "equip-slot"} key={slot}>
                    {definition ? (
                      <ItemVisual item={definition} className="equip-item-visual" enhancementLevel={item?.enhancementLevel} rarity={item?.rarity} />
                    ) : (
                      <span className="equip-emoji">{slot === "weapon" ? "Arma" : slot === "armor" ? "Armadura" : "Amuleto"}</span>
                    )}
                    <div className="equip-info">
                      <small>{EQUIPMENT_LABEL[slot]}</small>
                      <strong>{definition ? formatInventoryItemName(definition, item ?? undefined) : "Vazio"}</strong>
                    </div>
                  </article>
                );
              })}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function UtilityStrip({
  onSettings,
  onGuide,
  onLogout,
  guideNotice
}: {
  onSettings: () => void;
  onGuide: () => void;
  onLogout: () => void;
  guideNotice?: boolean;
}) {
  return (
    <nav className="utility-strip" aria-label="Menu do jogador">
      <button type="button" title="Configuração" aria-label="Configuração" onClick={onSettings}>
        <Settings size={15} />
      </button>
      <button type="button" title="Guia" aria-label="Guia" onClick={onGuide}>
        <BookOpen size={15} />
        {guideNotice && <span className="attention-dot" aria-hidden="true" />}
      </button>
      <button type="button" title="Logoff" aria-label="Logoff" onClick={onLogout}>
        <LogOut size={15} />
      </button>
    </nav>
  );
}

function Header({
  game,
  regenMs,
  onDetails,
  onGameShop,
  onExchange,
  onRanking,
  onSettings,
  onGuide,
  onLogout,
  firstClickNotices
}: {
  game: GameState;
  regenMs: number;
  onDetails: () => void;
  onGameShop: () => void;
  onExchange: () => void;
  onRanking: () => void;
  onSettings: () => void;
  onGuide: () => void;
  onLogout: () => void;
  firstClickNotices: Record<FirstClickNoticeKey, boolean>;
}) {
  const nextXp = Math.max(1, experienceForNextLevel(game.character.level));
  const xpProgress = Math.min(100, Math.round((game.character.experience / nextXp) * 100));
  const hpProgress = Math.min(100, Math.round((game.character.currentHp / game.derived.maxHp) * 100));
  const energyProgress = Math.min(100, Math.round((game.character.currentEnergy / game.derived.maxEnergy) * 100));
  const regenSecs = Math.ceil(regenMs / 1000);
  const regenMins = Math.floor(regenSecs / 60);
  const regenSecsRemainder = regenSecs % 60;
  const timerLabel = `${regenMins}:${String(regenSecsRemainder).padStart(2, "0")}`;
  const royalSealActive = isRoyalSealActive(game);
  const hasGrowthPoints = game.character.unspentAttributePoints > 0 || game.derived.availableTalentPoints > 0;
  const growthPointLabels = [
    game.character.unspentAttributePoints > 0 ? `${game.character.unspentAttributePoints} ponto(s) de atributo` : "",
    game.derived.availableTalentPoints > 0 ? `${game.derived.availableTalentPoints} ponto(s) de talento` : ""
  ].filter(Boolean);

  return (
    <header className="topbar">
      <div className="topbar-profile">
        <button className="character-chip" onClick={onDetails} title="Detalhes do personagem">
          <CharacterAvatar
            avatar={getCurrentAvatar(game)}
            size={50}
            royal={royalSealActive}
            className="character-chip-avatar"
            alert={hasGrowthPoints}
            alertLabel={growthPointLabels.join(" e ") || "Pontos para distribuir"}
          />
          <strong>{game.character.name}</strong>
          <small className="character-chip-level">Nv {game.character.level}</small>
          <small className="character-chip-clan">
            {game.clan ? <>{getClanCrestIcon(game.clan.icon, 11)} {game.clan.name}</> : "Sem clã"}
          </small>
        </button>
      </div>
      <div className="topbar-status">
        <div className="top-economy">
          <button className="stat-pill stat-action" onClick={onExchange} title="Trocar moedas">
            <Coins size={17} style={{ color: "var(--gold)" }} />
            <strong>{formatCurrency(game.character.gold)}</strong>
            {firstClickNotices.exchange && <span className="attention-dot" aria-hidden="true" />}
          </button>
          <button className="stat-pill stat-action" onClick={onGameShop} title="Loja do Jogo">
            <Gem size={17} style={{ color: "var(--cyan)" }} />
            <strong>{formatCurrency(game.character.diamonds)}</strong>
            {firstClickNotices.diamonds && <span className="attention-dot" aria-hidden="true" />}
          </button>
          <button
            className="stat-pill stat-action"
            title="Ranking"
            onClick={onRanking}
          >
            <Trophy size={17} style={{ color: "var(--gold)" }} />
            {firstClickNotices.ranking && <span className="attention-dot" aria-hidden="true" />}
          </button>

          <UtilityStrip onSettings={onSettings} onGuide={onGuide} onLogout={onLogout} guideNotice={firstClickNotices.guide} />
        </div>
        <div className="resource-stack">
          <ResourceBar
            className="life"
            icon={<Heart size={15} style={{ color: "var(--red)" }} />}
            value={`${game.character.currentHp}/${game.derived.maxHp}`}
            progress={hpProgress}
            regenAmount={game.regenHpAmount}
            timerLabel={timerLabel}
            atMax={game.character.currentHp >= game.derived.maxHp}
          />
          <ResourceBar
            className="energy"
            icon={<Zap size={15} style={{ color: "var(--green)" }} />}
            value={`${game.character.currentEnergy}/${game.derived.maxEnergy}`}
            progress={energyProgress}
            regenAmount={game.regenEnergyAmount}
            timerLabel={timerLabel}
            atMax={game.character.currentEnergy >= game.derived.maxEnergy}
          />
          <ResourceBar
            className="xp"
            icon={<Star size={15} style={{ color: "var(--purple)" }} />}
            value={`${formatCurrency(game.character.experience)}/${formatCurrency(nextXp)}`}
            progress={xpProgress}
          />
        </div>
      </div>
    </header>
  );
}

function ResourceBar({
  className,
  icon,
  value,
  progress,
  regenAmount,
  timerLabel,
  atMax
}: {
  className: string;
  icon: React.ReactNode;
  value: string;
  progress: number;
  regenAmount?: number;
  timerLabel?: string;
  atMax?: boolean;
}) {
  return (
    <div className={`resource-bar ${className}`}>
      <div className="resource-bar-main">
        <span className="resource-icon">{icon}</span>
        <i>
          <b style={{ width: `${progress}%` }} />
        </i>
        <strong>{value}</strong>
      </div>
      {regenAmount !== undefined && timerLabel && !atMax && (
        <small className="regen-hint">♻️ +{regenAmount} em {timerLabel}</small>
      )}
    </div>
  );
}

function BottomNav({ game, view, setView }: { game: GameState; view: View; setView: (view: View) => void }) {
  const locked = Boolean(game.activeBattle) || Boolean(game.character.dungeonProgress?.activeRun);
  const working = isWorkInProgress(game.character.activeWork);
  const completedMissions = countClaimable(game.quests.daily) + countClaimable(game.quests.fixed);
  const myListings = game.marketplaceListings.filter((l) => l.sellerPlayerId === game.player.id).length;
  const inventoryFull = game.inventoryUsed >= game.inventoryCapacity;

  const items = [
    { view: "city" as View, label: "Cidade", icon: <GameIcon name="city" size={40} />, disabled: locked, badge: null },
    { view: "hunt" as View, label: "Caça", icon: <GameIcon name="hunt" size={40} />, disabled: locked, badge: null },
    { view: "arena" as View, label: "Arena", icon: <GameIcon name="arena" size={40} />, disabled: locked || working, badge: game.arenaQueueSize > 0 ? game.arenaQueueSize : null },
    {
      view: "inventory" as View,
      label: "Inventário",
      icon: <GameIcon name="inventory" size={40} />,
      disabled: locked,
      badge: `${game.inventoryUsed}/${game.inventoryCapacity}`,
      badgeClass: inventoryFull ? "inventory-full" : "",
      buttonClass: inventoryFull ? "inventory-full" : ""
    },
    { view: "market" as View, label: "Mercado", icon: <GameIcon name="market" size={40} />, disabled: locked, badge: myListings > 0 ? myListings : null },
    { view: "missions" as View, label: "Missões", icon: <GameIcon name="missions" size={40} />, disabled: locked, badge: completedMissions > 0 ? completedMissions : null },
    { view: "clan" as View, label: "Clã", icon: game.clan ? getClanCrestIcon(game.clan.icon, 40, "bottom-clan-crest") : <GameIcon name="clan" size={40} />, disabled: locked, badge: null },
    { view: "travel" as View, label: "Viajar", icon: <GameIcon name="travel" size={40} />, disabled: locked, badge: null }
  ];

  return (
    <nav className="bottom-nav" aria-label="Acessos rápidos">
      {items.map((item) => (
        <button
          key={item.view}
          className={["bottom-button", view === item.view ? "active" : "", item.buttonClass].filter(Boolean).join(" ")}
          disabled={item.disabled}
          title={item.label}
          aria-label={item.label}
          onClick={() => setView(item.view)}
        >
          {item.icon}
          {item.badge !== null && item.badge !== undefined && (
            <span className={["bottom-badge", item.badgeClass].filter(Boolean).join(" ")}>{item.badge}</span>
          )}
        </button>
      ))}
    </nav>
  );
}

function CharacterDrawer({ game, onClose }: { game: GameState; onClose: () => void }) {
  return (
    <div className="drawer-backdrop" role="presentation" onClick={onClose}>
      <aside className="character-drawer" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <button className="close-button" title="Fechar" onClick={onClose}>
          <X size={20} />
        </button>
        <CharacterPanel game={game} locked={Boolean(game.activeBattle)} />
      </aside>
    </div>
  );
}

function SettingsModal({ game, onClose }: { game: GameState; onClose: () => void }) {
  const [tab, setTab] = useState<"account" | "password">("account");
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const passwordReady = currentPassword.length >= 6 && nextPassword.length >= 6 && nextPassword === confirmPassword;
  const pendingReferralRewards = game.referrals.invitedFriends.filter((friend) => friend.eligible && !friend.claimed).length;

  const copyInviteCode = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(game.referrals.code);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const changePassword = (event: FormEvent) => {
    event.preventDefault();
    if (!passwordReady) return;
    socket.emit("account:changePassword", { currentPassword, newPassword: nextPassword });
    setCurrentPassword("");
    setNextPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="drawer-backdrop" role="presentation" onClick={onClose}>
      <section className="utility-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <button className="close-button" title="Fechar" onClick={onClose}>
          <X size={20} />
        </button>
        <PanelTitle icon={<Settings size={20} />} title="Configuração" />
        <div className="utility-tabs">
          <button className={tab === "account" ? "mini-tab active" : "mini-tab"} onClick={() => setTab("account")}>
            Conta
          </button>
          <button className={tab === "password" ? "mini-tab active" : "mini-tab"} onClick={() => setTab("password")}>
            Senha
          </button>
        </div>

        {tab === "account" && (
          <div className="utility-stack">
            <section className="account-summary">
              <div>
                <span>Recruta</span>
                <strong>{game.player.username}</strong>
              </div>
              <div>
                <span>E-mail</span>
                <strong>{game.player.email}</strong>
              </div>
              <div>
                <span>Personagem</span>
                <strong>{game.character.name} - Nv {game.character.level}</strong>
              </div>
              <div>
                <span>Conta criada</span>
                <strong>{new Date(game.player.createdAt).toLocaleDateString("pt-BR")}</strong>
              </div>
            </section>

            <section className="invite-panel">
              <div className="invite-header">
                <div>
                  <span className="eyebrow">Convide seus amigos</span>
                  <h3>Recompensa no nível {game.referrals.rewardLevel}</h3>
                  <p>
                    Quando um amigo cadastrado com seu código chegar ao nível {game.referrals.rewardLevel}, você pode resgatar
                    {` ${formatCurrency(game.referrals.reward.gold)} ouro e ${game.referrals.reward.diamonds} `}
                    <Gem size={13} style={{ color: "var(--cyan)" }} />.
                  </p>
                </div>
                <strong className="invite-badge">{pendingReferralRewards} pronto(s)</strong>
              </div>
              <div className="invite-code-row">
                <code>{game.referrals.code}</code>
                <button className="ghost-button" type="button" onClick={copyInviteCode}>
                  {copied ? <CheckCircle2 size={15} /> : <Copy size={15} />} {copied ? "Copiado" : "Copiar"}
                </button>
              </div>
              <div className="referral-list">
                {game.referrals.invitedFriends.length === 0 && <p className="empty-state">Nenhum amigo vinculado ainda.</p>}
                {game.referrals.invitedFriends.map((friend) => (
                  <article className="referral-row" key={friend.playerId}>
                    <div>
                      <strong>{friend.name}</strong>
                      <span>Nível {friend.level}/{game.referrals.rewardLevel}</span>
                    </div>
                    <button
                      className="ghost-button"
                      disabled={!friend.eligible || friend.claimed}
                      onClick={() => socket.emit("referral:claim", { playerId: friend.playerId })}
                    >
                      {friend.claimed ? "Resgatado" : friend.eligible ? "Resgatar" : "Aguardando"}
                    </button>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}

        {tab === "password" && (
          <form className="utility-form" onSubmit={changePassword}>
            <label>
              <span>Senha atual</span>
              <input
                type="password"
                value={currentPassword}
                minLength={6}
                autoComplete="current-password"
                onChange={(event) => setCurrentPassword(event.target.value)}
              />
            </label>
            <label>
              <span>Nova senha</span>
              <input
                type="password"
                value={nextPassword}
                minLength={6}
                autoComplete="new-password"
                onChange={(event) => setNextPassword(event.target.value)}
              />
            </label>
            <label>
              <span>Confirmar nova senha</span>
              <input
                type="password"
                value={confirmPassword}
                minLength={6}
                autoComplete="new-password"
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </label>
            {nextPassword && confirmPassword && nextPassword !== confirmPassword && (
              <small className="form-warning">As senhas não conferem.</small>
            )}
            <button className="primary-button" type="submit" disabled={!passwordReady}>
              Alterar senha
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

type GuideTab = "history" | "faq" | "world" | "work" | "arena" | "dungeon" | "creation" | "items" | "monsters" | "monarchs" | "developer" | "stats";
type CraftingStationTab = "blacksmith" | "alchemist";

function HistoryGuide() {
  return (
    <div className="guide-copy history-guide-copy">
      <h1>Litch: O Chamado dos Vivos</h1>
      <p>
        Antes que os sinos de Ravenspire soassem em luto, antes que as rotas de navio fossem marcadas por presságios, o
        mundo ainda acreditava que a morte era uma fronteira. Os reinos comerciavam, disputavam terras, erguiam templos
        e esqueciam, com a arrogância dos vivos, que certas coroas nunca permanecem enterradas por muito tempo.
      </p>
      <p>
        Então vieram as primeiras noites sem lua. Covas antigas abriram por dentro. Runas apagadas voltaram a arder em
        violeta. Soldados mortos responderam a ordens que nenhum general vivo havia dado. E, de Morthaly, nasceu um
        silêncio tão pesado que até os mares pareceram recuar.
      </p>

      <blockquote>
        <p>
          Quando a Coroa Vazia despertar, nenhum reino cairá sozinho. Cada cidade será uma muralha, cada estrada será
          uma escolha, e cada vivo carregará uma parte da guerra.
        </p>
      </blockquote>

      <h2>Os Três Reinos</h2>
      <p>
        Aurevia foi o primeiro reino a transformar medo em disciplina. Suas vilas prosperam entre campos dourados,
        fornalhas e antigas ordens de ofício. Ali, aprendizes, guardas e aventureiros iniciantes encontram trabalho,
        treinamento e as primeiras cicatrizes de uma vida que raramente permite descanso.
      </p>
      <p>
        Valfria, ao norte, é uma terra de vento cortante, fortalezas de pedra e juramentos duros. Seus habitantes
        aprenderam que sobreviver exige preparo, paciência e armas bem cuidadas. Entre minas, torres e caminhos gelados,
        o reino forja guerreiros que entendem o peso real de uma patrulha.
      </p>
      <p>
        Morthaly já teve outro nome, mas poucos ousam pronunciá-lo. Hoje, suas cidades vivem sob céus escuros, cercadas
        por necrópoles, ruínas e bosques onde a própria sombra parece escutar. É ali que a guerra deixou de ser uma
        ameaça distante e passou a respirar no portão.
      </p>

      <h2>A Profecia da Coroa Vazia</h2>
      <p>
        Os cronistas dizem que o Rei Litch não busca apenas conquista. Ele deseja um mundo imóvel, perfeito em sua
        obediência, onde nenhuma voz envelhece, nenhuma memória discorda e nenhum coração trai a vontade da coroa. Para
        ele, a vida é uma falha passageira. Para os vivos, essa falha é tudo.
      </p>
      <p>
        A cada dia, um general morto-vivo se ergue em Morthaly para testar as defesas dos reinos. São monarcas de
        guerra, ecos de líderes corrompidos, cada um trazendo uma forma diferente de ruína. No fim de semana, quando as
        runas queimam mais fundo, o próprio Rei Litch reclama o campo de batalha.
      </p>

      <h2>O Pacto dos Portos</h2>
      <p>
        O mar que separa Aurevia, Valfria e Morthaly também os mantém vivos. Nenhum viajante cruza entre países sem
        passar pelos portos, onde tickets de navio são contados como provisões de guerra. Primeiro chega-se ao porto;
        depois, se ainda houver coragem, seguem-se as estradas internas.
      </p>
      <p>
        Por isso, cada viagem importa. Sair de casa pode significar buscar trabalho em outra agência, caçar criaturas
        mais perigosas, vender um achado raro no mercado ou atravessar o mar para golpear um monarca antes que a noite
        cobre seu preço.
      </p>

      <h2>O Alistamento dos Vivos</h2>
      <p>
        Você não começa como lenda. Começa como alguém que ainda precisa escolher onde gastar força, ouro, energia e
        tempo. Cada batalha ensina o corpo. Cada trabalho ensina uma aptidão. Cada item melhorado, cada poção guardada e
        cada ponto de atributo distribuído aproxima o personagem de algo maior que sobrevivência.
      </p>
      <p>
        O mercado aproxima jogadores, a arena mede ambição, os clãs transformam esforço individual em presença coletiva,
        e as missões apontam caminhos para quem quer crescer sem perder o rumo. Nada disso existe fora da história: são
        as pequenas engrenagens dos vivos tentando resistir a uma máquina antiga de morte.
      </p>

      <h2>Sua Jornada</h2>
      <p>
        Em Litch, progresso é mais que números subindo. É a história de um personagem que aprende onde pode lutar, onde
        deve recuar e quando vale gastar um recurso raro por uma chance maior. O mundo não espera por heróis prontos; ele
        cria heróis pressionando pessoas comuns até que elas descubram o que conseguem carregar.
      </p>
      <p>
        Morthaly ainda chama. Os generais ainda se levantam. O Rei Litch ainda observa do outro lado da guerra. Mas
        enquanto houver vivos dispostos a viajar, trabalhar, lutar e retornar, a Coroa Vazia ainda não venceu.
      </p>
    </div>
  );
}

function GuideModal({ game, onClose }: { game: GameState; onClose: () => void }) {
  const [tab, setTab] = useState<GuideTab>("history");
  const [creationStation, setCreationStation] = useState<CraftingStationTab>("blacksmith");
  const [worldFilter, setWorldFilter] = useState("");
  const [itemFilter, setItemFilter] = useState("");
  const [itemKind, setItemKind] = useState<"all" | ItemKind>("all");
  const [itemLevel, setItemLevel] = useState<string>("all");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [monsterFilter, setMonsterFilter] = useState("");
  const [monsterCity, setMonsterCity] = useState("all");
  const [selectedMonsterId, setSelectedMonsterId] = useState("");
  const [developerSubject, setDeveloperSubject] = useState("");
  const [developerMessage, setDeveloperMessage] = useState("");
  const countriesById = new Map(game.countries.map((country) => [country.id, country]));
  const citiesById = new Map(game.cities.map((city) => [city.id, city]));
  const allItems = Object.values(game.itemCatalog).sort((a, b) => {
    const equipmentOrder = Number(Boolean(a.slot)) === Number(Boolean(b.slot)) ? 0 : a.slot ? -1 : 1;
    const levelOrder = getGuideItemRequiredLevel(a) - getGuideItemRequiredLevel(b);
    return equipmentOrder || levelOrder || a.name.localeCompare(b.name);
  });
  const itemLevels = Array.from(new Set(allItems.map((item) => getGuideItemRequiredLevel(item)))).sort((a, b) => a - b);
  const filteredItems = allItems.filter((item) => {
    const matchesKind = itemKind === "all" || item.kind === itemKind;
    const matchesLevel = itemLevel === "all" || String(getGuideItemRequiredLevel(item)) === itemLevel;
    const term = itemFilter.trim().toLowerCase();
    const matchesTerm = !term || item.name.toLowerCase().includes(term) || ITEM_KIND_LABELS[item.kind].toLowerCase().includes(term);
    return matchesKind && matchesLevel && matchesTerm;
  });
  const selectedItem = selectedItemId ? game.itemCatalog[selectedItemId] ?? null : null;
  const allMonsters = Object.values(game.monsterCatalog).sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
  const filteredMonsters = allMonsters.filter((monster) => {
    const city = citiesById.get(monster.cityId);
    const country = city ? countriesById.get(city.countryId) : null;
    const haystack = `${monster.name} ${city?.name ?? ""} ${country?.name ?? ""}`.toLowerCase();
    const term = monsterFilter.trim().toLowerCase();
    return (monsterCity === "all" || monster.cityId === monsterCity) && (!term || haystack.includes(term));
  });
  const selectedMonster = selectedMonsterId ? game.monsterCatalog[selectedMonsterId] ?? null : null;
  const worldTerm = worldFilter.trim().toLowerCase();
  const countryGroups = game.countries
    .map((country) => {
      const countryMatches = `${country.name} ${country.description}`.toLowerCase().includes(worldTerm);
      const cities = game.cities
        .filter((city) => city.countryId === country.id)
        .map((city) => {
          const locations = game.huntingLocations.filter((location) => location.cityId === city.id);
          const npcNames = Object.values(city.npcs).filter(Boolean).join(" ");
          const monsterNames = locations
            .flatMap((location) => location.monsterIds)
            .map((monsterId) => game.monsterCatalog[monsterId]?.name ?? "")
            .join(" ");
          const haystack = `${city.name} ${city.description} ${city.inhabitants.join(" ")} ${npcNames} ${locations
            .map((location) => `${location.name} ${location.description}`)
            .join(" ")} ${monsterNames}`.toLowerCase();
          return { city, locations, matches: !worldTerm || countryMatches || haystack.includes(worldTerm) };
        })
        .filter((entry) => entry.matches);
      return { country, cities };
    })
    .filter((group) => group.cities.length > 0);
  const workGroups = game.countries
    .map((country) => ({
      country,
      services: game.workServices.filter((service) => service.countryId === country.id)
    }))
    .filter((group) => group.services.length > 0);
  const arenaRankIndex = game.rankings.arena.findIndex((entry) => entry.playerId === game.player.id);
  const arenaRankLabel = arenaRankIndex >= 0 ? `#${arenaRankIndex + 1}` : "Top 20+";
  const arenaBlueCoins = countInventoryItem(game, "material_gold_coin");
  const dungeonKeys = countInventoryItem(game, "misc_dungeon_key");
  const dungeonUnlockedFloor = Math.max(
    1,
    Math.min(20, game.character.dungeonProgress?.unlockedFloorByCountry?.[game.currentCountry.id] ?? 1)
  );
  const formatArenaSeasonLabel = (key: string) => {
    if (!key) return "Sem temporada ativa";
    const [year, month] = key.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  };

  const sendDeveloperMessage = (event: FormEvent) => {
    event.preventDefault();
    if (!developerMessage.trim()) return;
    socket.emit("developer:message", { subject: developerSubject, message: developerMessage });
    setDeveloperSubject("");
    setDeveloperMessage("");
  };

  const tabs: Array<{ id: GuideTab; label: string; icon: React.ReactNode }> = [
    { id: "history", label: "História", icon: <GameIcon name="history" size={18} /> },
    { id: "faq", label: "FAQ", icon: <GameIcon name="faq" size={18} /> },
    { id: "world", label: "Mundo", icon: <GameIcon name="travel" size={18} /> },
    { id: "work", label: "Trabalhos", icon: <GameIcon name="agency" size={18} /> },
    { id: "arena", label: "Arena", icon: <GameIcon name="arena" size={18} /> },
    { id: "dungeon", label: "Masmorra", icon: <GameIcon name="dungeon" size={18} /> },
    { id: "creation", label: "Criação", icon: <GameIcon name="craft" size={18} /> },
    { id: "items", label: "Itens", icon: <GameIcon name="inventory" size={18} /> },
    { id: "monsters", label: "Monstros", icon: <GameIcon name="hunt" size={18} /> },
    { id: "monarchs", label: "Monarcas", icon: <GameIcon name="monarch" size={18} /> },
    { id: "developer", label: "Dev", icon: <GameIcon name="dev" size={18} /> },
    { id: "stats", label: "Stats", icon: <GameIcon name="stats" size={18} /> }
  ];

  return (
    <div className="drawer-backdrop" role="presentation" onClick={onClose}>
      <section className="utility-modal guide-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <button className="close-button" title="Fechar" onClick={onClose}>
          <X size={20} />
        </button>
        <PanelTitle icon={<BookOpen size={20} />} title="Guia do jogo" />
        <div className="guide-tabs">
          {tabs.map((entry) => (
            <button key={entry.id} className={tab === entry.id ? "mini-tab active" : "mini-tab"} onClick={() => setTab(entry.id)}>
              <span className="guide-tab-icon">{entry.icon}</span>
              <span className="guide-tab-label">{entry.label}</span>
            </button>
          ))}
        </div>

        {tab === "history" && <HistoryGuide />}

        {tab === "faq" && (
          <div className="faq-list">
            <section className="faq-section">
              <h3>Primeiros passos</h3>
              <article><strong>Como meu personagem começa?</strong><span>Ao criar a conta, o personagem já nasce com FOR, CON e AGI em 1, arma de treino, algumas poções e inventário limitado.</span></article>
              <article><strong>O que devo fazer primeiro?</strong><span>Entre em Caça, escolha um local da cidade e enfrente monstros adequados ao seu nível para ganhar XP, ouro e possíveis drops.</span></article>
              <article><strong>O que fica bloqueado em batalha?</strong><span>Durante a batalha, a maioria das ações fica bloqueada. Você ainda pode abrir inventário, detalhes do personagem e sair da conta.</span></article>
            </section>

            <section className="faq-section">
              <h3>Regras e recursos</h3>
              <article><strong>Como funciona o inventário?</strong><span>Itens que não são equipamentos ficam agrupados. Equipamentos ocupam espaços individuais, pois podem ter raridade e aprimoramento.</span></article>
              <article><strong>Como recupero vida e energia?</strong><span>A cada 2 minutos reais você recupera 10%, com bônus de talentos. Poções também recuperam 30% de vida ou energia.</span></article>
              <article><strong>Como a energia limita a caça?</strong><span>A energia máxima é CON + nível. Cada batalha PvE consome energia igual ao nível do monstro.</span></article>
            </section>

            <section className="faq-section">
              <h3>Viagens</h3>
              <article><strong>Como viajo entre cidades?</strong><span>Use Ticket de Trem. Algumas cidades também exigem nível mínimo para entrada.</span></article>
              <article><strong>Como viajo entre países?</strong><span>Use Ticket de Navio. Ao chegar em outro país, você aporta na cidade porto daquele país.</span></article>
              <article><strong>Onde compro tickets e pergaminhos?</strong><span>No Cambista, que fica apenas em cidades porto. Ele vende tickets e é o único NPC que vende pergaminhos.</span></article>
            </section>

            <section className="faq-section">
              <h3>Combate</h3>
              <article><strong>Como a vida é calculada?</strong><span>Vida máxima: nível * 50 + 2 * CON, somando bônus de equipamentos, talentos e benefícios.</span></article>
              <article><strong>Como o dano é calculado?</strong><span>O dano base é FOR do atacante menos DEF do defensor. Se houver acerto crítico, o dano é multiplicado pelo dano crítico do atacante.</span></article>
              <article><strong>Como funcionam crítico e resistência?</strong><span>A chance final compara crítico do atacante contra resistência crítica do defensor. Resistência crítica usa (AGI + CON) / 2, então tanques também reduzem críticos recebidos.</span></article>
              <article><strong>Como funcionam esquiva e precisão?</strong><span>A chance final compara esquiva do defensor contra precisão do atacante. AGI aumenta esquiva, precisão, crítico e também o multiplicador de dano crítico.</span></article>
            </section>

            <section className="faq-section highlighted">
              <h3>Diamantes e Amigo do Rei</h3>
              <article><strong>Quando vale comprar diamantes?</strong><span>Diamantes aceleram resets, criação de clã, compra de avatares premium e trocas por ouro quando você precisa agir rápido no mercado.</span></article>
              <article><strong>O que é Amigo do Rei?</strong><span>É um pacote em destaque da Loja do Jogo com 200 diamantes, 100 tickets de trem, 30 tickets de navio, PvE automático por 1 mês e selo do rei no avatar por 1 mês.</span></article>
              <article><strong>Por que o PvE automático ajuda?</strong><span>Ele reduz repetição em sessões longas de caça, ideal para farmar XP, gold e drops enquanto você foca em mercado, clã e progresso.</span></article>
            </section>
          </div>
        )}

        {tab === "world" && (
          <div className="guide-catalog">
            <div className="guide-filters">
              <input value={worldFilter} onChange={(event) => setWorldFilter(event.target.value)} placeholder="Filtrar país, cidade ou local" />
            </div>
            <div className="guide-country-list">
              {countryGroups.map(({ country, cities }) => (
                <article className="guide-country-card" key={country.id}>
                  <div className="guide-country-media">
                    <AssetImage src={country.imageUrl} alt={country.name} fallback={<MapPinned size={50} />} />
                  </div>
                  <div className="guide-country-content">
                    <div className="guide-country-heading">
                      <div>
                        <span className="eyebrow">País</span>
                        <h3>{country.name}</h3>
                      </div>
                      {country.id === "morthaly" && <strong className="monarch-home-badge">Sede dos Monarcas</strong>}
                    </div>
                    <p>{country.description}</p>
                    <div className="guide-city-list">
                      {cities.map(({ city, locations }) => {
                        const npcEntries = Object.entries(city.npcs).filter((entry): entry is [string, string] => Boolean(entry[1]));
                        return (
                          <section className="guide-city-card" key={city.id}>
                            <div className="guide-city-heading">
                              <div>
                                <strong>{city.name}</strong>
                                <span>Nível mínimo {city.minLevel}{city.isPort ? " - Porto" : ""}</span>
                              </div>
                              {city.countryId === "morthaly" && <small>Rotas do evento Monarca passam por Morthaly.</small>}
                            </div>
                            <p>{city.description}</p>
                            <div className="guide-chip-group">
                              <b>Habitantes</b>
                              <div>
                                {city.inhabitants.map((inhabitant) => <span key={inhabitant}>{inhabitant}</span>)}
                              </div>
                            </div>
                            <div className="guide-chip-group">
                              <b>Comerciantes</b>
                              <div>
                                {npcEntries.map(([role, name]) => <span key={`${city.id}-${role}`}>{formatNpcRole(role)}: {name}</span>)}
                              </div>
                            </div>
                            <div className="guide-location-list">
                              {locations.map((location) => {
                                const monsters = location.monsterIds
                                  .map((monsterId) => game.monsterCatalog[monsterId])
                                  .filter(Boolean) as GameState["cityMonsters"];
                                return (
                                  <article className="guide-location-card" key={location.id}>
                                    <div>
                                      <strong>{location.name}</strong>
                                      <span>{location.description}</span>
                                    </div>
                                    <div className="guide-mini-entity-grid">
                                      {monsters.map((monster) => (
                                        <button type="button" className="guide-mini-entity" key={monster.id} onClick={() => setSelectedMonsterId(monster.id)}>
                                          <MonsterVisual monster={monster} className="guide-mini-art" />
                                          <span>{monster.name}</span>
                                        </button>
                                      ))}
                                    </div>
                                  </article>
                                );
                              })}
                            </div>
                          </section>
                        );
                      })}
                    </div>
                  </div>
                </article>
              ))}
              {countryGroups.length === 0 && <p className="empty-state">Nenhum país, cidade ou local encontrado.</p>}
            </div>
          </div>
        )}

        {tab === "work" && (
          <div className="guide-work-list">
            <section className="guide-list">
              <article><strong>Como funciona</strong><span>Agências existem em todas as cidades. Você escolhe um serviço, define o tempo de trabalho e volta quando o expediente terminar para receber.</span></article>
              <article><strong>Bloqueios</strong><span>Enquanto trabalha, o personagem não pode batalhar, viajar para outro país ou iniciar outro serviço. Abandonar cancela toda recompensa daquele expediente.</span></article>
              <article><strong>Aptidão</strong><span>Cada serviço tem nível próprio de aptidão. Quanto mais você trabalha nele, maior a recompensa e mais perto fica do bônus especial.</span></article>
              <article><strong>Tempo</strong><span>Serviços curtos pagam melhor proporcionalmente, mas serviços raros e valiosos podem exigir turnos mais longos.</span></article>
            </section>
            {workGroups.map(({ country, services }) => (
              <section className="guide-work-country" key={country.id}>
                <div className="guide-work-country-head">
                  <div>
                    <span className="eyebrow">País</span>
                    <h3>{country.name}</h3>
                  </div>
                  <small>{services.length} serviços</small>
                </div>
                <p>{country.description}</p>
                <div className="guide-work-grid">
                  {services.map((service) => (
                    <article className="guide-work-card" key={service.id}>
                      <div>
                        <span className="eyebrow">{service.specialty}</span>
                        <h4>{service.name}</h4>
                        <p>{service.description}</p>
                      </div>
                      <div className="guide-work-durations">
                        {service.minuteOptions.map((minutes) => <span key={minutes}>{formatWorkMinutes(minutes)}</span>)}
                      </div>
                      <div className="work-reward-list">
                        {renderWorkReward(game, service.rewardsPerHour)}
                      </div>
                      <div className="work-bonus">
                        <strong>Bônus Nv. {service.bonus.level}</strong>
                        <span>{service.bonus.description}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {tab === "arena" && (
          <div className="arena-guide">
            <section className="arena-guide-hero">
              <GameIcon name="arena" size={76} />
              <div>
                <span className="eyebrow">Arena</span>
                <h3>Duelo, Ranqueada e Temporada</h3>
                <p>
                  A Arena concentra combates contra outros recrutas. Use Duelo para confrontos diretos e Ranqueada para subir no placar da temporada.
                </p>
              </div>
            </section>

            <section className="arena-guide-summary">
              <div>
                <small>Seus pontos</small>
                <strong>{game.character.arenaRankedPoints}</strong>
                <span>{arenaRankLabel}</span>
              </div>
              <div>
                <small>Moedas Azuis</small>
                <strong>{arenaBlueCoins}</strong>
                <span>usadas em duelos ranqueados e no mercador</span>
              </div>
              <div>
                <small>Temporada</small>
                <strong>{formatArenaSeasonLabel(game.arenaSeasonKey)}</strong>
                <span>ranking mensal</span>
              </div>
            </section>

            <section className="guide-list">
              <article>
                <strong>Duelo</strong>
                <span>É o PvP livre: entre na fila aguardando outro jogador ou convide alguém pelo perfil. O resultado conta como vitória/derrota de Arena, mas não altera pontos ranqueados.</span>
              </article>
              <article>
                <strong>Ranqueada</strong>
                <span>O jogo escolhe um adversário com pontuação próxima, online ou offline. O oponente luta automaticamente e não ganha nem perde pontos nessa batalha.</span>
              </article>
              <article>
                <strong>Pontuação</strong>
                <span>Todo jogador começa com 100 pontos. Vitória soma 5 pontos; derrota remove 2 pontos, sem afetar o adversário escolhido pelo sistema.</span>
              </article>
              <article>
                <strong>Moedas de Arena</strong>
                <span>A Ranqueada consome Moeda Azul. Você pode receber moedas diárias na tela da Arena e ganha moedas de recompensa ao vencer ou perder.</span>
              </article>
              <article>
                <strong>Recompensas por batalha</strong>
                <span>Vitória concede 10000 ouro + 1 Pedra de Criação, além das Moedas de Arena. Derrota concede 5000 ouro, além das Moedas de Arena.</span>
              </article>
              <article>
                <strong>Temporada</strong>
                <span>O ranking da Arena usa a pontuação ranqueada. Ao virar a temporada, os melhores recebem recompensas e os pontos ranqueados voltam ao início.</span>
              </article>
            </section>

            <section className="arena-guide-ranking">
              <div className="arena-guide-heading">
                <h3>Top Ranqueada</h3>
                <span>{game.rankings.arena.length} no ranking</span>
              </div>
              <div className="arena-ranking-list">
                {game.rankings.arena.slice(0, 5).map((entry, index) => (
                  <div key={entry.playerId} className="arena-rank-row">
                    <span className="arena-rank-pos">#{index + 1}</span>
                    <PlayerName playerId={entry.playerId} name={entry.name} className="arena-rank-name" />
                    <span className="arena-rank-pts">{entry.arenaRankedPoints} pts</span>
                  </div>
                ))}
                {game.rankings.arena.length === 0 && <p className="empty-state">Nenhum recruta ranqueado ainda.</p>}
              </div>
            </section>
          </div>
        )}

        {tab === "dungeon" && (
          <div className="faq-list">
            <section className="faq-section highlighted">
              <h3>Resumo atual</h3>
              <article>
                <strong>Andar liberado em {game.currentCountry.name}</strong>
                <span>{dungeonUnlockedFloor}/20</span>
              </article>
              <article>
                <strong>Chaves de masmorra</strong>
                <span>{dungeonKeys}</span>
              </article>
              <article>
                <strong>Conclusões totais</strong>
                <span>{game.character.dungeonClears}</span>
              </article>
            </section>

            <section className="faq-section">
              <h3>Como funciona</h3>
              <article><strong>Entrada</strong><span>Você precisa de 1 Chave de Masmorra para entrar em um andar.</span></article>
              <article><strong>Objetivo</strong><span>Limpe todas as salas do andar para concluir e receber os espólios acumulados.</span></article>
              <article><strong>Navegação</strong><span>Durante uma run ativa, a navegação para outras áreas fica bloqueada até encerrar o andar.</span></article>
              <article><strong>Tempo por sala</strong><span>Você tem 1 minuto para avançar para a próxima sala. Se o tempo acabar, o personagem é derrotado e perde os espólios pendentes.</span></article>
            </section>

            <section className="faq-section">
              <h3>Tipos de sala</h3>
              <article><strong>Horda</strong><span>Sala de combate com sequência de inimigos. Ao vencer todos, você avança.</span></article>
              <article><strong>Baú</strong><span>Mostra recompensas antecipadas. Ao confirmar, os itens entram na pilha de espólios pendentes.</span></article>
              <article><strong>Buff</strong><span>Aplica bônus imediatos para a run, como dano, defesa, agilidade, força ou cura total.</span></article>
              <article><strong>Armadilha</strong><span>Aplica penalidades na run, podendo reduzir atributos ou vida.</span></article>
              <article><strong>Chefe</strong><span>Sala final do andar. A batalha só começa quando você clicar em Enfrentar o Chefe.</span></article>
            </section>

            <section className="faq-section">
              <h3>Recompensas e progressão</h3>
              <article><strong>Acúmulo</strong><span>XP, ouro e itens ficam acumulados durante o andar e são entregues no fim da conclusão.</span></article>
              <article><strong>Queda por inventário cheio</strong><span>Se faltar espaço, parte dos itens pode ser descartada ao finalizar a run.</span></article>
              <article><strong>Desbloqueio de andares</strong><span>Concluir um andar libera o próximo no mesmo país até o limite do andar 20.</span></article>
              <article><strong>Chave bônus</strong><span>A chave extra de conclusão só é concedida na primeira vez que você conclui aquele andar no país.</span></article>
            </section>
          </div>
        )}

        {tab === "creation" && <CraftingGuide game={game} station={creationStation} onStationChange={setCreationStation} />}

        {tab === "items" && (
          <div className="guide-catalog">
            <div className="guide-filters">
              <input value={itemFilter} onChange={(event) => setItemFilter(event.target.value)} placeholder="Filtrar item" />
              <select value={itemKind} onChange={(event) => setItemKind(event.target.value as "all" | ItemKind)}>
                <option value="all">Todos</option>
                {Object.entries(ITEM_KIND_LABELS).map(([kind, label]) => (
                  <option value={kind} key={kind}>{label}</option>
                ))}
              </select>
              <select value={itemLevel} onChange={(event) => setItemLevel(event.target.value)}>
                <option value="all">Todos os níveis</option>
                {itemLevels.map((level) => (
                  <option value={String(level)} key={`lvl-${level}`}>
                    {level > 0 ? `Nível ${level}` : "Sem nível"}
                  </option>
                ))}
              </select>
            </div>
            <div className="guide-card-grid">
              {filteredItems.map((item) => (
                <button key={item.id} className="guide-card" onClick={() => setSelectedItemId(item.id)} title={item.name}>
                  <ItemVisual item={item} className="guide-card-art" />
                  <strong>{item.name}</strong>
                </button>
              ))}
              {filteredItems.length === 0 && <p className="empty-state">Nenhum item encontrado.</p>}
            </div>
          </div>
        )}

        {tab === "monsters" && (
          <div className="guide-catalog">
            <div className="guide-filters">
              <input value={monsterFilter} onChange={(event) => setMonsterFilter(event.target.value)} placeholder="Filtrar monstro, cidade ou país" />
              <select value={monsterCity} onChange={(event) => setMonsterCity(event.target.value)}>
                <option value="all">Todas as cidades</option>
                {game.cities.map((city) => (
                  <option value={city.id} key={city.id}>{city.name}</option>
                ))}
              </select>
            </div>
            <div className="guide-card-grid">
              {filteredMonsters.map((monster) => (
                <button key={monster.id} className="guide-card" onClick={() => setSelectedMonsterId(monster.id)} title={monster.name}>
                  <MonsterVisual monster={monster} className="guide-card-art" />
                  <strong>{monster.name}</strong>
                </button>
              ))}
              {filteredMonsters.length === 0 && <p className="empty-state">Nenhum monstro encontrado.</p>}
            </div>
          </div>
        )}

        {tab === "monarchs" && (
          <div className="monarch-guide">
            <section className="guide-list">
              <article><strong>Entrada</strong><span>O evento dos Monarcas acontece em Morthaly. Para entrar, o recruta usa Chaves Altas e respeita o limite diário de tentativas.</span></article>
              <article><strong>Objetivo</strong><span>Todos os participantes atacam o mesmo chefe global. O dano fica registrado no ranking do evento.</span></article>
              <article><strong>Recompensas</strong><span>Ao final, participantes recebem XP e ouro conforme dano/ranking. Quando o chefe e derrotado, os 3 melhores também recebem diamantes.</span></article>
              <article><strong>Rei Litch</strong><span>No fim de semana, o Rei Litch substitui os generais e triplica as recompensas do evento.</span></article>
              <article><strong>Status atual</strong><span>{game.monarchEvent ? `${game.monarchEvent.name} está ${game.monarchEvent.status}.` : "Evento ainda não carregado."}</span></article>
            </section>
            <section className="monarch-general-grid">
              {game.monarchGenerals.map((general) => (
                <article className={general.isKing ? "monarch-general-card king" : "monarch-general-card"} key={general.id}>
                  <AssetImage src={general.imageUrl} alt={general.name} fallback={<Crown size={30} />} />
                  <div>
                    <span className="eyebrow">{general.title}</span>
                    <strong>{general.name}</strong>
                    <small>Nv {general.level} - {general.maxHp.toLocaleString()} vida</small>
                  </div>
                  <div className="monster-stats">
                    <small title="Força"><Swords size={13} /> {general.strength}</small>
                    <small title="Defesa"><Shield size={13} /> {general.defense}</small>
                    <small title="Agilidade"><Crosshair size={13} /> {general.agility}</small>
                    <small title="XP"><Sparkles size={13} /> {general.experience.toLocaleString()}</small>
                    <small title="Ouro"><Coins size={13} /> {general.gold.toLocaleString()}</small>
                  </div>
                </article>
              ))}
            </section>
          </div>
        )}

        {tab === "developer" && (
          <form className="utility-form" onSubmit={sendDeveloperMessage}>
            <div className="guide-copy developer-copy">
              <h3>Fale com o desenvolvedor</h3>
              <p>Obrigado por jogar e testar Litch. Cada bug reportado, sugestão de balanceamento e comentário sobre a experiência ajuda a deixar o jogo mais vivo, justo e divertido.</p>
              <p>Use este canal para contar o que travou seu progresso, qual sistema ficou confuso, que item parece forte demais ou que ideia você gostaria de ver no mundo.</p>
            </div>
            <label>
              <span>Assunto</span>
              <input value={developerSubject} onChange={(event) => setDeveloperSubject(event.target.value)} placeholder="Bug, sugestão ou dúvida" />
            </label>
            <label>
              <span>Mensagem</span>
              <textarea value={developerMessage} onChange={(event) => setDeveloperMessage(event.target.value)} placeholder="Escreva sua mensagem direta ao desenvolvedor" />
            </label>
            <button className="primary-button" disabled={!developerMessage.trim()} type="submit">
              <Send size={15} /> Enviar
            </button>
          </form>
        )}

        {tab === "stats" && (
          <div className="guide-stat-grid">
            <Metric icon={<Users size={17} />} label="Recrutas" value={game.registeredPlayersCount} />
            <Metric icon={<Users size={17} />} label="Online" value={game.onlineCount} />
            <Metric icon={<ShoppingBag size={17} />} label="Mercado" value={game.marketplaceListings.length} />
            <Metric icon={<Users size={17} />} label="Clas" value={game.clanDirectory.length} />
            <Metric icon={<Trophy size={17} />} label="Rankeados" value={game.rankings.level.length} />
          </div>
        )}

        {selectedItem && <GuideItemDetail item={selectedItem} game={game} onClose={() => setSelectedItemId("")} />}
        {selectedMonster && <GuideMonsterDetail monster={selectedMonster} game={game} onClose={() => setSelectedMonsterId("")} />}
      </section>
    </div>
  );
}

function GuideItemDetail({ item, game, onClose }: { item: ItemDefinition; game: GameState; onClose: () => void }) {
  const statEntries = EQUIPMENT_STAT_KEYS
    .map((key) => ({ key, label: EQUIPMENT_STAT_LABELS[key], value: item.stats[key], icon: getGuideItemStatIcon(key) }))
    .filter((entry) => entry.value !== undefined);
  const dropSources = getItemDropSources(game, item.id);
  const forgers = getItemForgers(game, item.id);
  const vendors = getItemVendors(game, item.id);

  return (
    <div className="guide-detail-backdrop" role="presentation" onClick={onClose}>
      <aside className="guide-detail-card modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <button className="close-button" title="Fechar" onClick={onClose}>
          <X size={18} />
        </button>
        <ItemVisual item={item} className="guide-detail-art" />
        <div>
          <span className="eyebrow">{ITEM_KIND_LABELS[item.kind]}</span>
          <h3>{item.name}</h3>
          <p>{item.description ?? "Sem descrição."}</p>
        </div>
        <div className="guide-detail-stats">
          {item.slot && <span>Nível mínimo <strong>{item.minLevel}</strong></span>}
          <span>Valor <strong>{formatCurrency(item.price)} ouro</strong></span>
          {item.rarity && <span>Raridade <strong>{RARITY_LABELS[item.rarity]}</strong></span>}
          {statEntries.map((entry) => (
            <span key={entry.key}><b className="guide-stat-label">{entry.icon} {entry.label}</b> <strong>+{entry.value}</strong></span>
          ))}
          {item.stats.healPercent && <span><b className="guide-stat-label"><Heart size={13} /> Vida</b> <strong>+{Math.round(item.stats.healPercent * 100)}%</strong></span>}
          {item.stats.energyPercent && <span><b className="guide-stat-label"><Zap size={13} /> Energia</b> <strong>+{Math.round(item.stats.energyPercent * 100)}%</strong></span>}
        </div>
        <section className="guide-detail-section">
          <h4>Monstros que dropam</h4>
          {dropSources.length === 0 ? (
            <p className="empty-state">Nenhum monstro dropa este item.</p>
          ) : (
            <div className="guide-detail-list">
              {dropSources.map((source) => (
                <article key={`${source.monster.id}-${source.chance}`}>
                  <MonsterVisual monster={source.monster} className="guide-mini-art" />
                  <div>
                    <strong>{source.monster.name}</strong>
                    <span>{source.city?.name ?? "Cidade desconhecida"} - {formatDropChance(source.chance)}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
        <section className="guide-detail-section">
          <h4>Quem forja</h4>
          {forgers.length === 0 ? (
            <p className="empty-state">Este item não é forjado na cidade atual.</p>
          ) : (
            <div className="guide-detail-list">
              {forgers.map((forger) => (
                <article key={`${forger.city.id}-${forger.role}-${forger.name}`}>
                  {forger.station === "blacksmith" ? <Hammer size={20} /> : <FlaskConical size={20} />}
                  <div>
                    <strong>{forger.name}</strong>
                    <span>{forger.role} - {forger.city.name}, {forger.country?.name ?? "País desconhecido"}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
        <section className="guide-detail-section">
          <h4>Habitantes que vendem</h4>
          {vendors.length === 0 ? (
            <p className="empty-state">Nenhum habitante vende este item diretamente.</p>
          ) : (
            <div className="guide-detail-list">
              {vendors.map((vendor) => (
                <article key={`${vendor.city.id}-${vendor.role}-${vendor.name}`}>
                  <User size={20} />
                  <div>
                    <strong>{vendor.name}</strong>
                    <span>{vendor.role} - {vendor.city.name}, {vendor.country?.name ?? "País desconhecido"}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </aside>
    </div>
  );
}

function GuideMonsterDetail({ monster, game, onClose }: { monster: GameState["cityMonsters"][number]; game: GameState; onClose: () => void }) {
  const city = game.cities.find((entry) => entry.id === monster.cityId);
  const country = city ? game.countries.find((entry) => entry.id === city.countryId) : null;

  return (
    <div className="guide-detail-backdrop" role="presentation" onClick={onClose}>
      <aside className="guide-detail-card modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <button className="close-button" title="Fechar" onClick={onClose}>
          <X size={18} />
        </button>
        <MonsterVisual monster={monster} className="guide-detail-art" />
        <div>
          <span className="eyebrow">{city?.name ?? "Cidade desconhecida"} - {country?.name ?? "País desconhecido"}</span>
          <h3>{monster.name}</h3>
        </div>
        <div className="monster-stats">
          <small title="Nível"><Star size={13} /> {monster.level}</small>
          <small title="Vida"><Heart size={13} /> {monster.maxHp}</small>
          <small title="Força"><Swords size={13} /> {monster.strength}</small>
          <small title="Defesa"><Shield size={13} /> {monster.defense}</small>
          <small title="Agilidade"><Crosshair size={13} /> {monster.agility}</small>
          <small title="XP"><Sparkles size={13} /> {monster.experience}</small>
          <small title="Ouro"><Coins size={13} /> {monster.gold}</small>
        </div>
        <section className="guide-detail-section">
          <h4>Drops</h4>
          <div className="guide-detail-list">
            {monster.drops.length === 0 && <article><Backpack size={20} /><div><strong>Drop</strong><span>Nenhum</span></div></article>}
            {monster.drops.map((drop) => (
              <article key={drop.itemId}>
                {game.itemCatalog[drop.itemId] ? (
                  <ItemVisual item={game.itemCatalog[drop.itemId]} className="guide-mini-art" />
                ) : (
                  <span className="asset-frame guide-mini-art"><span className="asset-fallback">?</span></span>
                )}
                <div>
                  <strong>{game.itemCatalog[drop.itemId]?.name ?? drop.itemId}</strong>
                  <span>{formatDropChance(drop.chance)}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}

function CraftingGuide({
  game,
  station,
  onStationChange
}: {
  game: GameState;
  station: CraftingStationTab;
  onStationChange: (station: CraftingStationTab) => void;
}) {
  const [kindFilter, setKindFilter] = useState<"all" | ItemKind>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [selectedRecipeId, setSelectedRecipeId] = useState("");

  const recipes = getCraftingGuideRecipes(game, station);
  const itemLevels = Array.from(new Set(recipes.map((entry) => entry.level))).sort((a, b) => a - b);
  const filteredRecipes = recipes.filter((entry) => {
    const matchesKind = kindFilter === "all" || entry.result.kind === kindFilter;
    const matchesLevel = levelFilter === "all" || String(entry.level) === levelFilter;
    return matchesKind && matchesLevel;
  });
  const selectedRecipe = filteredRecipes.find((entry) => entry.recipe.id === selectedRecipeId) ?? filteredRecipes[0] ?? null;
  const stationTabs: Array<{ id: CraftingStationTab; label: string; icon: React.ReactNode }> = [
    { id: "blacksmith", label: "Forja", icon: <GameIcon name="blacksmith" size={18} /> },
    { id: "alchemist", label: "Alquimista", icon: <GameIcon name="alchemist" size={18} /> }
  ];
  const stationLabel = station === "blacksmith" ? "Forja" : "Alquimista";

  useEffect(() => {
    if (!filteredRecipes.some((entry) => entry.recipe.id === selectedRecipeId)) {
      setSelectedRecipeId(filteredRecipes[0]?.recipe.id ?? "");
    }
  }, [filteredRecipes, selectedRecipeId]);

  return (
    <div className="guide-catalog split">
      <div className="guide-list-pane">
        <div className="guide-tabs guide-station-tabs">
          {stationTabs.map((entry) => (
            <button key={entry.id} className={station === entry.id ? "mini-tab active" : "mini-tab"} onClick={() => onStationChange(entry.id)}>
              <span className="guide-tab-icon">{entry.icon}</span>
              <span className="guide-tab-label">{entry.label}</span>
            </button>
          ))}
        </div>
        <div className="guide-filters">
          <select value={kindFilter} onChange={(event) => setKindFilter(event.target.value as "all" | ItemKind)}>
            <option value="all">Todos os tipos</option>
            {Object.entries(ITEM_KIND_LABELS).map(([kind, label]) => (
              <option value={kind} key={kind}>
                {label}
              </option>
            ))}
          </select>
          <select value={levelFilter} onChange={(event) => setLevelFilter(event.target.value)}>
            <option value="all">Todos os níveis</option>
            {itemLevels.map((level) => (
              <option value={String(level)} key={`craft-lvl-${station}-${level}`}>
                Nível {level}
              </option>
            ))}
          </select>
        </div>

        <div className="guide-result-list">
          {filteredRecipes.map((entry) => (
            <button
              key={entry.recipe.id}
              className={selectedRecipe?.recipe.id === entry.recipe.id ? "guide-result active" : "guide-result"}
              onClick={() => setSelectedRecipeId(entry.recipe.id)}
              title={entry.result.name}
            >
              <ItemVisual item={entry.result} className="guide-result-art" />
              <div className="guide-result-info">
                <span>{entry.result.name}</span>
                <small>{ITEM_KIND_LABELS[entry.result.kind]} · Nv {entry.level}</small>
                
              </div>
              <small className="guide-result-count">{entry.cities.length} loca{entry.cities.length === 1 ? "l" : "is"}</small>
            </button>
          ))}
          {filteredRecipes.length === 0 && <p className="empty-state">Nenhuma receita encontrada.</p>}
        </div>
      </div>

      {selectedRecipe ? (
        <aside className="guide-detail-card">
          <ItemVisual item={selectedRecipe.result} className="guide-detail-art" />
          <div>
            <span className="eyebrow">{stationLabel}</span>
            <h3>{selectedRecipe.result.name}</h3>
            <p>{selectedRecipe.result.description ?? "Sem descrição."}</p>
          </div>
          <div className="guide-detail-stats">
            <span>
              Tipo <strong>{ITEM_KIND_LABELS[selectedRecipe.result.kind]}</strong>
            </span>
            <span>
              Nível <strong>{selectedRecipe.level}</strong>
            </span>
            <span>
              Quantidade <strong>x{selectedRecipe.recipe.resultQuantity}</strong>
            </span>
            <span>
              Custo <strong>{formatCurrency(selectedRecipe.recipe.goldCost)} ouro</strong>
            </span>
            {selectedRecipe.result.rarity && (
              <span>
                Raridade <strong>{RARITY_LABELS[selectedRecipe.result.rarity]}</strong>
              </span>
            )}
            {EQUIPMENT_STAT_KEYS.map((key) => {
              const value = selectedRecipe.result.stats[key];
              if (value === undefined) return null;
              return (
                <span key={key}>
                  <b className="guide-stat-label">
                    {getGuideItemStatIcon(key)} {EQUIPMENT_STAT_LABELS[key]}
                  </b>
                  <strong>+{value}</strong>
                </span>
              );
            })}
            {selectedRecipe.result.stats.healPercent && (
              <span>
                <b className="guide-stat-label">
                  <Heart size={13} /> Vida
                </b>
                <strong>+{Math.round(selectedRecipe.result.stats.healPercent * 100)}%</strong>
              </span>
            )}
            {selectedRecipe.result.stats.energyPercent && (
              <span>
                <b className="guide-stat-label">
                  <Zap size={13} /> Energia
                </b>
                <strong>+{Math.round(selectedRecipe.result.stats.energyPercent * 100)}%</strong>
              </span>
            )}
          </div>

          <section className="guide-detail-section">
            <h4>Local de criação</h4>
            <div className="guide-chip-group">
              <b>Estação</b>
              <div>
                <span>{stationLabel}</span>
              </div>
            </div>
            <div className="guide-chip-group">
              <b>Cidades</b>
              <div>
                {selectedRecipe.cities.map((city) => (
                  <span key={city.id}>
                    {city.name} · Nv {city.minLevel}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className="guide-detail-section">
            <h4>Materiais</h4>
            <div className="guide-chip-group">
              <b>Itens e ouro</b>
              <div className="guide-material-chips">
                {selectedRecipe.recipe.ingredients.map((ingredient) => {
                  const material = game.itemCatalog[ingredient.itemId];
                  return (
                    <span key={ingredient.itemId}>
                      <ItemVisual item={material} className="guide-material-art" />
                      {material.name} x{ingredient.quantity} ({countInventoryItem(game, ingredient.itemId)})
                    </span>
                  );
                })}
                <span>{formatCurrency(selectedRecipe.recipe.goldCost)} ouro</span>
              </div>
            </div>
          </section>
        </aside>
      ) : (
        <aside className="guide-detail-card">
          <p className="empty-state">Nenhuma receita disponível neste filtro.</p>
        </aside>
      )}
    </div>
  );
}

function getCraftingGuideRecipes(game: GameState, station: CraftingStationTab) {
  const citiesById = new Map(game.cities.map((city) => [city.id, city]));

  return Object.values(CRAFTING_RECIPES)
    .filter((recipe) => recipe.station === station)
    .map((recipe) => {
      const result = game.itemCatalog[recipe.resultItemId];
      if (!result) {
        return null;
      }
      const cities = recipe.cityIds.map((cityId) => citiesById.get(cityId)).filter((city): city is GameState["cities"][number] => Boolean(city));
      return {
        recipe,
        result,
        cities,
        level: result.minLevel ?? 0
      };
    })
    .filter((entry): entry is { recipe: CraftingRecipe; result: ItemDefinition; cities: GameState["cities"][number][]; level: number } => entry !== null)
    .sort((a, b) => a.level - b.level || ITEM_KIND_LABELS[a.result.kind].localeCompare(ITEM_KIND_LABELS[b.result.kind]) || a.result.name.localeCompare(b.result.name));
}

function getItemDropSources(game: GameState, itemId: string) {
  return Object.values(game.monsterCatalog).flatMap((monster) =>
    monster.drops
      .filter((drop) => drop.itemId === itemId)
      .map((drop) => ({
        monster,
        chance: drop.chance,
        city: game.cities.find((city) => city.id === monster.cityId)
      }))
  );
}

function getGuideItemRequiredLevel(item: ItemDefinition) {
  return item.slot ? Math.max(0, item.minLevel ?? 0) : 0;
}

function getGuideItemStatIcon(key: keyof typeof EQUIPMENT_STAT_LABELS) {
  switch (key) {
    case "strength":
      return <Swords size={13} />;
    case "constitution":
      return <Heart size={13} />;
    case "agility":
      return <Crosshair size={13} />;
    case "defense":
      return <Shield size={13} />;
    default:
      return <Sparkles size={13} />;
  }
}

function formatDropChance(chance: number) {
  const percent = chance * 100;
  if (Number.isInteger(percent)) {
    return `${percent}%`;
  }
  return `${percent.toFixed(2).replace(/\.?0+$/, "")}%`;
}

function getItemForgers(game: GameState, itemId: string) {
  const city = game.currentCity;
  const country = game.currentCountry;
  const forgers: Array<{
    city: GameState["cities"][number];
    country: GameState["countries"][number];
    role: string;
    name: string;
    station: "blacksmith" | "alchemist";
  }> = [];

  if (game.availableCraftingRecipes.blacksmith.some((recipe) => recipe.resultItemId === itemId) && city.npcs.blacksmith) {
    forgers.push({ city, country, role: "Ferreiro", name: city.npcs.blacksmith, station: "blacksmith" });
  }
  if (game.availableCraftingRecipes.alchemist.some((recipe) => recipe.resultItemId === itemId) && city.npcs.alchemist) {
    forgers.push({ city, country, role: "Alquimista", name: city.npcs.alchemist, station: "alchemist" });
  }

  return forgers;
}

function getItemVendors(game: GameState, itemId: string) {
  const vendors: Array<{ city: GameState["cities"][number]; country?: GameState["countries"][number]; role: string; name: string }> = [];
  for (const city of game.cities) {
    const country = game.countries.find((entry) => entry.id === city.countryId);
    if ((city.armorerItemIds ?? []).includes(itemId) && city.npcs.armorer) {
      vendors.push({ city, country, role: "Armeiro", name: city.npcs.armorer });
    }
    if ((city.apothecaryItemIds ?? []).includes(itemId) && city.npcs.apothecary) {
      vendors.push({ city, country, role: "Boticário", name: city.npcs.apothecary });
    }
    if ((city.moneyChangerItemIds ?? []).includes(itemId) && city.npcs.moneyChanger) {
      vendors.push({ city, country, role: "Cambista", name: city.npcs.moneyChanger });
    }
    if ((city.goldCoinMerchantItemIds ?? []).includes(itemId) && city.npcs.goldCoinMerchant) {
      vendors.push({ city, country, role: "Mercador", name: city.npcs.goldCoinMerchant });
    }
  }
  return vendors;
}

function formatNpcRole(role: string) {
  switch (role) {
    case "armorer":
      return "Armeiro";
    case "apothecary":
      return "Boticário";
    case "blacksmith":
      return "Ferreiro";
    case "alchemist":
      return "Alquimista";
    case "moneyChanger":
      return "Cambista";
    case "goldCoinMerchant":
      return "Mercador";
    default:
      return role;
  }
}

function getAvatarIcon(icon: AvatarIcon, size = 34) {
  switch (icon) {
    case "shield":
      return <Shield size={size} />;
    case "swords":
      return <Swords size={size} />;
    case "crown":
      return <Crown size={size} />;
    case "flame":
      return <Flame size={size} />;
    case "skull":
      return <Skull size={size} />;
    case "sparkles":
      return <Sparkles size={size} />;
    case "gem":
      return <Gem size={size} />;
    case "user":
    default:
      return <User size={size} />;
  }
}

function getCurrentAvatar(game: GameState) {
  return game.avatarCatalog.find((avatar) => avatar.id === game.character.avatarId) ?? game.avatarCatalog[0];
}

function CharacterAvatar({
  avatar,
  size = 72,
  royal = false,
  className = "",
  alert = false,
  alertLabel = "Pontos para distribuir"
}: {
  avatar?: AvatarDefinition;
  size?: number;
  royal?: boolean;
  className?: string;
  alert?: boolean;
  alertLabel?: string;
}) {
  return (
    <span
      className={`profile-avatar ${className}`}
      style={{ width: size, height: size, background: 'transparent' }}
      title={alert ? alertLabel : avatar?.name}
    >
      {avatar?.imageUrl ? (
        <img className="profile-avatar-image" src={avatar.imageUrl} alt="" loading="lazy" decoding="async" />
      ) : (
        getAvatarIcon(avatar?.icon ?? "user", Math.max(18, Math.floor(size * 0.48)))
      )}
      {royal && <i className="royal-seal-mini"><Crown size={Math.max(9, Math.floor(size * 0.16))} /></i>}
      {alert && <i className="profile-avatar-alert-dot" aria-label={alertLabel} />}
    </span>
  );
}

function readAvatarOptionsSeen(playerId: string) {
  try {
    return window.localStorage.getItem(`${AVATAR_OPTIONS_SEEN_STORAGE_PREFIX}:${playerId}`) === "1";
  } catch {
    return false;
  }
}

function markAvatarOptionsSeen(playerId: string) {
  try {
    window.localStorage.setItem(`${AVATAR_OPTIONS_SEEN_STORAGE_PREFIX}:${playerId}`, "1");
  } catch {
    // Local storage can be unavailable in private browsing or strict embeds.
  }
}

function ResetScrollIcon({ item, className = "" }: { item?: ItemDefinition; className?: string }) {
  return item ? <ItemVisual item={item} className={`reset-scroll-visual ${className}`} /> : <ScrollText size={16} />;
}

function CharacterPanel({ game, locked = false }: { game: GameState; locked?: boolean }) {
  const [pending, setPending] = useState<Attributes>({ strength: 0, constitution: 0, agility: 0 });
  const [showAvatarChoices, setShowAvatarChoices] = useState(false);
  const [resetModal, setResetModal] = useState<"attributes" | "talents" | null>(null);
  const [selectedEquipmentInstanceId, setSelectedEquipmentInstanceId] = useState<string | null>(null);
  const [avatarOptionsSeen, setAvatarOptionsSeen] = useState(() => readAvatarOptionsSeen(game.player.id));
  const { preferences } = useQuickPotionSettings();
  const pendingTotal = pending.strength + pending.constitution + pending.agility;
  const healthPotion = getQuickPotionOption(game, preferences, "health");
  const energyPotion = getQuickPotionOption(game, preferences, "energy");
  const royalSealActive = isRoyalSealActive(game);
  const autoPveActive = isAutoPveActive(game);
  const currentAvatar = getCurrentAvatar(game);
  const unlockedAvatarIds = game.character.unlockedAvatarIds ?? [];
  const memoryScroll = game.itemCatalog[MEMORY_SCROLL_ID];
  const hpProgress = Math.min(100, Math.round((game.character.currentHp / game.derived.maxHp) * 100));
  const energyProgress = Math.min(100, Math.round((game.character.currentEnergy / game.derived.maxEnergy) * 100));
  const selectedEquipmentEntry = selectedEquipmentInstanceId
    ? game.character.inventory.find((item) => item.instanceId === selectedEquipmentInstanceId) ?? null
    : null;
  const selectedEquipmentItem = selectedEquipmentEntry ? game.itemCatalog[selectedEquipmentEntry.itemId] ?? null : null;

  useEffect(() => {
    setAvatarOptionsSeen(readAvatarOptionsSeen(game.player.id));
  }, [game.player.id]);

  const changePending = (key: AttributeKey, delta: number) => {
    setPending((current) => {
      const nextValue = Math.max(0, current[key] + delta);
      const next = { ...current, [key]: nextValue };
      const nextTotal = next.strength + next.constitution + next.agility;
      return nextTotal <= game.character.unspentAttributePoints ? next : current;
    });
  };

  const allocate = () => {
    socket.emit("character:allocate", pending);
    setPending({ strength: 0, constitution: 0, agility: 0 });
  };
  const openAvatarModal = () => {
    if (locked) {
      return;
    }
    if (!avatarOptionsSeen) {
      markAvatarOptionsSeen(game.player.id);
      setAvatarOptionsSeen(true);
    }
    setShowAvatarChoices(true);
  };
  const chooseAvatar = (avatar: AvatarDefinition, unlocked: boolean) => {
    if (locked) {
      return;
    }
    if (avatar.id === game.character.avatarId) {
      setShowAvatarChoices(false);
      return;
    }
    if (!unlocked && avatar.exclusive) {
      window.alert(`${avatar.name} é um avatar exclusivo. ${avatar.unlockHint ?? "Desbloqueie esta recompensa no jogo."}`);
      return;
    }
    if (!unlocked && !window.confirm(`Comprar ${avatar.name} por ${avatar.priceDiamonds} diamantes?`)) {
      return;
    }
    socket.emit("character:avatar", { avatarId: avatar.id });
    setShowAvatarChoices(false);
  };

  return (
    <section className="character-panel">
      <header className="character-identity">
        <button
          className="avatar-ring avatar-ring-button"
          type="button"
          disabled={locked}
          onClick={openAvatarModal}
          title="Alterar avatar"
        >
          <CharacterAvatar
            avatar={currentAvatar}
            size={76}
            royal={royalSealActive}
            alert={!avatarOptionsSeen}
            alertLabel="Veja as opções de avatar"
          />
        </button>
        <div className="character-identity-copy">
          <div style={{alignContent: "space-evenly"}}>
            <h2>{game.character.name}</h2>
            <p className="muted">Nv. {game.character.level}</p>
          </div>

          {game.clan ? (
            <div className="character-clan-info compact">
              <div>
                <span className="character-clan-crest">{getClanCrestIcon(game.clan.icon, 18)}</span>
                <strong>{game.clan.name}</strong>
              </div>
              <small>Nv. {game.clan.level} - {game.clan.leaderPlayerId === game.player.id ? "Líder" : "Membro"}</small>
              
            </div>
          ) : ""}
        </div>
      </header>
      {autoPveActive && (
        <p className="royal-status">
          <Crown size={14} /> Amigo do Rei ativo ate {formatListingDate(game.character.pveAutoUntil ?? 0)}
        </p>
      )}

      <section className="character-resource-bars" aria-label="Recursos do personagem">
        <ResourceBar
          className="life"
          icon={<Heart size={13} style={{ color: "var(--red)" }} />}
          value={`${game.character.currentHp}/${game.derived.maxHp}`}
          progress={hpProgress}
        />
        <ResourceBar
          className="energy"
          icon={<Zap size={13} style={{ color: "var(--green)" }} />}
          value={`${game.character.currentEnergy}/${game.derived.maxEnergy}`}
          progress={energyProgress}
        />
      </section>
      
      <section className="compact-section">
        <h3>Poções</h3>
        <div className="potion-actions">
          <button
            className="battle-potion-button health"
            disabled={locked || !healthPotion || game.character.currentHp >= game.derived.maxHp}
            title={healthPotion?.definition.name ?? "Nenhuma poção de vida"}
            onClick={() => healthPotion && socket.emit("inventory:use", { instanceId: healthPotion.inventoryItem.instanceId })}
          >
            {healthPotion ? (
              <ItemVisual item={healthPotion.definition} className="battle-potion-visual" quantity={healthPotion.quantity} />
            ) : (
              <span className="battle-potion-visual empty"><Heart size={18} /></span>
            )}
            <span>
              <strong>Vida</strong>
              <small>{healthPotion ? getPotionEffectLabel(healthPotion.definition, "health") : "x0"}</small>
            </span>
          </button>
          <button
            className="battle-potion-button energy"
            disabled={locked || !energyPotion || game.character.currentEnergy >= game.derived.maxEnergy}
            title={energyPotion?.definition.name ?? "Nenhuma poção de energia"}
            onClick={() => energyPotion && socket.emit("inventory:use", { instanceId: energyPotion.inventoryItem.instanceId })}
          >
            {energyPotion ? (
              <ItemVisual item={energyPotion.definition} className="battle-potion-visual" quantity={energyPotion.quantity} />
            ) : (
              <span className="battle-potion-visual empty"><Zap size={18} /></span>
            )}
            <span>
              <strong>Energia</strong>
              <small>{energyPotion ? getPotionEffectLabel(energyPotion.definition, "energy") : "x0"}</small>
            </span>
          </button>
        </div>
      </section>

      <div className="stat-grid">
        <Metric icon={<Heart size={18} style={{color: "var(--red)"}} />} label="Vida" value={`${game.character.currentHp}/${game.derived.maxHp}`} />
        <Metric icon={<Zap size={18} style={{color: "var(--green)"}} />} label="Energia" value={`${game.character.currentEnergy}/${game.derived.maxEnergy}`} />
        <Metric icon={<Swords size={18} style={{color: "var(--red)"}} />} label="FORÇA" value={game.derived.totalStrength} />
        <Metric icon={<Shield size={18} style={{color: "var(--purple)"}} />} label="DEFESA" value={game.derived.defense} />
        <Metric icon={<Crosshair size={18} style={{color: "var(--gold)"}} />} label="AGILIDADE" value={game.derived.agility} />
      </div>

      <div className="chance-row">
        <span>
          <strong>Crítico {formatSecondaryIndex(game.derived.criticalChance)}</strong>
          <small>contra Resistência Crítica</small>
        </span>
        <span>
          <strong>Precisão {formatSecondaryIndex(game.derived.accuracy)}</strong>
          <small>contra Esquiva</small>
        </span>
        <span>
          <strong>Esquiva {formatSecondaryIndex(game.derived.dodgeChance)}</strong>
          <small>contra Precisão</small>
        </span>
        <span>
          <strong>Resist. crítico {formatSecondaryIndex(game.derived.criticalResistance)}</strong>
          <small>contra Crítico</small>
        </span>
        <span>
          <strong>Dano crítico x{game.derived.criticalDamageMultiplier.toFixed(2)}</strong>
          <small>ao acertar crítico</small>
        </span>
      </div>

      <section className="compact-section">
        <h3>Equipamentos</h3>
        <div className="equipment-visual">
          {(["weapon", "armor", "amulet"] as const).map((slot) => {
            const instanceId = game.character.equipment[slot];
            const inventoryItem = instanceId ? game.character.inventory.find((item) => item.instanceId === instanceId) : null;
            const definition = inventoryItem ? game.itemCatalog[inventoryItem.itemId] : null;
            const slotEmoji = { weapon: "⚔️", armor: "🛡️", amulet: "📿" };
            return (
              <button
                type="button"
                className={`equip-slot${definition ? " has-item" : ""}`}
                key={slot}
                disabled={!definition || !inventoryItem}
                onClick={() => inventoryItem && setSelectedEquipmentInstanceId(inventoryItem.instanceId)}
                title={definition ? `Ver detalhes de ${formatInventoryItemName(definition, inventoryItem)}` : EQUIPMENT_LABEL[slot]}
              >
                {definition ? (
                  <ItemVisual item={definition} className="equip-item-visual" enhancementLevel={inventoryItem?.enhancementLevel} rarity={inventoryItem?.rarity} />
                ) : (
                  <span className="equip-emoji">{slotEmoji[slot]}</span>
                )}
                <div className="equip-info">
                  <small>{EQUIPMENT_LABEL[slot]}</small>
                  <strong>{definition?.name ?? "—"}</strong>
                  {definition && <span className="equip-desc">{definition.description}</span>}
                </div>
              </button>
            );
          })}
        </div>
        {selectedEquipmentEntry && selectedEquipmentItem && (
          <EquippedItemDetailModal
            item={selectedEquipmentItem}
            inventoryItem={selectedEquipmentEntry}
            onClose={() => setSelectedEquipmentInstanceId(null)}
          />
        )}
      </section>

      <section className="compact-section">
        <h3>Atributos Base</h3>
        {attributes.map((attribute) => {
          const attrIcon = { strength: <Swords size={13} />, constitution: <Heart size={13} />, agility: <Zap size={13} /> };
          return (
            <div className="attribute-line" key={attribute}>
              <span className="attr-label">{attrIcon[attribute]} {ATTRIBUTE_LABEL[attribute]}</span>
              <strong>{game.character.attributes[attribute]}</strong>
            </div>
          );
        })}
        <div className="reset-actions">
          <button className="ghost-button reset-trigger-button" disabled={locked} onClick={() => setResetModal("attributes")}>
            <ResetScrollIcon item={memoryScroll} />
            Resetar Pontos de Atributo
          </button>
        </div>
      </section>

      {game.character.unspentAttributePoints > 0 && (
        <section className="attribute-box">
          <div className="points-title">
            <strong>{game.character.unspentAttributePoints - pendingTotal}</strong>
            <span>pontos livres</span>
          </div>
          {attributes.map((attribute) => (
            <div className="allocator" key={attribute}>
              <span className="allocator-copy">
                <strong>{ATTRIBUTE_LABEL[attribute]}</strong>
                <small>{ATTRIBUTE_RELEVANCE[attribute]}</small>
              </span>
              <div className="allocator-controls">
                <IconButton label={`Remover ${ATTRIBUTE_LABEL[attribute]}`} onClick={() => changePending(attribute, -1)}>
                  -
                </IconButton>
                <b>{pending[attribute]}</b>
                <IconButton label={`Adicionar ${ATTRIBUTE_LABEL[attribute]}`} onClick={() => changePending(attribute, 1)}>
                  +
                </IconButton>
              </div>
            </div>
          ))}
          <button className="primary-button full" disabled={pendingTotal === 0 || locked} onClick={allocate}>
            {locked ? "Bloqueado em batalha" : "Confirmar"}
          </button>
        </section>
      )}

      <section className="compact-section">
        <h3>Talentos</h3>
        <TalentTreeView game={game} compact locked={locked} onRequestReset={() => setResetModal("talents")} />
      </section>

      {showAvatarChoices && (
        <AvatarPickerModal
          game={game}
          currentAvatar={currentAvatar}
          unlockedAvatarIds={unlockedAvatarIds}
          royalSealActive={royalSealActive}
          locked={locked}
          onChoose={chooseAvatar}
          onClose={() => setShowAvatarChoices(false)}
        />
      )}

      {resetModal && (
        <ResetChoiceModal game={game} target={resetModal} onClose={() => setResetModal(null)} />
      )}
    </section>
  );
}

function EquippedItemDetailModal({
  item,
  inventoryItem,
  onClose
}: {
  item: ItemDefinition;
  inventoryItem: InventoryItem;
  onClose: () => void;
}) {
  const stats = getEnhancedItemStats(item, inventoryItem);
  const rarity = getItemRarity(item, inventoryItem);

  return (
    <div className="drawer-backdrop inventory-item-backdrop" role="presentation" onClick={onClose}>
      <div className="inv-action-bar inventory-item-modal equipped-item-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <button className="close-button" title="Fechar" onClick={onClose}>
          <X size={18} />
        </button>
        <ItemVisual
          item={item}
          className="inventory-modal-visual"
          enhancementLevel={inventoryItem.enhancementLevel}
          rarity={inventoryItem.rarity}
        />
        <div className="inv-action-info">
          <strong>{formatInventoryItemName(item, inventoryItem)}</strong>
          <span>{item.description}</span>
          <div className="inventory-item-meta">
            <small>{EQUIPMENT_LABEL[item.slot ?? "weapon"]}</small>
            {rarity && <div className={`item-rarity ${rarity}`}>{RARITY_LABELS[rarity]}</div>}
            <small>Nível mínimo: {item.minLevel}</small>
            {(inventoryItem.enhancementLevel ?? 0) > 0 && <small>Melhoria: +{inventoryItem.enhancementLevel ?? 0}</small>}
          </div>
          <div className="market-modal-stats">
            <h4>Atributos</h4>
            <div className="stat-list">
              {stats.strength !== undefined && <div><span>Força</span> <strong>+{stats.strength}</strong></div>}
              {stats.constitution !== undefined && <div><span>Constituição</span> <strong>+{stats.constitution}</strong></div>}
              {stats.agility !== undefined && <div><span>Agilidade</span> <strong>+{stats.agility}</strong></div>}
              {stats.defense !== undefined && <div><span>Defesa</span> <strong>+{stats.defense}</strong></div>}
            </div>
          </div>
        </div>
        <div className="inv-action-buttons">
          <span className="equipped-label">Equipado</span>
          <button className="ghost-button" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

function AvatarPickerModal({
  game,
  currentAvatar,
  unlockedAvatarIds,
  royalSealActive,
  locked,
  onChoose,
  onClose
}: {
  game: GameState;
  currentAvatar?: AvatarDefinition;
  unlockedAvatarIds: string[];
  royalSealActive: boolean;
  locked: boolean;
  onChoose: (avatar: AvatarDefinition, unlocked: boolean) => void;
  onClose: () => void;
}) {
  return (
    <div className="drawer-backdrop avatar-picker-backdrop" role="presentation" onClick={onClose}>
      <section className="player-action-modal avatar-picker-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <button className="close-button" title="Fechar" onClick={onClose}>
          <X size={18} />
        </button>
        <div className="avatar-picker-heading">
          <CharacterAvatar avatar={currentAvatar} size={58} royal={royalSealActive} />
          <div>
            <h2>Alterar avatar</h2>
            <small>Escolha um visual desbloqueado ou compre uma opção premium.</small>
          </div>
        </div>
        <div className="avatar-choice-grid modal">
          {game.avatarCatalog.map((avatar) => {
            const unlocked = (avatar.priceDiamonds === 0 && !avatar.exclusive) || unlockedAvatarIds.includes(avatar.id);
            const selected = game.character.avatarId === avatar.id;
            return (
              <button
                type="button"
                key={avatar.id}
                className={`avatar-choice${selected ? " selected" : ""}${!unlocked ? " locked" : ""}`}
                disabled={locked}
                onClick={() => onChoose(avatar, unlocked)}
                title={unlocked ? avatar.name : avatar.exclusive ? `${avatar.name} — ${avatar.unlockHint ?? "Exclusivo"}` : `${avatar.name} - ${avatar.priceDiamonds} diamantes`}
              >
                <CharacterAvatar avatar={avatar} size={90} />
                {!unlocked && <span className="avatar-lock"><Lock size={12} /></span>}
                <span>{avatar.name}</span>
                <small>
                  {selected ? (
                    "Em uso"
                  ) : unlocked ? (
                    "Usar"
                  ) : avatar.exclusive ? (
                    "Recompensa"
                  ) : (
                    <>{avatar.priceDiamonds} <Gem size={12} style={{ color: "var(--cyan)" }} /></>
                  )}
                </small>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function ResetChoiceModal({
  game,
  target,
  onClose
}: {
  game: GameState;
  target: "attributes" | "talents";
  onClose: () => void;
}) {
  const isAttributeReset = target === "attributes";
  const scrollId = isAttributeReset ? MEMORY_SCROLL_ID : OBLIVION_SCROLL_ID;
  const scroll = game.itemCatalog[scrollId];
  const scrollCount = countInventoryItem(game, scrollId);
  const diamondCost = isAttributeReset ? ATTRIBUTE_RESET_DIAMOND_COST : TALENT_RESET_DIAMOND_COST;
  const eventName = isAttributeReset ? "attribute:reset" : "talent:reset";
  const title = isAttributeReset ? "Resetar atributos" : "Resetar talentos";
  const description = isAttributeReset
    ? "Escolha como recuperar seus pontos de atributo."
    : "Escolha como recuperar seus pontos de talento.";
  const emitReset = (method: "scroll" | "diamonds") => {
    socket.emit(eventName, { method });
    onClose();
  };

  return (
    <div className="drawer-backdrop reset-choice-backdrop" role="presentation" onClick={onClose}>
      <section className="player-action-modal reset-choice-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <button className="close-button" title="Fechar" onClick={onClose}>
          <X size={18} />
        </button>
        <div className="reset-choice-heading">
          <ResetScrollIcon item={scroll} className="large" />
          <div>
            <h2>{title}</h2>
            <small>{description}</small>
          </div>
        </div>
        <div className="reset-choice-actions">
          <button className="ghost-button reset-method-button" disabled={scrollCount <= 0} onClick={() => emitReset("scroll")}>
            <ResetScrollIcon item={scroll} />
            <span className="reset-method-copy">
              <strong>Usar pergaminho</strong>
              <small>{scroll?.name ?? "Pergaminho"} x{scrollCount}</small>
            </span>
          </button>
          <button className="ghost-button reset-method-button" disabled={game.character.diamonds < diamondCost} onClick={() => emitReset("diamonds")}>
            <Gem size={22} style={{ color: "var(--cyan)" }} />
            <span className="reset-method-copy">
              <strong>Usar diamantes</strong>
              <small>{diamondCost} diamantes disponíveis: {game.character.diamonds}</small>
            </span>
          </button>
        </div>
      </section>
    </div>
  );
}

function CityHero({ game, view, setView }: { game: GameState; view: View; setView: (view: View) => void }) {
  const countryCover = game.currentCountry.imageUrl ?? `/assets/locals/${game.currentCountry.id}.png`;
  return (
    <>
      <header className="city-hero">
        <img src={countryCover} alt="" className="city-map" />
        <div className="city-copy">
          <span className="eyebrow">Cidade</span>
          <h1>{game.currentCity.name}</h1>
          <strong className="city-country">{game.currentCountry.name}</strong>
        </div>
      </header>
      <p className="city-hero-desc">{game.currentCity.description}</p>
    </>
  );
}

function GamePane({ game, view, setView }: { game: GameState; view: View; setView: (view: View) => void }) {
  if (game.activeBattle) {
    if (view === "inventory") {
      return <InventoryPanel game={game} onBackToBattle={() => setView("city")} />;
    }
    return <BattlePanel game={game} />;
  }

  if (view === "hunt") {
    return <HuntPanel game={game} />;
  }
  if (view === "arena") {
    return <ArenaPanel game={game} />;
  }
  if (view === "armorer") {
    return <ShopPanel game={game} shop="armorer" />;
  }
  if (view === "apothecary") {
    return <ShopPanel game={game} shop="apothecary" />;
  }
  if (view === "moneyChanger") {
    return <ShopPanel game={game} shop="moneyChanger" />;
  }
  if (view === "goldCoinMerchant") {
    return <ShopPanel game={game} shop="goldCoinMerchant" />;
  }
  if (view === "agency") {
    return <AgencyPanel game={game} />;
  }
  if (view === "travel") {
    return <TravelPanel game={game} />;
  }
  if (view === "inventory") {
    return <InventoryPanel game={game} />;
  }
  if (view === "market") {
    return <MarketPanel game={game} />;
  }
  if (view === "missions") {
    return <MissionsPanel game={game} />;
  }
  if (view === "blacksmith") {
    return <CraftingPanel game={game} station="blacksmith" />;
  }
  if (view === "alchemist") {
    return <CraftingPanel game={game} station="alchemist" />;
  }
  if (view === "dungeon") {
    return <DungeonPanel game={game} />;
  }
  if (view === "monarch") {
    return <MonarchPanel game={game} />;
  }
  if (view === "rankings") {
    return <RankingsPanel game={game} />;
  }
  if (view === "gameShop") {
    return <GameShopPanel game={game} />;
  }
  if (view === "clan") {
    return <ClanPanel game={game} />;
  }

  return <CityOverview game={game} setView={setView} />;
}

type CityOption = { view: View; icon: React.ReactNode; title: string; value: string; disabled?: boolean };

function CityOptionCard({ option, setView }: { option: CityOption; setView: (v: View) => void }) {
  return (
    <button className="option-card" disabled={option.disabled} onClick={() => setView(option.view)}>
      <span>{option.icon}</span>
      <strong>{option.title}</strong>
      <small>{option.value}</small>
    </button>
  );
}

function CityGroup({ title, options, setView }: { title: string; options: CityOption[]; setView: (v: View) => void }) {
  if (options.length === 0) return null;
  return (
    <div className="city-group">
      <h3 className="city-group-title">{title}</h3>
      <div className="overview-grid">
        {options.map((o) => <CityOptionCard key={o.view} option={o} setView={setView} />)}
      </div>
    </div>
  );
}

function CityOverview({ game, setView }: { game: GameState; setView: (view: View) => void }) {
  const countryServices = game.workServices.filter((service) => service.countryId === game.currentCountry.id);
  const workValue = game.character.activeWork
    ? isWorkReady(game.character.activeWork)
      ? "Recompensa pronta"
      : "Serviço em andamento"
    : `${countryServices.length} serviços`;
  const working = isWorkInProgress(game.character.activeWork);
  const dungeonUnlockedFloor = Math.max(
    1,
    Math.min(20, game.character.dungeonProgress?.unlockedFloorByCountry?.[game.currentCountry.id] ?? 1)
  );
  const combatOptions: CityOption[] = [
    { view: "hunt", icon: <GameIcon name="hunt" size={50} />, title: "Caçar", value: `${game.cityHuntLocations.length} locais` },
    { view: "arena", icon: <GameIcon name="arena" size={50} />, title: "Arena", value: working ? "Trabalhando" : `${game.arenaQueueSize} na fila`, disabled: working },
  ];
  if (game.currentCity.dungeonMonsterIds?.length) {
    combatOptions.push({
      view: "dungeon",
      icon: <GameIcon name="dungeon" size={50} />,
      title: "Masmorra",
      value: working ? "Trabalhando" : `Andar ${dungeonUnlockedFloor}/20`,
      disabled: working
    });
  }

  const actionOptions: CityOption[] = [
    { view: "agency", icon: <GameIcon name="agency" size={50} />, title: "Agência", value: workValue }
  ];

  if (game.currentCountry.id === "morthaly" && game.monarchEvent) {
    actionOptions.push({
      view: "monarch",
      icon: <GameIcon name="monarch" size={50} />,
      title: game.monarchEvent.isKing ? "Rei Litch" : "Monarca",
      value: working ? "Trabalhando" : game.monarchEvent.status === "active" ? `${game.monarchEvent.attemptsLimit - game.monarchEvent.attemptsUsed} entradas` : "Encerrado",
      disabled: working
    });
  }

  const inhabitantOptions: CityOption[] = [];
  
  if (game.currentCity.npcs.armorer) {
    inhabitantOptions.push(
      { view: "armorer", icon: <GameIcon name="armorer" size={50} />, title: game.currentCity.npcs.armorer ?? "Armeiro", value: `Meus equipamentos vão te acompanhar do início ao fim` });
  }

  if (game.currentCity.npcs.apothecary) {
    inhabitantOptions.push(
      { view: "apothecary", icon: <GameIcon name="apothecary" size={50} />, title: game.currentCity.npcs.apothecary ?? "Boticário", value: `As poções de cura são muito importantes` });
  }

  if (game.currentCity.blacksmithRecipeIds?.length || game.currentCity.blacksmithEnhancement) {
    inhabitantOptions.push({ view: "blacksmith", icon: <GameIcon name="blacksmith" size={50} />, title: game.currentCity.npcs.blacksmith ?? "Ferreiro", value: "Minha forja está pronta" });
  }

  if (game.currentCity.alchemistRecipeIds?.length) {
    inhabitantOptions.push({ view: "alchemist", icon: <GameIcon name="alchemist" size={50} />, title: game.currentCity.npcs.alchemist ?? "Alquimista", value: "Posso fabricar coisas interessantes" });
  }
  if (game.currentCity.npcs.moneyChanger) {
    inhabitantOptions.push({
      view: "moneyChanger",
      icon: <GameIcon name="moneyChanger" size={50} />,
      title: game.currentCity.npcs.moneyChanger ?? "Cambista",
      value: `Na minha mão é mais barato`
    });
  }

  if (game.currentCity.npcs.goldCoinMerchant && game.currentCity.goldCoinMerchantItemIds?.length) {
    actionOptions.push({
      view: "goldCoinMerchant",
      icon: <GameIcon name="goldCoinMerchant" size={50} />,
      title: game.currentCity.npcs.goldCoinMerchant,
      value: `Aceito apenas Moedas de Arena`
    });
  }

  return (
    <section className="content-panel city-overview">
      <CityGroup title="Combate" options={combatOptions} setView={setView} />
      <CityGroup title="Ações" options={actionOptions} setView={setView} />
      <CityGroup title="Habitantes" options={inhabitantOptions} setView={setView} />
    </section>
  );
}

function AgencyPanel({ game }: { game: GameState }) {
  const services = game.workServices.filter((service) => service.countryId === game.currentCountry.id);
  const [now, setNow] = useState(Date.now());
  const [minutesByService, setMinutesByService] = useState<Record<string, number>>({});

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const activeWork = game.character.activeWork ?? null;
  const activeService = activeWork ? game.workServices.find((service) => service.id === activeWork.serviceId) ?? null : null;
  const activeReady = isWorkReady(activeWork, now);
  const activeInCountry = !activeWork || activeWork.countryId === game.currentCountry.id;
  const currentCountryName = game.countries.find((country) => country.id === activeWork?.countryId)?.name ?? "outro país";
  const activeWorkMinutes = activeWork ? getWorkAssignmentMinutes(activeWork) : 0;

  return (
    <section className="content-panel agency-panel">
      <PanelTitle icon={<GameIcon name="agency" size={26} />} title={`Agência de ${game.currentCountry.name}`} />
      <p className="agency-intro">Escolha aqui o serviço que deseja realizar.</p>

      {activeWork && activeService && (
        <article className={activeReady ? "work-active-card ready" : "work-active-card"}>
          <div>
            <span className="eyebrow">Serviço atual</span>
            <h3>{activeService.name}</h3>
            <p>{activeService.description}</p>
          </div>
          <div className="work-active-meta">
            <span>{formatWorkMinutes(activeWorkMinutes)} contratados</span>
            <strong>{activeReady ? "Concluído" : formatDuration(activeWork.endsAt - now)}</strong>
          </div>
          <div className="work-progress-bar">
            <span style={{ width: `${activeReady ? 100 : getTimedProgress(activeWork.startedAt, activeWork.endsAt, now)}%` }} />
          </div>
          <div className="button-row">
            <button
              className="primary-button"
              disabled={!activeReady || !activeInCountry}
              onClick={() => socket.emit("work:claim")}
            >
              <GameIcon name="agency" size={16} className="button-game-icon" /> Receber recompensa
            </button>
            <button
              className="danger-button"
              onClick={() => {
                if (window.confirm("Abandonar o serviço e perder toda recompensa e aptidão deste expediente?")) {
                  socket.emit("work:abandon");
                }
              }}
            >
              Abandonar
            </button>
          </div>
          {!activeInCountry && <small className="level-warn">Volte para {currentCountryName} para receber este serviço.</small>}
        </article>
      )}

      <div className="agency-service-grid">
        {services.map((service) => {
          const aptitude = game.character.workAptitudes?.[service.id] ?? getDefaultWorkAptitude();
          const selectedMinutes = normalizeWorkMinutes(service, minutesByService[service.id] ?? service.minuteOptions[0] ?? service.minMinutes);
          const reward = calculateWorkReward(service, aptitude, selectedMinutes);
          const nextLevelHours = getHoursForNextWorkLevel(Math.max(1, aptitude.level));
          const progressPercent = aptitude.level <= 0 ? 0 : Math.min(100, Math.round((aptitude.progressHours / nextLevelHours) * 100));
          const bonusUnlocked = aptitude.level >= service.bonus.level;
          const periodicReady = isWorkBonusReady(game, service, now);

          return (
            <article className="agency-service-card" key={service.id}>
              <div className="agency-service-head">
                <div>
                  <span className="eyebrow">{service.specialty}</span>
                  <h3>{service.name}</h3>
                </div>
                <strong>Nv. {aptitude.level}</strong>
              </div>
              <p>{service.description}</p>
              <div className="work-aptitude">
                <span>{aptitude.level <= 0 ? "Primeiro serviço libera nível 1" : `${formatAptitudeHours(aptitude.progressHours)}/${formatAptitudeHours(nextLevelHours)} para o próximo nível`}</span>
                <div className="work-progress-bar">
                  <span style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
              <div className="work-hours-field">
                <span>Tempo de trabalho</span>
                <div className="work-hour-options" role="group" aria-label={`Tempo de trabalho para ${service.name}`}>
                  {service.minuteOptions.map((minutes) => (
                    <button
                      type="button"
                      key={minutes}
                      className={selectedMinutes === minutes ? "work-hour-option selected" : "work-hour-option"}
                      disabled={Boolean(activeWork)}
                      onClick={() => setMinutesByService((current) => ({ ...current, [service.id]: minutes }))}
                    >
                      {formatWorkMinutes(minutes)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="work-reward-list">
                {renderWorkReward(game, reward)}
              </div>
              <div className={bonusUnlocked ? "work-bonus unlocked" : "work-bonus"}>
                <strong>Bônus Nv. {service.bonus.level}</strong>
                <span>{service.bonus.description}</span>
                {service.bonus.periodicReward && bonusUnlocked && (
                  <button
                    className="ghost-button"
                    disabled={!periodicReady}
                    onClick={() => socket.emit("work:claimBonus", { serviceId: service.id })}
                  >
                    {periodicReady ? "Resgatar bônus" : `Pronto em ${formatDuration(getWorkBonusReadyAt(game, service) - now)}`}
                  </button>
                )}
              </div>
              <button
                className="primary-button"
                disabled={Boolean(activeWork)}
                onClick={() => socket.emit("work:start", { serviceId: service.id, minutes: selectedMinutes })}
              >
                Iniciar serviço
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function MissionsPanel({ game }: { game: GameState }) {
  const [activeFilter, setActiveFilter] = useState<QuestCategory | "all">("all");
  const allQuests = [...game.quests.daily, ...game.quests.fixed];
  const filters = (["all", "combat", "work", "monarch", "arena", "enhancement", "market", "shop", "potion", "level"] as Array<QuestCategory | "all">)
    .filter((filter) => filter === "all" || allQuests.some((quest) => quest.category === filter));
  const dailyQuests = filterQuestsByCategory(game.quests.daily, activeFilter);
  const fixedQuests = filterQuestsByCategory(game.quests.fixed, activeFilter);
  const filteredCount = dailyQuests.length + fixedQuests.length;

  return (
    <section className="content-panel missions-panel">
      <PanelTitle icon={<GameIcon name="missions" size={26} />} title="Missões" />
      <div className="quest-filter-tabs" role="tablist" aria-label="Filtros de missões">
        {filters.map((filter) => {
          const count = filter === "all" ? allQuests.length : allQuests.filter((quest) => quest.category === filter).length;
          return (
            <button
              type="button"
              key={filter}
              className={activeFilter === filter ? "mini-tab active" : "mini-tab"}
              onClick={() => setActiveFilter(filter)}
            >
              {QUEST_FILTER_LABELS[filter]} <span>{count}</span>
            </button>
          );
        })}
      </div>
      {filteredCount === 0 ? (
        <p className="empty-state">Nenhuma missão neste filtro.</p>
      ) : (
        <>
          <QuestSection title="Diárias" quests={dailyQuests} />
          <QuestSection title="Fixas" quests={fixedQuests} />
        </>
      )}
    </section>
  );
}

function filterQuestsByCategory(quests: QuestView[], filter: QuestCategory | "all") {
  return filter === "all" ? quests : quests.filter((quest) => quest.category === filter);
}

function QuestSection({ title, quests }: { title: string; quests: QuestView[] }) {
  if (quests.length === 0) return null;
  const sectionComplete = quests.length > 0 && quests.every((quest) => quest.claimed);
  const claimable = countClaimable(quests);
  const completed = quests.filter((quest) => quest.completed || quest.claimed).length;
  const [collapsed, setCollapsed] = useState(sectionComplete);

  useEffect(() => {
    if (sectionComplete) {
      setCollapsed(true);
    } else {
      setCollapsed(false);
    }
  }, [sectionComplete]);

  const sorted = [...quests].sort((a, b) => {
    // Priority: claimable (completed & !claimed) → highest % → claimed
    const aPri = a.completed && !a.claimed ? 0 : a.claimed ? 2 : 1;
    const bPri = b.completed && !b.claimed ? 0 : b.claimed ? 2 : 1;
    if (aPri !== bPri) return aPri - bPri;
    return b.progress / b.target - a.progress / a.target;
  });
  return (
    <section className="quest-section">
      <button className="quest-section-header" type="button" onClick={() => setCollapsed((current) => !current)}>
        {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
        <h3>{title}</h3>
        <span>{completed}/{quests.length}</span>
        {claimable > 0 && <b>{claimable}</b>}
      </button>
      {!collapsed && <div className="quest-list">
        {sorted.map((quest) => {
          const progress = Math.min(100, Math.round((quest.progress / quest.target) * 100));
          return (
            <article className={quest.claimed ? "quest-row claimed" : "quest-row"} key={quest.id}>
              <strong className="quest-title">{quest.title}</strong>
              <div className="quest-card-body">
                <div className="quest-main">
                  <span>{quest.description}</span>
                  <div className="quest-card-meta">
                    <small className="quest-category-tag">{QUEST_FILTER_LABELS[quest.category]}</small>
                    <div className="quest-reward">
                      {quest.reward.experience ? <span>{quest.reward.experience} XP</span> : null}
                      {quest.reward.gold ? <span>{quest.reward.gold} <Coins size={12} style={{ color: "var(--gold)" }} /></span> : null}
                      {quest.reward.diamonds ? <span>{quest.reward.diamonds} <Gem size={12} style={{ color: "var(--cyan)" }} /></span> : null}
                    </div>
                  </div>
                </div>
                <button
                  className="primary-button quest-claim-button"
                  disabled={!quest.completed || quest.claimed}
                  onClick={() => socket.emit("quest:claim", { questId: quest.id })}
                >
                  {quest.claimed ? "Resgatada" : "Resgatar"}
                </button>
              </div>
              <div className="quest-progress">
                <i>
                  <b style={{ width: `${progress}%` }} />
                </i>
                <small>
                  {quest.progress}/{quest.target}
                </small>
              </div>
            </article>
          );
        })}
      </div>}
    </section>
  );
}

const CRAFT_COMMON_CHANCE = 1 - RARITY_CHANCES.uncommon - RARITY_CHANCES.rare - RARITY_CHANCES.epic - RARITY_CHANCES.legendary;

const CRAFT_RARITY_TABLE: Array<{ rarity: Rarity; pct: number }> = [
  { rarity: "common", pct: Math.round(CRAFT_COMMON_CHANCE * 100) },
  { rarity: "uncommon", pct: Math.round(RARITY_CHANCES.uncommon * 100) },
  { rarity: "rare", pct: Math.round(RARITY_CHANCES.rare * 100) },
  { rarity: "epic", pct: Math.round(RARITY_CHANCES.epic * 100) },
  { rarity: "legendary", pct: Math.round(RARITY_CHANCES.legendary * 100) },
];

const CRAFT_ANIMATION_MS = 2400;

function CraftingPanel({ game, station }: { game: GameState; station: "blacksmith" | "alchemist" }) {
  const recipes = game.availableCraftingRecipes[station];
  const [selectedRecipeId, setSelectedRecipeId] = useState("");
  const [craftedRecipePulseId, setCraftedRecipePulseId] = useState("");
  const [craftingRecipeId, setCraftingRecipeId] = useState("");
  const title = station === "blacksmith" ? "Ferreiro" : "Alquimista";
  const icon = station === "blacksmith" ? <GameIcon name="blacksmith" size={26} /> : <GameIcon name="alchemist" size={26} />;
  const npcName = station === "blacksmith" ? game.currentCity.npcs.blacksmith : game.currentCity.npcs.alchemist;

  useEffect(() => {
    if (recipes.length === 0) {
      setSelectedRecipeId("");
      return;
    }
    if (selectedRecipeId && !recipes.some((recipe) => recipe.id === selectedRecipeId)) {
      setSelectedRecipeId("");
    }
  }, [recipes, selectedRecipeId]);

  const recipeEntries = recipes.map((recipe) => {
    const result = game.itemCatalog[recipe.resultItemId];
    const craftableByMaterials = recipe.ingredients.reduce((minCrafts, ingredient) => {
      const owned = countInventoryItem(game, ingredient.itemId);
      return Math.min(minCrafts, Math.floor(owned / ingredient.quantity));
    }, Number.POSITIVE_INFINITY);
    const hasMaterials = craftableByMaterials > 0;
    const canCraft = hasMaterials && game.character.gold >= recipe.goldCost;
    const craftableTotal = craftableByMaterials * recipe.resultQuantity;
    return { recipe, result, hasMaterials, canCraft, craftableTotal };
  });

  const selectedEntry = recipeEntries.find((entry) => entry.recipe.id === selectedRecipeId) ?? null;
  const selectedResult = selectedEntry?.result;
  const selectedRecipe = selectedEntry?.recipe;
  const selectedIsEquipment = Boolean(selectedResult?.slot);
  const selectedStatEntries = selectedIsEquipment
    ? EQUIPMENT_STAT_KEYS
        .map((key) => ({ key, label: EQUIPMENT_STAT_LABELS[key], value: selectedResult?.stats?.[key] }))
        .filter((entry) => entry.value != null && (entry.value as number) !== 0)
    : [];

  function handleCreate(recipeId: string) {
    socket.emit("craft:create", { recipeId });
    setCraftingRecipeId(recipeId);
    setCraftedRecipePulseId(recipeId);
    window.setTimeout(() => {
      setCraftedRecipePulseId((current) => (current === recipeId ? "" : current));
      setCraftingRecipeId((current) => (current === recipeId ? "" : current));
    }, CRAFT_ANIMATION_MS);
  }

  return (
    <section className="content-panel">
      <PanelTitle icon={icon} title={title} />
      {npcName && (
        <div className="npc-banner">
          <User size={18} />
          <span>{npcName}</span>
        </div>
      )}
      {station === "blacksmith" && game.currentCity.blacksmithEnhancement && <EquipmentEnhancementPanel game={game} />}
      <div className="crafting-panel-layout">
        <div className="crafting-grid" role="list" aria-label="Itens criáveis">
          {recipeEntries.map(({ recipe, result, hasMaterials, craftableTotal }) => {
            const selected = selectedRecipeId === recipe.id;
            return (
              <button
                type="button"
                key={recipe.id}
                role="listitem"
                className={`craft-grid-item${selected ? " selected" : ""}${hasMaterials ? " ready" : ""}${craftedRecipePulseId === recipe.id ? " craft-created-burst" : ""}`}
                onClick={() => setSelectedRecipeId(recipe.id)}
                aria-label={recipe.name}
              >
                <ItemVisual item={result} className="craft-grid-art" quantity={recipe.resultQuantity} />
                {hasMaterials && <span className="asset-qty craft-grid-total">x{craftableTotal}</span>}
              </button>
            );
          })}
        </div>

        {selectedEntry && selectedResult && selectedRecipe && (
          <article className={`entity-card craft-recipe-card craft-detail-card${craftedRecipePulseId === selectedRecipe.id ? " craft-created-burst" : ""}`}>
            <div className="craft-result-header">
              <ItemVisual item={selectedResult} className="craft-result-art" quantity={selectedRecipe.resultQuantity} />
              <div className="craft-result-info">
                <strong>{selectedRecipe.name}</strong>
                <span>{selectedResult.name}{selectedRecipe.resultQuantity > 1 ? ` x${selectedRecipe.resultQuantity}` : ""}</span>
                {selectedResult.description && <p className="craft-result-desc">{selectedResult.description}</p>}
                <div className="craft-result-meta">
                  {selectedResult.minLevel != null && <small>Nível {selectedResult.minLevel}</small>}
                </div>
              </div>
            </div>

            {selectedStatEntries.length > 0 && (
              <div className="recipe-ingredients">
                {selectedStatEntries.map(({ key, label, value }) => (
                  <small key={key}>
                    {getGuideItemStatIcon(key as keyof typeof EQUIPMENT_STAT_LABELS)} {label}: <b>{value as number}</b>
                  </small>
                ))}
              </div>
            )}

            {selectedIsEquipment && (
              <div className="craft-rarity-table">
                <span className="craft-rarity-label">Chances de raridade</span>
                <div className="craft-rarity-row">
                  {CRAFT_RARITY_TABLE.map(({ rarity, pct }) => (
                    <span key={rarity} className={`item-rarity ${rarity}`}>{RARITY_LABELS[rarity]} {pct}%</span>
                  ))}
                </div>
              </div>
            )}

            <div className="recipe-ingredients">
              {selectedRecipe.ingredients.map((ingredient) => {
                const ingItem = game.itemCatalog[ingredient.itemId];
                const owned = countInventoryItem(game, ingredient.itemId);
                const hasEnough = owned >= ingredient.quantity;
                return (
                  <small key={ingredient.itemId} className={hasEnough ? "" : "ingredient-missing"}>
                    <ItemVisual item={ingItem} className="ingredient-art" />
                    {ingItem?.name}: <b>{owned}/{ingredient.quantity}</b>
                  </small>
                );
              })}
              <small className={game.character.gold >= selectedRecipe.goldCost ? "" : "ingredient-missing"}>
                <Coins size={15} style={{ color: "var(--gold)" }} /> {game.character.gold}/{selectedRecipe.goldCost}
              </small>
            </div>

            <button
              className={`primary-button craft-create-button${craftingRecipeId === selectedRecipe.id ? " is-building" : ""}`}
              disabled={!selectedEntry.canCraft || craftingRecipeId === selectedRecipe.id}
              onClick={() => handleCreate(selectedRecipe.id)}
            >
              {craftingRecipeId === selectedRecipe.id ? (
                <>
                  <Hammer size={15} className="craft-building-icon" /> Construindo...
                </>
              ) : (
                "Criar"
              )}
            </button>
          </article>
        )}

        {recipes.length === 0 && <p className="empty-state">Nenhuma receita disponível nesta cidade.</p>}
      </div>
    </section>
  );
}

function EquipmentEnhancementPanel({ game }: { game: GameState }) {
  const equipmentItems = game.character.inventory.filter((entry) => Boolean(game.itemCatalog[entry.itemId]?.slot));
  const [selectedInstanceId, setSelectedInstanceId] = useState("");
  const [creationStones, setCreationStones] = useState(0);
  const [enhancementFx, setEnhancementFx] = useState<{ kind: "success" | "failure"; token: number } | null>(null);
  const [enhanceBusy, setEnhanceBusy] = useState(false);
  const enhancementFxTimerRef = useRef<number | null>(null);
  const selectedEntry = equipmentItems.find((entry) => entry.instanceId === selectedInstanceId) ?? null;
  const selectedItem = selectedEntry ? game.itemCatalog[selectedEntry.itemId] : null;
  const creationStoneItem = game.itemCatalog[ENHANCEMENT_ITEMS.creationStone];
  const creationStonesOwned = countInventoryItem(game, ENHANCEMENT_ITEMS.creationStone);
  const plan = selectedEntry ? getEnhancementPlanForUi(game, selectedEntry, creationStones) : null;
  const rangeLabel = describeEnhancementLevelRange(game.currentCountry.id);
  const currentStats = selectedItem && selectedEntry ? getEnhancedItemStats(selectedItem, selectedEntry) : null;
  const nextStats = selectedItem && selectedEntry && plan
    ? getEnhancedItemStats(selectedItem, { ...selectedEntry, enhancementLevel: plan.nextLevel })
    : null;
  const requirementsMet = Boolean(plan?.requirements.every((requirement) => countInventoryItem(game, requirement.itemId) >= requirement.quantity));
  const canEnhance = Boolean(selectedEntry && selectedItem && plan?.allowed && requirementsMet && game.character.gold >= plan.goldCost);

  useEffect(() => {
    if (selectedInstanceId && !equipmentItems.some((entry) => entry.instanceId === selectedInstanceId)) {
      setSelectedInstanceId("");
    }
  }, [equipmentItems, selectedInstanceId]);

  useEffect(() => {
    if (plan && creationStones > plan.maxCreationStones) {
      setCreationStones(plan.maxCreationStones);
    }
  }, [creationStones, plan]);

  useEffect(() => {
    const handleEnhancementResult = (payload: { success: boolean }) => {
      setEnhanceBusy(false);
      const kind = payload.success ? "success" : "failure";
      setEnhancementFx({ kind, token: Date.now() });
      if (enhancementFxTimerRef.current) {
        window.clearTimeout(enhancementFxTimerRef.current);
      }
      enhancementFxTimerRef.current = window.setTimeout(() => setEnhancementFx(null), 1450);
    };

    const handleEnhancementErrorFallback = (payload: { message: string }) => {
      if (!payload?.message) {
        return;
      }
      if (payload.message.includes("Aprimoramento") || payload.message.includes("aprimorado para +")) {
        setEnhanceBusy(false);
      }
    };

    socket.on("blacksmith:enhanceResult", handleEnhancementResult);
    socket.on("game:error", handleEnhancementErrorFallback);

    return () => {
      socket.off("blacksmith:enhanceResult", handleEnhancementResult);
      socket.off("game:error", handleEnhancementErrorFallback);
      if (enhancementFxTimerRef.current) {
        window.clearTimeout(enhancementFxTimerRef.current);
      }
    };
  }, []);

  const handleEnhance = () => {
    if (!selectedEntry || !plan || !canEnhance || enhanceBusy) {
      return;
    }
    setEnhanceBusy(true);
    socket.emit("blacksmith:enhance", { instanceId: selectedEntry.instanceId, creationStones: plan.creationStones });
  };

  if (equipmentItems.length === 0) {
    return (
      <section className="enhancement-panel">
        <div className="enhancement-head">
          <Hammer size={18} />
          <div>
            <strong>Aprimorar equipamento</strong>
            <span>Este ferreiro trabalha de {rangeLabel}. Nenhum equipamento no inventário.</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="enhancement-panel">
      <div className="enhancement-head">
        <Hammer size={18} />
        <div>
          <strong>Aprimorar equipamento</strong>
          <span>Este ferreiro trabalha de {rangeLabel}. +20% nos atributos por aprimoramento.</span>
        </div>
      </div>

      <div className="enhancement-selector">
        <span>Escolha o equipamento</span>
        <div className="enhancement-item-grid" role="listbox" aria-label="Equipamentos disponíveis para aprimorar">
          {equipmentItems.map((entry) => {
            const item = game.itemCatalog[entry.itemId];
            const selected = selectedInstanceId === entry.instanceId;
            const equipped = isItemEquipped(game, entry.instanceId);
            const rarityColor = getEquipmentRarityColor(item, entry.rarity);
            const enhancement = Math.max(0, entry.enhancementLevel ?? 0);
            const enhancementClasses = [
              enhancement >= 4 ? "enhance-tier-4" : "",
              enhancement >= 7 ? "enhance-tier-7" : "",
              enhancement >= 10 ? "enhance-tier-10" : "",
              enhancement >= 13 ? "enhance-tier-13" : ""
            ].filter(Boolean).join(" ");
            return (
              <button
                key={entry.instanceId}
                type="button"
                className={`inv-slot enhancement-select-slot${selected ? " selected" : ""}${equipped ? " equipped" : ""} ${enhancementClasses}`}
                title={formatInventoryItemName(item, entry)}
                aria-selected={selected}
                style={rarityColor ? ({ borderColor: rarityColor, "--rarity-color": rarityColor } as React.CSSProperties) : undefined}
                onClick={() => setSelectedInstanceId(selected ? "" : entry.instanceId)}
              >
                <ItemVisual item={item} className="slot-visual" enhancementLevel={entry.enhancementLevel} rarity={entry.rarity} />
                {equipped && <span className="enhancement-equipped-badge">E</span>}
                {enhancement >= 10 && <span className="inv-slot-light-sweep" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
        <small className="enhancement-selector-hint">Clique em um item da grade para abrir os detalhes do aprimoramento.</small>
      </div>

      {selectedEntry && selectedItem && plan && currentStats && nextStats && (
        <div className="enhancement-grid">
          <div className={`enhancement-item-card${enhancementFx ? ` fx-${enhancementFx.kind}` : ""}`}>
            <ItemVisual item={selectedItem} className="enhancement-item-visual" enhancementLevel={selectedEntry.enhancementLevel} rarity={selectedEntry.rarity} />
            <div>
              <strong>{formatInventoryItemName(selectedItem, selectedEntry)}</strong>
              <span>Próximo: +{plan.nextLevel}</span>
            </div>
          </div>

          <div className="enhancement-stat-preview">
            {EQUIPMENT_STAT_KEYS.map((key) => {
              const current = currentStats[key] ?? 0;
              const next = nextStats[key] ?? 0;
              if (current <= 0 && next <= 0) {
                return null;
              }
              return (
                <div key={key}>
                  <span>{EQUIPMENT_STAT_LABELS[key]}</span>
                  <strong>{current} {"->"} {next}</strong>
                </div>
              );
            })}
          </div>

          <div className="enhancement-costs">
            <small>
              <Coins size={13} style={{ color: "var(--gold)" }} />
              {formatCurrency(plan.goldCost)} gold
            </small>
            {plan.requirements.map((requirement) => {
              const owned = countInventoryItem(game, requirement.itemId);
              const item = game.itemCatalog[requirement.itemId];
              return (
                <small className={owned < requirement.quantity ? "missing" : ""} key={requirement.itemId}>
                  <span className="enhancement-cost-material">
                    {item ? <ItemVisual item={item} className="enhancement-cost-item-visual" /> : null}
                    {item?.name ?? requirement.itemId}
                  </span>
                  <b>{owned}/{requirement.quantity}</b>
                </small>
              );
            })}
          </div>

          {!plan.allowed && (
            <div className="enhancement-warning">
              <Info size={15} />
              <span>{plan.blockReason}</span>
            </div>
          )}

          <div className="enhancement-boost">
            <label>
              <span className="enhancement-creation-stone-label">
                {creationStoneItem ? <ItemVisual item={creationStoneItem} className="enhancement-cost-item-visual" /> : null}
                Pedras de Criação (+{ENHANCEMENT_CREATION_STONE_BONUS}% cada)
                <small className="enhancement-creation-stone-owned">Você tem: {creationStonesOwned}</small>
              </span>
              <input
                type="number"
                min={0}
                max={plan.maxCreationStones}
                value={creationStones}
                disabled={plan.maxCreationStones <= 0}
                onChange={(event) => setCreationStones(Math.max(0, Math.min(plan.maxCreationStones, Number(event.target.value) || 0)))}
              />
            </label>
            <div className="enhancement-chance">
              <span>Base {plan.baseChance}%</span>
              <strong>{plan.successChance}%</strong>
            </div>
          </div>

          <button
            className="primary-button"
            disabled={!canEnhance || enhanceBusy}
            title={plan.allowed ? "Aprimorar equipamento" : plan.blockReason}
            onClick={handleEnhance}
          >
            {enhanceBusy ? "Aprimorando..." : "Aprimorar"}
          </button>

          {enhancementFx && (
            <div key={enhancementFx.token} className={`enhancement-result-fx ${enhancementFx.kind}`} aria-hidden="true">
              <span className="enhancement-result-ring" />
              <span className="enhancement-result-wave" />
              <strong>{enhancementFx.kind === "success" ? "SUCESSO" : "FALHA"}</strong>
            </div>
          )}
        </div>
      )}

      {!selectedEntry && <p className="enhancement-empty-selection">Selecione um equipamento para visualizar custos e chance de sucesso.</p>}
    </section>
  );
}

function DungeonPanel({ game }: { game: GameState }) {
  const activeRun = game.character.dungeonProgress?.activeRun ?? null;
  const currentCountryId = game.currentCountry.id;
  const unlockedByCountry = game.character.dungeonProgress?.unlockedFloorByCountry ?? {};
  const unlockedFloor = Math.max(1, Math.min(20, unlockedByCountry[currentCountryId] ?? 1));
  const [selectedFloor, setSelectedFloor] = useState(unlockedFloor);
  const [now, setNow] = useState(Date.now());
  const [dungeonSuccessFx, setDungeonSuccessFx] = useState<{ token: number; floor: number } | null>(null);
  const dungeonKeys = countInventoryItem(game, "misc_dungeon_key");
  const currentRoom = activeRun && activeRun.roomIndex < activeRun.rooms.length ? activeRun.rooms[activeRun.roomIndex] : null;
  const dungeonBattleActive = game.activeBattle?.mode === "dungeon";
  const previousRunRef = useRef<typeof activeRun>(activeRun);
  const previousClearsRef = useRef(game.character.dungeonClears);
  const previousUnlockedRef = useRef(unlockedFloor);

  useEffect(() => {
    if (selectedFloor > unlockedFloor) {
      setSelectedFloor(unlockedFloor);
    }
  }, [selectedFloor, unlockedFloor]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const completedRun =
      Boolean(previousRunRef.current) &&
      !activeRun &&
      (game.character.dungeonClears > previousClearsRef.current || unlockedFloor > previousUnlockedRef.current);

    if (completedRun && previousRunRef.current) {
      setDungeonSuccessFx({ token: Date.now(), floor: previousRunRef.current.floor });
    }

    previousRunRef.current = activeRun;
    previousClearsRef.current = game.character.dungeonClears;
    previousUnlockedRef.current = unlockedFloor;
  }, [activeRun, game.character.dungeonClears, unlockedFloor]);

  useEffect(() => {
    if (!dungeonSuccessFx) return;
    const timer = window.setTimeout(() => setDungeonSuccessFx(null), 2200);
    return () => window.clearTimeout(timer);
  }, [dungeonSuccessFx]);

  const lastAutoHordeKeyRef = useRef<string | null>(null);
  useEffect(() => {
    if (!activeRun || !currentRoom || currentRoom.type !== "horde" || game.activeBattle) return;
    const key = `${activeRun.floor}:${activeRun.roomIndex}`;
    if (lastAutoHordeKeyRef.current === key) return;
    lastAutoHordeKeyRef.current = key;
    const timer = window.setTimeout(() => socket.emit("dungeon:advance"), 500);
    return () => window.clearTimeout(timer);
  }, [activeRun?.floor, activeRun?.roomIndex, currentRoom?.type, game.activeBattle]);

  const floorButtons = Array.from({ length: 20 }, (_, index) => index + 1);
  const dungeonKeyDefinition = game.itemCatalog["misc_dungeon_key"];
  const floorDoorOpenIconUrl = "/assets/dungeon/open_floor.png";
  const floorDoorClosedIconUrl = "/assets/dungeon/closed-floor.png";
  const floorBossIconUrl = "/assets/dungeon/boss.png";

  const buffChips: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
    heal_full: { label: "Vida total", icon: <Heart size={13} />, cls: "buff-heal" },
    damage_50: { label: "+50% dano", icon: <Flame size={13} />, cls: "buff-damage" },
    defense_10: { label: "+10% defesa", icon: <Shield size={13} />, cls: "buff-defense" },
    agility_20: { label: "+20% agilidade", icon: <Zap size={13} />, cls: "buff-agility" },
    strength_20: { label: "+20% força", icon: <Swords size={13} />, cls: "buff-strength" },
  };
  const trapChips: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
    hp_20: { label: "-20% vida", icon: <Skull size={13} />, cls: "trap-hp" },
    agility_20: { label: "-20% agilidade", icon: <Zap size={13} />, cls: "trap-agility" },
    defense_20: { label: "-20% defesa", icon: <Shield size={13} />, cls: "trap-defense" },
  };
  const buffLabels: Record<string, string> = {
    heal_full: "Regenerar toda a vida",
    damage_50: "+50% dano",
    defense_10: "+10% defesa",
    agility_20: "+20% agilidade",
    strength_20: "+20% força"
  };
  const trapLabels: Record<string, string> = {
    hp_20: "Armadilha: -20% vida",
    agility_20: "Armadilha: -20% agilidade",
    defense_20: "Armadilha: -20% defesa"
  };

  const roomTypeLabel: Record<string, string> = {
    horde: "Horda",
    boss: "Chefe",
    chest: "Baú",
    buff: "Buff",
    trap: "Armadilha"
  };

  const roomPresentation = currentRoom
    ? {
        horde: {
          art: "/assets/dungeon/boss.png",
          accentClass: "dungeon-room-horde",
          title: "Emboscada",
          subtitle: `${currentRoom.monsterIds?.length ?? 0} inimigo(s) avançam de surpresa.`
        },
        boss: {
          art: "/assets/dungeon/boss.png",
          accentClass: "dungeon-room-boss",
          title: "Sala final",
          subtitle: "O chefe aguarda no centro da arena."
        },
        chest: {
          art: "/assets/dungeon/chest.png",
          accentClass: "dungeon-room-chest",
          title: "Sala do baú",
          subtitle: "As recompensas já estão visíveis antes da abertura."
        },
        buff: {
          art: "/assets/dungeon/buff.png",
          accentClass: "dungeon-room-buff",
          title: "Sala de buff",
          subtitle: buffLabels[currentRoom.buff ?? ""] ?? "Uma bênção o aguarda."
        },
        trap: {
          art: "/assets/dungeon/trap.png",
          accentClass: "dungeon-room-trap",
          title: "Sala de armadilha",
          subtitle: trapLabels[currentRoom.trap ?? ""] ?? "Algo ruim está no caminho."
        }
      }[currentRoom.type]
    : null;

  const roomDescription = currentRoom
    ? currentRoom.type === "horde"
      ? `${currentRoom.monsterIds?.length ?? 0} inimigo(s) aguardam nesta sala.`
      : currentRoom.type === "boss"
        ? "O chefe do andar está nesta sala."
        : currentRoom.type === "chest"
          ? `Baú com ${currentRoom.rewards?.length ?? 0} recompensa(s) possível(is).`
          : currentRoom.type === "buff"
            ? buffLabels[currentRoom.buff ?? ""] ?? "Uma benção espera por você."
            : trapLabels[currentRoom.trap ?? ""] ?? "Uma armadilha bloqueia o caminho."
    : "";

  const roomActionLabel = currentRoom
    ? currentRoom.type === "boss"
      ? "Enfrentar o Chefe"
      : "Próxima Sala"
    : "Próxima Sala";

  const roomTimeLeftMs = activeRun?.roomDeadlineAt ? Math.max(0, activeRun.roomDeadlineAt - now) : 0;
  const roomTimeLeftLabel = activeRun ? `${Math.max(0, Math.ceil(roomTimeLeftMs / 1000))}s` : "";

  const chestRewardItems =
    currentRoom?.type === "chest" && currentRoom.rewards
      ? currentRoom.rewards
          .map((r) => {
            const def = game.itemCatalog[r.itemId];
            if (!def) return null;
            return { def, rarity: (r.rarity ?? "common") as Rarity, quantity: r.quantity };
          })
          .filter(Boolean) as Array<{ def: ItemDefinition; rarity: Rarity; quantity: number }>
      : [];

  const pendingRewardItems = activeRun
    ? activeRun.pendingItems
        .map((reward) => {
          const definition = game.itemCatalog[reward.itemId];
          if (!definition) {
            return null;
          }
          return {
            id: `${reward.itemId}:${reward.rarity ?? "stack"}`,
            label: `${definition.name}${reward.quantity > 1 ? ` x${reward.quantity}` : ""}`,
            rarity: reward.rarity
          };
        })
        .filter(Boolean) as Array<{ id: string; label: string; rarity?: Rarity }>
    : [];

  return (
    <section className="content-panel dungeon-run-panel">
      <PanelTitle icon={<GameIcon name="dungeon" size={26} />} title="Masmorra" />
      <div className="dungeon-summary-card">
        <span>País: <strong>{game.currentCountry.name}</strong></span>
        <span>Andar liberado: <strong>{unlockedFloor}/20</strong></span>
        <span className="dungeon-keys-summary">
          <span className="dungeon-key-item-icon" aria-hidden="true">
            <AssetImage
              src={dungeonKeyDefinition?.imageUrl}
              alt="Chave da masmorra"
              fallback={<KeyRound size={13} />}
            />
          </span>
          <strong>x{dungeonKeys}</strong>
        </span>
      </div>

      {dungeonSuccessFx && (
        <div key={dungeonSuccessFx.token} className="dungeon-success-fx" role="status" aria-live="polite">
          <span className="dungeon-success-burst" aria-hidden="true" />
          <strong>Andar {dungeonSuccessFx.floor} concluído!</strong>
          <small>Espólios entregues com sucesso.</small>
        </div>
      )}

      {!activeRun && (
        <>
          <div className="dungeon-floor-grid">
            {floorButtons.map((floor) => {
              const floorCompleted = floor < unlockedFloor;
              const floorIconUrl = floor === 20
                ? floorBossIconUrl
                : floorCompleted ? floorDoorOpenIconUrl : floorDoorClosedIconUrl;
              const floorCanEnter = !activeRun && game.character.currentHp > 0 && dungeonKeys > 0 && floor <= unlockedFloor;
              return (
                <div key={floor} className={`dungeon-floor-slot${selectedFloor === floor ? " selected" : ""}`}>
                  <button
                    type="button"
                    className={`mini-tab dungeon-floor-btn${selectedFloor === floor ? " active" : ""}${floor > unlockedFloor ? " locked" : ""}`}
                    disabled={floor > unlockedFloor || Boolean(activeRun)}
                    onClick={() => setSelectedFloor(floor)}
                  >
                    <span className="dungeon-floor-btn-icon" aria-hidden="true">
                      <AssetImage src={floorIconUrl} alt="Escada" fallback={"#"} style={{ width: "100%", height: "100%" }} />
                    </span>
                    <span className="dungeon-floor-btn-label">Andar</span>
                    <strong>{floor}</strong>
                  </button>

                  {selectedFloor === floor && (
                    <div className="dungeon-floor-entry">
                      <button
                        className="primary-button"
                        disabled={!floorCanEnter}
                        onClick={() => socket.emit("dungeon:start", { floor })}
                      >
                        <span className="dungeon-entry-floor-icon" aria-hidden="true">
                          <AssetImage src={dungeonKeyDefinition?.imageUrl} alt="Chave da masmorra" fallback={<KeyRound size={13} />} style={{ width: "100%", height: "100%" }} />
                        </span>
                        Entrar no andar {floor}
                      </button>
                      {!floorCanEnter && <small className="muted">Requer vida acima de zero e pelo menos 1 Chave de Masmorra.</small>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {activeRun && activeRun.countryId === currentCountryId && (
        <section className="dungeon-active-run">
          <h3>Andar em andamento</h3>
          <p>Andar {activeRun.floor} • Sala {Math.min(activeRun.roomIndex + 1, activeRun.rooms.length)}/{activeRun.rooms.length}</p>
          <p className={roomTimeLeftMs <= 10_000 ? "dungeon-room-timer danger" : "dungeon-room-timer"}>
            Tempo restante para avançar: <strong>{roomTimeLeftLabel}</strong>
          </p>
          <div className="dungeon-active-modifiers">
            <strong>Buffs ativos:</strong>
            {activeRun.activeBuffs.length > 0
              ? activeRun.activeBuffs.map((buff) => {
                  const chip = buffChips[buff];
                  return chip
                    ? <span key={buff} className={`dungeon-effect-chip ${chip.cls}`}>{chip.icon}{chip.label}</span>
                    : <span key={buff} className="item-rarity epic">{buffLabels[buff] ?? buff}</span>;
                })
              : <span className="muted">Nenhum</span>}
          </div>
          <div className="dungeon-active-modifiers">
            <strong>Debuffs ativos:</strong>
            {activeRun.activeTraps.length > 0
              ? activeRun.activeTraps.map((trap) => {
                  const chip = trapChips[trap];
                  return chip
                    ? <span key={trap} className={`dungeon-effect-chip ${chip.cls}`}>{chip.icon}{chip.label}</span>
                    : <span key={trap} className="item-rarity rare">{trapLabels[trap] ?? trap}</span>;
                })
              : <span className="muted">Nenhum</span>}
          </div>
          {currentRoom && (
            <div key={activeRun.roomIndex} className={`dungeon-room-preview dungeon-room-enter ${roomPresentation?.accentClass ?? ""}`}>
              <div className="dungeon-room-hero">
                <div className="dungeon-room-art-shell">
                  <img className="dungeon-room-art" src={roomPresentation?.art ?? "/assets/dungeon/boss.png"} alt="" loading="lazy" decoding="async" />
                  <span className="dungeon-room-art-sheen" aria-hidden="true" />
                </div>
                <div className="dungeon-room-copy">
                  <span className="item-rarity legendary">{roomTypeLabel[currentRoom.type] ?? currentRoom.type}</span>
                  <strong>{roomPresentation?.title ?? (currentRoom.type === "boss" ? "Sala final" : `Sala ${currentRoom.index + 1}`)}</strong>
                  <p>{roomPresentation?.subtitle ?? roomDescription}</p>
                </div>
              </div>

              <div className="dungeon-room-body">
                {currentRoom.type === "chest" && chestRewardItems.length > 0 && (
                  <div className="dungeon-chest-item-grid">
                    {chestRewardItems.map((item) => (
                      <div key={item.def.id} className={`dungeon-chest-item-card rarity-${item.rarity}`}>
                        <ItemVisual item={item.def} className="chest-item-visual" rarity={item.rarity} quantity={item.quantity > 1 ? item.quantity : undefined} />
                        <span className="chest-item-name">{item.def.name}</span>
                      </div>
                    ))}
                  </div>
                )}
                {(currentRoom.type === "buff") && currentRoom.buff && buffChips[currentRoom.buff] && (
                  <span className={`dungeon-effect-chip ${buffChips[currentRoom.buff]!.cls}`}>
                    {buffChips[currentRoom.buff]!.icon}{buffChips[currentRoom.buff]!.label}
                  </span>
                )}
                {(currentRoom.type === "trap") && currentRoom.trap && trapChips[currentRoom.trap] && (
                  <span className={`dungeon-effect-chip ${trapChips[currentRoom.trap]!.cls}`}>
                    {trapChips[currentRoom.trap]!.icon}{trapChips[currentRoom.trap]!.label}
                  </span>
                )}
                {!dungeonBattleActive && currentRoom.type !== "horde" && (
                  <button className="primary-button" onClick={() => socket.emit("dungeon:advance")}>
                    {roomActionLabel}
                  </button>
                )}
                {!dungeonBattleActive && currentRoom.type === "horde" && (
                  <small className="muted">Iniciando combate...</small>
                )}
                {dungeonBattleActive && <small className="muted">Resolva a batalha atual para revelar a próxima sala.</small>}
              </div>
            </div>
          )}
          <div className="dungeon-pending-rewards">
            <strong>Recompensas acumuladas</strong>
            <div className="dungeon-pending-stats">
              <span><strong>{activeRun.pendingExperience}</strong> XP</span>
              <span><strong>{activeRun.pendingGold}</strong> ouro</span>
              <span><strong>{activeRun.pendingItems.length}</strong> item(ns)</span>
            </div>
            <div className="dungeon-pending-items">
              {pendingRewardItems.length > 0 ? (
                pendingRewardItems.map((item) => (
                  <span key={item.id} className={`item-rarity ${item.rarity ?? "common"}`}>
                    {item.label}
                  </span>
                ))
              ) : (
                <span className="muted">Nenhum item acumulado ainda.</span>
              )}
            </div>
          </div>
        </section>
      )}
    </section>
  );
}

function MonarchPanel({ game }: { game: GameState }) {
  const event = game.monarchEvent;
  const highKeys = countInventoryItem(game, "misc_high_dungeon_key");
  if (!event) {
    return (
      <section className="content-panel monarch-panel">
        <PanelTitle icon={<GameIcon name="monarch" size={26} />} title="Monarca de Morthaly" />
        <p className="empty-state">Nenhum monarca foi avistado hoje.</p>
      </section>
    );
  }

  const inMorthaly = game.currentCountry.id === "morthaly";
  const hpPercent = Math.max(0, Math.round((event.currentHp / event.maxHp) * 100));
  const attemptsLeft = Math.max(0, event.attemptsLimit - event.attemptsUsed);
  const blockedReason =
    !inMorthaly
      ? "Viaje para Morthaly"
      : event.status !== "active"
        ? "Evento encerrado"
        : attemptsLeft <= 0
          ? "Limite diário atingido"
          : highKeys <= 0
            ? "Precisa de Chave de Masmorra Avançada"
            : game.character.currentHp <= 0
              ? "Recupere sua vida"
              : "";
  const canStart = !blockedReason;
  return (
    <section className="content-panel monarch-panel">
      <PanelTitle icon={<GameIcon name="monarch" size={26} />} title="Monarca de Morthaly" />
      <div className={event.isKing ? "monarch-hero king" : "monarch-hero"}>
        <AssetImage src={event.imageUrl} alt={event.name} fallback={<Crown size={44} />} />
        <div className="monarch-hero-copy">
          <span className="eyebrow">{event.title}</span>
          <h2>{event.name}</h2>
          <p>
            Cada dano causado por qualquer recruta reduz a vida global do monarca em tempo real.
            {event.isKing ? " As recompensas do Rei Litch são triplicadas." : ""}
          </p>
          <div className="monarch-hp">
            <div className="hp-bar">
              <span style={{ width: `${hpPercent}%` }} />
            </div>
            <strong>{event.currentHp.toLocaleString()} / {event.maxHp.toLocaleString()} vida</strong>
          </div>
          <div className="monster-stats">
            <small title="Nível"><Star size={13} /> {event.level}</small>
            <small title="Força"><Swords size={13} /> {event.strength}</small>
            <small title="Defesa"><Shield size={13} /> {event.defense}</small>
            <small title="Agilidade"><Crosshair size={13} /> {event.agility}</small>
          </div>
          <div className="monarch-entry-row">
            <span>Entradas hoje: <strong>{event.attemptsUsed}/{event.attemptsLimit}</strong></span>
            <span>Chaves: <strong>{highKeys}</strong></span>
          </div>
          <button className="primary-button" disabled={!canStart} onClick={() => socket.emit("monarch:start")}>
            {canStart ? <><Swords size={18} style={{ marginRight: "4px" }} /> Enfrentar monarca</> : blockedReason}
          </button>
        </div>
      </div>

      <section className="monarch-ranking">
        <h3 className="city-group-title">Ranking de dano</h3>
        <div className="ranking-list">
          {event.ranking.length === 0 && <p className="empty-state">Nenhum recruta causou dano ainda.</p>}
          {event.ranking.slice(0, 10).map((entry) => (
            <article className="ranking-row" key={entry.playerId}>
              <b>#{entry.rank}</b>
              <strong><PlayerName playerId={entry.playerId} name={entry.name} /></strong>
              <span><Swords size={12} style={{ color: "var(--red)" }} /> {entry.damage.toLocaleString()}</span>
            </article>
          ))}
        </div>
      </section>

      {event.rewardLog.length > 0 && (
        <section className="monarch-ranking">
          <h3 className="city-group-title">Ultimas recompensas</h3>
          <div className="ranking-list">
            {event.rewardLog.slice(0, 8).map((reward) => (
              <article className="ranking-row" key={`reward-${reward.playerId}`}>
                <b>#{reward.rank}</b>
                <div>
                  <strong><PlayerName playerId={reward.playerId} name={reward.name} /></strong>
                  <span>
                    {reward.experience.toLocaleString()} XP, {reward.gold.toLocaleString()} ouro
                    {reward.diamonds ? <> , {reward.diamonds} <Gem size={12} style={{ color: "var(--cyan)" }} /></> : null}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </section>
  );
}

function RankingsPanel({ game }: { game: GameState }) {
  const [activeTab, setActiveTab] = useState<"level" | "arena" | "dungeon" | "clans">("level");
  const dungeonCountries = game.countries.slice(0, 3);
  const [dungeonTab, setDungeonTab] = useState<"total" | string>("total");

  return (
    <section className="content-panel rankings-panel">
      <PanelTitle icon={<Trophy size={20} />} title="Ranking" />
      <div className="rankings-tabs">
        <button type="button" className={activeTab === "level" ? "mini-tab active" : "mini-tab"} onClick={() => setActiveTab("level")}>Nível</button>
        <button type="button" className={activeTab === "arena" ? "mini-tab active" : "mini-tab"} onClick={() => setActiveTab("arena")}>Ranqueada</button>
        <button type="button" className={activeTab === "dungeon" ? "mini-tab active" : "mini-tab"} onClick={() => setActiveTab("dungeon")}>Masmorra</button>
        <button type="button" className={activeTab === "clans" ? "mini-tab active" : "mini-tab"} onClick={() => setActiveTab("clans")}>Clãs</button>
      </div>
      {activeTab === "level" && <RankingList title="Nível" entries={game.rankings.level} mode="level" />}
      {activeTab === "arena" && <RankingList title="Arena Ranqueada" entries={game.rankings.arena} mode="arena" />}
      {activeTab === "dungeon" && (
        <section className="ranking-section">
          <h3>Masmorra</h3>
          <div className="rankings-tabs">
            <button type="button" className={dungeonTab === "total" ? "mini-tab active" : "mini-tab"} onClick={() => setDungeonTab("total")}>Total</button>
            {dungeonCountries.map((country) => (
              <button
                type="button"
                key={country.id}
                className={dungeonTab === country.id ? "mini-tab active" : "mini-tab"}
                onClick={() => setDungeonTab(country.id)}
              >
                {country.name}
              </button>
            ))}
          </div>
          {dungeonTab === "total" ? (
            <DungeonRankingList
              title="Total de andares completados"
              entries={game.rankings.dungeonTotal}
              valueForEntry={(entry) => entry.dungeonFloorsTotal ?? 0}
            />
          ) : (
            <DungeonRankingList
              title={`Andares completados em ${dungeonCountries.find((country) => country.id === dungeonTab)?.name ?? "País"}`}
              entries={game.rankings.dungeonByCountry[dungeonTab] ?? []}
              valueForEntry={(entry) => entry.dungeonFloorsByCountry?.[dungeonTab] ?? 0}
            />
          )}
        </section>
      )}
      {activeTab === "clans" && <ClanRankingList entries={game.rankings.clans} />}
    </section>
  );
}

function RankingList({ title, entries, mode }: { title: string; entries: GameState["rankings"]["level"]; mode: "level" | "arena" }) {
  return (
    <section className="ranking-section">
      <h3>{title}</h3>
      <div className="ranking-list">
        {entries.map((entry, index) => (
          <article className="ranking-row" key={`${mode}-${entry.playerId}`}>
            <strong>#{index + 1}</strong>
            <PlayerName playerId={entry.playerId} name={entry.name} />
            <b>{mode === "level" ? `Nível ${entry.level}` : `${entry.arenaRankedPoints} pts`}</b>
          </article>
        ))}
      </div>
    </section>
  );
}

function DungeonRankingList({
  title,
  entries,
  valueForEntry
}: {
  title: string;
  entries: GameState["rankings"]["dungeonTotal"];
  valueForEntry: (entry: GameState["rankings"]["dungeonTotal"][number]) => number;
}) {
  const rankedEntries = entries.filter((entry) => valueForEntry(entry) > 0);

  return (
    <section className="ranking-section">
      <h3>{title}</h3>
      <div className="ranking-list">
        {rankedEntries.map((entry, index) => (
          <article className="ranking-row" key={`dungeon-${entry.playerId}`}>
            <strong>#{index + 1}</strong>
            <PlayerName playerId={entry.playerId} name={entry.name} />
            <b>{valueForEntry(entry)} andares</b>
          </article>
        ))}
        {rankedEntries.length === 0 && <p className="empty-state">Nenhum recruta completou andares ainda.</p>}
      </div>
    </section>
  );
}

function ClanRankingList({ entries }: { entries: ClanRankingEntry[] }) {
  return (
    <section className="ranking-section">
      <h3>Clãs</h3>
      <div className="ranking-list">
        {entries.map((entry, index) => (
          <article className="ranking-row clan-ranking-row" key={entry.id}>
            <strong>#{index + 1}</strong>
            <div className="clan-ranking-main">
              <span className="clan-directory-crest">{getClanCrestIcon(entry.icon)}</span>
              <div className="clan-leader-main">
                <span>{entry.name}</span>
                <small className="clan-leader-clickable">Líder: <PlayerName playerId={entry.leaderPlayerId} name={entry.leaderName} /></small>
                <small>Líder: {entry.leaderName}</small>
              </div>
            </div>
            <b>Nv {entry.level} • {entry.memberCount}/{entry.memberCapacity}</b>
          </article>
        ))}
      </div>
    </section>
  );
}

function TalentTreeView({
  game,
  compact = false,
  locked = false,
  onRequestReset
}: {
  game: GameState;
  compact?: boolean;
  locked?: boolean;
  onRequestReset?: () => void;
}) {
  const categories: Array<{ id: TalentCategory; title: string }> = [
    { id: "offensive", title: "Ofensivo" },
    { id: "defensive", title: "Defensivo" },
    { id: "utility", title: "Útil" }
  ];
  const [selectedTalentId, setSelectedTalentId] = useState(game.talents[0]?.id ?? "");
  const selectedTalent = game.talents.find((t) => t.id === selectedTalentId) ?? game.talents[0] ?? null;
  const selectedRank = selectedTalent ? game.character.talentAllocations[selectedTalent.id] ?? 0 : 0;
  const selectedRequiredRank = selectedTalent?.requires ? game.character.talentAllocations[selectedTalent.requires] ?? 0 : 1;
  const selectedLocked = Boolean(selectedTalent?.requires && selectedRequiredRank <= 0);
  const selectedMaxed = Boolean(selectedTalent && selectedRank >= selectedTalent.maxRank);
  const canAfford = Boolean(selectedTalent) && game.derived.availableTalentPoints >= selectedTalent!.costPerRank;
  const oblivionScroll = game.itemCatalog[OBLIVION_SCROLL_ID];

  return (
    <div className={compact ? "talents-panel compact-talents" : "talents-panel"}>
      <div className="talent-summary">
        <span>{game.derived.availableTalentPoints} pontos livres</span>
        <button className="ghost-button reset-trigger-button" disabled={locked} onClick={onRequestReset}>
          <ResetScrollIcon item={oblivionScroll} />
          Resetar Pontos de Talento
        </button>
      </div>
      <div className="talent-categories">
        {categories.map((category) => (
          <section className="talent-tree" key={category.id}>
            <h3>{category.title}</h3>
            <div className="clan-benefit-tree">
              {game.talents
                .filter((talent) => talent.category === category.id)
                .map((talent) => {
                  const rank = game.character.talentAllocations[talent.id] ?? 0;
                  const requiredRank = talent.requires ? game.character.talentAllocations[talent.requires] ?? 0 : 1;
                  const locked = Boolean(talent.requires && requiredRank <= 0);
                  const maxed = rank >= talent.maxRank;
                  return (
                    <button
                      className={`clan-benefit-node${locked ? " locked" : ""}${maxed ? " maxed" : ""}${selectedTalent?.id === talent.id ? " selected" : ""}`}
                      key={talent.id}
                      title={talent.name}
                      onClick={() => setSelectedTalentId(talent.id)}
                    >
                      <span style={{ display: "grid", placeItems: "center", fontSize: "0.75rem" }}>{getTalentIcon(talent)}</span>
                      <b>{rank}/{talent.maxRank}</b>
                    </button>
                  );
                })}
            </div>
          </section>
        ))}
      </div>
      {selectedTalent && (
        <section className="clan-benefit-detail">
          <div className="clan-benefit-detail-icon">
            {getTalentIcon(selectedTalent)}
          </div>
          <div>
            <h3>{selectedTalent.name}</h3>
            <p>{selectedTalent.description}</p>
            <div className="clan-benefit-meta">
              <span>Rank {selectedRank}/{selectedTalent.maxRank}</span>
              <span>{selectedTalent.costPerRank} pts</span>
              {selectedTalent.requires && (
                <span>{selectedLocked ? "Requer talento anterior" : "Ramo liberado"}</span>
              )}
            </div>
          </div>
          <button
            className="primary-button"
            disabled={selectedLocked || selectedMaxed || !canAfford}
            onClick={() => socket.emit("talent:buy", { talentId: selectedTalent.id })}
          >
            {selectedMaxed ? "Máximo" : `${selectedTalent.costPerRank} pts`}
          </button>
        </section>
      )}
    </div>
  );
}

function GameShopPanel({ game }: { game: GameState }) {
  const packages = [...game.diamondPackages].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  const royalPackage = packages.find((pack) => pack.id === "friend_of_king") ?? packages.find((pack) => pack.featured) ?? null;
  const regularPackages = packages.filter((pack) => pack.id !== royalPackage?.id);
  const royalBenefits: Array<{ id: string; amount?: number; label?: string }> = [
    { id: "diamonds", amount: 200, label: "" },
    { id: TRAIN_TICKET_ID, amount: 100 },
    { id: SHIP_TICKET_ID, amount: 30 },
    { id: "pve_auto_30d", label: "PvE automático por 30 dias" },
    { id: "royal_seal_30d", label: "Selo do Rei por 30 dias" }
  ];

  return (
    <section className="content-panel game-shop-panel">
      <PanelTitle icon={<Gem size={20} style={{ color: "var(--cyan)" }} />} title="Loja do Jogo" />
      {royalPackage && (
        <article className="royal-offer-card">
          <div className="royal-offer-head">
            <span className="royal-offer-badge"><Crown size={14} /> Oferta em Destaque</span>
            <small>{royalPackage.priceLabel}</small>
          </div>
          <div className="royal-offer-main">
            <div>
              <h3>{royalPackage.name}</h3>
              <p>{royalPackage.description ?? "Pacote premium com benefícios reais para acelerar sua jornada."}</p>
              <div className="royal-offer-benefits">
                {royalBenefits.map((benefit) => {
                  const item = game.itemCatalog[benefit.id];
                  const isCurrency = benefit.id === "diamonds" || benefit.id.includes("coin");
                  const amountLabel = benefit.amount ? `${benefit.amount} ` : "";

                  if (item) {
                    return (
                      <span className="royal-offer-benefit" key={benefit.id}>
                        <ItemVisual item={item} className="royal-offer-benefit-item" />
                        <small>{amountLabel}{benefit.label ?? item.name}</small>
                      </span>
                    );
                  }

                  if (isCurrency) {
                    const CurrencyIcon = benefit.id === "diamonds" ? Gem : Coins;
                    return (
                      <span className="royal-offer-benefit" key={benefit.id}>
                        <i className={benefit.id === "diamonds" ? "royal-offer-benefit-icon diamonds" : "royal-offer-benefit-icon coins"}>
                          <CurrencyIcon size={13} />
                        </i>
                        <small>{amountLabel}{benefit.label ?? "Moedas"}</small>
                      </span>
                    );
                  }

                  return (
                    <span className="royal-offer-benefit" key={benefit.id}>
                      <i className="royal-offer-benefit-icon perk">
                        {benefit.id === "royal_seal_30d" ? <Crown size={15} /> : <Zap size={15} />}
                      </i>
                      <small>{benefit.label}</small>
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="royal-offer-cta">
              <button className="primary-button" onClick={() => socket.emit("game:buyDiamonds", { packageId: royalPackage.id })}>
                Comprar Amigo do Rei
              </button>
            </div>
          </div>
        </article>
      )}

      <div className="shop-grid game-shop-grid">
        {regularPackages.map((pack) => (
          <article className={pack.featured ? "item-card diamond-pack featured-pack" : "item-card diamond-pack"} key={pack.id}>
            <div>
              <strong>{pack.name}</strong>
              <span>
                {pack.diamonds} <Gem size={13} style={{ color: "var(--cyan)" }} /> {pack.bonusLabel ? `- ${pack.bonusLabel}` : ""}
              </span>
              {pack.description && <small>{pack.description}</small>}
            </div>
            <small>{pack.priceLabel}</small>
            <button className="primary-button" onClick={() => socket.emit("game:buyDiamonds", { packageId: pack.id })}>
              Comprar
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function getClanCrestIcon(icon?: string, size = 18, className = "") {
  const crest = getClanCrestDefinition(icon);
  return (
    <img
      className={className ? `clan-crest-image ${className}` : "clan-crest-image"}
      src={crest.imageUrl}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      style={{ "--clan-crest-size": `${size}px` } as React.CSSProperties}
    />
  );
}

function getClanCrestLabel(icon: string) {
  return getClanCrestDefinition(icon).label;
}

const CLAN_CATEGORY_LABELS: Record<ClanBenefitCategory, string> = {
  combat: "Combate",
  defense: "Defesa",
  prosperity: "Prosperidade"
};

function ClanPanel({ game }: { game: GameState }) {
  const [activeTab, setActiveTab] = useState<"benefits" | "members" | "admin">("benefits");
  const [name, setName] = useState("");
  const [crestIcon, setCrestIcon] = useState<ClanCrestId>(normalizeClanCrestId());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCrestIcon, setEditCrestIcon] = useState<ClanCrestId>(normalizeClanCrestId());
  const [gold, setGold] = useState(0);
  const [diamonds, setDiamonds] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [selectedClanId, setSelectedClanId] = useState<string | null>(null);
  const clan = game.clan;
  const clanJoinCooldownRemaining = Math.max(0, (game.character.clanJoinCooldownUntil ?? 0) - now);
  const clanJoinBlocked = clanJoinCooldownRemaining > 0;
  const selectedClan = selectedClanId ? game.clanDirectory.find((entry) => entry.id === selectedClanId) ?? null : null;

  const createClan = (event: FormEvent) => {
    event.preventDefault();
    socket.emit("clan:create", { name, icon: crestIcon });
    setName("");
    setShowCreateForm(false);
  };

  const donate = (event: FormEvent) => {
    event.preventDefault();
    socket.emit("clan:donate", { gold, diamonds });
    setGold(0);
    setDiamonds(0);
  };

  const leader = clan ? clan.leaderPlayerId === game.player.id : false;
  const clanMembers = clan?.members?.length
    ? clan.members
    : (clan?.memberPlayerIds ?? []).map((playerId) => ({ playerId, name: playerId, isLeader: playerId === clan?.leaderPlayerId }));

  useEffect(() => {
    if (!clan) return;
    setActiveTab("benefits");
    setEditName(clan.name);
    setEditDescription(clan.description ?? "");
    setEditCrestIcon(normalizeClanCrestId(clan.icon));
  }, [clan?.id, clan?.name, clan?.description, clan?.icon]);

  useEffect(() => {
    if (activeTab === "admin" && !leader) {
      setActiveTab("benefits");
    }
  }, [activeTab, leader]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!clan) {
    const levelReq = 15;
    const diamondCost = 10;
    const canCreateClan = game.character.level >= levelReq && game.character.diamonds >= diamondCost && name.trim().length >= 3 && !clanJoinBlocked;
    const levelOk = game.character.level >= levelReq;
    const diamondsOk = game.character.diamonds >= diamondCost;

    return (
      <section className="content-panel clan-panel">
      <PanelTitle icon={<GameIcon name="clan" size={50} />} title="Clã" />
        <div className="clan-create-section">
          <button
            className="primary-button clan-create-button"
            disabled={!levelOk || !diamondsOk || clanJoinBlocked}
            onClick={() => setShowCreateForm(!showCreateForm)}
            title={clanJoinBlocked ? `Disponível em ${formatDuration(clanJoinCooldownRemaining)}` : !levelOk || !diamondsOk ? `Requer nível ${levelReq} e ${diamondCost} diamantes` : ""}
          >
            <ChevronRight size={16} style={{ transform: showCreateForm ? "rotate(90deg)" : "none", transition: "transform 200ms" }} />
            Criar novo clã
          </button>
          {!levelOk || !diamondsOk ? (
            <p className="market-form-hint requirement-hint">
              ⚠️ Requer nível {levelReq} {!levelOk && `(atual: ${game.character.level})`} e {diamondCost} <Gem size={12} style={{ color: "var(--cyan)" }} /> {!diamondsOk && `(atual: ${game.character.diamonds})`}
            </p>
          ) : null}
          {clanJoinBlocked && (
            <p className="market-form-hint requirement-hint">
              Você poderá entrar ou criar outro clã em {formatDuration(clanJoinCooldownRemaining)}.
            </p>
          )}
        </div>
        {showCreateForm && (levelOk && diamondsOk && !clanJoinBlocked) && (
          <form className="market-form clan-create-form" onSubmit={createClan}>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome do clã" maxLength={28} autoFocus />
            <div className="crest-picker" aria-label="Brasão do clã">
              {CLAN_CRESTS.map((crest) => (
                <button
                  type="button"
                  className={crestIcon === crest.id ? "crest-option selected" : "crest-option"}
                  key={crest.id}
                  title={crest.label}
                  onClick={() => setCrestIcon(crest.id)}
                >
                  {getClanCrestIcon(crest.id, 32)}
                </button>
              ))}
            </div>
            <button className="primary-button" disabled={!canCreateClan}>
              Confirmar
            </button>
          </form>
        )}
        <section className="market-group">
          <h3>Clãs abertos</h3>
          <div className="market-list">
            {game.clanDirectory.length === 0 && <p className="empty-state">Nenhum clã criado.</p>}
            {game.clanDirectory.map((entry) => (
              <article className="market-row clan-directory-row" key={entry.id}>
                <span className="clan-directory-crest">{getClanCrestIcon(entry.icon)}</span>
                <div className="clan-leader-main">
                  <strong>{entry.name}</strong>
                  {entry.description && <small className="clan-directory-description">{entry.description}</small>}
                  <span className="clan-leader-clickable">Líder: <PlayerName playerId={entry.leaderPlayerId} name={entry.leaderName} /> - Nv {entry.level}</span>
                  <span>Líder: {entry.leaderName} - Nv {entry.level}</span>
                </div>
                <b>{entry.memberCount}/{entry.memberCapacity}</b>
                <button className="ghost-button" type="button" onClick={() => setSelectedClanId(entry.id)}>
                  <Info size={14} /> Ver
                </button>
                <button className="ghost-button" disabled={clanJoinBlocked} onClick={() => socket.emit("clan:join", { clanId: entry.id })}>
                  Entrar
                </button>
              </article>
            ))}
          </div>
        </section>
        {selectedClan && <ClanInfoModal clan={selectedClan} onClose={() => setSelectedClanId(null)} />}
      </section>
    );
  }

  const updateClanProfile = (event: FormEvent) => {
    event.preventDefault();
    socket.emit("clan:update", { name: editName, icon: editCrestIcon, description: editDescription });
  };

  return (
    <section className="content-panel clan-panel">
      <PanelTitle icon={getClanCrestIcon(clan.icon, 50)} title={clan.name} />
      <div className="clan-header-grid">
        <div className="clan-summary">
          <Metric icon={<Trophy size={18} />} label="Nível" value={clan.level} />
          <Metric icon={<Users size={18} />} label="Membros" value={`${clanMembers.length}/${clan.memberCapacity}`} />
          <Metric icon={<Shield size={18} />} label="Líder" value={leader ? "Você" : "Clã"} />
          <p className="clan-description-text">{clan.description || "Sem descrição do clã."}</p>
        </div>
        <section className="clan-treasury-card">
          <div className="clan-treasury-head">
            <strong>Tesouro do Clã</strong>
            <small>Recursos compartilhados para evolução coletiva.</small>
          </div>
          <div className="clan-treasury-grid">
            <Metric icon={<Coins size={18} style={{ color: "var(--gold)" }} />} label="" value={clan.gold} />
            <Metric icon={<Gem size={18} style={{ color: "var(--cyan)" }} />} label="" value={clan.diamonds} />
          </div>
        </section>
      </div>

      <section className="clan-donate-card">
        <div className="clan-donate-card-head">
          <strong>Doação</strong>
          <small>Envie recursos para fortalecer o clã.</small>
        </div>
        <form className="clan-donate-form" onSubmit={donate}>
          <label className="clan-donate-field" htmlFor="clan-donate-gold">
            <span><Coins size={15} style={{ color: "var(--gold)" }} /> Ouro</span>
            <input
              id="clan-donate-gold"
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              value={gold}
              onChange={(event) => setGold(Number(event.target.value))}
              placeholder="0"
              aria-label="Ouro"
            />
          </label>
          <label className="clan-donate-field" htmlFor="clan-donate-diamonds">
            <span><Gem size={15} style={{ color: "var(--cyan)" }} /> Diamantes</span>
            <input
              id="clan-donate-diamonds"
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              value={diamonds}
              onChange={(event) => setDiamonds(Number(event.target.value))}
              placeholder="0"
              aria-label="Diamantes"
            />
          </label>
          <button type="submit" className="primary-button" disabled={gold <= 0 && diamonds <= 0}>
            Doar
          </button>
        </form>
      </section>

      {!leader && (
        <button className="ghost-button clan-leave-button" onClick={() => socket.emit("clan:leave")}>Sair do clã</button>
      )}

      <div className="clan-tabs">
        <button type="button" className={activeTab === "benefits" ? "mini-tab active" : "mini-tab"} onClick={() => setActiveTab("benefits")}>Benefícios</button>
        <button type="button" className={activeTab === "members" ? "mini-tab active" : "mini-tab"} onClick={() => setActiveTab("members")}>Membros</button>
        {leader && (
          <button type="button" className={activeTab === "admin" ? "mini-tab active" : "mini-tab"} onClick={() => setActiveTab("admin")}>Administração</button>
        )}
      </div>

      {activeTab === "benefits" && <ClanBenefitTree game={game} leader={leader} />}

      {activeTab === "members" && (
        <section className="clan-member-list">
          <h3>Membros</h3>
          <div className="market-list">
            {clanMembers.map((member) => (
              <article className="market-row clan-member-row" key={member.playerId}>
                <div>
                  <strong><PlayerName playerId={member.playerId} name={member.name} /></strong>
                  <span>{member.isLeader ? "Líder" : "Membro"}</span>
                </div>
                {leader && !member.isLeader && (
                  <div className="clan-member-actions">
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => {
                        if (window.confirm(`Nomear ${member.name} como novo líder? Você perderá a liderança.`)) {
                          socket.emit("clan:leadership:transfer", { memberPlayerId: member.playerId });
                        }
                      }}
                    >
                      Nomear líder
                    </button>
                    <button type="button" className="danger-button" onClick={() => socket.emit("clan:kick", { memberPlayerId: member.playerId })}>
                      Remover
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {leader && activeTab === "admin" && (
        <>
          <form className="clan-manage-form" onSubmit={updateClanProfile}>
            <div>
              <strong>Editar clã</strong>
              <span>Altere nome, descrição e brasão do clã.</span>
            </div>
            <input value={editName} onChange={(event) => setEditName(event.target.value)} maxLength={28} placeholder="Nome do clã" />
            <textarea
              value={editDescription}
              onChange={(event) => setEditDescription(event.target.value)}
              maxLength={220}
              rows={4}
              placeholder="Descrição do clã (visível para todos)"
            />
            <div className="crest-picker" aria-label="Brasão do clã">
              {CLAN_CRESTS.map((crest) => (
                <button
                  type="button"
                  className={editCrestIcon === crest.id ? "crest-option selected" : "crest-option"}
                  key={crest.id}
                  title={crest.label}
                  onClick={() => setEditCrestIcon(crest.id)}
                >
                  {getClanCrestIcon(crest.id, 60)}
                </button>
              ))}
            </div>
            <button className="primary-button" disabled={editName.trim().length < 3}>
              Salvar alterações
            </button>
          </form>

          <section className="clan-reset-panel">
            <div>
              <strong>Resetar benefícios</strong>
              <span>Custa 1000 <Gem size={12} style={{ color: "var(--cyan)" }} /> do líder e devolve 80% do gold e <Gem size={12} style={{ color: "var(--cyan)" }} /> gastos para o tesouro do clã.</span>
            </div>
            <button
              className="ghost-button"
              disabled={game.character.diamonds < 1000 || clan.level <= 0}
              onClick={() => {
                if (window.confirm("Resetar todos os benefícios do clã por 1000 diamantes?")) {
                  socket.emit("clan:benefit:reset");
                }
              }}
            >
              Resetar Pontos de Atributos
            </button>
          </section>
        </>
      )}
    </section>
  );
}

function ClanInfoModal({ clan, onClose }: { clan: ClanSummary; onClose: () => void }) {
  const categoryLevels = clan.benefitCategoryLevels ?? { combat: 0, defense: 0, prosperity: 0 };
  const members = clan.members ?? [];

  return (
    <div className="drawer-backdrop clan-info-backdrop" role="presentation" onClick={onClose}>
      <section className="player-action-modal clan-info-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <button className="close-button" title="Fechar" onClick={onClose}>
          <X size={18} />
        </button>
        <header className="clan-info-heading">
          <span className="clan-info-crest">{getClanCrestIcon(clan.icon, 74)}</span>
          <div>
            <h2>{clan.name}</h2>
            <small>Nível {clan.level} • {clan.memberCount}/{clan.memberCapacity} membros</small>
            <small>Líder: <PlayerName playerId={clan.leaderPlayerId} name={clan.leaderName} /></small>
            <p className="clan-info-description">{clan.description || "Sem descrição do clã."}</p>
          </div>
        </header>
        <div className="clan-info-category-grid">
          {(Object.keys(CLAN_CATEGORY_LABELS) as ClanBenefitCategory[]).map((category) => (
            <div key={category}>
              <span>{CLAN_CATEGORY_LABELS[category]}</span>
              <strong>{categoryLevels[category] ?? 0}</strong>
            </div>
          ))}
        </div>
        <section className="clan-info-members">
          <h3>Membros</h3>
          <div className="market-list">
            {members.length === 0 && <p className="empty-state">Nenhum membro listado.</p>}
            {members.map((member) => (
              <article className="market-row clan-member-row" key={member.playerId}>
                <div>
                  <strong><PlayerName playerId={member.playerId} name={member.name} /></strong>
                  <span>{member.isLeader ? "Líder" : "Membro"}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}

function ClanBenefitTree({ game, leader }: { game: GameState; leader: boolean }) {
  const categories: Array<{ id: ClanBenefitCategory; title: string }> = [
    { id: "combat", title: "Combate" },
    { id: "defense", title: "Defesa" },
    { id: "prosperity", title: "Prosperidade" }
  ];
  const clan = game.clan;
  const [selectedBenefitId, setSelectedBenefitId] = useState(game.clanBenefits[0]?.id ?? "");
  const selectedBenefit = game.clanBenefits.find((benefit) => benefit.id === selectedBenefitId) ?? game.clanBenefits[0] ?? null;
  const selectedRank = selectedBenefit && clan ? clan.benefitAllocations[selectedBenefit.id] ?? 0 : 0;
  const selectedRequiredRank = selectedBenefit?.requires && clan ? clan.benefitAllocations[selectedBenefit.requires] ?? 0 : 1;
  const selectedLocked = Boolean(selectedBenefit?.requires && selectedRequiredRank <= 0);
  const selectedMaxed = Boolean(selectedBenefit && selectedRank >= selectedBenefit.maxRank);
  const selectedAffordable =
    Boolean(clan && selectedBenefit) &&
    clan!.gold >= selectedBenefit!.costPerRank.gold &&
    clan!.diamonds >= selectedBenefit!.costPerRank.diamonds;

  useEffect(() => {
    if (!game.clanBenefits.some((benefit) => benefit.id === selectedBenefitId)) {
      setSelectedBenefitId(game.clanBenefits[0]?.id ?? "");
    }
  }, [game.clanBenefits, selectedBenefitId]);

  return (
    <div className="clan-benefits">
      {categories.map((category) => (
        <section className="talent-tree clan-benefit-section" key={category.id}>
          <h3>{category.title}</h3>
          <div className="clan-benefit-tree">
            {game.clanBenefits
              .filter((benefit) => benefit.category === category.id)
              .map((benefit) => {
                const rank = clan?.benefitAllocations[benefit.id] ?? 0;
                const requiredRank = benefit.requires ? clan?.benefitAllocations[benefit.requires] ?? 0 : 1;
                const locked = Boolean(benefit.requires && requiredRank <= 0);
                const maxed = rank >= benefit.maxRank;
                return (
                  <button
                    className={`clan-benefit-node${locked ? " locked" : ""}${maxed ? " maxed" : ""}${selectedBenefit?.id === benefit.id ? " selected" : ""}`}
                    key={benefit.id}
                    title={benefit.name}
                    onClick={() => setSelectedBenefitId(benefit.id)}
                  >
                    {getClanBenefitIcon(benefit)}
                    <b>{rank}/{benefit.maxRank}</b>
                  </button>
                );
              })}
          </div>
        </section>
      ))}
      <ClanSuperBenefits game={game} />
      {selectedBenefit && (
        <section className="clan-benefit-detail">
          <div className="clan-benefit-detail-icon">
            {getClanBenefitIcon(selectedBenefit)}
          </div>
          <div>
            <h3>{selectedBenefit.name}</h3>
            <p>{selectedBenefit.description}</p>
            <div className="clan-benefit-meta">
              <span>Rank {selectedRank}/{selectedBenefit.maxRank}</span>
              <span>
                {selectedBenefit.costPerRank.gold} <Coins size={12} style={{ color: "var(--gold)" }} />
                {selectedBenefit.costPerRank.diamonds ? ` + ${selectedBenefit.costPerRank.diamonds} ` : null}
                {selectedBenefit.costPerRank.diamonds ? <Gem size={12} style={{ color: "var(--cyan)" }} /> : null}
              </span>
              {selectedBenefit.requires && <span>{selectedLocked ? "Requer benefício anterior" : "Ramo liberado"}</span>}
            </div>
          </div>
          {leader && (
            <button
              className="primary-button"
              disabled={selectedLocked || selectedMaxed || !selectedAffordable}
              onClick={() => socket.emit("clan:benefit:buy", { benefitId: selectedBenefit.id })}
            >
              {selectedMaxed ? "Máximo" : "Comprar"}
            </button>
          )}
        </section>
      )}
      <ClanBonusSummary game={game} />
    </div>
  );
}

function isClanCategoryComplete(game: GameState, category: ClanBenefitCategory) {
  const ranks = game.clan?.benefitAllocations ?? {};
  const benefits = game.clanBenefits.filter((benefit) => benefit.category === category);
  return benefits.length > 0 && benefits.every((benefit) => (ranks[benefit.id] ?? 0) >= benefit.maxRank);
}

function ClanSuperBenefits({ game }: { game: GameState }) {
  return (
    <section className="clan-super-benefits">
      <div className="clan-super-title">
        <Crown size={18} />
        <div>
          <h3>Super-benefícios</h3>
          <small>Ative ao completar uma trilha inteira de benefícios do clã.</small>
        </div>
      </div>
      <div className="clan-super-grid">
        {game.clanSuperBenefits.map((benefit) => {
          const active = isClanCategoryComplete(game, benefit.category);
          return (
            <article className={active ? "clan-super-card active" : "clan-super-card"} key={benefit.id}>
              <span>{getClanBenefitIcon(benefit)}</span>
              <div>
                <strong>{benefit.name}</strong>
                <small>{benefit.description}</small>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function getClanBonusSummary(game: GameState) {
  const ranks = game.clan?.benefitAllocations ?? {};
  const combatSuperActive = isClanCategoryComplete(game, "combat");
  const defenseSuperActive = isClanCategoryComplete(game, "defense");
  const prosperitySuperActive = isClanCategoryComplete(game, "prosperity");
  const bonuses = [
    {
      id: "damage",
      label: "Dano",
      value:
        (ranks.clan_damage_1 ?? 0) * 1 +
        (ranks.clan_damage_2 ?? 0) * 1.5 +
        (ranks.clan_damage_3 ?? 0) * 1 +
        (ranks.clan_damage_4 ?? 0) * 1.5 +
        (combatSuperActive ? 10 : 0),
      suffix: "%",
      icon: <Swords size={15} />
    },
    {
      id: "crit",
      label: "Crítico",
      value: (ranks.clan_crit_1 ?? 0) * 0.5 + (ranks.clan_crit_2 ?? 0) * 0.5 + (combatSuperActive ? 3 : 0),
      suffix: "%",
      icon: <Crosshair size={15} />
    },
    {
      id: "crit-damage",
      label: "Dano crítico",
      value: combatSuperActive ? 20 : 0,
      suffix: "%",
      icon: <Swords size={15} />
    },
    {
      id: "life",
      label: "Vida",
      value: (ranks.clan_vitality_1 ?? 0) * 2 + (ranks.clan_vitality_2 ?? 0) * 1.5 + (defenseSuperActive ? 10 : 0),
      suffix: "%",
      icon: <Heart size={15} />
    },
    {
      id: "defense",
      label: "Defesa",
      value: (ranks.clan_guard_1 ?? 0) + (ranks.clan_guard_2 ?? 0) + (defenseSuperActive ? 5 : 0),
      suffix: "",
      icon: <Shield size={15} />
    },
    {
      id: "dodge",
      label: "Esquiva",
      value: (ranks.clan_dodge_1 ?? 0) * 0.5 + (ranks.clan_dodge_2 ?? 0) * 0.5 + (defenseSuperActive ? 3 : 0),
      suffix: "%",
      icon: <Crosshair size={15} />
    },
    {
      id: "xp",
      label: "XP",
      value: (ranks.clan_xp_1 ?? 0) * 2 + (ranks.clan_xp_2 ?? 0) * 2 + (prosperitySuperActive ? 10 : 0),
      suffix: "%",
      icon: <Star size={15} />
    },
    {
      id: "gold",
      label: "Gold",
      value: (ranks.clan_gold_1 ?? 0) * 2 + (ranks.clan_gold_2 ?? 0) * 1.5 + (prosperitySuperActive ? 10 : 0),
      suffix: "%",
      icon: <Coins size={15} />
    },
    {
      id: "drop",
      label: "Drop",
      value: (ranks.clan_drop_1 ?? 0) * 1.5 + (ranks.clan_drop_2 ?? 0) * 1 + (prosperitySuperActive ? 5 : 0),
      suffix: "%",
      icon: <Gem size={15} />
    },
    {
      id: "energy",
      label: "Energia",
      value: (ranks.clan_energy_1 ?? 0) + (ranks.clan_energy_2 ?? 0) + (prosperitySuperActive ? 5 : 0),
      suffix: "",
      icon: <Zap size={15} />
    },
    {
      id: "members",
      label: "Membros",
      value: (ranks.clan_members_1 ?? 0) * 2 + (ranks.clan_members_2 ?? 0) * 3 + (ranks.clan_members_3 ?? 0) * 5,
      suffix: "",
      icon: <Users size={15} />
    },
    {
      id: "inventory",
      label: "Inventário",
      value:
        (ranks.clan_inventory_1 ?? 0) * 2 +
        (ranks.clan_inventory_2 ?? 0) * 3 +
        (ranks.clan_inventory_3 ?? 0) * 5 +
        (prosperitySuperActive ? 10 : 0),
      suffix: "",
      icon: <Backpack size={15} />
    }
  ];

  return bonuses.filter((bonus) => bonus.value > 0);
}

function formatClanBonus(value: number, suffix: string) {
  const normalized = Number.isInteger(value) ? value.toString() : value.toFixed(1).replace(".", ",");
  return `+${normalized}${suffix}`;
}

function ClanBonusSummary({ game }: { game: GameState }) {
  const bonuses = getClanBonusSummary(game);

  return (
    <section className="clan-bonus-summary">
      <div>
        <strong>Total de bônus adquiridos</strong>
        <span>{bonuses.length ? "Soma dos ranks comprados pelo clã." : "Nenhum benefício comprado ainda."}</span>
      </div>
      {bonuses.length > 0 && (
        <div className="clan-bonus-list">
          {bonuses.map((bonus) => (
            <span className="clan-bonus-chip" key={bonus.id}>
              {bonus.icon}
              <b>{bonus.label}</b>
              {formatClanBonus(bonus.value, bonus.suffix)}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

function getTalentIcon(talent: TalentDefinition | null | undefined): React.ReactNode {
  if (!talent?.icon) return <ScrollText size={18} />;
  switch (talent.icon) {
    case "damage":
      return <Swords size={18} style={{ color: "var(--red)" }} />;
    case "strength":
      return <Swords size={18} style={{ color: "var(--gold)" }} />;
    case "crit":
      return <Crosshair size={18} style={{ color: "var(--gold)" }} />;
    case "agility":
      return <Zap size={18} style={{ color: "var(--cyan)" }} />;
    case "life":
      return <Heart size={18} style={{ color: "var(--red)" }} />;
    case "defense":
      return <Shield size={18} style={{ color: "var(--purple)" }} />;
    case "dodge":
      return <Zap size={18} style={{ color: "var(--cyan)" }} />;
    case "xp":
      return <Star size={18} style={{ color: "var(--purple)" }} />;
    case "gold":
      return <Coins size={18} style={{ color: "var(--gold)" }} />;
    case "drop":
      return <Sparkles size={18} style={{ color: "var(--pink)" }} />;
    case "energy":
      return <Zap size={18} style={{ color: "var(--green)" }} />;
    default:
      return <ScrollText size={18} />;
  }
}

function getClanBenefitIcon(benefit: { id: string; icon?: string }) {
  const key = benefit.icon ?? benefit.id;
  if (key.includes("members")) return <Users size={18} style={{ color: "var(--red)" }} />;
  if (key.includes("inventory")) return <Backpack size={18} style={{ color: "var(--muted)" }} />;
  if (key.includes("damage") || key.includes("strength")) return <Swords style={{ color: "var(--red)" }} size={18} />;
  if (key.includes("crit") || key.includes("dodge")) return <Crosshair style={{ color: "var(--gold)" }} size={18} />;
  if (key.includes("guard") || key.includes("defense")) return <Shield style={{ color: "var(--purple)" }} size={18} />;
  if (key.includes("vitality") || key.includes("life")) return <Heart style={{ color: "var(--red)" }} size={18} />;
  if (key.includes("gold")) return <Coins style={{ color: "var(--gold)" }} size={18} />;
  if (key.includes("drop")) return <Gem style={{ color: "var(--cyan)" }} size={18} />;
  if (key.includes("energy")) return <Zap style={{ color: "var(--green)" }} size={18} />;
  return <Star style={{ color: "var(--purple)" }} size={18} />;
}

function HuntPanel({ game }: { game: GameState }) {
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const monsterListRef = useRef<HTMLDivElement | null>(null);
  const cityMapImage = CITY_HUNT_MAP_IMAGE_BY_CITY[game.currentCity.id] ?? "/assets/locals/mapa-pais.png";
  const selectedLocation =
    game.cityHuntLocations.find((location) => location.id === selectedLocationId) ?? null;
  const monsters = selectedLocation
    ? (selectedLocation.monsterIds
        .map((id) => game.cityMonsters.find((monster) => monster.id === id))
        .filter(Boolean) as GameState["cityMonsters"])
    : [];

  useEffect(() => {
    if (!game.cityHuntLocations.some((location) => location.id === selectedLocationId)) {
      setSelectedLocationId("");
    }
  }, [game.cityHuntLocations, selectedLocationId]);

  function animateMonsterList() {
    const list = monsterListRef.current;
    if (!list) {
      return;
    }
    list.animate(
      [
        { opacity: 0.75, transform: "translateY(10px)" },
        { opacity: 1, transform: "translateY(0)" }
      ],
      {
        duration: 640,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)"
      }
    );

    const cards = Array.from(list.querySelectorAll<HTMLElement>(".monster-card"));
    cards.forEach((card, index) => {
      card.animate(
        [
          { opacity: 0.6, transform: "translateY(8px)" },
          { opacity: 1, transform: "translateY(0)" }
        ],
        {
          duration: 580,
          delay: Math.min(index * 55, 510),
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "both"
        }
      );
    });
  }

  function scrollToMonsterList() {
    const frameId = window.requestAnimationFrame(() => {
      monsterListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      animateMonsterList();
    });
    return () => window.cancelAnimationFrame(frameId);
  }

  function handleLocationSelect(locationId: string) {
    setSelectedLocationId(locationId);
    scrollToMonsterList();
  }

  function getMapPoint(locationId: string, index: number, total: number) {
    const point = CITY_HUNT_MAP_POINT_BY_LOCATION[locationId];
    if (point) {
      return point;
    }
    const safeTotal = Math.max(1, total);
    const ratio = (index + 1) / (safeTotal + 1);
    return {
      x: 16 + ratio * 68,
      y: 72 - Math.sin(ratio * Math.PI) * 30
    };
  }

  return (
    <section className="content-panel hunt-panel">
      <PanelTitle icon={<GameIcon name="hunt" size={26} />} title="Caçar" />
      <div className="hunt-map-card">
        <div className="hunt-map-frame">
          <img src={cityMapImage} alt={`Mapa de caça de ${game.currentCity.name}`} />
          {game.cityHuntLocations.map((location, index) => {
            const point = getMapPoint(location.id, index, game.cityHuntLocations.length);
            const classes = [
              "hunt-map-point",
              selectedLocation?.id === location.id ? "selected" : ""
            ].filter(Boolean).join(" ");
            return (
              <button
                key={location.id}
                className={classes}
                onClick={() => handleLocationSelect(location.id)}
                style={{ left: `${point.x}%`, top: `${point.y}%` }}
                title={location.name}
                type="button"
              >
                <span className="hunt-map-icon">
                  <Swords size={17} />
                </span>
                <span className="hunt-map-name">{location.name}</span>
              </button>
            );
          })}
        </div>
        <div className="hunt-map-caption">
          <span>Clique no ícone de batalha para ver quais monstros aparecem no local.</span>
        </div>
      </div>
      {selectedLocation && (
        <div className="hunt-location-banner">
          <strong>{selectedLocation.name}</strong>
          <span>{selectedLocation.description}</span>
        </div>
      )}
      <div ref={monsterListRef} className="list-grid monster-battle-list">
        {monsters.length === 0 && (
          <p className="empty-state">
            {game.cityHuntLocations.length === 0
              ? "Nenhum local de caça disponível nesta cidade."
              : "Selecione um local de caça no mapa para ver os monstros."}
          </p>
        )}
        {monsters.map((monster) => {
          const blocked = game.character.currentHp <= 0 || game.character.currentEnergy < monster.level;
          return (
            <article className="entity-card monster-card" key={monster.id}>
              <MonsterVisual monster={monster} className="entity-art" />
              <div>
                <strong>{monster.name}</strong>
                <span>Nv. {monster.level}</span>
              </div>
              <div className="monster-stats">
                <small title="Vida"><Heart size={13} style={{ color: "var(--red)" }} /> {monster.maxHp}</small>
                <small title="Força"><Swords size={13} style={{ color: "var(--purple)" }} /> {monster.strength}</small>
                <small title="Defesa"><Shield size={13} style={{ color: "var(--cyan)" }} /> {monster.defense}</small>
                <small title="Agilidade"><Crosshair size={13} style={{ color: "var(--yellow)" }} /> {monster.agility}</small>
              </div>
              <small className="monster-xp" title="XP do monstro"><Star size={13} style={{ color: "var(--gold)" }} /> {monster.experience}</small>
              <button
                className="atack-button primary-button"
                disabled={blocked}
                onClick={() => socket.emit("hunt:start", { monsterId: monster.id })}
              >
                <Swords size={16} style={{ marginRight: "4px" }} /> Atacar
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ArenaPanel({ game }: { game: GameState }) {
  const [arenaMode, setArenaMode] = useState<"duel" | "ranked" | "season">("ranked");
  const [rankedSearching, setRankedSearching] = useState(false);
  const [rankedStatus, setRankedStatus] = useState<string | null>(null);
  const queued = game.arenaQueueSize > 0;
  const blueCoins = countInventoryItem(game, "material_blue_coin");
  const arenaCoinItem = game.itemCatalog["material_gold_coin"];
  const creationStoneItem = game.itemCatalog["misc_stone_craft"];
  const currentArenaRank = game.rankings.arena.findIndex((entry) => entry.playerId === game.player.id) + 1;
  const hasArenaRank = currentArenaRank > 0;
  const today = new Date().toLocaleDateString("pt-BR", { timeZone: "UTC" });
  const lastGrantDate = game.character.lastDailyBlueCoinGrantKey
    ? new Date(game.character.lastDailyBlueCoinGrantKey + "T00:00:00Z").toLocaleDateString("pt-BR", { timeZone: "UTC" })
    : "";
  const canClaimDaily = lastGrantDate !== today;

  useEffect(() => {
    if (game.activeBattle?.arena?.type === "ranked") {
      setRankedSearching(false);
      setRankedStatus(null);
    }
  }, [game.activeBattle?.id, game.activeBattle?.arena?.type]);

  const startRankedDuel = () => {
    setRankedSearching(true);
    setRankedStatus("Buscando adversário...");
    socket.timeout(4000).emit("arena:ranked", (error: Error | null, response?: { ok: boolean; message?: string }) => {
      if (error) {
        setRankedSearching(false);
        setRankedStatus("O servidor não respondeu. Reinicie o servidor do jogo e tente novamente.");
        return;
      }
      if (!response?.ok) {
        setRankedSearching(false);
        setRankedStatus(response?.message ?? "Não foi possível iniciar a Arena Ranqueada.");
        return;
      }
      setRankedStatus("Duelo encontrado. Abrindo batalha...");
    });
  };

  const seasonLabel = (key: string) => {
    if (!key) return "—";
    const [year, month] = key.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  };

  return (
    <section className="content-panel arena-panel">
      <div className="arena-mode-tabs">
        <button type="button" className={arenaMode === "ranked" ? "mini-tab active" : "mini-tab"} onClick={() => setArenaMode("ranked")}>
          Ranqueada
        </button>
        <button type="button" className={arenaMode === "duel" ? "mini-tab active" : "mini-tab"} onClick={() => setArenaMode("duel")}>
          Duelo
        </button>
        <button type="button" className={arenaMode === "season" ? "mini-tab active" : "mini-tab"} onClick={() => setArenaMode("season")}>
          Temporada
        </button>
      </div>
      <div className="arena-plate">
        <GameIcon name="arena" size={58} className="arena-mode-icon" />
        {arenaMode === "duel" ? (
          <>
            <h2>{queued ? "Aguardando adversário" : "Duelo"}</h2>
            <p>{game.arenaQueueSize} recruta(s) na fila. Entre na fila ou desafie outro jogador pelo perfil dele.</p>
            <div className="button-row">
              <button className="primary-button" onClick={() => socket.emit("arena:join")}>
                <Swords size={16} style={{color: "var(--white)", marginRight: "8px"}} /> Entrar na fila
              </button>
              <button className="ghost-button" onClick={() => socket.emit("arena:leave")}>
                Sair
              </button>
            </div>
          </>
        ) : arenaMode === "season" ? (
          <>
            <h2>Temporada</h2>
            <p className="arena-season-label">Temporada atual: <strong>{seasonLabel(game.arenaSeasonKey)}</strong></p>
            <div className="arena-ranking-list">
              {game.rankings.arena.length === 0 ? (
                <p>Nenhum jogador no ranking ainda.</p>
              ) : (
                game.rankings.arena.map((entry, index) => (
                  <div key={entry.playerId} className="arena-rank-row">
                    <span className="arena-rank-pos">#{index + 1}</span>
                    <span className="arena-rank-name">{entry.name}</span>
                    <span className="arena-rank-pts">{entry.arenaRankedPoints} pts</span>
                  </div>
                ))
              )}
            </div>
            {game.lastArenaSeason && (
              <>
                <h3 style={{ marginTop: 16 }}>Última Temporada — {seasonLabel(game.lastArenaSeason.seasonKey)}</h3>
                <div className="arena-ranking-list">
                  {game.lastArenaSeason.ranking.map((entry) => (
                    <div key={entry.playerId} className="arena-rank-row">
                      <span className="arena-rank-pos">#{entry.rank}</span>
                      <span className="arena-rank-name">{entry.name}</span>
                      <span className="arena-rank-pts">{entry.arenaRankedPoints} pts</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <h2>Arena Ranqueada</h2>
            <div className="arena-ranked-highlight">
              <div className="arena-ranked-highlight-card">
                <small>Seus pontos</small>
                <strong>{game.character.arenaRankedPoints}</strong>
                <span>ranking atual</span>
              </div>
              <div className="arena-ranked-highlight-card arena-ranked-highlight-card-secondary">
                <small>Sua posição</small>
                <strong>{hasArenaRank ? `#${currentArenaRank}` : "Top 20+"}</strong>
                <span>{hasArenaRank ? "entre os melhores" : "fora do top 20"}</span>
              </div>
            </div>
            <div className="arena-coins-row">
              <Coins size={16} style={{ color: "#8be9fd" }} />
              <span>Moedas Azuis: <strong>{blueCoins}</strong></span>
              {canClaimDaily && (
                <button
                  className="ghost-button arena-claim-btn"
                  type="button"
                  onClick={() => socket.emit("arena:claimDailyCoins")}
                >
                  Receber 10 moedas diárias
                </button>
              )}
            </div>
            <p>O jogo escolhe o rival mais próximo, online ou offline.</p>
            <div className="arena-ranked-rules">
              <span>Vitória <strong>+5</strong></span>
              <span>Derrota <strong>-2</strong></span>
            </div>
            <div className="arena-ranked-rewards">
              <div className="arena-reward-card win">
                <small>Vitória</small>
                <strong className="arena-reward-primary">
                  {arenaCoinItem && <ItemVisual item={arenaCoinItem} className="arena-reward-item-visual" />}
                  3x Moedas de Arena
                </strong>
                <span className="arena-reward-secondary">
                  <Coins size={12} style={{ color: "var(--gold)" }} /> 10000
                </span>
                <span className="arena-reward-secondary">
                  {creationStoneItem && <ItemVisual item={creationStoneItem} className="arena-reward-item-visual" />} 1x Pedra de Criação
                </span>
              </div>
              <div className="arena-reward-card loss">
                <small>Derrota</small>
                <strong className="arena-reward-primary">
                  {arenaCoinItem && <ItemVisual item={arenaCoinItem} className="arena-reward-item-visual" />}
                  1x Moeda de Arena
                </strong>
                <span className="arena-reward-secondary">
                  <Coins size={12} style={{ color: "var(--gold)" }} /> 5000
                </span>
              </div>
            </div>
            <small style={{ opacity: 0.7 }}>Custo: 1 Moeda Azul por duelo. As moedas diárias são resgatadas pelo botão na Arena.</small>
            <button className="primary-button" type="button" onClick={startRankedDuel} disabled={rankedSearching}>
              <Swords size={16} style={{color: "var(--white)", marginRight: "8px"}} />
              {rankedSearching ? "Buscando..." : "Buscar Oponente"}
            </button>
            {rankedStatus && <small className="arena-ranked-status">{rankedStatus}</small>}
          </>
        )}
      </div>
    </section>
  );
}

function ShopPanel({ game, shop }: { game: GameState; shop: "armorer" | "apothecary" | "moneyChanger" | "goldCoinMerchant" }) {
  const isGoldCoinShop = shop === "goldCoinMerchant";

  const shopTitle = {
    "armorer" : "Armeiro",
    "apothecary" : "Boticário",
    "moneyChanger" : "Cambista",
    "goldCoinMerchant" : "Mercador de Arena"
  };
  const itemIds =
    shop === "armorer"
      ? game.currentCity.armorerItemIds
      : shop === "apothecary"
        ? game.currentCity.apothecaryItemIds.filter((itemId) => {
            const item = game.itemCatalog[itemId];
            return item?.kind !== "scroll" && item?.kind !== "ticket";
          })
        : isGoldCoinShop
          ? game.currentCity.goldCoinMerchantItemIds ?? []
          : game.currentCity.moneyChangerItemIds ?? [];
  const sortedItemIds = [...itemIds].sort((leftId, rightId) => {
    const left = game.itemCatalog[leftId];
    const right = game.itemCatalog[rightId];
    if (isGoldCoinShop) {
      return (left?.goldCoinPrice ?? 0) - (right?.goldCoinPrice ?? 0) || (left?.name ?? "").localeCompare(right?.name ?? "");
    }
    return (left?.price ?? 0) - (right?.price ?? 0) || (left?.name ?? "").localeCompare(right?.name ?? "");
  });
  const title = shopTitle[shop];
  const icon = <GameIcon name={shop} size={26} />;
  const npcName = game.currentCity.npcs[shop];
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const selectedItem = selectedItemId ? game.itemCatalog[selectedItemId] : null;
  const goldCoins = countInventoryItem(game, "material_gold_coin");

  return (
    <section className="content-panel">
      <PanelTitle icon={icon} title={title} />
      <div className="npc-banner">
        <User size={18} />
        <span>{npcName}</span>
      </div>
      {isGoldCoinShop && (
        <div className="npc-banner" style={{ marginTop: 4, color: "var(--gold)" }}>
          <Coins size={14} />
          <span>Suas Moedas de Arena: <strong>{goldCoins}</strong></span>
        </div>
      )}
      <div className="shop-grid npc-shop-grid">
        {sortedItemIds.map((itemId) => {
          const item = game.itemCatalog[itemId];
          if (!item) {
            return null;
          }
          return (
            <ShopItemCard
              key={item.id}
              item={item}
              onClick={() => setSelectedItemId(item.id)}
              goldCoinMode={isGoldCoinShop}
            />
          );
        })}
      </div>
      {selectedItem && (
        <ShopItemModal
          game={game}
          item={selectedItem}
          onClose={() => setSelectedItemId(null)}
          goldCoinMode={isGoldCoinShop}
          onBuy={(quantity) => {
            socket.emit("shop:buy", { itemId: selectedItem.id, quantity, shop });
            setSelectedItemId(null);
          }}
        />
      )}
      {shop === "armorer" && (
        <section className="sell-strip">
          <h3>Venda</h3>
          <div className="sell-list">
            {game.character.inventory.map((inventoryItem) => {
              const item = game.itemCatalog[inventoryItem.itemId];
              const equipped = isItemEquipped(game, inventoryItem.instanceId);
              return (
                <div className="sell-row" key={inventoryItem.instanceId}>
                  <span>
                    {formatInventoryItemName(item, inventoryItem)} {inventoryItem.quantity > 1 ? `x${inventoryItem.quantity}` : ""}
                  </span>
                  <button
                    className="ghost-button"
                    disabled={equipped}
                    onClick={() => socket.emit("shop:sell", { instanceId: inventoryItem.instanceId, quantity: 1 })}
                  >
                    Vender {formatCurrency(Math.max(1, Math.floor(getItemValue(item, inventoryItem) / 2)))}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </section>
  );
}

function QuickPotionSelector({ game }: { game: GameState }) {
  const { preferences, setPreference } = useQuickPotionSettings();
  const healthOptions = getPotionOptions(game, "health");
  const energyOptions = getPotionOptions(game, "energy");
  const selectedHealth = getQuickPotionOption(game, preferences, "health");
  const selectedEnergy = getQuickPotionOption(game, preferences, "energy");

  if (healthOptions.length === 0 && energyOptions.length === 0) {
    return null;
  }

  const renderPotionButtons = (
    slot: QuickPotionSlot,
    icon: React.ReactNode,
    label: string,
    options: PotionQuickOption[],
    selected: PotionQuickOption | null
  ) => (
    <div className="quick-potion-field">
      <span>{icon} {label}</span>
      <div className="quick-potion-choice-grid">
        {options.length === 0 ? (
          <span className="quick-potion-empty">Nenhuma</span>
        ) : (
          options.map((option) => {
            const active = selected?.itemId === option.itemId;
            return (
              <button
                type="button"
                key={option.itemId}
                className={active ? "quick-potion-choice active" : "quick-potion-choice"}
                onClick={() => setPreference(slot, option.itemId)}
                title={`${option.definition.name} x${option.quantity} - ${getPotionEffectLabel(option.definition, slot)}`}
                aria-pressed={active}
              >
                <ItemVisual item={option.definition} className="quick-potion-choice-visual" quantity={option.quantity} />
                <small>{getPotionEffectLabel(option.definition, slot)}</small>
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <section className="quick-potion-settings">
      <div>
        <strong>Uso rápido</strong>
        <small>Escolha qual poção os atalhos de batalha e detalhes vão consumir.</small>
      </div>
      <div className="quick-potion-fields">
        {renderPotionButtons("health", <Heart size={14} />, "Vida", healthOptions, selectedHealth)}
        {renderPotionButtons("energy", <Zap size={14} />, "Energia", energyOptions, selectedEnergy)}
      </div>
    </section>
  );
}

function InventoryPanel({ game, onBackToBattle }: { game: GameState; onBackToBattle?: () => void }) {
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const { preferences, setPreference } = useQuickPotionSettings();
  const battleLocked = game.activeBattle?.status === "active";

  // Build flat slot list: unequipped equipment (1 slot each) + stackable items (1 slot per unique itemId)
  const equipmentItems = game.character.inventory.filter((inv) => {
    const def = game.itemCatalog[inv.itemId];
    return def?.slot && !isItemEquipped(game, inv.instanceId);
  });
  const stackableMap = game.character.inventory
    .filter((inv) => !game.itemCatalog[inv.itemId]?.slot)
    .reduce<Record<string, InventorySlotEntry>>((acc, inv) => {
      if (!acc[inv.itemId]) acc[inv.itemId] = { instanceId: inv.instanceId, itemId: inv.itemId, quantity: 0 };
      acc[inv.itemId].quantity += inv.quantity;
      return acc;
    }, {});
  const filledSlots = [...equipmentItems, ...Object.values(stackableMap)];

  // Pad to player's real inventory capacity from server state
  const TOTAL_SLOTS = Math.max(game.inventoryCapacity, filledSlots.length);
  const slots: Array<InventorySlotEntry | null> = [
    ...filledSlots,
    ...Array(Math.max(0, TOTAL_SLOTS - filledSlots.length)).fill(null),
  ];

  const selectedEntry = selectedInstanceId ? filledSlots.find((s) => s.instanceId === selectedInstanceId) ?? null : null;
  const selectedItem = selectedEntry ? game.itemCatalog[selectedEntry.itemId] : null;
  const selectedEquipped = selectedEntry ? isItemEquipped(game, selectedEntry.instanceId) : false;
  const selectedStats = selectedItem && selectedEntry ? getEnhancedItemStats(selectedItem, selectedEntry) : null;
  const selectedRarity = selectedItem && selectedEntry ? getItemRarity(selectedItem, selectedEntry) : undefined;
  const selectedPrice = selectedItem ? getItemValue(selectedItem, selectedEntry) : 0;

  return (
    <section className="content-panel">
      <PanelTitle icon={<GameIcon name="inventory" size={26} />} title="Inventário" />
      {onBackToBattle && (
        <button className="ghost-button inventory-return" onClick={onBackToBattle}>
          Voltar à batalha
        </button>
      )}
      <QuickPotionSelector game={game} />
      <div className="inventory-grid">
        {slots.map((slot, index) => {
          if (!slot) {
            return <div key={`empty-${index}`} className="inv-slot empty" />;
          }
          const item = game.itemCatalog[slot.itemId];
          const equipped = isItemEquipped(game, slot.instanceId);
          const selected = selectedInstanceId === slot.instanceId;
          const rarityColor = getEquipmentRarityColor(item, slot.rarity);
          const enhancement = item.slot ? Math.max(0, slot.enhancementLevel ?? 0) : 0;
          const enhancementClasses = [
            enhancement >= 4 ? "enhance-tier-4" : "",
            enhancement >= 7 ? "enhance-tier-7" : "",
            enhancement >= 10 ? "enhance-tier-10" : "",
            enhancement >= 13 ? "enhance-tier-13" : ""
          ].filter(Boolean).join(" ");
          return (
            <button
              key={slot.instanceId}
              className={`inv-slot${equipped ? " equipped" : ""}${selected ? " selected" : ""} ${enhancementClasses}`}
              title={formatInventoryItemName(item, slot)}
              style={rarityColor ? ({ borderColor: rarityColor, "--rarity-color": rarityColor } as React.CSSProperties) : undefined}
              onClick={() => setSelectedInstanceId(slot.instanceId)}
            >
              <ItemVisual item={item} className="slot-visual" quantity={slot.quantity} enhancementLevel={slot.enhancementLevel} rarity={slot.rarity} />
              {enhancement >= 10 && <span className="inv-slot-light-sweep" aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      {selectedEntry && selectedItem && (
        <div className="drawer-backdrop inventory-item-backdrop" role="presentation" onClick={() => setSelectedInstanceId(null)}>
          <div className="inv-action-bar inventory-item-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <button className="close-button" title="Fechar" onClick={() => setSelectedInstanceId(null)}>
              <X size={18} />
            </button>
            <ItemVisual
              item={selectedItem}
              className="inventory-modal-visual"
              quantity={selectedEntry.quantity}
              enhancementLevel={selectedEntry.enhancementLevel}
              rarity={selectedEntry.rarity}
            />
            <div className="inv-action-info">
            <strong>{formatInventoryItemName(selectedItem, selectedEntry)}</strong>
            <span>{selectedItem.description}</span>
            <div className="inventory-item-meta">
              <small>{ITEM_KIND_LABELS[selectedItem.kind]}</small>
              {selectedItem.slot && selectedRarity && <div className={`item-rarity ${selectedRarity}`}>{RARITY_LABELS[selectedRarity]}</div>}
              <small>Quantidade: {selectedEntry.quantity}</small>
              {selectedItem.slot && <small>Nível mínimo: {selectedItem.minLevel}</small>}
              <small>Valor em ouro: {formatCurrency(selectedPrice)}</small>
              {selectedItem.slot && (selectedEntry.enhancementLevel ?? 0) > 0 && <small>Melhoria: +{selectedEntry.enhancementLevel ?? 0}</small>}
            </div>
            {selectedItem.slot && game.character.level < selectedItem.minLevel && (
              <small className="level-warn">⚠️ Nível {selectedItem.minLevel} necessário para equipar</small>
            )}
            {selectedItem.slot && selectedStats && (
              <div className="market-modal-stats">
                <h4>Atributos atuais</h4>
                <div className="stat-list">
                  {selectedStats.strength !== undefined && <div><span>Força</span> <strong>+{selectedStats.strength}</strong></div>}
                  {selectedStats.constitution !== undefined && <div><span>Constituição</span> <strong>+{selectedStats.constitution}</strong></div>}
                  {selectedStats.agility !== undefined && <div><span>Agilidade</span> <strong>+{selectedStats.agility}</strong></div>}
                  {selectedStats.defense !== undefined && <div><span>Defesa</span> <strong>+{selectedStats.defense}</strong></div>}
                </div>
              </div>
            )}
            {!selectedItem.slot && (
              <div className="market-modal-stats">
                <h4>Informações</h4>
                {selectedItem.stats.healPercent && <p>Restaura {selectedItem.stats.healPercent * 100}% da vida ao usar.</p>}
                {selectedItem.stats.energyPercent && <p>Restaura {selectedItem.stats.energyPercent * 100}% da energia ao usar.</p>}
                {selectedItem.stats.heal && <p>Restaura {selectedItem.stats.heal} de vida.</p>}
              </div>
            )}
          </div>
          <div className="inv-action-buttons">
            {selectedItem.kind === "potion" && (
              <button
                className="primary-button"
                disabled={battleLocked}
                onClick={() => {
                  socket.emit("inventory:use", { instanceId: selectedEntry.instanceId });
                  setSelectedInstanceId(null);
                }}
              >
                Usar
              </button>
            )}
            {selectedItem.kind === "potion" && isPotionForQuickSlot(selectedItem, "health") && (
              <button
                className={preferences.health === selectedItem.id ? "ghost-button selected-quick-potion" : "ghost-button"}
                onClick={() => setPreference("health", selectedItem.id)}
              >
                <Heart size={14} /> {preferences.health === selectedItem.id ? "Atalho de vida" : "Definir vida"}
              </button>
            )}
            {selectedItem.kind === "potion" && isPotionForQuickSlot(selectedItem, "energy") && (
              <button
                className={preferences.energy === selectedItem.id ? "ghost-button selected-quick-potion" : "ghost-button"}
                onClick={() => setPreference("energy", selectedItem.id)}
              >
                <Zap size={14} /> {preferences.energy === selectedItem.id ? "Atalho de energia" : "Definir energia"}
              </button>
            )}
            {selectedItem.slot && !selectedEquipped && (
              <button
                className="primary-button"
                disabled={game.character.level < selectedItem.minLevel || battleLocked}
                onClick={() => {
                  socket.emit("inventory:equip", { instanceId: selectedEntry.instanceId });
                  setSelectedInstanceId(null);
                }}
              >
                Equipar
              </button>
            )}
            {selectedEquipped && (
              <span className="equipped-label">Equipado</span>
            )}
            {!selectedEquipped && (
              <button
                className="danger-button"
                disabled={battleLocked}
                onClick={() => {
                  const isEquipment = Boolean(selectedItem.slot);
                  const destroyLabel = isEquipment
                    ? formatInventoryItemName(selectedItem, selectedEntry)
                    : `${formatInventoryItemName(selectedItem, selectedEntry)} x${selectedEntry.quantity}`;
                  const confirmed = window.confirm(
                    isEquipment
                      ? `Deseja destruir ${destroyLabel}? Esta ação não pode ser desfeita.`
                      : `Deseja destruir TODOS: ${destroyLabel}? Esta ação não pode ser desfeita.`
                  );
                  if (!confirmed) {
                    return;
                  }
                  socket.emit("inventory:destroy", { instanceId: selectedEntry.instanceId });
                  setSelectedInstanceId(null);
                }}
              >
                {selectedItem.slot ? "Destruir item" : "Destruir todos"}
              </button>
            )}
            <button className="ghost-button" onClick={() => setSelectedInstanceId(null)}>
              Fechar
            </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function TravelPanel({ game }: { game: GameState }) {
  const trainTicket = game.itemCatalog[TRAIN_TICKET_ID];
  const shipTicket = game.itemCatalog[SHIP_TICKET_ID];
  const trainTickets = countInventoryItem(game, TRAIN_TICKET_ID);
  const shipTickets = countInventoryItem(game, SHIP_TICKET_ID);
  const mapCities = game.cities.filter((city) => TRAVEL_MAP_POINTS[city.id]);
  const [travelModalCityId, setTravelModalCityId] = useState<string | null>(null);
  const getTravelRoute = (cityId: string) => {
    const city = game.cities.find((entry) => entry.id === cityId);
    if (!city) {
      return null;
    }

    const sameCountry = game.currentCity.countryId === city.countryId;
    const destinationCountry = game.countries.find((country) => country.id === city.countryId);
    const portCity = game.cities.find((entry) => entry.id === destinationCountry?.portCityId) ?? null;
    const blockedByForeignInterior = !sameCountry && !city.isPort;
    const destinationCity = sameCountry
      ? city
      : city.isPort
        ? city
        : portCity ?? city;
    const ticketId = sameCountry ? TRAIN_TICKET_ID : SHIP_TICKET_ID;
    const ticketDefinition = game.itemCatalog[ticketId];
    const ticketCount = sameCountry ? trainTickets : shipTickets;
    const ticketLabel = ticketDefinition?.name ?? (sameCountry ? "Ticket de Trem" : "Ticket de Navio");
    const current = city.id === game.character.cityId;
    const locked = !current && (blockedByForeignInterior || ticketCount <= 0 || game.character.level < destinationCity.minLevel);
    const reason = current
      ? "Local atual"
      : blockedByForeignInterior
        ? `Viaje primeiro para ${portCity?.name ?? "o porto"}`
        : game.character.level < destinationCity.minLevel
        ? `Nv. ${destinationCity.minLevel}`
        : ticketCount <= 0
          ? `Sem ${ticketLabel}`
          : sameCountry
            ? "Viajar de trem"
            : `Navio para ${destinationCity.name}`;
    const actionLabel = current
      ? "Você está aqui"
      : blockedByForeignInterior
        ? "Destino interno bloqueado"
        : locked
          ? "Viagem indisponível"
          : sameCountry
            ? "Viajar com ticket de trem"
            : `Viajar de navio para ${destinationCity.name}`;

    return { city, destinationCity, destinationCountry, portCity, sameCountry, blockedByForeignInterior, current, locked, reason, actionLabel, ticketLabel, ticketDefinition, ticketCount };
  };
  const selectedTravelCity = travelModalCityId ? game.cities.find((city) => city.id === travelModalCityId) ?? null : null;
  const selectedRoute = selectedTravelCity ? getTravelRoute(selectedTravelCity.id) : null;

  useEffect(() => {
    if (travelModalCityId && !game.cities.some((city) => city.id === travelModalCityId)) {
      setTravelModalCityId(null);
    }
  }, [game.cities, travelModalCityId]);

  return (
    <section className="content-panel travel-panel">
      <PanelTitle icon={<GameIcon name="travel" size={26} />} title="Viajar" />
      <div className="travel-ticket-summary">
        <span className="travel-ticket-chip">
          {trainTicket ? <ItemVisual item={trainTicket} className="travel-ticket-visual" /> : <GameIcon name="train" size={20} />}
          <span className="travel-ticket-copy">
            <small>{trainTicket?.name ?? "Ticket de Trem"}</small>
            <strong>x{trainTickets}</strong>
          </span>
        </span>
        <span className="travel-ticket-chip">
          {shipTicket ? <ItemVisual item={shipTicket} className="travel-ticket-visual" /> : <GameIcon name="ship" size={20} />}
          <span className="travel-ticket-copy">
            <small>{shipTicket?.name ?? "Ticket de Navio"}</small>
            <strong>x{shipTickets}</strong>
          </span>
        </span>
      </div>

      <div className="travel-map-card">
        <div className="travel-map-frame">
          <img src="/assets/locals/mapa-pais.png" alt="Mapa dos países Aurevia, Valfria e Morthaly" />
          {game.countries.map((country) => {
            const position = TRAVEL_COUNTRY_LABELS[country.id];
            if (!position) return null;
            return (
              <span
                className={country.id === game.currentCountry.id ? "travel-country-label current" : "travel-country-label"}
                key={country.id}
                style={{ left: `${position.x}%`, top: `${position.y}%` }}
              >
                {country.name}
              </span>
            );
          })}
          {mapCities.map((city) => {
            const position = TRAVEL_MAP_POINTS[city.id];
            const route = getTravelRoute(city.id);
            if (!route) return null;
            const classes = [
              "travel-map-point",
              travelModalCityId === city.id ? "selected" : "",
              route.current ? "current" : "",
              route.locked ? "locked" : "",
              city.isPort ? "port" : "",
              route.sameCountry ? "land-route" : "sea-route"
            ].filter(Boolean).join(" ");
            return (
              <button
                className={classes}
                key={city.id}
                onClick={() => setTravelModalCityId(city.id)}
                style={{ left: `${position.x}%`, top: `${position.y}%` }}
                title={`${city.name} - ${route.reason}`}
                type="button"
              >
                <span className="travel-map-icon">
                  <GameIcon name={city.isPort ? "ship" : "pin"} size={18} />
                </span>
                <span className="travel-map-name">{city.name}</span>
              </button>
            );
          })}
        </div>
        <div className="travel-map-caption">
          <span>Rotas no mesmo país usam ticket de trem.</span>
          <span>Rotas entre países usam ticket de navio e desembarcam no porto do destino.</span>
        </div>
      </div>

      {selectedRoute && (
        <div className="travel-city-modal-backdrop" role="presentation" onClick={() => setTravelModalCityId(null)}>
          <article className="travel-selection-card travel-city-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <button className="close-button" title="Fechar" onClick={() => setTravelModalCityId(null)}>
              <X size={18} />
            </button>
            <div className="travel-selection-heading">
              <span className={selectedTravelCity?.isPort ? "travel-selection-kicker port" : "travel-selection-kicker"}>
                <GameIcon name={selectedTravelCity?.isPort ? "ship" : "pin"} size={18} />
                {selectedTravelCity?.isPort ? "Porto" : "Cidade"}
              </span>
              <div>
                <h3>{selectedTravelCity?.name}</h3>
                <small>{selectedRoute.destinationCountry?.name ?? game.currentCountry.name}</small>
              </div>
            </div>
            <p>{selectedTravelCity?.description}</p>
            <div className="travel-selection-meta">
              <span>Nível mínimo <strong>{selectedRoute.destinationCity.minLevel}</strong></span>
              <span>{selectedRoute.sameCountry ? "Rota terrestre" : "Rota marítima"}</span>
            </div>
            {selectedRoute.blockedByForeignInterior && (
              <p className="travel-selection-warning">
                Para visitar cidades internas de outro país, desembarque antes em {selectedRoute.portCity?.name ?? "seu porto"}.
              </p>
            )}
            {!selectedRoute.sameCountry && !selectedRoute.blockedByForeignInterior && !selectedRoute.current && (
              <p className="travel-selection-warning subtle">
                A viagem entre países usa navio e chega diretamente ao porto selecionado.
              </p>
            )}
            <button
              className="primary-button travel-action-button"
              disabled={selectedRoute.current || selectedRoute.locked}
              onClick={() => {
                socket.emit("city:travel", { cityId: selectedRoute.destinationCity.id });
                setTravelModalCityId(null);
              }}
            >
              <span className="travel-action-label">{selectedRoute.actionLabel}</span>
              {!selectedRoute.current && selectedRoute.ticketDefinition && (
                <span className="travel-action-ticket" aria-label={`${selectedRoute.ticketCount} ${selectedRoute.ticketLabel}`}>
                  <ItemVisual item={selectedRoute.ticketDefinition} className="travel-action-ticket-visual" />
                  <strong>x{selectedRoute.ticketCount}</strong>
                </span>
              )}
            </button>
          </article>
        </div>
      )}
    </section>
  );
}

function MarketPanel({ game }: { game: GameState }) {
  const tradableItems = game.character.inventory.filter((item) => !isItemEquipped(game, item.instanceId));
  const [instanceId, setInstanceId] = useState("");
  const [price, setPrice] = useState(25);
  const [quantity, setQuantity] = useState(1);
  const [currency, setCurrency] = useState<Currency>("gold");
  const [currencyFilter, setCurrencyFilter] = useState<"all" | Currency>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | ItemKind>("all");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "price-desc" | "price-asc">("date-desc");
  const [marketTab, setMarketTab] = useState<"buy" | "sell" | "history">("buy");
  const [historyFilter, setHistoryFilter] = useState<"buy" | "sell">("buy");
  const [selectedListing, setSelectedListing] = useState<MarketListing | null>(null);
  const selectedInventoryItem = tradableItems.find((item) => item.instanceId === instanceId) ?? null;
  const selectedItemDef = selectedInventoryItem ? game.itemCatalog[selectedInventoryItem.itemId] : null;
  const selectedSellStats = selectedInventoryItem && selectedItemDef ? getEnhancedItemStats(selectedItemDef, selectedInventoryItem) : null;
  const selectedSellRarity = selectedInventoryItem && selectedItemDef ? getItemRarity(selectedItemDef, selectedInventoryItem) : undefined;
  const maxQuantity = selectedInventoryItem ? Math.max(1, selectedInventoryItem.quantity) : 1;
  const saleSlots: Array<InventoryItem | null> = [
    ...tradableItems,
    ...Array(Math.max(0, 40 - tradableItems.length)).fill(null)
  ];
  const myListings = game.marketplaceListings.filter((listing) => listing.sellerPlayerId === game.player.id);
  const marketHistory = [...(game.character.marketHistory ?? [])].sort((left, right) => right.createdAt - left.createdAt);
  const historyEntries = marketHistory.filter((entry) => entry.kind === historyFilter);
  const purchaseListings = game.marketplaceListings
    .filter((listing) => listing.sellerPlayerId !== game.player.id)
    .filter((listing) => currencyFilter === "all" || listing.currency === currencyFilter)
    .filter((listing) => {
      if (typeFilter === "all") {
        return true;
      }
      return game.itemCatalog[listing.item.itemId]?.kind === typeFilter;
    })
    .sort((left, right) => {
      if (sortBy === "price-asc") {
        return left.price - right.price || right.createdAt - left.createdAt;
      }
      if (sortBy === "price-desc") {
        return right.price - left.price || right.createdAt - left.createdAt;
      }
      if (sortBy === "date-asc") {
        return left.createdAt - right.createdAt;
      }
      return right.createdAt - left.createdAt;
    });

  useEffect(() => {
    if (!tradableItems.some((item) => item.instanceId === instanceId)) {
      setInstanceId("");
    }
  }, [instanceId, tradableItems]);

  useEffect(() => {
    if (!selectedInventoryItem) {
      if (quantity !== 1) {
        setQuantity(1);
      }
      return;
    }
    const nextMax = selectedItemDef?.slot ? 1 : maxQuantity;
    if (quantity > nextMax) {
      setQuantity(nextMax);
    } else if (quantity < 1) {
      setQuantity(1);
    }
  }, [maxQuantity, quantity, selectedInventoryItem, selectedItemDef]);

  const createListing = (event: FormEvent) => {
    event.preventDefault();
    if (!instanceId) {
      return;
    }
    socket.emit("market:create", {
      instanceId,
      price,
      currency,
      quantity: selectedItemDef?.slot ? 1 : Math.max(1, Math.min(maxQuantity, quantity))
    });
    setInstanceId("");
    setQuantity(1);
  };

  return (
    <section className="content-panel market-panel">
      <PanelTitle icon={<GameIcon name="market" size={26} />} title="Mercado de Trocas" />
      <div className="market-tabs" role="tablist" aria-label="Ações do mercado">
        <button type="button" className={marketTab === "buy" ? "mini-tab active" : "mini-tab"} onClick={() => setMarketTab("buy")}>
          Compra
        </button>
        <button type="button" className={marketTab === "sell" ? "mini-tab active" : "mini-tab"} onClick={() => setMarketTab("sell")}>
          Venda
        </button>
        <button type="button" className={marketTab === "history" ? "mini-tab active" : "mini-tab"} onClick={() => setMarketTab("history")}>
          Histórico
        </button>
      </div>
      <div className="market-layout">
        {marketTab === "buy" && (
          <section className="market-block">
            <div className="market-block-head market-block-head-wrap">
              <div>
                <h3>Itens disponíveis para compra</h3>
                <p className="muted">Cada oferta é comprada inteira, exatamente na quantidade anunciada.</p>
              </div>
              <div className="market-toolbar">
                <div className="market-currency-filters" role="tablist" aria-label="Filtro de moeda">
                  <button
                    type="button"
                    className={`market-filter-btn${currencyFilter === "all" ? " active" : ""}`}
                    onClick={() => setCurrencyFilter("all")}
                    aria-pressed={currencyFilter === "all"}
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    className={`market-filter-btn${currencyFilter === "gold" ? " active" : ""}`}
                    onClick={() => setCurrencyFilter("gold")}
                    aria-pressed={currencyFilter === "gold"}
                  >
                    <Coins size={16} style={{ color: "var(--gold)" }} /> Coin
                  </button>
                  <button
                    type="button"
                    className={`market-filter-btn${currencyFilter === "diamonds" ? " active" : ""}`}
                    onClick={() => setCurrencyFilter("diamonds")}
                    aria-pressed={currencyFilter === "diamonds"}
                  >
                    <Gem size={16} style={{ color: "var(--cyan)" }} /> Diamante
                  </button>
                </div>
                <div className="market-selects">
                  <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as "all" | ItemKind)}>
                    <option value="all">Todos os tipos</option>
                    {Object.entries(ITEM_KIND_LABELS).map(([kind, label]) => (
                      <option key={kind} value={kind}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)}>
                    <option value="date-desc">Mais recentes</option>
                    <option value="date-asc">Mais antigas</option>
                    <option value="price-asc">Menor valor</option>
                    <option value="price-desc">Maior valor</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="market-list">
              {purchaseListings.length === 0 && <p className="empty-state">Nenhuma oferta encontrada com esse filtro.</p>}
              <div className="shop-grid npc-shop-grid market-shop-grid">
                {purchaseListings.map((listing) =>
                  (() => {
                    const item = game.itemCatalog[listing.item.itemId];
                    return (
                      <div
                        key={listing.id}
                        role="button"
                        tabIndex={0}
                        className="shop-item-card market-shop-card"
                        onClick={() => setSelectedListing(listing)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setSelectedListing(listing);
                          }
                        }}
                        title={formatInventoryItemName(item, listing.item)}
                      >
                        <ItemVisual item={item} className="shop-card-image" quantity={listing.item.quantity > 1 ? listing.item.quantity : undefined} enhancementLevel={listing.item.enhancementLevel} rarity={listing.item.rarity} />
                        <strong>{formatInventoryItemName(item, listing.item)}</strong>
                        <small className="market-card-subtle">
                          <PlayerName playerId={listing.sellerPlayerId} name={listing.sellerName} /> - NPC {formatCurrency(getNpcSellValue(item, listing.item))}
                        </small>
                        <span className="shop-card-price">
                          {formatCurrency(listing.price)} {listing.currency === "gold" ? <Coins size={13} style={{ color: "var(--gold)" }} /> : <Gem size={13} style={{ color: "var(--cyan)" }} />}
                        </span>
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
            {selectedListing && (
              <MarketListingModal
                listing={selectedListing}
                game={game}
                onClose={() => setSelectedListing(null)}
                onBuy={() => {
                  socket.emit("market:buy", { listingId: selectedListing.id });
                  setSelectedListing(null);
                }}
              />
            )}
          </section>
        )}

        {marketTab === "sell" && (
          <section className="market-block">
            <div className="market-block-head">
              <div>
                <h3>Gerenciar vendas</h3>
                <p className="muted">Clique em um item para completar a oferta.</p>
              </div>
            </div>
            <div className="inventory-grid market-sell-grid">
              {saleSlots.map((slot, index) => {
                if (!slot) {
                  return <div key={`sale-empty-${index}`} className="inv-slot empty" />;
                }
                const item = game.itemCatalog[slot.itemId];
                const selected = instanceId === slot.instanceId;
                const rarityColor = getEquipmentRarityColor(item, slot.rarity);
                const enhancement = item.slot ? Math.max(0, slot.enhancementLevel ?? 0) : 0;
                const enhancementClasses = [
                  enhancement >= 4 ? "enhance-tier-4" : "",
                  enhancement >= 7 ? "enhance-tier-7" : "",
                  enhancement >= 10 ? "enhance-tier-10" : "",
                  enhancement >= 13 ? "enhance-tier-13" : ""
                ].filter(Boolean).join(" ");
                return (
                  <button
                    key={slot.instanceId}
                    type="button"
                    className={`inv-slot${selected ? " selected" : ""} ${enhancementClasses}`}
                    title={formatInventoryItemName(item, slot)}
                    style={rarityColor ? ({ borderColor: rarityColor, "--rarity-color": rarityColor } as React.CSSProperties) : undefined}
                    onClick={() => setInstanceId(selected ? "" : slot.instanceId)}
                  >
                    <ItemVisual
                      item={item}
                      className="slot-visual"
                      quantity={slot.quantity > 1 ? slot.quantity : undefined}
                      enhancementLevel={slot.enhancementLevel}
                      rarity={slot.rarity}
                    />
                    {enhancement >= 10 && <span className="inv-slot-light-sweep" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
            {selectedInventoryItem && selectedItemDef ? (
              <form className="market-form market-sale-form" onSubmit={createListing}>
                <div className="market-selected-summary">
                  <ItemVisual
                    item={selectedItemDef}
                    className="market-selected-icon"
                    quantity={selectedInventoryItem.quantity > 1 ? selectedInventoryItem.quantity : undefined}
                    enhancementLevel={selectedInventoryItem.enhancementLevel}
                    rarity={selectedInventoryItem.rarity}
                  />
                  <div>
                    <strong>{formatInventoryItemName(selectedItemDef, selectedInventoryItem)}</strong>
                    <span>{ITEM_KIND_LABELS[selectedItemDef.kind]}</span>
                    <small>
                      {selectedItemDef.slot
                        ? "Equipamento vendido unidade por unidade."
                        : `Disponível para lote: até x${selectedInventoryItem.quantity}.`}
                    </small>
                    {selectedItemDef.slot && selectedSellRarity && <div className={`item-rarity ${selectedSellRarity}`}>{RARITY_LABELS[selectedSellRarity]}</div>}
                  </div>
                </div>
                {selectedItemDef.slot && selectedSellStats && (
                  <div className="market-sale-stats">
                    {selectedSellStats.strength !== undefined && <span>FOR <b>+{selectedSellStats.strength}</b></span>}
                    {selectedSellStats.constitution !== undefined && <span>CON <b>+{selectedSellStats.constitution}</b></span>}
                    {selectedSellStats.agility !== undefined && <span>AGI <b>+{selectedSellStats.agility}</b></span>}
                    {selectedSellStats.defense !== undefined && <span>DEF <b>+{selectedSellStats.defense}</b></span>}
                  </div>
                )}
                <label>
                  <span>Quantidade</span>
                  <input
                    type="number"
                    min={1}
                    max={selectedItemDef.slot ? 1 : maxQuantity}
                    value={selectedItemDef.slot ? 1 : quantity}
                    disabled={Boolean(selectedItemDef.slot)}
                    onChange={(event) => setQuantity(Number(event.target.value))}
                    aria-label="Quantidade do lote"
                  />
                </label>
                <label>
                  <span>Preço</span>
                  <input
                    type="number"
                    min={1}
                    value={price}
                    onChange={(event) => setPrice(Number(event.target.value))}
                    aria-label="Preço"
                  />
                </label>
                <label>
                  <span>Moeda</span>
                  <select value={currency} onChange={(event) => setCurrency(event.target.value as Currency)}>
                    <option value="gold">Ouro</option>
                    <option value="diamonds">Diamantes</option>
                  </select>
                </label>
                <button className="primary-button">
                  Ofertar lote
                </button>
              </form>
            ) : (
              <div className="market-form-hint">
                <span>{tradableItems.length === 0 ? "Nenhum item disponível para anunciar." : "Selecione um item acima para anunciar."}</span>
              </div>
            )}
            <section className="market-group">
              <h3>Minhas ofertas</h3>
              <div className="market-list">
                {myListings.length === 0 && <p className="empty-state">Você ainda não colocou nada à venda.</p>}
                {myListings.map((listing) => (
                  <MarketListingCard
                    key={listing.id}
                    game={game}
                    listing={listing}
                    actionLabel="Cancelar"
                    metaLabel="Sua oferta"
                    onAction={() => socket.emit("market:cancel", { listingId: listing.id })}
                  />
                ))}
              </div>
            </section>
          </section>
        )}

        {marketTab === "history" && (
          <section className="market-block">
            <div className="market-block-head market-block-head-wrap">
              <div>
                <h3>Histórico do personagem</h3>
                <p className="muted">Veja tudo o que você comprou e vendeu no Mercado.</p>
              </div>
              <div className="market-history-tabs" role="tablist" aria-label="Filtro do histórico">
                <button type="button" className={historyFilter === "buy" ? "mini-tab active" : "mini-tab"} onClick={() => setHistoryFilter("buy")}>
                  Compra
                </button>
                <button type="button" className={historyFilter === "sell" ? "mini-tab active" : "mini-tab"} onClick={() => setHistoryFilter("sell")}>
                  Venda
                </button>
              </div>
            </div>
            <div className="market-list market-history-list">
              {historyEntries.length === 0 && <p className="empty-state">Nenhuma movimentação registrada neste filtro.</p>}
              {historyEntries.map((entry) => (
                <MarketHistoryRow key={entry.id} entry={entry} game={game} />
              ))}
            </div>
          </section>
        )}
      </div>
    </section>
  );
}

function MarketHistoryRow({ entry, game }: { entry: MarketTransactionHistory; game: GameState }) {
  const item = game.itemCatalog[entry.item.itemId];
  return (
    <article className={entry.kind === "buy" ? "market-history-row buy" : "market-history-row sell"}>
      <div className="market-history-icon">
        {entry.kind === "buy" ? <ShoppingBag size={18} /> : <ArrowLeftRight size={18} />}
      </div>
      <div className="market-history-body">
        <strong>{entry.kind === "buy" ? "Compra" : "Venda"} - {formatInventoryItemName(item, entry.item)}</strong>
        <span>
          {entry.kind === "buy" ? "Comprado de" : "Vendido para"} <PlayerName playerId={entry.counterpartyPlayerId} name={entry.counterpartyName} />
        </span>
        <small>{formatListingDate(entry.createdAt)}</small>
      </div>
      <div className="market-history-side">
        <b>{formatCurrency(entry.price)}</b>
        <small>{entry.currency === "gold" ? "Ouro" : "Diamantes"}</small>
      </div>
    </article>
  );
}

function MarketListingCard({
  listing,
  game,
  actionLabel,
  metaLabel,
  onAction
}: {
  listing: MarketListing;
  game: GameState;
  actionLabel: string;
  metaLabel: string;
  onAction: () => void;
}) {
  const item = game.itemCatalog[listing.item.itemId];
  const rarityColor = getEquipmentRarityColor(item, listing.item.rarity);
  return (
    <article className="market-card" style={{ borderColor: rarityColor }}>
      <ItemVisual item={item} className="market-item-box" quantity={listing.item.quantity > 1 ? listing.item.quantity : undefined} enhancementLevel={listing.item.enhancementLevel} rarity={listing.item.rarity} />
      <div className="market-card-body">
        <strong>{formatInventoryItemName(item, listing.item)}</strong>
        <span className="market-card-meta">NPC: {formatCurrency(getNpcSellValue(item, listing.item))} ouro</span>
        <span className="market-card-meta">{metaLabel}</span>
      </div>
      <div className="market-card-side">
        <div className="market-card-price">
          {formatCurrency(listing.price)} {listing.currency === "gold" ? <Coins size={14} style={{ color: "var(--gold)" }} /> : <Gem size={14} style={{ color: "var(--cyan)" }} />}
        </div>
        <button className="icon-button" title={actionLabel} onClick={onAction}>
          <X size={16} />
        </button>
      </div>
    </article>
  );
}

function MarketListingModal({
  listing,
  game,
  onClose,
  onBuy
}: {
  listing: MarketListing;
  game: GameState;
  onClose: () => void;
  onBuy: () => void;
}) {
  const item = game.itemCatalog[listing.item.itemId];
  const rarityColor = getEquipmentRarityColor(item, listing.item.rarity);
  const selectedStats = getEnhancedItemStats(item, listing.item);
  const canReceiveListing =
    item.slot || !game.character.inventory.some((inventoryItem) => inventoryItem.itemId === listing.item.itemId)
      ? game.inventoryUsed < game.inventoryCapacity
      : true;
  const canBuy =
    (listing.currency === "gold" ? game.character.gold >= listing.price : game.character.diamonds >= listing.price) &&
    canReceiveListing;
  return (
    <div className="drawer-backdrop" role="presentation" onClick={onClose}>
      <div className="market-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} style={{ borderColor: rarityColor }}>
        <button className="close-button" title="Fechar" onClick={onClose}>
          <X size={20} />
        </button>
        <ItemVisual item={item} className="market-modal-icon" quantity={listing.item.quantity > 1 ? listing.item.quantity : undefined} enhancementLevel={listing.item.enhancementLevel} rarity={listing.item.rarity} />
        <div className="market-modal-content">
          <h2>{formatInventoryItemName(item, listing.item)}</h2>
          <small className="market-modal-type">{ITEM_KIND_LABELS[item.kind]}</small>
          {getItemRarity(item, listing.item) && (
            <div className={`item-rarity ${getItemRarity(item, listing.item)}`}>
              {RARITY_LABELS[getItemRarity(item, listing.item) ?? "common"]}
            </div>
          )}
          <p className="market-modal-desc">{item.description}</p>

          <div className="market-subtle-meta">
            <span>Vendedor <b><PlayerName playerId={listing.sellerPlayerId} name={listing.sellerName} /></b></span>
            <span>NPC <b>{formatCurrency(getNpcSellValue(item, listing.item))} ouro</b></span>
            <span>{formatListingDate(listing.createdAt)}</span>
            {listing.item.quantity > 1 && <span>Lote <b>x{listing.item.quantity}</b></span>}
          </div>

          {item.slot && (
            <div className="market-modal-stats market-attribute-highlight">
              <h4>Atributos</h4>
              <div className="stat-list">
                {selectedStats.strength && <div><span>Força</span> <strong>+{selectedStats.strength}</strong></div>}
                {selectedStats.constitution && <div><span>Constituição</span> <strong>+{selectedStats.constitution}</strong></div>}
                {selectedStats.agility && <div><span>Agilidade</span> <strong>+{selectedStats.agility}</strong></div>}
                {selectedStats.defense && <div><span>Defesa</span> <strong>+{selectedStats.defense}</strong></div>}
              </div>
            </div>
          )}

          {item.stats.healPercent && (
            <div className="market-modal-stats">
              <h4>Efeito</h4>
              <p>Restaura {item.stats.healPercent * 100}% da vida ao usar</p>
            </div>
          )}

          {item.stats.energyPercent && (
            <div className="market-modal-stats">
              <h4>Efeito</h4>
              <p>Restaura {item.stats.energyPercent * 100}% da energia ao usar</p>
            </div>
          )}

          {item.slot && item.minLevel > 1 && (
            <div className={item.minLevel > game.character.level ? "market-modal-requirement unmet" : "market-modal-requirement"}>
              Nível mínimo: {item.minLevel} {item.minLevel > game.character.level && "(não alcançado)"}
            </div>
          )}

          <div className="market-modal-footer">
            <div className="market-modal-price">
              <strong>Preço total:</strong>
              <b className="price-amount">
                {formatCurrency(listing.price)} {listing.currency === "gold" ? <Coins size={16} style={{ color: "var(--gold)" }} /> : <Gem size={16} style={{ color: "var(--cyan)" }} />}
              </b>
            </div>
            <button
              className="primary-button"
              disabled={!canBuy}
              onClick={onBuy}
            >
              {!canBuy && listing.currency === "gold" && game.character.gold < listing.price ? "Ouro insuficiente" : ""}
              {!canBuy && listing.currency === "diamonds" && game.character.diamonds < listing.price ? "Diamantes insuficientes" : ""}
              {!canBuy && !canReceiveListing ? "Inventário cheio" : ""}
              {canBuy ? "Comprar lote" : ""}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BattlePanel({ game }: { game: GameState }) {
  const battle = game.activeBattle!;
  const [autoUntilStopped, setAutoUntilStopped] = useState(false);
  const [autoPveRunning, setAutoPveRunning] = useState(false);
  const [battleCue, setBattleCue] = useState<BattleAnimationCue | null>(null);
  const [battleAnimationTick, setBattleAnimationTick] = useState(0);
  const [displayHpByParticipantId, setDisplayHpByParticipantId] = useState<Record<string, number>>(() =>
    Object.fromEntries(battle.participants.map((participant) => [participant.id, participant.hp]))
  );
  const [visibleBattleLogs, setVisibleBattleLogs] = useState<BattleLogEntry[]>(battle.log);
  const pendingBattleEventsRef = useRef<BattleVisualEvent[]>([]);
  const battleCueTimerRef = useRef<number | null>(null);
  const battleResultPauseTimerRef = useRef<number | null>(null);
  const battleAnimationGateRef = useRef(false);
  const battleCueSequenceRef = useRef(0);
  const autoPveRunningRef = useRef(false);
  const lastAutoPveStepKeyRef = useRef<string | null>(null);
  const lastBattleIdRef = useRef<string | null>(null);
  const lastLogIdRef = useRef<string | null>(null);
  const lastHordeAdvanceKeyRef = useRef<string | null>(null);
  const displayedParticipants = battle.participants.map((participant) => ({
    ...participant,
    hp: Math.max(0, Math.min(participant.maxHp, displayHpByParticipantId[participant.id] ?? participant.hp))
  }));
  const me = displayedParticipants.find((participant) => participant.ownerPlayerId === game.player.id);
  const opponent = displayedParticipants.find((participant) => participant.id !== me?.id);
  const myTurn = battle.turnParticipantId === me?.id;
  const { preferences } = useQuickPotionSettings();
  const healthPotion = getQuickPotionOption(game, preferences, "health");
  const energyPotion = getQuickPotionOption(game, preferences, "energy");
  const firstPotion = healthPotion?.inventoryItem ?? null;
  const autoPveActive = isAutoPveActive(game);
  const canUseAutoPve = (battle.mode === "pve" || battle.mode === "dungeon") && autoPveActive;
  const hasInventoryDiscardInBattle = battle.log.some((entry) => {
    const lower = entry.text.toLowerCase();
    const plain = lower.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return plain.includes("inventario cheio") && (plain.includes("descart") || plain.includes("caiu no chao"));
  });
  const rematchMonsterId = getBattleMonsterId(battle);
  const rematchMonster = rematchMonsterId ? game.cityMonsters.find((monster) => monster.id === rematchMonsterId) : null;
  const rematchEnergyCost = rematchMonster ? rematchMonster.level + (battle.mode === "dungeon" ? 1 : 0) : 0;
  const canRematch =
    Boolean(rematchMonster) &&
    game.character.currentHp > 0 &&
    game.character.currentEnergy >= rematchEnergyCost &&
    battle.mode === "pve";
  const activeDungeonRun = game.character.dungeonProgress?.activeRun;
  const hasMoreHordeMonsters =
    battle.mode === "dungeon" && (activeDungeonRun?.currentEncounterMonsterIds?.length ?? 0) > 0;
  const dungeonBuffChips: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
    heal_full: { label: "Vida total", icon: <Heart size={12} />, cls: "buff-heal" },
    damage_50: { label: "+50% dano", icon: <Flame size={12} />, cls: "buff-damage" },
    defense_10: { label: "+10% defesa", icon: <Shield size={12} />, cls: "buff-defense" },
    agility_20: { label: "+20% agi", icon: <Zap size={12} />, cls: "buff-agility" },
    strength_20: { label: "+20% força", icon: <Swords size={12} />, cls: "buff-strength" },
  };
  const dungeonTrapChips: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
    hp_20: { label: "-20% vida", icon: <Skull size={12} />, cls: "trap-hp" },
    agility_20: { label: "-20% agi", icon: <Zap size={12} />, cls: "trap-agility" },
    defense_20: { label: "-20% def", icon: <Shield size={12} />, cls: "trap-defense" },
  };
  const dungeonBuffLabels: Record<string, string> = {
    heal_full: "Regenerar vida",
    damage_50: "+50% dano",
    defense_10: "+10% defesa",
    agility_20: "+20% agilidade",
    strength_20: "+20% força"
  };
  const dungeonTrapLabels: Record<string, string> = {
    hp_20: "-20% vida",
    agility_20: "-20% agilidade",
    defense_20: "-20% defesa"
  };
  const monarchAttackLimit = battle.monarch?.attackLimit ?? MONARCH_BATTLE_ATTACK_LIMIT;
  const monarchAttacksUsed = battle.monarch?.attacksUsed ?? 0;
  const monarchHitsLeft = Math.max(0, monarchAttackLimit - monarchAttacksUsed);

  useEffect(() => {
    autoPveRunningRef.current = autoPveRunning;
  }, [autoPveRunning]);

  useEffect(() => {
    if (!autoPveRunningRef.current) {
      setAutoUntilStopped(false);
    }
  }, [battle.id]);

  const releaseBattleAnimationGate = () => {
    battleAnimationGateRef.current = false;
    setBattleAnimationTick((value) => value + 1);
  };

  const reconcileDisplayedHp = () => {
    setDisplayHpByParticipantId(
      Object.fromEntries(battle.participants.map((participant) => [participant.id, participant.hp]))
    );
  };

  const applyBattleVisualEvent = (event: BattleVisualEvent) => {
    setVisibleBattleLogs((current) => [event.entry, ...current.filter((entry) => entry.id !== event.entry.id)]);

    const cue = event.cue;
    const hpChange = parseBattleHpChange(event.entry.text, battle.participants);
    if (!cue) {
      if (hpChange) {
        setDisplayHpByParticipantId((current) => {
          const participant = battle.participants.find((entry) => entry.id === hpChange.participantId);
          const currentHp = current[hpChange.participantId] ?? participant?.hp ?? 0;
          return {
            ...current,
            [hpChange.participantId]: Math.max(0, Math.min(participant?.maxHp ?? currentHp, currentHp + hpChange.delta))
          };
        });
      }
      return BATTLE_LOG_STEP_MS;
    }

    battleAnimationGateRef.current = true;
    battleCueSequenceRef.current += 1;
    setBattleCue({ ...cue, sequence: battleCueSequenceRef.current });

    if (cue.kind === "damage" && cue.damage !== undefined) {
      setDisplayHpByParticipantId((current) => {
        const defender = battle.participants.find((participant) => participant.id === cue.defenderId);
        const currentHp = current[cue.defenderId] ?? defender?.hp ?? 0;
        return {
          ...current,
          [cue.defenderId]: Math.max(0, currentHp - cue.damage!)
        };
      });
    }

    return BATTLE_CUE_DURATION_MS;
  };

  const playNextBattleEvent = () => {
    const nextEvent = pendingBattleEventsRef.current.shift();
    if (!nextEvent) {
      setBattleCue(null);
      reconcileDisplayedHp();
      if (battle.status === "ended" && autoPveRunningRef.current) {
        if (battleResultPauseTimerRef.current) {
          window.clearTimeout(battleResultPauseTimerRef.current);
        }
        battleResultPauseTimerRef.current = window.setTimeout(() => {
          battleResultPauseTimerRef.current = null;
          releaseBattleAnimationGate();
        }, BATTLE_RESULT_PAUSE_MS);
      } else {
        releaseBattleAnimationGate();
      }
      return;
    }

    setBattleCue(null);
    battleAnimationGateRef.current = true;
    const duration = applyBattleVisualEvent(nextEvent);
    if (battleCueTimerRef.current) {
      window.clearTimeout(battleCueTimerRef.current);
    }
    battleCueTimerRef.current = window.setTimeout(() => {
      battleCueTimerRef.current = null;
      playNextBattleEvent();
    }, duration);
  };

  useEffect(() => {
    if (lastBattleIdRef.current !== battle.id) {
      lastBattleIdRef.current = battle.id;
      lastLogIdRef.current = battle.log[0]?.id ?? null;
      pendingBattleEventsRef.current = [];
      battleAnimationGateRef.current = false;
      if (battleCueTimerRef.current) {
        window.clearTimeout(battleCueTimerRef.current);
        battleCueTimerRef.current = null;
      }
      if (battleResultPauseTimerRef.current) {
        window.clearTimeout(battleResultPauseTimerRef.current);
        battleResultPauseTimerRef.current = null;
      }
      setBattleCue(null);
      setVisibleBattleLogs(battle.log);
      setDisplayHpByParticipantId(
        Object.fromEntries(battle.participants.map((participant) => [participant.id, participant.hp]))
      );
      setBattleAnimationTick((value) => value + 1);
      return;
    }

    const latestLogId = battle.log[0]?.id ?? null;
    if (!latestLogId || latestLogId === lastLogIdRef.current) {
      return;
    }

    const previousLatestIndex = battle.log.findIndex((entry) => entry.id === lastLogIdRef.current);
    const newEntries = previousLatestIndex === -1 ? battle.log.slice(0, 1) : battle.log.slice(0, previousLatestIndex);
    lastLogIdRef.current = latestLogId;
    const events = newEntries
      .slice()
      .reverse()
      .map((entry) => ({
        entry,
        cue: parseBattleAnimationCue(entry.text, battle.participants)
      }));

    if (events.length > 0) {
      battleAnimationGateRef.current = true;
      pendingBattleEventsRef.current.push(...events);
      if (!battleCue && !battleCueTimerRef.current) {
        playNextBattleEvent();
      }
    }
  }, [battle.id, battle.log, battle.participants, battleCue]);

  useEffect(() => {
    return () => {
      if (battleCueTimerRef.current) {
        window.clearTimeout(battleCueTimerRef.current);
      }
      if (battleResultPauseTimerRef.current) {
        window.clearTimeout(battleResultPauseTimerRef.current);
      }
    };
  }, []);

  // Auto-advance to next horde monster after death animation completes
  useEffect(() => {
    if (battle.status !== "ended" || !hasMoreHordeMonsters) return;
    const winner = battle.participants.find((p) => p.id === battle.winnerParticipantId);
    if (winner?.ownerPlayerId !== game.player.id) return;
    if (battleAnimationGateRef.current || pendingBattleEventsRef.current.length > 0 || battleCue) return;
    const key = `${battle.id}:horde:next`;
    if (lastHordeAdvanceKeyRef.current === key) return;
    lastHordeAdvanceKeyRef.current = key;
    const timer = window.setTimeout(() => socket.emit("dungeon:advance"), 700);
    return () => window.clearTimeout(timer);
  }, [hasMoreHordeMonsters, battleAnimationTick, battleCue, battle.status, battle.id, battle.winnerParticipantId, game.player.id]);

  const animationsPending = battleAnimationGateRef.current || Boolean(battleCue) || pendingBattleEventsRef.current.length > 0;

  const emitAutoPveTurn = () => {
    const key = `${battle.id}:${battle.updatedAt}:turn`;
    lastAutoPveStepKeyRef.current = key;
    socket.emit("battle:action", {
      battleId: battle.id,
      action: "auto",
      continueUntilStopped: false
    });
  };

  const triggerAutoPve = () => {
    if (autoUntilStopped) {
      setAutoPveRunning(true);
    }
    emitAutoPveTurn();
  };

  const handleAttackClick = () => {
    if (canUseAutoPve && autoUntilStopped) {
      triggerAutoPve();
      return;
    }

    socket.emit("battle:action", { battleId: battle.id, action: "attack" });
  };

  const stopAutoPve = () => {
    autoPveRunningRef.current = false;
    setAutoPveRunning(false);
    setAutoUntilStopped(false);
    lastAutoPveStepKeyRef.current = null;
  };

  useEffect(() => {
    if (!autoPveRunning || battleAnimationGateRef.current || animationsPending || !autoPveActive || (battle.mode !== "pve" && battle.mode !== "dungeon")) {
      return;
    }

    if (battle.status === "active") {
      if (!myTurn) {
        return;
      }
      const key = `${battle.id}:${battle.updatedAt}:turn`;
      if (lastAutoPveStepKeyRef.current === key) {
        return;
      }
      emitAutoPveTurn();
      return;
    }

    const winner = battle.participants.find((participant) => participant.id === battle.winnerParticipantId);
    const playerWon = winner?.ownerPlayerId === game.player.id;
    if (playerWon && hasInventoryDiscardInBattle) {
      stopAutoPve();
      return;
    }

    if (playerWon && rematchMonsterId && canRematch) {
      const key = `${battle.id}:${battle.updatedAt}:next`;
      if (lastAutoPveStepKeyRef.current === key) {
        return;
      }
      lastAutoPveStepKeyRef.current = key;
      socket.emit("hunt:start", { monsterId: rematchMonsterId });
      return;
    }

    setAutoPveRunning(false);
    setAutoUntilStopped(false);
  }, [
    autoPveRunning,
    animationsPending,
    battleAnimationTick,
    autoPveActive,
    battle.id,
    battle.updatedAt,
    battle.status,
    battle.mode,
    battle.winnerParticipantId,
    battle.participants,
    hasInventoryDiscardInBattle,
    myTurn,
    rematchMonsterId,
    canRematch,
    game.player.id
  ]);

  const combatantOrder = [me, opponent].filter((participant): participant is BattleParticipant => Boolean(participant));
  const getMotionStyle = (participantId: string, role: "attacker" | "defender"): React.CSSProperties => {
    const isLeft = combatantOrder[0]?.id === participantId;
    if (role === "attacker") {
      return { "--attack-x": `${isLeft ? 16 : -16}px` } as React.CSSProperties;
    }
    return { "--dodge-x": `${isLeft ? -12 : 12}px` } as React.CSSProperties;
  };

  const getMotionClass = (participantId: string) => {
    if (!battleCue) return "";
    const suffix = battleCue.sequence % 2 === 0 ? "a" : "b";
    if (battleCue.attackerId === participantId) {
      return `striking strike-${suffix}`;
    }
    if (battleCue.defenderId === participantId && battleCue.kind === "damage") {
      return `hit hit-${suffix}`;
    }
    if (battleCue.defenderId === participantId && battleCue.kind === "dodge") {
      return `dodging dodge-${suffix}`;
    }
    return "";
  };

  return (
    <section className="content-panel battle-panel">
      <PanelTitle
        icon={<GameIcon name={battle.mode === "pvp" ? "arena" : battle.mode === "dungeon" ? "dungeon" : battle.mode === "monarch" ? "monarch" : "hunt"} size={26} />}
        title={battle.mode === "pvp" ? (battle.arena?.type === "ranked" ? "Arena Ranqueada" : "Arena Duelo") : battle.mode === "dungeon" ? "Masmorra" : battle.mode === "monarch" ? "Monarca" : "Batalha PvE"}
      />
      <div className="combatants">
        {me && (
          <CombatantCard
            participant={me}
            active={myTurn}
            defeated={me.hp <= 0}
            winner={battle.status === "ended" && battle.winnerParticipantId === me.id}
            motionClass={getMotionClass(me.id)}
            motionStyle={battleCue?.attackerId === me.id ? getMotionStyle(me.id, "attacker") : getMotionStyle(me.id, "defender")}
            damageCue={battleCue?.kind === "damage" && battleCue.defenderId === me.id ? battleCue : null}
          />
        )}
        {me && opponent && (
          <div className="battle-versus" aria-hidden="true">
            <Swords size={24} />
          </div>
        )}
        {opponent && (
          <CombatantCard
            participant={opponent}
            active={battle.turnParticipantId === opponent.id}
            defeated={opponent.hp <= 0}
            winner={battle.status === "ended" && battle.winnerParticipantId === opponent.id}
            motionClass={getMotionClass(opponent.id)}
            motionStyle={battleCue?.attackerId === opponent.id ? getMotionStyle(opponent.id, "attacker") : getMotionStyle(opponent.id, "defender")}
            damageCue={battleCue?.kind === "damage" && battleCue.defenderId === opponent.id ? battleCue : null}
          />
        )}
      </div>
      {battle.mode === "monarch" && (
        <div className={monarchHitsLeft <= 10 ? "monarch-doom-counter danger" : "monarch-doom-counter"}>
          <span>Decreto final em</span>
          <strong>{monarchHitsLeft}</strong>
          <span>{monarchHitsLeft === 1 ? "hit" : "hits"}</span>
        </div>
      )}
      {battle.mode === "dungeon" && activeDungeonRun && (
        <div className="dungeon-active-modifiers battle-dungeon-modifiers">
          <strong>Buffs:</strong>
          {activeDungeonRun.activeBuffs.length > 0 ? (
            activeDungeonRun.activeBuffs.map((buff) => {
              const chip = dungeonBuffChips[buff];
              return chip
                ? <span key={buff} className={`dungeon-effect-chip ${chip.cls}`}>{chip.icon}{chip.label}</span>
                : <span key={buff} className="item-rarity epic">{dungeonBuffLabels[buff] ?? buff}</span>;
            })
          ) : (
            <span className="muted">Nenhum</span>
          )}
          <strong>Debuffs:</strong>
          {activeDungeonRun.activeTraps.length > 0 ? (
            activeDungeonRun.activeTraps.map((trap) => {
              const chip = dungeonTrapChips[trap];
              return chip
                ? <span key={trap} className={`dungeon-effect-chip ${chip.cls}`}>{chip.icon}{chip.label}</span>
                : <span key={trap} className="item-rarity rare">{dungeonTrapLabels[trap] ?? trap}</span>;
            })
          ) : (
            <span className="muted">Nenhum</span>
          )}
        </div>
      )}
      <BattlePotionDock
        battleId={battle.id}
        battleActive={battle.status === "active"}
        healthPotion={healthPotion}
        energyPotion={energyPotion}
        canAct={myTurn && !animationsPending}
        hpFull={game.character.currentHp >= game.derived.maxHp}
        energyFull={game.character.currentEnergy >= game.derived.maxEnergy}
      />
      <div className="battle-actions">
        {battle.status === "active" ? (
          <>
            <button
              className="primary-button atack-button"
              disabled={!myTurn || animationsPending}
              onClick={handleAttackClick}
            >
              <Swords size={16} className="button-game-icon" /> Atacar
            </button>
            <button
              className="ghost-button battle-inline-potion"
              disabled={!myTurn || !firstPotion || animationsPending}
              onClick={() =>
                socket.emit("battle:action", {
                  battleId: battle.id,
                  action: "usePotion",
                  instanceId: firstPotion?.instanceId
                })
              }
              style={{padding: "3px 12px"}}
            >
              <AssetImage style={{ width: 27 }} src={"/assets/items/potions/health.png"} alt={"Poção de vida"} fallback={"?"} />
              <span style={{verticalAlign: "super"}}>Usar poção de vida</span>
            </button>
            <button className="danger-button battle-flee-button" disabled={animationsPending || battle.mode === "dungeon"} onClick={() => socket.emit("battle:flee")}>
              Fugir
            </button>
            {canUseAutoPve && (
              <>
                <label className="auto-pve-toggle">
                  <input
                    type="checkbox"
                    checked={autoUntilStopped}
                    onChange={(event) => {
                      if (event.target.checked) {
                        setAutoUntilStopped(true);
                      } else {
                        stopAutoPve();
                      }
                    }}
                  />
                  Auto PvE
                </label>
              </>
            )}
          </>
        ) : (
          <>
            {animationsPending ? (
              <button className="ghost-button" disabled>
                {hasMoreHordeMonsters ? "Inimigo derrotado..." : "Coletando espólios..."}
              </button>
            ) : hasMoreHordeMonsters ? (
              <button className="ghost-button" disabled>
                Próximo combate...
              </button>
            ) : (
              <>
                {rematchMonsterId && battle.mode === "pve" && (
                  <button
                    className="primary-button"
                    disabled={!canRematch || autoPveRunning}
                    onClick={() => socket.emit("hunt:start", { monsterId: rematchMonsterId })}
                  >
                    <Swords size={18} style={{marginRight: "4px"}} /> Enfrentar novamente
                  </button>
                )}
                <button className="ghost-button" disabled={autoPveRunning} onClick={() => socket.emit("battle:leave")}>
                  Voltar para a cidade
                </button>
              </>
            )}
          </>
        )}
        {autoPveRunning && (
          <button className="danger-button auto-pve-stop-button" onClick={stopAutoPve}>
            <X size={14} /> Parar Auto PvE
          </button>
        )}
      </div>
      <div className="battle-log">
        {visibleBattleLogs.map((entry) => (
          <p className={`battle-log-entry ${getBattleLogKind(entry.text)}`} key={entry.id}>
            <span className="battle-log-icon">{getBattleLogIcon(entry.text, game.itemCatalog)}</span>
            <span>{renderTextWithPlayerLinks(entry.text, battle.participants)}</span>
          </p>
        ))}
      </div>
    </section>
  );
}

function BattlePotionDock({
  battleId,
  battleActive,
  healthPotion,
  energyPotion,
  canAct,
  hpFull,
  energyFull
}: {
  battleId: string;
  battleActive: boolean;
  healthPotion: PotionQuickOption | null;
  energyPotion: PotionQuickOption | null;
  canAct: boolean;
  hpFull: boolean;
  energyFull: boolean;
}) {
  const usePotion = (potion: PotionQuickOption | null) => {
    if (!potion) {
      return;
    }
    if (!battleActive) {
      socket.emit("inventory:use", {
        instanceId: potion.inventoryItem.instanceId
      });
      return;
    }
    socket.emit("battle:action", {
      battleId,
      action: "usePotion",
      instanceId: potion.inventoryItem.instanceId
    });
  };

  return (
    <aside className="battle-potion-dock" aria-label="Poções de batalha">
      <button
        className="battle-potion-button health"
        disabled={(battleActive && !canAct) || !healthPotion || hpFull}
        title={healthPotion?.definition.name ?? "Nenhuma poção de vida"}
        onClick={() => usePotion(healthPotion)}
      >
        {healthPotion ? (
          <ItemVisual item={healthPotion.definition} className="battle-potion-visual" />
        ) : (
          <span className="battle-potion-visual empty"><Heart size={18} /></span>
        )}
        <span className="battle-potion-count">x{healthPotion?.quantity ?? 0}</span>
      </button>
      <button
        className="battle-potion-button energy"
        disabled={(battleActive && !canAct) || !energyPotion || energyFull}
        title={energyPotion?.definition.name ?? "Nenhuma poção de energia"}
        onClick={() => usePotion(energyPotion)}
      >
        {energyPotion ? (
          <ItemVisual item={energyPotion.definition} className="battle-potion-visual" />
        ) : (
          <span className="battle-potion-visual empty"><Zap size={18} /></span>
        )}
        <span className="battle-potion-count">x{energyPotion?.quantity ?? 0}</span>
      </button>
    </aside>
  );
}

function CombatantCard({
  participant,
  active,
  defeated = false,
  winner = false,
  motionClass = "",
  motionStyle,
  damageCue
}: {
  participant: BattleParticipant;
  active: boolean;
  defeated?: boolean;
  winner?: boolean;
  motionClass?: string;
  motionStyle?: React.CSSProperties;
  damageCue?: BattleAnimationCue | null;
}) {
  const hpPercent = Math.max(0, Math.round((participant.hp / participant.maxHp) * 100));
  const classes = [
    "combatant",
    active ? "active" : "",
    defeated ? "defeated" : "",
    winner ? "winner" : "",
    motionClass
  ].filter(Boolean).join(" ");

  return (
    <article className={classes} style={motionStyle}>
      {damageCue && (
        <span key={damageCue.sequence} className={damageCue.critical ? "damage-float critical" : "damage-float"}>
          -{damageCue.damage}
          {damageCue.critical && <b>CRIT</b>}
        </span>
      )}
      {defeated && (
        <span className="defeated-badge">
          <Skull size={18} /> Derrotado
        </span>
      )}
      {winner && (
        <span className="victory-stars" aria-hidden="true">
          <Star size={13} />
          <Star size={10} />
          <Star size={12} />
        </span>
      )}
      <ParticipantVisual participant={participant} className="combatant-art" />
      <div>
        {participant.ownerPlayerId ? (
          <strong><PlayerName className="player-name" playerId={participant.ownerPlayerId} name={participant.name} /></strong>
        ) : (
          <strong>{participant.name}</strong>
        )}
        <span style={{ marginLeft: "4px" }}>Nv {participant.level}</span>
      </div>
      <div className="hp-bar">
        <span style={{ width: `${hpPercent}%` }} />
      </div>
      <small>
        <Heart size={12} style={{ marginRight: "4px", color: "var(--red)" }} /> {participant.hp}/{participant.maxHp}
      </small>
      <div className="combat-stat-row">
        <span title="Força"><Swords size={13} style={{ color: "var(--purple)" }} /> {participant.strength}</span>
        <span title="Defesa"><Shield size={13} style={{ color: "var(--cyan)" }} /> {participant.defense}</span>
        <span title="Agilidade"><Crosshair size={13} style={{ color: "var(--gold)" }} /> {participant.agility}</span>
      </div>
    </article>
  );
}

function parseBattleAnimationCue(text: string, participants: BattleParticipant[]): Omit<BattleAnimationCue, "sequence"> | null {
  const damageMatch = text.match(/^(.+) causou (\d+) de dano em (.+?)( com acerto .*)?\.$/i);
  if (damageMatch) {
    const attacker = participants.find((participant) => participant.name === damageMatch[1]);
    const defender = participants.find((participant) => participant.name === damageMatch[3]);
    if (attacker && defender) {
      return {
        kind: "damage",
        attackerId: attacker.id,
        defenderId: defender.id,
        damage: Number(damageMatch[2]),
        critical: Boolean(damageMatch[4])
      };
    }
  }

  const dodgeMatch = text.match(/^(.+) esquivou do ataque de (.+)\.$/i);
  if (dodgeMatch) {
    const defender = participants.find((participant) => participant.name === dodgeMatch[1]);
    const attacker = participants.find((participant) => participant.name === dodgeMatch[2]);
    if (attacker && defender) {
      return {
        kind: "dodge",
        attackerId: attacker.id,
        defenderId: defender.id
      };
    }
  }

  return null;
}

function parseBattleHpChange(text: string, participants: BattleParticipant[]): BattleHpChange | null {
  const healMatch = text.match(/^(.+) usou .+ e recuperou (\d+) de vida\.$/i);
  if (!healMatch) {
    return null;
  }

  const participant = participants.find((entry) => entry.name === healMatch[1]);
  if (!participant) {
    return null;
  }

  return {
    participantId: participant.id,
    delta: Number(healMatch[2])
  };
}

function getBattleLogKind(text: string) {
  const lower = text.toLowerCase();
  const plain = lower.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (plain.includes("inventario cheio") && (plain.includes("descart") || plain.includes("caiu no chao"))) return "discard";
  if (lower.includes("causou")) return plain.includes("critico") ? "critical" : "damage";
  if (lower.includes("esquivou")) return "dodge";
  if (lower.includes("energia") && (lower.includes("usou") || lower.includes("recuperou"))) return "energy";
  if (lower.includes("usou") || lower.includes("recuperou")) return "heal";
  if (lower.includes("venceu")) return "victory";
  if (lower.includes("fugiu")) return "flee";
  if (lower.includes("recebeu") || lower.includes("xp") || lower.includes("ouro")) return "reward";
  if (lower.includes("encontrou") || lower.includes("caiu")) return "loot";
  return "event";
}

function normalizeBattleLogName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getBattleLogDropItem(text: string, itemCatalog: Record<string, ItemDefinition>) {
  const findByName = (name: string) => {
    const normalizedName = normalizeBattleLogName(name);
    return Object.values(itemCatalog).find((item) => normalizeBattleLogName(item.name) === normalizedName) ?? null;
  };

  const foundMatch = text.match(/encontrou (.+)\.$/i);
  if (foundMatch?.[1]) {
    const foundItem = findByName(foundMatch[1]);
    if (foundItem) {
      return foundItem;
    }
  }

  const droppedMatch = text.match(/^(.+?) caiu no ch[aã]o\./i);
  if (droppedMatch?.[1]) {
    const droppedItem = findByName(droppedMatch[1]);
    if (droppedItem) {
      return droppedItem;
    }
  }

  return null;
}

function getBattleLogIcon(text: string, itemCatalog: Record<string, ItemDefinition>) {
  const kind = getBattleLogKind(text);
  if (kind === "discard") return <X size={15} />;
  if (kind === "critical") return <Flame size={15} />;
  if (kind === "damage") return <Swords size={15} />;
  if (kind === "dodge") return <Crosshair size={15} />;
  if (kind === "energy") return <Zap size={15} />;
  if (kind === "heal") return <Heart size={15} />;
  if (kind === "victory") return <Trophy size={15} />;
  if (kind === "flee") return <ArrowLeftRight size={15} />;
  if (kind === "reward") return <Coins size={15} />;
  if (kind === "loot") {
    const dropItem = getBattleLogDropItem(text, itemCatalog);
    if (dropItem) {
      return <ItemVisual item={dropItem} className="battle-log-item-icon" />;
    }
    return <Sparkles size={15} />;
  }
  return <Shield size={15} />;
}

function renderTextWithPlayerLinks(text: string, participants: BattleParticipant[]) {
  const players = participants
    .filter((participant) => participant.ownerPlayerId)
    .map((participant) => ({ playerId: participant.ownerPlayerId!, name: participant.name }))
    .sort((left, right) => right.name.length - left.name.length);
  if (players.length === 0) {
    return text;
  }

  const fragments: Array<string | JSX.Element> = [];
  let cursor = 0;
  while (cursor < text.length) {
    let next: { playerId: string; name: string; index: number } | null = null;
    for (const player of players) {
      const index = text.indexOf(player.name, cursor);
      if (index === -1) continue;
      if (!next || index < next.index) {
        next = { ...player, index };
      }
    }
    if (!next) {
      fragments.push(text.slice(cursor));
      break;
    }
    if (next.index > cursor) {
      fragments.push(text.slice(cursor, next.index));
    }
    fragments.push(<PlayerName key={`${next.playerId}-${next.index}`} playerId={next.playerId} name={next.name} />);
    cursor = next.index + next.name.length;
  }
  return fragments;
}

function normalizeChatSubject(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function getSystemChatTone(chat: ChatMessage) {
  const subject = normalizeChatSubject(`${chat.author} ${chat.text}`);
  if (subject.includes("rei lich")) {
    return { kind: "monarch-king", label: "Rei Lich", icon: <Crown size={15} /> };
  }
  if (subject.includes("morthaly") || subject.includes("monarca") || subject.includes("alvorada") || subject.includes("derrotado")) {
    return { kind: "monarch", label: "Monarca", icon: <Skull size={15} /> };
  }
  if (subject.includes("subiu para") || subject.includes("nivel") || subject.includes("talento") || subject.includes("atributo")) {
    return { kind: "level", label: "Evolução", icon: <Star size={15} /> };
  }
  if (subject.includes("recompensa") || subject.includes("ouro") || subject.includes("diamante") || subject.includes("xp")) {
    return { kind: "reward", label: "Recompensa", icon: <Coins size={15} /> };
  }
  if (subject.includes("arena") || subject.includes("duelo") || subject.includes("ranqueada")) {
    return { kind: "arena", label: "Arena", icon: <Swords size={15} /> };
  }
  if (subject.includes("trabalho") || subject.includes("servico") || subject.includes("agencia") || subject.includes("aptidao")) {
    return { kind: "work", label: "Trabalho", icon: <BriefcaseBusiness size={15} /> };
  }
  if (subject.includes("mercado") || subject.includes("oferta") || subject.includes("compra") || subject.includes("venda")) {
    return { kind: "market", label: "Mercado", icon: <ShoppingBag size={15} /> };
  }
  if (subject.includes("evento") || subject.includes("boas vindas")) {
    return { kind: "event", label: "Evento", icon: <Sparkles size={15} /> };
  }
  if (subject.includes("viagem") || subject.includes("porto") || subject.includes("ticket") || subject.includes("cidade")) {
    return { kind: "travel", label: "Viagem", icon: <MapPinned size={15} /> };
  }
  if (subject.includes("cla")) {
    return { kind: "clan", label: "Clã", icon: <Shield size={15} /> };
  }
  return { kind: "system", label: "Sistema", icon: <ScrollText size={15} /> };
}

function GlobalChatMessage({ chat }: { chat: ChatMessage }) {
  if (chat.playerId !== "system") {
    return (
      <article className="chat-message" key={chat.id}>
        <strong><PlayerName playerId={chat.playerId} name={chat.author} /></strong>
        <span>{chat.text}</span>
      </article>
    );
  }

  const tone = getSystemChatTone(chat);
  return (
    <article className={`chat-message system-chat-message ${tone.kind}`} key={chat.id}>
      <span className="system-chat-icon" aria-hidden="true">{tone.icon}</span>
      <strong className="system-chat-heading">
        <span>{chat.author}</span>
        <small>{tone.label}</small>
      </strong>
      <span className="system-chat-text">{chat.text}</span>
    </article>
  );
}

function FloatingChat({
  game,
  open,
  setOpen,
  privateTarget,
  setPrivateTarget
}: {
  game: GameState;
  open: boolean;
  setOpen: (open: boolean) => void;
  privateTarget: PlayerReference | null;
  setPrivateTarget: (player: PlayerReference | null) => void;
}) {
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<"global" | "clan" | "private">("global");
  const [mentionIndex, setMentionIndex] = useState(0);
  const feedRef = useRef<HTMLDivElement>(null);
  const playerActions = usePlayerActions();

  const hasClan = Boolean(game.clan);

  const sendGlobal = (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim()) return;
    socket.emit("chat:send", message);
    setMessage("");
  };

  const sendClan = (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim()) return;
    socket.emit("clan:chat:send", { text: message });
    setMessage("");
  };

  const privateContacts = useMemo(() => {
    const byId = new Map<string, PlayerReference>();
    for (const player of game.playerDirectory) {
      if (!player.playerId || player.playerId === game.player.id) {
        continue;
      }
      byId.set(player.playerId, player);
    }
    for (const msg of game.privateMessages) {
      if (msg.fromPlayerId !== game.player.id) {
        byId.set(msg.fromPlayerId, { playerId: msg.fromPlayerId, name: msg.fromName });
      }
      if (msg.toPlayerId !== game.player.id) {
        byId.set(msg.toPlayerId, { playerId: msg.toPlayerId, name: msg.toName });
      }
    }
    return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [game.playerDirectory, game.privateMessages, game.player.id]);

  const mentionMatch = tab === "private" ? message.match(/(?:^|\s)@([^\s@]*)$/) : null;
  const mentionQuery = mentionMatch?.[1] ?? "";
  const mentionSuggestions = mentionMatch
    ? privateContacts
        .filter((player) => player.name.toLowerCase().includes(mentionQuery.toLowerCase()))
        .slice(0, 8)
    : [];

  useEffect(() => {
    setMentionIndex(0);
  }, [mentionQuery, tab]);

  const applyMentionSuggestion = (player: PlayerReference) => {
    setMessage((current) => current.replace(/(?:^|\s)@([^\s@]*)$/, (full) => `${full.startsWith(" ") ? " " : ""}@${player.name} `));
    setPrivateTarget(player);
  };

  const extractMentionTarget = (text: string): PlayerReference | null => {
    const matches = Array.from(text.matchAll(/(?:^|\s)@([^\s@]+)/g));
    for (let index = matches.length - 1; index >= 0; index -= 1) {
      const mentionName = matches[index]?.[1]?.toLowerCase();
      if (!mentionName) {
        continue;
      }
      const player = privateContacts.find((entry) => entry.name.toLowerCase() === mentionName);
      if (player) {
        return player;
      }
    }
    return null;
  };

  const sendPrivate = (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim()) return;
    const mentionTarget = extractMentionTarget(message);
    const target = mentionTarget ?? privateTarget;
    if (!target) return;
    socket.emit("private:send", { targetPlayerId: target.playerId, targetPlayerName: target.name, text: message });
    if (!privateTarget || privateTarget.playerId !== target.playerId) {
      setPrivateTarget(target);
    }
    setMessage("");
  };

  const handlePrivateInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (mentionSuggestions.length === 0) {
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setMentionIndex((current) => (current + 1) % mentionSuggestions.length);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setMentionIndex((current) => (current - 1 + mentionSuggestions.length) % mentionSuggestions.length);
      return;
    }
    if (event.key === "Tab" || event.key === "Enter") {
      event.preventDefault();
      applyMentionSuggestion(mentionSuggestions[mentionIndex] ?? mentionSuggestions[0]);
    }
  };

  const privateConversation: PrivateMessage[] = privateTarget
    ? game.privateMessages.filter(
        (msg) =>
          (msg.fromPlayerId === privateTarget.playerId && msg.toPlayerId === game.player.id) ||
          (msg.toPlayerId === privateTarget.playerId && msg.fromPlayerId === game.player.id)
      )
    : [];

  const unreadPrivate = game.privateMessages.filter((msg) => msg.toPlayerId === game.player.id).length;

  useEffect(() => {
    if (privateTarget) {
      setTab("private");
    }
  }, [privateTarget?.playerId]);

  const chatContent = (
    <div className={`floating-chat-layer country-${game.currentCountry.id}${open ? " open" : ""}`}>
      <button className="floating-chat-button" title="Chat" onClick={() => setOpen(!open)}>
        <MessageCircle size={22} />
        {!open && unreadPrivate > 0 && <span>{Math.min(99, unreadPrivate)}</span>}
      </button>
      {open && (
        <aside className="side-panel chat-panel floating-chat-panel">
          <div className="chat-tabs">
            <button className={tab === "global" ? "chat-tab active" : "chat-tab"} onClick={() => setTab("global")}>
              Global
            </button>
            {hasClan && (
              <button className={tab === "clan" ? "chat-tab active" : "chat-tab"} onClick={() => setTab("clan")}>
                <Users size={13} /> Clã
              </button>
            )}
            <button
              className={tab === "private" ? "chat-tab active" : "chat-tab"}
              onClick={() => setTab("private")}
            >
              <Lock size={13} /> Privado
              {unreadPrivate > 0 && <span className="tab-badge">{Math.min(99, unreadPrivate)}</span>}
            </button>
          </div>

          {tab === "global" && (
            <>
              <div className="chat-feed" ref={feedRef}>
                {game.chatMessages.length === 0 && <p className="empty-state">Chat vazio.</p>}
                {game.chatMessages.map((chat) => <GlobalChatMessage chat={chat} key={chat.id} />)}
              </div>
              <form className="chat-form" onSubmit={sendGlobal}>
                <input value={message} onChange={(e) => setMessage(e.target.value)} maxLength={240} placeholder="Mensagem global" />
                <button className="icon-submit" title="Enviar"><Send size={16} /></button>
              </form>
            </>
          )}

          {tab === "clan" && hasClan && (
            <>
              <div className="chat-feed">
                {game.clanChatMessages.length === 0 && <p className="empty-state">Chat do clã vazio.</p>}
                {game.clanChatMessages.map((chat) => (
                  <article className="chat-message" key={chat.id}>
                    <strong><PlayerName playerId={chat.playerId} name={chat.author} /></strong>
                    <span>{chat.text}</span>
                  </article>
                ))}
              </div>
              <form className="chat-form" onSubmit={sendClan}>
                <input value={message} onChange={(e) => setMessage(e.target.value)} maxLength={240} placeholder="Mensagem do clã" />
                <button className="icon-submit" title="Enviar"><Send size={16} /></button>
              </form>
            </>
          )}

          {tab === "private" && (
            <>
              {!privateTarget ? (
                <div className="private-chat-home">
                  <p className="private-chat-help">Digite <strong>@nome</strong> para escolher o destinatário. O chat sugere nomes conforme você escreve.</p>
                  {game.privateMessages.length > 0 && (
                    <>
                      <p className="muted" style={{ margin: "8px 0", fontSize: "0.85rem" }}>Mensagens recentes:</p>
                      <div className="chat-feed" style={{ maxHeight: 180 }}>
                        {game.privateMessages.slice(0, 10).map((msg) => {
                          const isFrom = msg.fromPlayerId === game.player.id;
                          return (
                            <article className="chat-message private-message" key={msg.id}>
                              <strong
                                className="player-name-inline"
                                style={{ color: isFrom ? "var(--cyan)" : "var(--pink)" }}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  const target = isFrom
                                    ? { playerId: msg.toPlayerId, name: msg.toName }
                                    : { playerId: msg.fromPlayerId, name: msg.fromName };
                                  playerActions?.openPlayerActions(target);
                                }}
                              >
                                {isFrom ? (
                                  <>Você → <PlayerName playerId={msg.toPlayerId} name={msg.toName} /></>
                                ) : (
                                  <><PlayerName playerId={msg.fromPlayerId} name={msg.fromName} /> → Você</>
                                )}
                              </strong>
                              <span>{msg.text}</span>
                            </article>
                          );
                        })}
                      </div>
                    </>
                  )}
                  <form className="chat-form private-chat-form" onSubmit={sendPrivate}>
                    {mentionSuggestions.length > 0 && (
                      <div className="private-mention-list" role="listbox" aria-label="Sugestões de jogador">
                        {mentionSuggestions.map((player, index) => (
                          <button
                            key={player.playerId}
                            type="button"
                            className={index === mentionIndex ? "mention-suggestion active" : "mention-suggestion"}
                            onClick={() => applyMentionSuggestion(player)}
                          >
                            <User size={13} /> {player.name}
                          </button>
                        ))}
                      </div>
                    )}
                    <input
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      onKeyDown={handlePrivateInputKeyDown}
                      maxLength={240}
                      placeholder="Mensagem privada (ex.: @Arthen vamos duelar?)"
                    />
                    <button className="icon-submit" title="Enviar"><Send size={16} /></button>
                  </form>
                </div>
              ) : (
                <>
                  <div className="private-chat-header">
                    <button className="ghost-button" style={{ padding: "4px 8px", fontSize: "0.82rem" }} onClick={() => setPrivateTarget(null)}>
                      ← Voltar
                    </button>
                    <strong><PlayerName playerId={privateTarget.playerId} name={privateTarget.name} /></strong>
                  </div>
                  <div className="chat-feed">
                    {privateConversation.length === 0 && <p className="empty-state">Nenhuma mensagem ainda.</p>}
                    {privateConversation.map((msg) => {
                      const isFrom = msg.fromPlayerId === game.player.id;
                      return (
                        <article className={`chat-message private-message ${isFrom ? "sent" : "received"}`} key={msg.id}>
                          <strong
                            className={!isFrom ? "player-name-inline" : undefined}
                            style={{ color: isFrom ? "var(--cyan)" : "var(--pink)" }}
                            onClick={(event) => {
                              if (isFrom) return;
                              event.stopPropagation();
                              playerActions?.openPlayerActions({ playerId: msg.fromPlayerId, name: msg.fromName });
                            }}
                          >
                            {isFrom ? "Você" : <PlayerName playerId={msg.fromPlayerId} name={msg.fromName} />}
                          </strong>
                          <span>{msg.text}</span>
                        </article>
                      );
                    })}
                  </div>
                  <form className="chat-form private-chat-form" onSubmit={sendPrivate}>
                    {mentionSuggestions.length > 0 && (
                      <div className="private-mention-list" role="listbox" aria-label="Sugestões de jogador">
                        {mentionSuggestions.map((player, index) => (
                          <button
                            key={player.playerId}
                            type="button"
                            className={index === mentionIndex ? "mention-suggestion active" : "mention-suggestion"}
                            onClick={() => applyMentionSuggestion(player)}
                          >
                            <User size={13} /> {player.name}
                          </button>
                        ))}
                      </div>
                    )}
                    <input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handlePrivateInputKeyDown}
                      maxLength={240}
                      placeholder={`Mensagem para ${privateTarget.name} (use @ para trocar destinatário)`}
                    />
                    <button className="icon-submit" title="Enviar"><Send size={16} /></button>
                  </form>
                </>
              )}
            </>
          )}
        </aside>
      )}
    </div>
  );

  return typeof document === "undefined" ? chatContent : createPortal(chatContent, document.body);
}

function CurrencyExchangeModal({ game, onClose }: { game: GameState; onClose: () => void }) {
  const [dToGAmount, setDToGAmount] = useState(1);
  const [gToDAmount, setGToDAmount] = useState(1);

  const doExchange = (direction: "diamondsToGold" | "goldToDiamonds", amount: number) => {
    socket.emit("currency:exchange", { direction, amount });
  };

  return (
    <div className="drawer-backdrop" role="presentation" onClick={onClose}>
      <div className="exchange-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="exchange-header">
          <ArrowLeftRight size={20} />
          <h2>Trocar Moedas</h2>
          <button className="close-button" style={{ position: "static" }} onClick={onClose}><X size={18} /></button>
        </div>
        <div className="exchange-body">
          <section className="exchange-row">
            <div>
              <strong><Gem size={18} style={{ color: "var(--cyan)" }} /> → <Coins size={18} style={{ color: "var(--gold)" }} /></strong>
              <small>1 <Gem size={18} style={{ color: "var(--cyan)" }} /> = 1.000 <Coins size={18} style={{ color: "var(--gold)" }} /></small>
            </div>
            <div className="exchange-controls">
              <input
                type="number" min={1} max={game.character.diamonds}
                value={dToGAmount}
                onChange={(e) => setDToGAmount(Math.max(1, Number(e.target.value)))}
              />
              <span className="exchange-arrow">=</span>
              <strong className="exchange-result">{(dToGAmount * 1000).toLocaleString()} <Coins size={18} style={{ color: "var(--gold)" }} /></strong>
              <button
                className="primary-button"
                disabled={game.character.diamonds < dToGAmount}
                onClick={() => doExchange("diamondsToGold", dToGAmount)}
              >
                Trocar
              </button>
            </div>
            <small className="muted">Saldo: {game.character.diamonds} <Gem size={12} style={{ color: "var(--cyan)" }} /></small>
          </section>

          <hr className="exchange-divider" />

          <section className="exchange-row">
            <div>
              <strong><Coins size={18} style={{ color: "var(--gold)" }} /> → <Gem size={18} style={{ color: "var(--cyan)" }} /></strong>
              <small>1.200 <Coins size={18} style={{ color: "var(--gold)" }} /> = 1 <Gem size={18} style={{ color: "var(--cyan)" }} /></small>
            </div>
            <div className="exchange-controls">
              <strong className="exchange-result">{(gToDAmount * 1200).toLocaleString()} <Coins size={18} style={{ color: "var(--gold)" }} /></strong>
              <span className="exchange-arrow">=</span>
              <input
                type="number" min={1}
                value={gToDAmount}
                onChange={(e) => setGToDAmount(Math.max(1, Number(e.target.value)))}
              />
              <button
                className="primary-button"
                disabled={game.character.gold < gToDAmount * 1200}
                onClick={() => doExchange("goldToDiamonds", gToDAmount)}
              >
                Trocar
              </button>
            </div>
            <small className="muted">Saldo: {game.character.gold.toLocaleString()} ouro</small>
          </section>
        </div>
      </div>
    </div>
  );
}

const ASSET_URL_ALIASES: Record<string, string> = {
  "/assets/items/misc/train-ticket.png": "/assets/items/misc/train_ticket.png",
  "/assets/items/misc/train_ticket.png": "/assets/items/misc/train-ticket.png",
  "/assets/items/misc/ship-ticket.png": "/assets/items/misc/ship_ticket.png",
  "/assets/items/misc/ship_ticket.png": "/assets/items/misc/ship-ticket.png"
};

function getAssetUrlAlias(src: string) {
  const normalized = normalizeAssetUrl(src);
  const normalizedPath = normalized.startsWith("http://") || normalized.startsWith("https://")
    ? new URL(normalized).pathname
    : normalized.startsWith("/")
      ? normalized
      : `/${normalized}`;
  const alias = ASSET_URL_ALIASES[normalizedPath];
  if (!alias) return null;
  return alias;
}

function normalizeAssetUrl(src: string) {
  const trimmed = src.trim();
  if (!trimmed) return "";

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      if ((url.hostname === "127.0.0.1" || url.hostname === "localhost") && typeof window !== "undefined") {
        return `${window.location.origin}${url.pathname}${url.search}${url.hash}`;
      }
      return trimmed;
    } catch {
      return trimmed;
    }
  }

  if (trimmed.startsWith("//")) {
    return typeof window !== "undefined" ? `${window.location.protocol}${trimmed}` : `https:${trimmed}`;
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function AssetImage({ src, alt, fallback, style }: { src?: string; alt: string; fallback: React.ReactNode; style?: React.CSSProperties }) {
  const normalizedSrc = src ? normalizeAssetUrl(src) : "";
  const [activeSrc, setActiveSrc] = useState(normalizedSrc);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setActiveSrc(normalizedSrc);
    setFailed(false);
  }, [normalizedSrc]);

  if (!normalizedSrc || !activeSrc || failed) {
    return <span className="asset-fallback" aria-hidden="true" style={style}>{fallback}</span>;
  }

  return (
    <img
      key={activeSrc}
      style={style}
      src={activeSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => {
        const alias = getAssetUrlAlias(activeSrc);
        if (alias && alias !== activeSrc && alias !== normalizedSrc) {
          setActiveSrc(alias);
          return;
        }
        setFailed(true);
      }}
    />
  );
}

function ItemVisual({
  item,
  className,
  quantity,
  enhancementLevel,
  rarity
}: {
  item: ItemDefinition;
  className?: string;
  quantity?: number;
  enhancementLevel?: number;
  rarity?: Rarity;
}) {
  const rarityColor = getEquipmentRarityColor(item, rarity);
  const enhancement = item.slot ? Math.max(0, enhancementLevel ?? 0) : 0;
  const enhancementClasses = [
    enhancement >= 4 ? "enhance-tier-4" : "",
    enhancement >= 7 ? "enhance-tier-7" : "",
    enhancement >= 10 ? "enhance-tier-10" : "",
    enhancement >= 13 ? "enhance-tier-13" : ""
  ].filter(Boolean).join(" ");
  const visualStyle = rarityColor
    ? ({ borderColor: rarityColor, "--rarity-color": rarityColor } as React.CSSProperties)
    : undefined;

  return (
    <span className={`asset-frame item-visual ${className ?? ""} ${enhancementClasses}`} style={visualStyle}>
      <AssetImage src={item.imageUrl} alt={item.name} fallback={ITEM_KIND_EMOJI[item.kind] ?? "?"} />
      {enhancement >= 10 && <span className="item-visual-light-sweep" aria-hidden="true" />}
      {enhancement > 0 && <span className="asset-enhancement">+{enhancement}</span>}
      {quantity !== undefined && quantity > 1 && <span className="asset-qty">x{quantity}</span>}
    </span>
  );
}

function MonsterVisual({
  monster,
  className
}: {
  monster: GameState["cityMonsters"][number];
  className?: string;
}) {
  return (
    <span className={`asset-frame monster-visual ${className ?? ""}`}>
      <AssetImage src={monster.imageUrl} alt={monster.name} fallback={monster.name.slice(0, 1)} />
    </span>
  );
}

function ParticipantVisual({ participant, className }: { participant: BattleParticipant; className?: string }) {
  return (
    <span className={`asset-frame participant-visual ${className ?? ""}`}>
      <AssetImage
        src={participant.imageUrl}
        alt={participant.name}
        fallback={participant.kind === "player" ? <User size={28} /> : participant.name.slice(0, 1)}
      />
    </span>
  );
}

function ShopItemCard({ item, onClick, goldCoinMode }: { item: ItemDefinition; onClick: () => void; goldCoinMode?: boolean }) {
  return (
    <button className="shop-item-card" type="button" onClick={onClick} title={item.name}>
      <ItemVisual item={item} className="shop-card-image" />
      <strong>{item.name}</strong>
      <span className="shop-card-price">
        {goldCoinMode
          ? <>{item.goldCoinPrice ?? "?"} <Coins size={13} style={{ color: "#f1fa8c" }} /></>
          : <>{formatCurrency(item.price)} <Coins size={13} style={{ color: "var(--gold)" }} /></>}
      </span>
    </button>
  );
}

function ShopItemModal({
  game,
  item,
  onClose,
  onBuy,
  goldCoinMode
}: {
  game: GameState;
  item: ItemDefinition;
  onClose: () => void;
  onBuy: (quantity: number) => void;
  goldCoinMode?: boolean;
}) {
  const [quantity, setQuantity] = useState(1);
  const rarityColor = getEquipmentRarityColor(item);
  const canChooseQuantity = !item.slot;
  const purchaseQuantity = canChooseQuantity ? Math.max(1, Math.min(999, Math.floor(quantity || 1))) : 1;
  const totalPrice = goldCoinMode ? (item.goldCoinPrice ?? 0) * purchaseQuantity : item.price * purchaseQuantity;
  const playerGoldCoins = goldCoinMode ? countInventoryItem(game, "material_gold_coin") : 0;
  const blockedReason = goldCoinMode
    ? (playerGoldCoins < totalPrice ? "Moedas insuficientes" : !canReceiveShopItem(game, item) ? "Inventário cheio" : null)
    : getNpcShopBlockedReason(game, item, purchaseQuantity);

  useEffect(() => {
    setQuantity(1);
  }, [item.id]);

  return (
    <div className="drawer-backdrop" role="presentation" onClick={onClose}>
      <div className="market-modal shop-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()} style={rarityColor ? { borderColor: rarityColor } : undefined}>
        <button className="close-button" title="Fechar" onClick={onClose}>
          <X size={20} />
        </button>
        <ItemVisual item={item} className="market-modal-icon" />
        <div className="market-modal-content">
          <h2>{item.name}</h2>
          <small className="market-modal-type">{ITEM_KIND_LABELS[item.kind]}</small>
          {item.rarity && (
            <div className={`item-rarity ${item.rarity}`}>
              {RARITY_LABELS[item.rarity]}
            </div>
          )}
          <p className="market-modal-desc">{item.description}</p>

          {item.slot && (
            <div className="market-modal-stats">
              <h4>Bônus</h4>
              <div className="stat-list">
                {item.stats.strength && <div><span>Força</span> <strong>+{item.stats.strength}</strong></div>}
                {item.stats.constitution && <div><span>Constituição</span> <strong>+{item.stats.constitution}</strong></div>}
                {item.stats.agility && <div><span>Agilidade</span> <strong>+{item.stats.agility}</strong></div>}
                {item.stats.defense && <div><span>Defesa</span> <strong>+{item.stats.defense}</strong></div>}
              </div>
            </div>
          )}

          {item.stats.healPercent && (
            <div className="market-modal-stats">
              <h4>Efeito</h4>
              <p>Restaura {item.stats.healPercent * 100}% da vida ao usar</p>
            </div>
          )}

          {item.stats.energyPercent && (
            <div className="market-modal-stats">
              <h4>Efeito</h4>
              <p>Restaura {item.stats.energyPercent * 100}% da energia ao usar</p>
            </div>
          )}

          {item.slot && item.minLevel > 1 && (
            <div className={item.minLevel > game.character.level ? "market-modal-requirement unmet" : "market-modal-requirement"}>
              Nível mínimo: {item.minLevel} {item.minLevel > game.character.level && "(não alcançado)"}
            </div>
          )}

          {canChooseQuantity && (
            <div className="shop-quantity-control">
              <span>Quantidade</span>
              <div>
                <button type="button" className="icon-button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={quantity}
                  onChange={(event) => setQuantity(Math.max(1, Math.min(999, Number(event.target.value) || 1)))}
                  aria-label="Quantidade"
                />
                <button type="button" className="icon-button" onClick={() => setQuantity((value) => Math.min(999, value + 1))}>
                  +
                </button>
              </div>
            </div>
          )}

          <div className="market-modal-footer">
            <div className="market-modal-price">
              <strong>{canChooseQuantity ? "Total:" : "Valor:"}</strong>
              <b className="price-amount">
                {goldCoinMode
                  ? <>{totalPrice} <Coins size={16} style={{ color: "#f1fa8c" }} /></>
                  : <>{formatCurrency(totalPrice)} <Coins size={16} style={{ color: "var(--gold)" }} /></>}
              </b>
            </div>
            <button className="primary-button" disabled={Boolean(blockedReason)} onClick={() => onBuy(purchaseQuantity)}>
              {blockedReason ?? "Comprar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PanelTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="panel-title">
      {icon}
      <h2>{title}</h2>
    </div>
  );
}

function StatPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <span className="stat-pill">
      {icon}
      <small>{label}</small>
      <strong>{value}</strong>
    </span>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <span className="metric">
      {icon}
      <small>{label}</small>
      <strong>{Number.isFinite(value) ? formatCurrency(Number(value)) : value}</strong>
    </span>
  );
}

function IconButton({
  children,
  label,
  onClick
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button className="icon-button" title={label} aria-label={label} onClick={onClick}>
      {children}
    </button>
  );
}

function RecoveryCodeModal({ code, onClose }: { code: string; onClose: () => void }) {
  return (
    <div className="drawer-backdrop" role="presentation" onClick={onClose}>
      <div className="recovery-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <button className="close-button" title="Fechar" onClick={onClose}>
          <X size={20} />
        </button>
        <KeyRound size={28} />
        <h2>Código de recuperação</h2>
        <p>Guarde este código para redefinir sua senha depois.</p>
        <code>{code}</code>
        <button className="primary-button" onClick={onClose}>Entendi</button>
      </div>
    </div>
  );
}

function Toast({ message, kind = "error" }: { message: string; kind?: "error" | "success" }) {
  return <div className={kind === "success" ? "toast success" : "toast"}>{message}</div>;
}

function isItemEquipped(game: GameState, instanceId: string) {
  return Object.values(game.character.equipment).includes(instanceId);
}

function getBattleMonsterId(battle: NonNullable<GameState["activeBattle"]>) {
  const monster = battle.participants.find((participant) => participant.kind === "monster");
  return monster?.id.replace("monster:", "") ?? null;
}

function countInventoryItem(game: GameState, itemId: string) {
  return game.character.inventory
    .filter((item) => item.itemId === itemId)
    .reduce((total, item) => total + item.quantity, 0);
}

function renderWorkReward(game: GameState, reward: WorkReward): React.ReactNode[] {
  const entries: React.ReactNode[] = [];
  if (reward.experience) entries.push(<span className="work-reward-chip" key="xp"><Star size={13} style={{ color: "var(--purple)"}} /> {formatCurrency(reward.experience)} XP</span>);
  if (reward.gold) entries.push(<span className="work-reward-chip" key="gold"><Coins size={13} style={{ color: "var(--gold)"}} /> {formatCurrency(reward.gold)} gold</span>);
  if (reward.diamonds) entries.push(<span className="work-reward-chip" key="diamonds"><Gem size={13} style={{ color: "var(--cyan)"}} /> {formatCurrency(reward.diamonds)} diamantes</span>);
  if (reward.attributePoints) entries.push(<span className="work-reward-chip" key="attributes"><Sparkles size={13} style={{ color: "var(--green)"}} /> {reward.attributePoints} ponto atributo</span>);
  for (const item of reward.items ?? []) {
    const definition = game.itemCatalog[item.itemId];
    entries.push(
      <span className="work-reward-chip work-reward-item" key={item.itemId}>
        {definition ? (
          <ItemVisual item={definition} className="work-reward-item-visual" />
        ) : (
          <Backpack size={13} />
        )}
        <span className="work-reward-text">{definition?.name ?? item.itemId} x{item.quantity}</span>
      </span>
    );
  }
  return entries.length > 0 ? entries : [<span className="work-reward-chip" key="none">Sem recompensa direta</span>];
}

function getTimedProgress(startedAt: number, endsAt: number, now: number) {
  const total = Math.max(1, endsAt - startedAt);
  return Math.max(0, Math.min(100, Math.round(((now - startedAt) / total) * 100)));
}

function getWorkAssignmentMinutes(activeWork: NonNullable<GameState["character"]["activeWork"]>) {
  return Math.max(1, Math.round(activeWork.minutes ?? (activeWork.hours ?? 0) * 60));
}

function formatWorkMinutes(minutes: number) {
  const normalized = Math.max(0, Math.round(minutes));
  if (normalized < 60) {
    return `${normalized}m`;
  }
  const hours = Math.floor(normalized / 60);
  const remainingMinutes = normalized % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

function formatAptitudeHours(hours: number) {
  if (hours > 0 && hours < 1) {
    return `${Math.round(hours * 60)}m`;
  }
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)}h`;
}

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function getWorkBonusReadyAt(game: GameState, service: WorkServiceDefinition) {
  const periodicHours = service.bonus.periodicHours ?? 0;
  const lastClaim = game.character.workBonusClaims?.[service.id] ?? 0;
  return lastClaim > 0 ? lastClaim + periodicHours * 60 * 60 * 1000 : 0;
}

function isWorkBonusReady(game: GameState, service: WorkServiceDefinition, now = Date.now()) {
  if (!service.bonus.periodicReward || !service.bonus.periodicHours) {
    return false;
  }
  return now >= getWorkBonusReadyAt(game, service);
}

function getClaimableWorkBonuses(game: GameState, now = Date.now()) {
  return game.workServices.filter((service) => {
    const aptitude = game.character.workAptitudes?.[service.id] ?? getDefaultWorkAptitude();
    return aptitude.level >= service.bonus.level && isWorkBonusReady(game, service, now);
  });
}

function isPotionForQuickSlot(item: ItemDefinition | undefined, slot: QuickPotionSlot): item is ItemDefinition {
  if (!item || item.kind !== "potion") {
    return false;
  }
  if (slot === "health") {
    return item.stats.healPercent !== undefined || item.stats.heal !== undefined;
  }
  return item.stats.energyPercent !== undefined || item.stats.energy !== undefined;
}

function getPotionOptions(game: GameState, slot: QuickPotionSlot): PotionQuickOption[] {
  const optionsByItemId = new Map<string, PotionQuickOption>();
  for (const inventoryItem of game.character.inventory) {
    const definition = game.itemCatalog[inventoryItem.itemId];
    if (!isPotionForQuickSlot(definition, slot)) {
      continue;
    }
    const current = optionsByItemId.get(inventoryItem.itemId);
    if (current) {
      current.quantity += inventoryItem.quantity;
    } else {
      optionsByItemId.set(inventoryItem.itemId, {
        itemId: inventoryItem.itemId,
        definition,
        inventoryItem,
        quantity: inventoryItem.quantity
      });
    }
  }
  return Array.from(optionsByItemId.values());
}

function getQuickPotionOption(game: GameState, preferences: QuickPotionPreferences, slot: QuickPotionSlot) {
  const options = getPotionOptions(game, slot);
  return options.find((option) => option.itemId === preferences[slot]) ?? options[0] ?? null;
}

function getPotionEffectLabel(item: ItemDefinition, slot: QuickPotionSlot) {
  if (slot === "health") {
    if (item.stats.healPercent !== undefined) return `${Math.round(item.stats.healPercent * 100)}%`;
    if (item.stats.heal !== undefined) return `+${item.stats.heal}`;
  }
  if (item.stats.energyPercent !== undefined) return `${Math.round(item.stats.energyPercent * 100)}%`;
  if (item.stats.energy !== undefined) return `+${item.stats.energy}`;
  return "-";
}

function getEnhancementLevel(inventoryItem?: { enhancementLevel?: number } | null) {
  return Math.max(0, inventoryItem?.enhancementLevel ?? 0);
}

function getItemRarity(item: ItemDefinition, inventoryItem?: { enhancementLevel?: number; rarity?: Rarity } | null) {
  return item.slot ? inventoryItem?.rarity ?? item.rarity ?? "common" : item.rarity;
}

function getItemValue(item: ItemDefinition, inventoryItem?: { enhancementLevel?: number; rarity?: Rarity } | null) {
  const rarity = item.slot ? getItemRarity(item, inventoryItem) : item.rarity;
  return Math.max(1, Math.floor(item.price * (rarity ? RARITY_PRICE_MULTIPLIER[rarity] : 1)));
}

function getNpcSellValue(item: ItemDefinition, inventoryItem?: { enhancementLevel?: number; rarity?: Rarity } | null) {
  return Math.max(1, Math.floor(getItemValue(item, inventoryItem) / 2));
}

function formatInventoryItemName(item: ItemDefinition, inventoryItem?: { enhancementLevel?: number; rarity?: Rarity } | null) {
  const enhancement = item.slot ? getEnhancementLevel(inventoryItem) : 0;
  return enhancement > 0 ? `${item.name} +${enhancement}` : item.name;
}

function getEnhancedItemStats(item: ItemDefinition, inventoryItem?: { enhancementLevel?: number; rarity?: Rarity } | null): ItemStats {
  if (!item.slot) {
    return item.stats;
  }

  const enhancement = item.slot ? getEnhancementLevel(inventoryItem) : 0;
  const rarityMultiplier = RARITY_STAT_MULTIPLIER[getItemRarity(item, inventoryItem) ?? "common"];

  return {
    ...item.stats,
    strength: item.stats.strength === undefined ? undefined : Math.ceil((item.stats.strength * rarityMultiplier) * (1 + enhancement * ENHANCEMENT_STAT_STEP)),
    constitution: item.stats.constitution === undefined ? undefined : Math.ceil((item.stats.constitution * rarityMultiplier) * (1 + enhancement * ENHANCEMENT_STAT_STEP)),
    agility: item.stats.agility === undefined ? undefined : Math.ceil((item.stats.agility * rarityMultiplier) * (1 + enhancement * ENHANCEMENT_STAT_STEP)),
    defense: item.stats.defense === undefined ? undefined : Math.ceil((item.stats.defense * rarityMultiplier) * (1 + enhancement * ENHANCEMENT_STAT_STEP))
  };
}

function getEnhancementRequirements(nextLevel: number, creationStones: number) {
  const materialQuantity = getEnhancementMaterialQuantity(nextLevel);
  const requirements: Array<{ itemId: string; quantity: number }> = [
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

function getEnhancementPlanForUi(game: GameState, inventoryItem: InventoryItem, requestedCreationStones: number) {
  const nextLevel = getEnhancementLevel(inventoryItem) + 1;
  const baseChance = getEnhancementBaseChance(nextLevel);
  const maxUsefulCreationStones = Math.max(0, Math.ceil((100 - baseChance) / ENHANCEMENT_CREATION_STONE_BONUS));
  const maxCreationStones = Math.min(countInventoryItem(game, ENHANCEMENT_ITEMS.creationStone), maxUsefulCreationStones);
  const creationStones = Math.max(0, Math.min(maxCreationStones, Math.floor(requestedCreationStones || 0)));
  const successChance = Math.min(100, baseChance + creationStones * ENHANCEMENT_CREATION_STONE_BONUS);
  const rangeLabel = describeEnhancementLevelRange(game.currentCountry.id);
  const allowed = canEnhanceLevelInCountry(game.currentCountry.id, nextLevel);

  return {
    nextLevel,
    goldCost: nextLevel * ENHANCEMENT_GOLD_STEP,
    baseChance,
    creationStones,
    maxCreationStones,
    successChance,
    allowed,
    rangeLabel,
    blockReason: allowed ? "" : `Este ferreiro aprimora apenas equipamentos de ${rangeLabel}.`,
    requirements: getEnhancementRequirements(nextLevel, creationStones)
  };
}

function countClaimable(quests: QuestView[]) {
  return quests.filter((quest) => quest.completed && !quest.claimed).length;
}

function isAutoPveActive(game: GameState) {
  return (game.character.pveAutoUntil ?? 0) > Date.now();
}

function isRoyalSealActive(game: GameState) {
  return (game.character.royalSealUntil ?? 0) > Date.now();
}

function canReceiveShopItem(game: GameState, item: ItemDefinition) {
  if (item.slot) {
    return game.inventoryUsed < game.inventoryCapacity;
  }
  const existingStack = game.character.inventory.some((inventoryItem) => inventoryItem.itemId === item.id);
  return existingStack || game.inventoryUsed < game.inventoryCapacity;
}

function getNpcShopBlockedReason(game: GameState, item: ItemDefinition, quantity = 1) {
  if (quantity < 1) {
    return "Quantidade invalida";
  }
  if (game.character.gold < item.price * quantity) {
    return "Ouro insuficiente";
  }
  if (!canReceiveShopItem(game, item)) {
    return "Inventário cheio";
  }
  return null;
}

function getShopBuyBlockedReason(game: GameState, item: ItemDefinition) {
  if (item.slot && game.character.level < item.minLevel) {
    return `NÃ­vel ${item.minLevel} necessÃ¡rio`;
  }
  if (game.character.gold < item.price) {
    return "Ouro insuficiente";
  }
  if (!canReceiveShopItem(game, item)) {
    return "InventÃ¡rio cheio";
  }
  return null;
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatSecondaryIndex(value: number) {
  return Math.round(value * 100).toString();
}

function formatListingDate(value: number) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(value);
}

function formatCurrency(n: number): string {
  if (n < 9999) return n.toString();
  const tiers: Array<[number, string]> = [
    [1e30, "no"],
    [1e27, "oi"],
    [1e24, "set"],
    [1e21, "ses"],
    [1e18, "qui"],
    [1e15, "qua"],
    [1e12, "tri"],
    [1e9, "bi"],
    [1e6, "mi"],
    [1e3, "k"],
  ];
  for (const [threshold, suffix] of tiers) {
    if (n >= threshold) {
      const val = n / threshold;
      return val.toFixed(2).replace(/\,?0+$/, "") + suffix;
    }
  }
  return String(n);
}

function getEquipmentRarityColor(item: ItemDefinition, rarity?: Rarity) {
  if (!item.slot) return undefined;
  return RARITY_COLORS[rarity ?? item.rarity ?? "common"];
}
