<template>
  <div
    class="call-window"
  >
    <div class="top-content">
      <div class="left-info">
        <div class="left-info__channel">
          <svg-icon
            name="channel"
            :width="40"
            :height="40"
            class="channel-icon"
          />
          <div
            v-textfade
            class="channel-name"
          >
            {{ selectedChannelName }}
          </div>
        </div>

        <div class="channel-usercount">
          {{ $tc("call.grid.users", usersCount) }}
        </div>
      </div>
      <ui-button
        v-popover.click="{name: 'Devices'}"
        class="top-content__devices"
        :type="7"
        popover
        :height="60"
        size="large"
        icon="settings"
      />
    </div>
    <pseudo-popup @scrollable="setScrollable">
      <template #custom-header>
        <div />
      </template>

      <template
        #body
      >
        <div
          id="cell-grid"
          class="cell-grid"
          :class="{'cell-grid--scrollable': scrollableGrid}"
          :style="padding"
        >
          <cell
            v-for="(user, index) in users"
            :key="user.user.id"
            :width="cellWidth(index)"
            :is-mobile="isMobileWidth"
            :video-stream="videoStreams[user.user.id]"
            :user="user.user"
            :media-state="user.mediaState"
          />
        </div>
      </template>

      <template #custom-footer>
        <div />
      </template>
    </pseudo-popup>

    <div class="bottom-content">
      <div
        v-if="!IS_MOBILE"
        class="bottom-content__col bottom-content__col--left"
      />

      <div
        class="bottom-content__col bottom-content__col--center"
        :class="{'bottom-content__col--fixed-center': IS_MOBILE}"
      >
        <call-buttons
          class="bottom-content__controls"
          :buttons="buttonsSetup"
          size="large"
        />
      </div>

      <div
        v-show="!IS_MOBILE"
        class="bottom-content__col bottom-content__col--right"
      >
        <ui-button
          popover
          class="tech-button"
          :active="getHandUpStatusByUserId(myId)"
          size="large"
          :type="7"
          :height="60"
          icon="hand-up"
          @click="handUpHandler"
        />

        <mini-chat-button
          ref="miniChatButton"
          :height="60"
        />
      </div>
    </div>
  </div>
</template>

<script>
import CallButtons from './CallButtons';
import UiButton from '@components/UiButton';
import MiniChatButton from '@components/MiniChat/Button';
import PseudoPopup from '@components/PseudoPopup';
import Cell from './Cell';
import { GRIDS } from './grids';
import { mapGetters } from 'vuex';
import broadcastEvents from '@sdk/classes/broadcastEvents';
import janusVideoroomWrapper from '@sdk/classes/janusVideoroomWrapper';
import Logger from '@sdk/classes/logger';
import { getUserAvatarUrl } from '@libs/image';
import mediaCapturer from '@classes/mediaCapturer';
import broadcastActions from '@sdk/classes/broadcastActions';
const cnsl = new Logger('Grid.vue', '#138D75');

const BUTTON_SETUPS = {
  default: ['camera', 'screen', 'speakers', 'more', 'microphone', 'leave'],
  streaming: ['camera', 'screen', 'drawing', 'speakers', 'microphone', 'leave'],
};

const PADDING = 36;

const MOBILE_PADDING = 8;

const MOBILE_WIDTH = 767; // same as css $mobile

let GRID_WIDTH = 0;
let GRID_HEIGHT = 0;

