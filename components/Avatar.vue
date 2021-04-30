<template>
  <div
    class="avatar"
    :style="containerSize"
  >
    <transition name="fade">
      <div
        v-if="onair"
        class="avatar__onair"
        :style="{'border-radius': borderRadius + 'px'}"
      />
    </transition>

    <div
      v-if="!noColor && (!loaded || !imageUrl)"
      class="avatar__no-image"
      :class="imageClasses"
      :style="{'background-color': imageColor, 'border-radius': borderRadius + 'px'}"
    >
      <svg
        v-if="guest"
        class="avatar__username"
        viewBox="0 0 100 100"
      >
        <text
          text-anchor="middle"
          dominant-baseline="middle"
          fill="currentColor"
          x="50%"
          y="50%"
          dy="0.1em"
        >{{ userInitials }}</text>
      </svg>
      <span class="" />
    </div>

    <div
      v-if="imageUrl"
      class="avatar__image"
      :class="imageClasses"
      :style="{'border-radius': borderRadius + 'px'}"
    >
      <img
        loading="lazy"
        class=""
        alt=""
        :width="size"
        :height="size"
        :src="imageUrl"
        @load="loadHandler"
      >
      <div
        class="avatar__image__border"
        :style="outlineStyle"
      />
    </div>

    <div
      v-if="statusStyle"
      class="avatar__status"
    >
      <div
        :style="statusStyle"
        class="avatar__status__dot"
      />
    </div>
  </div>
</template>

<script>

import { mapGetters } from 'vuex';
import { getUserAvatarUrl } from '@libs/image';
import { removeEmoji } from '@libs/texts';

const COLORS = [
  '#D65D56',
  '#D66D56',
  '#D67C56',
  '#D69356',
  '#D6A356',
  '#D6B256',
  '#D6C156',
  '#D6D156',
  '#CCD656',
  '#BCD656',
  '#ADD656',
  '#95D656',
  '#7FD656',
  '#68D656',
  '#56D67A',
  '#56D6A0',
  '#56D6C6',
  '#56CED6',
  '#56C6D6',
  '#56B7D6',
  '#56A8D6',
  '#5690D6',
  '#5662D6',
  '#7056D6',
  '#8656D6',
  '#9E56D6',
  '#AD56D6',
  '#C456D6',
  '#D656C1',
  '#D65693',
  '#D65675',
];

const COLORS_LENGTH = COLORS.length;

/**
 * Status to color map (small circle in bottom right corner)
 */
const STATUS_COLORS = {
  online: {
    'background-color': 'var(--new-signal-02)',
    'border-color': 'var(--new-signal-02)',
  },
  idle: {
    'background-color': 'var(--new-signal-01)',
    'border-color': 'var(--new-signal-01)',
  },
  offline: {
    'background-color': 'transparent',
    'border-color': 'var(--new-UI-05)',
  },
};

/**
 * Sizes of holes in avatar (for status)
 */
const STATUS_SIZES = {
  32: 'avatar__image--dot',
  20: 'avatar__image--dot-20',
  default: 'avatar__image--dot',
};

const BORDERLINE_WIDTH = 50;

