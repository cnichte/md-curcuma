/**
 * ResumeManager - Ermöglicht das Fortsetzen von unterbrochenen Verarbeitungen
 *
 * Speichert den Verarbeitungsstatus in einer JSON-Datei, sodass nach einem
 * Abbruch (Strg+C, Fehler, etc.) die Verarbeitung fortgesetzt werden kann.
 *
 * @module core/resume-manager
 */

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

/**
 * Status eines einzelnen Items
 */
export interface ResumeItem {
  /** Dateipfad oder eindeutiger Identifier */
  id: string;
  /** Status: processed, skipped, error */
  status: "processed" | "skipped" | "error";
  /** Zeitstempel der Verarbeitung */
  timestamp: string;
  /** Optionale Fehlermeldung */
  error?: string;
}

/**
 * Struktur der State-Datei
 */
export interface ResumeState {
  /** Version des State-Formats */
  version: number;
  /** Name/Beschreibung des Jobs */
  jobName: string;
  /** Hash der Konfiguration (um Änderungen zu erkennen) */
  configHash: string;
  /** Startzeitpunkt des Jobs */
  startedAt: string;
  /** Letztes Update */
  lastUpdatedAt: string;
  /** Gesamtzahl der zu verarbeitenden Items (wenn bekannt) */
  totalItems?: number;
  /** Verarbeitete Items */
  items: Record<string, ResumeItem>;
}

/**
 * Konfiguration für den ResumeManager
 */
export interface ResumeManagerConfig {
  /** Pfad zur State-Datei */
  stateFile: string;
  /** Name des Jobs (zur Identifikation) */
  jobName: string;
  /** Konfiguration des Jobs (wird gehasht um Änderungen zu erkennen) */
  jobConfig?: Record<string, any>;
  /** Automatisches Speichern nach X Items (default: 10) */
  autoSaveInterval?: number;
  /** Bei Konfigurationsänderung: State löschen? (default: true) */
  resetOnConfigChange?: boolean;
}

/**
 * ResumeManager - Verwaltet den Fortschritt einer Verarbeitung
 */
export class ResumeManager {
  private config: Required<ResumeManagerConfig>;
  private state: ResumeState;
  private pendingChanges: number = 0;
  private initialized: boolean = false;

  constructor(config: ResumeManagerConfig) {
    this.config = {
      stateFile: config.stateFile,
      jobName: config.jobName,
      jobConfig: config.jobConfig || {},
      autoSaveInterval: config.autoSaveInterval ?? 10,
      resetOnConfigChange: config.resetOnConfigChange ?? true,
    };

    // Leeren State initialisieren
    this.state = this.createEmptyState();
  }

  /**
   * Erstellt einen leeren State
   */
  private createEmptyState(): ResumeState {
    return {
      version: 1,
      jobName: this.config.jobName,
      configHash: this.hashConfig(),
      startedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      items: {},
    };
  }

  /**
   * Erstellt einen Hash der Job-Konfiguration
   */
  private hashConfig(): string {
    const configString = JSON.stringify(this.config.jobConfig, Object.keys(this.config.jobConfig).sort());
    return crypto.createHash("md5").update(configString).digest("hex").substring(0, 8);
  }

  /**
   * Initialisiert den ResumeManager und lädt existierenden State
   * @returns Anzahl der bereits verarbeiteten Items
   */
  initialize(): number {
    if (this.initialized) {
      return this.getProcessedCount();
    }

    if (fs.existsSync(this.config.stateFile)) {
      try {
        const content = fs.readFileSync(this.config.stateFile, "utf-8");
        const loadedState = JSON.parse(content) as ResumeState;

        // Prüfe ob die Konfiguration geändert wurde
        const currentHash = this.hashConfig();
        if (loadedState.configHash !== currentHash) {
          if (this.config.resetOnConfigChange) {
            // Konfiguration geändert -> State zurücksetzen
            this.state = this.createEmptyState();
          } else {
            // Alten State behalten aber Hash aktualisieren
            this.state = loadedState;
            this.state.configHash = currentHash;
          }
        } else {
          // Konfiguration unverändert -> State wiederherstellen
          this.state = loadedState;
        }
      } catch (error) {
        // Fehler beim Laden -> neuer State
        this.state = this.createEmptyState();
      }
    }

    this.initialized = true;
    return this.getProcessedCount();
  }

  /**
   * Prüft ob ein Item bereits verarbeitet wurde
   */
  isProcessed(id: string): boolean {
    const item = this.state.items[id];
    return item?.status === "processed";
  }

  /**
   * Prüft ob ein Item übersprungen wurde
   */
  isSkipped(id: string): boolean {
    const item = this.state.items[id];
    return item?.status === "skipped";
  }

