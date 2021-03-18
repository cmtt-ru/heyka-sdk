/* eslint-disable no-magic-numbers */

import levenshtein from 'fast-levenshtein';
import * as cyrillicToTranslit from 'cyrillic-to-translit-js';

/**
 * Convert ms to hh:mm:ss
 *
 * @param {number} duration – duration in milliseconds
 * @returns {string}
 */
export function msToTime(duration) {
  if (duration <= 0) {
    return '00:00:00';
  }
  let seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60),
      hours = Math.floor((duration / (1000 * 60 * 60)));

  hours = (hours < 10) ? '0' + hours : hours;
  minutes = (minutes < 10) ? '0' + minutes : minutes;
  seconds = (seconds < 10) ? '0' + seconds : seconds;

  return hours + ':' + minutes + ':' + seconds;
}

/**
 * Make html links in text
 * @param {string} text – text
 * @return {string}
 */
export function linkify(text) {
  const regex = /(?:http(s)?:\/\/)?(?:[\w.-]+@)?[\w.-/]+(?:\.[\w.-]+)+/igm;

  const result = text.replace(regex, match => {
    if (match.includes('@')) {
      return `<a href="mailto:${match}">${match}</a>`;
    } else {
      let url = match;

      if (!url.startsWith('http')) {
        url = `https://${url}`;
      }

      return `<a href="${url}">${match}</a>`;
    }
  });

  return result;
}

/* --------------LEVENSHTEIN STUFF----------------*/

// other probably useful stuff:
// https://github.com/farzher/fuzzysort (probably better than levenshtein, idk)
// https://github.com/ai/convert-layout (doing sething like it here, but not quite)

const EN_MAP = ['`', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\'', '\\', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', '~', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '{', '}', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ':', '"', '|', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>', '?'];
const RU_MAP = ['ё', 'й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ъ', 'ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э', '\\', 'я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю', '.', 'Ё', 'Й', 'Ц', 'У', 'К', 'Е', 'Н', 'Г', 'Ш', 'Щ', 'З', 'Х', 'Ъ', 'Ф', 'Ы', 'В', 'А', 'П', 'Р', 'О', 'Л', 'Д', 'Ж', 'Э', '/', 'Я', 'Ч', 'С', 'М', 'И', 'Т', 'Ь', 'Б', 'Ю', ','];

const LAYOUTS = [EN_MAP, RU_MAP];

/**
 * Decide if item matches List's filter (SIMPLE)
 *
 * @param {string} text item's text
 * @param {string} filterBy search substring, we need to check if it is included in item's text
 * @param {number} errorProportion how many errors in search string are allowed
 * @returns {number} levenstein distance
 */
export function simpleMatchesFilter(text, filterBy, errorProportion = 0.2) {
  if (!filterBy.length) {
    return 0;
  }
  const levDist = similarity(text, filterBy, errorProportion);

  if (levDist !== Infinity) {
    return levDist;
  }

  return Infinity;
}

/**
 * Decide if item matches List's filter (ADVANCED)
 *
 * @param {string} text item's text
 * @param {string} filterBy search substring, we need to check if it is included in item's text
 * @param {object} textlang item's language 'code' and 'arr'
 * @param {object} filterlang substring's language 'code' and 'arr'
 * @param {number} errorProportion how many errors in search string are allowed
 * @returns {number} levenstein distance
 */
export function matchesFilter(text, filterBy, textlang, filterlang, errorProportion = 0.2) {
  /* Comparison with ru->en translit */
  if (filterlang.code === 'ru' && textlang.code === 'en') {
    const sim = similarity(text, cyrillicToTranslit().transform(filterBy), errorProportion);

    if (sim !== Infinity) {
      return sim;
    }
  }

  /* Comparison with en->ru translit */
  if (filterlang.code === 'en' && textlang.code === 'ru') {
    const sim = similarity(text, cyrillicToTranslit().reverse(filterBy), errorProportion);

    if (sim !== Infinity) {
      return sim;
    }
  }

  /* Comparison with accidentally incorrect layout */
  if (filterlang.code !== textlang.code) {
    const sim = similarity(text, switchLayout(filterBy, filterlang.arr, textlang.arr), errorProportion);

    if (sim !== Infinity) {
      return sim;
    }
  }

  return Infinity;
}

/**
   * Compare substring with string
   * @param {string} string item's string
   * @param {string} substring substring to compare to
   * @param {number} errorProportion how many errors in search string are allowed
   * @returns {number} levenshtein distance
   */
function similarity(string, substring, errorProportion = 0.2) {
  const str = string.toLowerCase();
  const substr = substring.toLowerCase();

  /* Check for pure substring */
  if (str.includes(substr)) {
    return 0;
  }

  /* Check for substring with levenshtein distance less than ((N+3)/5), where N = substring length */
  const len = substr.length;

  for (let i = 0; i < str.length; i++) {
    if (str[i] === substr[0]) {
      const error = Math.round(len * errorProportion);

      // we need to check several substrings of full strings: similar to substr length, but plus/minus possible levenstein error
      for (let l = len - error; l <= len + error; l++) {
        const strPiece = str.substring(i, i + l);

        const levDist = levenshtein.get(substr, strPiece, { useCollator: true });

        if (levDist <= error) {
          return levDist;
        }
      }
    }
  }

  return Infinity;
}

/**
 * Convert text as if it was typed on wrong layout
 *
 * @param {string} text string to convert
 * @param {array} startLayout text's keyboard layout
 * @param {array} finishLayout target keyboard layout
 * @returns {object}
 */
function switchLayout(text, startLayout, finishLayout) {
  return text.split('').map((sym) => {
    const ind = startLayout.indexOf(sym);

    if (ind === -1 || !finishLayout) {
      return sym;
    } else {
      return finishLayout[ind];
    }
  })
    .join('');
}

/**
 * Try to guess string's language.
 * Pretty lazy for now (we check first symbol)
 * @param {string} str string to check
 * @returns {object}
 */
export function detectLang(str) {
  for (let k = 0; k < LAYOUTS.length; k++) {
    if (LAYOUTS[k].includes(str[0])) {
      if (k === 0) {
        return {
          code: 'en',
          arr: LAYOUTS[0],
        };
      } else if (k === 1) {
        return {
          code: 'ru',
          arr: LAYOUTS[1],
        };
      } else {
        return {
          code: '',
          arr: LAYOUTS[k],
        };
      }
    }
  }

  return {
    code: 'en',
    arr: LAYOUTS[0],
  };
}
