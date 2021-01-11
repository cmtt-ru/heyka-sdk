import store from '@/store';
import { EventEmitter } from 'events';
import network from '@sdk/classes/network';

/**
 * Connection checking class
 */
class ConnectionCheck extends EventEmitter {
  /**
   * Connection check constructor
   */
  constructor() {
    super();

    this.internetTryingToReconnect = false;

    this.onlineState = true;

    network.on('internet-state', this.internetStateHandler.bind(this));
  }

  /**
   * Internet state event handler
   * @param {boolean} state – current internet state
   * @return {Promise<void>}
   */
  async internetStateHandler(state) {
    this.onlineState = state;

    if (state === false) {
      this.internetTryingToReconnect = true;
    } else if (this.internetTryingToReconnect === true) {
      this.internetTryingToReconnect = false;
      this.emit('internet-reconnected');
    }

    if (state === true && this.onlineStatePromiseResole) {
      this.onlineStatePromiseResole(true);
      this.onlineStatePromise = null;
      this.onlineStatePromiseResole = null;
    }

    store.commit('app/SET_CONNECTION_STATUS', {
      internet: state,
    });
  }

  /**
   * Handle socket state
   *
   * @param {boolean} state – reconnecting or not
   * @returns {void}
   */
  async handleSocketState(state) {
    store.commit('app/SET_CONNECTION_STATUS', {
      socket: state,
    });
  }

  /**
   * Handle server availability
   *
   * @param {boolean} state – down or not
   * @returns {void}
   */
  async handleApiState(state) {
    store.commit('app/SET_CONNECTION_STATUS', {
      api: state,
    });
  }

  /**
   * Handle Janus connection state
   *
   * @param {boolean} state – down or not
   * @returns {void}
   */
  async handleJanusState(state) {
    store.commit('app/SET_CONNECTION_STATUS', {
      janus: state,
    });
  }

  /**
   * Wait until online
   * @returns {Promise<boolean>}
   */
  async waitUntilOnline() {
    if (this.onlineStatePromise) {
      return this.onlineStatePromise;
    }

    if (this.onlineState) {
      return true;
    } else {
      this.onlineStatePromise = new Promise(resolve => {
        this.onlineStatePromiseResole = resolve;
      });

      return this.onlineStatePromise;
    }
  }

  /**
   * Internet online state
   * @returns {boolean}
   */
  isOnline() {
    return this.onlineState;
  }
}

export default new ConnectionCheck();
