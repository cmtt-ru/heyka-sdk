<template>
  <div
    class="mic"
    :style="buttonSizeComp"
    :class="{'mic--disabled': disabled, 'mic--header': header}"
    @click="$emit('click')"
  >
    <div
      v-if="active"
      class="mic__volume"
      :style="volume"
    />
    <svg-icon
      class="mic__icon"
      :name="iconProp.icon"
      :stroke="iconColor && iconProp.stroke"
      :width="iconSizeComp"
      :height="iconSizeComp"
    />
  </div>
</template>

<script>

/**
 * Mic icons
 */
const STATES = {
  true: {
    icon: 'mic',
    stroke: 'var(--text-0)',
  },
  false: {
    icon: 'mic-off',
    stroke: 'var(--text-1)',
  },
};

/**
 * Size of icons
 * @type {{small: number, large: number, medium: number}}
 */
const ICON_SIZES = {
  small: 16,
  medium: 18,
  large: 24,
};

/**
 * Size of icons
 * @type {{small: number, large: number, medium: number}}
 */
const BUTTON_SIZES = {
  small: {
    width: '28px',
    height: '28px',
    'border-radius': '4px',
  },
  medium: {
    width: '44px',
    height: '44px',
    'border-radius': '11px',
  },
  large: {
    width: '64px',
    height: '64px',
    'border-radius': '8px',
  },
};

export default {
  props: {
    /**
     * State of microphone (active ar disabled)
     */
    active: {
      type: Boolean,
      default: false,
    },

    /**
     * Size of the button
     * @param small | medium | large
     */
    size: {
      type: String,
      default: 'small',
    },

    /**
     * Enable's icon color depends on state
     */
    iconColor: {
      type: Boolean,
      default: undefined,
    },

    /**
     * Enable's volume fill color
     */
    fillColor: {
      type: String,
      default: undefined,
    },

    /**
     * Disabled state
     */
    disabled: {
      type: Boolean,
      default: false,
    },

    /**
     * true if button is in app's header
     */
    header: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    /**
     * Display either active or inactive icon
     * @returns {object}
     */
    iconProp() {
      return STATES[this.active];
    },

    /**
     * Convert DB to height in percentage, filling up the mic icon
     * @returns {object}
     */
    volume() {
      return {
        // eslint-disable-next-line no-magic-numbers
        transform: `scaleY(${Math.floor(this.$store.getters['app/getMicrophoneVolume'] + 100) / 100})`,
        backgroundColor: this.fillColor,
      };
    },
    /**
     * Compute right icon size
     *
     * @returns {number|*}
     */
    iconSizeComp() {
      return ICON_SIZES[this.size];
    },

    /**
     * Compute right icon size
     *
     * @returns {number|*}
     */
    iconWrapperSizeComp() {
      return {
        width: ICON_SIZES[this.size] + 'px',
        height: ICON_SIZES[this.size] + 'px',
      };
    },

    /**
     * Compute right button size
     *
     * @returns {number|*}
     */
    buttonSizeComp() {
      return BUTTON_SIZES[this.size];
    },
  },
};
</script>

<style lang="stylus" scoped>
.mic
    position relative
    background var(--new-overlay-01)
    cursor pointer
    display flex
    flex-direction row
    align-items center
    justify-content center
    flex-shrink 0
    -webkit-app-region no-drag
    overflow hidden

    &:hover
      background var(--new-overlay-02)

    &:active
      background var(--new-overlay-03)

    &__volume
        will-change transform
        transform translateZ(0)
        backface-visibility hidden
        perspective 1000
        background-color var(--color-1)
        position absolute
        bottom 0
        left 0
        right 0
        height 100%
        transform-origin bottom left

    &__icon
        position relative

    &--disabled
      pointer-events none
      opacity 0.5

    &--header

      &:hover
        background var(--new-button-appbar-hover)
        mix-blend-mode luminosity

      &:active
        background var(--new-button-appbar-active)
        mix-blend-mode luminosity

.volume-wrapper
  position absolute

</style>
