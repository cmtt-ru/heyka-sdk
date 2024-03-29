import { EventEmitter } from 'events';
import Janus from './janus';
import AudiobridgePlugin from './AudiobridgePlugin';
import PublishingVideoroomPlugin from './PublishingVideoroomPlugin';
import SubscribingVideoroomPlugin from './SubscribingVideoroomPlugin';
import mediaCapturer from '@classes/mediaCapturer';
// eslint-disable-next-line no-unused-vars
import adapter from 'webrtc-adapter';
import connectionCheck from '@sdk/classes/connectionCheck';
import Logger from '@sdk/classes/logger';
const cnsl = new Logger('Janus wrapper', '#5DADE2');

const ERROR_CODES = {
  SERVER_DOWN: 'Server is down',
  AUTHENTICATION_ERROR: 'Authentication error',
  UNKNOW: 'Unknow error',
};
const REQUEST_VIDEOSTREAM_TIMEOUT = 5000;
const DEFAULT_BITRATE_CAMERA_ = 256000;
const DEFAULT_BITRATE_SCREEN = 768000;

// Possible events for subscribing
const JANUS_WRAPPER_EVENTS = {
  connectionError: 'connection-error',
  remoteAudioStream: 'remote-audio-stream',
  audioStreamActive: 'audio-stream-active',
  speaking: 'speaking',
  volumeChange: 'volume-change',
  videoPublishersList: 'video-publishers-list',
  videoPublisherJoined: 'video-publisher-joined',
  videoPublisherLeft: 'video-publisher-left',
  remoteVideoStream: 'remote-video-stream',
  localVideoStream: 'local-video-stream',
  successVideoPublishing: 'success-video-publishing',
  channelJoined: 'channel-joined',
  audioSlowLink: 'audio-slow-link',
  videoSlowLink: 'video-slow-link',
  webrtcCleanUp: 'webrtc-cleanup',
  startCameraStream: 'start-camera-stream',
};

/**
 * Wrapper for Janus connection
 * @class
 */
class JanusWrapper extends EventEmitter {
  /**
   * Creates an instance for Janus connection
   * @param {object} config Janus connection parameters
   * @param {string} config.url Url of Janus server
   * @param {string} config.janusServerUrl Url of Janus server
   * @param {string} config.janusWsServerUrl Weboscket url of janus server
   * @param {string} config.workspaceToken Authentication token for Janus connection
   * @param {string} config.channelToken Authentication token for channels
   * @param {number} config.audioRoomId Janus audio room id
   * @param {number} config.videoRoomId Janus video room id
   * @param {string} config.userId Application user id
   * @param {string} config.microphoneDeviceId Device id of selected microphone
   * @param {boolean} config.debug Enable or disable debug output
   */
  constructor({
    janusServerUrl,
    janusWsServerUrl,
    janusAuthToken,
    channelAuthToken,
    audioRoomId,
    videoRoomId,
    userId,
    microphoneDeviceId,
    debug,
  }) {
    super();

    // Initialize private variables
    this.__url = janusServerUrl;
    this.__wsUrl = janusWsServerUrl;
    this.__workspaceToken = janusAuthToken;
    this.__channelToken = channelAuthToken;
    this.__audioRoomId = audioRoomId;
    this.__videoRoomId = videoRoomId;
    this.__userId = userId;
    this.__microphoneDeviceId = microphoneDeviceId;
    this.__debug = debug;

    this.__janus = null;

    // plugins
    this.__audiobridgePlugin = null;
    this.__audiobridgeReady = false;
    this.__videoroomPlugin = null;
    this.__videoroomReady = false;

    // local stream flag
    this.__localVideoStream = false;

    // plugins for specific video publishers
    this.__videoroomPlugins = {};
  }

  /**
   * Initialized janus library
   * It is needed to be called just after app started
   * @static
   * @return {Promise<null>}
   */
  static init() {
    return new Promise((resolve, reject) => {
      if (!Janus.isWebrtcSupported()) {
        reject(new Error('WebRTC is not supported'));
      }
      Janus.init({
        debug: this.__debug,
        dependencies: Janus.useDefaultDependencies(),
        callback: function () {
          resolve();
        },
      });
    });
  }

  /**
   * Attaches media stream to an HTML5 audio element
   * @static
   * @param {object} element HTML element
   * @param {object} stream Media stream
   * @return {undefined}
   */
  static attachMediaStream(element, stream) {
    Janus.attachMediaStream(element, stream);
  }

