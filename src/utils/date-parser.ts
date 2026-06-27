/**
 * Date Parser Utility
 * Provides centralized date parsing for test data and reporting
 * Eliminates duplication across shared-revenues.steps.ts and total-transactions-revenue-entity.steps.ts
 */

/**
 * Get numeric month value from month name
 * @param monthName - Month name (e.g., 'June', 'JUNE', 'june')
 * @returns - Month number as string with leading zero (e.g., '06')
 */
export function getMonthNumber(monthName: string): string {
  const months: Record<string, string> = {
    january: '01',
    february: '02',
    march: '03',
    april: '04',
    may: '05',
    june: '06',
    july: '07',
    august: '08',
    september: '09',
    october: '10',
    november: '11',
    december: '12',
  };

  const normalized = monthName.toLowerCase().trim();
  const monthNumber = months[normalized];

  if (!monthNumber) {
    throw new Error(
      `Invalid month name: "${monthName}". Expected one of: ${Object.keys(months).join(', ')}`
    );
  }

  return monthNumber;
}

/**
 * Get number of days in a given month
 * @param monthName - Month name or number
 * @param year - Year (required for leap year calculation)
 * @returns - Number of days in that month
 */
export function getDaysInMonth(monthName: string, year: number): number {
  const monthNumber = parseInt(getMonthNumber(monthName), 10);
  const date = new Date(year, monthNumber, 0); // Day 0 gets last day of previous month
  return date.getDate();
}

/**
 * Parse Gherkin date syntax
 * Handles formats like:
 * - "2026-06-15" (ISO format)
 * - "June 15, 2026" (readable format)
 * - "June 2026" (month-year only, returns first day)
 *
 * @param dateString - Date string in various formats
 * @returns - Parsed Date object
 */
export function parseGherkinDate(dateString: string): Date {
  const trimmed = dateString.trim();

  // ISO format: "2026-06-15"
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
  }

  // Full date: "June 15, 2026"
  const fullDateMatch = trimmed.match(/^(\w+)\s+(\d{1,2}),?\s+(\d{4})$/);
  if (fullDateMatch) {
    const [, monthName, day, year] = fullDateMatch;
    const monthNumber = parseInt(getMonthNumber(monthName), 10);
    return new Date(parseInt(year, 10), monthNumber - 1, parseInt(day, 10));
  }

  // Month-year only: "June 2026" (returns first day of month)
  const monthYearMatch = trimmed.match(/^(\w+)\s+(\d{4})$/);
  if (monthYearMatch) {
    const [, monthName, year] = monthYearMatch;
    const monthNumber = parseInt(getMonthNumber(monthName), 10);
    return new Date(parseInt(year, 10), monthNumber - 1, 1);
  }

  throw new Error(
    `Unable to parse date: "${dateString}". Expected formats: "2026-06-15", "June 15, 2026", or "June 2026"`
  );
}

/**
 * Format Date for API calls (ISO string without time)
 * @param date - Date to format
 * @returns - Formatted date string (YYYY-MM-DD)
 */
export function formatDateForAPI(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get date range for entire month
 * @param monthName - Month name (e.g., 'June')
 * @param year - Year (e.g., 2026)
 * @returns - Object with from and to Date objects
 */
export function getMonthDateRange(
  monthName: string,
  year: number
): { from: Date; to: Date } {
  const monthNumber = parseInt(getMonthNumber(monthName), 10);
  const from = new Date(year, monthNumber - 1, 1);
  const daysInMonth = getDaysInMonth(monthName, year);
  const to = new Date(year, monthNumber - 1, daysInMonth);

  return { from, to };
}

/**
 * Get date range from string (handles relative dates)
 * @param dateRangeStr - Date range string (e.g., "June 2026", "from June 1 to June 30, 2026")
 * @param defaultYear - Default year if not specified
 * @returns - Object with from and to Date objects
 */
export function parseDateRange(
  dateRangeStr: string,
  defaultYear: number = new Date().getFullYear()
): { from: Date; to: Date } {
  const trimmed = dateRangeStr.trim();

  // Single month: "June 2026"
  if (/^\w+\s+\d{4}$/.test(trimmed)) {
    const [monthName, year] = trimmed.split(/\s+/);
    return getMonthDateRange(monthName, parseInt(year, 10));
  }

  // Date range: "from June 1 to June 30, 2026"
  const rangeMatch = trimmed.match(/from\s+(.+?)\s+to\s+(.+?)(?:,\s+(\d{4}))?$/i);
  if (rangeMatch) {
    const [, fromStr, toStr, year] = rangeMatch;
    const yearNum = year ? parseInt(year, 10) : defaultYear;

    const from = parseGherkinDate(`${fromStr.trim()}, ${yearNum}`);
    const to = parseGherkinDate(`${toStr.trim()}, ${yearNum}`);

    return { from, to };
  }

  // Fallback: try to parse as single date
  try {
    const date = parseGherkinDate(trimmed);
    return { from: date, to: date };
  } catch {
    throw new Error(
      `Unable to parse date range: "${dateRangeStr}". ` +
        `Expected formats: "June 2026" or "from June 1 to June 30, 2026"`
    );
  }
}

/**
 * Add days to a date
 * @param date - Base date
 * @param days - Number of days to add (can be negative)
 * @returns - New Date object
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Check if date is within range
 * @param date - Date to check
 * @param fromDate - Start of range
 * @param toDate - End of range
 * @returns - True if date is within range (inclusive)
 */
export function isDateInRange(date: Date, fromDate: Date, toDate: Date): boolean {
  return date >= fromDate && date <= toDate;
}

/**
 * Get date string for logging
 * @param date - Date to format
 * @returns - Readable date string
 */
export function getDateDisplayString(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}
