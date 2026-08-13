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

/**
 * Converts a number into Vietnamese words (Doc tien bang chu)
 * @param {number} number - The input number
 * @returns {string} The Vietnamese words representing the number
 */
export const numberToWords = (number) => {
  if (number === 0) return 'Không đồng';
  
  const mTemp = number.toString().match(/\d/g);
  if (!mTemp) return '';
  const strNumber = mTemp.join('');
  
  const units = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];
  const chars = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
  
  const readBlock = (block) => {
    let res = '';
    const hundred = parseInt(block[0]);
    const ten = parseInt(block[1]);
    const unit = parseInt(block[2]);

    res += chars[hundred] + ' trăm ';
    if (ten === 0 && unit === 0) return res.trim();
    if (ten === 0 && unit !== 0) {
      res += 'linh ' + chars[unit];
      return res.trim();
    }
    if (ten === 1) {
      res += 'mười ';
    } else {
      res += chars[ten] + ' mươi ';
    }
    if (unit === 1) res += 'mốt';
    else if (unit === 5) res += 'lăm';
    else if (unit !== 0) res += chars[unit];
    
    return res.trim();
  };

  let blocks = [];
  let tempStr = strNumber;
  while (tempStr.length > 0) {
    let block = tempStr.slice(-3);
    tempStr = tempStr.slice(0, -3);
    while (block.length < 3) block = '0' + block;
    blocks.push(block);
  }

  let words = [];
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i] !== '000') {
      let blockWords = readBlock(blocks[i]);
      if (i > 0) blockWords += ' ' + units[i];
      words.push(blockWords);
    }
  }

  let result = words.reverse().join(' ').trim();
  if (result.startsWith('không trăm linh ')) result = result.replace('không trăm linh ', '');
  if (result.startsWith('không trăm ')) result = result.replace('không trăm ', '');
  
  // Capitalize first letter
  result = result.charAt(0).toUpperCase() + result.slice(1);
  return result + ' đồng';
};
