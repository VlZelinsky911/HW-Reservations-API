export type CsvRow = Record<string, string>;

export interface ParsedCsvResult {
  rows: CsvRow[];
}
