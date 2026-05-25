import { createContext, FormEvent, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeftRight,
  Backpack,
  BarChart3,
  BookOpen,
  Castle,
  CheckCircle2,
  Coins,
  Copy,
  Crown,
  BriefcaseBusiness,
  ChevronDown,
  ChevronRight,
  Flame,
  Flag,
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
  ClanRankingEntry,
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
  Rarity,
  TalentDefinition,
  WorkReward,
  WorkServiceDefinition
} from "../shared/types";
import { RARITY_PRICE_MULTIPLIER, RARITY_STAT_MULTIPLIER } from "../shared/rarity";
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
import { socket } from "./socket";

type View =
  | "city"
  | "hunt"
  | "arena"
  | "armorer"
  | "apothecary"
  | "moneyChanger"
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

type AuthMode = "login" | "register" | "forgot";

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

const BATTLE_CUE_DURATION_MS = 680;
const BATTLE_LOG_STEP_MS = 280;
const BATTLE_RESULT_PAUSE_MS = 420;
const QUICK_POTION_STORAGE_KEY = "litch:quick-potions";
const DEFAULT_QUICK_POTION_PREFERENCES: QuickPotionPreferences = {
  health: "",
  energy: ""
};

const TRAVEL_MAP_POINTS: Record<string, { x: number; y: number }> = {
  eldoria: { x: 25, y: 55.5 },
  ravenspire: { x: 36.5, y: 41.5 },
  ironhold: { x: 29.5, y: 13.5 },
  vila_de_valfria: { x: 31.5, y: 75.5 },
  rosindale: { x: 63.5, y: 75.5 },
  porto_sombrio: { x: 55.5, y: 28 },
  necropole_de_morthaly: { x: 74.5, y: 33 }
};

const TRAVEL_COUNTRY_LABELS: Record<string, { x: number; y: number }> = {
  aurevia: { x: 23, y: 25 },
  valfria: { x: 49, y: 66 },
  morthaly: { x: 77, y: 18 }
};

