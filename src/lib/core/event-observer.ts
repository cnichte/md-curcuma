// Neue Observer-Logik.

// Interface für die Event-Map (typsisierte Events)
interface EventMap {
  readable: (data: string) => void;
  error: (error: Error) => void;
}

// Typendefinition für die Callback-Funktion
type EventCallback<T extends keyof EventMap> = EventMap[T];

// Interface für das Subjekt
interface IObserver {
  on<T extends keyof EventMap>(event: T, callback: EventCallback<T>): void;
  off<T extends keyof EventMap>(event: T, callback: EventCallback<T>): void;
  once<T extends keyof EventMap>(event: T, callback: EventCallback<T>): void;
  emit<T extends keyof EventMap>(event: T, ...args: Parameters<EventCallback<T>>): void;
}

// Implementierung des Observers
class EventObserver implements IObserver {
  private events: Map<keyof EventMap, Set<(...args: any[]) => void>>;

  constructor() {
    this.events = new Map();
  }

  // Registriert einen Event-Listener
  on<T extends keyof EventMap>(event: T, callback: EventCallback<T>): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(callback);
  }

  // Registriert einen einmaligen Event-Listener
  once<T extends keyof EventMap>(event: T, callback: EventCallback<T>): void {
    // Explizite Typumwandlung, um Typkonflikt zu vermeiden
    const wrapper = (...args: Parameters<EventCallback<T>>) => {
      (callback as (...args: any[]) => void)(...args);
      this.off(event, wrapper as EventCallback<T>);
    };
    this.on(event, wrapper as EventCallback<T>);
  }

  // Entfernt einen Event-Listener
  off<T extends keyof EventMap>(event: T, callback: EventCallback<T>): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.events.delete(event);
      }
    }
  }

  // Löst ein Ereignis aus und benachrichtigt alle Listener
  emit<T extends keyof EventMap>(event: T, ...args: Parameters<EventCallback<T>>): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        callback(...args);
      });
    }
  }
}

// Beispiel: Verwendung mit einem Parser
class Parser {
  private observer: EventObserver;

  constructor() {
    this.observer = new EventObserver();
  }

  // Methode zum Registrieren von Event-Listenern
  on<T extends keyof EventMap>(event: T, callback: EventCallback<T>): void {
    this.observer.on(event, callback);
  }

  // Methode zum Registrieren von einmaligen Event-Listenern
  once<T extends keyof EventMap>(event: T, callback: EventCallback<T>): void {
    this.observer.once(event, callback);
  }

  // Simulierte Parsermethode, die ein Ereignis auslöst
  parse(data: string): void {
    console.log(`Parsing: ${data}`);
    this.observer.emit("readable", data);
  }

  // Simulierte Fehlerauslösung
  triggerError(error: Error): void {
    this.observer.emit("error", error);
  }
}

// Verwendung
const parser = new Parser();

// Event-Listener für "readable"
parser.on("readable", (data: string) => {
  console.log(`Readable event received with data: ${data}`);
});

// Einmaliger Listener für "readable"
parser.once("readable", (data: string) => {
  console.log(`Once readable event received with data: ${data}`);
});

// Event-Listener für "error"
parser.on("error", (error: Error) => {
  console.log(`Error event received: ${error.message}`);
});

// Test
parser.parse("Test Data"); // Beide Listener werden aufgerufen
parser.parse("More Data"); // Nur der normale Listener wird aufgerufen
parser.triggerError(new Error("Parsing failed")); // Fehler-Listener wird aufgerufen