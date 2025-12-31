/**
 * A map of all possible application-wide events and their payload types.
 * This provides a single source of truth for event names and their data structures,
 * effectively creating a trackable list of all configured event listeners.
 *
 * To add a new event:
 * 1. Add a new key-value pair to `AppEventMap`.
 * 2. The key is the event name (e.g., 'my-new-event').
 * 3. The value is a tuple representing the parameters the listener will receive (e.g., [param1: string, param2: number]).
 */
export type AppEventMap = {
  "refresh-screen": [targetScreen: string];
  "chat-list-update": []; // No payload needed, it's a general refresh signal
  "refresh-subscriptions": [];
};

type EventKey = keyof AppEventMap;
type EventListener<K extends EventKey> = (...args: AppEventMap[K]) => void;

/**
 * A strongly-typed EventEmitter for application-wide communication.
 * It ensures that event names are valid and that payloads match their expected types.
 */
class TypedEventEmitter {
  private events: { [K in EventKey]?: Array<EventListener<K>> } = {};

  on<K extends EventKey>(event: K, listener: EventListener<K>): () => void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event]?.push(listener);
    // Return a function to unsubscribe
    return () => this.off(event, listener);
  }

  off<K extends EventKey>(event: K, listenerToRemove: EventListener<K>) {
    if (!this.events[event]) {
      return;
    }

    this.events[event] = this.events[event]?.filter(
      (listener) => listener !== listenerToRemove
    );
  }

  emit<K extends EventKey>(event: K, ...args: AppEventMap[K]) {
    this.events[event]?.forEach((listener) => listener(...args));
  }
}

/**
 * A singleton instance of the TypedEventEmitter for use across the application.
 */
export const AppEvents = new TypedEventEmitter();
