<template>
  <div
    class="avatar"
    :style="containerSize"
  >
    <transition name="fade">
      <div
        v-if="onair && mic"
        class="avatar__onair"
        :style="{'border-radius': borderRadius + 'px'}"
      />
    </transition>
    <div
      v-if="!noColor && (!loaded || !image)"
      class="avatar__no-image"
      :class="imageClasses"
      :style="{'background-color': imageColor, 'border-radius': borderRadius + 'px'}"
    />
    <div
      v-if="image"
      class="avatar__image"
      :class="imageClasses"
      :style="{'border-radius': borderRadius + 'px'}"
    >
      <div
        class="avatar__image__border"
        :style="{'border-radius': borderRadius + 'px'}"
      />
      <img
        loading="lazy"
        class=""
        alt=""
        :width="size"
        :height="size"
        :src="image"
        @load="loadHandler"
      >
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

const COLORS = [
  '#ff0074AA',
  '#EFCA08',
  '#EE7674',
  '#D33F49',
  '#845EC2',
  '#008E83',
  '#266DD3',
  '#C64191',
  '#B0A8B9',
  '#4FFBDF',
  '#4B4453', // used when no userId is provided
];

/**
 * status-to-color map (small circle in bottom right corner)
 */
const STATUS_COLORS = {
  online: {
    'background-color': 'var(--color-1)',
    'border-color': 'var(--color-1)',
  },
  idle: {
    'background-color': 'var(--color-3)',
    'border-color': 'var(--color-3)',
  },
  offline: {
    'background-color': 'transparent',
    'border-color': 'var(--color-4)',
  },
};

/**
 * sizes of holes in avatar (for status)
 */
const STATUS_SIZES = {
  32: 'avatar__image--dot',
  20: 'avatar__image--dot-20',
  default: 'avatar__image--dot',
};

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
     * if true, image is not rounded
     */
    square: {
      type: [ Boolean ],
      default: false,
    },

    /**
     * true if user is guest (make avatar greenish)
     */
    guest: {
      type: [ Boolean ],
      default: false,
    },

    /**
     * Avatar border radius
     */
    borderRadius: {
      type: Number,
      default: 1000,
    },

    /**
     * online status (small circle in bottom right corner)
     */
    status: {
      type: [ String ],
      default: null,
    },

    /**
     * If person is talking, we need to draw green circle around avatar.
     */
    onair: {
      type: [ Boolean ],
      default: false,
    },

    /**
     * If person has mic on (in addition to onair)
     */
    mic: {
      type: [ Boolean ],
      default: true,
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

    /**
     * Set status-circle color
     * @returns {object} background-color and border-color
     */
    statusStyle() {
      return STATUS_COLORS[this.status] || null;
    },

    imageClasses() {
      const classes = {};

      classes['avatar__image--square'] = this.square;
      classes['avatar__image--guest'] = this.guest;
      classes[STATUS_SIZES[this.size] || STATUS_SIZES['default']] = !!this.statusStyle;

      return classes;
    },

    imageColor() {
      if (this.userId === null) {
        return COLORS[10];
      }
      const firstDigit = this.userId.match(/\d/);

      return COLORS[firstDigit];
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
        box-shadow inset 0 0 0 2px rgba(0,0,0,0.1)

      &--dot
        mask-image radial-gradient(circle at calc(100% - 4px) calc(100% - 4px), transparent 6px, white 6.5px)

      &--dot-20
        mask-image radial-gradient(circle at calc(100% - 3px) calc(100% - 3px), transparent 5px, white 5.5px)

      &--square
        border-radius 0 !important

      &--guest
        background-image radial-gradient(circle at 50% 50%,var(--new-signal-02) 2px,var(--new-signal-02-1) 2.5px) !important

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
