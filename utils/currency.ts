/**
 * Format a number as Vietnamese dong currency with commas
 * @param amount - The amount to format
 * @returns Formatted currency string with VND suffix
 */
export function formatVND(amount: number): string {
  return `${amount.toLocaleString('vi-VN')} VND`;
}

/**
 * Format a number with commas (no currency symbol)
 * @param amount - The amount to format
 * @returns Formatted number string with commas
 */
export function formatNumber(amount: number): string {
  return amount.toLocaleString('vi-VN');
}