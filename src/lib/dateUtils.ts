import { format, subDays, isToday as dateFnsIsToday, isYesterday as dateFnsIsYesterday, eachDayOfInterval, startOfWeek, endOfWeek, parseISO } from 'date-fns';

export function getToday(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getYesterday(): string {
  return format(subDays(new Date(), 1), 'yyyy-MM-dd');
}

export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  return format(parseISO(dateStr), 'EEE, MMM d');
}

export function formatFullDate(dateStr: string): string {
  if (!dateStr) return '';
  return format(parseISO(dateStr), 'MMMM d, yyyy');
}

export function isToday(dateStr: string): boolean {
  if (!dateStr) return false;
  return dateFnsIsToday(parseISO(dateStr));
}

export function isYesterday(dateStr: string): boolean {
  if (!dateStr) return false;
  return dateFnsIsYesterday(parseISO(dateStr));
}

export function getDaysInRange(start: string, end: string): string[] {
  if (!start || !end) return [];
  const days = eachDayOfInterval({ start: parseISO(start), end: parseISO(end) });
  return days.map(d => format(d, 'yyyy-MM-dd'));
}

export function getWeekRange(dateStr: string = getToday()): { start: string, end: string } {
  const date = parseISO(dateStr);
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd')
  };
}
