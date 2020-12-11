import { EventEmitter } from 'events';

const LOOP_INTERVAL = 1000;
const RTT_MAX_LENGTH = 30;

const PREBUFFER_MIN = 8;
const PREBUFFER_MAX = 50;
const PREBUFFER_MS = 20;

const PREBUFFER_GOOD_MAX = 16;
const PREBUFFER_BAD_MAX = 32;
const PREBUFFER_AWFUL = 50;

const STATUS_GOOD = 0;
const STATUS_BAD = 1;
const STATUS_AWFUL = 2;
const STATUS_DELAYS = 3;

/**
 * Audio Quality Controller collect's Peer Connection metrics, analyze them & emit events
 */
export default class AudioQualityController extends EventEmitter {
  /**
   * Constructor
   * @param {RTCPeerConnection} pc - peer connection object
   */
  constructor(pc) {
    super();

    this.pc = pc;

    this.timer = null;

    this.rttArray = [];

    this.lastPrebuffer = {
      prebuffer: 8,
      status: STATUS_GOOD,
    };

    this.init();
  }

  /**
   * Init & start interval
   * @returns {void}
   */
  init() {
    this.timer = setInterval(async () => {
      await this.collectMetrics();
      this.process();
    }, LOOP_INTERVAL);
  }

  /**
   * Destroy instance
   * @returns {void}
   */
  destroy() {
    clearInterval(this.timer);
    this.pc = null;
    this.rttArray = null;
    this.lastPrebuffer = null;
  }

  /**
   * Process metrics and emit events
   * @returns {void}
   */
  process() {
    const preBufferObject = this.calculatePreBuffer(this.rttArray);

    if (preBufferObject.prebuffer !== this.lastPrebuffer.prebuffer) {
      console.log('AQC --> prebuffer changed', preBufferObject.prebuffer);
      this.emit('prebuffer', preBufferObject.prebuffer);

      if (preBufferObject.status !== this.lastPrebuffer.status) {
        console.log('AQC --> status changed', preBufferObject.status);
        this.emit('status', preBufferObject.status);
      }

      this.lastPrebuffer = preBufferObject;
    }
  }

  /**
   * Collect necessary metrics
   * @returns {void}
   */
  async collectMetrics() {
    const stats = await this.pc.getStats();
    const rtts = [];

    stats.forEach((value, key) => {
      /** Find all RTT */
      if (value.googRtt && value.ssrc) {
        rtts.push(parseInt(value.googRtt));
      }
    });

    if (rtts.length) {
      this.rttArray.push(Math.max(...rtts));
      this.rttArray = this.rttArray.slice(-RTT_MAX_LENGTH);

      // console.log('AQC --> rtt', this.rttArray);
    }
  }

  /**
   * Calculate pre buffer based on RTT values
   * @param {array<number>} rttArray — array of RTT values
   * @returns {object}
   */
  calculatePreBuffer(rttArray) {
    let status = STATUS_GOOD;

    const max = Math.max(...rttArray);
    const min = Math.min(...rttArray);

    let prebuffer = Math.round((max - min) / PREBUFFER_MS);

    switch (true) {
      case prebuffer < PREBUFFER_MIN:
        status = STATUS_GOOD;
        prebuffer = PREBUFFER_MIN;
        break;

      case prebuffer <= PREBUFFER_GOOD_MAX:
        status = STATUS_GOOD;
        break;

      case prebuffer <= PREBUFFER_BAD_MAX:
        status = STATUS_BAD;
        break;

      case prebuffer <= PREBUFFER_AWFUL:
        status = STATUS_AWFUL;
        break;

      case prebuffer > PREBUFFER_MAX:
        status = STATUS_DELAYS;
        prebuffer = PREBUFFER_MAX;
        break;
    }

    if (prebuffer > PREBUFFER_MAX) {
      prebuffer = PREBUFFER_MAX;
    } else if (prebuffer < PREBUFFER_MIN) {
      prebuffer = PREBUFFER_MIN;
    }

    return {
      prebuffer,
      status,
    };
  }
}
