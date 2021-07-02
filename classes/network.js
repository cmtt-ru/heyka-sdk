import { EventEmitter } from 'events';
import axios from 'axios';
import sleep from 'es7-sleep';
import Logger from '@sdk/classes/logger';

const cnsl = new Logger('Network', '#95b11c');

/**
 * Default long polling response timeout
 * @type {number}
 */
const LONG_POLLING_TIMEOUT = 25000;

/**
 * Reconnect long polling response timeout
 * @type {number}
 */
const LONG_POLLING_RECONNECT_TIMEOUT = 0;

/**
 * Long polling request timeout
 * @type {number}
 */
const REQUEST_TIMEOUT = 2000;

/**
 * Reconnect delay constants
 */
const RECONNECT_DELAY_K = 1.05;
const RECONNECT_DELAY_MIN = 1000;
const RECONNECT_DELAY_MAX = 30000;
const RECONNECT_MAX_ATTEMPTS = 100;

/**
 * Monitor network activity
 */
class Network extends EventEmitter {
  /**
   * Network constructor
   */
  constructor() {
    super();

    this.clientIp = null;
    this.internetState = null;
    this.active = false;
    this.reconnectAttempts = 0;

    window.network = this;
  }

  /**
   * Start long polling cycle
   * @returns {Promise<void>}
   */
  async loop() {
    this.active = true;

    while (this.active) {
      /** First call — perform fast internet check */
      if (this.internetState === null) {
        this.internetState = true;
        await this.poll(LONG_POLLING_RECONNECT_TIMEOUT, REQUEST_TIMEOUT);
      }

      /** Internet is online — continue produce long polling requests */
      if (this.internetState === true) {
        // cnsl.log('restart long polling');
        await this.poll(LONG_POLLING_TIMEOUT);
      }

      /** Internet is online — try to reconnect */
      if (this.internetState === false && this.active) {
        this.incrementReconnectAttempt();
        const state = await this.poll(LONG_POLLING_RECONNECT_TIMEOUT, REQUEST_TIMEOUT);

        if (state === false) {
          cnsl.log('poll reconnect attempt', this.reconnectAttempts, 'in', this.getReconnectDelay(), 'ms');
          await sleep(this.getReconnectDelay());
        } else {
          cnsl.log('poll reconnect success');
          this.resetReconnectAttempts();
          await sleep(REQUEST_TIMEOUT);
        }
      }
    }
  }

  /**
   * Make single poll
   * @param {number} pollTimeout – long polling response timeout
   * @param {number} requestTimeout – request timeout
   * @returns {Promise<boolean>}
   */
  async poll(pollTimeout, requestTimeout = 0) {
    let response;

    try {
      response = await axios.get(`/long-poll`, {
        timeout: requestTimeout,
        params: {
          timeout: pollTimeout,
        },
      });

      this.updateState(true);
      this.updateIp(response.data);

      return true;
    } catch (error) {
      this.updateState(false);

      return false;
    }
  }

  /**
   * Update client ip address
   * @param {string} ip – ip address
   * @return {void}
   */
  updateIp(ip) {
    if (this.clientIp !== ip && this.clientIp !== null) {
      cnsl.log('poll ip changed');
      this.emit('ip-changed');
    }

    this.clientIp = ip;
  }

  /**
   * Update internet state
   * @param {boolean} state – internet state
   * @return {void}
   */
  updateState(state) {
    if (this.internetState !== state) {
      cnsl.log('poll internet state', state);
      this.emit('internet-state', state);
    }

    this.internetState = state;
  }

  /**
   * Increment's reconnection attempts
   * @return {void}
   */
  incrementReconnectAttempt() {
    this.reconnectAttempts += 1;

    if (this.reconnectAttempts >= RECONNECT_MAX_ATTEMPTS) {
      /** Code here */
    }
  }

  /**
   * Reset reconnect attempts count
   * @return {void}
   */
  resetReconnectAttempts() {
    this.reconnectAttempts = 0;
  }

  /**
   * Calculate reconnect delay based on reconnection attempts
   * @return {number}
   */
  getReconnectDelay() {
    const delay = Math.round(RECONNECT_DELAY_MIN * (RECONNECT_DELAY_K ** this.reconnectAttempts));

    if (delay > RECONNECT_DELAY_MAX) {
      return RECONNECT_DELAY_MAX;
    }

    return delay;
  }

  /**
   * Start watching internet state
   * @return {void}
   */
  watchInternetState() {
    cnsl.log('start watch');
    this.loop();
  }

  /**
   * Stop watching internet state
   * @return {void}
   */
  stopWatch() {
    this.active = false;
    this.resetReconnectAttempts();
    cnsl.log('stop watch');
  }
}

export default new Network();
