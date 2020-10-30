import { EventEmitter } from 'events';

/**
 * Initial methods used during "initial" vuex action
 */

const INITIAL_METHODS = [
  'select',
];

/**
 * Class for storing throttle times for some API methods
 */
class InitialProcess {
  /**
   * TrottleAPI constructor
  */
  constructor() {
    super();
    this.state = false;
  }

  /**
   * Check if initial is occuring now
   *
   * @returns {boolean}
   */
  getState() {
    return this.state;
  }

  /**
   * Set true if initial is occuring now. False if it is finished
   * @param {string} state – initial state
   *
   * @returns {boolean}
   */
  setState(state) {
    this.state = state;
  }
}

export default new InitialProcess();
