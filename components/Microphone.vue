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
      :style="medianVolumeTransform"
    />
    <div
      v-if="active"
      class="mic__volume"
      :style="volumeTransform"
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
import broadcastEvents from '@sdk/classes/broadcastEvents';
import Mousetrap from 'mousetrap';

/**
 * Mic icons
 */
const STATES = {
  true: {
    icon: 'mic',
  },
  false: {
    icon: 'mic-off',
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
    width: '60px',
    height: '60px',
    'border-radius': '15px',
  },
};
const INIT_VOLUME = -100;

/**
 * Variables for volume history
 */
const HISTORY_INTERVAL = 50;
const HISTORY_LENGTH = 20;
let volumeHistory = null;
let volumeHistoryIndex = 0;
let volumeHistoryInterval = null;

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

  data() {
    return {
      medianVolume: INIT_VOLUME,
      volumeHistory: [ INIT_VOLUME ],
      currentVolume: () => {
        return window.IS_IOS ? 0 : INIT_VOLUME;
      },
    };
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
     * Convert DB to height in percentage, filling up the mic button
     * @returns {object}
     */
    volumeTransform() {
      return {
        // eslint-disable-next-line no-magic-numbers
        transform: `scaleY(${Math.floor(this.currentVolume + 100) / 100})`,
      };
    },

    /**
     * Convert DB to height in percentage, filling up the mic button, BUT IN OTHER WAY
     * @returns {object}
     */
    medianVolumeTransform() {
      return {
        // eslint-disable-next-line no-magic-numbers
        transform: `scaleY(${Math.floor(this.medianVolume + 100) / 100})`,
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

  watch: {
    active(val) {
      this.recordVolumeHistory(val);
    },
  },

  mounted() {
    broadcastEvents.on('microphone-volume', volume => {
      this.currentVolume = volume;
    });

    if (this.active) {
      this.recordVolumeHistory(true);
    }

    Mousetrap.bind('space', () => {
      this.$emit('click');
    });
  },

  beforeDestroy() {
    this.recordVolumeHistory(false);
    broadcastEvents.removeAllListeners('microphone-volume');
    Mousetrap.unbind('space');
  },

  methods: {
    recordVolumeHistory(state) {
      if (state) {
        volumeHistory = new Array(HISTORY_LENGTH).fill(INIT_VOLUME);

        volumeHistoryInterval = setInterval(() => {
          volumeHistory[volumeHistoryIndex] = this.currentVolume;

          volumeHistoryIndex++;

          if (volumeHistoryIndex >= HISTORY_LENGTH) {
            volumeHistoryIndex = 0;
          }

          this.medianVolume = Math.max(...volumeHistory);
        }, HISTORY_INTERVAL);
      } else {
        clearInterval(volumeHistoryInterval);
      }
    },
  },
};
</script>

<style lang="stylus" scoped>
.mic
  position relative
  background var(--Background-darkgrey)
  color var(--Text-white)
  cursor pointer
  display flex
  flex-direction row
  align-items center
  justify-content center
  flex-shrink 0
  -webkit-app-region no-drag
  overflow hidden

  &:hover
    background var(--Background-darkgrey-hover)

  &:active
    background var(--Background-darkgrey-active)

  &__volume
    transform translateZ(0) scaleY(0)
    background-color #254327 //! color-dodge didn't work
    position absolute
    bottom 0
    left 0
    right 0
    height 100%
    transform-origin bottom left
    transition transform 0.1s linear

    &:nth-child(2)
      background-color #268A2B //! color-dodge didn't work

  &__icon
    position relative

  &--disabled
    pointer-events none
    //opacity 0.5

.volume-wrapper
  position absolute

</style>
