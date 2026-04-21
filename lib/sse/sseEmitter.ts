// Server-Sent Events emitter
// Simple in-process broadcast for single-instance deployments
// For multi-instance: replace with Redis pub/sub

type Listener = (data: SSEEvent) => void;

export type SSEEvent = {
  type: "NEW_ORDER" | "ORDER_UPDATED" | "PING";
  payload?: any;
};

class SSEEmitter {
  private listeners: Set<Listener> = new Set();

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  emit(event: SSEEvent) {
    this.listeners.forEach((fn) => {
      try {
        fn(event);
      } catch {
        // listener may have disconnected
        this.listeners.delete(fn);
      }
    });
  }

  get listenerCount() {
    return this.listeners.size;
  }
}

// Singleton (survives hot reload in dev via globalThis)
const globalForSSE = globalThis as unknown as { sseEmitter: SSEEmitter | undefined };
export const sseEmitter = globalForSSE.sseEmitter ?? new SSEEmitter();
if (process.env.NODE_ENV !== "production") globalForSSE.sseEmitter = sseEmitter;
