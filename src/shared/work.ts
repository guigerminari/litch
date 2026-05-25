import type { WorkAptitudeState, WorkReward, WorkServiceDefinition } from "./types";

export function getDefaultWorkAptitude(): WorkAptitudeState {
  return {
    level: 0,
    progressHours: 0,
    totalHours: 0,
    completions: 0
  };
}

export function getHoursForNextWorkLevel(level: number) {
  return Math.max(3, Math.max(1, level) * 3);
}

export function getWorkHoursFromMinutes(minutes: number) {
  return Math.max(0, minutes) / 60;
}

export function normalizeWorkMinutes(service: WorkServiceDefinition, minutes: number) {
  const requested = Math.max(service.minMinutes, Math.min(service.maxMinutes, Math.floor(minutes || service.minMinutes)));
  if (service.minuteOptions.includes(requested)) {
    return requested;
  }
  const available = service.minuteOptions.filter((option) => option >= service.minMinutes && option <= service.maxMinutes);
  return available.reduce((closest, option) =>
    Math.abs(option - requested) < Math.abs(closest - requested) ? option : closest,
    available[0] ?? service.minMinutes
  );
}

export function normalizeWorkHours(service: WorkServiceDefinition, hours: number) {
  return getWorkHoursFromMinutes(normalizeWorkMinutes(service, hours * 60));
}

export function getWorkDurationMultiplier(service: WorkServiceDefinition, minutes: number) {
  const span = Math.max(1, service.maxMinutes - service.minMinutes);
  const shortness = Math.max(0, Math.min(1, (service.maxMinutes - minutes) / span));
  return 1 + shortness * service.shortDurationBonusPercent;
}

export function getWorkAptitudeMultiplier(service: WorkServiceDefinition, aptitude?: WorkAptitudeState) {
  return 1 + Math.max(0, aptitude?.level ?? 0) * service.aptitudeRewardBonusPercent;
}

export function calculateWorkReward(service: WorkServiceDefinition, aptitude: WorkAptitudeState | undefined, minutes: number): WorkReward {
  const normalizedMinutes = normalizeWorkMinutes(service, minutes);
  const hours = getWorkHoursFromMinutes(normalizedMinutes);
  const multiplier = hours * getWorkDurationMultiplier(service, normalizedMinutes) * getWorkAptitudeMultiplier(service, aptitude);
  return scaleWorkReward(service.rewardsPerHour, multiplier);
}

export function scaleWorkReward(reward: WorkReward, multiplier: number): WorkReward {
  const next: WorkReward = {};
  if (reward.experience) next.experience = Math.max(1, Math.round(reward.experience * multiplier));
  if (reward.gold) next.gold = Math.max(1, Math.round(reward.gold * multiplier));
  if (reward.diamonds) next.diamonds = Math.max(1, Math.floor(reward.diamonds * multiplier));
  if (reward.attributePoints) next.attributePoints = Math.max(1, Math.floor(reward.attributePoints * multiplier));
  if (reward.items?.length) {
    next.items = reward.items
      .map((item) => ({
        itemId: item.itemId,
        quantity: Math.max(1, Math.floor(item.quantity * multiplier))
      }))
      .filter((item) => item.quantity > 0);
  }
  return next;
}

export function progressWorkAptitude(current: WorkAptitudeState | undefined, minutes: number): WorkAptitudeState {
  const next = { ...(current ?? getDefaultWorkAptitude()) };
  const hours = getWorkHoursFromMinutes(minutes);
  next.completions += 1;
  next.totalHours += hours;
  if (next.level <= 0) {
    next.level = 1;
  }
  next.progressHours += hours;
  while (next.progressHours >= getHoursForNextWorkLevel(next.level)) {
    next.progressHours -= getHoursForNextWorkLevel(next.level);
    next.level += 1;
  }
  return next;
}

export function isWorkInProgress(activeWork: { endsAt: number } | null | undefined, now = Date.now()) {
  return Boolean(activeWork && activeWork.endsAt > now);
}

export function isWorkReady(activeWork: { endsAt: number } | null | undefined, now = Date.now()) {
  return Boolean(activeWork && activeWork.endsAt <= now);
}
