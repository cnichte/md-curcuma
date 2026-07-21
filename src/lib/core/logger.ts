/**
 * Logger mit Spinner, Farben und Datei-Logging
 * @module Logger
 */

import * as fs from "fs";
import * as path from "path";
import * as pc from "picocolors";

const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

export interface LoggerConfig {
  /** Name der Anwendung/des Tasks */
  appName: string;
  /** Version (optional) */
  version?: string;
  /** Pfad zur Log-Datei (optional) */
  logFile?: string;
  /** Log-Level: 'silent' | 'normal' | 'verbose' */
  logLevel?: "silent" | "normal" | "verbose";
  /** Breite der Ausgabe (default: 65) */
  width?: number;
}

export interface TaskStats {
  /** Gesamtzahl der zu verarbeitenden Items */
  total: number;
  /** Anzahl der verarbeiteten Items */
  processed: number;
  /** Anzahl der übersprungenen Items */
  skipped: number;
  /** Anzahl der Fehler */
  errors: number;
  /** Startzeit */
  startTime: Date;
  /** Benutzerdefinierte Statistiken */
  custom: Record<string, number | string>;
}

/**
 * Logger-Klasse für formatierte Konsolen- und Datei-Ausgabe
 */
export class Logger {
  private config: Required<LoggerConfig>;
  private spinnerInterval: NodeJS.Timeout | null = null;
  private spinnerFrame = 0;
  private currentSpinnerText = "";
  private logStream: fs.WriteStream | null = null;
  private stats: TaskStats;

  constructor(config: LoggerConfig) {
    this.config = {
      appName: config.appName,
      version: config.version || "1.0.0",
      logFile: config.logFile || "",
      logLevel: config.logLevel || "normal",
      width: config.width || 65,
    };

    this.stats = this.createEmptyStats();

    // Log-Datei öffnen
    if (this.config.logFile) {
      const logDir = path.dirname(this.config.logFile);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      this.logStream = fs.createWriteStream(this.config.logFile, {
        flags: "w",
        encoding: "utf8",
      });
    }
  }

  /**
   * Erstellt leere Statistiken
   */
  private createEmptyStats(): TaskStats {
    return {
      total: 0,
      processed: 0,
      skipped: 0,
      errors: 0,
      startTime: new Date(),
      custom: {},
    };
  }

  /**
   * Setzt die Statistiken zurück
   */
  resetStats(total: number = 0): void {
    this.stats = this.createEmptyStats();
    this.stats.total = total;
    this.stats.startTime = new Date();
  }

  /**
   * Gibt die aktuellen Statistiken zurück
   */
  getStats(): TaskStats {
    return { ...this.stats };
  }

  /**
   * Erhöht einen Statistik-Wert
   */
  incrementStat(
    key: "processed" | "skipped" | "errors" | string,
    amount: number = 1
  ): void {
    if (key in this.stats && typeof this.stats[key as keyof TaskStats] === "number") {
      (this.stats as any)[key] += amount;
    } else {
      this.stats.custom[key] = ((this.stats.custom[key] as number) || 0) + amount;
    }
  }

  /**
   * Setzt eine benutzerdefinierte Statistik
   */
  setCustomStat(key: string, value: number | string): void {
    this.stats.custom[key] = value;
  }

  // ═══════════════════════════════════════════════════════════════
  // Output-Methoden
  // ═══════════════════════════════════════════════════════════════

