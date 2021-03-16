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

export function dateToElapsedTime(date, texts){
  date = new Date(date);
  const deltaTime = Date.now() - date.getTime();
  if (deltaTime < 1000 * 60) return texts.justNow;
  else if (deltaTime < 1000 * 60 * 60) {
    return `${Math.floor((deltaTime / (1000 * 60)))}${texts.minutes}`;
  } else if (deltaTime < 1000 * 60 * 60 * 24){
    return `${Math.floor((deltaTime / (1000 * 60 * 60)))}${texts.hours}`;
  } else if (deltaTime < 1000 * 60 * 60 * 24 * 7){
    return `${Math.floor((deltaTime / (1000 * 60 * 60 * 24)))}${texts.days}`;
  } else if (date.getUTCFullYear() === new Date().getUTCFullYear()) {
    return `${date.getUTCDate()} ${texts.months[date.getMonth()]}`;
  } else {
    return `${date.getUTCDate()} ${texts.months[date.getMonth()]} ${date.getUTCFullYear()}`;
  }
}