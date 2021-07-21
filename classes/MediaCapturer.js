import { EventEmitter } from 'events';
import getUserMedia from 'getusermedia';

const THUMBNAIL_SIZE = 150;

/**
 * Class for media capturer.
 * Can capture screens, windows & webcameras
 */
export default class MediaCapturer extends EventEmitter {
  /**
   * Init. Add desktopSources function for Electron
   *
   * @param {function} desktopSources - electron.desktopCapturer.getSources
   */
  constructor(desktopSources = () => null) {
    super();
    this.desktopSources = desktopSources;
  }

  /**
   * Get media sources
   *
   * @param {string} type – source type. Can be 'screen' or 'window'
   * @param {number} [thumbnailSize] – thumbnail size
   * @returns {Promise<Electron.DesktopCapturerSource[]>}
   */
  async getSources(type, thumbnailSize = THUMBNAIL_SIZE) {
    const sources = await this.desktopSources({
      types: [
        type,
      ],
      thumbnailSize: {
        width: thumbnailSize,
        height: thumbnailSize,
      },
    });

    return sources;
  }

  /**
   * Get media stream by source id
   *
   * @param {string} sourceId – source id
   * @param {number} sourceIndex – source index
   * @returns {Promise<MediaStream>}
   */
  async getStream(sourceId, sourceIndex) {
    const displays = await window.ipcRenderer.invoke('remote-get-all-displays');
    const display = displays[sourceIndex];

    console.log('~~~~~~~~~~~~~~~~~');
    console.log('sourceId', sourceId);
    console.log('sourceIndex', sourceIndex);
    console.log('displays', displays);
    console.log('selected display', display);

    let maxWidth = 1920;
    let maxHeight = 1920;

    if (display) {
      maxWidth = display.size.width;
      maxHeight = display.size.height;
      console.log('maxWidth', maxWidth, 'maxHeight', maxHeight);
    }
    console.log('~~~~~~~~~~~~~~~~~');

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: sourceId,
          minWidth: 0,
          minHeight: 0,
          maxWidth,
          maxHeight,
          maxFrameRate: 15,
        },
      },
    });

    return stream;
  }

  /**
   * Get screen stream from browser
   * @returns {Promise<null>}
   */
  async getScreenStream() {
    let captureStream = null;

    try {
      captureStream = await navigator.mediaDevices.getDisplayMedia({
        audio: false,
        video: true,
      });

      let videoTrack = captureStream.getVideoTracks()[0];

      videoTrack.onended = () => {
        this.emit('stop-sharing-screen');

        videoTrack.onended = null;
        videoTrack = null;
      };
    } catch (err) {
      console.error('Error: ' + err);
    }

    return captureStream;
  }

  /**
   * Get camera stream
   *
   * @param {?string} deviceId Specific device
   * @returns {Promise<MediaStream>}
   */
  async getCameraStream(deviceId = null) {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: !deviceId ? true : {
        deviceId,
      },
    });

    return stream;
  }

  /**
   * Destroy active stream
   *
   * @param {MediaStream} stream – media stream
   * @returns {void}
   */
  destroyStream(stream) {
    stream.getVideoTracks().forEach(track => {
      track.stop();

      track = null;
    });

    stream.getAudioTracks().forEach(track => {
      track.stop();

      track = null;
    });

    stream = null;
  }

  /**
   * Get aspect ratio of all video streams
   * @param {MediaStream} stream Media stream
   * @returns {Array<number>}
   */
  getRatioList(stream) {
    return stream.getVideoTracks().map(track => track.getSettings().aspectRatio);
  }

  /**
   * Request camera & microphone permissions
   * @returns {void}
   */
  async requestMediaPermissions() {
    const MAX_WAIT_TIMEOUT = 500;

    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      let immediate = false;

      getUserMedia((err, stream) => {
        immediate = Date.now() - startTime < MAX_WAIT_TIMEOUT;

        if (err) {
          reject(err);
        } else {
          this.destroyStream(stream);
          resolve(immediate);
        }
      });
    });
  }
}
