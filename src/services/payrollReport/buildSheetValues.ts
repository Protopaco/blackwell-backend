// Converts an array of keyed row objects into a 2D array with a header row — ready for writeValues.
const buildSheetValues = (rows: Record<string, unknown>[], headers: string[]): unknown[][] =>
  [headers, ...rows.map((row) => headers.map((header) => row[header] ?? ''))];

export default buildSheetValues;