export default {
  components: {
    CallButtons,
    UiButton,
    Cell,
    MiniChatButton,
    PseudoPopup,
  },

  data() {
    return {
      mounted: false,
      currentGrid: [],
      fullGridWidth: null,
      padding: {},
      videoStreams: {},
      mountedTimestamp: Date.now(),
      pausedByScreenSharing: false,
      unwatchSpeaking: null,
      IS_MOBILE,
      isMobileWidth: false,
      scrollableGrid: false,
    };
  },

  computed: {
    ...mapGetters({
      getUsersWhoShareMedia: 'getUsersWhoShareMedia',
      mediaState: 'me/getMediaState',
      myId: 'me/getMyId',
      channelId: 'me/getSelectedChannelId',
      selectedChannel: 'myChannel',
      users: 'usersInMyChannel',
      isSharingFullScreen: 'janus/isSharingFullScreen',
      amISharingScreen: 'amISharingScreen',
      getHandUpStatusByUserId: 'channels/getHandUpStatusByUserId',
    }),

    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('call.grid');
    },

    buttonsSetup() {
      if (this.isSharingFullScreen && IS_ELECTRON) {
        return BUTTON_SETUPS.streaming;
      }

      return BUTTON_SETUPS.default;
    },

    /**
     * Get all grids suitable for current users' count
     * @returns {array}
     */
    grids() {
      return GRIDS[this.usersCount];
    },

    /**
     * Get users' count
     * @returns {array} array of users
     */
    usersCount() {
      return this.users.length;
    },

    /**
     * Selected channel name
     * @return {string}
     */
    selectedChannelName() {
      return this.selectedChannel?.name || 'no channel selected';
    },

    speaking() {
      return this.mediaState.speaking;
    },
  },

  watch: {
    /* re-count grid because number of users has changed */
    usersCount: function () {
      this.resize();
    },

    selectedChannel(channelId) {
      if (!channelId) {
        Object.keys(this.videoStreams).forEach(key => {
          this.$delete(this.videoStreams, key);
        });
      }
    },

    hasMiniChatNewMessages(val) {
      this.miniChatBadge = val;
    },

    miniChatLastMessageTimestamp(val) {
      this.miniChatBadgeKey = val;
    },
  },

  async mounted() {
    this.mounted = true;
    window.addEventListener('resize', this.resize, false); // TODO: add small debounce for performance
    this.resize();

    broadcastEvents.on('grid-expand', (userId) => {
      this.expandedClickHandler(userId);
    });

    broadcastEvents.on('grid-hide', this.windowHideHandler);

    broadcastEvents.on('grid-expanded-focus', this.windowFocusHandler);

    broadcastEvents.on('callbuttons-hand', this.handUpHandler);
    broadcastEvents.on('callbuttons-chat', () => {
      //! жёсткий хак. эмитим событие mouseup на кнопке чата, которая есть где-то на странице.
      //! потому что поповеры у нас открываются только по директиве v-popover
      const clickEvent = document.createEvent('MouseEvents');

      clickEvent.initEvent('mouseup', true, true);
      document.getElementById('mini-chat-button').dispatchEvent(clickEvent);
    });

    // Send command to subscribe for all video publishers
    this.handleVideoStreams();

    janusVideoroomWrapper.on('publisher-joined', async publisher => {
      janusVideoroomWrapper.subscribeFor(publisher.janusId);
    });

    janusVideoroomWrapper.on('publisher-left', userId => {
      this.$delete(this.videoStreams, userId);
    });

    janusVideoroomWrapper.on('new-stream', async publisher => {
      cnsl.log('new stream for publisher: ', publisher);
      if (!this.getUsersWhoShareMedia.includes(publisher.userId)) {
        cnsl.log('wait for publisher is appear');
        await this.waitForPublisherWillAppear(publisher.userId);
      }
      this.$set(this.videoStreams, publisher.userId, publisher.stream);
    });

    if (!IS_ELECTRON) {
      mediaCapturer.on('stop-sharing-screen', () => {
        broadcastActions.dispatch('me/setMediaState', {
          ...this.mediaState,
          screen: false,
        });
      });
    }
  },

  beforeDestroy() {
    janusVideoroomWrapper.removeAllListeners('publisher-joined');
    janusVideoroomWrapper.removeAllListeners('publisher-left');
    janusVideoroomWrapper.removeAllListeners('new-stream');

    if (!IS_ELECTRON) {
      mediaCapturer.removeAllListeners('stop-sharing-screen');
    }

    window.removeEventListener('resize', this.resize, false);

    broadcastEvents.removeAllListeners('grid-expand');
    broadcastEvents.off('grid-hide', this.windowHideHandler);
    broadcastEvents.off('grid-expanded-focus', this.windowFocusHandler);

    broadcastEvents.removeAllListeners('callbuttons-hand');
    broadcastEvents.removeAllListeners('callbuttons-chat');
  },

  methods: {
    /**
     * Handle video streams in this room
     * Insert existed videos, request videos that arent receiving now,
     * insert local video stream
     * @returns {void}
     */
    handleVideoStreams() {
      // unpause all streams
      janusVideoroomWrapper.resumeAllSubscriptions();

      // insert existing videos
      const activePublishers = janusVideoroomWrapper.getActivePublishers();

      activePublishers
        .filter(publisher => publisher.stream)
        .forEach(publisher => {
          cnsl.log('insert video for user ', publisher.userId, publisher.stream);
          this.$set(this.videoStreams, publisher.userId, publisher.stream);
        });

      // start publishers without streams
      activePublishers
        .filter(publisher => !publisher.stream && !publisher.attaching)
        .forEach(publisher => {
          cnsl.log('subscribe for video from user', publisher.userId);
          janusVideoroomWrapper.subscribeFor(publisher.janusId);
        });
    },

    async waitForPublisherWillAppear(userId) {
      const maxAttempts = 5;
      const interval = 1000;

      let i = 0;

      while (i++ < maxAttempts) {
        if (this.getUsersWhoShareMedia.includes(userId)) {
          return;
        }
        await new Promise(resolve => setInterval(resolve, interval));
      }
      throw new Error('WaitPublisherTimeout');
    },

    /**
     * Assign dimentions to the cell depending on its index
     * @param {number} index cell's index
     * @return {object}
     */
    cellWidth(index) {
      if (this.isMobileWidth) {
        return this.cellMobileWidth(index);
      } else {
        return Math.floor(this.fullGridWidth * this.currentGrid[index]);
      }
    },

    cellMobileWidth(index) {
      if (this.usersCount <= 2) {
        return Math.floor(this.fullGridWidth);
      } else if (this.usersCount % 2 === 0) {
        return Math.floor(this.fullGridWidth / 2);
      } else {
        if (index === 0) {
          return Math.floor(this.fullGridWidth);
        } else {
          return Math.floor(this.fullGridWidth / 2);
        }
      }
    },

    /**
     * Re-count padding of grid and re-count best grid depending on aspect ratio
     * @return {void}
     */
    resize() {
      GRID_WIDTH = document.getElementById('cell-grid').offsetWidth;
      GRID_HEIGHT = document.getElementById('cell-grid').offsetHeight;

      this.isMobileWidth = (GRID_WIDTH < MOBILE_WIDTH && !IS_ELECTRON);

      if (!GRID_WIDTH || !this.grids) {
        return;
      }

      const boundWidth = GRID_WIDTH - PADDING * 2;
      const closest = this.findClosest(GRID_HEIGHT / boundWidth, this.grids);

      this.currentGrid = closest.sizes;

      this.fullGridWidth = Math.min(boundWidth, GRID_HEIGHT / closest.ratio);

      if (GRID_HEIGHT / boundWidth < closest.ratio) {
        this.padding = { padding: '0 ' + (boundWidth - GRID_HEIGHT / closest.ratio) / 2 + 'px' };
      } else {
        this.padding = { padding: '0' };
      }

      if (this.isMobileWidth) {
        this.fullGridWidth = GRID_WIDTH - MOBILE_PADDING * 2;
        this.padding = { padding: `0 ${MOBILE_PADDING}px` };
      }
    },

    /**
     * Find grid with closest aspect ratio to cell-grid's aspect ratio
     * @param {number} val cell-grid's aspect ratio
     * @param {array} arr all grids for current users' amount
     * @return {object}
     */
    findClosest(val, arr) {
      return arr.reduce((a, b) => {
        // here we imply that A is always smaller than B (our case)
        return val < Math.sqrt(a.ratio * b.ratio) ? a : b;
      });
    },

    /**
     * If this person has camera/screensharing on. Should we show "fullscreen" button for this person?
     * @param {string} id user's id
     * @returns {boolean}
     */
    hasVideo(id) {
      if (this.getUsersWhoShareMedia.includes(id)) {
        return true;
      }

      return false;
    },

    /**
     * fullscreen click handler
     * @param {string} id user's id
     * @returns {void}
     */
    expandedClickHandler(id) {
      if (!this.hasVideo(id) || id === this.myId) {
        return;
      }
      this.$router.push({
        name: 'expanded',
        params: { id },
      });
    },

    handUpHandler(value) {
      let status = !this.getHandUpStatusByUserId(this.myId);

      if (value !== undefined) {
        status = value;
      }

      if (status) {
        this.unwatchSpeaking = this.$watch('speaking', (val) => {
          if (val) {
            this.handUpHandler(false);
          }
        });
      } else {
        if (this.unwatchSpeaking) {
          this.unwatchSpeaking();
        }
      }
      broadcastActions.dispatch('app/handUpInChannel', status);
    },

    windowFocusHandler() {
      if (this.pausedByScreenSharing) {
        janusVideoroomWrapper.resumeAllSubscriptions();

        this.pausedByScreenSharing = false;
      }
    },

    windowHideHandler() {
      if (this.amISharingScreen) {
        janusVideoroomWrapper.pauseAllSubscriptions();

        this.pausedByScreenSharing = true;
      }
    },

    setScrollable(val) {
      this.scrollableGrid = val;
    },

    userAvatar: getUserAvatarUrl,
  },
};
</script>

