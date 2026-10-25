import { differenceInCalendarDays, format, formatDistanceToNowStrict } from 'date-fns';

export function currency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function fullDate(value) {
  if (!value) return '';
  return format(new Date(value), 'd MMM yyyy');
}

export function dateTime(value) {
  if (!value) return '';
  return format(new Date(value), 'd MMM yyyy, h:mm a');
}

export function relativeTime(value) {
  if (!value) return '';
  return formatDistanceToNowStrict(new Date(value), { addSuffix: true });
}

export function greeting(name = '') {
  const hour = new Date().getHours();
  const hello = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const first = name.trim().split(/\s+/)[0] || 'there';
  return `${hello}, ${first}`;
}

export function todayLabel() {
  return format(new Date(), 'EEEE, d MMMM yyyy');
}

export function dueLabel(dueDate, status) {
  if (!dueDate) return '';
  const due = new Date(dueDate);
  const time = format(due, 'h:mm a');
  if (status === 'Completed') return `Completed ${format(due, 'd MMM')}`;
  if (status === 'Overdue') {
    const days = differenceInCalendarDays(new Date(), due);
    if (days <= 0) return 'Overdue';
    if (days === 1) return 'Overdue by 1 day';
    return `Overdue by ${days} days`;
  }
  const days = differenceInCalendarDays(due, new Date());
  if (days === 0) return `Due today ${time}`;
  if (days === 1) return `Due tomorrow ${time}`;
  return `Due ${format(due, 'd MMM, h:mm a')}`;
}

export function splitInteraction(lastInteraction, at) {
  if (!lastInteraction || lastInteraction === 'No interaction recorded yet') {
    return { summary: 'No interaction recorded yet', quote: '', empty: true };
  }
  const index = lastInteraction.indexOf(': ');
  const type = index === -1 ? lastInteraction : lastInteraction.slice(0, index);
  const quote = index === -1 ? '' : lastInteraction.slice(index + 2);
  const when = at ? `, ${relativeTime(at)}` : '';
  return { summary: `${type}${when}`, quote, empty: false };
}

export function trendLabel(current = 0, previous = 0) {
  if (!current && !previous) return '';
  const delta = current - previous;
  if (delta === 0) return 'No change vs last week';
  const sign = delta > 0 ? '+' : '';
  return `${sign}${delta} vs last week`;
}

export function daysInStage(value) {
  if (!value) return 'Just moved';
  const days = differenceInCalendarDays(new Date(), new Date(value));
  if (days <= 0) return 'Today';
  if (days === 1) return '1 day in stage';
  return `${days} days in stage`;
}

export function toDateTimeLocal(value) {
  const date = value ? new Date(value) : new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function downloadCsv(filename, columns, rows) {
  const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const header = columns.map((column) => escape(column.label)).join(',');
  const body = rows.map((row) => columns.map((column) => escape(column.value(row))).join(',')).join('\n');
  const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