  /**
   * Schreibt in Konsole und optional in Datei
   */
  private write(message: string, toFile: boolean = true): void {
    process.stdout.write(message);
    if (toFile && this.logStream) {
      // Strip ANSI codes for file
      const cleanMessage = message.replace(/\x1B\[[0-9;]*m/g, "");
      this.logStream.write(cleanMessage);
    }
  }

  /**
   * Schreibt eine Zeile
   */
  private writeLine(message: string, toFile: boolean = true): void {
    this.write(message + "\n", toFile);
  }

  /**
   * Zeichnet eine horizontale Linie
   */
  line(char: "═" | "─" = "─"): void {
    this.writeLine(pc.dim(char.repeat(this.config.width)));
  }

  /**
   * Zeichnet einen Header
   */
  header(subtitle?: string): void {
    const now = new Date().toLocaleString("de-DE");
    
    this.writeLine(pc.dim("═".repeat(this.config.width)));
    this.writeLine(
      `${pc.cyan("📷")} ${pc.bold(this.config.appName)}  ${pc.dim("v" + this.config.version)}`
    );
    if (subtitle) {
      this.writeLine(`   ${pc.dim(subtitle)}`);
    }
    this.writeLine(`   ${pc.dim("Gestartet:")} ${now}`);
    if (this.config.logFile) {
      this.writeLine(`   ${pc.dim("LogFile:")} ${this.config.logFile}`);
    }
    this.line();
  }

  /**
   * Zeigt Konfiguration an
   */
  showConfig(entries: Record<string, string | number | boolean>): void {
    this.writeLine("");
    this.writeLine(pc.cyan("⚙️  Konfiguration:"));
    for (const [key, value] of Object.entries(entries)) {
      const displayValue =
        typeof value === "boolean"
          ? value
            ? pc.green("aktiviert")
            : pc.dim("deaktiviert")
          : String(value);
      this.writeLine(`   ${pc.dim(key + ":")} ${displayValue}`);
    }
    this.line();
    this.writeLine("");
  }

  // ═══════════════════════════════════════════════════════════════
  // Log-Level Methoden
  // ═══════════════════════════════════════════════════════════════

  /**
   * Info-Nachricht
   */
  info(message: string): void {
    if (this.config.logLevel === "silent") return;
    this.stopSpinner();
    this.writeLine(`   ${pc.blue("ℹ")} ${message}`);
  }

  /**
   * Erfolgs-Nachricht
   */
  success(message: string): void {
    if (this.config.logLevel === "silent") return;
    this.stopSpinner();
    this.writeLine(`   ${pc.green("✔")} ${message}`);
  }

  /**
   * Warnung
   */
  warn(message: string): void {
    if (this.config.logLevel === "silent") return;
    this.stopSpinner();
    this.writeLine(`   ${pc.yellow("⚠")} ${pc.yellow(message)}`);
  }

  /**
   * Fehler
   */
  error(message: string, error?: Error): void {
    this.stopSpinner();
    
    // Wenn Progress aktiv ist: Zeilen temporär löschen für saubere Fehlerausgabe
    if (this.progressInitialized) {
      // Cursor auf Zeile 1 und alle 3 Zeilen löschen
      process.stdout.write(`\r\x1B[K\n\x1B[K\n\x1B[K\x1B[2A\r`);
    }
    
    this.writeLine(`   ${pc.red("✖")} ${pc.red(message)}`);
    if (error && this.config.logLevel === "verbose") {
      this.writeLine(`     ${pc.dim(error.stack || error.message)}`);
    }
    this.stats.errors++;
    
    // Progress-Anzeige muss nach Fehler neu gezeichnet werden
    // Das passiert automatisch beim nächsten progress()-Aufruf
    if (this.progressInitialized) {
      // Neue Zeilen für Progress reservieren
      process.stdout.write(`\n\n`);
    }
  }

  /**
   * Verbose-Nachricht (nur bei logLevel: verbose)
   */
  verbose(message: string): void {
    if (this.config.logLevel !== "verbose") return;
    this.writeLine(`   ${pc.dim(message)}`);
  }

  /**
   * Skip-Nachricht
   */
  skip(message: string): void {
    if (this.config.logLevel !== "verbose") return;
    this.writeLine(`   ${pc.dim("○")} ${pc.dim(message)}`);
    this.stats.skipped++;
  }

  // ═══════════════════════════════════════════════════════════════
  // Spinner & Progress
  // ═══════════════════════════════════════════════════════════════

  /**
   * Startet einen Spinner mit Text
   */
  startSpinner(text: string): void {
    if (this.config.logLevel === "silent") return;
    this.stopSpinner();
    this.currentSpinnerText = text;
    this.spinnerFrame = 0;

    this.spinnerInterval = setInterval(() => {
      const frame = SPINNER_FRAMES[this.spinnerFrame % SPINNER_FRAMES.length];
      process.stdout.write(`\r   ${pc.cyan(frame)} ${this.currentSpinnerText}`);
      this.spinnerFrame++;
    }, 80);
  }

  /**
   * Aktualisiert den Spinner-Text
   */
  updateSpinner(text: string): void {
    this.currentSpinnerText = text;
    // Log to file without spinner
    if (this.logStream) {
      this.logStream.write(`   ${text}\n`);
    }
  }

  /**
   * Stoppt den Spinner
   */
  stopSpinner(finalText?: string, status: "success" | "error" | "info" = "success"): void {
    if (this.spinnerInterval) {
      clearInterval(this.spinnerInterval);
      this.spinnerInterval = null;

      // Clear line
      process.stdout.write("\r" + " ".repeat(this.config.width) + "\r");

      if (finalText) {
        const icon =
          status === "success"
            ? pc.green("✔")
            : status === "error"
            ? pc.red("✖")
            : pc.blue("ℹ");
        this.writeLine(`   ${icon} ${finalText}`);
      }
    }
  }

  // Anzahl der Progress-Zeilen (für das Aufräumen)
  private progressLines = 3;
  private lastProgressTime = 0;
  private progressInitialized = false;

  /**
   * Zeigt mehrzeiligen Fortschritt an
   * Zeile 1: Fortschrittsbalken mit Spinner und Prozent
   * Zeile 2: Aktueller Dateiname/Pfad
   * Zeile 3: Aktuelle Aktion/Info
   */
  progress(current: number, total: number, itemName?: string, action?: string): void {
    if (this.config.logLevel === "silent") return;

    const now = Date.now();
    
    // Throttle: Nicht öfter als alle 50ms aktualisieren
    // Aber: Erstes und letztes Update immer anzeigen
    const isFirst = !this.progressInitialized;
    const isLast = current >= total;
    if (!isFirst && !isLast && now - this.lastProgressTime < 50) {
      return;
    }
    this.lastProgressTime = now;

    const percent = Math.round((current / total) * 100);
    const frame = SPINNER_FRAMES[current % SPINNER_FRAMES.length];
    
    // Fortschrittsbalken
    const barWidth = 30;
    const filled = Math.round((current / total) * barWidth);
    const empty = barWidth - filled;
    const bar = pc.green("█".repeat(filled)) + pc.dim("░".repeat(empty));

    // Geschätzte verbleibende Zeit
    const elapsed = now - this.stats.startTime.getTime();
    const avgTimePerItem = current > 0 ? elapsed / current : 0;
    const remaining = Math.round((total - current) * avgTimePerItem);
    const eta = this.formatDuration(remaining);

    // Zeile 1: Fortschrittsbalken
    const line1 = `   ${pc.cyan(frame)} [${bar}] ${current.toLocaleString("de-DE")}/${total.toLocaleString("de-DE")} (${percent}%) ${pc.dim(`ETA: ${eta}`)}`;
    
    // Zeile 2: Dateiname (gekürzt wenn nötig)
    const maxNameLen = this.config.width - 8;
    const displayName = itemName 
      ? (itemName.length > maxNameLen ? "..." + itemName.slice(-maxNameLen + 3) : itemName)
      : "";
    const line2 = `   ${pc.dim("📄")} ${pc.white(displayName)}`;
    
    // Zeile 3: Aktion/Status
    const line3 = action 
      ? `   ${pc.dim("⚡")} ${pc.dim(action)}`
      : `   ${pc.dim("⚡")} ${pc.dim(`Bearbeitet: ${this.stats.processed} | Übersprungen: ${this.stats.skipped} | Fehler: ${this.stats.errors}`)}`;

    // Cursor-Steuerung für mehrzeilige Ausgabe
    if (!this.progressInitialized) {
      // Erstes Mal: 3 Platzhalter-Zeilen anlegen, dann zurück und überschreiben
      this.progressInitialized = true;
      process.stdout.write(`\n\n\n\x1B[3A`);
    }
    
    // Immer: Von aktueller Position aus 3 Zeilen schreiben und zurück
    process.stdout.write(`\r${line1}\x1B[K\n${line2}\x1B[K\n${line3}\x1B[K\x1B[2A\r`);

    // Log to file (weniger oft)
    if (this.logStream && current % Math.max(1, Math.floor(total / 20)) === 0) {
      this.logStream.write(`   [${current}/${total}] ${itemName || ""}\n`);
    }
  }

  /**
   * Beendet die Fortschrittsanzeige
   */
  progressDone(message?: string): void {
    if (!this.progressInitialized) return;
    
    // Cursor ist auf Zeile 1. Alle 3 Zeilen löschen.
    process.stdout.write(`\r`);
    for (let i = 0; i < this.progressLines; i++) {
      process.stdout.write(" ".repeat(this.config.width + 20) + "\n");
    }
    // Zurück zum Anfang
    process.stdout.write(`\x1B[${this.progressLines}A\r`);
    
    // Flag zurücksetzen für nächste Verwendung
    this.progressInitialized = false;
    
    if (message) {
      this.success(message);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Summary & Footer
  // ═══════════════════════════════════════════════════════════════

  /**
   * Formatiert eine Dauer
   */
  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms} ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)} s`;
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    if (minutes < 60) return `${minutes} min ${seconds} s`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} h ${mins} min`;
  }

  /**
   * Zeigt die Zusammenfassung
   */
  summary(additionalStats?: Record<string, string | number>): void {
    const duration = Date.now() - this.stats.startTime.getTime();
    
    this.writeLine("");
    this.line();
    this.writeLine("");
    this.writeLine(pc.cyan("📊 Zusammenfassung:"));
    this.writeLine(`   ${pc.dim("Dauer:")} ${this.formatDuration(duration)}`);
    this.writeLine("");
    
    this.writeLine(`   ${pc.dim("Gesamt:")}     ${this.stats.total}`);
    this.writeLine(
      `   ${pc.green("✔ Bearbeitet:")} ${this.stats.processed}`
    );
    if (this.stats.skipped > 0) {
      this.writeLine(
        `   ${pc.dim("○ Übersprungen:")} ${this.stats.skipped}`
      );
    }
    if (this.stats.errors > 0) {
      this.writeLine(`   ${pc.red("✖ Fehler:")} ${this.stats.errors}`);
    }

    // Custom stats
    for (const [key, value] of Object.entries(this.stats.custom)) {
      this.writeLine(`   ${pc.dim(key + ":")} ${value}`);
    }

    // Additional stats
    if (additionalStats) {
      this.writeLine("");
      for (const [key, value] of Object.entries(additionalStats)) {
        this.writeLine(`   ${pc.dim(key + ":")} ${value}`);
      }
    }

    this.writeLine("");
  }

  /**
   * Zeigt den Footer
   */
  footer(success: boolean = true): void {
    if (success) {
      this.writeLine(pc.green("✅ Verarbeitung abgeschlossen."));
    } else {
      this.writeLine(pc.red("❌ Verarbeitung mit Fehlern beendet."));
    }
    this.writeLine(pc.dim("═".repeat(this.config.width)));
  }

  /**
   * Schließt den Logger und die Log-Datei
   */
  async close(): Promise<void> {
    this.stopSpinner();
    if (this.logStream) {
      return new Promise((resolve) => {
        this.logStream!.end(() => {
          this.logStream = null;
          resolve();
        });
      });
    }
  }
}

// Singleton-Instanz für globalen Zugriff
let globalLogger: Logger | null = null;

/**
 * Erstellt oder gibt die globale Logger-Instanz zurück
 */
export function getLogger(config?: LoggerConfig): Logger {
  if (config) {
    globalLogger = new Logger(config);
  }
  if (!globalLogger) {
    globalLogger = new Logger({ appName: "md-curcuma" });
  }
  return globalLogger;
}

export default Logger;
