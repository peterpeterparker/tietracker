export function formatTime(value: number | undefined): string {
  if (!value || value === undefined) {
    return `0h 0min`;
  }

  const hours: number = Math.floor(value / 1000 / 3600);
  const minutes: number = Math.floor((value / 1000 - hours * 3600) / 60);

  return `${hours}h ${minutes}min`;
}

export function formatSeconds(seconds: number): string {
  const diffHours = Math.floor(seconds / 3600);
  const s = seconds % 3600;
  const diffMinutes: number = Math.floor(s / 60);
  const diffSeconds: number = Math.floor(s % 60);

  return `${diffHours >= 99 ? '99' : diffHours < 10 ? '0' + diffHours : diffHours}:${
    diffMinutes < 10 ? '0' + diffMinutes : diffMinutes
  }:${diffSeconds < 10 ? '0' + diffSeconds : diffSeconds}`;
}
