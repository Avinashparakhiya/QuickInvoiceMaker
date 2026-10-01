import { format, parseISO, isValid, differenceInCalendarDays } from 'date-fns';

export function formatDate(dateString?: string, formatStr: string = 'MMM dd, yyyy'): string {
  if (!dateString) return '';
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return dateString;
    return format(date, formatStr);
  } catch {
    return dateString;
  }
}

export function getDueStatusText(dueDateStr?: string): { text: string; isOverdue: boolean } {
  if (!dueDateStr) return { text: '', isOverdue: false };
  try {
    const dueDate = parseISO(dueDateStr);
    const today = new Date();
    const diff = differenceInCalendarDays(dueDate, today);

    if (diff < 0) {
      return { text: `Overdue by ${Math.abs(diff)}d`, isOverdue: true };
    } else if (diff === 0) {
      return { text: 'Due Today', isOverdue: false };
    } else if (diff === 1) {
      return { text: 'Due Tomorrow', isOverdue: false };
    } else {
      return { text: `Due in ${diff}d`, isOverdue: false };
    }
  } catch {
    return { text: dueDateStr, isOverdue: false };
  }
}
