import { EventEmitter } from 'events';
import Logger from '@sdk/classes/logger';
import microphone from '@sdk/classes/microphone';

const cnsl = new Logger('Audiobridge plugin', '#2980B9');
const JANUS_PLUGIN = 'janus.plugin.audiobridge';

/**
 * Handle communication with audiobridge plugin
 * @class
 */
class AudiobridgePlugin extends EventEmitter {
  /**
   * Creates an instance of audiobridge plugin class
   * @param {object} options Audiobridge plugin config
   * @param {object} options.janus An active Janus connection
   * @param {number} options.room Room in audiobridge plugin
   * @param {string} options.token Authentication token for room
   * @param {string} options.userId Connected user id
   * @param {string} options.microphoneDeviceId Unique id for selected microphone device
   */
  constructor(options) {
    super();

    const {
      janus,
      room,
      token,
      userId,
      microphoneDeviceId,
    } = options;

    this.__janus = janus;
    this.__deviceId = microphoneDeviceId;
    this.__room = room;
    this.__token = token;
    this.__userId = userId;
    this.__maxBitrate = 48;

    /** Microphone handlers */
    this.__speakingHandler = null;
    this.__volumeHandler = null;

    this.__detached = false;
    this.__pluginHandle = null;

    /** Janus PeerConnection */
    this.__pc = null;
  }

  /**
   * Attaches audiobridge plugin and join room
   * @returns {undefined}
   */
  attach() {
    this.__janus.attach({
      plugin: JANUS_PLUGIN,
      // Called when plugin attached
      success: pluginHandle => {
        if (this.__detached) {
          return;
        }
        cnsl.debug('plugin attached');

        this.__pluginHandle = pluginHandle;
        this._joinChannel();
      },

      // Triggered after `getUserMedia` is called (isAllowed=true means that request for user media is accepted)
      consentDialog: isAllowed => {
        if (this.__detached) {
          return;
        }
        cnsl.debug('Consent dialog', isAllowed);
      },

      // Notifies that WebRTC connection between the computer and Janus is established (or is down)
      // reason is presented in some cases when state = false
      webrtcState: (state, reason) => {
        if (this.__detached) {
          return;
        }
        if (state) {
          this.__pc = this.__pluginHandle.webrtcStuff.pc;
        } else {
          this.__pc = null;
        }
        cnsl.debug('webrtcState', state, reason);
      },

      // Presents an ICE state for that moment
      // Meanings for state in simple words:
      // 'new', 'checking': Connection is being established, not at connected
      // 'connected', 'completed': Path for media stream is available
      // 'disconnected', 'failed': Media path is not available
      iceState: state => {
        if (this.__detached) {
          return;
        }
        cnsl.debug('iceState', state);
      },

      // Triggered when Janus starts or stops receiving client's media
      mediaState: (type, isActive) => {
        if (this.__detached) {
          return;
        }
        cnsl.debug('mediaState', type, isActive);
        this.emit('media-state', isActive);
      },

      // Notifies when some of packets are lost
      // uplink=true when some of packets from Janus are lost
      // uplink=false when all of our packets is not received by Janus
      slowLink: uplink => {
        if (this.__detached) {
          return;
        }
        cnsl.debug('slowLink', uplink);
        this.emit('audio-slow-link', uplink);
      },

      // Handle a message from plugin
      onmessage: (message, jsep) => {
        if (this.__detached) {
          return;
        }
        const event = message.audiobridge;

        switch (true) {
          case event === 'joined' && !!message.id:
            this._onJoinedChannel(message);
            break;
          case jsep !== undefined && jsep !== null:
            this._onRemoteJsep(jsep);
            break;
          default:
            cnsl.debug('message', message, jsep);
        }
      },

      // Local audio stream is available
      onlocalstream: stream => {
        if (this.__detached) {
          return;
        }
        cnsl.debug('localstream', stream);
        this._onLocalAudioStream(stream);
      },

      // Remote audio stream is available
      onremotestream: stream => {
        if (this.__detached) {
          return;
        }
        cnsl.debug('remotestream', stream);
        this.emit('remote-audio-stream', stream);
      },

      // Data Channel is available
      ondataopen: () => {
        if (this.__detached) {
          return;
        }
        cnsl.debug('dataopen');
      },

      // Some data is received through the Data Channel
      ondata: data => {
        if (this.__detached) {
          return;
        }
        cnsl.debug('data', data);
      },

      // WebRTC connection with the plugin was closed
      oncleanup: () => {
        if (this.__detached) {
          return;
        }
        cnsl.debug('cleanup');
      },

      // Plugin is detached (it can't be used)
      detached: () => {
        this.__detached = true;
        cnsl.debug('detached');
      },
    });
  }

