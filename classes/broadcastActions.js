import { EventEmitter } from 'events';
import { IS_ELECTRON } from '@sdk/Constants';
import store from '@/store';

/**
 * Class for broadcasting actions
 */
class BroadcastActions extends EventEmitter {
  /**
   * Broadcast actions constructor
   */
  constructor() {
    super();

    if (IS_ELECTRON) {
      this.broadcastChannel = new BroadcastChannel('actions');
      this.broadcastChannel.onmessage = this.messageReceived.bind(this);
    }
  }

  /**
   * Dispatch action
   *
   * @param {string} action – vuex action name
   * @param {*} data – action data
   * @returns {void}
   */
  async dispatch(action, data) {
    const message = JSON.stringify({
      action,
      data,
    });

    if (IS_ELECTRON) {
      this.broadcastChannel.postMessage(message);
      this.emit('action', {
        action,
        data,
      });
    } else {
      await store.dispatch(action, data);
    }
  }

  /**
   * Receive message from broadcast channel
   *
   * @param {string} data – stringified action with data
   * @returns {void}
   */
  messageReceived({ data }) {
    this.emit('action', JSON.parse(data));
  }
}

export default new BroadcastActions();
