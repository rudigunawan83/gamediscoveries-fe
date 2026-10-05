/**
 * Future Flutter WebView bridge messages (Phase 02 abstraction only).
 * Flutter owns trusted session lifecycle; WebView messages are advisory.
 */
export type GameBridgeMessageType =
  | "GAME_READY"
  | "GAME_STARTED"
  | "GAME_PAUSED"
  | "GAME_RESUMED"
  | "GAME_COMPLETED";

export type GameBridgeMessage = {
  type: GameBridgeMessageType;
  payload?: Record<string, unknown>;
  occurredAt?: string;
};

export type GameEventBridgeHandler = (message: GameBridgeMessage) => void;

/**
 * Lightweight bridge stub for future Flutter <-> WebView messaging.
 * Do not trust third-party GameMonetize JS as authoritative for duration.
 */
export class GameEventBridge {
  private handler: GameEventBridgeHandler | null = null;

  onMessage(handler: GameEventBridgeHandler) {
    this.handler = handler;
  }

  emit(message: GameBridgeMessage) {
    this.handler?.(message);
  }
}
