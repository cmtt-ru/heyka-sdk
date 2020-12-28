<template>
  <div
    class="call-window"
  >
    <div class="top-content">
      <div class="left-info">
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
        <div class="channel-usercount">
          {{ $tc("call.grid.users", usersCount) }}
        </div>
      </div>
      <ui-button
        v-popover.click="{name: 'Devices'}"
        class="top-content__devices"
        :type="7"
        popover
        :height="52"
        size="medium"
        icon="settings"
      />
    </div>

    <div
      id="cell-grid"
      class="cell-grid"
      :style="padding"
    >
      <cell
        v-for="(user, index) in users"
        :key="user.id"
        :width="Math.floor(fullGridWidth * currentGrid[index])"
        :video-stream="videoStreams[user.id]"
        :user="user"
      />
    </div>

    <call-buttons
      class="bottom-control"
      :buttons="['camera', 'screen', 'speakers', 'microphone', 'leave']"
      size="large"
    />

    <svg
      height="0"
      width="0"
    >
      <defs>
        <clipPath
          id="svgPath"
          clipPathUnits="objectBoundingBox"
        >
          <path
            fill="#FFFFFF"
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M0 0.0266666C0 0.011939 0.00895431 0 0.02 0H0.98C0.991046 0 1 0.0119391 1 0.0266667V0.973333C1 0.988061 0.991046 1 0.98 1H0.02C0.00895429 1 0 0.988061 0 0.973333V0.0266666Z

            M-20,-20 L0,27 A3,3 0 0,0 3,30 L7,30 A3,3 0 0,0 10,27 L10,0 Z"
          />
        </clipPath>
      </defs>
    </svg>
  </div>
</template>

<script>
import CallButtons from './CallButtons';
import UiButton from '@components/UiButton';
import Cell from './Cell';
import { GRIDS } from './grids';
import { mapGetters } from 'vuex';
import broadcastEvents from '@sdk/classes/broadcastEvents';
import janusVideoroomWrapper from '@sdk/classes/janusVideoroomWrapper';
import Logger from '@sdk/classes/logger';
import { getUserAvatarUrl } from '@libs/image';
const cnsl = new Logger('Grid.vue', '#138D75');

/**
 * Aspect ratio 124 / 168;
 * @type {number}
 */
const ASPECT_RATIO = 0.7380952381;

const PADDING = 20;

export default {
  components: {
    CallButtons,
    UiButton,
    Cell,
  },

  data() {
    return {
      mounted: false,
      currentGrid: [],
      fullGridWidth: null,
      padding: {},
      videoStreams: {},
      mountedTimestamp: Date.now(),
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
      audioQualityStatus: 'channels/getAudioQualityStatusByUserId',
      handUpStatus: 'channels/getHandUpStatusByUserId',
    }),

    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('call.grid');
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
  },

  async mounted() {
    this.mounted = true;
    window.addEventListener('resize', this.resize, false); // TODO: add small debounce for performance
    this.resize();

    broadcastEvents.on('grid-expand', (userId) => {
      this.expandedClickHandler(userId);
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
  },

  beforeDestroy() {
    janusVideoroomWrapper.removeAllListeners('publisher-joined');
    janusVideoroomWrapper.removeAllListeners('publisher-left');
    janusVideoroomWrapper.removeAllListeners('new-stream');
  },

  destroyed() {
    window.removeEventListener('resize', this.resize, false);
    broadcastEvents.removeAllListeners('grid-expand');
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
        .filter(publisher => !publisher.stream)
        .forEach(publisher => {
          cnsl.log('subscribe for video from user', publisher.userId);
          janusVideoroomWrapper.subscribeFor(publisher.janusId);
        });
    },

    async waitForPublisherWillAppear(userId) {
      const maxAttempts = 5;
      const interval = 100;

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
    cellDimensions(index) {
      return {
        width: Math.floor(this.fullGridWidth * this.currentGrid[index]) + 'px',
        height: Math.floor(this.fullGridWidth * ASPECT_RATIO * this.currentGrid[index]) + 'px',
      };
    },

    /**
     * Re-count padding of grid and re-count best grid depending on aspect ratio
     * @return {void}
     */
    resize() {
      const bounds = document.getElementById('cell-grid');

      if (!bounds || !this.grids) {
        return;
      }
      const boundHeight = bounds.offsetHeight - PADDING * 2;
      const boundWidth = bounds.offsetWidth - PADDING * 2;
      const closest = this.findClosest(boundHeight / boundWidth, this.grids);

      this.currentGrid = closest.sizes;

      this.fullGridWidth = Math.min(boundWidth, boundHeight / closest.ratio);

      if (boundHeight / boundWidth < closest.ratio) {
        this.padding = { padding: '0 ' + (boundWidth - boundHeight / closest.ratio) / 2 + 'px' };
      } else {
        this.padding = { padding: '0' };
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

    userAvatar: getUserAvatarUrl,
  },
};
</script>

<style lang="stylus" scoped>
  .call-window
    display flex
    flex-direction column
    height 100vh

  .top-content
    height 108px
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

  .left-info
    display flex
    flex-direction row
    align-items center
    font-weight 500
    font-size 24px
    line-height 24px
    color rgba(255, 255, 255, 0.5)

  .channel-icon
    color: var(--new-signal-02)
    flex-shrink 0

  .channel-name
    font-size 14px
    line-height 18px
    color var(--new-UI-09)
    margin 0 16px 0 4px
    font-weight bold
    font-size 32px
    line-height 36px

  .channel-usercount
    padding 4px 16px 0 0
    flex-shrink 0

  .cell-grid
    height calc(100vh - 232px)
    display flex
    flex-direction row
    flex-wrap wrap
    align-items center
    justify-content center
    align-content center
    box-sizing border-box

  .bottom-control
    margin 28px auto 0
</style>
