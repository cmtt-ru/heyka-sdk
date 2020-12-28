
<template>
  <div
    class="cell"
    :style="cellDimensions"
  >
    <div
      v-show="handUpStatus(user.id)>mountedTimestamp-5000"
      :key="handUpStatus(user.id)"
      class="cell__raised-hand"
    />
    <div
      class="cell__inner"
      @dblclick="expandedClickHandler"
    >
      <video
        v-show="videoStream"
        :ref="`video${user.id}`"
        class="cell__feed"
        :class="{ 'cell__feed--flip': user.camera && user.id === myId }"
      />
      <div
        v-show="user.speaking && user.microphone"
        class="cell__talking"
      />

      <ui-button
        :key="hasVideo"
        v-popover.click="{name: 'GridUser', data: {userId: user.id, isStreaming: hasVideo}}"
        class="badge badge--hidden cell__more"
        :type="7"
        size="medium"
        :height="40"
        icon="more"
      />

      <div
        v-tooltip="'Unstable connection'"
        class="cell__aqi"
        :data-status="audioQualityStatus(user.id)"
      >
        <span />
        <span />
        <span />
        <span />
      </div>

      <avatar
        v-show="!user.camera && !user.screen"
        class="cell__avatar"
        :image="userAvatar(user, 192)"
        :user-id="user.id"
        :size="192"
        square
      />

      <div
        class="badge cell__username"
        :class="{'cell__username--hidden': user.camera}"
      >
        <div v-textfade>
          {{ user.name }}
        </div>
        <div
          v-if="user.id === myId"
          class="cell__username__you"
        >
          {{ texts.you }}
        </div>
        <svg-icon
          v-if="!user.microphone"
          class="cell__username__mic-off"
          name="mic-off"
          size="small"
        />
      </div>
    </div>
  </div>
</template>

<script>
import UiButton from '@components/UiButton';
import Avatar from '@components/Avatar';
import { getUserAvatarUrl } from '@libs/image';
// import broadcastEvents from '@sdk/classes/broadcastEvents';
import { mapGetters } from 'vuex';

/**
 * Aspect ratio 124 / 168;
 * @type {number}
 */
const ASPECT_RATIO = 0.7380952381;

export default {
  components: {
    UiButton,
    Avatar,
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
     * Cell's user
     */
    user: {
      type: Object,
      default: () => {},
    },

    /**
     * User's video stream
     */
    videoStream: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      mountedTimestamp: Date.now(),
    };
  },
  computed: {
    ...mapGetters({
      getUsersWhoShareMedia: 'getUsersWhoShareMedia',
      mediaState: 'me/getMediaState',
      myId: 'me/getMyId',
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
     * Cell's width
     * @returns {number}
     */
    height() {
      return Math.floor(this.width * ASPECT_RATIO);
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

    /**
     * If this person has camera/screensharing on. Should we show "fullscreen" button for this person?
     * @returns {boolean}
     */
    hasVideo() {
      if (this.getUsersWhoShareMedia.includes(this.user.id)) {
        return true;
      }

      return false;
    },
  },
  watch: {

  },

  mounted() {

  },

  beforeDestroy() {

  },

  destroyed() {

  },

  methods: {
    /**
     * fullscreen click handler
     * @param {string} id user's id
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

    userAvatar: getUserAvatarUrl,
  },
};
</script>

<style lang="stylus" scoped>
.cell
    box-sizing border-box
    position relative
    padding 4px

    &__raised-hand
      position absolute
      top 4px
      bottom 4px
      left 4px
      right 4px
      pointer-events none
      border-radius var(--borderWidth)
      animation showRaisedHand 5s linear forwards
      animation-iteration-count 1
      z-index 20
      clip-path url(#svgPath)
      --borderWidth: 10px

      @keyframes showRaisedHand {
        0% {
          visibility: visible;
          opacity: 0;
        }
        5% {
          visibility: visible;
          opacity: 1;
        }
        95% {
          visibility: visible;
          opacity: 1;
        }
        100% {
          visibility: hidden;
          opacity: 0;
        }
      }

      &:after
        content ''
        position absolute
        top calc(-1 * var(--borderWidth))
        left calc(-1 * var(--borderWidth))
        height calc(100% + var(--borderWidth) * 2)
        width calc(100% + var(--borderWidth) * 2)
        background linear-gradient(60deg, #f79533, #f37055, #ef4e7b, #a166ab, #5073b8, #1098ad, #07b39b, #6fba82)
        border-radius calc(var(--borderWidth) * 2)
        z-index 1
        animation animatedGradient 2s ease alternate
        animation-iteration-count 5
        background-size 300% 300%
        filter blur(50px)

      @keyframes animatedGradient {
        0% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
        100% {
          background-position: 0% 50%;
        }
      }

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
      background var(--new-bg-05)

      video
        width 100%
        height 100%
        object-fit cover

    &__feed
      position absolute
      top 0
      left 0
      width 100%
      height 100%
      border-radius 4px

    &__talking
      position absolute
      top 0
      left 0
      width 100%
      height 100%
      border 2px solid var(--color-1)
      border-radius 4px
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
      background-color: var(--button-bg-5);
      width 28px
      padding 9px 0
      min-height 28px
      border-radius 6px
      align-items flex-end
      justify-content center
      box-sizing border-box

      span
        display block
        width 2px
        margin-right 1px
        border-radius 1px

        &:nth-child(1)
          height 4px

        &:nth-child(2)
          height 6px

        &:nth-child(3)
          height 8px

        &:nth-child(4)
          height 10px
          margin-right 0

      &[data-status="0"]
        display none

      &[data-status="1"] span
        background #ffd319

        &:nth-child(4)
          opacity 0.25

      &[data-status="2"] span
        background #fd871f

        &:nth-child(4)
        &:nth-child(3)
          opacity 0.25

      &[data-status="3"] span
        background #fa3610

        &:nth-child(4)
        &:nth-child(3)
        &:nth-child(2)
          opacity 0.25

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

    .badge--hidden.context-menu--opened
      opacity 1

    &__avatar
      border-radius 4px
      overflow hidden
      margin auto

    &__username
      bottom 4px
      margin 0 auto
      padding 8px
      border-radius 4px
      flex-shrink 0
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

      &__you
        color var(--text-1)
        margin-left 8px

      &__mic-off
        margin-left 8px
</style>
