export function isOnline(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}

export function getConnectionType(): string | null {
  if (typeof navigator === "undefined") return null;
  const connection = (
    navigator as Navigator & {
      connection?: { effectiveType?: string };
    }
  ).connection;
  return connection?.effectiveType ?? null;
}

export function shouldReduceDataUsage(): boolean {
  const type = getConnectionType();
  return type === "slow-2g" || type === "2g" || type === "3g";
}