<style lang="stylus" scoped>
  .call-window
    display flex
    flex-direction column
    height 100vh
    color var(--Text-white)

  .top-content
    height 104px
    box-sizing border-box
    padding 0 40px
    display flex
    flex-direction row
    justify-content space-between
    align-items center
    white-space nowrap

    &__devices
      margin-left 8px
      flex-shrink 0
      border-radius 15px

      @media $mobile
        background var(--new-transparent)
        height 24px !important
        width 24px !important

  .left-info
    display flex
    flex-direction row
    align-items center
    font-weight 500
    font-size 24px
    line-height 24px
    color rgba(255, 255, 255, 0.5)

    @media $mobile
      font-weight 500
      font-size 16px
      line-height 22px
      flex-wrap wrap
      justify-content center
      flex-grow 2
      padding-left 24px

    &__channel
      display flex
      align-items center

  .channel-icon
    color: var(--UI-positive)
    flex-shrink 0

    @media $mobile
      width 24px
      height 24px

  .channel-name
    color var(--Text-white)
    margin 0 16px 0 4px
    font-weight bold
    font-size 32px
    line-height 36px

    @media $mobile
      font-weight 500
      font-size 18px
      line-height 28px
      margin 0 0 0 4px

  .channel-usercount
    padding 2px 16px 0 0
    flex-shrink 0

    @media $mobile
      flex-basis 100%
      text-align center
      padding 4px 0 0 8px

  .cell-grid
    height calc(100vh - 246px)
    display flex
    flex-direction row
    flex-wrap wrap
    align-items center
    justify-content center
    align-content center
    box-sizing border-box

    &--scrollable
      align-content flex-start

  .call-window > /deep/.pseudo-popup
    height auto

  /deep/ .pseudo-popup__body
    padding 0

  /deep/ .pseudo-popup__header--with-shadow
    box-shadow 0 0 16px 10px #000000
    z-index 10

  /deep/ .pseudo-popup__footer--with-shadow
    box-shadow 0 0 16px 10px #000000
    z-index 10

  .bottom-content
    margin-top 34px
    display flex

    @media $mobile
      position relative

    &__col
      display flex
      align-items center
      flex-grow 1
      flex-basis 33.333%
      justify-content flex-end

      &--center
        flex-basis 100%
        justify-content center

        @media screen and (max-width: 1000px)
          justify-content flex-start
          flex-basis initial
          margin-left 40px

          .bottom-content__controls
            margin 0

      &--fixed-center
        justify-content center !important
        margin-left 0 !important

      &--left
        padding-left 40px

        @media screen and (max-width: 1000px)
          display none

      &--right
        padding-right 40px

  .tech-button
    border-radius 15px

  .mini-chat-button
    margin-left 12px

    &__badge
      position absolute
      width 11px
      height 11px
      top -3px
      right -3px
      border-radius 11px
      background var(--UI-error)

  .badge-show-enter-active
    transition transform .35s cubic-bezier(0.34, 2, 0.64, 1);

  .badge-show-leave-active
    transition transform .25s ease

  .badge-show-enter,
  .badge-show-leave-to
    transform scale(0)

    &__controls
      margin 0 auto

</style>
