import { FormEvent, useEffect, useState } from "react";
import {
  Backpack,
  Castle,
  Coins,
  FlaskConical,
  Gavel,
  Gem,
  Hammer,
  Heart,
  MapPinned,
  MessageCircle,
  ScrollText,
  Star,
  Shield,
  ShoppingBag,
  Swords,
  Trophy,
  User,
  Users,
  X,
  Zap
} from "lucide-react";
import type {
  AttributeKey,
  Attributes,
  BattleParticipant,
  GameState,
  ItemDefinition,
  ClanBenefitCategory,
  TalentCategory,
  QuestView
} from "../shared/types";
import { ATTRIBUTE_LABEL, EQUIPMENT_LABEL } from "../shared/types";
import cityMap from "./assets/city-map.svg";
import { socket } from "./socket";

type View =
  | "city"
  | "hunt"
  | "arena"
  | "armorer"
  | "apothecary"
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

const viewLabels: Record<View, string> = {
  city: "Cidade",
  hunt: "Caçar",
  arena: "Arena",
  armorer: "Armeiro",
  apothecary: "Boticário",
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

export function App() {
  const [game, setGame] = useState<GameState | null>(null);
  const [username, setUsername] = useState("");
  const [view, setView] = useState<View>("city");
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(socket.connected);
  const [showDetails, setShowDetails] = useState(false);
  const [showChat, setShowChat] = useState(false);

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
    };

    const onGameState = (state: GameState) => {
      setGame(state);
    };

    const onError = (payload: { message: string }) => {
      setError(payload.message);
      if (payload.message.includes("Sessão")) {
        localStorage.removeItem("litch:session");
        setGame(null);
      }
      window.setTimeout(() => setError(null), 3200);
    };

    const onDisconnect = () => setConnected(false);

    socket.on("connect", resume);
    socket.on("disconnect", onDisconnect);
    socket.on("auth:ok", onAuthOk);
    socket.on("game:state", onGameState);
    socket.on("game:error", onError);

    if (socket.connected) {
      resume();
    }

    return () => {
      socket.off("connect", resume);
      socket.off("disconnect", onDisconnect);
      socket.off("auth:ok", onAuthOk);
      socket.off("game:state", onGameState);
      socket.off("game:error", onError);
    };
  }, []);

  const register = (event: FormEvent) => {
    event.preventDefault();
    socket.emit("auth:register", { username });
  };

  if (!game) {
    return (
      <main className="auth-screen">
        <form className="auth-panel" onSubmit={register}>
          <div className="brand-mark">
            <Castle size={34} />
          </div>
          <h1>Litch RPG</h1>
          <label>
            Nome do jogador
            <input
              value={username}
              maxLength={24}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Ex: Arthen"
            />
          </label>
          <button className="primary-button" type="submit" disabled={!connected}>
            Criar personagem
          </button>
          <span className={connected ? "status-dot online" : "status-dot"}>{connected ? "Online" : "Conectando"}</span>
        </form>
        {error && <Toast message={error} />}
      </main>
    );
  }

  return (
    <main className="game-shell">
      <Header
        game={game}
        connected={connected}
        onDetails={() => setShowDetails(true)}
        onGameShop={() => setView("gameShop")}
      />
      <div className={game.activeBattle ? "game-grid in-battle" : "game-grid"}>
        <section className="city-stage">
          {!game.activeBattle && <CityHero game={game} view={view} setView={setView} />}
          <GamePane game={game} view={view} setView={setView} />
        </section>
      </div>
      <BottomNav game={game} view={view} setView={setView} />
      {!game.activeBattle && <FloatingChat game={game} open={showChat} setOpen={setShowChat} />}
      {showDetails && <CharacterDrawer game={game} onClose={() => setShowDetails(false)} />}
      {error && <Toast message={error} />}
    </main>
  );
}

