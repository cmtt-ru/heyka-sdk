/* eslint-disable require-jsdoc, no-magic-numbers */
import hark from 'hark';

function float(n, fixed = 2) {
  const d = 10 ** fixed;

  return Math.round(n * d) / d;
}

/**
 * Class for measuring volume stability in MediaStream
 */
class VolumeStability {
  /**
   * Constructor
   * @param {object} stream – stream
   */
  constructor(stream) {
    this.stream = stream;
    this.hark = null;

    this.volumeArray = [];
  }

  start() {
    this.hark = hark(this.stream, {
      interval: 100,
    });

    this.hark.on('volume_change', this.volumeChangeHandler.bind(this));
  }

  stop() {
    this.hark.stop();
    this.hark.removeAllListeners('volume_change');
  }

  volumeChangeHandler(db) {
    this.volumeArray.push(float(db));
  }

  getStats() {
    const arr = this.volumeArray.slice(20);
    const sum = arr.reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const avg = float((sum / arr.length) || 0);

    return {
      avg,
      min,
      max,
    };
  }
}

export default VolumeStability;
