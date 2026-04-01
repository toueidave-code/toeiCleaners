/**
 * Utility functions for date handling
 */

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function format(date: Date, formatStr: string): string {
  const options: Intl.DateTimeFormatOptions = {};
  
  if (formatStr.includes('MMMM')) {
    options.month = 'long';
  } else if (formatStr.includes('MMM')) {
    options.month = 'short';
  } else if (formatStr.includes('MM')) {
    options.month = '2-digit';
  }

  if (formatStr.includes('YYYY')) {
    options.year = 'numeric';
  } else if (formatStr.includes('YY')) {
    options.year = '2-digit';
  }

  if (formatStr.includes('DD')) {
    options.day = '2-digit';
  } else if (formatStr.includes('D')) {
    options.day = 'numeric';
  }

  return date.toLocaleString('default', options);
}

export function getMonthDays(year: number, month: number): Date[] {
  const daysInMonth = getDaysInMonth(year, month);
  return Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
