// src/lib/dateUtils.ts

/**
 * formatDate
 *
 * Принимает строку даты (ISO или другую, распознаваемую Date),
 * возвращает отформатированную дату на русском языке в формате:
 * "день месяц год" (например, "20 мая 2025").
 *
 * Использует Intl.DateTimeFormat с локалью "ru-RU".
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);

  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
