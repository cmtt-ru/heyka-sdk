<template>
  <div>
    <audio
      ref="audio"
      autoplay
      muted
    />
  </div>
</template>

<script>
import JanusWrapper from '@sdk/classes/JanusWrapper.js';
import AudioCheck from '@classes/audioCheck';
import mediaCapturer from '@classes/mediaCapturer';
import { mapState } from 'vuex';
import Logger from '@sdk/classes/logger';
import network from '@sdk/classes/network';
import AudioQualityController from '@sdk/classes/AudioQualityController';
import { conversationBroadcast } from '@api/socket/utils';
const cnsl = new Logger('Janus.vue', '#AF7AC5 ');

/**
 * Janus wrapper instance
 * @type {object}
 */
let janusWrapper = null;

let audioQC = null;

export default {
  name: 'Janus',
  data() {
    return {
      socketDisconnectedDelay: null,
      currentOperation: '',
    };
  },
  computed: {
    ...mapState('janus', {
      janusOptions: state => state,
    }),
    ...mapState('me', {
      selectedChannelId: 'selectedChannelId',
      userId: 'id',
      mediaState: 'mediaState',
      microphone: state => state.mediaState.microphone,
      camera: state => state.mediaState.camera,
      screen: state => state.mediaState.screen,
      speakers: state => state.mediaState.speakers,
      speaking: state => state.mediaState.speaking,
    }),
    ...mapState('app', {
      selectedMicrophoneDevice: state => state.realSelectedDevices.microphone,
      selectedSpeakerDevice: state => state.realSelectedDevices.speaker,
      selectedCameraDevice: state => state.realSelectedDevices.camera,
      microphonesDeviceList: state => state.devices.microphones,
      speakersDeviceList: state => state.devices.speakers,
    }),
  },
  watch: {
    /**
     * Reacts on channel is changed
     * @param {string} id New channel id
     * @param {string} oldId Previous channel id
     * @returns {void}
     */
    selectedChannelId(id, oldId) {
      if (oldId !== null) {
        cnsl.log('Channel unselect');
        this.unselectChannel();
      }
      if (id !== null) {
        cnsl.log('Channel select');
        this.selectChannel();
      }
    },

    /**
     * Reacts on microphone state is changed
     * @param {boolean} state Is microphone enabled
     * @returns {void}
     */
    microphone(state) {
      if (!janusWrapper) {
        return;
      }
      janusWrapper.setMuting(!state);
      if (state) {
        AudioCheck.destroyMediaStream();
        AudioCheck.checkAudio();
      }
    },

    /**
     * Reacts on speakers state is changed
     * @param {boolean} state Is speakers enabled
     * @returns {void}
     */
    speakers(state) {
      cnsl.log(`Set muting of speakers ${!state}`);
      this.$refs.audio.muted = !state;
    },

    /**
     * Handles change camera state
     * @param {boolean} state Is camera sharing enabled
     * @returns {void}
     */
    camera(state) {
      if (state) {
        this.startSharingCamera();
      } else {
        this.stopSharingVideo();
      }
    },

    /**
     * Handles change screen sharing state
     * @param {boolean} state Is screen sharing enabled
     * @returns {void}
     */
    screen(state) {
      if (state) {
        this.startSharingScreen();
      } else {
        this.stopSharingVideo();
      }
    },

    /**
     * Handles change selected camera device
     * @param {string} deviceId Current camera device id
     * @returns {void}
     */
    selectedCameraDevice(deviceId) {
      if (janusWrapper && this.camera) {
        janusWrapper.setCameraDevice(deviceId);
      }
    },

    selectedSpeakerDevice(deviceId) {
      this.$refs.audio.setSinkId(deviceId);
    },

    selectedMicrophoneDevice(deviceId) {
      if (janusWrapper) {
        janusWrapper.setMicrophoneDevice(deviceId);
      }
    },
  },

  async created() {
    await JanusWrapper.init();

    network.on('ip-changed', () => {
      this.reSelectChannel();
    });

    network.on('internet-state', (state) => {
      if (state) {
        this.reSelectChannel();
      }
    });

    cnsl.log('JanusWrapper was initialized');
  },

  beforeDestroy() {
    if (janusWrapper) {
      janusWrapper.disconnect();
    }
  },

  destroyed() {
    AudioCheck.destroyMediaStream();
  },

  methods: {
    setOperationStart(operation) {
      this.$store.dispatch('janus/setInProgress', true);
      this.currentOperation = operation;
      cnsl.info('setOperationStart', operation);
    },

    setOperationFinish(operation) {
      cnsl.info('setOperationFinish', operation);
      if (operation === this.currentOperation) {
        this.$store.dispatch('janus/setInProgress', false);
        cnsl.log(this.$store.state.janus);
        this.currentOperation = '';
      }
    },

    resetOperations() {
      this.setOperationFinish(this.currentOperation);
    },

    /**
     * Join to the Janus channel
     * Subscribe for event from JanusWrapper
     * @returns {undefined}
     */
    async selectChannel() {
      // Set janus "inProgress" status
      this.setOperationStart('join');

      janusWrapper = new JanusWrapper({
        ...this.janusOptions,
        microphoneDeviceId: this.selectedMicrophoneDevice,
        userId: this.userId,
        debug: process.env.VUE_APP_JANUS_DEBUG === 'true',
      });

      janusWrapper.on(JanusWrapper.events.channelJoined, async () => {
        this.setOperationFinish('join');
        if (this.microphone) {
          AudioCheck.checkAudio();
        } else {
          console.log('AudioCheck.subscribeMutedTalk');
          AudioCheck.subscribeMutedTalk();
        }

        if (this.camera) {
          janusWrapper.publishVideoStream('camera', this.selectedCameraDevice);
        }

        if (this.screen) {
          if (IS_ELECTRON) {
            janusWrapper.publishVideoStream('screen', this.janusOptions.sharingSource.id);
          } else {
            janusWrapper.publishVideoStream('stream', await mediaCapturer.getScreenStream());
          }
        }

        audioQC = new AudioQualityController(janusWrapper.getAudioPeerConnection());

        audioQC.on('prebuffer', value => {
          if (janusWrapper) {
            janusWrapper.setAudioPrebuffer(value);
          }
        });

        audioQC.on('status', status => {
          conversationBroadcast('audio-quality-indicator', this.userId, {
            status,
          });
        });
      });

      // audio events
      janusWrapper.on(JanusWrapper.events.connectionError, this.onConnectionError.bind(this));
      janusWrapper.on(JanusWrapper.events.remoteAudioStream, this.onRemoteAudioStream.bind(this));
      janusWrapper.on(JanusWrapper.events.audioStreamActive, this.onAudioStreamActive.bind(this));
      janusWrapper.on(JanusWrapper.events.speaking, this.onSpeakingChange.bind(this));
      janusWrapper.on(JanusWrapper.events.volumeChange, this.onVolumeChange.bind(this));
      janusWrapper.on(JanusWrapper.events.audioSlowLink, this.onAudioSlowLink.bind(this));

      // video events
      janusWrapper.on(JanusWrapper.events.videoSlowLink, this.onVideoSlowLink.bind(this));
      janusWrapper.on(JanusWrapper.events.webrtcCleanUp, this.onWebrtcCleanUp.bind(this));
      janusWrapper.on(JanusWrapper.events.successVideoPublishing, () => {
        this.setOperationFinish('publish');
      });

      await janusWrapper.join();
    },

    /**
     * Leave the Janus channel
     * @returns {void}
     */
    unselectChannel() {
      if (janusWrapper) {
        // unsubscribe from generic events
        janusWrapper.removeAllListeners(JanusWrapper.events.channelJoined);

        // unsubscribe from audio events
        janusWrapper.removeAllListeners(JanusWrapper.events.connectionError);
        janusWrapper.removeAllListeners(JanusWrapper.events.connectionError);
        janusWrapper.removeAllListeners(JanusWrapper.events.remoteAudioStream);
        janusWrapper.removeAllListeners(JanusWrapper.events.audioStreamActive);
        janusWrapper.removeAllListeners(JanusWrapper.events.speaking);
        janusWrapper.removeAllListeners(JanusWrapper.events.volumeChange);
        janusWrapper.removeAllListeners(JanusWrapper.events.audioSlowLink);

        // unsubscribe from video events
        janusWrapper.removeAllListeners(JanusWrapper.events.videoSlowLink);
        janusWrapper.removeAllListeners(JanusWrapper.events.webrtcCleanUp);
        janusWrapper.disconnect();
        janusWrapper = null;
      }

      this.resetOperations();
      AudioCheck.destroyMediaStream();
      audioQC.destroy();
      audioQC.removeAllListeners('prebuffer');
      audioQC.removeAllListeners('status');
      audioQC = null;

      mediaCapturer.destroyStream(this.$refs.audio.srcObject);
      this.$refs.audio.srcObject = null;
    },

    /**
     * Start sharing video from a camera device
     * @returns {void}
     */
    startSharingCamera() {
      if (!janusWrapper) {
        cnsl.error('Janus wrapper does not exist');

        return;
      }
      this.setOperationStart('publish');
      janusWrapper.publishVideoStream('camera', this.selectedCameraDevice);
    },

    /**
     * Start sharing video from the screen
     * @returns {void}
     */
    async startSharingScreen() {
      if (!janusWrapper) {
        cnsl.error('Janus wrapper does not exist');

        return;
      }
      this.setOperationStart('publish');
      if (IS_ELECTRON) {
        janusWrapper.publishVideoStream('screen', this.janusOptions.sharingSource.id);
      } else {
        janusWrapper.publishVideoStream('stream', await mediaCapturer.getScreenStream());
      }
    },
    /**
     * Stop sharing any video
     * @returns {void}
     */
    stopSharingVideo() {
      if (!janusWrapper) {
        return;
      }
      this.setOperationStart('unpublish');
      janusWrapper.unpublishVideoStream();
    },

    /**
     * Handles remote audio stream
     * @param {object} stream remote audio stream
     * @returns {void}
     */
    onRemoteAudioStream(stream) {
      cnsl.log('Attach audio stream to the audio element');

      this.$refs.audio.oncanplay = () => {
        this.$refs.audio.setSinkId(this.selectedSpeakerDevice);
      };

      JanusWrapper.attachMediaStream(this.$refs.audio, stream);

      this.$refs.audio.muted = !this.speakers;
    },

    /**
     * Handles Janus connection error
     * @param {string} errorCode Janus error code
     * @returns {void}
     */
    onConnectionError(errorCode) {
      switch (errorCode) {
        case JanusWrapper.errors.SERVER_DOWN:
          cnsl.error('Janus server is down');
          this.reSelectChannel();
          break;
        case JanusWrapper.errors.AUTHENTICATION_ERROR:
          cnsl.error('Janus authentication error');
          break;
        case JanusWrapper.errors.UNKNOW:
          cnsl.error('An unknow error');
          break;
      }
    },

    /**
     * Handles event when media connection activity is changed
     * @param {boolean} isActive Is media connection active
     * @returns {void}
     */
    onAudioStreamActive(isActive) {
      cnsl.log('onAudioStreamActive');
      if (isActive) {
        if (this.microphone) {
          janusWrapper.setMuting(false);
          cnsl.log('setMuting false');
        }
        if (this.speakers) {
          this.$refs.audio.muted = false;
        }
      }
    },

    /**
     * Handles user speaking state changes
     * @param {boolean} isSpeaking is user speaking
     * @returns {void}
     */
    onSpeakingChange(isSpeaking) {
      // ignore speaking state if you are muted
      if (!this.microphone) {
        return;
      }
      if (this.speaking !== isSpeaking) {
        this.$store.dispatch('me/setMediaState', {
          ...this.mediaState,
          speaking: isSpeaking,
        });
      }
    },

    /**
     * Handles change microphone volume
     * @param {number} db Microphone volume in decibels
     * @returns {void}
     */
    onVolumeChange(db) {
      this.$store.dispatch('app/setMicrophoneVolume', db);
    },

    /**
     * Handle audio slow link
     * @param {boolean} uplink - false when all of our packets is not received by Janus, true – some packets lost
     * @returns {void}
     */
    onAudioSlowLink(uplink) {

    },

    /**
     * Handle video slow link
     * @param {boolean} uplink - false when all of our packets is not received by Janus, true – some packets lost
     * @returns {void}
     */
    onVideoSlowLink(uplink) {

    },

    /**
     * Handle webrtc clean up
     * @returns {void}
     */
    onWebrtcCleanUp() {
      this.setOperationFinish('unpublish');
      this.$store.dispatch('janus/setInProgress', false);
    },

    /**
     * Unselect and than select channel again
     * @returns {void}
     */
    reSelectChannel() {
      if (this.selectedChannelId && janusWrapper) {
        this.unselectChannel();
        this.selectChannel();
      }
    },

    /**
     * Internal log function
     * @returns {void}
     */
    log() {
      cnsl.log('JANUS.VUE: ', ...arguments);
    },
  },
};
</script>
