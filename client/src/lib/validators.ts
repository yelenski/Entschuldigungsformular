/**
 * Validation functions for the application forms
 */

// Check if a date is in the past
export function isPastDate(date: string): boolean {
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return selectedDate < today;
}

// Check if end date is after start date
export function isValidDateRange(startDate: string, endDate: string): boolean {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return end >= start;
}

// Format a date as DD.MM.YYYY (German format)
export function formatDateToGerman(date: Date): string {
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}
