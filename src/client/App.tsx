import { FormEvent, useEffect, useRef, useState } from "react";
import {
  ArrowLeftRight,
  Backpack,
  Castle,
  Coins,
  Crown,
  ChevronDown,
  ChevronRight,
  Flame,
  Flag,
  FlaskConical,
  Gavel,
  Gem,
  Hammer,
  Heart,
  KeyRound,
  Lock,
  LogIn,
  LogOut,
  Mail,
  MapPinned,
  MessageCircle,
  ScrollText,
  Send,
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
  Crosshair
} from "lucide-react";
import type {
  AttributeKey,
  Attributes,
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
  ClanBenefitCategory,
  TalentCategory,
  QuestView,
  Rarity,
  TalentDefinition
} from "../shared/types";
import { RARITY_PRICE_MULTIPLIER, RARITY_STAT_MULTIPLIER } from "../shared/rarity";
import { ATTRIBUTE_LABEL, EQUIPMENT_LABEL } from "../shared/types";
import cityMap from "./assets/city-map.svg";
import { socket } from "./socket";

type View =
  | "city"
  | "hunt"
  | "arena"
  | "armorer"
  | "apothecary"
  | "moneyChanger"
  | "travel"
  | "inventory"
  | "market"
  | "missions"
  | "blacksmith"
  | "alchemist"
  | "dungeon"
  | "rankings"
  | "gameShop"
  | "clan";

type AuthMode = "login" | "register" | "forgot";

const viewLabels: Record<View, string> = {
  city: "Cidade",
  hunt: "Caçar",
  arena: "Arena",
  armorer: "Armeiro",
  apothecary: "Boticário",
  moneyChanger: "Cambista",
  travel: "Viajar",
  inventory: "Inventário",
  market: "Mercado",
  missions: "Missões",
  blacksmith: "Ferreiro",
  alchemist: "Alquimista",
  dungeon: "Masmorra",
  rankings: "Ranking",
  gameShop: "Loja do Jogo",
  clan: "Clã"
};

const attributes: AttributeKey[] = ["strength", "constitution", "agility"];
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

const ENHANCEMENT_GOLD_STEP = 10000;
const ENHANCEMENT_STAT_STEP = 0.2;
const ENHANCEMENT_CHANCE_STEP = 5;
const ENHANCEMENT_MIN_CHANCE = 5;
const ENHANCEMENT_CREATION_STONE_BONUS = 3;
const ENHANCEMENT_ITEMS = {
  oldStone: "material_old_stone",
  eranStone: "material_eran_fragment",
  celena: "material_celena",
  midran: "material_midran",
  creationStone: "misc_stone_craft"
} as const;
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

