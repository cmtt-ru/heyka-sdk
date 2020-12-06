const MEDIAN_OFFSET = 0.5;

/**
 * Calculate median with offset
 *
 * @param {array<number>} arrOrig — array of numbers
 * @param {number} offset – offset
 * @returns {number}
 */
export function median(arrOrig, offset = MEDIAN_OFFSET) {
  const arr = arrOrig.slice();
  const length = arr.length;
  const medianOffset = Math.floor(length * offset);

  arr.sort((a, b) => a - b);

  return arr[medianOffset];
}
