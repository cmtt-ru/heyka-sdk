<template>
  <div
    ref="expanded"
    class="expanded-window"
    @dblclick="showGridHandler"
  >
    <zoom-pan style="height: 100%">
      <div class="sharing-wrapper wrapper">
        <video
          ref="video"
          class="sharing"
        />
        <img
          v-show="showPreview"
          ref="preview"
          class="video-preview"
        >
        <div
          v-if="canDraw"
          class="tablet-wrapper wrapper"
        >
          <div class="tablet">
            <tablet
              :aspect-ratio="1 / videoAspectRatio"
              :my-id="myId"
              :color="myColor"
              @data="onDrawingData"
            />
          </div>
        </div>
      </div>
    </zoom-pan>

    <div class="badge user">
      <avatar
        class="user__avatar"
        :user-id="sharingUser.id"
        :size="20"
        :border-radius="4"
      />
      <div class="user__name">
        {{ sharingUser.name }}
      </div>
    </div>

    <div class="badge bottom-controls">
      <router-link
        :to="{ name: 'grid'}"
      >
        <ui-button
          class="bottom-controls__button"
          :type="7"
          popover
          :height="44"
          icon="grid"
        />
      </router-link>

      <microphone
        v-show="IS_MOBILE"
        :disabled="!isDeviceAvailable('microphone')"
        :active="mediaState.microphone"
        class="bottom-controls__button"
        popover
        size="medium"
        :icon="mediaState.microphone ? 'mic' : 'mic-off'"
        @click="switchProp('microphone')"
      />

      <mini-chat-button class="bottom-controls__button" />

      <ui-button
        popover
        class="bottom-controls__button"
        :active="getHandUpStatusByUserId(myId)"
        size="medium"
        :type="7"
        :height="44"
        icon="hand-up"
        @click="handUpHandler"
      />
    </div>

    <div
      v-show="!IS_MOBILE"
      ref="controls"
      v-draggable="controlsOptions"
      class="badge control"
      :class="{'control--hidden': !showControls}"
    >
      <call-controls />
    </div>
  </div>
</template>

<script>
import CallControls from '@sdk/views/Call/CallControls';
import UiButton from '@components/UiButton';
import Avatar from '@components/Avatar';
import MiniChatButton from '@components/MiniChat/Button';
import broadcastEvents from '@sdk/classes/broadcastEvents';
import { mapGetters, mapState } from 'vuex';
import Tablet from '@components/Drawing/Tablet';
import mediaCapturer from '@classes/mediaCapturer';
import janusVideoroomWrapper from '@sdk/classes/janusVideoroomWrapper';
import captureFrame from 'capture-frame';
import Microphone from '../../components/Microphone.vue';
import ZoomPan from '@components/ZoomPan';

import broadcastActions from '@sdk/classes/broadcastActions';

/* variable for watching page size */
let __resizeObserver = {};

