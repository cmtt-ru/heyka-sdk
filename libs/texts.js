/* eslint-disable no-magic-numbers */
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
  const regex = /(?:http(s)?:\/\/)?(?:[\w.-]+@)?[\w.-]+(?:\.[\w.-]+)+/igm;

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