export function App() {
  const [game, setGame] = useState<GameState | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [latestRecoveryCode, setLatestRecoveryCode] = useState<string | null>(null);
  const [view, setView] = useState<View>("city");
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(socket.connected);
  const [showDetails, setShowDetails] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showExchange, setShowExchange] = useState(false);
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

    const onError = (payload: { message: string }) => {
      setError(payload.message);
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

  const submitAuth = (event: FormEvent) => {
    event.preventDefault();
    setLatestRecoveryCode(null);
    if (authMode === "login") {
      socket.emit("auth:login", { email, password });
      return;
    }
    if (authMode === "register") {
      socket.emit("auth:register", { username, email, password });
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

  const canSubmitAuth =
    connected &&
    email.trim().length > 0 &&
    (authMode === "forgot" ? newPassword.length >= 6 && recoveryCode.trim().length > 0 : password.length >= 6) &&
    (authMode !== "register" || username.trim().length >= 3);

  if (!game) {
    return (
      <main className="auth-screen">
        <form className="auth-panel" onSubmit={submitAuth}>
          <h1 className="sr-only">Litch RPG</h1>
          <img className="auth-wordmark" src={BRAND_WORDMARK_URL} alt="Litch RPG" />
          <div className="auth-tabs">
            <button type="button" className={authMode === "login" ? "active" : ""} onClick={() => setAuthMode("login")}>
              <LogIn size={15} /> Entrar
            </button>
            <button type="button" className={authMode === "register" ? "active" : ""} onClick={() => setAuthMode("register")}>
              <UserPlus size={15} /> Cadastro
            </button>
            <button type="button" className={authMode === "forgot" ? "active" : ""} onClick={() => setAuthMode("forgot")}>
              <KeyRound size={15} /> Senha
            </button>
          </div>
          {authMode === "register" && (
            <label>
              <span className="auth-label"><User size={15} /> Nome do jogador</span>
              <input
                value={username}
                maxLength={24}
                autoComplete="username"
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Ex: Arthen"
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

  return (
    <main className={gameShellClass}>
      <Header
        game={game}
        connected={connected}
        regenMs={regenMs}
        onDetails={() => setShowDetails(true)}
        onGameShop={() => setView("gameShop")}
        onExchange={() => setShowExchange(true)}
        onRanking={() => setView("rankings")}
        onLogout={logout}
      />
      <div className={game.activeBattle ? "game-grid in-battle" : "game-grid"}>
        <section className="city-stage">
          {!game.activeBattle && view === "city" && <CityHero game={game} view={view} setView={setView} />}
          <GamePane game={game} view={view} setView={setView} />
        </section>
      </div>
      <BottomNav game={game} view={view} setView={setView} />
      {!game.activeBattle && <FloatingChat game={game} open={showChat} setOpen={setShowChat} />}
      {showDetails && <CharacterDrawer game={game} onClose={() => setShowDetails(false)} />}
      {showExchange && <CurrencyExchangeModal game={game} onClose={() => setShowExchange(false)} />}
      {latestRecoveryCode && <RecoveryCodeModal code={latestRecoveryCode} onClose={() => setLatestRecoveryCode(null)} />}
      {error && <Toast message={error} />}
    </main>
  );
}

function Header({
  game,
  connected,
  regenMs,
  onDetails,
  onGameShop,
  onExchange,
  onRanking,
  onLogout
}: {
  game: GameState;
  connected: boolean;
  regenMs: number;
  onDetails: () => void;
  onGameShop: () => void;
  onExchange: () => void;
  onRanking: () => void;
  onLogout: () => void;
}) {
  const nextXp = game.character.level * 120;
  const xpProgress = Math.min(100, Math.round((game.character.experience / nextXp) * 100));
  const hpProgress = Math.min(100, Math.round((game.character.currentHp / game.derived.maxHp) * 100));
  const energyProgress = Math.min(100, Math.round((game.character.currentEnergy / game.derived.maxEnergy) * 100));
  const regenSecs = Math.ceil(regenMs / 1000);
  const regenMins = Math.floor(regenSecs / 60);
  const regenSecsRemainder = regenSecs % 60;
  const timerLabel = `${regenMins}:${String(regenSecsRemainder).padStart(2, "0")}`;
  const royalSealActive = isRoyalSealActive(game);

  return (
    <header className="topbar">
      <div className="title-lockup">
        <img className="title-lockup-logo" src={BRAND_ICON_URL} alt="" />
        <div>
          <strong>Litch RPG</strong>
          <span>{game.currentCity.name}</span>
        </div>
      </div>
      <button className="character-chip" onClick={onDetails} title="Detalhes do personagem">
        <span className="character-chip-avatar">
          <User size={20} />
          {royalSealActive && <i className="royal-seal-mini"><Crown size={10} /></i>}
        </span>
        <strong>{game.character.name}</strong>
        <small>Nv {game.character.level} — {game.currentCity.name}</small>
        {game.clan && (
          <small className="character-chip-clan">
            {getClanCrestIcon(game.clan.icon, 11)} {game.clan.name}
          </small>
        )}
      </button>
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
      </div>
      <div className="top-economy">
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
        <button className="stat-pill stat-action logout-action" title="Deslogar" aria-label="Deslogar" onClick={onLogout}>
          <LogOut size={17} style={{ color: "var(--red)" }} />
        </button>
        <span className={connected ? "status-dot online" : "status-dot"}>{connected ? "Online" : "Offline"}</span>
      </div>
      <ResourceBar
        className="xp"
        icon={<Star size={15} style={{ color: "var(--purple)" }} />}
        value={`${game.character.experience}/${nextXp}`}
        progress={xpProgress}
      />
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
  const completedMissions = countClaimable(game.quests.daily) + countClaimable(game.quests.fixed);
  const myListings = game.marketplaceListings.filter((l) => l.sellerPlayerId === game.player.id).length;

  const items = [
    { view: "city" as View, label: "Cidade", icon: <Castle size={20} />, disabled: locked, badge: null },
    { view: "hunt" as View, label: "Caça", icon: <Swords size={20} />, disabled: locked, badge: null },
    { view: "arena" as View, label: "Arena", icon: <Shield size={20} />, disabled: locked, badge: game.arenaQueueSize > 0 ? game.arenaQueueSize : null },
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

function CharacterPanel({ game, locked = false }: { game: GameState; locked?: boolean }) {
  const [pending, setPending] = useState<Attributes>({ strength: 0, constitution: 0, agility: 0 });
  const pendingTotal = pending.strength + pending.constitution + pending.agility;
  const healthPotion = game.character.inventory.find((item) => game.itemCatalog[item.itemId]?.stats.healPercent);
  const energyPotion = game.character.inventory.find((item) => game.itemCatalog[item.itemId]?.stats.energyPercent);
  const royalSealActive = isRoyalSealActive(game);
  const autoPveActive = isAutoPveActive(game);
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

  return (
    <aside className="side-panel character-panel">
      <div className="avatar-ring">
        <User size={42} />
        {royalSealActive && <span className="royal-seal"><Crown size={15} /> Selo do Rei</span>}
      </div>
      <h2>{game.character.name}</h2>
      <p className="muted">Nível {game.character.level} — {game.currentCity.name}</p>
      {autoPveActive && <p className="royal-status"><Crown size={14} /> Amigo do Rei ativo</p>}
      {game.clan && (
        <div className="character-clan-info">
          <span className="character-clan-crest">{getClanCrestIcon(game.clan.icon, 18)}</span>
          <div>
            <strong>{game.clan.name}</strong>
            <small>{game.clan.leaderPlayerId === game.player.id ? "Líder do clã" : "Membro do clã"}</small>
          </div>
        </div>
      )}

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
            className="ghost-button potion-btn"
            disabled={locked || !healthPotion || game.character.currentHp >= game.derived.maxHp}
            onClick={() => healthPotion && socket.emit("inventory:use", { instanceId: healthPotion.instanceId })}
          >
            <Heart size={14} /> Vida {healthPotion ? `x${healthPotion.quantity}` : "x0"}
          </button>
          <button
            className="ghost-button potion-btn"
            disabled={locked || !energyPotion || game.character.currentEnergy >= game.derived.maxEnergy}
            onClick={() => energyPotion && socket.emit("inventory:use", { instanceId: energyPotion.instanceId })}
          >
            <Zap size={14} /> Energia {energyPotion ? `x${energyPotion.quantity}` : "x0"}
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
            Reset 20 diamantes
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
              <span>{ATTRIBUTE_LABEL[attribute]}</span>
              <div>
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
  return (
    <header className="city-hero">
      <img src={cityMap} alt="" className="city-map" />
      <div className="city-copy">
        <span className="eyebrow">{viewLabels[view]}</span>
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

type CityOption = { view: View; icon: React.ReactNode; title: string; value: string };

function CityOptionCard({ option, setView }: { option: CityOption; setView: (v: View) => void }) {
  return (
    <button className="option-card" onClick={() => setView(option.view)}>
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
  const combatOptions: CityOption[] = [
    { view: "hunt", icon: <Swords size={24} />, title: "Caçar", value: `${game.cityHuntLocations.length} locais` },
    { view: "arena", icon: <Shield size={24} />, title: "Arena", value: `${game.arenaQueueSize} na fila` },
  ];
  if (game.currentCity.dungeonMonsterIds?.length) {
    combatOptions.push({ view: "dungeon", icon: <Star size={24} />, title: "Masmorra", value: `${game.currentCity.dungeonMonsterIds.length} desafios` });
  }

  const actionOptions: CityOption[] = [
    
  ];
  if (game.currentCity.blacksmithRecipeIds?.length || game.currentCity.blacksmithEnhancement) {
    actionOptions.push({ view: "blacksmith", icon: <Hammer size={24} />, title: "Ferreiro", value: game.currentCity.npcs.blacksmith ?? "Receitas" });
  }

  const inhabitantOptions: CityOption[] = [
    { view: "armorer", icon: <Gavel size={24} />, title: "Armeiro", value: `${game.currentCity.armorerItemIds.length} itens` },
    { view: "apothecary", icon: <FlaskConical size={24} />, title: "Boticário", value: `${game.currentCity.apothecaryItemIds.length} poções` },
  ];

  if (game.currentCity.alchemistRecipeIds?.length) {
    inhabitantOptions.push({ view: "alchemist", icon: <FlaskConical size={24} />, title: "Alquimista", value: game.currentCity.npcs.alchemist ?? "Receitas" });
  }
  if (game.currentCity.npcs.moneyChanger) {
    inhabitantOptions.push({
      view: "moneyChanger",
      icon: <Coins size={24} />,
      title: "Cambista",
      value: `${game.currentCity.moneyChangerItemIds?.length ?? 0} itens`
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
      <div className="list-grid">
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
  const currentStats = selectedItem && selectedEntry ? getEnhancedItemStats(selectedItem, selectedEntry) : null;
  const nextStats = selectedItem && selectedEntry && plan
    ? getEnhancedItemStats(selectedItem, { ...selectedEntry, enhancementLevel: plan.nextLevel })
    : null;
  const requirementsMet = Boolean(plan?.requirements.every((requirement) => countInventoryItem(game, requirement.itemId) >= requirement.quantity));
  const canEnhance = Boolean(selectedEntry && selectedItem && plan && requirementsMet && game.character.gold >= plan.goldCost);

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
            <span>Nenhum equipamento no inventario.</span>
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
          <span>+20% nos atributos por aprimoramento. Falha consome servico e materiais.</span>
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
      <div className="list-grid">
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
            <span>{entry.name}</span>
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
              <div>
                <span>{entry.name}</span>
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
          Resetar 25 diamantes
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
                {pack.diamonds} diamantes {pack.bonusLabel ? `- ${pack.bonusLabel}` : ""}
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
              ⚠️ Requer nível {levelReq} {!levelOk && `(atual: ${game.character.level})`} e {diamondCost} diamantes {!diamondsOk && `(atual: ${game.character.diamonds})`}
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
                <div>
                  <strong>{entry.name}</strong>
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
                  <strong>{member.name}</strong>
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
              <span>Custa 1000 diamantes do líder e devolve 80% do gold e diamantes gastos para o tesouro do clã.</span>
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
  if (key.includes("members")) return <Users size={18} />;
  if (key.includes("inventory")) return <Backpack size={18} />;
  if (key.includes("damage") || key.includes("strength")) return <Swords size={18} />;
  if (key.includes("crit") || key.includes("dodge")) return <Crosshair size={18} />;
  if (key.includes("guard") || key.includes("defense")) return <Shield size={18} />;
  if (key.includes("vitality") || key.includes("life")) return <Heart size={18} />;
  if (key.includes("gold")) return <Coins size={18} />;
  if (key.includes("drop")) return <Gem size={18} />;
  if (key.includes("energy")) return <Zap size={18} />;
  return <Star size={18} />;
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
      <div className="list-grid">
        {monsters.length === 0 && <p className="empty-state">Nenhum local de caça disponível nesta cidade.</p>}
        {monsters.map((monster) => {
          const blocked = game.character.currentHp <= 0 || game.character.currentEnergy < monster.level;
          return (
            <article className="entity-card monster-card" key={monster.id}>
              <MonsterVisual monster={monster} className="entity-art" />
              <div>
                <strong>{monster.name}</strong>
                <span>Nível {monster.level}</span>
              </div>
              <div className="monster-stats">
                <small title="Vida"><Heart size={13} style={{ color: "var(--red)" }} /> {monster.maxHp}</small>
                <small title="Forca"><Swords size={13} style={{ color: "var(--purple)" }} /> {monster.strength}</small>
                <small title="Defesa"><Shield size={13} style={{ color: "var(--cyan)" }} /> {monster.defense}</small>
                <small title="Agilidade"><Crosshair size={13} style={{ color: "var(--yellow)" }} /> {monster.agility}</small>
                <small title="XP"><Star size={13} style={{ color: "var(--gold)" }} /> {monster.experience}</small>
                
              </div>
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
        <p>{game.arenaQueueSize} jogador(es) na fila</p>
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

function InventoryPanel({ game, onBackToBattle }: { game: GameState; onBackToBattle?: () => void }) {
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
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

  return (
    <section className="content-panel">
      <PanelTitle icon={<MapPinned size={20} />} title="Viajar" />
      <div className="travel-ticket-summary">
        <span>{game.itemCatalog[TRAIN_TICKET_ID]?.name ?? "Ticket de Trem"}: <strong>{trainTickets}</strong></span>
        <span>{game.itemCatalog[SHIP_TICKET_ID]?.name ?? "Ticket de Navio"}: <strong>{shipTickets}</strong></span>
      </div>

      <h3 className="city-group-title">Países</h3>
      <div className="list-grid">
        {game.countries.map((country) => {
          const current = country.id === game.currentCountry.id;
          const portCity = game.cities.find((city) => city.id === country.portCityId);
          const locked = !current && (shipTickets <= 0 || !portCity || game.character.level < portCity.minLevel);
          return (
            <article className={current ? "entity-card current-city" : "entity-card"} key={country.id}>
              <div>
                <strong>{country.name}</strong>
                <span>Porto: {portCity?.name ?? "indefinido"}</span>
              </div>
              <p>{country.description}</p>
              <button
                className="primary-button"
                disabled={current || locked}
                onClick={() => portCity && socket.emit("city:travel", { cityId: portCity.id })}
              >
                {current ? "País atual" : "Usar ticket de navio"}
              </button>
            </article>
          );
        })}
      </div>

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
                      <button
                        key={listing.id}
                        className="shop-item-card market-shop-card"
                        onClick={() => setSelectedListing(listing)}
                        title={formatInventoryItemName(item, listing.item)}
                      >
                        <ItemVisual item={item} className="shop-card-image" quantity={listing.item.quantity > 1 ? listing.item.quantity : undefined} enhancementLevel={listing.item.enhancementLevel} rarity={listing.item.rarity} />
                        <strong>{formatInventoryItemName(item, listing.item)}</strong>
                        <small className="market-card-subtle">
                          {listing.sellerName} - NPC {formatCurrency(getNpcSellValue(item, listing.item))}
                        </small>
                        <span className="shop-card-price">
                          {formatCurrency(listing.price)} {listing.currency === "gold" ? <Coins size={13} style={{ color: "var(--gold)" }} /> : <Gem size={13} style={{ color: "var(--cyan)" }} />}
                        </span>
                      </button>
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
          {entry.kind === "buy" ? "Comprado de" : "Vendido para"} {entry.counterpartyName}
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
            <span>Vendedor <b>{listing.sellerName}</b></span>
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
  const me = battle.participants.find((participant) => participant.ownerPlayerId === game.player.id);
  const opponent = battle.participants.find((participant) => participant.id !== me?.id);
  const myTurn = battle.turnParticipantId === me?.id;
  const firstPotion = game.character.inventory.find((item) => game.itemCatalog[item.itemId]?.stats.healPercent);
  const autoPveActive = isAutoPveActive(game);
  const rematchMonsterId = getBattleMonsterId(battle);
  const rematchMonster = rematchMonsterId ? game.cityMonsters.find((monster) => monster.id === rematchMonsterId) : null;
  const rematchEnergyCost = rematchMonster ? rematchMonster.level + (battle.mode === "dungeon" ? 1 : 0) : 0;
  const canRematch =
    Boolean(rematchMonster) &&
    game.character.currentHp > 0 &&
    game.character.currentEnergy >= rematchEnergyCost &&
    (battle.mode === "pve" || battle.mode === "dungeon");

  useEffect(() => {
    setAutoUntilStopped(false);
  }, [battle.id]);

  return (
    <section className="content-panel battle-panel">
      <PanelTitle
        icon={<Swords size={20} />}
        title={battle.mode === "pvp" ? "Arena PvP" : battle.mode === "dungeon" ? "Masmorra" : "Batalha PvE"}
      />
      <div className="combatants">
        {me && <CombatantCard participant={me} active={myTurn} />}
        {opponent && <CombatantCard participant={opponent} active={battle.turnParticipantId === opponent.id} />}
      </div>
      <div className="battle-actions">
        {battle.status === "active" ? (
          <>
            <button
              className="primary-button atack-button"
              disabled={!myTurn}
              onClick={() => socket.emit("battle:action", { battleId: battle.id, action: "attack" })}
            >
              <Swords size={13} /> Atacar
            </button>
            <button
              className="ghost-button"
              disabled={!myTurn || !firstPotion}
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
            <button className="danger-button" onClick={() => socket.emit("battle:flee")}>
              Fugir
            </button>
            {(battle.mode === "pve" || battle.mode === "dungeon") && autoPveActive && (
              <>
                <label className="auto-pve-toggle">
                  <input
                    type="checkbox"
                    checked={autoUntilStopped}
                    onChange={(event) => setAutoUntilStopped(event.target.checked)}
                  />
                  Continuar até acabar energia ou morrer
                </label>
                <button
                  className="ghost-button royal-auto-button"
                  disabled={!myTurn}
                  onClick={() =>
                    socket.emit("battle:action", {
                      battleId: battle.id,
                      action: "auto",
                      continueUntilStopped: autoUntilStopped
                    })
                  }
                >
                  <Crown size={14} /> Auto PvE
                </button>
              </>
            )}
          </>
        ) : (
          <>
            {rematchMonsterId && (battle.mode === "pve" || battle.mode === "dungeon") && (
              <button
                className="primary-button"
                disabled={!canRematch}
                onClick={() => socket.emit(battle.mode === "dungeon" ? "dungeon:start" : "hunt:start", { monsterId: rematchMonsterId })}
              >
                Enfrentar novamente
              </button>
            )}
            <button className="ghost-button" onClick={() => socket.emit("battle:leave")}>
              Voltar para a cidade
            </button>
          </>
        )}
      </div>
      <div className="battle-log">
        {battle.log.map((entry) => (
          <p key={entry.id}>{entry.text}</p>
        ))}
      </div>
    </section>
  );
}

function CombatantCard({ participant, active }: { participant: BattleParticipant; active: boolean }) {
  const hpPercent = Math.max(0, Math.round((participant.hp / participant.maxHp) * 100));
  return (
    <article className={active ? "combatant active" : "combatant"}>
      <ParticipantVisual participant={participant} className="combatant-art" />
      <div>
        <strong>{participant.name}</strong>
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

function FloatingChat({
  game,
  open,
  setOpen
}: {
  game: GameState;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<"global" | "clan" | "private">("global");
  const [privateTarget, setPrivateTarget] = useState<{ playerId: string; name: string } | null>(null);
  const [pmTarget, setPmTarget] = useState("");
  const feedRef = useRef<HTMLDivElement>(null);

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
    socket.emit("private:send", { targetPlayerName: privateTarget.name, text: message });
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

  return (
    <>
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
                    <strong>{chat.author}</strong>
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
                    <strong>{chat.author}</strong>
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
                  <p className="muted" style={{ margin: "0 0 8px", fontSize: "0.85rem" }}>Selecione um jogador online:</p>
                  <div className="online-player-list">
                    {game.onlinePlayers
                      .filter((p) => p.playerId !== game.player.id)
                      .map((p) => (
                        <button key={p.playerId} className="ghost-button" onClick={() => setPrivateTarget(p)}>
                          <User size={14} /> {p.name}
                        </button>
                      ))}
                    {game.onlinePlayers.filter((p) => p.playerId !== game.player.id).length === 0 && (
                      <p className="empty-state">Nenhum jogador online.</p>
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
                              <strong style={{ color: isFrom ? "var(--cyan)" : "var(--pink)" }}>
                                {isFrom ? `Você → ${msg.toName}` : `${msg.fromName} → Você`}
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
                    <strong>{privateTarget.name}</strong>
                  </div>
                  <div className="chat-feed">
                    {privateConversation.length === 0 && <p className="empty-state">Nenhuma mensagem ainda.</p>}
                    {privateConversation.map((msg) => {
                      const isFrom = msg.fromPlayerId === game.player.id;
                      return (
                        <article className={`chat-message private-message ${isFrom ? "sent" : "received"}`} key={msg.id}>
                          <strong style={{ color: isFrom ? "var(--cyan)" : "var(--pink)" }}>
                            {isFrom ? "Você" : msg.fromName}
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
    </>
  );
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
            <small className="muted">Saldo: {game.character.diamonds} diamantes</small>
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
              Nivel minimo: {item.minLevel} {item.minLevel > game.character.level && "(nao alcancado)"}
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

function Toast({ message }: { message: string }) {
  return <div className="toast">{message}</div>;
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

function getEnhancementBaseChance(nextLevel: number) {
  return Math.max(ENHANCEMENT_MIN_CHANCE, 100 - (nextLevel - 1) * ENHANCEMENT_CHANCE_STEP);
}

function getEnhancementRequirements(nextLevel: number, creationStones: number) {
  const requirements = [
    { itemId: ENHANCEMENT_ITEMS.oldStone, quantity: nextLevel }
  ];
  if (nextLevel >= 4) {
    requirements.push({ itemId: ENHANCEMENT_ITEMS.eranStone, quantity: 1 });
  }
  if (nextLevel >= 6) {
    requirements.push({ itemId: ENHANCEMENT_ITEMS.celena, quantity: 1 });
  }
  if (nextLevel >= 9) {
    requirements.push({ itemId: ENHANCEMENT_ITEMS.midran, quantity: 1 });
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

  return {
    nextLevel,
    goldCost: nextLevel * ENHANCEMENT_GOLD_STEP,
    baseChance,
    creationStones,
    maxCreationStones,
    successChance,
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