const viewLabels: Record<View, string> = {
  city: "Cidade",
  hunt: "Caçar",
  arena: "Arena",
  armorer: "Armeiro",
  apothecary: "Boticário",
  moneyChanger: "Cambista",
  agency: "Agencia",
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
  strength: "Aumenta o impacto dos ataques e ajuda a encerrar combates mais rapido.",
  constitution: "Aumenta sua sobrevivencia, dando mais folego para batalhas longas.",
  agility: "Melhora sua chance de agir com precisao, evitar golpes e causar acertos decisivos."
};
const CLAN_CREST_OPTIONS = ["shield", "swords", "star", "gem", "castle", "trophy", "crown", "flame", "flag", "skull"] as const;

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
const BRAND_ICON_URL = "/assets/brand/litch-logo-square-512x512.png";
const BRAND_WORDMARK_URL = "/assets/brand/litch-1500x1500.png";
const EQUIPMENT_STAT_LABELS: Partial<Record<keyof ItemStats, string>> = {
  strength: "Forca",
  constitution: "Constituicao",
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

export function App() {
  const [game, setGame] = useState<GameState | null>(null);
  const [quickPotionPreferences, setQuickPotionPreferences] = useState<QuickPotionPreferences>(readQuickPotionPreferences);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [latestRecoveryCode, setLatestRecoveryCode] = useState<string | null>(null);
  const [view, setView] = useState<View>("city");
  const [utilityModal, setUtilityModal] = useState<"settings" | "guide" | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(socket.connected);
  const [showDetails, setShowDetails] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showExchange, setShowExchange] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerReference | null>(null);
  const [privateChatTarget, setPrivateChatTarget] = useState<PlayerReference | null>(null);
  const [playerProfiles, setPlayerProfiles] = useState<Record<string, PlayerPublicProfile>>({});
  const [loadingPlayerProfileId, setLoadingPlayerProfileId] = useState<string | null>(null);
  const [regenMs, setRegenMs] = useState(0);

  useEffect(() => {
    const resume = () => {
      setConnected(true);
      const token = localStorage.getItem("litch:session");
      if (token) {
        socket.emit("auth:resume", token);
      }
    };

    const onAuthOk = (payload: { sessionToken: string; recoveryCode?: string }) => {
      localStorage.setItem("litch:session", payload.sessionToken);
      if (payload.recoveryCode) {
        setLatestRecoveryCode(payload.recoveryCode);
      }
      setPassword("");
      setInviteCode("");
      setNewPassword("");
      setRecoveryCode("");
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
      socket.off("game:error", onError);
    };
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

  const submitAuth = (event: FormEvent) => {
    event.preventDefault();
    setLatestRecoveryCode(null);
    if (authMode === "login") {
      socket.emit("auth:login", { email, password });
      return;
    }
    if (authMode === "register") {
      socket.emit("auth:register", { username, email, password, inviteCode });
      return;
    }
    socket.emit("auth:forgotPassword", { email, recoveryCode, newPassword });
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
    email.trim().length > 0 &&
    (authMode === "forgot" ? newPassword.length >= 6 && recoveryCode.trim().length > 0 : password.length >= 6) &&
    (authMode !== "register" || username.trim().length >= 3);

  if (!game) {
    return (
      <main className="auth-screen">
        <form className="auth-panel" style={{backgroundColor:"#020007"}} onSubmit={submitAuth}>
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
              <span className="auth-label"><UserPlus size={15} /> Codigo de convite</span>
              <input
                value={inviteCode}
                maxLength={24}
                autoComplete="off"
                onChange={(event) => setInviteCode(event.target.value)}
                placeholder="Opcional"
              />
            </label>
          )}
          <label>
            <span className="auth-label"><Mail size={15} /> E-mail</span>
            <input
              type="email"
              value={email}
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@email.com"
            />
          </label>
          {authMode === "forgot" ? (
            <>
              <label>
                <span className="auth-label"><KeyRound size={15} /> Codigo de recuperacao</span>
                <input
                  value={recoveryCode}
                  autoComplete="one-time-code"
                  onChange={(event) => setRecoveryCode(event.target.value)}
                  placeholder="XXXX-XXXX-XXXX"
                />
              </label>
              <label>
                <span className="auth-label"><Lock size={15} /> Nova senha</span>
                <input
                  type="password"
                  value={newPassword}
                  minLength={6}
                  autoComplete="new-password"
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="Minimo de 6 caracteres"
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
                placeholder="Minimo de 6 caracteres"
              />
            </label>
          )}
          {latestRecoveryCode && (
            <div className="recovery-card">
              <span>Codigo de recuperacao</span>
              <code>{latestRecoveryCode}</code>
            </div>
          )}
          <button className="primary-button" type="submit" disabled={!canSubmitAuth}>
            {authMode === "login" ? "Entrar" : authMode === "register" ? "Criar conta" : "Redefinir senha"}
          </button>
          <span className={connected ? "status-dot online" : "status-dot"}>{connected ? "Online" : "Conectando"}</span>
        </form>
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

  return (
    <main className={gameShellClass}>
      <QuickPotionContext.Provider value={{ preferences: quickPotionPreferences, setPreference: setQuickPotionPreference }}>
        <PlayerActionContext.Provider value={{ currentPlayerId: game.player.id, openPlayerActions }}>
        <Header
          game={game}
          regenMs={regenMs}
          onDetails={() => setShowDetails(true)}
          onGameShop={() => setView("gameShop")}
          onExchange={() => setShowExchange(true)}
          onRanking={() => setView("rankings")}
          onSettings={() => setUtilityModal("settings")}
          onGuide={() => setUtilityModal("guide")}
          onLogout={logout}
        />
        <div className={game.activeBattle ? "game-grid in-battle" : "game-grid"}>
          <section className="city-stage">
            {!game.activeBattle && view === "city" && <CityHero game={game} view={view} setView={setView} />}
            <GamePane game={game} view={view} setView={setView} />
          </section>
        </div>
        <BottomNav game={game} view={view} setView={setView} />
        <FloatingChat
          game={game}
          open={showChat}
          setOpen={setShowChat}
          privateTarget={privateChatTarget}
          setPrivateTarget={setPrivateChatTarget}
        />
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
            onClose={() => setSelectedPlayer(null)}
          />
        )}
        {latestRecoveryCode && <RecoveryCodeModal code={latestRecoveryCode} onClose={() => setLatestRecoveryCode(null)} />}
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

function PlayerActionModal({
  player,
  profile,
  avatarCatalog,
  itemCatalog,
  loading,
  onInspect,
  onMessage,
  onClose
}: {
  player: PlayerReference;
  profile?: PlayerPublicProfile;
  avatarCatalog: AvatarDefinition[];
  itemCatalog: Record<string, ItemDefinition>;
  loading: boolean;
  onInspect: () => void;
  onMessage: () => void;
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
              <small>Nivel {profile.level} - {profile.online ? "Online" : "Offline"} - {profile.cityName}, {profile.countryName}</small>
            ) : (
              <small>{loading ? "Carregando perfil..." : "Perfil publico"}</small>
            )}
          </div>
        </div>
        <div className="player-action-buttons">
          <button className="primary-button" onClick={onMessage}>
            <MessageCircle size={15} /> Mensagem privada
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
                  <small>Cla nível {profile.clanLevel ?? 0}</small>
                </div>
              </div>
            )}
            <div className="player-profile-grid">
              <div><span>Nivel</span><strong>{profile.level}</strong></div>
              <div><span>Cla</span><strong>{profile.clanName ? `Nv ${profile.clanLevel ?? 0}` : "Sem cla"}</strong></div>
              <div><span>Arena</span><strong>{profile.arenaWins}V/{profile.arenaLosses}D</strong></div>
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
  onLogout
}: {
  onSettings: () => void;
  onGuide: () => void;
  onLogout: () => void;
}) {
  return (
    <nav className="utility-strip" aria-label="Menu do jogador">
      <button type="button" title="Configuracao" aria-label="Configuracao" onClick={onSettings}>
        <Settings size={15} />
      </button>
      <button type="button" title="Guia" aria-label="Guia" onClick={onGuide}>
        <BookOpen size={15} />
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
  onLogout
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
            size={42}
            royal={royalSealActive}
            className="character-chip-avatar"
            alert={hasGrowthPoints}
            alertLabel={growthPointLabels.join(" e ") || "Pontos para distribuir"}
          />
          <strong>{game.character.name}</strong>
          <small>Nv {game.character.level}</small>
          <small className="character-chip-clan">
            {game.clan ? <>{getClanCrestIcon(game.clan.icon, 11)} {game.clan.name}</> : "Sem clã"}
          </small>
        </button>
      </div>
      <div className="topbar-status">
        <div className="top-economy">
          <span className="stat-pill city-pill" title={game.currentCity.name}>
            <MapPinned size={17} style={{ color: "var(--purple)" }} />
            <strong>{game.currentCity.name}</strong>
          </span>
          <button className="stat-pill stat-action" onClick={onExchange} title="Trocar moedas">
            <Coins size={17} style={{ color: "var(--gold)" }} />
            <strong>{formatCurrency(game.character.gold)}</strong>
          </button>
          <button className="stat-pill stat-action" onClick={onGameShop} title="Loja do Jogo">
            <Gem size={17} style={{ color: "var(--cyan)" }} />
            <strong>{formatCurrency(game.character.diamonds)}</strong>
          </button>
          <button
            className="stat-pill stat-action"
            title="Ranking"
            onClick={onRanking}
          >
            <Trophy size={17} style={{ color: "var(--gold)" }} />
          </button>
          
          <UtilityStrip onSettings={onSettings} onGuide={onGuide} onLogout={onLogout} />
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
  const locked = Boolean(game.activeBattle);
  const working = isWorkInProgress(game.character.activeWork);
  const completedMissions = countClaimable(game.quests.daily) + countClaimable(game.quests.fixed);
  const myListings = game.marketplaceListings.filter((l) => l.sellerPlayerId === game.player.id).length;

  const items = [
    { view: "city" as View, label: "Cidade", icon: <Castle size={20} />, disabled: locked, badge: null },
    { view: "hunt" as View, label: "Caça", icon: <Swords size={20} />, disabled: locked, badge: null },
    { view: "arena" as View, label: "Arena", icon: <Shield size={20} />, disabled: locked || working, badge: game.arenaQueueSize > 0 ? game.arenaQueueSize : null },
    { view: "inventory" as View, label: "Inventário", icon: <Backpack size={20} />, disabled: false, badge: `${game.inventoryUsed}/${game.inventoryCapacity}` },
    { view: "market" as View, label: "Mercado", icon: <ShoppingBag size={20} />, disabled: locked, badge: myListings > 0 ? myListings : null },
    { view: "missions" as View, label: "Missões", icon: <ScrollText size={20} />, disabled: locked, badge: completedMissions > 0 ? completedMissions : null },
    { view: "clan" as View, label: "Clã", icon: <Users size={20} />, disabled: locked, badge: null },
    { view: "travel" as View, label: "Viajar", icon: <MapPinned size={20} />, disabled: locked, badge: null }
  ];

  return (
    <nav className="bottom-nav" aria-label="Acessos rápidos">
      {items.map((item) => (
        <button
          key={item.view}
          className={view === item.view ? "bottom-button active" : "bottom-button"}
          disabled={item.disabled}
          title={item.label}
          aria-label={item.label}
          onClick={() => setView(item.view)}
        >
          {item.icon}
          {item.badge !== null && item.badge !== undefined && (
            <span className="bottom-badge">{item.badge}</span>
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
        <PanelTitle icon={<Settings size={20} />} title="Configuracao" />
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
                    Quando um amigo cadastrado com seu codigo chegar ao nível {game.referrals.rewardLevel}, você pode resgatar
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
                      <span>Nivel {friend.level}/{game.referrals.rewardLevel}</span>
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

type GuideTab = "history" | "faq" | "world" | "items" | "monsters" | "monarchs" | "developer" | "stats";

function GuideModal({ game, onClose }: { game: GameState; onClose: () => void }) {
  const [tab, setTab] = useState<GuideTab>("history");
  const [worldFilter, setWorldFilter] = useState("");
  const [itemFilter, setItemFilter] = useState("");
  const [itemKind, setItemKind] = useState<"all" | ItemKind>("all");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [monsterFilter, setMonsterFilter] = useState("");
  const [monsterCity, setMonsterCity] = useState("all");
  const [selectedMonsterId, setSelectedMonsterId] = useState("");
  const [developerSubject, setDeveloperSubject] = useState("");
  const [developerMessage, setDeveloperMessage] = useState("");
  const countriesById = new Map(game.countries.map((country) => [country.id, country]));
  const citiesById = new Map(game.cities.map((city) => [city.id, city]));
  const allItems = Object.values(game.itemCatalog).sort((a, b) => a.price - b.price || a.name.localeCompare(b.name));
  const filteredItems = allItems.filter((item) => {
    const matchesKind = itemKind === "all" || item.kind === itemKind;
    const term = itemFilter.trim().toLowerCase();
    const matchesTerm = !term || item.name.toLowerCase().includes(term) || ITEM_KIND_LABELS[item.kind].toLowerCase().includes(term);
    return matchesKind && matchesTerm;
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

  const sendDeveloperMessage = (event: FormEvent) => {
    event.preventDefault();
    if (!developerMessage.trim()) return;
    socket.emit("developer:message", { subject: developerSubject, message: developerMessage });
    setDeveloperSubject("");
    setDeveloperMessage("");
  };

  const tabs: Array<{ id: GuideTab; label: string; icon: React.ReactNode }> = [
    { id: "history", label: "Historia", icon: <BookOpen size={14} /> },
    { id: "faq", label: "FAQ", icon: <Info size={14} /> },
    { id: "world", label: "Mundo", icon: <Castle size={14} /> },
    { id: "items", label: "Itens", icon: <Backpack size={14} /> },
    { id: "monsters", label: "Monstros", icon: <Swords size={14} /> },
    { id: "monarchs", label: "Monarcas", icon: <Skull style={{color: "var(--red)"}} size={14} /> },
    { id: "developer", label: "Dev", icon: <Send size={14} /> },
    { id: "stats", label: "Stats", icon: <BarChart3 size={14} /> }
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
              {entry.icon} {entry.label}
            </button>
          ))}
        </div>

        {tab === "history" && (
          <div className="guide-copy">
            <h1>O Chamado dos Vivos</h1>
            <p>
              Antes que o medo tivesse nome e antes que os mortos aprendessem a marchar,
              havia três grandes países separados pelas águas antigas do mundo:
              <strong>Aurevia</strong>, <strong>Valfria</strong> e <strong>Duskwood</strong>.
            </p>
            <p>
              Por muitos séculos, eles viveram em harmonia.
            </p>
            <p>
              Aurevia era o coração verde do continente. Suas florestas se estendiam como mantos vivos
              sobre colinas férteis, rios claros e cidades erguidas entre árvores milenares.
              Era uma terra próspera, lar de cavaleiros, caçadores, guardiões e heróis cujos nomes
              atravessavam gerações.
            </p>
            <p>
              Valfria, ao sul, era o reino das areias douradas. Onde muitos viam apenas deserto,
              os valfrianos viam conhecimento. Eles ergueram torres entre dunas, bibliotecas sob templos
              de pedra, observatórios voltados às estrelas e escolas dedicadas ao estudo das feras,
              do clima, da guerra e da mente.
            </p>
            <p>
              E Duskwood, ao leste, era uma terra de bosques escuros, montanhas frias e vales envoltos
              por névoa. Apesar de seu aspecto sombrio, era um país antigo e respeitado.
              Seus habitantes guardavam tradições profundas, protegiam fronteiras esquecidas e mantinham
              vigílias sobre ruínas que já existiam antes dos primeiros reis.
            </p>
            <p>
              Juntos, os três países formavam um equilíbrio raro.
            </p>
            <p>
              Aurevia oferecia alimento, madeira, remédios e heróis.<br/>
              Valfria oferecia ciência, estratégia, mapas, técnicas e sabedoria.<br/>
              Duskwood oferecia minerais, fortalezas, artefatos antigos e vigilância contra perigos
              enterrados pela história.
            </p>
            <p>
              Durante muito tempo, as bandeiras dos três reinos tremularam lado a lado.
              Mercadores cruzavam os mares. Estudiosos viajavam entre universidades.
              Guerreiros treinavam em terras estrangeiras. Crianças cresciam ouvindo histórias de união,
              coragem e prosperidade.
            </p>
            <p>
              Mas havia uma lenda.
            </p>
            <p>
              Uma profecia antiga, tão velha que muitos já a tratavam como conto para assustar crianças.
            </p>
            <p>
              Ela dizia que, quando a lua perdesse sua cor e as torres de Duskwood projetassem sombras
              contra o céu sem sol, um rei esquecido despertaria sob a terra.
              Não um rei dos vivos, mas dos mortos.
            </p>
            <p>
              Um soberano sem carne, sem piedade e sem fim. Ele se ergueria usando uma coroa profanada
              e traria consigo generais caídos, legiões sem alma e uma fome que não seria saciada por terras,
              ouro ou tronos.
            </p>
            <p>
              A profecia dizia que ele não desejaria apenas governar.
            </p>
            <p>
              Ele desejaria calar toda vida.
            </p>
            <p>
              Por gerações, ninguém acreditou.
            </p>
            <p>
              Até a noite em que os sinos de Duskwood tocaram sozinhos.
            </p>
            <p>
              Naquela noite, as estrelas desapareceram atrás de nuvens roxas.
              As florestas escureceram. As criptas se abriram.
              Os túmulos racharam como cascas secas.
              Dos campos, das catacumbas e dos salões esquecidos sob antigos castelos,
              os mortos se levantaram.
            </p>
            <p>
              E no centro de tudo, em uma fortaleza sepultada sob a capital de Duskwood, ele despertou.
            </p>
            <h2>O Rei Litch</h2>
            <p>
              Seus olhos ardiam com luz violeta. Suas vestes rasgadas pareciam feitas da própria noite.
              Em uma das mãos, carregava um cajado imponente, coroado por pedras arcanas e ossos de reis vencidos.
            </p>
            <p>
              Ao seu redor, ajoelhavam-se seus generais: guerreiros mortos, assassinos sem rosto,
              carrascos de armadura negra, comandantes de foices e lâminas gigantescas.
            </p>
            <p>
              Duskwood caiu em poucos dias.
            </p>
            <p>
              Suas cidades foram tomadas. Seus castelos, profanados.
              Seus campos, cobertos por névoa púrpura.
              Aqueles que resistiram foram esmagados.
              Aqueles que tombaram se levantaram novamente, agora servindo ao trono dos mortos.
            </p>
            <p>
              E então, diante de suas legiões, o Rei Litch apagou o nome antigo do reino.
            </p>
            <p>
              Duskwood não existia mais.
            </p>
            <p>
              Em seu lugar nasceu <strong>Morthaly</strong>, a Coroa dos Mortos.
            </p>
            <p>
              Das torres negras de sua nova capital, o Rei Litch enviou sua declaração aos outros países.
              Não foi escrita em tinta, mas em cinzas. Não foi entregue por mensageiros vivos,
              mas por corvos de ossos e sombras.
            </p>
            <blockquote>
              <p>
                Todos os reinos cairão.<br/>
                Todos os vivos servirão.<br/>
                Toda existência humana será dobrada diante de Morthaly.
              </p>
            </blockquote>
            <p>
              Aurevia chorou pelos aliados perdidos.<br/>
              Valfria fechou suas bibliotecas e abriu seus arsenais.<br/>
              Os mares, antes caminhos de comércio, tornaram-se fronteiras de guerra.
            </p>
            <p>
              Pela primeira vez em séculos, os três países restantes do mundo livre compreenderam
              que a harmonia havia terminado.
            </p>
            <h2>O Alistamento dos Vivos</h2>
            <p>
              Então foi criado o <strong>Alistamento dos Vivos</strong>.
            </p>
            <p>
              Não importava a origem. Não importava se alguém era camponês, caçador, aprendiz,
              mercador, estudioso, desertor, órfão ou herdeiro de sangue nobre.
              Todos aqueles que ainda carregavam vida no peito poderiam se apresentar.
            </p>
            <p>
              Alguns vieram por dever.<br/>
              Outros, por vingança.<br/>
              Alguns vieram por glória.<br/>
              Outros, porque não tinham mais para onde fugir.
            </p>
            <p>
              Entre eles, estava você.
            </p>
            <p>
              No início, você não era uma lenda.
              Não era um campeão celebrado em canções.
              Não carregava uma coroa, nem comandava exércitos,
              nem possuía poder suficiente para desafiar os horrores de Morthaly.
            </p>
            <p>
              Você era apenas mais uma chama pequena diante de uma escuridão imensa.
            </p>
            <p>
              Mas até a menor chama pode incendiar uma noite inteira.
            </p>
            <p>
              Seu juramento foi feito diante das bandeiras de Aurevia e Valfria,
              sob o olhar severo dos comandantes, dos sábios, dos sobreviventes de Duskwood
              e dos feridos que ainda sussurravam os nomes dos que ficaram para trás.
            </p>
            <p>
              Você jurou lutar.
            </p>
            <p>
              Lutar contra os mortos-vivos que cruzam as fronteiras.<br/>
              Lutar contra os generais do Rei Litch.<br/>
              Lutar contra as fortalezas profanadas, as criptas abertas e as hordas que não conhecem cansaço.<br/>
              Lutar até que Morthaly recue.<br/>
              Lutar até que os vivos possam dormir sem temer que seus ancestrais batam à porta durante a noite.
            </p>
            <p>
              Mas essa guerra não será vencida em um único dia.
            </p>
            <p>
              O Rei Litch é antigo. Seus generais são poderosos.
              Seus exércitos crescem a cada batalha.
              Cada derrota alimenta sua marcha.
              Cada cidade perdida se torna mais uma peça em seu império de ossos.
            </p>
            <p>
              Por isso, sua missão é crescer.
            </p>
            <p>
              Ficar mais forte.<br/>
              Treinar.<br/>
              Explorar.<br/>
              Caçar monstros.<br/>
              Conquistar equipamentos.<br/>
              Dominar habilidades.<br/>
              Encontrar companheiros que compartilham o mesmo juramento.<br/>
              Formar alianças.<br/>
              Enfrentar inimigos cada vez mais terríveis.<br/>
              Retornar das batalhas com cicatrizes, recompensas e histórias.
            </p>
            <p>
              Cada combate vencido é uma vida protegida.<br/>
              Cada monstro derrotado é um passo contra a escuridão.<br/>
              Cada companheiro encontrado é uma prova de que os vivos ainda sabem se unir.<br/>
              Cada nível conquistado é uma afronta ao trono de Morthaly.
            </p>
            <p>
              E talvez, um dia, quando seu nome for conhecido nas tavernas de Aurevia,
              nas academias de Valfria e nos acampamentos de guerra espalhados pelo mundo,
              você esteja pronto para marchar até o coração do reino morto.
            </p>
            <p>
              Talvez um dia você encare os generais do Rei Litch.<br/>
              Talvez um dia atravesse os portões negros de Morthaly.<br/>
              Talvez um dia suba os degraus do trono profanado.<br/>
              Talvez um dia olhe nos olhos violetas do Rei dos Mortos e prove que a humanidade
              ainda não terminou sua história.
            </p>
            <p>
              Até lá, a guerra continua.
            </p>
            <p>
              As florestas de Aurevia ainda resistem.<br/>
              As torres de Valfria ainda estudam os céus.<br/>
              Os sobreviventes de Duskwood ainda esperam redenção.<br/>
              E Morthaly ainda cresce nas sombras.
            </p>
            <p>
              Mas enquanto houver vivos dispostos a lutar, o mundo não pertence aos mortos.
            </p>
            <p>
              <strong>E é aqui que sua jornada começa.</strong>
            </p>
          </div>
        )}

        {tab === "faq" && (
          <div className="faq-list">
            <section className="faq-section">
              <h3>Primeiros passos</h3>
              <article><strong>Como meu personagem começa?</strong><span>Ao criar a conta, o personagem ja nasce com FOR, CON e AGI em 1, arma de treino, algumas poções e inventario limitado.</span></article>
              <article><strong>O que devo fazer primeiro?</strong><span>Entre em Caca, escolha um local da cidade e enfrente monstros adequados ao seu nível para ganhar XP, ouro e possiveis drops.</span></article>
              <article><strong>O que fica bloqueado em batalha?</strong><span>Durante a batalha, a maioria das ações fica bloqueada. Você ainda pode abrir inventario, detalhes do personagem e sair da conta.</span></article>
            </section>

            <section className="faq-section">
              <h3>Regras e recursos</h3>
              <article><strong>Como funciona o inventario?</strong><span>Itens que não sao equipamentos ficam agrupados. Equipamentos ocupam espacos individuais, pois podem ter raridade e aprimoramento.</span></article>
              <article><strong>Como recupero vida e energia?</strong><span>A cada 2 minutos reais você recupera 10%, com bonus de talentos. Poções tambem recuperam 30% de vida ou energia.</span></article>
              <article><strong>Como a energia limita a caca?</strong><span>A energia maxima e CON + nível. Cada batalha PvE consome energia igual ao nível do monstro.</span></article>
            </section>

            <section className="faq-section">
              <h3>Viagens</h3>
              <article><strong>Como viajo entre cidades?</strong><span>Use Ticket de Trem. Algumas cidades tambem exigem nível minimo para entrada.</span></article>
              <article><strong>Como viajo entre paises?</strong><span>Use Ticket de Navio. Ao chegar em outro pais, você aporta na cidade porto daquele pais.</span></article>
              <article><strong>Onde compro tickets e pergaminhos?</strong><span>No Cambista, que fica apenas em cidades porto. Ele vende tickets e e o unico NPC que vende pergaminhos.</span></article>
            </section>

            <section className="faq-section">
              <h3>Combate</h3>
              <article><strong>Como a vida e calculada?</strong><span>Vida maxima: nível * 50 + 2 * CON, somando bonus de equipamentos, talentos e beneficios.</span></article>
              <article><strong>Como o dano e calculado?</strong><span>O dano base e FOR do atacante menos DEF do defensor, com minimo de 1 quando o ataque acerta.</span></article>
              <article><strong>Para que serve AGI?</strong><span>AGI aumenta chance de critico e esquiva. Ela tambem conversa bem com talentos ofensivos e defensivos.</span></article>
            </section>

            <section className="faq-section highlighted">
              <h3>Diamantes e Amigo do Rei</h3>
              <article><strong>Quando vale comprar diamantes?</strong><span>Diamantes aceleram resets, criacao de cla, compra de avatares premium e trocas por ouro quando você precisa agir rapido no mercado.</span></article>
              <article><strong>O que e Amigo do Rei?</strong><span>E um pacote em destaque da Loja do Jogo com 200 diamantes, 100 tickets de trem, 30 tickets de navio, PvE automatico por 1 mes e selo do rei no avatar por 1 mes.</span></article>
              <article><strong>Por que o PvE automatico ajuda?</strong><span>Ele reduz repeticao em sessoes longas de caca, ideal para farmar XP, gold e drops enquanto você foca em mercado, cla e progresso.</span></article>
            </section>
          </div>
        )}

        {tab === "world" && (
          <div className="guide-catalog">
            <div className="guide-filters">
              <input value={worldFilter} onChange={(event) => setWorldFilter(event.target.value)} placeholder="Filtrar pais, cidade ou local" />
            </div>
            <div className="guide-country-list">
              {countryGroups.map(({ country, cities }) => (
                <article className="guide-country-card" key={country.id}>
                  <div className="guide-country-media">
                    <AssetImage src={country.imageUrl} alt={country.name} fallback={<MapPinned size={34} />} />
                  </div>
                  <div className="guide-country-content">
                    <div className="guide-country-heading">
                      <div>
                        <span className="eyebrow">Pais</span>
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
                                <span>Nivel minimo {city.minLevel}{city.isPort ? " - Porto" : ""}</span>
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
              {countryGroups.length === 0 && <p className="empty-state">Nenhum pais, cidade ou local encontrado.</p>}
            </div>
          </div>
        )}

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
              <input value={monsterFilter} onChange={(event) => setMonsterFilter(event.target.value)} placeholder="Filtrar monstro, cidade ou pais" />
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
              <article><strong>Entrada</strong><span>O evento dos Monarcas acontece em Morthaly. Para entrar, o recruta usa Chaves Altas e respeita o limite diario de tentativas.</span></article>
              <article><strong>Objetivo</strong><span>Todos os participantes atacam o mesmo chefe global. O dano fica registrado no ranking do evento.</span></article>
              <article><strong>Recompensas</strong><span>Ao final, participantes recebem XP e ouro conforme dano/ranking. Quando o chefe e derrotado, os 3 melhores tambem recebem diamantes.</span></article>
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
                    <small title="Forca"><Swords size={13} /> {general.strength}</small>
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
              <p>Obrigado por jogar e testar Litch. Cada bug reportado, sugestao de balanceamento e comentario sobre a experiencia ajuda a deixar o jogo mais vivo, justo e divertido.</p>
              <p>Use este canal para contar o que travou seu progresso, qual sistema ficou confuso, que item parece forte demais ou que ideia você gostaria de ver no mundo.</p>
            </div>
            <label>
              <span>Assunto</span>
              <input value={developerSubject} onChange={(event) => setDeveloperSubject(event.target.value)} placeholder="Bug, sugestao ou duvida" />
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
    .map((key) => ({ key, label: EQUIPMENT_STAT_LABELS[key], value: item.stats[key] }))
    .filter((entry) => entry.value !== undefined);
  const dropSources = getItemDropSources(game, item.id);
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
          <p>{item.description ?? "Sem descricao."}</p>
        </div>
        <div className="guide-detail-stats">
          {item.slot && <span>Nivel minimo <strong>{item.minLevel}</strong></span>}
          <span>Valor <strong>{formatCurrency(item.price)} ouro</strong></span>
          {item.rarity && <span>Raridade <strong>{RARITY_LABELS[item.rarity]}</strong></span>}
          {statEntries.map((entry) => (
            <span key={entry.key}>{entry.label} <strong>+{entry.value}</strong></span>
          ))}
          {item.stats.healPercent && <span>Vida <strong>+{Math.round(item.stats.healPercent * 100)}%</strong></span>}
          {item.stats.energyPercent && <span>Energia <strong>+{Math.round(item.stats.energyPercent * 100)}%</strong></span>}
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
                    <span>{source.city?.name ?? "Cidade desconhecida"} - {Math.round(source.chance * 100)}%</span>
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
                    <span>{vendor.role} - {vendor.city.name}, {vendor.country?.name ?? "Pais desconhecido"}</span>
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
          <span className="eyebrow">{city?.name ?? "Cidade desconhecida"} - {country?.name ?? "Pais desconhecido"}</span>
          <h3>{monster.name}</h3>
        </div>
        <div className="monster-stats">
          <small title="Nivel"><Star size={13} /> {monster.level}</small>
          <small title="Vida"><Heart size={13} /> {monster.maxHp}</small>
          <small title="Forca"><Swords size={13} /> {monster.strength}</small>
          <small title="Defesa"><Shield size={13} /> {monster.defense}</small>
          <small title="Agilidade"><Crosshair size={13} /> {monster.agility}</small>
          <small title="XP"><Sparkles size={13} /> {monster.experience}</small>
          <small title="Ouro"><Coins size={13} /> {monster.gold}</small>
        </div>
        <section className="guide-detail-section">
          <h4>Drops</h4>
          <div className="guide-detail-stats">
            {monster.drops.length === 0 && <span>Drop <strong>Nenhum</strong></span>}
            {monster.drops.map((drop) => (
              <span key={drop.itemId}>
                {game.itemCatalog[drop.itemId]?.name ?? drop.itemId}
                <strong>{Math.round(drop.chance * 100)}%</strong>
              </span>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
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

function getItemVendors(game: GameState, itemId: string) {
  const vendors: Array<{ city: GameState["cities"][number]; country?: GameState["countries"][number]; role: string; name: string }> = [];
  for (const city of game.cities) {
    const country = game.countries.find((entry) => entry.id === city.countryId);
    if (city.armorerItemIds.includes(itemId)) {
      vendors.push({ city, country, role: "Armeiro", name: city.npcs.armorer });
    }
    if (city.apothecaryItemIds.includes(itemId)) {
      vendors.push({ city, country, role: "Boticario", name: city.npcs.apothecary });
    }
    if ((city.moneyChangerItemIds ?? []).includes(itemId) && city.npcs.moneyChanger) {
      vendors.push({ city, country, role: "Cambista", name: city.npcs.moneyChanger });
    }
  }
  return vendors;
}

function formatNpcRole(role: string) {
  switch (role) {
    case "armorer":
      return "Armeiro";
    case "apothecary":
      return "Boticario";
    case "blacksmith":
      return "Ferreiro";
    case "alchemist":
      return "Alquimista";
    case "moneyChanger":
      return "Cambista";
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
      style={{ width: size, height: size, background: avatar?.accent }}
      title={alert ? alertLabel : avatar?.name}
    >
      {getAvatarIcon(avatar?.icon ?? "user", Math.max(18, Math.floor(size * 0.48)))}
      {royal && <i className="royal-seal-mini"><Crown size={Math.max(9, Math.floor(size * 0.16))} /></i>}
      {alert && <i className="profile-avatar-alert-dot" aria-label={alertLabel} />}
    </span>
  );
}

function CharacterPanel({ game, locked = false }: { game: GameState; locked?: boolean }) {
  const [pending, setPending] = useState<Attributes>({ strength: 0, constitution: 0, agility: 0 });
  const [showAvatarChoices, setShowAvatarChoices] = useState(false);
  const { preferences } = useQuickPotionSettings();
  const pendingTotal = pending.strength + pending.constitution + pending.agility;
  const healthPotion = getQuickPotionOption(game, preferences, "health");
  const energyPotion = getQuickPotionOption(game, preferences, "energy");
  const royalSealActive = isRoyalSealActive(game);
  const autoPveActive = isAutoPveActive(game);
  const currentAvatar = getCurrentAvatar(game);
  const unlockedAvatarIds = game.character.unlockedAvatarIds ?? [];
  const hpProgress = Math.min(100, Math.round((game.character.currentHp / game.derived.maxHp) * 100));
  const energyProgress = Math.min(100, Math.round((game.character.currentEnergy / game.derived.maxEnergy) * 100));
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
  const chooseAvatar = (avatar: AvatarDefinition, unlocked: boolean) => {
    if (locked) {
      return;
    }
    if (avatar.id === game.character.avatarId) {
      setShowAvatarChoices((current) => !current);
      return;
    }
    if (!unlocked && !window.confirm(`Comprar ${avatar.name} por ${avatar.priceDiamonds} diamantes?`)) {
      return;
    }
    socket.emit("character:avatar", { avatarId: avatar.id });
  };

  return (
    <aside className="side-panel character-panel">
      <div className="avatar-ring">
        <CharacterAvatar avatar={currentAvatar} size={76} royal={royalSealActive} />
      </div>
      <h2>{game.character.name}</h2>
      <p className="muted">Nível {game.character.level} — {game.currentCity.name}</p>
      {autoPveActive && (
        <p className="royal-status">
          <Crown size={14} /> Amigo do Rei ativo ate {formatListingDate(game.character.pveAutoUntil ?? 0)}
        </p>
      )}
      {game.clan && (
        <div className="character-clan-info">
          <span className="character-clan-crest">{getClanCrestIcon(game.clan.icon, 18)}</span>
          <div>
            <strong>{game.clan.name}</strong>
            <small>Nivel {game.clan.level} - {game.clan.leaderPlayerId === game.player.id ? "Lider do cla" : "Membro do cla"}</small>
          </div>
        </div>
      )}

      <section className="compact-section avatar-section">
        <h3>Avatar</h3>
        <button className="current-avatar-card" type="button" disabled={locked} onClick={() => setShowAvatarChoices((current) => !current)}>
          <CharacterAvatar avatar={currentAvatar} size={54} royal={royalSealActive} />
          <div>
            <strong>{currentAvatar?.name ?? "Avatar"}</strong>
            <small>{showAvatarChoices ? "Ocultar opções" : "Trocar avatar"}</small>
          </div>
        </button>
        {showAvatarChoices && <div className="avatar-choice-grid">
          {game.avatarCatalog.map((avatar) => {
            const unlocked = avatar.priceDiamonds === 0 || unlockedAvatarIds.includes(avatar.id);
            const selected = game.character.avatarId === avatar.id;
            return (
              <button
                type="button"
                key={avatar.id}
                className={`avatar-choice${selected ? " selected" : ""}${!unlocked ? " locked" : ""}`}
                disabled={locked}
                onClick={() => chooseAvatar(avatar, unlocked)}
                title={unlocked ? avatar.name : `${avatar.name} - ${avatar.priceDiamonds} diamantes`}
              >
                <CharacterAvatar avatar={avatar} size={46} />
                {!unlocked && <span className="avatar-lock"><Lock size={12} /></span>}
                <span>{avatar.name}</span>
                <small>
                  {selected ? (
                    "Em uso"
                  ) : unlocked ? (
                    "Usar"
                  ) : (
                    <>{avatar.priceDiamonds} <Gem size={12} style={{ color: "var(--cyan)" }} /></>
                  )}
                </small>
              </button>
            );
          })}
        </div>}
      </section>

      <section className="character-resource-bars" aria-label="Recursos do personagem">
        <ResourceBar
          className="life"
          icon={<Heart size={15} style={{ color: "var(--red)" }} />}
          value={`${game.character.currentHp}/${game.derived.maxHp}`}
          progress={hpProgress}
        />
        <ResourceBar
          className="energy"
          icon={<Zap size={15} style={{ color: "var(--green)" }} />}
          value={`${game.character.currentEnergy}/${game.derived.maxEnergy}`}
          progress={energyProgress}
        />
      </section>

      <div className="stat-grid">
        <Metric icon={<Heart size={18} />} label="Vida" value={`${game.character.currentHp}/${game.derived.maxHp}`} />
        <Metric icon={<Zap size={18} />} label="Energia" value={`${game.character.currentEnergy}/${game.derived.maxEnergy}`} />
        <Metric icon={<Swords size={18} />} label="FORÇA" value={game.derived.totalStrength} />
        <Metric icon={<Shield size={18} />} label="DEFESA" value={game.derived.defense} />
        <Metric icon={<Crosshair size={18} />} label="AGI" value={game.derived.agility} />
      </div>

      <div className="chance-row">
        <span>Crítico {formatPercent(game.derived.criticalChance)}</span>
        <span>Esquiva {formatPercent(game.derived.dodgeChance)}</span>
      </div>

      <section className="compact-section">
        <h3>Poções</h3>
        <div className="potion-actions">
          <button
            className="battle-potion-button health"
            disabled={locked || !healthPotion || game.character.currentHp >= game.derived.maxHp}
            title={healthPotion?.definition.name ?? "Nenhuma pocao de vida"}
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
            title={energyPotion?.definition.name ?? "Nenhuma pocao de energia"}
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

      <section className="compact-section">
        <h3>Equipamentos</h3>
        <div className="equipment-visual">
          {(["weapon", "armor", "amulet"] as const).map((slot) => {
            const instanceId = game.character.equipment[slot];
            const inventoryItem = instanceId ? game.character.inventory.find((item) => item.instanceId === instanceId) : null;
            const definition = inventoryItem ? game.itemCatalog[inventoryItem.itemId] : null;
            const slotEmoji = { weapon: "⚔️", armor: "🛡️", amulet: "📿" };
            return (
              <div className={`equip-slot${definition ? " has-item" : ""}`} key={slot}>
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
              </div>
            );
          })}
        </div>
      </section>

      <section className="compact-section">
        <h3>Atributos</h3>
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
          <button className="ghost-button" disabled={locked} onClick={() => socket.emit("attribute:reset", { method: "diamonds" })}>
            Reset 20 <Gem size={13} style={{ color: "var(--cyan)" }} />
          </button>
          <button className="ghost-button" disabled={locked} onClick={() => socket.emit("attribute:reset", { method: "scroll" })}>
            Usar memória
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
        <TalentTreeView game={game} compact />
      </section>
    </aside>
  );
}

function CityHero({ game, view, setView }: { game: GameState; view: View; setView: (view: View) => void }) {
  const countryCover = game.currentCountry.imageUrl ?? `/assets/locals/${game.currentCountry.id}.png`;
  return (
    <header className="city-hero">
      <img src={countryCover} alt="" className="city-map" />
      <div className="city-copy">
        <span className="eyebrow">Cidade</span>
        <h1>{game.currentCity.name}</h1>
        <strong className="city-country">{game.currentCountry.name}</strong>
        <p>{game.currentCity.description}</p>
        <small className="city-inhabitants">{game.currentCity.inhabitants.slice(0, 4).join(" • ")}</small>
      </div>
    </header>
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
      : "Servico em andamento"
    : `${countryServices.length} servicos`;
  const working = isWorkInProgress(game.character.activeWork);
  const combatOptions: CityOption[] = [
    { view: "hunt", icon: <Swords size={24} />, title: "Caçar", value: `${game.cityHuntLocations.length} locais` },
    { view: "arena", icon: <Shield size={24} />, title: "Arena", value: working ? "Trabalhando" : `${game.arenaQueueSize} na fila`, disabled: working },
  ];
  if (game.currentCity.dungeonMonsterIds?.length) {
    combatOptions.push({ view: "dungeon", icon: <Star size={24} />, title: "Masmorra", value: working ? "Trabalhando" : `${game.currentCity.dungeonMonsterIds.length} desafios`, disabled: working });
  }

  const actionOptions: CityOption[] = [
    { view: "agency", icon: <BriefcaseBusiness size={24} />, title: "Agencia", value: workValue }
  ];
  
  if (game.currentCountry.id === "morthaly" && game.monarchEvent) {
    actionOptions.push({
      view: "monarch",
      icon: <Skull size={24} style={{ color: "var(--red)" }} />,
      title: game.monarchEvent.isKing ? "Rei Litch" : "Monarca",
      value: working ? "Trabalhando" : game.monarchEvent.status === "active" ? `${game.monarchEvent.attemptsLimit - game.monarchEvent.attemptsUsed} entradas` : "Encerrado",
      disabled: working
    });
  }

  const inhabitantOptions: CityOption[] = [
    { view: "armorer", icon: <Gavel size={24} />, title: game.currentCity.npcs.armorer ?? "Armeiro", value: `Meus equipamentos vão te acompanhar do início ao fim` },
    { view: "apothecary", icon: <FlaskConical size={24} />, title: game.currentCity.npcs.apothecary ?? "Boticário", value: `As poções de cura são muito importantes` },
  ];

  if (game.currentCity.blacksmithRecipeIds?.length || game.currentCity.blacksmithEnhancement) {
    inhabitantOptions.push({ view: "blacksmith", icon: <Hammer size={24} />, title: game.currentCity.npcs.blacksmith ?? "Ferreiro", value: "Minha forja está pronta" });
  }

  if (game.currentCity.alchemistRecipeIds?.length) {
    inhabitantOptions.push({ view: "alchemist", icon: <PencilRuler size={24} />, title: game.currentCity.npcs.alchemist ?? "Alquimista", value: "Posso fabricar coisas interessantes" });
  }
  if (game.currentCity.npcs.moneyChanger) {
    inhabitantOptions.push({
      view: "moneyChanger",
      icon: <Coins size={24} />,
      title: game.currentCity.npcs.moneyChanger ?? "Cambista",
      value: `Na minha mão é mais barato`
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
  const currentCountryName = game.countries.find((country) => country.id === activeWork?.countryId)?.name ?? "outro pais";
  const activeWorkMinutes = activeWork ? getWorkAssignmentMinutes(activeWork) : 0;

  return (
    <section className="content-panel agency-panel">
      <PanelTitle icon={<BriefcaseBusiness size={20} />} title={`Agencia de ${game.currentCountry.name}`} />
      <p className="agency-intro">{game.currentCountry.description}</p>

      {activeWork && activeService && (
        <article className={activeReady ? "work-active-card ready" : "work-active-card"}>
          <div>
            <span className="eyebrow">Servico atual</span>
            <h3>{activeService.name}</h3>
            <p>{activeService.description}</p>
          </div>
          <div className="work-active-meta">
            <span>{formatWorkMinutes(activeWorkMinutes)} contratados</span>
            <strong>{activeReady ? "Concluido" : formatDuration(activeWork.endsAt - now)}</strong>
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
              Receber recompensa
            </button>
            <button
              className="danger-button"
              onClick={() => {
                if (window.confirm("Abandonar o servico e perder toda recompensa e aptidao deste expediente?")) {
                  socket.emit("work:abandon");
                }
              }}
            >
              Abandonar
            </button>
          </div>
          {!activeInCountry && <small className="level-warn">Volte para {currentCountryName} para receber este servico.</small>}
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
                <span>{aptitude.level <= 0 ? "Primeiro servico libera nivel 1" : `${formatAptitudeHours(aptitude.progressHours)}/${formatAptitudeHours(nextLevelHours)} para o proximo nivel`}</span>
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
                <strong>Bonus Nv. {service.bonus.level}</strong>
                <span>{service.bonus.description}</span>
                {service.bonus.periodicReward && bonusUnlocked && (
                  <button
                    className="ghost-button"
                    disabled={!periodicReady}
                    onClick={() => socket.emit("work:claimBonus", { serviceId: service.id })}
                  >
                    {periodicReady ? "Resgatar bonus" : `Pronto em ${formatDuration(getWorkBonusReadyAt(game, service) - now)}`}
                  </button>
                )}
              </div>
              <button
                className="primary-button"
                disabled={Boolean(activeWork)}
                onClick={() => socket.emit("work:start", { serviceId: service.id, minutes: selectedMinutes })}
              >
                Iniciar servico
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function MissionsPanel({ game }: { game: GameState }) {
  return (
    <section className="content-panel missions-panel">
      <PanelTitle icon={<ScrollText size={20} />} title="Missões" />
      <QuestSection title="Diárias" quests={game.quests.daily} />
      <QuestSection title="Fixas" quests={game.quests.fixed} />
    </section>
  );
}

function QuestSection({ title, quests }: { title: string; quests: QuestView[] }) {
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
              <div className="quest-info-line">
                <div className="quest-main">
                <strong>{quest.title}</strong>
                <span>{quest.description}</span>
                </div>
              <div className="quest-reward">
                {quest.reward.experience ? <span>{quest.reward.experience} XP</span> : null}
                {quest.reward.gold ? <span>{quest.reward.gold} <Coins size={12} style={{ color: "var(--gold)" }} /></span> : null}
                {quest.reward.diamonds ? <span>{quest.reward.diamonds} <Gem size={12} style={{ color: "var(--cyan)" }} /></span> : null}
              </div>
              <button
                className="primary-button"
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

function CraftingPanel({ game, station }: { game: GameState; station: "blacksmith" | "alchemist" }) {
  const recipes = game.availableCraftingRecipes[station];
  const title = station === "blacksmith" ? "Ferreiro" : "Alquimista";
  const icon = station === "blacksmith" ? <Hammer size={20} /> : <FlaskConical size={20} />;
  const npcName = station === "blacksmith" ? game.currentCity.npcs.blacksmith : game.currentCity.npcs.alchemist;

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
      <div className="list-grid monster-battle-list">
        {recipes.length === 0 && <p className="empty-state">Nenhuma receita disponível nesta cidade.</p>}
        {recipes.map((recipe) => {
          const result = game.itemCatalog[recipe.resultItemId];
          const canCraft =
            game.character.gold >= recipe.goldCost &&
            recipe.ingredients.every((ingredient) => countInventoryItem(game, ingredient.itemId) >= ingredient.quantity);
          return (
            <article className="entity-card" key={recipe.id}>
              <div>
                <strong>{recipe.name}</strong>
                <span>
                  {result.name} x{recipe.resultQuantity}
                </span>
              </div>
              <div className="recipe-ingredients">
                {recipe.ingredients.map((ingredient) => (
                  <small key={ingredient.itemId}>
                    {game.itemCatalog[ingredient.itemId].name}: {countInventoryItem(game, ingredient.itemId)}/{ingredient.quantity}
                  </small>
                ))}
                <small>{recipe.goldCost} <Coins size={12} style={{ color: "var(--gold)" }} /></small>
              </div>
              <button className="primary-button" disabled={!canCraft} onClick={() => socket.emit("craft:create", { recipeId: recipe.id })}>
                Criar
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function EquipmentEnhancementPanel({ game }: { game: GameState }) {
  const equipmentItems = game.character.inventory.filter((entry) => Boolean(game.itemCatalog[entry.itemId]?.slot));
  const [selectedInstanceId, setSelectedInstanceId] = useState(equipmentItems[0]?.instanceId ?? "");
  const [creationStones, setCreationStones] = useState(0);
  const selectedEntry = equipmentItems.find((entry) => entry.instanceId === selectedInstanceId) ?? null;
  const selectedItem = selectedEntry ? game.itemCatalog[selectedEntry.itemId] : null;
  const plan = selectedEntry ? getEnhancementPlanForUi(game, selectedEntry, creationStones) : null;
  const rangeLabel = describeEnhancementLevelRange(game.currentCountry.id);
  const currentStats = selectedItem && selectedEntry ? getEnhancedItemStats(selectedItem, selectedEntry) : null;
  const nextStats = selectedItem && selectedEntry && plan
    ? getEnhancedItemStats(selectedItem, { ...selectedEntry, enhancementLevel: plan.nextLevel })
    : null;
  const requirementsMet = Boolean(plan?.requirements.every((requirement) => countInventoryItem(game, requirement.itemId) >= requirement.quantity));
  const canEnhance = Boolean(selectedEntry && selectedItem && plan?.allowed && requirementsMet && game.character.gold >= plan.goldCost);

  useEffect(() => {
    if (!equipmentItems.some((entry) => entry.instanceId === selectedInstanceId)) {
      setSelectedInstanceId(equipmentItems[0]?.instanceId ?? "");
    }
  }, [equipmentItems, selectedInstanceId]);

  useEffect(() => {
    if (plan && creationStones > plan.maxCreationStones) {
      setCreationStones(plan.maxCreationStones);
    }
  }, [creationStones, plan]);

  if (equipmentItems.length === 0) {
    return (
      <section className="enhancement-panel">
        <div className="enhancement-head">
          <Hammer size={18} />
          <div>
            <strong>Aprimorar equipamento</strong>
            <span>Este ferreiro trabalha de {rangeLabel}. Nenhum equipamento no inventario.</span>
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

      <label className="enhancement-field">
        <span>Equipamento</span>
        <select value={selectedInstanceId} onChange={(event) => setSelectedInstanceId(event.target.value)}>
          {equipmentItems.map((entry) => {
            const item = game.itemCatalog[entry.itemId];
            return (
              <option key={entry.instanceId} value={entry.instanceId}>
                {formatInventoryItemName(item, entry)}{isItemEquipped(game, entry.instanceId) ? " (equipado)" : ""}
              </option>
            );
          })}
        </select>
      </label>

      {selectedEntry && selectedItem && plan && currentStats && nextStats && (
        <div className="enhancement-grid">
          <div className="enhancement-item-card">
            <ItemVisual item={selectedItem} className="enhancement-item-visual" enhancementLevel={selectedEntry.enhancementLevel} rarity={selectedEntry.rarity} />
            <div>
              <strong>{formatInventoryItemName(selectedItem, selectedEntry)}</strong>
              <span>Proximo: +{plan.nextLevel}</span>
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
                  {item?.name ?? requirement.itemId}: {owned}/{requirement.quantity}
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
              <span>Pedras de Criacao (+{ENHANCEMENT_CREATION_STONE_BONUS}% cada)</span>
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
            disabled={!canEnhance}
            title={plan.allowed ? "Aprimorar equipamento" : plan.blockReason}
            onClick={() => socket.emit("blacksmith:enhance", { instanceId: selectedEntry.instanceId, creationStones: plan.creationStones })}
          >
            Aprimorar
          </button>
        </div>
      )}
    </section>
  );
}

function DungeonPanel({ game }: { game: GameState }) {
  const dungeonMonsters = (game.currentCity.dungeonMonsterIds ?? [])
    .map((id) => game.cityMonsters.find((monster) => monster.id === id))
    .filter(Boolean) as GameState["cityMonsters"];

  return (
    <section className="content-panel">
      <PanelTitle icon={<Star size={20} />} title="Masmorra" />
      <div className="list-grid monster-battle-list">
        {dungeonMonsters.length === 0 && <p className="empty-state">Não há masmorra nesta cidade.</p>}
        {dungeonMonsters.map((monster) => {
          const energyCost = monster.level + 1;
          const blocked = game.character.currentHp <= 0 || game.character.currentEnergy < energyCost;
          return (
            <article className="entity-card monster-card" key={monster.id}>
              <div>
                <strong>{monster.name}</strong>
                <span>Nível {monster.level}</span>
              </div>
              <MonsterVisual monster={monster} className="entity-art" />
              <div className="monster-stats">
                <small title="Vida"><Heart size={13} style={{ color: "var(--red)" }} /> {monster.maxHp}</small>
                <small title="Forca"><Swords size={13} style={{ color: "var(--purple)" }} /> {monster.strength}</small>
                <small title="Defesa"><Shield size={13} style={{ color: "var(--cyan)" }} /> {monster.defense}</small>
                <small title="Agilidade"><Crosshair size={13} style={{ color: "var(--gold)" }} /> {monster.agility}</small>
                <small title="Energia"><Zap size={13} style={{ color: "var(--yellow)" }} /> {energyCost}</small>
              </div>
              <button className="primary-button" disabled={blocked} onClick={() => socket.emit("dungeon:start", { monsterId: monster.id })}>
                Entrar
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function MonarchPanel({ game }: { game: GameState }) {
  const event = game.monarchEvent;
  const highKeys = countInventoryItem(game, "misc_high_dungeon_key");
  if (!event) {
    return (
      <section className="content-panel monarch-panel">
        <PanelTitle icon={<Crown size={20} />} title="Monarca de Morthaly" />
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
          ? "Limite diario atingido"
          : highKeys <= 0
            ? "Precisa de Chave de Masmorra Avancada"
            : game.character.currentHp <= 0
              ? "Recupere sua vida"
              : "";
  const canStart = !blockedReason;
  return (
    <section className="content-panel monarch-panel">
      <PanelTitle icon={<Crown size={20} />} title="Monarca de Morthaly" />
      <div className={event.isKing ? "monarch-hero king" : "monarch-hero"}>
        <AssetImage src={event.imageUrl} alt={event.name} fallback={<Crown size={44} />} />
        <div className="monarch-hero-copy">
          <span className="eyebrow">{event.title}</span>
          <h2>{event.name}</h2>
          <p>
            Cada dano causado por qualquer recruta reduz a vida global do monarca em tempo real.
            {event.isKing ? " As recompensas do Rei Litch sao triplicadas." : ""}
          </p>
          <div className="monarch-hp">
            <div className="hp-bar">
              <span style={{ width: `${hpPercent}%` }} />
            </div>
            <strong>{event.currentHp.toLocaleString()} / {event.maxHp.toLocaleString()} vida</strong>
          </div>
          <div className="monster-stats">
            <small title="Nivel"><Star size={13} /> {event.level}</small>
            <small title="Forca"><Swords size={13} /> {event.strength}</small>
            <small title="Defesa"><Shield size={13} /> {event.defense}</small>
            <small title="Agilidade"><Crosshair size={13} /> {event.agility}</small>
          </div>
          <div className="monarch-entry-row">
            <span>Entradas hoje: <strong>{event.attemptsUsed}/{event.attemptsLimit}</strong></span>
            <span>Chaves: <strong>{highKeys}</strong></span>
          </div>
          <button className="primary-button" disabled={!canStart} onClick={() => socket.emit("monarch:start")}>
            {canStart ? <><Swords size={17} /> Enfrentar monarca</> : blockedReason}
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
  const [activeTab, setActiveTab] = useState<"level" | "arena" | "clans">("level");

  return (
    <section className="content-panel rankings-panel">
      <PanelTitle icon={<Trophy size={20} />} title="Ranking" />
      <div className="rankings-tabs">
        <button type="button" className={activeTab === "level" ? "mini-tab active" : "mini-tab"} onClick={() => setActiveTab("level")}>Nível</button>
        <button type="button" className={activeTab === "arena" ? "mini-tab active" : "mini-tab"} onClick={() => setActiveTab("arena")}>Arena</button>
        <button type="button" className={activeTab === "clans" ? "mini-tab active" : "mini-tab"} onClick={() => setActiveTab("clans")}>Clãs</button>
      </div>
      {activeTab === "level" && <RankingList title="Nível" entries={game.rankings.level} mode="level" />}
      {activeTab === "arena" && <RankingList title="Arena" entries={game.rankings.arena} mode="arena" />}
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
            <b>{mode === "level" ? `Nível ${entry.level}` : `${entry.arenaWins}V/${entry.arenaLosses}D`}</b>
          </article>
        ))}
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
                <small className="clan-leader-clickable">Lider: <PlayerName playerId={entry.leaderPlayerId} name={entry.leaderName} /></small>
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

function TalentTreeView({ game, compact = false }: { game: GameState; compact?: boolean }) {
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

  return (
    <div className={compact ? "talents-panel compact-talents" : "talents-panel"}>
      <div className="talent-summary">
        <span>{game.derived.availableTalentPoints} pontos livres</span>
        <button className="ghost-button" onClick={() => socket.emit("talent:reset", { method: "diamonds" })}>
          Resetar 25 <Gem size={13} style={{ color: "var(--cyan)" }} />
        </button>
        <button className="ghost-button" onClick={() => socket.emit("talent:reset", { method: "scroll" })}>
          Usar pergaminho
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

  return (
    <section className="content-panel">
      <PanelTitle icon={<Gem size={20} style={{ color: "var(--cyan)" }} />} title="Loja do Jogo" />
      <div className="shop-grid">
        {packages.map((pack) => (
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

function getClanCrestIcon(icon?: string, size = 18) {
  switch (icon) {
    case "swords":
      return <Swords size={size} />;
    case "star":
      return <Star size={size} />;
    case "gem":
      return <Gem size={size} />;
    case "castle":
      return <Castle size={size} />;
    case "trophy":
      return <Trophy size={size} />;
    case "crown":
      return <Crown size={size} />;
    case "flame":
      return <Flame size={size} />;
    case "flag":
      return <Flag size={size} />;
    case "skull":
      return <Skull size={size} />;
    case "shield":
    default:
      return <Shield size={size} />;
  }
}

function getClanCrestLabel(icon: string) {
  const labels: Record<string, string> = {
    shield: "Escudo",
    swords: "Espadas",
    star: "Estrela",
    gem: "Gema",
    castle: "Castelo",
    trophy: "Troféu",
    crown: "Coroa",
    flame: "Chama",
    flag: "Bandeira",
    skull: "Caveira"
  };
  return labels[icon] ?? "Escudo";
}

function ClanPanel({ game }: { game: GameState }) {
  const [activeTab, setActiveTab] = useState<"benefits" | "members" | "admin">("benefits");
  const [name, setName] = useState("");
  const [crestIcon, setCrestIcon] = useState<(typeof CLAN_CREST_OPTIONS)[number]>("shield");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editName, setEditName] = useState("");
  const [editCrestIcon, setEditCrestIcon] = useState<(typeof CLAN_CREST_OPTIONS)[number]>("shield");
  const [gold, setGold] = useState(0);
  const [diamonds, setDiamonds] = useState(0);
  const clan = game.clan;

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
    setEditCrestIcon(
      CLAN_CREST_OPTIONS.includes(clan.icon as (typeof CLAN_CREST_OPTIONS)[number])
        ? (clan.icon as (typeof CLAN_CREST_OPTIONS)[number])
        : "shield"
    );
  }, [clan?.id, clan?.name, clan?.icon]);

  useEffect(() => {
    if (activeTab === "admin" && !leader) {
      setActiveTab("benefits");
    }
  }, [activeTab, leader]);

  if (!clan) {
    const levelReq = 15;
    const diamondCost = 10;
    const canCreateClan = game.character.level >= levelReq && game.character.diamonds >= diamondCost && name.trim().length >= 3;
    const levelOk = game.character.level >= levelReq;
    const diamondsOk = game.character.diamonds >= diamondCost;

    return (
      <section className="content-panel clan-panel">
        <PanelTitle icon={<Users size={20} />} title="Clã" />
        <div className="clan-create-section">
          <button
            className="primary-button clan-create-button"
            disabled={!levelOk || !diamondsOk}
            onClick={() => setShowCreateForm(!showCreateForm)}
            title={!levelOk || !diamondsOk ? `Requer nível ${levelReq} e ${diamondCost} diamantes` : ""}
          >
            <ChevronRight size={16} style={{ transform: showCreateForm ? "rotate(90deg)" : "none", transition: "transform 200ms" }} />
            Criar novo clã
          </button>
          {!levelOk || !diamondsOk ? (
            <p className="market-form-hint requirement-hint">
              ⚠️ Requer nível {levelReq} {!levelOk && `(atual: ${game.character.level})`} e {diamondCost} <Gem size={12} style={{ color: "var(--cyan)" }} /> {!diamondsOk && `(atual: ${game.character.diamonds})`}
            </p>
          ) : null}
        </div>
        {showCreateForm && (levelOk && diamondsOk) && (
          <form className="market-form clan-create-form" onSubmit={createClan}>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome do clã" maxLength={28} autoFocus />
            <div className="crest-picker" aria-label="Brasao do cla">
              {CLAN_CREST_OPTIONS.map((icon) => (
                <button
                  type="button"
                  className={crestIcon === icon ? "crest-option selected" : "crest-option"}
                  key={icon}
                  title={getClanCrestLabel(icon)}
                  onClick={() => setCrestIcon(icon)}
                >
                  {getClanCrestIcon(icon)}
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
                  <span className="clan-leader-clickable">Lider: <PlayerName playerId={entry.leaderPlayerId} name={entry.leaderName} /> - Nv {entry.level}</span>
                  <span>Líder: {entry.leaderName} - Nv {entry.level}</span>
                </div>
                <b>{entry.memberCount}/{entry.memberCapacity}</b>
                <button className="ghost-button" onClick={() => socket.emit("clan:join", { clanId: entry.id })}>
                  Entrar
                </button>
              </article>
            ))}
          </div>
        </section>
      </section>
    );
  }

  const updateClanProfile = (event: FormEvent) => {
    event.preventDefault();
    socket.emit("clan:update", { name: editName, icon: editCrestIcon });
  };

  return (
    <section className="content-panel clan-panel">
      <PanelTitle icon={getClanCrestIcon(clan.icon, 20)} title={clan.name} />
      <div className="clan-summary">
        <Metric icon={<Trophy size={18} />} label="Nível" value={clan.level} />
        <Metric icon={<Users size={18} />} label="Membros" value={`${clanMembers.length}/${clan.memberCapacity}`} />
        <Metric icon={<Coins size={18} style={{ color: "var(--gold)" }} />} label="Tesouro" value={clan.gold} />
        <Metric icon={<Gem size={18} style={{ color: "var(--cyan)" }} />} label="Diamantes" value={clan.diamonds} />
        <Metric icon={<Shield size={18} />} label="Líder" value={leader ? "Você" : "Clã"} />
      </div>

      <form className="market-form" onSubmit={donate}>
        <Coins width={50} size={18} style={{ color: "var(--gold)" }} />
        <input type="number" min={0} value={gold} onChange={(event) => setGold(Number(event.target.value))} aria-label="Ouro" />
        <Gem width={50} size={18} style={{ color: "var(--cyan)" }} />
        <input
          type="number"
          min={0}
          value={diamonds}
          onChange={(event) => setDiamonds(Number(event.target.value))}
          aria-label="Diamantes"
        />
        <button className="primary-button" disabled={gold <= 0 && diamonds <= 0}>
          Doar
        </button>
      </form>

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
              <span>Altere o nome e o brasão do clã.</span>
            </div>
            <input value={editName} onChange={(event) => setEditName(event.target.value)} maxLength={28} placeholder="Nome do clã" />
            <div className="crest-picker" aria-label="Brasao do cla">
              {CLAN_CREST_OPTIONS.map((icon) => (
                <button
                  type="button"
                  className={editCrestIcon === icon ? "crest-option selected" : "crest-option"}
                  key={icon}
                  title={getClanCrestLabel(icon)}
                  onClick={() => setEditCrestIcon(icon)}
                >
                  {getClanCrestIcon(icon)}
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
                if (window.confirm("Resetar todos os beneficios do cla por 1000 diamantes?")) {
                  socket.emit("clan:benefit:reset");
                }
              }}
            >
              Resetar
            </button>
          </section>
        </>
      )}
    </section>
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
        <h3>Super-beneficios</h3>
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
      label: "Critico",
      value: (ranks.clan_crit_1 ?? 0) * 0.5 + (ranks.clan_crit_2 ?? 0) * 0.5 + (combatSuperActive ? 3 : 0),
      suffix: "%",
      icon: <Crosshair size={15} />
    },
    {
      id: "crit-damage",
      label: "Dano critico",
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
      label: "Inventario",
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
        <strong>Total de bonus adquiridos</strong>
        <span>{bonuses.length ? "Soma dos ranks comprados pelo cla." : "Nenhum beneficio comprado ainda."}</span>
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
  const [selectedLocationId, setSelectedLocationId] = useState(game.cityHuntLocations[0]?.id ?? "");
  const selectedLocation =
    game.cityHuntLocations.find((location) => location.id === selectedLocationId) ?? game.cityHuntLocations[0] ?? null;
  const monsters = selectedLocation
    ? (selectedLocation.monsterIds
        .map((id) => game.cityMonsters.find((monster) => monster.id === id))
        .filter(Boolean) as GameState["cityMonsters"])
    : [];

  useEffect(() => {
    if (!game.cityHuntLocations.some((location) => location.id === selectedLocationId)) {
      setSelectedLocationId(game.cityHuntLocations[0]?.id ?? "");
    }
  }, [game.cityHuntLocations, selectedLocationId]);

  return (
    <section className="content-panel">
      <PanelTitle icon={<Swords size={20} />} title="Caçar" />
      <div className="hunt-location-tabs">
        {game.cityHuntLocations.map((location) => (
          <button
            key={location.id}
            className={selectedLocation?.id === location.id ? "mini-tab active" : "mini-tab"}
            onClick={() => setSelectedLocationId(location.id)}
          >
            {location.name}
          </button>
        ))}
      </div>
      {selectedLocation && (
        <div className="hunt-location-banner">
          <strong>{selectedLocation.name}</strong>
          <span>{selectedLocation.description}</span>
        </div>
      )}
      <div className="list-grid monster-battle-list">
        {monsters.length === 0 && <p className="empty-state">Nenhum local de caça disponível nesta cidade.</p>}
        {monsters.map((monster) => {
          const blocked = game.character.currentHp <= 0 || game.character.currentEnergy < monster.level;
          return (
            <article className="entity-card monster-card" key={monster.id}>
              <MonsterVisual monster={monster} className="entity-art" />
              <div>
                <strong>{monster.name}</strong>
                <span>Nv {monster.level}</span>
              </div>
              <div className="monster-stats">
                <small title="Vida"><Heart size={13} style={{ color: "var(--red)" }} /> {monster.maxHp}</small>
                <small title="Forca"><Swords size={13} style={{ color: "var(--purple)" }} /> {monster.strength}</small>
                <small title="Defesa"><Shield size={13} style={{ color: "var(--cyan)" }} /> {monster.defense}</small>
                <small title="Agilidade"><Crosshair size={13} style={{ color: "var(--yellow)" }} /> {monster.agility}</small>
              </div>
              <small className="monster-xp" title="XP do monstro"><Star size={13} style={{ color: "var(--gold)" }} /> {monster.experience}</small>
              <button
                className="atack-button primary-button"
                disabled={blocked}
                onClick={() => socket.emit("hunt:start", { monsterId: monster.id })}
              >
                <Swords size={13} /> Atacar
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ArenaPanel({ game }: { game: GameState }) {
  const queued = game.arenaQueueSize > 0;
  return (
    <section className="content-panel arena-panel">
      <PanelTitle icon={<Shield size={20} />} title="Arena" />
      <div className="arena-plate">
        <Shield size={44} />
        <h2>{queued ? "Aguardando adversário" : "Fila PvP"}</h2>
        <p>{game.arenaQueueSize} recruta(s) na fila</p>
        <div className="button-row">
          <button className="primary-button" onClick={() => socket.emit("arena:join")}>
            Entrar na fila
          </button>
          <button className="ghost-button" onClick={() => socket.emit("arena:leave")}>
            Sair
          </button>
        </div>
      </div>
    </section>
  );
}

function ShopPanel({ game, shop }: { game: GameState; shop: "armorer" | "apothecary" | "moneyChanger" }) {
  const itemIds =
    shop === "armorer"
      ? game.currentCity.armorerItemIds
      : shop === "apothecary"
        ? game.currentCity.apothecaryItemIds.filter((itemId) => {
            const item = game.itemCatalog[itemId];
            return item?.kind !== "scroll" && item?.kind !== "ticket";
          })
        : game.currentCity.moneyChangerItemIds ?? [];
  const sortedItemIds = [...itemIds].sort((leftId, rightId) => {
    const left = game.itemCatalog[leftId];
    const right = game.itemCatalog[rightId];
    return (left?.price ?? 0) - (right?.price ?? 0) || (left?.name ?? "").localeCompare(right?.name ?? "");
  });
  const title = shop === "armorer" ? "Armeiro" : shop === "apothecary" ? "Boticário" : "Cambista";
  const icon = shop === "armorer" ? <Gavel size={20} /> : shop === "apothecary" ? <FlaskConical size={20} /> : <Coins size={20} />;
  const npcName =
    shop === "armorer" ? game.currentCity.npcs.armorer : shop === "apothecary" ? game.currentCity.npcs.apothecary : game.currentCity.npcs.moneyChanger;
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const selectedItem = selectedItemId ? game.itemCatalog[selectedItemId] : null;

  return (
    <section className="content-panel">
      <PanelTitle icon={icon} title={title} />
      <div className="npc-banner">
        <User size={18} />
        <span>{npcName}</span>
      </div>
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
            />
          );
        })}
      </div>
      {selectedItem && (
        <ShopItemModal
          game={game}
          item={selectedItem}
          onClose={() => setSelectedItemId(null)}
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

  const renderSelect = (
    slot: QuickPotionSlot,
    icon: React.ReactNode,
    label: string,
    options: PotionQuickOption[],
    selected: PotionQuickOption | null
  ) => (
    <label className="quick-potion-field">
      <span>{icon} {label}</span>
      <select
        value={selected?.itemId ?? ""}
        disabled={options.length === 0}
        onChange={(event) => setPreference(slot, event.target.value)}
      >
        {options.length === 0 ? (
          <option value="">Nenhuma</option>
        ) : (
          options.map((option) => (
            <option key={option.itemId} value={option.itemId}>
              {option.definition.name} x{option.quantity} - {getPotionEffectLabel(option.definition, slot)}
            </option>
          ))
        )}
      </select>
    </label>
  );

  return (
    <section className="quick-potion-settings">
      <div>
        <strong>Uso rapido</strong>
        <small>Escolha qual pocao os atalhos de batalha e detalhes vao consumir.</small>
      </div>
      <div className="quick-potion-fields">
        {renderSelect("health", <Heart size={14} />, "Vida", healthOptions, selectedHealth)}
        {renderSelect("energy", <Zap size={14} />, "Energia", energyOptions, selectedEnergy)}
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
    .reduce<Record<string, { instanceId: string; itemId: string; quantity: number }>>((acc, inv) => {
      if (!acc[inv.itemId]) acc[inv.itemId] = { instanceId: inv.instanceId, itemId: inv.itemId, quantity: 0 };
      acc[inv.itemId].quantity += inv.quantity;
      return acc;
    }, {});
  const filledSlots = [...equipmentItems, ...Object.values(stackableMap)];

  // Pad to exactly 40 slots (5 columns × 8 rows)
  const TOTAL_SLOTS = 40;
  const slots: Array<{ instanceId: string; itemId: string; quantity: number; enhancementLevel?: number; rarity?: Rarity } | null> = [
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
      <PanelTitle icon={<Backpack size={20} />} title="Inventário" />
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
          return (
            <button
              key={slot.instanceId}
              className={`inv-slot${equipped ? " equipped" : ""}${selected ? " selected" : ""}`}
              title={formatInventoryItemName(item, slot)}
              style={{ borderColor: rarityColor }}
              onClick={() => setSelectedInstanceId(selected ? null : slot.instanceId)}
            >
              <ItemVisual item={item} className="slot-visual" quantity={slot.quantity} enhancementLevel={slot.enhancementLevel} rarity={slot.rarity} />
            </button>
          );
        })}
      </div>

      {selectedEntry && selectedItem && (
        <div className="inv-action-bar">
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
            <button className="ghost-button" onClick={() => setSelectedInstanceId(null)}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function TravelPanel({ game }: { game: GameState }) {
  const currentCountryCities = game.cities.filter((city) => city.countryId === game.currentCountry.id);
  const trainTickets = countInventoryItem(game, TRAIN_TICKET_ID);
  const shipTickets = countInventoryItem(game, SHIP_TICKET_ID);
  const mapCities = game.cities.filter((city) => TRAVEL_MAP_POINTS[city.id]);
  const [selectedTravelCityId, setSelectedTravelCityId] = useState(game.character.cityId);
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
    const ticketCount = sameCountry ? trainTickets : shipTickets;
    const ticketLabel = sameCountry
      ? game.itemCatalog[TRAIN_TICKET_ID]?.name ?? "Ticket de Trem"
      : game.itemCatalog[SHIP_TICKET_ID]?.name ?? "Ticket de Navio";
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

    return { city, destinationCity, destinationCountry, portCity, sameCountry, blockedByForeignInterior, current, locked, reason, actionLabel, ticketLabel };
  };
  const selectedTravelCity = game.cities.find((city) => city.id === selectedTravelCityId) ?? game.currentCity;
  const selectedRoute = getTravelRoute(selectedTravelCity.id);

  useEffect(() => {
    if (!game.cities.some((city) => city.id === selectedTravelCityId)) {
      setSelectedTravelCityId(game.character.cityId);
    }
  }, [game.character.cityId, game.cities, selectedTravelCityId]);

  return (
    <section className="content-panel travel-panel">
      <PanelTitle icon={<MapPinned size={20} />} title="Viajar" />
      <div className="travel-ticket-summary">
        <span>{game.itemCatalog[TRAIN_TICKET_ID]?.name ?? "Ticket de Trem"}: <strong>{trainTickets}</strong></span>
        <span>{game.itemCatalog[SHIP_TICKET_ID]?.name ?? "Ticket de Navio"}: <strong>{shipTickets}</strong></span>
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
              selectedTravelCity.id === city.id ? "selected" : "",
              route.current ? "current" : "",
              route.locked ? "locked" : "",
              city.isPort ? "port" : "",
              route.sameCountry ? "land-route" : "sea-route"
            ].filter(Boolean).join(" ");
            return (
              <button
                className={classes}
                key={city.id}
                onClick={() => setSelectedTravelCityId(city.id)}
                style={{ left: `${position.x}%`, top: `${position.y}%` }}
                title={`${city.name} - ${route.reason}`}
                type="button"
              >
                <span className="travel-map-icon">
                  {city.isPort ? <Ship size={14} /> : <MapPinned size={14} />}
                </span>
                <span className="travel-map-name">
                  <strong>{city.name}</strong>
                </span>
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
        <article className="travel-selection-card">
          <div className="travel-selection-heading">
            <span className={selectedTravelCity.isPort ? "travel-selection-kicker port" : "travel-selection-kicker"}>
              {selectedTravelCity.isPort ? <Ship size={15} /> : <MapPinned size={15} />}
              {selectedTravelCity.isPort ? "Porto" : "Cidade"}
            </span>
            <div>
              <h3>{selectedTravelCity.name}</h3>
              <small>{selectedRoute.destinationCountry?.name ?? game.currentCountry.name}</small>
            </div>
          </div>
          <p>{selectedTravelCity.description}</p>
          <div className="travel-selection-meta">
            <span>Nivel minimo <strong>{selectedRoute.destinationCity.minLevel}</strong></span>
            <span>{selectedRoute.sameCountry ? "Rota terrestre" : "Rota maritima"}</span>
            <span>{selectedRoute.current ? "Atual" : selectedRoute.ticketLabel}</span>
          </div>
          {selectedRoute.blockedByForeignInterior && (
            <p className="travel-selection-warning">
              Para visitar cidades internas de outro pais, desembarque antes em {selectedRoute.portCity?.name ?? "seu porto"}.
            </p>
          )}
          {!selectedRoute.sameCountry && !selectedRoute.blockedByForeignInterior && !selectedRoute.current && (
            <p className="travel-selection-warning subtle">
              A viagem entre paises usa navio e chega diretamente ao porto selecionado.
            </p>
          )}
          <button
            className="primary-button"
            disabled={selectedRoute.current || selectedRoute.locked}
            onClick={() => socket.emit("city:travel", { cityId: selectedRoute.destinationCity.id })}
          >
            {selectedRoute.actionLabel}
          </button>
        </article>
      )}

      <h3 className="city-group-title">Cidades de {game.currentCountry.name}</h3>
      <div className="list-grid">
        {currentCountryCities.map((city) => {
          const current = city.id === game.character.cityId;
          const locked = !current && (trainTickets <= 0 || game.character.level < city.minLevel);
          return (
            <article className={current ? "entity-card current-city" : "entity-card"} key={city.id}>
              <div>
                <strong>{city.name}{city.isPort ? " (Porto)" : ""}</strong>
                <span>Nível mínimo {city.minLevel}</span>
              </div>
              <p>{city.description}</p>
              <button
                className="primary-button"
                disabled={current || locked}
                onClick={() => socket.emit("city:travel", { cityId: city.id })}
              >
                {current ? "Atual" : "Usar ticket de trem"}
              </button>
            </article>
          );
        })}
      </div>
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
      <PanelTitle icon={<ShoppingBag size={20} />} title="Mercado de Trocas" />
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
                    <ShoppingBag size={16} /> Todos
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
                return (
                  <button
                    key={slot.instanceId}
                    type="button"
                    className={`inv-slot${selected ? " selected" : ""}`}
                    title={formatInventoryItemName(item, slot)}
                    style={{ borderColor: rarityColor }}
                    onClick={() => setInstanceId(selected ? "" : slot.instanceId)}
                  >
                    <ItemVisual
                      item={item}
                      className="slot-visual"
                      quantity={slot.quantity > 1 ? slot.quantity : undefined}
                      enhancementLevel={slot.enhancementLevel}
                      rarity={slot.rarity}
                    />
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
  const rematchMonsterId = getBattleMonsterId(battle);
  const rematchMonster = rematchMonsterId ? game.cityMonsters.find((monster) => monster.id === rematchMonsterId) : null;
  const rematchEnergyCost = rematchMonster ? rematchMonster.level + (battle.mode === "dungeon" ? 1 : 0) : 0;
  const canRematch =
    Boolean(rematchMonster) &&
    game.character.currentHp > 0 &&
    game.character.currentEnergy >= rematchEnergyCost &&
    (battle.mode === "pve" || battle.mode === "dungeon");
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
    if (playerWon && rematchMonsterId && canRematch) {
      const key = `${battle.id}:${battle.updatedAt}:next`;
      if (lastAutoPveStepKeyRef.current === key) {
        return;
      }
      lastAutoPveStepKeyRef.current = key;
      socket.emit(battle.mode === "dungeon" ? "dungeon:start" : "hunt:start", { monsterId: rematchMonsterId });
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
        icon={<Swords size={20} />}
        title={battle.mode === "pvp" ? "Arena PvP" : battle.mode === "dungeon" ? "Masmorra" : battle.mode === "monarch" ? "Monarca" : "Batalha PvE"}
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
      {battle.status === "active" && (
        <BattlePotionDock
          battleId={battle.id}
          healthPotion={healthPotion}
          energyPotion={energyPotion}
          canAct={myTurn && !animationsPending}
          hpFull={game.character.currentHp >= game.derived.maxHp}
          energyFull={game.character.currentEnergy >= game.derived.maxEnergy}
        />
      )}
      <div className="battle-actions">
        {battle.status === "active" ? (
          <>
            <button
              className="primary-button atack-button"
              disabled={!myTurn || animationsPending}
              onClick={() => socket.emit("battle:action", { battleId: battle.id, action: "attack" })}
            >
              <Swords size={13} /> Atacar
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
              <AssetImage style={{ width: 27 }} src={"assets/items/potions/health.png"} alt={"Poção de vida"} fallback={"?"} /> 
              <span style={{verticalAlign: "super"}}>Usar poção de vida</span>
            </button>
            <button className="danger-button battle-flee-button" disabled={animationsPending} onClick={() => socket.emit("battle:flee")}>
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
                  Continuar até acabar energia ou morrer
                </label>
                {!autoPveRunning && (
                  <button
                    className="ghost-button royal-auto-button"
                    disabled={!myTurn || animationsPending}
                    onClick={triggerAutoPve}
                  >
                    <Crown size={14} /> Auto PvE
                  </button>
                )}
              </>
            )}
          </>
        ) : (
          <>
            {animationsPending ? (
              <button className="ghost-button" disabled>
                Finalizando animações...
              </button>
            ) : (
              <>
                {rematchMonsterId && (battle.mode === "pve" || battle.mode === "dungeon") && (
                  <button
                    className="primary-button"
                    disabled={!canRematch || autoPveRunning}
                    onClick={() => socket.emit(battle.mode === "dungeon" ? "dungeon:start" : "hunt:start", { monsterId: rematchMonsterId })}
                  >
                    Enfrentar novamente
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
            <span className="battle-log-icon">{getBattleLogIcon(entry.text)}</span>
            <span>{renderTextWithPlayerLinks(entry.text, battle.participants)}</span>
          </p>
        ))}
      </div>
    </section>
  );
}

function BattlePotionDock({
  battleId,
  healthPotion,
  energyPotion,
  canAct,
  hpFull,
  energyFull
}: {
  battleId: string;
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
    socket.emit("battle:action", {
      battleId,
      action: "usePotion",
      instanceId: potion.inventoryItem.instanceId
    });
  };

  return (
    <aside className="battle-potion-dock" aria-label="Pocoes de batalha">
      <button
        className="battle-potion-button health"
        disabled={!canAct || !healthPotion || hpFull}
        title={healthPotion?.definition.name ?? "Nenhuma pocao de vida"}
        onClick={() => usePotion(healthPotion)}
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
        disabled={!canAct || !energyPotion || energyFull}
        title={energyPotion?.definition.name ?? "Nenhuma pocao de energia"}
        onClick={() => usePotion(energyPotion)}
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
          <strong><PlayerName playerId={participant.ownerPlayerId} name={participant.name} /></strong>
        ) : (
          <strong>{participant.name}</strong>
        )}
        <span>Nível {participant.level}</span>
      </div>
      <div className="hp-bar">
        <span style={{ width: `${hpPercent}%` }} />
      </div>
      <small>
        {participant.hp}/{participant.maxHp} vida
      </small>
      <div className="combat-stat-row">
        <span title="Forca"><Swords size={13} style={{ color: "var(--purple)" }} /> {participant.strength}</span>
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
  if (lower.includes("causou")) return lower.includes("crítico") || lower.includes("critico") || lower.includes("crã") ? "critical" : "damage";
  if (lower.includes("esquivou")) return "dodge";
  if (lower.includes("energia") && (lower.includes("usou") || lower.includes("recuperou"))) return "energy";
  if (lower.includes("usou") || lower.includes("recuperou")) return "heal";
  if (lower.includes("venceu")) return "victory";
  if (lower.includes("fugiu")) return "flee";
  if (lower.includes("recebeu") || lower.includes("xp") || lower.includes("ouro")) return "reward";
  if (lower.includes("encontrou") || lower.includes("caiu")) return "loot";
  return "event";
}

function getBattleLogIcon(text: string) {
  const kind = getBattleLogKind(text);
  if (kind === "critical") return <Flame size={15} />;
  if (kind === "damage") return <Swords size={15} />;
  if (kind === "dodge") return <Crosshair size={15} />;
  if (kind === "energy") return <Zap size={15} />;
  if (kind === "heal") return <Heart size={15} />;
  if (kind === "victory") return <Trophy size={15} />;
  if (kind === "flee") return <ArrowLeftRight size={15} />;
  if (kind === "reward") return <Coins size={15} />;
  if (kind === "loot") return <Sparkles size={15} />;
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

  const sendPrivate = (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim() || !privateTarget) return;
    socket.emit("private:send", { targetPlayerId: privateTarget.playerId, targetPlayerName: privateTarget.name, text: message });
    setMessage("");
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
    <div className={`floating-chat-layer country-${game.currentCountry.id}`}>
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
                {game.chatMessages.map((chat) => (
                  <article className="chat-message" key={chat.id}>
                    <strong><PlayerName playerId={chat.playerId} name={chat.author} /></strong>
                    <span>{chat.text}</span>
                  </article>
                ))}
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
                  <p className="muted" style={{ margin: "0 0 8px", fontSize: "0.85rem" }}>Selecione um recruta online:</p>
                  <div className="online-player-list">
                    {game.onlinePlayers
                      .filter((p) => p.playerId !== game.player.id)
                      .map((p) => (
                        <button key={p.playerId} className="ghost-button" onClick={() => setPrivateTarget(p)}>
                          <User size={14} /> {p.name}
                        </button>
                      ))}
                    {game.onlinePlayers.filter((p) => p.playerId !== game.player.id).length === 0 && (
                      <p className="empty-state">Nenhum recruta online.</p>
                    )}
                  </div>
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
                  <form className="chat-form" onSubmit={sendPrivate}>
                    <input value={message} onChange={(e) => setMessage(e.target.value)} maxLength={240} placeholder={`Mensagem para ${privateTarget.name}`} />
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

function AssetImage({ src, alt, fallback, style }: { src?: string; alt: string; fallback: React.ReactNode; style?: React.CSSProperties }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <span className="asset-fallback" aria-hidden="true" style={style}>{fallback}</span>;
  }

  return <img style={style} src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} />;
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
  return (
    <span className={`asset-frame item-visual ${className ?? ""}`} style={rarityColor ? { borderColor: rarityColor } : undefined}>
      <AssetImage src={item.imageUrl} alt={item.name} fallback={ITEM_KIND_EMOJI[item.kind] ?? "?"} />
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

function ShopItemCard({ item, onClick }: { item: ItemDefinition; onClick: () => void }) {
  return (
    <button className="shop-item-card" type="button" onClick={onClick} title={item.name}>
      <ItemVisual item={item} className="shop-card-image" />
      <strong>{item.name}</strong>
      <span className="shop-card-price">
        {formatCurrency(item.price)} <Coins size={13} style={{ color: "var(--gold)" }} />
      </span>
    </button>
  );
}

function ShopItemModal({
  game,
  item,
  onClose,
  onBuy
}: {
  game: GameState;
  item: ItemDefinition;
  onClose: () => void;
  onBuy: (quantity: number) => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const rarityColor = getEquipmentRarityColor(item);
  const canChooseQuantity = !item.slot;
  const purchaseQuantity = canChooseQuantity ? Math.max(1, Math.min(999, Math.floor(quantity || 1))) : 1;
  const totalPrice = item.price * purchaseQuantity;
  const blockedReason = getNpcShopBlockedReason(game, item, purchaseQuantity);

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
              <h4>Bonus</h4>
              <div className="stat-list">
                {item.stats.strength && <div><span>Forca</span> <strong>+{item.stats.strength}</strong></div>}
                {item.stats.constitution && <div><span>Constituicao</span> <strong>+{item.stats.constitution}</strong></div>}
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
              Nivel minimo: {item.minLevel} {item.minLevel > game.character.level && "(não alcancado)"}
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
                {formatCurrency(totalPrice)} <Coins size={16} style={{ color: "var(--gold)" }} />
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
      <strong>{value}</strong>
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
        <h2>Codigo de recuperacao</h2>
        <p>Guarde este codigo para redefinir sua senha depois.</p>
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
  if (reward.experience) entries.push(<span key="xp"><Star size={13} /> {formatCurrency(reward.experience)} XP</span>);
  if (reward.gold) entries.push(<span key="gold"><Coins size={13} /> {formatCurrency(reward.gold)} gold</span>);
  if (reward.diamonds) entries.push(<span key="diamonds"><Gem size={13} /> {formatCurrency(reward.diamonds)} diamantes</span>);
  if (reward.attributePoints) entries.push(<span key="attributes"><Sparkles size={13} /> {reward.attributePoints} ponto atributo</span>);
  for (const item of reward.items ?? []) {
    entries.push(
      <span key={item.itemId}>
        <Backpack size={13} /> {game.itemCatalog[item.itemId]?.name ?? item.itemId} x{item.quantity}
      </span>
    );
  }
  return entries.length > 0 ? entries : [<span key="none">Sem recompensa direta</span>];
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
    return `${normalized}min`;
  }
  const hours = Math.floor(normalized / 60);
  const remainingMinutes = normalized % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
}

function formatAptitudeHours(hours: number) {
  if (hours > 0 && hours < 1) {
    return `${Math.round(hours * 60)}min`;
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
    return "Inventario cheio";
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
      return val.toFixed(3).replace(/\,?0+$/, "") + suffix;
    }
  }
  return String(n);
}

function getEquipmentRarityColor(item: ItemDefinition, rarity?: Rarity) {
  if (!item.slot) return undefined;
  return RARITY_COLORS[rarity ?? item.rarity ?? "common"];
}
