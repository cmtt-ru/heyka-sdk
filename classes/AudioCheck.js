import { EventEmitter } from 'events';
import store from '@/store';
import hark from '@sdk/classes/hark';
import router from '@/router';
import i18n from '@sdk/translations/i18n';
import broadcastEvents from '@sdk/classes/broadcastEvents';
import microphone from '@sdk/classes/microphone';

const texts = i18n.t('notifications');

/**
 * Audio element for audio test
 * @type {HTMLAudioElement}
 */
const audioTest = new Audio(require('@assets/audio/test-sound.mp3'));

/**
 * Class for detecting AudioTrouble
 */
export default class AudioCheck extends EventEmitter {
  /**
   * Init checker
   *
   * @param {function} invoke - ipcRenderer.invoke
   * @param {function} shutdown - electron-shutdown-command
   */
  constructor(invoke = () => null, shutdown = () => null) {
    super();
    this.invoke = invoke;
    this.shutdown = shutdown;

    this.__skipMutedTalk = false;

    this.mediaState = {};

    store.watch(() => store.getters['me/getMediaState'].microphone, state => {
      this.mediaState = {
        microphone: state,
      };

      this.unsubscribeMutedTalk();
    });

    broadcastEvents.on('audio-check-skip-muted-talk', () => {
      this.__skipMutedTalk = true;
    });
  }

  /**
   * List of all devices
   * @returns {object}
   */
  _devices() {
    return store.getters['app/getDevices'];
  }

  /**
   * List of selected devices
   * @returns {object}
   */
  _selectedDevices() {
    return store.getters['app/getSelectedDevices'];
  }

  /**
   * Selected microphone model
   * @returns {object}
   */
  _selectedMicrophone() {
    return this._selectedDevices().microphone;
  }

  /**
   * Start listen microphone volume event
   * @return {void}
   */
  async _startListenVolume() {
    if (this._selectedMicrophone() === null) {
      return;
    }

    this.microphoneHandler = this.microphoneVolumeChanged.bind(this);

    microphone.listen('audio-check');
    microphone.on('volume-change', this.microphoneHandler);
  }

  /**
   * Stop listen microphone volume event
   * @returns {void}
   */
  _stopListenVolume() {
    microphone.removeListener('volume-change', this.microphoneHandler);
    microphone.forget('audio-check');
  }

  /**
   * Microphone volume change event handler
   * @param {number} db – volume
   * @returns {void}
   */
  microphoneVolumeChanged(db) {
    this.microphoneVolume = db;
  }

  /**
   * Play test sound
   * @returns {void}
   */
  playTestSound() {
    audioTest.play();
  }

  /**
   * Check audio troubles
   * @returns {boolean}
   */
  async checkAudio() {
    if (this._checkNoMic()) {
      return true;
    }

    this._startListenVolume();

    const checkDelay = 100; // milliseconds
    const sufficientAmount = 20; // times
    const vol1 = this.microphoneVolume;

    for (let i = 0; i < sufficientAmount; i++) {
      await new Promise(resolve => setTimeout(resolve, checkDelay));
      if (this.microphoneVolume !== vol1) {
        this._stopListenVolume();

        return true;
      }
    }

    if (this._checkNoPermission()) {
      this._stopListenVolume();

      return true;
    }

    this._stopListenVolume();

    this._checkNoSound();
  }

  /**
   * Check if user doesn't have any mic available
   * @returns {void}
   */
  async _checkNoMic() {
    if (this._devices().microphones.length === 0) {
      const notification = {
        data: {
          text: texts.nomic.text,
          buttons: [
            {
              text: texts.nomic.button1,
              type: 1,
              close: true,
            },
          ],
        },
      };

      await store.dispatch('app/addNotification', notification);

      return true;
    } else {
      return false;
    }
  }

  /**
   * Check if user has somehow no sound detected (but has connected mic)
   * @returns {void}
   */
  async _checkNoSound() {
    if (this._devices().microphones.length > 2) {
      const notification = {
        data: {
          text: texts.othermic.text,
          buttons: [
            {
              text: texts.othermic.button1,
              type: 1,
              action: () => {
                router.push({ name: 'settings-devices' });
              },
            },
            {
              text: texts.othermic.button2,
              close: true,
            },
          ],
        },
      };

      await store.dispatch('app/addNotification', notification);
    } else {
      const notification = {
        data: {
          text: texts.noaudio.text,
          buttons: [
            {
              text: texts.noaudio.button1,
              type: 12,
              action: () => {
                //! asks password on mac!
                this.shutdown.reboot({ sudo: true });
              },
            },
            {
              text: texts.noaudio.button2,
              type: 1,
              close: true,
            },
          ],
        },
      };

      await store.dispatch('app/addNotification', notification);
    }
  }

  /**
   * Check if user didn't give any permission to use his mic
   * @returns {void}
   */
  async _checkNoPermission() {
    if (!IS_MAC) {
      return false;
    }

    const micState = await this.invoke('remote-systemPreferences-microphone');

    if (micState === 'restricted' || micState === 'denied') {
      const notification = {
        data: {
          text: texts.nomicpermission.text,
          buttons: [
            {
              text: texts.nomicpermission.button1,
              type: 1,
              action: () => {
                window.open('x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone', '_blank');
              },
            },
            {
              text: texts.nomicpermission.button2,
              close: true,
            },
          ],
        },
      };

      await store.dispatch('app/addNotification', notification);

      return true;
    } else {
      return false;
    }
  }

  /**
   * Subscribe to 'louder than minLevel' event
   * @returns {void}
   */
  async subscribeMutedTalk() {
    this.subscribeMutedTalk.__mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: this._selectedMicrophone(),
      },
    });

    this.subscribeMutedTalk.__harkInstance = hark(this.subscribeMutedTalk.__mediaStream, {
      interval: 100,
    });

    this.subscribeMutedTalk.talkingLevel = -100;
    const minLevel = -40; // speak louder and you'll get notification

    this.subscribeMutedTalk.__harkInstance.on('volume_change', (db) => {
      this.subscribeMutedTalk.talkingLevel = (this.subscribeMutedTalk.talkingLevel + db) / 2;

      if (this.subscribeMutedTalk.talkingLevel > minLevel) {
        this.showTakingMutedNotification();
        this.unsubscribeMutedTalk();
      }
    });
  }

  /**
   * Unsubscribe from 'louder than minLevel' event
   * @returns {void}
   */
  async unsubscribeMutedTalk() {
    if (this.subscribeMutedTalk.__harkInstance) {
      this.subscribeMutedTalk.__harkInstance.stop();
      delete this.subscribeMutedTalk.__harkInstance;
    }

    if (this.subscribeMutedTalk.__mediaStream) {
      this.subscribeMutedTalk.__mediaStream.getTracks().forEach(track => track.stop());
    }
  }

  /**
   * Display 'No one hears you' push
   * @returns {void}
   */
  async showTakingMutedNotification() {
    if (this.mediaState.microphone || this.__skipMutedTalk) {
      return;
    }
    const push = {
      inviteId: Date.now().toString(),
      local: true,
      name: 'noSound',
      message: { action: 'muted' },
    };

    await store.dispatch('app/addPush', push);
  }
}