  /**
   * Connects to the server and join to audio channels
   * @public
   * @returns {void}
   */
  async join() {
    /** Connect to Janus */
    if (!this.__janus) {
      await this._connect();
    }

    // connect audiobridge plugin

    const audiobridgePlugin = new AudiobridgePlugin({
      janus: this.__janus,
      room: this.__audioRoomId,
      token: this.__channelToken,
      userId: this.__userId,
      microphoneDeviceId: this.__microphoneDeviceId,
    });

    audiobridgePlugin.attach();

    audiobridgePlugin.on('remote-audio-stream', stream => this.emit(JANUS_WRAPPER_EVENTS.remoteAudioStream, stream));
    audiobridgePlugin.on('media-state', isActive => {
      this.emit(JANUS_WRAPPER_EVENTS.audioStreamActive, isActive);
      if (isActive) {
        this.__audiobridgeReady = true;
        // Сообщаем о том, что join к каналу успешно завершен
        // Если перед этим videoroom заджойнился к каналу
        if (this.__videoroomReady) {
          this.emit(JANUS_WRAPPER_EVENTS.channelJoined);
        }
      }
    });
    audiobridgePlugin.on('start-speaking', () => this.emit(JANUS_WRAPPER_EVENTS.speaking, true));
    audiobridgePlugin.on('stop-speaking', () => this.emit(JANUS_WRAPPER_EVENTS.speaking, false));
    audiobridgePlugin.on('volume-change', (db) => this.emit(JANUS_WRAPPER_EVENTS.volumeChange, db));
    audiobridgePlugin.on('audio-slow-link', (uplink) => this.emit(JANUS_WRAPPER_EVENTS.audioSlowLink, uplink));

    this.__audiobridgePlugin = audiobridgePlugin;

    // connect videoroom plugin
    const videoroomPlugin = new PublishingVideoroomPlugin({
      janus: this.__janus,
      room: this.__videoRoomId,
      token: this.__channelToken,
      userId: this.__userId,
    });

    videoroomPlugin.attach();

    videoroomPlugin.on('active-publishers', publishers => {
      this.emit(JANUS_WRAPPER_EVENTS.videoPublishersList, publishers);
      this.__videoroomReady = true;
      // videoroom готов, сообщаем что присоединение к каналу завершено
      // если при этом audiobridge уже заджойнился
      if (this.__audiobridgeReady) {
        this.emit(JANUS_WRAPPER_EVENTS.channelJoined);
      }
    });
    videoroomPlugin.on('success-publishing', () => this.emit(JANUS_WRAPPER_EVENTS.successVideoPublishing));
    videoroomPlugin.on('local-video-stream', () => {
      this.__localVideoStream = true;
    });
    videoroomPlugin.on('video-slow-link', () => this.emit(JANUS_WRAPPER_EVENTS.videoSlowLink));
    videoroomPlugin.on('webrtc-cleanup', () => {
      this.emit(JANUS_WRAPPER_EVENTS.webrtcCleanUp);
      this.__localVideoStream = false;
    });

    this.__videoroomPlugin = videoroomPlugin;
  }

  /**
   * Mute/unmute current user
   * @param {boolean} muted Should the user be muted
   * @returns {undefined}
   */
  setMuting(muted) {
    this.__audiobridgePlugin.setMuting(muted);
  }

  /**
   * Set new microphone source
   * @param {string} deviceId Device id
   * @returns {void}
   */
  setMicrophoneDevice(deviceId) {
    if (this.__audiobridgePlugin) {
      this.__audiobridgePlugin.setMicrophoneDevice(deviceId);
    }
  }

  /**
   * Set new camera source
   * @param {string} deviceId Device id
   * @returns {void}
   */
  async setCameraDevice(deviceId) {
    if (this.__videoroomPlugin) {
      const stream = await mediaCapturer.getCameraStream(deviceId);

      this.__videoroomPlugin.replaceStream(stream);

      this.emit(JANUS_WRAPPER_EVENTS.startCameraStream, stream);
    }
  }

  /**
   * Return true if we already have videostream
   *
   * @returns {boolean}
   */
  isLocalVideoStream() {
    return this.__localVideoStream;
  }

  /**
   * Publish video stream
   * @param {string} type "camera" or "screen"
   * @param {string} source Source id (camera device id or screen source id)
   * @param {?number} index Source index
   * @returns {void}
   */
  async publishVideoStream(type = 'camera', source, index) {
    let stream = null;

    cnsl.debug('Start sharing video', type, source);

    switch (type) {
      case 'camera':
        stream = await mediaCapturer.getCameraStream(source);
        this.emit(JANUS_WRAPPER_EVENTS.startCameraStream, stream);
        break;

      case 'screen':
        stream = await mediaCapturer.getStream(source, index);
        break;

      case 'stream':
        stream = source;
        break;
    }

    this.__videoroomPlugin.publishVideo(stream, type === 'camera' ? DEFAULT_BITRATE_CAMERA_ : DEFAULT_BITRATE_SCREEN);
  }

