/**
 * Format date to DD/MM/YYYY format
 * @param {Date|string} date - Date object or date string
 * @returns {string} Formatted date string in DD/MM/YYYY format
 */
export function formatDate(date) {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Format date to DD/MM/YYYY format for display in tables and lists
 * @param {Date|string} date - Date object or date string
 * @returns {string} Formatted date string in DD/MM/YYYY format
 */
export function formatDisplayDate(date) {
  return formatDate(date);
}

/**
 * Format date range for analytics and reports
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {string} Formatted date range string
 */
export function formatDateRange(startDate, endDate) {
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  return `${start} - ${end}`;
}
