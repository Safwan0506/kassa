/**
 * Format a number as FCFA currency: "1 250 000 FCFA"
 * Uses space as thousands separator.
 */
export function formatCFA(amount: number): string {
  const formatted = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
  return `${formatted} FCFA`;
}

/**
 * Format a date string to French locale: "14 oct. 2026, 14:30"
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Format a date string to short French date: "14 oct. 2026"
 */
export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Format a number with sign: "+12" or "-5"
 */
export function formatSignedQty(qty: number): string {
  if (qty > 0) return `+${qty}`;
  return String(qty);
}
