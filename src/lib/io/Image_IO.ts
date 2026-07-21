import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import {
  Observable,
  Observable_Type,
  Observer_Command_Type,
  Observer_Interface,
  Observer_Props,
  Observer_Subject,
  Observer_Type,
} from "../core/observer";
import {
  Data_Interface,
  IO_Observable_Reader_Interface,
  IO_Observable_Writer_Interface,
  IO_Meta,
  IO_Meta_Interface,
  IO_Observer_Props,
  IOable,
} from "./types";
import { Filesystem } from "../core/filesystem";
import { Logger, getLogger } from "../core/logger";
import { ResumeManager } from "../core/resume-manager";
import { exiftool } from "exiftool-vendored";

/**
 * Props for the Image_IO_Reader
 */
export interface Image_IO_ReadProps_Interface extends IOable {
  path: string; // Datei oder Verzeichnis
  simulate: boolean;
  doSubfolders: boolean;
  limit: number; // greift nur bei Verzeichnis, 0 = kein Limit
  useCounter: boolean;
  /**
   * Filter für Dateiendungen, z.B. [".jpg", ".png", ".dng"]
   * Wenn leer oder undefined, werden alle Dateien gelesen.
   */
  fileExtensions?: string[];
  /**
   * Logger-Instanz (optional - wenn nicht gesetzt wird getLogger() verwendet)
   */
  logger?: Logger;
}

/**
 * Zusätzliche Metadaten die in Bilder geschrieben werden können.
 * Unterstützt EXIF, IPTC und XMP Tags.
 */
export interface Image_Metadata_Interface {
  // === EXIF Tags ===
  /** Fotograf / Künstler */
  artist?: string;
  /** Copyright-Vermerk */
  copyright?: string;
  /** Bildbeschreibung */
  description?: string;
  /** Software die das Bild erstellt/bearbeitet hat */
  software?: string;
  
  // === IPTC Tags ===
  /** IPTC: Autor/Ersteller (By-line) */
  iptcByline?: string;
  /** IPTC: Copyright */
  iptcCopyright?: string;
  /** IPTC: Bildunterschrift/Beschreibung */
  iptcCaption?: string;
  /** IPTC: Überschrift */
  iptcHeadline?: string;
  /** IPTC: Schlüsselwörter */
  iptcKeywords?: string[];
  /** IPTC: Stadt */
  iptcCity?: string;
  /** IPTC: Land */
  iptcCountry?: string;
  
  // === XMP Tags ===
  /** XMP: Ersteller */
  xmpCreator?: string;
  /** XMP: Rechte */
  xmpRights?: string;
  /** XMP: Titel */
  xmpTitle?: string;
  /** XMP: Beschreibung */
  xmpDescription?: string;
}

/**
 * Props for the Image_IO_Writer
 */
export interface Image_IO_WriteProps_Interface extends IOable {
  path: string; // Zielverzeichnis
  simulate: boolean;
  /**
   * Verzeichnisstruktur beibehalten relativ zum Quellpfad
   */
  preserveStructure: boolean;
  /**
   * Quellpfad für die Berechnung der relativen Struktur
   */
  sourcePath?: string;
  /**
   * Zusätzliche Metadaten die in alle Bilder geschrieben werden.
   * EXIF, IPTC und XMP werden unterstützt.
   */
  metadata?: Image_Metadata_Interface;
  /**
   * Logger-Instanz (optional - wenn nicht gesetzt wird getLogger() verwendet)
   */
  logger?: Logger;
  /**
   * ResumeManager für Fortsetzung nach Abbruch (optional)
   */
  resumeManager?: ResumeManager;
}

/**
 * Metadaten die der Image-Reader/Writer zusätzlich mitführt
 */
export interface Image_IO_Meta_Interface extends IO_Meta_Interface {
  /**
   * Extrahiertes Datum aus dem Dateinamen (falls vorhanden)
   */
  extractedDate?: Date;
  /**
   * Relativer Pfad vom Quellverzeichnis
   */
  relativePath?: string;
}

/**
 * Image Reader - Liest Bilder aus einem Verzeichnis (rekursiv)
 */