  /**
   * Unpublish video stream
   * @returns {void}
   */
  unpublishVideoStream() {
    if (!this.__videoroomPlugin) {
      return;
    }
    this.__videoroomPlugin.unpublishVideo();
  }

  /**
   * Request video stream for given publisher
   * @param {string} janusId Janus user id subscribe for
   * @returns {Promise<MediaStream>} Return media stream
   */
  async requestVideoStream(janusId) {
    const plugin = new SubscribingVideoroomPlugin({
      janus: this.__janus,
      userId: this.__userId,
      room: this.__videoRoomId,
      janusId,
      token: this.__channelToken,
    });

    this.__videoroomPlugins[janusId] = plugin;

    cnsl.info(`videoroomPlugins ADDED ${Object.keys(this.__videoroomPlugins).length}`, this.__videoroomPlugins);
    let requestTimeout;
    const prom = new Promise((resolve, reject) => {
      requestTimeout = setTimeout(() => {
        console.error('REQUEST_VIDEOSTREAM_TIMEOUT');
      }, REQUEST_VIDEOSTREAM_TIMEOUT);
      plugin.once('remote-video-stream', stream => {
        clearTimeout(requestTimeout);
        resolve(stream);
      });
    });

    plugin.attach();

    return prom;
  }

  /**
   * Stops receiving video stream from given publisher
   * @param {string} janusId Janus user id
   * @returns {void}
   */
  async stopReceivingVideoStream(janusId) {
    if (!this.__videoroomPlugins[janusId]) {
      return;
    }

    this.__videoroomPlugins[janusId].detach();

    delete this.__videoroomPlugins[janusId];

    cnsl.info(`videoroomPlugins REMOVED ${Object.keys(this.__videoroomPlugins).length}`, this.__videoroomPlugins);
  }

  /**
   * Get bitrate info
   * @returns {object}
   */
  getAudioBitrate() {
    if (this.__audiobridgePlugin) {
      return this.__audiobridgePlugin.getBitrate();
    }

    return null;
  }

  /**
   * Get AudioBridge Peer Connection
   * @returns {object}
   */
  getAudioPeerConnection() {
    if (this.__audiobridgePlugin) {
      return this.__audiobridgePlugin.getPeerConnection();
    }

    return null;
  }

  /**
   * Set AudioBridge prebuffer
   * @param {number} value – prebuffer value
   * @returns {void}
   */
  setAudioPrebuffer(value) {
    if (this.__audiobridgePlugin) {
      return this.__audiobridgePlugin.setPrebuffer(value);
    }
  }

  /**
   * Connects to the Janus server
   * @private
   * @returns {Promise<null>}
   */
  _connect() {
    return new Promise((resolve, reject) => {
      let isFullfilled = false;

      cnsl.debug(`Connect to janus. rest-api: ${this.__url}, ws-api: ${this.__wsUrl}`);

      this.__janus = new Janus({
        server: [this.__wsUrl, this.__url],
        token: this.__workspaceToken,
        success: () => {
          resolve();
          isFullfilled = true;
          connectionCheck.handleJanusState(true);
        },
        error: (cause) => {
          let internalError = '';

          connectionCheck.handleJanusState(false);

          if (cause.indexOf('Connect to Janus error') + 1 || cause.indexOf('Lost connection to the server') + 1) {
            internalError = ERROR_CODES.SERVER_DOWN;
          } else if (cause.indexOf('Unauthorized request') + 1) {
            internalError = ERROR_CODES.AUTHENTICATION_ERROR;
          } else {
            internalError = ERROR_CODES.UNKNOW;
          }

          cnsl.debug('Janus connection error', cause);
          if (isFullfilled) {
            this.emit('connection-error', internalError);

            return;
          }
          reject(internalError);
          isFullfilled = true;
        },
        destroyed: () => {
          connectionCheck.handleJanusState(false);
          this.emit('destroyed');
        },
      });
    });
  }

  /**
   * Disconnect with server and close all active traffic channels
   * @private
   * @returns {undefined}
   */
  disconnect() {
    if (!this.__janus) {
      return;
    }
    if (!this.__janus.isConnected()) {
      return;
    }
    if (this.__audiobridgePlugin) {
      this.__audiobridgePlugin.detach();
      this.__audiobridgePlugin = null;
    }
    if (this.__videoroomPlugin) {
      this.__videoroomPlugin.detach();
      this.__videoroomPlugin = null;
    }
    Object.keys(this.__videoroomPlugins).forEach(key => {
      this.__videoroomPlugins[key].detach();
      delete this.__videoroomPlugins[key];
    });
    this.__janus.destroy();
    this.__janus = null;
  }
}

JanusWrapper.errors = ERROR_CODES;
JanusWrapper.events = JANUS_WRAPPER_EVENTS;

export default JanusWrapper;