export default {
  components: {
    CallControls,
    UiButton,
    Avatar,
    Tablet,
    MiniChatButton,
    Microphone,
    ZoomPan,
  },
  data() {
    return {
      videoAspectRatio: 1,
      showControls: true,
      controlsOptions: {
        boundingElement: document.documentElement,
        initialPosition: {},
        resetInitialPos: false,
      },
      showPreview: false,
      isStreamPlaying: false,
      myColor: 'black',
      canDraw: false,
      IS_MOBILE,
    };
  },
  computed: {
    ...mapGetters({
      selectedChannel: 'me/getSelectedChannelId',
      myId: 'me/getMyId',
      mediaState: 'me/getMediaState',
      userAvatar: 'users/getUserAvatarUrl',
      getUserWhoSharesMedia: 'getUserWhoSharesMedia',
      getUserWhoSharesScreen: 'getUserWhoSharesScreen',
      getHandUpStatusByUserId: 'channels/getHandUpStatusByUserId',
      selectedDevices: 'app/getSelectedDevices',
    }),
    ...mapState({
      janusOptions: 'janus',
    }),

    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('call.grid');
    },

    /**
     * Get user, who's sharing we are watching now
     * @returns {object}
     */
    sharingUser() {
      return this.$store.getters['users/getUserById'](this.userId);
    },

    /**
     * Is current user sharing media
     * @returns {boolean}
     */
    isUserSharingMedia() {
      return this.$store.getters.getUsersWhoShareMedia.includes(this.userId);
    },

    userId() {
      return this.$route.params.id;
    },

    speaking() {
      return this.mediaState.speaking;
    },

  },
  watch: {
    isUserSharingMedia(val) {
      if (val === false) {
        if (this.getUserWhoSharesScreen) {
          this.$router.replace({
            name: 'expanded',
            params: { id: this.getUserWhoSharesScreen },
          });
        } else {
          this.showGridHandler();
        }
      }
    },

    userId() {
      broadcastEvents.dispatch('grid-expanded-ready');
      this.handleVideoStream();
    },

    speaking(val) {
      if (val) {
        this.handUpHandler(false);
      }
    },
  },

  /**
   * Subscribe for:
   * 1. blur/focus window events for hiding/showing call controls
   * 2. custom "grid" event for routing to grid
   * @returns {void}
   */
  mounted() {
    const page = this.$refs.expanded;

    __resizeObserver = new ResizeObserver(this.watchPageDimensions);
    __resizeObserver.observe(page);

    broadcastEvents.on('grid-expanded-blur', () => {
      this.showControls = false;
    });

    broadcastEvents.on('grid-expanded-focus', () => {
      this.showControls = true;
    });

    broadcastEvents.on('grid', () => {
      this.$router.replace({ name: 'grid' });
    });

    broadcastEvents.dispatch('grid-expanded-ready');

    broadcastEvents.on('grid-expanded-set-video-frame', this.setVideoFrame.bind(this));

    this.handleVideoStream();

    janusVideoroomWrapper.on('new-stream', publisher => {
      if (publisher.userId === this.userId) {
        this.insertVideo(publisher.stream);
      }
    });

    janusVideoroomWrapper.on('publisher-joined', publisher => {
      if (publisher.userId === this.userId) {
        this.handleVideoStream();
      }
    });

    janusVideoroomWrapper.on('textroom-data', this.onTextroomData.bind(this));

    window.addEventListener('beforeunload', (e) => {
      this.destroy();
    });
  },

  beforeDestroy() {
    this.destroy();
  },

  destroyed() {
    broadcastEvents.removeAllListeners('grid-expanded-blur');
    broadcastEvents.removeAllListeners('grid-expanded-focus');
    broadcastEvents.removeAllListeners('grid');
    broadcastEvents.removeAllListeners('grid-expanded-set-video-frame');
  },

  methods: {
    /**
     * Re-adjust controls position on page resize
     * @returns {void}
     */
    watchPageDimensions() {
      const width = document.body.offsetWidth;
      const height = document.body.offsetHeight;

      const controlsMarginBottom = 126;
      const controlsMarginLeft = 92;

      this.controlsOptions.initialPosition.left = width / 2 - controlsMarginLeft;
      this.controlsOptions.initialPosition.top = height - controlsMarginBottom;
      this.controlsOptions.resetInitialPos = true;
      this.$nextTick(() => (this.controlsOptions.resetInitialPos = false));
    },

    /**
     * Show grid handler
     * @returns {void}
     */
    showGridHandler() {
      broadcastEvents.dispatch('exit-fullscreen');
      this.$router.push({ name: 'grid' });
    },

    handleVideoStream() {
      this.isStreamPlaying = false;
      // try to get working video stream
      const activePublishers = janusVideoroomWrapper.getActivePublishers();
      const ourPublisher = activePublishers.find(publishers => publishers.userId === this.userId);

      if (ourPublisher) {
        if (ourPublisher.stream) {
          this.insertVideo(ourPublisher.stream);

          return;
        }
        janusVideoroomWrapper.subscribeFor(ourPublisher.janusId);
      }

      // set on pause all videos except this one
      activePublishers
        .filter(publisher => publisher.userId !== this.userId)
        .forEach(publisher => janusVideoroomWrapper.pauseSubscription(publisher.janusId));
    },

    /**
     * Insert video in html
     * @param {MediaStream} stream Media stream
     * @returns {void}
     */
    insertVideo(stream) {
      janusVideoroomWrapper.connectTextroom(this.myId, 'sender', this.janusOptions);
      const video = this.$refs.video;

      if (video.srcObject) {
        video.style.backgroundImage = `url(${this.getFrameFromVideo()})`;
      }

      video.srcObject = stream;

      video.onloadedmetadata = () => {
        this.videoAspectRatio = mediaCapturer.getRatioList(stream)[0];
        video.play();
        this.isStreamPlaying = true;
        this.showPreview = false;
      };

      video.onerror = () => {
        this.showPreview = false;
      };
    },

    /**
     * Set video frame
     * @param {string} base64Image – video frame
     * @returns {void}
     */
    setVideoFrame(base64Image) {
      if (!this.isStreamPlaying) {
        this.$refs.preview.src = base64Image;
        if (!this.showPreview) {
          this.showPreview = true;
        }
      }
    },

    /**
     * Handles new drawing data from Tablet
     * @param {object} data Drawing data
     * @param {object} data.userId User id
     * @returns {void}
     */
    onDrawingData(data) {
      janusVideoroomWrapper.sendData(data, this.userId);
    },

    /**
     * Handles new drawing data from the textroom plugin
     * @param {object} data Drawing data
     * @returns {void}
     */
    onTextroomData(data) {
      const from = data.from;
      const drawingData = JSON.parse(data.text);

      drawingData.userId = from
        .replace('(receiver)', '');
      if (drawingData.userId === this.userId && drawingData.canDraw !== undefined) {
        this.canDraw = drawingData.canDraw;
        if (drawingData.canDraw) {
          this.myColor = drawingData.color;
        }
      }
    },

    /**
     * Get frame from video
     * @returns {string}
     */
    getFrameFromVideo() {
      const frameBuffer = captureFrame(this.$refs.video, 'jpeg');

      return 'data:image/jpeg;base64,' + frameBuffer.toString('base64');
    },

    /**
     * Destroy stuff
     * @returns {void}
     */
    destroy() {
      janusVideoroomWrapper.disconnectTextroom();
      janusVideoroomWrapper.removeAllListeners('new-stream');
      janusVideoroomWrapper.removeAllListeners('publisher-joined');

      this.$refs.video.onerror = null;
      this.$refs.video.onloadedmetadata = null;
      __resizeObserver.unobserve(this.$refs.expanded);
    },

    handUpHandler(value) {
      let status = !this.getHandUpStatusByUserId(this.myId);

      if (value !== undefined) {
        status = value;
      }
      broadcastActions.dispatch('app/handUpInChannel', status);
    },

    /**
     * Change our media state depending on which button was clicked
     * @param {string} property mediastate's property name
     * @returns {void}
     */
    switchProp(property) {
      const newState = { ...this.mediaState };

      newState[property] = !this.mediaState[property];

      if (newState.microphone === false) {
        newState.speaking = false;
      }

      broadcastActions.dispatch('me/setMediaState', newState);
    },

    /**
     * Return availability of specific device
     * @param {string} deviceType – device type
     * @returns {boolean}
     */
    isDeviceAvailable(deviceType) {
      return !!this.selectedDevices[deviceType];
    },
  },
};
</script>

