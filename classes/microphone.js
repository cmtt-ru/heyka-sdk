import { EventEmitter } from 'events';
import store from '@/store';
import hark from '@sdk/classes/hark';

/**
 * Class for managing microphone media stream
 */
class Microphone extends EventEmitter {
  /**
   * Constructor
   */
  constructor() {
    super();

    /**
     * Microphone media stream
     * @type {MediaStream}
     */
    this.mediaStream = null;

    /**
     * Hark instance
     * @type {object}
     */
    this.harkInstance = null;

    /**
     * Array of listeners
     * @type {string[]}
     */
    this.listeners = [];

    store.watch(() => this.getSelectedMicrophone(), n => {
      if (this.listeners.length > 0) {
        this.createMediaStream();
      }
    });
  }

  /**
   * Get selected microphone
   * @returns {any}
   */
  getSelectedMicrophone() {
    return store.getters['app/getSelectedMicrophone'];
  }

  /**
   * Add new listener. If it's the first than create media stream
   * @param {string} id – id of the listener
   * @returns {void}
   */
  listen(id) {
    if (this.listeners.length === 0) {
      this.createMediaStream();
    }

    if (this.listeners.includes(id)) {
      return;
    }

    this.listeners.push(id);

    console.log('Microphone.listen -->', id);
    console.log('Microphone.listeners length -->', this.listeners.length);
  }

  /**
   * Remove listener
   * @param {string} id – id of the listener
   * @returns {void}
   */
  forget(id) {
    const index = this.listeners.indexOf(id);

    if (index > -1) {
      this.listeners.splice(index, 1);
    } else {
      console.warn(`Microphone.forget --> can't forget this id "${id}")`);
    }

    if (this.listeners.length === 0) {
      this.destroyMediaStream();
    }

    console.log('Microphone.forget -->', id);
    console.log('Microphone.listeners length -->', this.listeners.length);
  }

  /**
   * Start media stream for microphone volume test
   * @return {void}
   */
  async createMediaStream() {
    if (window.IS_IOS || window.IS_SAFARI) {
      return;
    }

    this.destroyMediaStream();

    if (this.getSelectedMicrophone() === null) {
      return;
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: this.getSelectedMicrophone(),
        },
      });

      this.harkInstance = hark(this.mediaStream, {
        interval: 100,
      });

      this.harkInstance.on('volume_change', (db) => {
        this.emit('volume-change', db);
      });

      this.harkInstance.on('speaking', () => {
        this.emit('speaking', true);
      });

      this.harkInstance.on('stopped_speaking', () => {
        this.emit('speaking', false);
      });
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * Destroy hark instance and media stream
   * @returns {void}
   */
  destroyMediaStream() {
    if (this.harkInstance) {
      this.harkInstance.stop();
      this.harkInstance = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
  }
}

export default new Microphone();
