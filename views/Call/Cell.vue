<template>
  <div
    class="cell"
    :class="{'cell--reconnecting': reconnectingStatus(user.id)}"
    :style="cellDimensions"
  >
    <div
      class="cell__inner"
      @dblclick="expandedClickHandler"
    >
      <blurred-avatar
        v-show="!mediaCanShow"
        class="cell__blurred-avatar"
        :user-id="user.id"
      />

      <video
        v-show="mediaCanShow"
        ref="video"
        class="cell__feed"
        autoplay
        playsinline
        muted
        :class="{ 'cell__feed--flip': user.camera && user.id === myId }"
      />
      <div
        v-show="mediaCanShow"
        class="cell__feed__gradient"
      />

      <ui-button
        :key="hasVideo"
        v-popover.click="{name: 'GridUser', data: {userId: user.id, isStreaming: hasVideo}}"
        class="badge badge--hidden cell__more"
        :type="7"
        size="medium"
        :height="currentSizes.button"
        :icon-size="currentSizes.icon"
        icon="more"
        popover
      />

      <connection-indicator
        class="cell__aqi"
        :status="audioQualityStatus(user.id)"
      />

      <div
        v-tooltip="texts.reconnecting"
        class="cell__reconnecting"
      >
        <span />
      </div>

      <avatar
        v-show="!mediaCanShow"
        class="cell__avatar"
        :user-id="user.id"
        :size="currentSizes.avatar"
      />

      <div
        class="badge cell__username"
      >
        <div v-textfade>
          {{ user.name }} <span
            v-if="user.id === myId"
            class="cell__username__you"
          >{{ texts.you }}</span>
        </div>
        <svg-icon
          v-if="!mediaState.microphone"
          class="cell__username__mic-off"
          name="mic-off"
          size="small"
        />
      </div>
    </div>
    <div
      v-show="mediaState.speaking && mediaState.microphone"
      class="cell__talking"
    />
    <div
      v-show="handUpStatus"
      class="cell__raised-hand"
    >
      <svg-icon
        name="hand-up"
        :width="currentSizes['button']"
        :height="currentSizes['button']"
        class="cell__raised-hand__icon"
      />
    </div>
  </div>
</template>

<script>
import UiButton from '@components/UiButton';
import Avatar from '@components/Avatar';
import BlurredAvatar from '@components/BlurredAvatar';
import ConnectionIndicator from '@components/ConnectionIndicator';
import { getUserAvatarUrl } from '@libs/image';
import { mapGetters } from 'vuex';
import captureFrame from 'capture-frame';

/**
 * Aspect ratio 124 / 168;
 * @type {number}
 */
const ASPECT_RATIO = 0.738;

/**
 * Aspect ratio 224 / 343;
 * @type {number}
 */
const MOBILE_ASPECT_RATIO = 0.653;

const SIZES = [
  {
    minSize: 400,
    avatar: 192,
    button: 40,
    icon: 18,
  },
  {
    minSize: 200,
    avatar: 80,
    button: 24,
    icon: 11,
  },
  {
    minSize: 160,
    avatar: 60,
    button: 24,
    icon: 11,
  },
  {
    minSize: 140,
    avatar: 48,
    button: 24,
    icon: 11,
  },
  {
    minSize: 120,
    avatar: 32,
    button: 24,
    icon: 11,
  },
  {
    minSize: 0,
    avatar: 32,
    button: 24,
    icon: 11,
  },

];

