import { Data_Interface } from "../io/types";
import { Image_IO_Meta_Interface } from "../io/Image_IO";
import { Observable_Abstract_TaskBase } from "./Observable_Abstract_TaskBase";
import * as path from "path";

/**
 * Konfiguration für den Filename_Date_Task
 */
export interface Filename_Date_Task_Props {
  /**
   * Regex-Pattern zum Extrahieren des Datums aus dem Dateinamen.
   * Muss benannte Gruppen haben: year, month, day, hour, minute, second
   * 
   * Standard-Pattern für: familie-nichte_2004-09-25_11-16-52-Verbessert-SR-2.dng
   * Erkennt: YYYY-MM-DD_HH-MM-SS
   */
  pattern?: RegExp;

  /**
   * Fallback-Datum wenn kein Datum im Dateinamen gefunden wird
   */
  fallbackDate?: Date;

  /**
   * Ob ein Fehler geworfen werden soll wenn kein Datum gefunden wird
   */
  throwOnNoMatch?: boolean;
}

/**
 * Standard-Patterns für gängige Dateinamen-Formate
 */
export const FILENAME_DATE_PATTERNS = {
  /**
   * Pattern für: name_YYYY-MM-DD_HH-MM-SS-suffix.ext
   * Beispiel: familie-nichte_2004-09-25_11-16-52-Verbessert-SR-2.dng
   */
  UNDERSCORE_DASH: /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})_(?<hour>\d{2})-(?<minute>\d{2})-(?<second>\d{2})/,

  /**
   * Pattern für: YYYY-MM-DD_HH-MM-SS
   * Beispiel: 2004-09-25_11-16-52.jpg
   */
  ISO_UNDERSCORE: /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})_(?<hour>\d{2})-(?<minute>\d{2})-(?<second>\d{2})/,

  /**
   * Pattern für: YYYYMMDD_HHMMSS
   * Beispiel: 20040925_111652.jpg
   */
  COMPACT: /(?<year>\d{4})(?<month>\d{2})(?<day>\d{2})_(?<hour>\d{2})(?<minute>\d{2})(?<second>\d{2})/,

  /**
   * Pattern für: YYYY-MM-DD HH-MM-SS oder YYYY-MM-DD HH.MM.SS
   * Beispiel: 2004-09-25 11-16-52.jpg
   */
  SPACE_SEPARATED: /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})[_ ](?<hour>\d{2})[-.](?<minute>\d{2})[-.](?<second>\d{2})/,

  /**
   * Pattern für: IMG_YYYYMMDD_HHMMSS
   * Beispiel: IMG_20040925_111652.jpg
   */
  IMG_PREFIX: /IMG_(?<year>\d{4})(?<month>\d{2})(?<day>\d{2})_(?<hour>\d{2})(?<minute>\d{2})(?<second>\d{2})/,
};

/**
 * Task zum Extrahieren von Datum/Uhrzeit aus Dateinamen.
 * 
 * Dieser Task analysiert den Dateinamen und extrahiert Datum und Uhrzeit
 * basierend auf einem konfigurierbaren Regex-Pattern.
 * 
 * Das extrahierte Datum wird im DAO unter `data.extractedDate` gespeichert
 * und kann vom Image_IO_Writer verwendet werden.
 * 
 * @example
 * ```typescript
 * const task = new Filename_Date_Task({
 *   pattern: FILENAME_DATE_PATTERNS.UNDERSCORE_DASH
 * });
 * ```
 */
export class Filename_Date_Task<T> extends Observable_Abstract_TaskBase<T> {
  props: Filename_Date_Task_Props;

  constructor(props: Filename_Date_Task_Props = {}) {
    super();
    this.props = {
      pattern: props.pattern || FILENAME_DATE_PATTERNS.UNDERSCORE_DASH,
      fallbackDate: props.fallbackDate,
      throwOnNoMatch: props.throwOnNoMatch || false,
    };
  }

  /**
   * Führt die Datumsextraktion durch
   */
  perform(dao: Data_Interface<T>): Data_Interface<T> {
    const data = dao.data as any;
    const io_meta = dao.io_meta as Image_IO_Meta_Interface;

    // Dateiname ermitteln
    const fileName = data.fileName || path.basename(io_meta.file_name_reader);

    // Datum extrahieren
    const extractedDate = this.extractDateFromFilename(fileName);

    if (extractedDate) {
      // Datum im DAO speichern
      data.extractedDate = extractedDate;
      io_meta.extractedDate = extractedDate;
    } else if (this.props.fallbackDate) {
      data.extractedDate = this.props.fallbackDate;
      io_meta.extractedDate = this.props.fallbackDate;
    } else if (this.props.throwOnNoMatch) {
      throw new Error(`Filename_Date_Task: Kein Datum in "${fileName}" gefunden`);
    }
    // Kein else-Logging mehr - das macht der Writer

    return dao;
  }

  /**
   * Extrahiert Datum aus einem Dateinamen basierend auf dem konfigurierten Pattern
   */
  private extractDateFromFilename(fileName: string): Date | null {
    const match = this.props.pattern.exec(fileName);

    if (!match || !match.groups) {
      return null;
    }

    const { year, month, day, hour, minute, second } = match.groups;

    try {
      const date = new Date(
        parseInt(year, 10),
        parseInt(month, 10) - 1, // Monate sind 0-basiert
        parseInt(day, 10),
        parseInt(hour, 10),
        parseInt(minute, 10),
        parseInt(second, 10)
      );

      // Prüfen ob das Datum gültig ist
      if (isNaN(date.getTime())) {
        return null;
      }

      return date;
    } catch (error) {
      console.error(`Filename_Date_Task: Fehler beim Parsen des Datums:`, error);
      return null;
    }
  }

  /**
   * Statische Hilfsmethode zum Testen eines Patterns gegen einen Dateinamen
   */
  static testPattern(fileName: string, pattern: RegExp): { matches: boolean; date?: Date; groups?: Record<string, string> } {
    const match = pattern.exec(fileName);

    if (!match || !match.groups) {
      return { matches: false };
    }

    const { year, month, day, hour, minute, second } = match.groups;

    const date = new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10),
      parseInt(hour, 10),
      parseInt(minute, 10),
      parseInt(second, 10)
    );

    return {
      matches: true,
      date: isNaN(date.getTime()) ? undefined : date,
      groups: match.groups,
    };
  }
}