function Header({
  game,
  connected,
  onDetails,
  onGameShop
}: {
  game: GameState;
  connected: boolean;
  onDetails: () => void;
  onGameShop: () => void;
}) {
  const nextXp = game.character.level * 120;
  const xpProgress = Math.min(100, Math.round((game.character.experience / nextXp) * 100));
  const hpProgress = Math.min(100, Math.round((game.character.currentHp / game.derived.maxHp) * 100));
  const energyProgress = Math.min(100, Math.round((game.character.currentEnergy / game.derived.maxEnergy) * 100));

  return (
    <header className="topbar">
      <div className="title-lockup">
        <Castle size={26} />
        <div>
          <strong>Litch RPG</strong>
          <span>{game.currentCity.name}</span>
        </div>
      </div>
      <button className="character-chip" onClick={onDetails} title="Detalhes do personagem">
        <span>
          <User size={20} />
        </span>
        <strong>{game.character.name}</strong>
        <small>Nível {game.character.level}</small>
      </button>
      <div className="resource-stack">
        <ResourceBar
          className="life"
          label="Vida"
          value={`${game.character.currentHp}/${game.derived.maxHp}`}
          progress={hpProgress}
        />
        <ResourceBar
          className="energy"
          label="Energia"
          value={`${game.character.currentEnergy}/${game.derived.maxEnergy}`}
          progress={energyProgress}
        />
        <ResourceBar
          className="xp"
          label="XP"
          value={`${game.character.experience}/${nextXp}`}
          progress={xpProgress}
        />
      </div>
      <div className="top-economy">
        <StatPill icon={<Coins size={17} />} label="Ouro" value={game.character.gold} />
        <button className="stat-pill stat-action" onClick={onGameShop} title="Loja do Jogo">
          <Gem size={17} />
          <small>Diamantes</small>
          <strong>{game.character.diamonds}</strong>
        </button>
        <span className={connected ? "status-dot online" : "status-dot"}>{connected ? "Online" : "Offline"}</span>
      </div>
    </header>
  );
}

function ResourceBar({
  className,
  label,
  value,
  progress
}: {
  className: string;
  label: string;
  value: string;
  progress: number;
}) {
  return (
    <div className={`resource-bar ${className}`}>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <i>
        <b style={{ width: `${progress}%` }} />
      </i>
    </div>
  );
}

