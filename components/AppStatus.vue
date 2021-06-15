<template>
  <transition name="show">
    <div
      v-if="show"
      v-tooltip="texts.tooltip"
      class="app-status"
    >
      <span />
    </div>
  </transition>
</template>

<script>

export default {
  props: {
    /**
     * Show state
     */
    show: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('appStatus');
    },
  },
};
</script>

<style lang="stylus" scoped>
  .app-status
    position fixed
    bottom 22px
    left 22px
    background var(--Background-white)
    border-radius 100px
    width 32px
    height 32px
    box-shadow var(--new-shadow-03)
    z-index 9999

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
      animation pulse 1s linear infinite
      border 2px solid var(--UI-active)
      border-right-color transparent

  @keyframes pulse {
    0% {
      transform rotate(0deg)
    }
    100% {
      transform rotate(360deg)
    }
  }

  .show-enter-active,
  .show-leave-active
    transition transform 0.25s 0.125s ease

  .show-enter,
  .show-leave-to
    transform translateY(200%)
</style>
