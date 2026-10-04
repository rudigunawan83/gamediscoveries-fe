export function calculatePlayDurationSeconds(
  startedAtMs: number | null | undefined,
  endedAtMs: number = Date.now(),
): number {
  if (!startedAtMs || startedAtMs <= 0 || endedAtMs < startedAtMs) {
    return 0;
  }
  return Math.max(0, Math.floor((endedAtMs - startedAtMs) / 1000));
}
