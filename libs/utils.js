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
