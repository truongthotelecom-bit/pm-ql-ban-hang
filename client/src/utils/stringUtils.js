/**
 * Removes Vietnamese diacritics (accents) from a string.
 * This is useful for search indexing and case-insensitive matching.
 * 
 * @param {string} str - The input string
 * @returns {string} The string without diacritics, converted to lowercase
 */
export const removeVietnameseTones = (str) => {
  if (!str) return '';
  return str
    .normalize('NFD') // Decompose combined characters into base characters and diacritical marks
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase(); // Ensure the result is lowercase for uniform comparison
};
