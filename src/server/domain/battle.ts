import { randomUUID } from "node:crypto";
import type {
  BattleParticipant,
  BattleState,
  Character,
  InventoryItem,
  ItemDefinition,
  MonsterDefinition
} from "../../shared/types";
import { MONARCH_BATTLE_ATTACK_LIMIT } from "../../shared/types";
import { getRarityFromRoll } from "../../shared/rarity";
import { getActiveTemporaryEventViews, getTemporaryEventBonus } from "../../shared/temporaryEvents";
import { AVATARS, ITEM_CATALOG, MONSTERS, TEMPORARY_EVENTS } from "../content";
import { addItem, findInventoryItem, hasCapacity, removeItem } from "./inventory";
import { deriveStats, grantExperience } from "./stats";

function entry(text: string) {
  return { id: randomUUID(), createdAt: Date.now(), text };
}

function getCharacterAvatarImageUrl(character: Character) {
  return AVATARS.find((avatar) => avatar.id === character.avatarId)?.imageUrl
    ?? AVATARS.find((avatar) => avatar.id === "recruta")?.imageUrl;
}

function playerParticipant(character: Character, itemCatalog: Record<string, ItemDefinition>): BattleParticipant {
  const stats = deriveStats(character, itemCatalog);
  const currentHp = Math.min(Math.max(0, character.currentHp), stats.maxHp);
  return {
    id: `player:${character.playerId}`,
    ownerPlayerId: character.playerId,
    name: character.name,
    kind: "player",
    imageUrl: getCharacterAvatarImageUrl(character),
    level: character.level,
    hp: currentHp,
    maxHp: stats.maxHp,
    strength: stats.totalStrength,
    defense: stats.defense,
    agility: stats.agility,
    criticalChance: stats.criticalChance,
    dodgeChance: stats.dodgeChance,
    accuracy: stats.accuracy,
    criticalResistance: stats.criticalResistance,
    damageBonusPercent: stats.damageBonusPercent,
    criticalDamageMultiplier: stats.criticalDamageMultiplier
  };
}

function monsterParticipant(monster: MonsterDefinition): BattleParticipant {
  return {
    id: `monster:${monster.id}`,
    ownerPlayerId: null,
    name: monster.name,
    kind: "monster",
    imageUrl: monster.imageUrl,
    level: monster.level,
    hp: monster.maxHp,
    maxHp: monster.maxHp,
    strength: monster.strength,
    defense: monster.defense,
    agility: monster.agility,
    criticalChance: criticalChance(monster.agility),
    dodgeChance: dodgeChance(monster.agility),
    accuracy: accuracy(monster.agility),
    criticalResistance: criticalResistance(monster.agility),
    damageBonusPercent: 0,
    criticalDamageMultiplier: criticalDamageMultiplier(monster.agility)
  };
}

function criticalChance(agility: number) {
  return agility * 0.006;
}

function dodgeChance(agility: number) {
  return agility * 0.005;
}

function accuracy(agility: number) {
  return agility * 0.004;
}

function criticalResistance(agility: number, constitution = agility) {
  return ((agility + constitution) / 2) * 0.004;
}

function criticalDamageMultiplier(agility: number) {
  return 1.5 + agility * 0.002;
}

