//! Teste: Image Date Extraction und EXIF Writing
import * as path from "path";
import { Runner, Logger, ResumeManager } from "../src/lib/core";
import { Image_IO_Reader, Image_IO_Writer } from "../src/lib/io";
import {
  Filename_Date_Task,
  FILENAME_DATE_PATTERNS,
} from "../src/lib/tasks/Filename_Date_Task";

/**
 * Dieser Test demonstriert den kompletten Workflow:
 *
 * 1. Liest Bilder aus einem Verzeichnis (inkl. Unterverzeichnisse)
 * 2. Extrahiert Datum/Uhrzeit aus dem Dateinamen
 * 3. Kopiert die Bilder in ein Zielverzeichnis (Struktur wird beibehalten)
 * 4. Setzt File Creation/Modified Date
 * 5. Schreibt EXIF-Daten via exiftool
 *
 * NEU: Resume-Funktion - nach Abbruch wird fortgesetzt wo aufgehört wurde
 */

// ═══════════════════════════════════════════════════════════════
// KONFIGURATION
// ═══════════════════════════════════════════════════════════════

// Test-Daten (kleine Menge)
// const SOURCE_PATH = "test-data/exif/images-input";
// const TARGET_PATH = "test-data/exif/images-output";

// Echte Fotos (große Menge - ca. 38.000 Bilder!)
const SOURCE_PATH = "/Users/cnichte/Pictures/fotos-familie/fotos";
const TARGET_PATH = "/Users/cnichte/Pictures/fotos-familie/fotos";

const CONFIG = {
  simulate: false,          // ← ERST MAL SIMULATION! false für echte Änderungen
  limit: 0,                 // 0 = kein Limit, z.B. 100 für Test
  doSubfolders: true,       // Unterverzeichnisse durchsuchen
  fileExtensions: [".jpg", ".jpeg", ".png", ".dng"],
  logLevel: "normal" as "silent" | "normal" | "verbose",
  resume: true,             // Resume-Modus: nach Abbruch fortsetzen
};

// ═══════════════════════════════════════════════════════════════

async function main() {
  // Logger initialisieren
  const logger = new Logger({
    appName: "Image Date Extractor",
    version: "1.0.0",
    logFile: path.join(process.cwd(), ".image-date.log"),
    logLevel: CONFIG.logLevel,
    width: 65,
  });

  // ResumeManager initialisieren (nur wenn aktiviert)
  let resumeManager: ResumeManager | undefined;
  if (CONFIG.resume) {
    resumeManager = new ResumeManager({
      stateFile: path.join(process.cwd(), ".image-date.state.json"),
      jobName: "image-date-extractor",
      jobConfig: {
        source: SOURCE_PATH,
        target: TARGET_PATH,
        fileExtensions: CONFIG.fileExtensions,
      },
      autoSaveInterval: 10, // Alle 10 Dateien speichern
    });
    
    // Resume initialisieren
    resumeManager.initialize();
  }

  // Header anzeigen
  logger.header("EXIF & Dateidatum aus Dateinamen setzen");

  // Konfiguration anzeigen
  logger.showConfig({
    "Quelle": SOURCE_PATH,
    "Ziel": TARGET_PATH,
    "Modus": SOURCE_PATH === TARGET_PATH ? "IN-PLACE" : "COPY",
    "Simulation": CONFIG.simulate,
    "Limit": CONFIG.limit || "kein Limit",
    "Unterordner": CONFIG.doSubfolders,
    "Dateitypen": CONFIG.fileExtensions.join(", "),
    "Resume": CONFIG.resume ? "aktiviert" : "deaktiviert",
  });

  const runner = new Runner<any>();

  // Reader konfigurieren
  const reader = new Image_IO_Reader<any>({
    path: SOURCE_PATH,
    doSubfolders: CONFIG.doSubfolders,
    limit: CONFIG.limit,
    useCounter: false, // Logger übernimmt die Anzeige
    simulate: CONFIG.simulate,
    fileExtensions: CONFIG.fileExtensions,
    logger: logger,
  });

  // Dateien vorab zählen
  logger.startSpinner("Scanne Verzeichnisse...");
  const fileCount = reader.prepare();
  logger.stopSpinner(`${fileCount.toLocaleString("de-DE")} Dateien gefunden`, "success");
  
  // Resume-Stats anzeigen (nach dem Scan)
  if (resumeManager) {
    const resumeStats = resumeManager.getStats();
    resumeManager.setTotalItems(fileCount);
    
    if (resumeStats.done > 0) {
      const remaining = fileCount - resumeStats.done;
      logger.info(`🔄 Fortsetzen: ${resumeStats.done.toLocaleString("de-DE")} bereits erledigt`);
      logger.info(`📊 Noch zu verarbeiten: ${remaining.toLocaleString("de-DE")} Dateien`);
    }
  }

  // Stats initialisieren
  logger.resetStats(fileCount);

  runner.addReader(reader);

  // Task zum Extrahieren des Datums aus dem Dateinamen
  runner.addTask(
    new Filename_Date_Task<any>({
      pattern: FILENAME_DATE_PATTERNS.UNDERSCORE_DASH,
      throwOnNoMatch: false,
    })
  );

  // Writer konfigurieren
  runner.addWriter(
    new Image_IO_Writer<any>({
      path: TARGET_PATH,
      simulate: CONFIG.simulate,
      preserveStructure: true,
      sourcePath: SOURCE_PATH,
      logger: logger,
      resumeManager: resumeManager, // Resume-Manager übergeben
      metadata: {
        artist: "Carsten Nichte",
        copyright: "Copyright Carsten Nichte",
        iptcByline: "Carsten Nichte",
        iptcCopyright: "Copyright Carsten Nichte",
      },
    })
  );

  // Cleanup-Callback registrieren
  runner.setOnFinished(async () => {
    // Progress-Anzeige beenden (falls noch aktiv)
    logger.progressDone("Verarbeitung abgeschlossen");
    
    // Resume-State finalisieren
    resumeManager?.finalize();
    
    logger.startSpinner("Schließe exiftool...");
    await Image_IO_Writer.close();
    logger.stopSpinner("Exiftool geschlossen", "success");
    
    // Bei vollständigem Abschluss: State-Datei löschen
    if (resumeManager) {
      const resumeStats = resumeManager.getStats();
      if (resumeStats.done === resumeStats.total && resumeStats.total > 0) {
        resumeManager.reset(); // Löscht die State-Datei
        logger.success("✨ Alle Dateien verarbeitet! State-Datei gelöscht.");
      }
    }
    
    // Zusammenfassung
    const stats = logger.getStats();
    logger.summary({
      "Modus": CONFIG.simulate ? "Simulation" : "Produktiv",
    });
    
    logger.footer(stats.errors === 0);
    await logger.close();
  });

  // Graceful Shutdown bei Strg+C
  process.on("SIGINT", async () => {
    logger.warn("\n⚠️  Abbruch durch Benutzer (Strg+C)");
    
    // Resume-State speichern
    if (resumeManager) {
      resumeManager.finalize();
      const stats = resumeManager.getStats();
      logger.info(`💾 State gespeichert: ${stats.done}/${stats.total} Dateien verarbeitet`);
      logger.info(`   Beim nächsten Start wird fortgesetzt.`);
    }
    
    // Exiftool schließen
    await Image_IO_Writer.close();
    
    await logger.close();
    process.exit(0);
  });

  // Starten
  logger.info("Starte Verarbeitung...");

  await runner.run();
}

main().catch((error) => {
  console.error("Fataler Fehler:", error);
  process.exit(1);
});