  /**
   * Get current bitrate parameters (packet loss, upload speed, download speed, etc.)
   * @returns {object}
   */
  getBitrate() {
    return this.__pluginHandle.webrtcStuff.bitrate;
  }

  /**
   * Get audio Peer Connection
   * @returns {RTCPeerConnection}
   */
  getPeerConnection() {
    return this.__pc;
  }

  /**
   * Detached audiobridge plugin from Janus
   * @returns {undefined}
   */
  detach() {
    microphone.removeListener('speaking', this.__speakingHandler);
    microphone.removeListener('volume-change', this.__volumeHandler);
    microphone.forget('audiobridge-plugin');

    if (this.__pluginHandle) {
      this.__pluginHandle.detach();
      this.__pluginHandle = null;
    }
  }

  /**
   * Mute/unmute current participant
   * @param {boolean} muted Should the participant be muted
   * @returns {undefined}
   */
  setMuting(muted) {
    this.__pluginHandle.send({
      message: {
        request: 'configure',
        muted: muted,
      },
    });
  }

  /**
   * Change source for audio stream
   * @param {string} deviceId New soure device id
   * @returns {void}
   */
  setMicrophoneDevice(deviceId) {
    this.__deviceId = deviceId;
    this.__pluginHandle.createOffer({
      media: {
        replaceAudio: true,
        video: false,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          deviceId,
        },
      },
      success: (jsep) => {
        this.__pluginHandle.send({
          message: { request: 'configure' },
          jsep: jsep,
        });
        cnsl.debug(`Microphone was sucessfully changed!')`);
      },
      error: (error) => {
        cnsl.debug(`WebRTC error on change microphone: ${error}`, error);
      },
    });
  }

  /**
   * Send message about join to the channel
   * @returns {undefined}
   */
  _joinChannel() {
    this.__pluginHandle.send({
      message: {
        request: 'join',
        room: this.__room,
        display: this.__userId,
        token: this.__token,
      },
    });
  }

  /**
   * Handles client joined the channel
   * @param {object} message Janus event message object
   * @returns {undefined}
   */
  _onJoinedChannel(message) {
    cnsl.debug('room joined', message);

    this.__pluginHandle.createOffer({
      media: {
        video: false,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          deviceId: this.__deviceId,
        },
      },
      success: jsep => {
        this.__pluginHandle.send({
          message: {
            request: 'configure',
            muted: true,
          },
          jsep,
        });
      },
      error: error => {
        cnsl.debug('create offer error', error);
      },
    });
  }

  /**
   * Handles remote jsep
   * @param {object} jsep Remote jsep object
   * @returns {undefined}
   */
  _onRemoteJsep(jsep) {
    cnsl.debug('handle remote jsep', jsep);
    this.__pluginHandle.handleRemoteJsep({ jsep });
  }

  /**
   * Handles local audio stream
   * @param {object} stream Audio stream object
   * @returns {undefined}
   */
  _onLocalAudioStream(stream) {
    this.__speakingHandler = this._speakingHandler.bind(this);
    this.__volumeHandler = this._volumeHandler.bind(this);

    microphone.listen('audiobridge-plugin');
    microphone.on('speaking', this.__speakingHandler);
    microphone.on('volume-change', this.__volumeHandler);
  }

  _speakingHandler(state) {
    if (state) {
      this.emit('start-speaking');
    } else {
      this.emit('stop-speaking');
    }
  }

  _volumeHandler(db) {
    this.emit('volume-change', db);
  }

  /**
   * Set prebuffer
   * @param {number} value – prebuffer value
   * @returns {void}
   */
  setPrebuffer(value) {
    console.log('AudiobridgePlugin --> set prebuffer to', value);
    this.__pluginHandle.send({
      message: {
        request: 'configure',
        prebuffer: value,
      },
    });
  }
}

export default AudiobridgePlugin;