function clampChance(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function attack(attacker: BattleParticipant, defender: BattleParticipant, battle: BattleState) {
  const finalDodgeChance = clampChance(
    (defender.dodgeChance ?? dodgeChance(defender.agility)) - (attacker.accuracy ?? accuracy(attacker.agility)),
    0.02,
    0.45
  );
  const dodged = Math.random() < finalDodgeChance;
  if (dodged) {
    battle.log.unshift(entry(`${defender.name} esquivou do ataque de ${attacker.name}.`));
    return { damage: 0, dodged: true, critical: false };
  }

  const finalCriticalChance = clampChance(
    (attacker.criticalChance ?? criticalChance(attacker.agility)) -
      (defender.criticalResistance ?? criticalResistance(defender.agility)),
    0.03,
    0.65
  );
  const critical = Math.random() < finalCriticalChance;
  const baseDamage = Math.max(0, attacker.strength - defender.defense);
  const boostedDamage = Math.ceil(baseDamage * (1 + (attacker.damageBonusPercent ?? 0)));
  const criticalMultiplier = attacker.criticalDamageMultiplier ?? criticalDamageMultiplier(attacker.agility);
  const damage = critical ? Math.ceil(boostedDamage * criticalMultiplier) : boostedDamage;
  defender.hp = Math.max(0, defender.hp - damage);

  battle.log.unshift(
    entry(
      `${attacker.name} causou ${damage} de dano em ${defender.name}${critical ? " com acerto crítico" : ""}.`
    )
  );
  return { damage, dodged: false, critical };
}

function getOpponent(battle: BattleState, participant: BattleParticipant) {
  return battle.participants.find((entry) => entry.id !== participant.id && entry.hp > 0) ?? null;
}

function livingParticipants(battle: BattleState) {
  return battle.participants.filter((participant) => participant.hp > 0);
}

function finishBattle(battle: BattleState, winner: BattleParticipant) {
  battle.status = "ended";
  battle.turnParticipantId = null;
  battle.winnerParticipantId = winner.id;
  battle.updatedAt = Date.now();
  battle.log.unshift(entry(`${winner.name} venceu a batalha.`));
}

function finishMonarchBattleByFatalAttack(battle: BattleState, monarch: BattleParticipant, participant: BattleParticipant) {
  const fatalDamage = Math.max(0, participant.hp);
  participant.hp = 0;
  battle.log.unshift(entry(`${monarch.name} causou ${fatalDamage} de dano em ${participant.name}.`));
  battle.log.unshift(entry(`${monarch.name} executou o decreto final apos ${MONARCH_BATTLE_ATTACK_LIMIT} ataques.`));
  finishBattle(battle, monarch);
}

export function createPveBattle(character: Character, monster: MonsterDefinition): BattleState {
  const player = playerParticipant(character, ITEM_CATALOG);
  const enemy = monsterParticipant(monster);
  const battle: BattleState = {
    id: randomUUID(),
    mode: "pve",
    status: "active",
    cityId: character.cityId,
    participants: [player, enemy],
    turnParticipantId: player.id,
    log: [entry(`${character.name} encontrou ${monster.name}.`)],
    winnerParticipantId: null,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  character.activeBattleId = battle.id;
  return battle;
}

export function createDungeonBattle(character: Character, monster: MonsterDefinition): BattleState {
  const battle = createPveBattle(character, monster);
  battle.mode = "dungeon";
  battle.log.unshift(entry(`${character.name} entrou na masmorra e desafiou ${monster.name}.`));
  return battle;
}

export function createMonarchBattle(character: Character, monarch: MonsterDefinition, currentHp: number): BattleState {
  const player = playerParticipant(character, ITEM_CATALOG);
  const enemy = monsterParticipant(monarch);
  enemy.id = `monarch:${monarch.id}`;
  enemy.hp = Math.min(Math.max(0, currentHp), enemy.maxHp);
  const battle: BattleState = {
    id: randomUUID(),
    mode: "monarch",
    status: "active",
    cityId: character.cityId,
    participants: [player, enemy],
    turnParticipantId: player.id,
    log: [entry(`${character.name} desafiou ${monarch.name}.`)],
    winnerParticipantId: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    monarch: {
      attacksUsed: 0,
      attackLimit: MONARCH_BATTLE_ATTACK_LIMIT
    }
  };

  character.activeBattleId = battle.id;
  return battle;
}

export function createPvpBattle(first: Character, second: Character): BattleState {
  const firstParticipant = playerParticipant(first, ITEM_CATALOG);
  const secondParticipant = playerParticipant(second, ITEM_CATALOG);
  const starts = firstParticipant.agility >= secondParticipant.agility ? firstParticipant : secondParticipant;
  const battle: BattleState = {
    id: randomUUID(),
    mode: "pvp",
    status: "active",
    cityId: first.cityId,
    participants: [firstParticipant, secondParticipant],
    turnParticipantId: starts.id,
    log: [entry(`${first.name} e ${second.name} entraram na Arena.`)],
    winnerParticipantId: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    arena: {
      type: "duel",
      challengerPlayerId: first.playerId,
      opponentPlayerId: second.playerId
    }
  };

  first.activeBattleId = battle.id;
  second.activeBattleId = battle.id;
  return battle;
}

export function createRankedPvpBattle(challenger: Character, opponent: Character): BattleState {
  const challengerParticipant = playerParticipant(challenger, ITEM_CATALOG);
  const opponentParticipant = playerParticipant(opponent, ITEM_CATALOG);
  opponentParticipant.id = `ranked:${opponent.playerId}`;
  opponentParticipant.ownerPlayerId = null;
  opponentParticipant.hp = opponentParticipant.maxHp;

  const battle: BattleState = {
    id: randomUUID(),
    mode: "pvp",
    status: "active",
    cityId: challenger.cityId,
    participants: [challengerParticipant, opponentParticipant],
    turnParticipantId: challengerParticipant.id,
    log: [entry(`${challenger.name} desafiou ${opponent.name} em uma Arena Ranqueada.`)],
    winnerParticipantId: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    arena: {
      type: "ranked",
      challengerPlayerId: challenger.playerId,
      opponentPlayerId: opponent.playerId
    }
  };

  challenger.activeBattleId = battle.id;
  return battle;
}

export function takeMonarchBattleTurn(
  battle: BattleState,
  character: Character,
  sharedMonarchHp: number,
  action: "attack" | "usePotion",
  potionInstanceId?: string
) {
  if (battle.status !== "active") {
    throw new Error("A batalha já terminou.");
  }

  const participant = battle.participants.find((entry) => entry.ownerPlayerId === character.playerId);
  const monarch = battle.participants.find((entry) => entry.kind === "monster");
  if (!participant || !monarch) {
    throw new Error("Batalha de monarca invalida.");
  }

  if (battle.turnParticipantId !== participant.id) {
    throw new Error("Aguarde seu turno.");
  }

  monarch.hp = Math.min(Math.max(0, sharedMonarchHp), monarch.maxHp);
  battle.monarch ??= { attacksUsed: 0, attackLimit: MONARCH_BATTLE_ATTACK_LIMIT };
  let damageToMonarch = 0;
  if (action === "usePotion") {
    usePotionInBattle(character, participant, battle, potionInstanceId);
  } else {
    if (battle.monarch.attacksUsed >= battle.monarch.attackLimit) {
      finishMonarchBattleByFatalAttack(battle, monarch, participant);
      battle.updatedAt = Date.now();
      return { damageToMonarch, playerDefeated: true, monarchDefeated: false, fatalTriggered: true };
    }
    damageToMonarch = attack(participant, monarch, battle).damage;
    battle.monarch.attacksUsed += 1;
  }

  if (monarch.hp <= 0) {
    finishBattle(battle, participant);
    battle.updatedAt = Date.now();
    return { damageToMonarch, playerDefeated: false, monarchDefeated: true, fatalTriggered: false };
  }

  if (action === "attack" && battle.monarch.attacksUsed >= battle.monarch.attackLimit) {
    finishMonarchBattleByFatalAttack(battle, monarch, participant);
    battle.updatedAt = Date.now();
    return { damageToMonarch, playerDefeated: true, monarchDefeated: false, fatalTriggered: true };
  }

  attack(monarch, participant, battle);
  if (participant.hp <= 0) {
    finishBattle(battle, monarch);
    battle.updatedAt = Date.now();
    return { damageToMonarch, playerDefeated: true, monarchDefeated: false, fatalTriggered: false };
  }

  battle.turnParticipantId = participant.id;
  battle.updatedAt = Date.now();
  return { damageToMonarch, playerDefeated: false, monarchDefeated: false, fatalTriggered: false };
}

export function takeBattleTurn(
  battle: BattleState,
  character: Character,
  action: "attack" | "usePotion",
  potionInstanceId?: string
) {
  if (battle.status !== "active") {
    throw new Error("A batalha já terminou.");
  }

  const participant = battle.participants.find((entry) => entry.ownerPlayerId === character.playerId);
  if (!participant) {
    throw new Error("Você não participa desta batalha.");
  }

  if (battle.turnParticipantId !== participant.id) {
    throw new Error("Aguarde seu turno.");
  }

  if (action === "usePotion") {
    usePotionInBattle(character, participant, battle, potionInstanceId);
  } else {
    const opponent = getOpponent(battle, participant);
    if (!opponent) {
      throw new Error("Não há alvo disponível.");
    }
    attack(participant, opponent, battle);
  }

  resolveBattleFlow(battle, character);
  battle.updatedAt = Date.now();
}

export function takeAutoPveTurn(battle: BattleState, character: Character) {
  if (battle.mode !== "pve" && battle.mode !== "dungeon") {
    throw new Error("Batalha automática está disponível apenas no PvE.");
  }
  if ((character.pveAutoUntil ?? 0) <= Date.now()) {
    throw new Error("O benefício de batalha PvE automática expirou.");
  }

  const participant = battle.participants.find((entry) => entry.ownerPlayerId === character.playerId);
  if (!participant) {
    throw new Error("Você não participa desta batalha.");
  }

  let turns = 0;
  while (battle.status === "active" && battle.turnParticipantId === participant.id && turns < 80) {
    takeBattleTurn(battle, character, "attack");
    turns += 1;
  }

  if (battle.status === "active" && turns >= 80) {
    battle.log.unshift(entry("Batalha automática pausada para evitar um combate infinito."));
  }
}

export function fleeBattle(battle: BattleState, character: Character) {
  if (battle.status !== "active") {
    throw new Error("A batalha já terminou.");
  }

  const participant = battle.participants.find((entry) => entry.ownerPlayerId === character.playerId);
  if (!participant) {
    throw new Error("Você não participa desta batalha.");
  }

  const opponent = getOpponent(battle, participant);
  battle.status = "ended";
  battle.turnParticipantId = null;
  battle.winnerParticipantId = opponent?.id ?? null;
  battle.updatedAt = Date.now();
  battle.log.unshift(entry(`${character.name} fugiu da batalha.`));
}

export function syncCharacterVitalsFromBattle(battle: BattleState, character: Character) {
  const participant = battle.participants.find((entry) => entry.ownerPlayerId === character.playerId);
  if (!participant) {
    return;
  }

  const stats = deriveStats(character, ITEM_CATALOG);
  character.currentHp = Math.min(Math.max(0, participant.hp), stats.maxHp);
  character.currentEnergy = Math.min(Math.max(0, character.currentEnergy), stats.maxEnergy);
}

function usePotionInBattle(
  character: Character,
  participant: BattleParticipant,
  battle: BattleState,
  potionInstanceId?: string
) {
  if (!potionInstanceId) {
    throw new Error("Escolha uma poção.");
  }

  const inventoryItem = findInventoryItem(character, potionInstanceId);
  if (!inventoryItem) {
    throw new Error("Poção não encontrada.");
  }

  const definition = ITEM_CATALOG[inventoryItem.itemId];
  if (!definition || definition.kind !== "potion") {
    throw new Error("Use uma poção de vida em combate.");
  }

  let recovered = 0;
  let recoveredResource: "vida" | "energia" = "vida";
  if (definition.stats.healPercent !== undefined || definition.stats.heal !== undefined) {
    if (participant.hp >= participant.maxHp) {
      throw new Error("Sua vida já está cheia.");
    }
    recovered = definition.stats.healPercent !== undefined
      ? Math.ceil(participant.maxHp * definition.stats.healPercent)
      : definition.stats.heal ?? 0;
    participant.hp = Math.min(participant.maxHp, participant.hp + recovered);
  } else if (definition.stats.energyPercent !== undefined || definition.stats.energy !== undefined) {
    const stats = deriveStats(character, ITEM_CATALOG);
    if (character.currentEnergy >= stats.maxEnergy) {
      throw new Error("Sua energia já está cheia.");
    }
    recoveredResource = "energia";
    recovered = definition.stats.energyPercent !== undefined
      ? Math.ceil(stats.maxEnergy * definition.stats.energyPercent)
      : definition.stats.energy ?? 0;
    character.currentEnergy = Math.min(stats.maxEnergy, character.currentEnergy + recovered);
  } else {
    throw new Error("Esta poção não tem efeito definido.");
  }
  removeItem(character, inventoryItem.instanceId, 1);
  battle.log.unshift(entry(`${character.name} usou ${definition.name} e recuperou ${recovered} de ${recoveredResource}.`));
}

function resolveBattleFlow(battle: BattleState, actingCharacter: Character) {
  const living = livingParticipants(battle);
  if (living.length === 1) {
    finishBattle(battle, living[0]);
    if (battle.mode === "pve" || battle.mode === "dungeon") {
      grantPveRewards(battle, actingCharacter);
    }
    return;
  }

  if (battle.mode === "pve" || battle.mode === "dungeon") {
    resolveMonsterTurn(battle);
    return;
  }

  if (battle.mode === "pvp" && battle.arena?.type === "ranked") {
    resolveRankedOpponentTurn(battle);
    return;
  }

  const next = battle.participants.find((participant) => participant.id !== battle.turnParticipantId && participant.hp > 0);
  battle.turnParticipantId = next?.id ?? null;
}

function resolveRankedOpponentTurn(battle: BattleState) {
  const challenger = battle.participants.find((participant) => participant.ownerPlayerId === battle.arena?.challengerPlayerId && participant.hp > 0);
  const opponent = battle.participants.find((participant) => participant.ownerPlayerId === null && participant.hp > 0);

  if (!challenger || !opponent) {
    const winner = challenger ?? opponent;
    if (winner) {
      finishBattle(battle, winner);
    }
    return;
  }

  attack(opponent, challenger, battle);

  if (challenger.hp <= 0) {
    finishBattle(battle, opponent);
    return;
  }

  battle.turnParticipantId = challenger.id;
}

function resolveMonsterTurn(battle: BattleState) {
  const monster = battle.participants.find((participant) => participant.kind === "monster" && participant.hp > 0);
  const player = battle.participants.find((participant) => participant.kind === "player" && participant.hp > 0);

  if (!monster || !player) {
    const winner = monster ?? player;
    if (winner) {
      finishBattle(battle, winner);
    }
    return;
  }

  attack(monster, player, battle);

  if (player.hp <= 0) {
    finishBattle(battle, monster);
    return;
  }

  battle.turnParticipantId = player.id;
}

function grantPveRewards(battle: BattleState, character: Character) {
  const monsterParticipant = battle.participants.find((participant) => participant.kind === "monster");
  const winner = battle.participants.find((participant) => participant.id === battle.winnerParticipantId);
  if (!monsterParticipant || winner?.ownerPlayerId !== character.playerId) {
    return;
  }

  const monsterId = monsterParticipant.id.replace("monster:", "");
  const monster = MONSTERS[monsterId];
  if (!monster) {
    return;
  }

  const stats = deriveStats(character, ITEM_CATALOG);
  const activeEvents = getActiveTemporaryEventViews(TEMPORARY_EVENTS);
  const eventBonus = battle.mode === "pve" ? getTemporaryEventBonus(activeEvents, "hunt") : getTemporaryEventBonus(activeEvents, "dungeon");
  const xp = Math.ceil(monster.experience * (1 + stats.xpBonusPercent + eventBonus.xpBonusPercent) * eventBonus.rewardMultiplier);
  const gold = Math.ceil(monster.gold * (1 + stats.goldBonusPercent + eventBonus.goldBonusPercent) * eventBonus.rewardMultiplier);
  character.gold += gold;
  battle.log.unshift(entry(`${character.name} recebeu ${xp} XP e ${gold} ouro.`));
  if (eventBonus.eventNames.length > 0) {
    battle.log.unshift(entry(`Evento ${eventBonus.eventNames.join(", ")} concedeu bônus nesta caçada.`));
  }

  for (const levelMessage of grantExperience(character, xp)) {
    battle.log.unshift(entry(levelMessage));
  }

  for (const drop of monster.drops) {
    const baseDropChance = Math.min(0.95, drop.chance + stats.dropBonusPercent);
    const eventDropChance = Math.min(0.95, baseDropChance * (1 + eventBonus.dropChanceBonusPercent));
    if (Math.random() <= eventDropChance) {
      if (hasCapacity(character, 1)) {
        const definition = ITEM_CATALOG[drop.itemId];
        const rarity = definition?.slot ? getRarityFromRoll() : undefined;
        addItem(character, drop.itemId, ITEM_CATALOG, 1, { rarity });
        battle.log.unshift(entry(`${character.name} encontrou ${ITEM_CATALOG[drop.itemId].name}.`));
      } else {
        battle.log.unshift(entry(`${ITEM_CATALOG[drop.itemId].name} caiu no chão. Inventário cheio.`));
      }
    }
  }
}

export function extractFirstPotion(inventory: InventoryItem[]) {
  return inventory.find((item) => ITEM_CATALOG[item.itemId]?.kind === "potion") ?? null;
}
