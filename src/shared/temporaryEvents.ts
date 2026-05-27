import type {
  TemporaryEventBonusDefinition,
  TemporaryEventBonusScope,
  TemporaryEventDefinition,
  TemporaryEventView
} from "./types";

export interface TemporaryEventBonusSummary {
  xpBonusPercent: number;
  goldBonusPercent: number;
  dropChanceBonusPercent: number;
  rewardMultiplier: number;
  eventNames: string[];
}

const EMPTY_BONUS: TemporaryEventBonusSummary = {
  xpBonusPercent: 0,
  goldBonusPercent: 0,
  dropChanceBonusPercent: 0,
  rewardMultiplier: 1,
  eventNames: []
};

function parseEventTime(value: string) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

export function isTemporaryEventActive(event: TemporaryEventDefinition, now = Date.now()) {
  const startsAtMs = parseEventTime(event.startsAt);
  const endsAtMs = parseEventTime(event.endsAt);
  return startsAtMs > 0 && endsAtMs > 0 && startsAtMs <= now && now <= endsAtMs;
}

export function getActiveTemporaryEventViews(events: TemporaryEventDefinition[], now = Date.now()): TemporaryEventView[] {
  return events
    .map((event) => ({
      ...event,
      startsAtMs: parseEventTime(event.startsAt),
      endsAtMs: parseEventTime(event.endsAt),
      nowMs: now
    }))
    .filter((event) => event.startsAtMs > 0 && event.endsAtMs > 0 && event.startsAtMs <= now && now <= event.endsAtMs)
    .sort((a, b) => a.endsAtMs - b.endsAtMs || a.name.localeCompare(b.name));
}

function bonusAppliesToScope(bonus: TemporaryEventBonusDefinition, scope: TemporaryEventBonusScope) {
  return bonus.scope === "all" || bonus.scope === scope;
}

export function getTemporaryEventBonus(
  events: Array<TemporaryEventDefinition | TemporaryEventView>,
  scope: TemporaryEventBonusScope
): TemporaryEventBonusSummary {
  if (events.length === 0) {
    return EMPTY_BONUS;
  }

  const summary: TemporaryEventBonusSummary = {
    xpBonusPercent: 0,
    goldBonusPercent: 0,
    dropChanceBonusPercent: 0,
    rewardMultiplier: 1,
    eventNames: []
  };

  for (const event of events) {
    let eventApplied = false;
    for (const bonus of event.bonuses) {
      if (!bonusAppliesToScope(bonus, scope)) {
        continue;
      }
      summary.xpBonusPercent += bonus.xpBonusPercent ?? 0;
      summary.goldBonusPercent += bonus.goldBonusPercent ?? 0;
      summary.dropChanceBonusPercent += bonus.dropChanceBonusPercent ?? 0;
      summary.rewardMultiplier *= bonus.rewardMultiplier ?? 1;
      eventApplied = true;
    }
    if (eventApplied) {
      summary.eventNames.push(event.name);
    }
  }

  return summary;
}

export function formatTemporaryEventBonusPercent(value: number) {
  return `${value > 0 ? "+" : ""}${Math.round(value * 100)}%`;
}
