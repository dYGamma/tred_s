// src/lib/dateUtils.ts
export function formatDate(dateString: string): string {
  const date = new Date(dateString);

  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