<style lang="stylus" scoped>

.expanded-window
  position relative
  height 100vh
  width 100vw
  background var(--Background-black)
  color var(--Text-white)

.wrapper
  position absolute
  top 0
  left 0
  height 100vh
  width 100vw
  flex-direction column
  display flex

.tablet-wrapper
  width 100vw
  .tablet
    width 100%
    height 100%

.sharing
  width 100%
  height 100%
  background-size contain
  background-position center
  background-repeat no-repeat

.video-preview
  background var(--Background-black)
  position absolute
  left 0
  top 0
  width 100%
  height 100%
  object-fit contain
  filter blur(5px) grayscale(1)

.badge
  position absolute

.user
  top 30px
  left 30px
  display flex
  flex-direction row
  background var(--Background-black)
  padding 8px
  border-radius 6px
  font-weight 500
  align-items center
  opacity 1
  transition opacity 0.2s ease

  &:hover
    opacity 0

  &__avatar
    margin-right 8px

.settings
  top 32px
  right 40px
  border-radius 11px

.bottom-controls
  bottom 44px
  right 40px
  display flex

  @media $mobile
    bottom 36px
    right 0
    left 0
    margin 0 auto
    display flex
    justify-content center

  &__button
    border-radius 11px
    margin-left 12px

.control
  background var(--Background-black)
  border-radius 11px
  top calc(100% - 126px)
  left calc(50% - 146px)
  height auto
  opacity 1
  transition opacity 0.2s ease
  box-shadow 0 0 0 1px var(--UI-divider-1)
  max-width 292px

  &--hidden
    opacity 0
    pointer-events none

</style>