export class Image_IO_Reader<D>
  implements IO_Observable_Reader_Interface<D>, Observable<D>
{
  private observer_subject: Observer_Subject<D> = new Observer_Subject<D>();
  private props: Image_IO_ReadProps_Interface = null;
  private logger: Logger;
  private fileList: string[] = [];

  constructor(props: Image_IO_ReadProps_Interface) {
    this.props = props;
    this.logger = props.logger || getLogger();
  }

  /**
   * Gibt die Anzahl der zu lesenden Dateien zurück (nach Filter und Limit)
   */
  getFileCount(): number {
    return this.fileList.length;
  }

  /**
   * Bereitet die Dateiliste vor (ohne zu lesen)
   */
  prepare(): number {
    let file_list: string[] = [];

    if (Filesystem.isFolder(this.props.path)) {
      file_list = this.getFilesFromDirectory(this.props.path);
    } else if (Filesystem.isFile(this.props.path)) {
      file_list.push(this.props.path);
    } else {
      this.logger.error(`Pfad nicht gefunden: '${this.props.path}'`);
      return 0;
    }

    // Nach Dateiendungen filtern
    file_list = this.filterByExtension(file_list);

    // Limit anwenden
    if (this.props.limit > 0 && file_list.length > this.props.limit) {
      file_list = file_list.slice(0, this.props.limit);
    }

    this.fileList = file_list;
    return file_list.length;
  }

  add_observer(observer: Observer_Interface<D>, id: Observer_Type): void {
    this.observer_subject.add_observer(observer, id);
  }
  notify_all(props: Observer_Props<D>): void {
    this.observer_subject.notify_all(props);
  }
  notify(props: Observer_Props<D>): void {
    this.observer_subject.notify(props);
  }

  /**
   * Filtert die Dateiliste nach Dateiendungen
   */
  private filterByExtension(files: string[]): string[] {
    if (
      !this.props.fileExtensions ||
      this.props.fileExtensions.length === 0
    ) {
      return files;
    }

    const extensions = this.props.fileExtensions.map((ext) =>
      ext.toLowerCase().startsWith(".") ? ext.toLowerCase() : `.${ext.toLowerCase()}`
    );

    return files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return extensions.includes(ext);
    });
  }

  /**
   * Holt Dateien aus Verzeichnis (mit oder ohne Unterverzeichnisse)
   */
  private getFilesFromDirectory(dirPath: string): string[] {
    if (this.props.doSubfolders) {
      return Filesystem.get_files_list(dirPath);
    } else {
      // Nur Dateien im Hauptverzeichnis
      const items = fs.readdirSync(dirPath, { withFileTypes: true });
      return items
        .filter((item) => item.isFile())
        .map((item) => path.join(dirPath, item.name));
    }
  }

  /**
   * Liest Bilder und sendet sie an den Runner
   */
  read(): void {
    // Falls prepare() noch nicht aufgerufen wurde
    if (this.fileList.length === 0) {
      this.prepare();
    }
    
    const file_list = this.fileList;
    const total = file_list.length;

    // Spinner starten - Reader läuft synchron sehr schnell
    this.logger.startSpinner(`Lese ${total} Dateien...`);
    this.logger.resetStats(total);

    let counter = 0;
    file_list.forEach((file: string) => {
      counter++;
      const fileName = path.basename(file);

      // Observer Properties
      let o_props = new IO_Observer_Props<any>();
      o_props.from = "image-io";
      o_props.to = "runner";
      o_props.command = "perform-tasks";

      // File-Metadaten mit erweiterter Info
      let io_meta: Image_IO_Meta_Interface = {
        file_list_reader: file_list,
        file_name_reader: file,
        relativePath: this.calculateRelativePath(file),
      };

      // DAO erstellen - Daten sind erstmal der Dateipfad
      let the_dao: Data_Interface<any> = {
        data: {
          sourceFile: file,
          fileName: fileName,
          index: counter,
          total: total,
        },
        io_meta: io_meta,
      };

      o_props.dao = the_dao;

      this.notify_all(o_props);
    });

    this.logger.stopSpinner(`${total} Dateien gelesen`, "success");

    // Finished Event
    let m_props = new IO_Observer_Props<any>();
    m_props.from = "image-io";
    m_props.to = "runner";
    m_props.command = "tasks-finished";

    this.notify_all(m_props);
  }

  /**
   * Berechnet den relativen Pfad vom Quellverzeichnis
   */
  private calculateRelativePath(filePath: string): string {
    if (Filesystem.isFolder(this.props.path)) {
      return path.relative(this.props.path, path.dirname(filePath));
    }
    return "";
  }
}

/**
 * Image Writer - Schreibt Bilder in ein Zielverzeichnis
 * Setzt File Creation/Modified Date und EXIF-Daten via exiftool
 */
