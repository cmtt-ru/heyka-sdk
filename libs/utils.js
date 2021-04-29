/**
 * Colors for converting id to color
 * @type {string[]}
 */
const COLORS = [
  '#D65D56',
  '#D66D56',
  '#D67C56',
  '#D69356',
  '#D6A356',
  '#D6B256',
  '#D6C156',
  '#D6D156',
  '#CCD656',
  '#BCD656',
  '#ADD656',
  '#95D656',
  '#7FD656',
  '#68D656',
  '#56D67A',
  '#56D6A0',
  '#56D6C6',
  '#56CED6',
  '#56C6D6',
  '#56B7D6',
  '#56A8D6',
  '#5690D6',
  '#5662D6',
  '#7056D6',
  '#8656D6',
  '#9E56D6',
  '#AD56D6',
  '#C456D6',
  '#D656C1',
  '#D65693',
  '#D65675',
];

const COLORS_LENGTH = COLORS.length;

/**
 * Object to hash
 * @param {string} object – js object
 * @returns {number}
 */
export function obj2hash(object) {
  const str = JSON.stringify(object);

  let hash = 0,
      i, chr;

  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    // eslint-disable-next-line no-magic-numbers
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }

  return hash;
}

/**
 * Convert id to fixed color
 * @param {string} id – some id
 * @returns {string}
 */
export function idToColor(id) {
  if (!id) {
    return COLORS[0];
  }
  const firstDigits = parseInt(id
    .replace(/[^0-9]/g, '')
    .substr(0, 2));

  const colorIndex = firstDigits % COLORS_LENGTH;

  return COLORS[colorIndex];
}
