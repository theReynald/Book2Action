import { createCalendarEvent } from '../services/googleAuthService';

/**
 * Get the next occurrence of a specific day of the week
 */
const getNextDayOccurrence = (day: string): Date => {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayIndex = daysOfWeek.findIndex(d => d === day);
  
  if (dayIndex === -1) return new Date(); // Invalid day, return today
  
  const today = new Date();
  const targetDate = new Date(today);
  const todayDayIndex = today.getDay();

  let daysToAdd = dayIndex - todayDayIndex;
  if (daysToAdd <= 0) daysToAdd += 7;

  targetDate.setDate(today.getDate() + daysToAdd);
  return targetDate;
};

/**
 * Format date for Google Calendar URL
 */
const formatDateForUrl = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}${month}${day}`;
};

/**
 * Format date for ISO datetime
 */
const formatDateTimeISO = (date: Date, hour: number = 9): string => {
  const d = new Date(date);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

export interface CalendarEventData {
  summary: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
}

/**
 * Generate calendar event data for an action step
 */
export const generateCalendarEventData = (
  actionStep: string,
  bookTitle: string,
  day: string
): CalendarEventData => {
  const targetDate = getNextDayOccurrence(day);
  
  return {
    summary: actionStep,
    description: `Action step from "${bookTitle}"`,
    startDateTime: formatDateTimeISO(targetDate, 9),
    endDateTime: formatDateTimeISO(targetDate, 10),
  };
};

/**
 * Generate detailed calendar event data for action step detail page
 */
export const generateDetailedCalendarEventData = (
  actionStep: string,
  bookTitle: string,
  chapter: string,
  keyTakeaway: string,
  sentences: string[]
): CalendarEventData => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const description = 
    `From book: ${bookTitle}\n` +
    `Chapter: ${chapter}\n\n` +
    `Key takeaway: ${keyTakeaway}\n\n` +
    `Details:\n${sentences.join('\n')}`;

  return {
    summary: `Book Action: ${actionStep}`,
    description,
    startDateTime: formatDateTimeISO(tomorrow, 9),
    endDateTime: formatDateTimeISO(tomorrow, 10),
  };
};

/**
 * Add event to Google Calendar via API
 */
export const addToGoogleCalendar = async (
  accessToken: string,
  eventData: CalendarEventData
): Promise<{ success: boolean; eventId?: string; htmlLink?: string; error?: string }> => {
  return createCalendarEvent(accessToken, eventData);
};

/**
 * Generate a Google Calendar link for an action step (fallback when not authenticated)
 */
export const generateCalendarLink = (
  actionStep: string,
  bookTitle: string,
  day: string
): string => {
  const targetDate = getNextDayOccurrence(day);
  const startDate = formatDateForUrl(targetDate);
  const details = encodeURIComponent(`Action step from "${bookTitle}"`);
  const text = encodeURIComponent(actionStep);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}&dates=${startDate}T090000/${startDate}T100000&ctz=local`;
};

/**
 * Generate a calendar link for action step detail page (fallback when not authenticated)
 */
export const generateDetailedCalendarLink = (
  actionStep: string,
  bookTitle: string,
  chapter: string,
  keyTakeaway: string,
  sentences: string[]
): string => {
  const eventTitle = encodeURIComponent(`Book Action: ${actionStep}`);
  const eventDetails = encodeURIComponent(
    `From book: ${bookTitle}\n` +
    `Chapter: ${chapter}\n\n` +
    `Key takeaway: ${keyTakeaway}\n\n` +
    `Details:\n${sentences.join('\n')}`
  );

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const startDate = formatDateForUrl(tomorrow);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&details=${eventDetails}&dates=${startDate}/${startDate}`;
};