export class Image_IO_Writer<D>
  implements IO_Observable_Writer_Interface<D>, Observable<D>
{
  private observer_subject: Observer_Subject<D> = new Observer_Subject<D>();
  private props: Image_IO_WriteProps_Interface = null;
  private logger: Logger;

  constructor(props: Image_IO_WriteProps_Interface) {
    this.props = props;
    this.logger = props.logger || getLogger();
  }

  add_observer(observer: Observer_Interface<D>, id: Observer_Type): void {
    this.observer_subject.add_observer(observer, id);
  }
  notify_all(props: Observer_Props<D>): void {
    this.observer_subject.notify_all(props);
  }
  notify(props: Observer_Props<D>): void {
    this.observer_subject.notify(props);
  }

  /**
   * Schreibt ein Bild mit neuen Metadaten
   */
  async write(data: Data_Interface<D>): Promise<void> {
    const dao = data.data as any;
    const io_meta = data.io_meta as Image_IO_Meta_Interface;

    const sourceFile = dao.sourceFile;
    const fileName = dao.fileName || path.basename(sourceFile);
    const index = dao.index || 0;
    const total = dao.total || 0;
    const extractedDate: Date | undefined =
      dao.extractedDate || io_meta.extractedDate;

    if (!sourceFile) {
      this.logger.error("Keine Quelldatei im DAO");
      return;
    }

    // Resume: Prüfe ob Datei bereits verarbeitet wurde
    if (this.props.resumeManager?.isDone(sourceFile)) {
      // Bereits verarbeitet -> überspringen (ohne Progress-Update)
      return;
    }

    // Zielpfad berechnen
    let targetPath = this.props.path;
    let targetFile: string;

    if (this.props.preserveStructure && io_meta.relativePath) {
      targetPath = path.join(this.props.path, io_meta.relativePath);
    }
    targetFile = path.join(targetPath, path.basename(sourceFile));

    // Automatische In-Place Erkennung: Wenn Source = Target, dann In-Place
    const sourceAbsolute = path.resolve(sourceFile);
    const targetAbsolute = path.resolve(targetFile);
    const isInPlace = sourceAbsolute === targetAbsolute;

    // Prüfe ob Datum vorhanden - wenn nicht, überspringe diese Datei
    if (!extractedDate) {
      this.logger.incrementStat("skipped");
      this.props.resumeManager?.markSkipped(sourceFile);
      if (total > 0) {
        this.logger.progress(index, total, fileName, "⏭️  Übersprungen");
      }
      return;
    }

    if (this.props.simulate) {
      this.logger.incrementStat("simulated");
      // Bei Simulation nicht als "done" markieren
      if (total > 0) {
        const mode = isInPlace ? "IN-PLACE" : "COPY";
        this.logger.progress(index, total, fileName, `🔍 Simulation (${mode})`);
      }
      return;
    }

    try {
      // Nur kopieren wenn NICHT inPlace
      if (!isInPlace) {
        // Zielverzeichnis erstellen
        Filesystem.ensure_path(targetPath, false);

        // Datei kopieren
        fs.copyFileSync(sourceFile, targetFile);
        this.logger.incrementStat("copied");
      }

      // EXIF und File-Datum setzen
      await this.setExifDates(targetFile, extractedDate);
      await this.setFileDates(targetFile, extractedDate);
      
      this.logger.incrementStat("processed");
      this.props.resumeManager?.markProcessed(sourceFile);
      
      // Nur EIN Progress-Aufruf am Ende der Verarbeitung
      if (total > 0) {
        this.logger.progress(index, total, fileName, "✅ EXIF + Datum gesetzt");
      }
      
    } catch (error) {
      this.logger.error(`Fehler bei ${fileName}`, error as Error);
      this.props.resumeManager?.markError(sourceFile, (error as Error).message);
    }
  }

  /**
   * Setzt File Creation und Modified Date
   * Verwendet touch auf macOS um birthtime (Creation Date) zu setzen
   */
  private async setFileDates(filePath: string, date: Date): Promise<void> {
    try {
      // Format für touch: [[CC]YY]MMDDhhmm[.SS]
      const touchDate = this.formatTouchDate(date);
      
      // macOS touch mit -t setzt mtime und atime
      // SetFile -d setzt das Creation Date (birthtime) auf macOS
      const absPath = path.resolve(filePath);
      
      // Modified Date setzen mit touch
      execSync(`touch -t ${touchDate} "${absPath}"`);
      
      // Creation Date setzen mit SetFile (macOS spezifisch)
      // Format für SetFile: "MM/DD/YYYY HH:MM:SS"
      const setFileDate = this.formatSetFileDate(date);
      try {
        execSync(`SetFile -d "${setFileDate}" "${absPath}"`);
      } catch (e) {
        // SetFile ist Teil von Xcode Command Line Tools, könnte fehlen
        // Nur einmal warnen, nicht bei jeder Datei
      }
      
    } catch (error) {
      this.logger.error(`Fehler beim Setzen des File-Datums`, error as Error);
    }
  }

  /**
   * Formatiert Date für touch -t: [[CC]YY]MMDDhhmm[.SS]
   */
  private formatTouchDate(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}.${pad(date.getSeconds())}`;
  }

  /**
   * Formatiert Date für SetFile -d: "MM/DD/YYYY HH:MM:SS"
   */
  private formatSetFileDate(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  /**
   * Setzt EXIF, IPTC und XMP Daten via exiftool
   */
  private async setExifDates(filePath: string, date: Date): Promise<void> {
    try {
      // Format für EXIF: YYYY:MM:DD HH:MM:SS
      const exifDate = this.formatExifDate(date);
      const meta = this.props.metadata;

      // Basis-Tags für Datum
      const tags: Record<string, any> = {
        DateTimeOriginal: exifDate,
        CreateDate: exifDate,
        ModifyDate: exifDate,
      };

      // Zusätzliche Metadaten hinzufügen wenn vorhanden
      if (meta) {
        // === EXIF Tags ===
        if (meta.artist) {
          tags.Artist = meta.artist;
        }
        if (meta.copyright) {
          tags.Copyright = meta.copyright;
        }
        if (meta.description) {
          tags.ImageDescription = meta.description;
        }
        if (meta.software) {
          tags.Software = meta.software;
        }

        // === IPTC Tags ===
        if (meta.iptcByline) {
          tags["IPTC:By-line"] = meta.iptcByline;
        }
        if (meta.iptcCopyright) {
          tags["IPTC:CopyrightNotice"] = meta.iptcCopyright;
        }
        if (meta.iptcCaption) {
          tags["IPTC:Caption-Abstract"] = meta.iptcCaption;
        }
        if (meta.iptcHeadline) {
          tags["IPTC:Headline"] = meta.iptcHeadline;
        }
        if (meta.iptcKeywords && meta.iptcKeywords.length > 0) {
          tags["IPTC:Keywords"] = meta.iptcKeywords;
        }
        if (meta.iptcCity) {
          tags["IPTC:City"] = meta.iptcCity;
        }
        if (meta.iptcCountry) {
          tags["IPTC:Country-PrimaryLocationName"] = meta.iptcCountry;
        }

        // === XMP Tags ===
        if (meta.xmpCreator) {
          tags["XMP-dc:Creator"] = meta.xmpCreator;
        }
        if (meta.xmpRights) {
          tags["XMP-dc:Rights"] = meta.xmpRights;
        }
        if (meta.xmpTitle) {
          tags["XMP-dc:Title"] = meta.xmpTitle;
        }
        if (meta.xmpDescription) {
          tags["XMP-dc:Description"] = meta.xmpDescription;
        }
      }

      // Für PNG-Dateien: Nur XMP-Tags verwenden (EXIF/IPTC werden nicht zuverlässig unterstützt)
      const ext = path.extname(filePath).toLowerCase();
      if (ext === ".png") {
        // PNG: Nur XMP-basierte Datum-Tags
        const pngTags: Record<string, any> = {
          "XMP-xmp:CreateDate": exifDate,
          "XMP-xmp:ModifyDate": exifDate,
        };
        // Zusätzliche XMP-Tags hinzufügen
        if (meta?.xmpCreator || meta?.artist) {
          pngTags["XMP-dc:Creator"] = meta?.xmpCreator || meta?.artist;
        }
        if (meta?.xmpRights || meta?.copyright) {
          pngTags["XMP-dc:Rights"] = meta?.xmpRights || meta?.copyright;
        }
        await exiftool.write(filePath, pngTags, ["-overwrite_original"]);
      } else {
        // JPG, DNG, etc.: Alle Tags
        await exiftool.write(filePath, tags, ["-overwrite_original"]);
      }

      // Nur im verbose-Modus einzelne Dateien loggen
      // const fileName = path.basename(filePath);
      // this.logger.verbose(`${fileName} → EXIF: ${exifDate}`);
    } catch (error) {
      const fileName = path.basename(filePath);
      // Fehler nur loggen, aber nicht abbrechen - Dateidatum wird trotzdem gesetzt
      this.logger.verbose(`EXIF-Warnung bei ${fileName}: ${(error as Error).message}`);
    }
  }

  /**
   * Liest alle Metadaten einer Bilddatei (EXIF, IPTC, XMP)
   */
  static async readMetadata(filePath: string): Promise<any> {
    try {
      const tags = await exiftool.read(filePath);
      return tags;
    } catch (error) {
      console.error(`Fehler beim Lesen der Metadaten:`, error);
      return null;
    }
  }

  /**
   * Formatiert Date für EXIF (YYYY:MM:DD HH:MM:SS)
   */
  private formatExifDate(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${date.getFullYear()}:${pad(date.getMonth() + 1)}:${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  /**
   * Schließt exiftool (sollte am Ende aufgerufen werden)
   */
  static async close(): Promise<void> {
    await exiftool.end();
  }
}