  /**
   * Prüft ob ein Item bereits verarbeitet oder übersprungen wurde
   */
  isDone(id: string): boolean {
    const item = this.state.items[id];
    return item?.status === "processed" || item?.status === "skipped";
  }

  /**
   * Markiert ein Item als verarbeitet
   */
  markProcessed(id: string): void {
    this.state.items[id] = {
      id,
      status: "processed",
      timestamp: new Date().toISOString(),
    };
    this.state.lastUpdatedAt = new Date().toISOString();
    this.autoSave();
  }

  /**
   * Markiert ein Item als übersprungen
   */
  markSkipped(id: string): void {
    this.state.items[id] = {
      id,
      status: "skipped",
      timestamp: new Date().toISOString(),
    };
    this.state.lastUpdatedAt = new Date().toISOString();
    this.autoSave();
  }

  /**
   * Markiert ein Item als fehlerhaft
   */
  markError(id: string, error?: string): void {
    this.state.items[id] = {
      id,
      status: "error",
      timestamp: new Date().toISOString(),
      error,
    };
    this.state.lastUpdatedAt = new Date().toISOString();
    this.autoSave();
  }

  /**
   * Speichert automatisch nach X Änderungen
   */
  private autoSave(): void {
    this.pendingChanges++;
    if (this.pendingChanges >= this.config.autoSaveInterval) {
      this.save();
    }
  }

  /**
   * Speichert den State sofort
   */
  save(): void {
    try {
      // Verzeichnis erstellen falls nötig
      const dir = path.dirname(this.config.stateFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(
        this.config.stateFile,
        JSON.stringify(this.state, null, 2),
        "utf-8"
      );
      this.pendingChanges = 0;
    } catch (error) {
      console.error("Fehler beim Speichern des Resume-States:", error);
    }
  }

  /**
   * Setzt die Gesamtzahl der Items (für Statistiken)
   */
  setTotalItems(count: number): void {
    this.state.totalItems = count;
  }

  /**
   * Gibt die Anzahl der bereits verarbeiteten Items zurück
   */
  getProcessedCount(): number {
    return Object.values(this.state.items).filter(i => i.status === "processed").length;
  }

  /**
   * Gibt die Anzahl der übersprungenen Items zurück
   */
  getSkippedCount(): number {
    return Object.values(this.state.items).filter(i => i.status === "skipped").length;
  }

  /**
   * Gibt die Anzahl der fehlerhaften Items zurück
   */
  getErrorCount(): number {
    return Object.values(this.state.items).filter(i => i.status === "error").length;
  }

  /**
   * Gibt die Gesamtzahl der erledigten Items zurück (processed + skipped)
   */
  getDoneCount(): number {
    return Object.values(this.state.items).filter(
      i => i.status === "processed" || i.status === "skipped"
    ).length;
  }

  /**
   * Gibt Statistiken zurück
   */
  getStats(): {
    total: number | undefined;
    processed: number;
    skipped: number;
    errors: number;
    done: number;
    remaining: number | undefined;
    percentDone: number | undefined;
  } {
    const processed = this.getProcessedCount();
    const skipped = this.getSkippedCount();
    const errors = this.getErrorCount();
    const done = processed + skipped;
    const total = this.state.totalItems;

    return {
      total,
      processed,
      skipped,
      errors,
      done,
      remaining: total !== undefined ? total - done : undefined,
      percentDone: total !== undefined && total > 0 ? Math.round((done / total) * 100) : undefined,
    };
  }

  /**
   * Gibt alle fehlerhaften Items zurück
   */
  getErrors(): ResumeItem[] {
    return Object.values(this.state.items).filter(i => i.status === "error");
  }

  /**
   * Setzt den State zurück (für Neustart)
   */
  reset(): void {
    this.state = this.createEmptyState();
    this.pendingChanges = 0;
    
    // State-Datei löschen
    if (fs.existsSync(this.config.stateFile)) {
      fs.unlinkSync(this.config.stateFile);
    }
  }

  /**
   * Finalisiert den ResumeManager (speichert ausstehende Änderungen)
   */
  finalize(): void {
    if (this.pendingChanges > 0) {
      this.save();
    }
  }

  /**
   * Gibt den Pfad zur State-Datei zurück
   */
  getStateFilePath(): string {
    return this.config.stateFile;
  }

  /**
   * Prüft ob ein vorheriger State existiert
   */
  hasPreviousState(): boolean {
    return fs.existsSync(this.config.stateFile);
  }

  /**
   * Gibt den Startzeitpunkt des Jobs zurück
   */
  getStartTime(): Date {
    return new Date(this.state.startedAt);
  }
}

// Export für einfachen Import
export default ResumeManager;