export default {
  props: {
    /**
     * Image size
     */
    size: {
      type: [ Number ],
      default: 24,
    },

    /**
     * Image url
     */
    image: {
      type: [ String ],
      default: null,
    },

    /**
     * Avatar border radius
     */
    borderRadius: {
      type: Number,
      default: 1000,
    },

    /**
     * Whether to show online status
     */
    status: {
      type: [ Boolean ],
      default: false,
    },

    /**
     * If person is talking, we need to draw green circle around avatar.
     */
    onair: {
      type: [ Boolean ],
      default: false,
    },

    /**
     * ID of avatar's user
     */
    userId: {
      type: [ String ],
      default: null,
    },

    /**
     * true if no need for secondary colored background when no img
     */
    noColor: {
      type: [ Boolean ],
      default: false,
    },
  },

  data() {
    return {
      loaded: false,
    };
  },

  computed: {
    ...mapGetters({
      userById: 'users/getUserById',
    }),
    /**
     * Set img size in css
     * @returns {object} height and width
     */
    containerSize() {
      return {
        height: this.size + 'px',
        width: this.size + 'px',
      };
    },

    outlineStyle() {
      const width = this.size > BORDERLINE_WIDTH ? 2 : 1;

      return {
        'border-radius': this.borderRadius + 'px',
        'box-shadow': `inset 0 0 0 ${width}px rgba(0,0,0,0.1)`,
      };
    },

    /**
     * Set status-circle color
     * @returns {object} background-color and border-color
     */
    statusStyle() {
      return STATUS_COLORS[this.userStatus] || null;
    },

    /**
     * Image classes
     * @returns {object}
     */
    imageClasses() {
      const classes = {};

      classes[STATUS_SIZES[this.size] || STATUS_SIZES['default']] = !!this.statusStyle;

      return classes;
    },

    /**
     * Get static color from user id
     * @return {string}
     */
    imageColor() {
      if (!this.userId) {
        return COLORS[0];
      }

      const firstDigits = parseInt(this.userId
        .replace(/[^0-9]/g, '')
        .substr(0, 2));

      const colorIndex = firstDigits % COLORS_LENGTH;

      return COLORS[colorIndex];
    },

    imageUrl() {
      if (this.image) {
        return this.image;
      }

      if (this.userId && this.user) {
        return getUserAvatarUrl(this.user, this.size);
      }

      return null;
    },

    user() {
      if (this.userId && !this.image) {
        return this.userById(this.userId);
      }

      return null;
    },

    /**
     * Get user initials
     * @example Andrews Hayman --> AH
     * @return {string}
     */
    userInitials() {
      if (this.user) {
        /**
         * User name without Emojis & extra spaces
         */
        const cleanName = removeEmoji(this.user.name).replace(/ +(?= )/g, '');
        const nameArray = cleanName.split(' ');
        const length = nameArray.length;

        if (length === 0) {
          return '';
        } else if (length === 1) {
          return nameArray[0].charAt(0);
        } else {
          return nameArray[0].charAt(0) + nameArray[1].charAt(0);
        }
      }

      return '';
    },

    userStatus() {
      if (this.status && this.user) {
        return this.user.onlineStatus;
      }

      return false;
    },

    guest() {
      return this.user && this.user.role === 'guest';
    },
  },

  methods: {
    loadHandler() {
      this.loaded = true;
      this.$emit('load');
    },
  },
};
</script>

<style lang="stylus" scoped>
  .avatar
    position relative

    &__no-image
      position absolute
      top 0
      left 0
      width 100%
      height 100%
      border-radius 50%

    &__username
      display block
      width 100%
      height 100%
      color #fff
      text-align center
      font-size 40px

      text
        color #fff
        text-shadow 0 1px 3px rgba(0,0,0,0.1)

    &__image
      position relative
      display block
      width 100%
      height 100%
      border-radius 50%
      overflow hidden

      &__border
        position absolute
        top 0
        bottom 0
        left 0
        right 0
        display block
        background-color transparent

      &--dot
        mask-image radial-gradient(circle at calc(100% - 4px) calc(100% - 4px), transparent 6px, white 6.5px)

      &--dot-20
        mask-image radial-gradient(circle at calc(100% - 3px) calc(100% - 3px), transparent 5px, white 5.5px)

      & img
        position absolute
        object-fit cover

    &__status
      position absolute
      bottom -2px
      right -2px
      width calc(100% * 1 / 3)
      height calc(100% * 1 / 3)
      min-width 4px
      min-height 4px
      max-width 8px
      max-height 8px
      border-radius 50%
      background-color transparent
      border 2px solid transparent

      &__dot
        position absolute
        box-sizing border-box
        bottom 0
        right 0
        width 100%
        height 100%
        border-radius 50%
        border 2px solid

    &__onair
      position absolute
      bottom -4px
      right -4px
      left -4px
      top -4px
      border-radius 50%
      background linear-gradient(#48DA85, #14A49B)
      mask-image radial-gradient(circle at 50% 50%, transparent calc(50% + 2.5px), var(--new-signal-02) calc(50% + 3px))

  .fade-enter-active,
  .fade-leave-active
    transition all 0.125s ease

  .fade-enter,
  .fade-leave-to
    opacity 0
</style>
