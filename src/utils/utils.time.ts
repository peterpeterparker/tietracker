export function formatTime(value: number | undefined): string {
  if (!value || value === undefined) {
    return `0h 0min`;
  }

  const hours: number = Math.floor(value / 1000 / 3600);
  const minutes: number = Math.floor((value / 1000 - hours * 3600) / 60);

  return `${hours}h ${minutes}min`;
}
