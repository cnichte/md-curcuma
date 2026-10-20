//! Teste: Image Date Extraction - IN-PLACE MODUS
import { Runner } from "../src/lib/core";
import { Image_IO_Reader, Image_IO_Writer } from "../src/lib/io";
import { Filename_Date_Task, FILENAME_DATE_PATTERNS } from "../src/lib/tasks/Filename_Date_Task";

/**
 * Test für den In-Place Modus:
 * - Dateien werden NICHT kopiert
 * - EXIF und File-Datum werden direkt in den Originaldateien gesetzt
 * - Zusätzliche Metadaten (Artist, Copyright, IPTC) werden geschrieben
 */

// Für den Test: Kopie der Testdaten verwenden
const TARGET_PATH = "test-data/exif/images-output";

async function main() {
  const runner = new Runner<any>();

  runner.addReader(
    new Image_IO_Reader<any>({
      path: TARGET_PATH,
      doSubfolders: true,
      limit: 0,
      useCounter: true,
      simulate: false,
      fileExtensions: [".jpg", ".jpeg", ".png", ".dng"],
    })
  );

  runner.addTask(
    new Filename_Date_Task<any>({
      pattern: FILENAME_DATE_PATTERNS.UNDERSCORE_DASH,
      throwOnNoMatch: false,
    })
  );

  runner.addWriter(
    new Image_IO_Writer<any>({
      path: TARGET_PATH,
      simulate: false,  // ← ECHTE ÄNDERUNGEN
      preserveStructure: true,
      // In-Place wird automatisch erkannt (SOURCE = TARGET)
      
      // Zusätzliche Metadaten für alle Bilder
      metadata: {
        // EXIF
        artist: "Carsten Nichte",
        copyright: "Copyright Carsten Nichte",
        
        // IPTC
        iptcByline: "Carsten Nichte",
        iptcCopyright: "Copyright Carsten Nichte",
        
        // XMP (optional - für maximale Kompatibilität)
        xmpCreator: "Carsten Nichte",
        xmpRights: "Copyright Carsten Nichte",
      },
    })
  );

  runner.setOnFinished(async () => {
    console.log("Schließe exiftool...");
    await Image_IO_Writer.close();
    console.log("Fertig!");
  });

  console.log("=".repeat(60));
  console.log("Image Date Extraction - IN-PLACE MODUS");
  console.log("=".repeat(60));
  console.log(`Verzeichnis: ${TARGET_PATH}`);
  console.log("ACHTUNG: Dateien werden direkt bearbeitet!");
  console.log("=".repeat(60));

  await runner.run();
}

main().catch(console.error);