function BottomNav({ game, view, setView }: { game: GameState; view: View; setView: (view: View) => void }) {
  const locked = Boolean(game.activeBattle);
  const items = [
    { view: "city" as View, label: "Cidade", icon: <Castle size={20} />, disabled: locked },
    { view: "hunt" as View, label: "Caça", icon: <Swords size={20} />, disabled: locked },
    { view: "arena" as View, label: "Arena", icon: <Shield size={20} />, disabled: locked },
    { view: "inventory" as View, label: "Inventário", icon: <Backpack size={20} />, disabled: false },
    { view: "market" as View, label: "Mercado", icon: <ShoppingBag size={20} />, disabled: locked },
    { view: "missions" as View, label: "Missões", icon: <ScrollText size={20} />, disabled: locked }
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
      </div>
      <h2>{game.character.name}</h2>
      <p className="muted">{game.currentCity.name}</p>

      <div className="stat-grid">
        <Metric icon={<Heart size={18} />} label="Vida" value={`${game.character.currentHp}/${game.derived.maxHp}`} />
        <Metric icon={<Zap size={18} />} label="Energia" value={`${game.character.currentEnergy}/${game.derived.maxEnergy}`} />
        <Metric icon={<Swords size={18} />} label="FORÇA" value={game.derived.totalStrength} />
        <Metric icon={<Shield size={18} />} label="DEFESA" value={game.derived.defense} />
        <Metric icon={<User size={18} />} label="AGI" value={game.derived.agility} />
      </div>

      <div className="chance-row">
        <span>Crítico {formatPercent(game.derived.criticalChance)}</span>
        <span>Esquiva {formatPercent(game.derived.dodgeChance)}</span>
      </div>

      <section className="compact-section">
        <h3>Poções</h3>
        <div className="potion-actions">
          <button
            className="ghost-button"
            disabled={locked || !healthPotion || game.character.currentHp >= game.derived.maxHp}
            onClick={() => healthPotion && socket.emit("inventory:use", { instanceId: healthPotion.instanceId })}
          >
            Vida {healthPotion ? `x${healthPotion.quantity}` : "x0"}
          </button>
          <button
            className="ghost-button"
            disabled={locked || !energyPotion || game.character.currentEnergy >= game.derived.maxEnergy}
            onClick={() => energyPotion && socket.emit("inventory:use", { instanceId: energyPotion.instanceId })}
          >
            Energia {energyPotion ? `x${energyPotion.quantity}` : "x0"}
          </button>
        </div>
      </section>

      <section className="compact-section">
        <h3>Equipamentos</h3>
        {(["weapon", "armor", "amulet"] as const).map((slot) => {
          const instanceId = game.character.equipment[slot];
          const inventoryItem = instanceId ? game.character.inventory.find((item) => item.instanceId === instanceId) : null;
          const definition = inventoryItem ? game.itemCatalog[inventoryItem.itemId] : null;
          return (
            <div className="equipment-line" key={slot}>
              <span>{EQUIPMENT_LABEL[slot]}</span>
              <strong>{definition?.name ?? "Vazio"}</strong>
            </div>
          );
        })}
      </section>

      <section className="compact-section">
        <h3>Atributos</h3>
        {attributes.map((attribute) => (
          <div className="attribute-line" key={attribute}>
            <span>{ATTRIBUTE_LABEL[attribute]}</span>
            <strong>{game.character.attributes[attribute]}</strong>
          </div>
        ))}
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
        <p>{game.currentCity.description}</p>
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

function CityOverview({ game, setView }: { game: GameState; setView: (view: View) => void }) {
  const options: Array<{ view: View; icon: React.ReactNode; title: string; value: string }> = [
    { view: "hunt" as View, icon: <Swords size={24} />, title: "Caçar", value: `${game.cityMonsters.length} monstros` },
    { view: "arena" as View, icon: <Shield size={24} />, title: "Arena", value: `${game.arenaQueueSize} na fila` },
    { view: "armorer" as View, icon: <Gavel size={24} />, title: "Armeiro", value: `${game.currentCity.armorerItemIds.length} itens` },
    {
      view: "apothecary" as View,
      icon: <FlaskConical size={24} />,
      title: "Boticário",
      value: `${game.currentCity.apothecaryItemIds.length} poções`
    },
    {
      view: "missions" as View,
      icon: <ScrollText size={24} />,
      title: "Missões",
      value: `${countClaimable(game.quests.daily) + countClaimable(game.quests.fixed)} prontas`
    },
    { view: "travel" as View, icon: <MapPinned size={24} />, title: "Viajar", value: `${game.cities.length} cidades` },
    { view: "market" as View, icon: <ShoppingBag size={24} />, title: "Mercado", value: `${game.marketplaceListings.length} ofertas` },
    { view: "rankings" as View, icon: <Trophy size={24} />, title: "Ranking", value: "Nível e Arena" },
    {
      view: "clan" as View,
      icon: <Users size={24} />,
      title: "Clã",
      value: game.clan ? game.clan.name : "Criar ou entrar"
    }
  ];
  if (game.currentCity.blacksmithRecipeIds?.length) {
    options.push({
      view: "blacksmith",
      icon: <Hammer size={24} />,
      title: "Ferreiro",
      value: game.currentCity.npcs.blacksmith ?? "Receitas"
    });
  }
  if (game.currentCity.alchemistRecipeIds?.length) {
    options.push({
      view: "alchemist",
      icon: <FlaskConical size={24} />,
      title: "Alquimista",
      value: game.currentCity.npcs.alchemist ?? "Receitas"
    });
  }
  if (game.currentCity.dungeonMonsterIds?.length) {
    options.push({
      view: "dungeon",
      icon: <Star size={24} />,
      title: "Masmorra",
      value: `${game.currentCity.dungeonMonsterIds.length} desafios`
    });
  }

  return (
    <section className="content-panel overview-grid">
      {options.map((option) => (
        <button className="option-card" key={option.view} onClick={() => setView(option.view)}>
          <span>{option.icon}</span>
          <strong>{option.title}</strong>
          <small>{option.value}</small>
        </button>
      ))}
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
  return (
    <section className="quest-section">
      <h3>{title}</h3>
      <div className="quest-list">
        {quests.map((quest) => {
          const progress = Math.min(100, Math.round((quest.progress / quest.target) * 100));
          return (
            <article className={quest.claimed ? "quest-row claimed" : "quest-row"} key={quest.id}>
              <div className="quest-main">
                <strong>{quest.title}</strong>
                <span>{quest.description}</span>
                <div className="quest-progress">
                  <i>
                    <b style={{ width: `${progress}%` }} />
                  </i>
                  <small>
                    {quest.progress}/{quest.target}
                  </small>
                </div>
              </div>
              <div className="quest-reward">
                {quest.reward.experience ? <span>{quest.reward.experience} XP</span> : null}
                {quest.reward.gold ? <span>{quest.reward.gold} ouro</span> : null}
                {quest.reward.diamonds ? <span>{quest.reward.diamonds} diamantes</span> : null}
              </div>
              <button
                className="primary-button"
                disabled={!quest.completed || quest.claimed}
                onClick={() => socket.emit("quest:claim", { questId: quest.id })}
              >
                {quest.claimed ? "Resgatada" : "Resgatar"}
              </button>
            </article>
          );
        })}
      </div>
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
                <small>{recipe.goldCost} ouro</small>
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
            <article className="entity-card" key={monster.id}>
              <div>
                <strong>{monster.name}</strong>
                <span>Nível {monster.level}</span>
              </div>
              <div className="monster-stats">
                <small>Vida {monster.maxHp}</small>
                <small>FOR {monster.strength}</small>
                <small>DEF {monster.defense}</small>
                <small>Energia {energyCost}</small>
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
  return (
    <section className="content-panel rankings-panel">
      <PanelTitle icon={<Trophy size={20} />} title="Ranking" />
      <RankingList title="Nível" entries={game.rankings.level} mode="level" />
      <RankingList title="Arena" entries={game.rankings.arena} mode="arena" />
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

function TalentTreeView({ game, compact = false }: { game: GameState; compact?: boolean }) {
  const categories: Array<{ id: TalentCategory; title: string }> = [
    { id: "offensive", title: "Ofensivo" },
    { id: "defensive", title: "Defensivo" },
    { id: "utility", title: "Útil" }
  ];

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
      {categories.map((category) => (
        <section className="talent-tree" key={category.id}>
          <h3>{category.title}</h3>
          <div className="talent-list branching-list">
            {game.talents
              .filter((talent) => talent.category === category.id)
              .map((talent) => {
                const rank = game.character.talentAllocations[talent.id] ?? 0;
                const requiredRank = talent.requires ? game.character.talentAllocations[talent.requires] ?? 0 : 1;
                const locked = Boolean(talent.requires && requiredRank <= 0);
                const maxed = rank >= talent.maxRank;
                return (
                  <article className={locked ? "talent-row locked" : "talent-row"} key={talent.id}>
                    <div>
                      <strong>{talent.name}</strong>
                      <span>{talent.description}</span>
                      {talent.requires && <small>Requer talento anterior</small>}
                    </div>
                    <b>
                      {rank}/{talent.maxRank}
                    </b>
                    <button
                      className="primary-button"
                      disabled={locked || maxed || game.derived.availableTalentPoints < talent.costPerRank}
                      onClick={() => socket.emit("talent:buy", { talentId: talent.id })}
                    >
                      {talent.costPerRank} pts
                    </button>
                  </article>
                );
              })}
          </div>
        </section>
      ))}
    </div>
  );
}

function GameShopPanel({ game }: { game: GameState }) {
  return (
    <section className="content-panel">
      <PanelTitle icon={<Gem size={20} />} title="Loja do Jogo" />
      <div className="shop-grid">
        {game.diamondPackages.map((pack) => (
          <article className="item-card" key={pack.id}>
            <div>
              <strong>{pack.name}</strong>
              <span>
                {pack.diamonds} diamantes {pack.bonusLabel ? `- ${pack.bonusLabel}` : ""}
              </span>
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

function ClanPanel({ game }: { game: GameState }) {
  const [name, setName] = useState("");
  const [gold, setGold] = useState(0);
  const [diamonds, setDiamonds] = useState(0);
  const clan = game.clan;

  const createClan = (event: FormEvent) => {
    event.preventDefault();
    socket.emit("clan:create", { name });
    setName("");
  };

  const donate = (event: FormEvent) => {
    event.preventDefault();
    socket.emit("clan:donate", { gold, diamonds });
    setGold(0);
    setDiamonds(0);
  };

  if (!clan) {
    return (
      <section className="content-panel clan-panel">
        <PanelTitle icon={<Users size={20} />} title="Clã" />
        <form className="market-form" onSubmit={createClan}>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome do clã" maxLength={28} />
          <button className="primary-button" disabled={name.trim().length < 3}>
            Criar clã
          </button>
        </form>
        <section className="market-group">
          <h3>Clãs abertos</h3>
          <div className="market-list">
            {game.clanDirectory.length === 0 && <p className="empty-state">Nenhum clã criado.</p>}
            {game.clanDirectory.map((entry) => (
              <article className="market-row" key={entry.id}>
                <div>
                  <strong>{entry.name}</strong>
                  <span>Líder: {entry.leaderName}</span>
                </div>
                <b>{entry.memberCount} membros</b>
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

  const leader = clan.leaderPlayerId === game.player.id;

  return (
    <section className="content-panel clan-panel">
      <PanelTitle icon={<Users size={20} />} title={clan.name} />
      <div className="clan-summary">
        <Metric icon={<Users size={18} />} label="Membros" value={clan.memberPlayerIds.length} />
        <Metric icon={<Coins size={18} />} label="Tesouro" value={clan.gold} />
        <Metric icon={<Gem size={18} />} label="Diamantes" value={clan.diamonds} />
        <Metric icon={<Shield size={18} />} label="Líder" value={leader ? "Você" : "Clã"} />
      </div>
      <form className="market-form" onSubmit={donate}>
        <input type="number" min={0} value={gold} onChange={(event) => setGold(Number(event.target.value))} aria-label="Ouro" />
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
      <ClanBenefitTree game={game} leader={leader} />
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

  return (
    <div className="clan-benefits">
      {categories.map((category) => (
        <section className="talent-tree" key={category.id}>
          <h3>{category.title}</h3>
          <div className="talent-list branching-list">
            {game.clanBenefits
              .filter((benefit) => benefit.category === category.id)
              .map((benefit) => {
                const rank = clan?.benefitAllocations[benefit.id] ?? 0;
                const requiredRank = benefit.requires ? clan?.benefitAllocations[benefit.requires] ?? 0 : 1;
                const locked = Boolean(benefit.requires && requiredRank <= 0);
                const maxed = rank >= benefit.maxRank;
                const affordable =
                  Boolean(clan) &&
                  clan!.gold >= benefit.costPerRank.gold &&
                  clan!.diamonds >= benefit.costPerRank.diamonds;
                return (
                  <article className={locked ? "talent-row locked" : "talent-row"} key={benefit.id}>
                    <div>
                      <strong>{benefit.name}</strong>
                      <span>{benefit.description}</span>
                      <small>
                        {benefit.costPerRank.gold} ouro
                        {benefit.costPerRank.diamonds ? `, ${benefit.costPerRank.diamonds} diamantes` : ""}
                      </small>
                    </div>
                    <b>
                      {rank}/{benefit.maxRank}
                    </b>
                    <button
                      className="primary-button"
                      disabled={!leader || locked || maxed || !affordable}
                      onClick={() => socket.emit("clan:benefit:buy", { benefitId: benefit.id })}
                    >
                      Comprar
                    </button>
                  </article>
                );
              })}
          </div>
        </section>
      ))}
    </div>
  );
}

function HuntPanel({ game }: { game: GameState }) {
  return (
    <section className="content-panel">
      <PanelTitle icon={<Swords size={20} />} title="Caçar" />
      <div className="list-grid">
        {game.cityMonsters.map((monster) => {
          const blocked = game.character.currentHp <= 0 || game.character.currentEnergy < monster.level;
          return (
            <article className="entity-card" key={monster.id}>
              <div>
                <strong>{monster.name}</strong>
                <span>Nível {monster.level}</span>
              </div>
              <div className="monster-stats">
                <small>Vida {monster.maxHp}</small>
                <small>FOR {monster.strength}</small>
                <small>DEF {monster.defense}</small>
                <small>XP {monster.experience}</small>
                <small>Energia {monster.level}</small>
              </div>
              <button
                className="primary-button"
                disabled={blocked}
                onClick={() => socket.emit("hunt:start", { monsterId: monster.id })}
              >
                Enfrentar
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

function ShopPanel({ game, shop }: { game: GameState; shop: "armorer" | "apothecary" }) {
  const itemIds = shop === "armorer" ? game.currentCity.armorerItemIds : game.currentCity.apothecaryItemIds;
  const title = shop === "armorer" ? "Armeiro" : "Boticário";
  const icon = shop === "armorer" ? <Gavel size={20} /> : <FlaskConical size={20} />;
  const npcName = shop === "armorer" ? game.currentCity.npcs.armorer : game.currentCity.npcs.apothecary;

  return (
    <section className="content-panel">
      <PanelTitle icon={icon} title={title} />
      <div className="npc-banner">
        <User size={18} />
        <span>{npcName}</span>
      </div>
      <div className="shop-grid">
        {itemIds.map((itemId) => {
          const item = game.itemCatalog[itemId];
          return (
            <ItemCard
              key={item.id}
              item={item}
              actionLabel={`Comprar ${item.price} ouro`}
              disabled={game.character.gold < item.price || game.character.level < item.minLevel}
              onAction={() => socket.emit("shop:buy", { itemId: item.id })}
            />
          );
        })}
      </div>
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
                    {item.name} {inventoryItem.quantity > 1 ? `x${inventoryItem.quantity}` : ""}
                  </span>
                  <button
                    className="ghost-button"
                    disabled={equipped}
                    onClick={() => socket.emit("shop:sell", { instanceId: inventoryItem.instanceId, quantity: 1 })}
                  >
                    Vender {Math.max(1, Math.floor(item.price / 2))}
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
  const battleLocked = game.activeBattle?.status === "active";
  const equipmentItems = game.character.inventory.filter((item) => {
    const definition = game.itemCatalog[item.itemId];
    return definition.slot;
  });
  const groupedItems = Object.values(
    game.character.inventory
      .filter((item) => !game.itemCatalog[item.itemId].slot)
      .reduce<Record<string, { instanceId: string; itemId: string; quantity: number }>>((groups, item) => {
        groups[item.itemId] ??= { instanceId: item.instanceId, itemId: item.itemId, quantity: 0 };
        groups[item.itemId].quantity += item.quantity;
        return groups;
      }, {})
  );
  const visibleItems = [...equipmentItems, ...groupedItems];

  return (
    <section className="content-panel">
      <PanelTitle icon={<Backpack size={20} />} title="Inventário" />
      {onBackToBattle && (
        <button className="ghost-button inventory-return" onClick={onBackToBattle}>
          Voltar à batalha
        </button>
      )}
      <div className="inventory-list">
        {visibleItems.map((inventoryItem) => {
          const item = game.itemCatalog[inventoryItem.itemId];
          const equipped = isItemEquipped(game, inventoryItem.instanceId);
          const consumable = item.kind === "potion";
          return (
            <article className={equipped ? "inventory-row equipped" : "inventory-row"} key={inventoryItem.instanceId}>
              <div>
                <strong>{item.name}</strong>
                <span>{item.description}</span>
              </div>
              <small>{inventoryItem.quantity > 1 ? `x${inventoryItem.quantity}` : item.kind}</small>
              <button
                className="ghost-button"
                disabled={
                  consumable
                    ? battleLocked
                    : !item.slot || equipped || game.character.level < item.minLevel || battleLocked
                }
                onClick={() =>
                  socket.emit(consumable ? "inventory:use" : "inventory:equip", { instanceId: inventoryItem.instanceId })
                }
              >
                {consumable ? (battleLocked ? "Em batalha" : "Usar") : equipped ? "Equipado" : "Equipar"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function TravelPanel({ game }: { game: GameState }) {
  return (
    <section className="content-panel">
      <PanelTitle icon={<MapPinned size={20} />} title="Viajar" />
      <div className="list-grid">
        {game.cities.map((city) => {
          const current = city.id === game.character.cityId;
          const locked = game.character.level < city.minLevel || game.character.gold < city.travelCost;
          return (
            <article className={current ? "entity-card current-city" : "entity-card"} key={city.id}>
              <div>
                <strong>{city.name}</strong>
                <span>Nível mínimo {city.minLevel}</span>
              </div>
              <p>{city.description}</p>
              <button
                className="primary-button"
                disabled={current || locked}
                onClick={() => socket.emit("city:travel", { cityId: city.id })}
              >
                {current ? "Atual" : `Viajar ${city.travelCost} ouro`}
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
  const [instanceId, setInstanceId] = useState(tradableItems[0]?.instanceId ?? "");
  const [price, setPrice] = useState(25);
  const [currency, setCurrency] = useState<"gold" | "diamonds">("gold");
  const goldListings = game.marketplaceListings.filter((listing) => listing.currency === "gold");
  const diamondListings = game.marketplaceListings.filter((listing) => listing.currency === "diamonds");

  useEffect(() => {
    if (!instanceId && tradableItems[0]) {
      setInstanceId(tradableItems[0].instanceId);
    }
  }, [instanceId, tradableItems]);

  const createListing = (event: FormEvent) => {
    event.preventDefault();
    if (!instanceId) {
      return;
    }
    socket.emit("market:create", { instanceId, price, currency });
  };

  return (
    <section className="content-panel market-panel">
      <PanelTitle icon={<ShoppingBag size={20} />} title="Mercado de Trocas" />
      <form className="market-form" onSubmit={createListing}>
        <select value={instanceId} onChange={(event) => setInstanceId(event.target.value)}>
          {tradableItems.map((inventoryItem) => {
            const item = game.itemCatalog[inventoryItem.itemId];
            return (
              <option value={inventoryItem.instanceId} key={inventoryItem.instanceId}>
                {item.name} {inventoryItem.quantity > 1 ? `x${inventoryItem.quantity}` : ""}
              </option>
            );
          })}
        </select>
        <input
          type="number"
          min={1}
          value={price}
          onChange={(event) => setPrice(Number(event.target.value))}
          aria-label="Preço"
        />
        <select value={currency} onChange={(event) => setCurrency(event.target.value as "gold" | "diamonds")}>
          <option value="gold">Ouro</option>
          <option value="diamonds">Diamantes</option>
        </select>
        <button className="primary-button" disabled={!instanceId}>
          Ofertar
        </button>
      </form>
      <MarketListingGroup title="Por ouro" listings={goldListings} game={game} />
      <MarketListingGroup title="Por diamantes" listings={diamondListings} game={game} />
    </section>
  );
}

function MarketListingGroup({
  title,
  listings,
  game
}: {
  title: string;
  listings: GameState["marketplaceListings"];
  game: GameState;
}) {
  return (
    <section className="market-group">
      <h3>{title}</h3>
      <div className="market-list">
        {listings.length === 0 && <p className="empty-state">Nenhuma oferta aberta.</p>}
        {listings.map((listing) => {
          const item = game.itemCatalog[listing.item.itemId];
          const mine = listing.sellerPlayerId === game.player.id;
          return (
            <article className="market-row" key={listing.id}>
              <div>
                <strong>{item.name}</strong>
                <span>{listing.sellerName}</span>
              </div>
              <b>
                {listing.price} {listing.currency === "gold" ? "ouro" : "diamantes"}
              </b>
              <button
                className="ghost-button"
                onClick={() => socket.emit(mine ? "market:cancel" : "market:buy", { listingId: listing.id })}
              >
                {mine ? "Cancelar" : "Comprar"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function BattlePanel({ game }: { game: GameState }) {
  const battle = game.activeBattle!;
  const me = battle.participants.find((participant) => participant.ownerPlayerId === game.player.id);
  const opponent = battle.participants.find((participant) => participant.id !== me?.id);
  const myTurn = battle.turnParticipantId === me?.id;
  const firstPotion = game.character.inventory.find((item) => game.itemCatalog[item.itemId]?.stats.healPercent);

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
              className="primary-button"
              disabled={!myTurn}
              onClick={() => socket.emit("battle:action", { battleId: battle.id, action: "attack" })}
            >
              Atacar
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
            >
              Usar vida
            </button>
            <button className="danger-button" onClick={() => socket.emit("battle:flee")}>
              Fugir
            </button>
          </>
        ) : (
          <button className="primary-button" onClick={() => socket.emit("battle:leave")}>
            Voltar para a cidade
          </button>
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
        <span>FOR {participant.strength}</span>
        <span>DEF {participant.defense}</span>
        <span>AGI {participant.agility}</span>
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

  const send = (event: FormEvent) => {
    event.preventDefault();
    socket.emit("chat:send", message);
    setMessage("");
  };

  return (
    <>
      <button className="floating-chat-button" title="Chat" onClick={() => setOpen(!open)}>
        <MessageCircle size={22} />
        {game.chatMessages.length > 0 && <span>{Math.min(99, game.chatMessages.length)}</span>}
      </button>
      {open && (
        <aside className="side-panel chat-panel floating-chat-panel">
          <PanelTitle icon={<MessageCircle size={20} />} title="Chat" />
          <div className="chat-feed">
            {game.chatMessages.length === 0 && <p className="empty-state">Chat vazio.</p>}
            {game.chatMessages.map((chat) => (
              <article className="chat-message" key={chat.id}>
                <strong>{chat.author}</strong>
                <span>{chat.text}</span>
              </article>
            ))}
          </div>
          <form className="chat-form" onSubmit={send}>
            <input value={message} onChange={(event) => setMessage(event.target.value)} maxLength={240} placeholder="Mensagem" />
            <button className="icon-submit" title="Enviar">
              <MessageCircle size={18} />
            </button>
          </form>
        </aside>
      )}
    </>
  );
}

function ItemCard({
  item,
  actionLabel,
  disabled,
  onAction
}: {
  item: ItemDefinition;
  actionLabel: string;
  disabled?: boolean;
  onAction: () => void;
}) {
  return (
    <article className="item-card">
      <div>
        <strong>{item.name}</strong>
        <span>{item.description}</span>
      </div>
      <small>Nível {item.minLevel}</small>
      <button className="primary-button" disabled={disabled} onClick={onAction}>
        {actionLabel}
      </button>
    </article>
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

function Toast({ message }: { message: string }) {
  return <div className="toast">{message}</div>;
}

function isItemEquipped(game: GameState, instanceId: string) {
  return Object.values(game.character.equipment).includes(instanceId);
}

function countInventoryItem(game: GameState, itemId: string) {
  return game.character.inventory
    .filter((item) => item.itemId === itemId)
    .reduce((total, item) => total + item.quantity, 0);
}

function countClaimable(quests: QuestView[]) {
  return quests.filter((quest) => quest.completed && !quest.claimed).length;
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}