export default {
  components: {
    UiButton,
    Avatar,
    ConnectionIndicator,
    BlurredAvatar,
  },
  props: {
    /**
     * Cell's width
     */
    width: {
      type: Number,
      default: 100,
    },

    /**
     * true if we need mobile aspect ratio
     */
    isMobile: {
      type: Boolean,
      default: false,
    },

    /**
     * Cell's user
     */
    user: {
      type: Object,
      default: () => {},
    },

    /**
     * Cell's user media state
     */
    mediaState: {
      type: Object,
      default: () => {},
    },

    /**
     * User's video stream
     */
    videoStream: {
      type: MediaStream,
      default: undefined,
    },
  },
  data() {
    return {
      isMediaPlaying: false,
      isStreamActive: false,
      isNeedToWaitVideo: true,
      initTime: Date.now(),
    };
  },
  computed: {
    ...mapGetters({
      getUsersWhoShareMedia: 'getUsersWhoShareMedia',
      myId: 'me/getMyId',
      audioQualityStatus: 'channels/getAudioQualityStatusByUserId',
      reconnectingStatus: 'channels/getReconnectingStatusByUserId',
      getHandUpStatusByUserId: 'channels/getHandUpStatusByUserId',
    }),

    /**
     * Hand up timestamp
     * @returns {number}
     */
    handUpStatus() {
      return this.getHandUpStatusByUserId(this.user.id);
    },

    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('call.grid');
    },

    /**
     * Cell's width
     * @returns {number}
     */
    height() {
      if (this.isMobile) {
        return Math.floor(this.width * MOBILE_ASPECT_RATIO);
      } else {
        return Math.floor(this.width * ASPECT_RATIO);
      }
    },

    /**
     * Assign dimentions to the cell
     * @return {object}
     */
    cellDimensions() {
      return {
        width: `${this.width}px`,
        height: `${this.height}px`,
      };
    },

    currentSizes() {
      for (const size of SIZES) {
        if (this.width > size.minSize) {
          return size;
        }
      }

      return SIZES[0];
    },

    /**
     * If this person has camera/screensharing on. Should we show "fullscreen" button for this person?
     * @returns {boolean}
     */
    hasVideo() {
      // todo: may be `this.user.camera || this.user.screen` instead?
      if (this.getUsersWhoShareMedia.includes(this.user.id)) {
        return true;
      }

      return false;
    },

    /**
     * Is user sharing media
     * @returns {boolean}
     */
    isUserSharingMedia() {
      return this.mediaState.camera || this.mediaState.screen;
    },

    /**
     * Whether to show video
     * @returns {boolean}
     */
    mediaCanShow() {
      console.log(`Media can show for '${this.user.id}' -->`, this.isUserSharingMedia, this.isMediaPlaying, this.isStreamActive);

      if (this.isUserSharingMedia) {
        const state = this.isStreamActive && this.isMediaPlaying;

        if (this.isNeedToWaitVideo) {
          if (state) {
            // eslint-disable-next-line vue/no-side-effects-in-computed-properties
            this.isNeedToWaitVideo = false;

            return true;
          }

          return false;
        } else {
          return true;
        }
      } else {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.isNeedToWaitVideo = true;
      }

      return false;
    },
  },

  watch: {
    videoStream(val) {
      if (val) {
        this.insertVideoStreamForUser(val);
      }
    },
  },

  beforeDestroy() {
    const video = this.$refs['video'];

    if (video) {
      video.onloadedmetadata = null;
      video.onplaying = null;
      video.onsuspend = null;
      video.ontimeupdate = null;
      video.onerror = null;
    }
  },

  methods: {
    /**
     * Fullscreen click handler
     * @returns {void}
     */
    expandedClickHandler() {
      if (!this.hasVideo || this.user.id === this.myId) {
        return;
      }
      this.$router.push({
        name: 'expanded',
        params: { id: this.user.id },
      });
    },

    /**
     * Insert stream in HTML5 video tag
     *
     * @param {MediaStream} stream User video stream
     * @returns {void}
     */
    insertVideoStreamForUser(stream) {
      const video = this.$refs['video'];

      try {
        if (video.srcObject) {
          video.style.backgroundImage = `url(${this.getFrameFromVideo()})`;
        }
      } catch (e) {
        console.error('Cell.vue --> getFrameFromVideo', e);
      }

      video.srcObject = stream;

      video.onloadedmetadata = () => {
        video.play();
      };

      video.onplaying = () => {
        this.setMediaPlaying(true);
      };

      video.onsuspend = () => {
        this.setMediaPlaying(false);
      };

      video.ontimeupdate = () => {
        this.timeUpdateHandler();
      };

      video.onerror = () => {
        this.videErrorHandler();
      };

      stream.onactive = () => {
        this.isStreamActive = true;
        console.log(`Media stream for '${this.user.id}' --> active`);
      };

      stream.oninactive = () => {
        this.isStreamActive = false;
        console.log(`Media stream for '${this.user.id}' --> inactive`);
      };

      this.isStreamActive = stream.active;
    },

    userAvatar: getUserAvatarUrl,

    /**
     * Set media playing state
     * @param {boolean} state – state
     * @returns {void}
     */
    setMediaPlaying(state) {
      if (state) {
        console.log(`Video event for '${this.user.id}'--> playing`);
      } else {
        console.log(`Video event for '${this.user.id}'--> suspend`);
      }

      this.isMediaPlaying = state;
    },

    /**
     * Video error event handler
     * @returns {void}
     */
    videErrorHandler() {
      console.log(`Video event for '${this.user.id}'--> error`, this.$refs.video.error);
    },

    /**
     * Video time update event handler
     * @returns {void}
     */
    timeUpdateHandler() {
      if (!this.isMediaPlaying && this.$refs.video) {
        console.log(`Video event for '${this.user.id}'--> timeUpdate`, this.$refs.video.currentTime);
        this.setMediaPlaying(this.$refs.video.currentTime !== 0);
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
  },
};
</script>

<style lang="stylus" scoped>
.cell
  box-sizing border-box
  position relative
  padding 4px

  @media $mobile
    padding 8px

  &--elevated
    z-index 5

  &--reconnecting
    .cell__avatar,
    .cell__feed
      filter grayscale(1) brightness(0.75);

    .cell__reconnecting
      display block

  &__raised-hand
    position absolute
    top 4px
    bottom 4px
    left 4px
    right 4px
    pointer-events none
    border-radius 12px
    border 4px solid var(--UI-active)

    &__icon
      color var(--UI-active)
      padding 4px

  &__inner
    border-radius 12px
    height 100%
    padding 4px
    box-sizing border-box
    display flex
    flex-direction column
    justify-content space-between
    align-items center
    position relative
    overflow hidden
    background #141414

  &__feed
    position absolute
    top 0
    left 0
    width 100%
    height 100%
    object-fit cover
    border-radius 12px
    background-size cover
    background-position center
    background-repeat no-repeat

    &__gradient
      content ''
      position absolute
      pointer-events none
      top 0
      bottom 0
      left 0
      right 0
      background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 70%, rgba(0, 0, 0, 0.85) 100%);

  &__talking
    position absolute
    top 4px
    bottom 4px
    left 4px
    right 4px
    border 4px solid var(--UI-positive)
    border-radius 12px
    box-sizing border-box
    pointer-events none

  &__more
    top 6px
    right 6px
    flex-shrink 0
    opacity 0
    transition opacity 0.15s ease
    position relative

  &__aqi
    display flex
    position absolute
    top 4px
    left 4px
    transition opacity 0.15s ease
    background transparent
    width 28px
    padding 9px 0
    min-height 28px
    border-radius 6px
    justify-content center
    box-sizing border-box

  &__reconnecting
    display none
    position absolute
    top -22px
    left 0
    bottom 0
    right 0
    margin auto
    width 44px
    height 44px
    background #ffffff
    border-radius 100%
    box-shadow var(--new-shadow-03)
    z-index 3

    span
      position absolute
      left 0
      top 0
      right 0
      bottom 0
      margin auto
      width 50%
      height 50%
      border-radius 100px
      animation rotate 1s linear infinite
      border 2px solid var(--UI-active)
      border-right-color transparent

      @keyframes rotate {
        0% {
          transform rotate(0deg)
        }
        100% {
          transform rotate(360deg)
        }
      }

  &__expand
    bottom 4px
    right 4px

  .badge
    position absolute

  .badge--hidden
  .cell__username--hidden
    opacity 0
    transition opacity 0.15s ease

  .cell__inner:hover .badge--hidden
  .cell__inner:hover .cell__username--hidden
    opacity 1

  .badge--hidden.popover--opened
    opacity 1

  &__avatar
    margin auto
    transform translateY(-11px)

    @media $mobile
      transform translateY(-9px)

  &__blurred-avatar
    position absolute
    top 0
    left 0

  &__username
    bottom 4px
    margin 0 auto
    padding 6px 4px
    border-radius 4px
    max-width calc(100% - 8px)
    box-sizing border-box
    width auto
    overflow hidden
    display flex
    flex-direction row
    align-items center
    text-align center
    position relative
    z-index 3

    @media $mobile
      font-size 12px
      line-height 12px
      padding 4px

    &__you
      opacity 0.5
      margin-left 4px

    &__mic-off
      margin-left 8px
      flex-shrink 0
</style>
