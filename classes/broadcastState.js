import { EventEmitter } from 'events';
import { IS_ELECTRON } from '@sdk/Constants';

/**
 * Class for broadcasting state
 */
class BroadcastState extends EventEmitter {
  /**
   * Broadcast actions constructor
   */
  constructor() {
    super();

    if (IS_ELECTRON) {
      this.broadcastChannel = new BroadcastChannel('state');
      this.broadcastChannel.onmessage = this.messageReceived.bind(this);
    }
  }

  /**
   * Request state from secondary windows
   * @returns {void}
   */
  requestState() {
    if (IS_ELECTRON) {
      this.broadcastChannel.postMessage({
        action: 'state-request',
      });
    }
  }

  /**
   * Resolve state from main window
   * @param {object} state – vuex state
   * @returns {void}
   */
  resolveState(state) {
    if (IS_ELECTRON) {
      this.broadcastChannel.postMessage({
        action: 'state',
        data: JSON.stringify(state),
      });
    }
  }

  /**
   * Receive message from broadcast channel
   *
   * @param {string} data – data
   * @param {string} data.action – action name
   * @param {string} data.data – stringified state
   * @returns {void}
   */
  messageReceived({ data }) {
    if (data.action === 'state-request') {
      this.emit('state-request');
    }

    if (data.action === 'state') {
      this.emit('state', JSON.parse(data.data));
    }
  }
}

export default new BroadcastState();
