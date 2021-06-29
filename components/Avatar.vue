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
import { idToColor } from '@libs/utils';

/**
 * Status to color map (small circle in bottom right corner)
 */
const STATUS_COLORS = {
  online: {
    'background-color': 'var(--UI-positive)',
    'border-color': 'var(--UI-positive)',
  },
  idle: {
    'background-color': 'var(--UI-alert)',
    'border-color': 'var(--UI-alert)',
  },
  offline: {
    'background-color': 'var(--Text-tertiary)',
    'border-color': 'var(--Text-tertiary)',
  },
};

/**
 * Sizes of holes in avatar (for status)
 */
const STATUS_SIZES = {
  40: 'avatar__image--dot-40',
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
      return idToColor(this.userId);
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

      &--dot-40
        mask-image radial-gradient(circle at calc(100% - 5.5px) calc(100% - 5.5px), transparent 6.5px, white 7px)

      & img
        position absolute
        object-fit cover

    &__status
      position absolute
      bottom -2px
      right -2px
      width calc(100% * 1 / 4)
      height calc(100% * 1 / 4)
      min-width 4px
      min-height 4px
      max-width 10px
      max-height 10px
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
      mask-image radial-gradient(circle at 50% 50%, transparent calc(50% + 2.5px), var(--UI-positive) calc(50% + 3px))

  .fade-enter-active,
  .fade-leave-active
    transition all 0.125s ease

  .fade-enter,
  .fade-leave-to
    opacity 0
</style>
