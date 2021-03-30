<template>
  <div
    class="progress-bar"
    :class="{'progress-bar--animated': animated}"
  >
    <div
      class="progress-bar__value"
      :style="{width: value + '%'}"
    />
  </div>
</template>

<script>

export default {
  props: {
    /**
     * Value in percent
     * min – 0
     * max – 100
     */
    value: {
      type: Number,
      default: 0,
    },

    animated: {
      type: Boolean,
      default: true,
    },
  },
};
</script>

<style lang="stylus" scoped>
  .progress-bar
    background var(--new-UI-06)
    height 4px
    border-radius 6px
    margin 4px 0 10px
    overflow hidden

    &__value
      background var(--new-signal-02)
      height 100%

    &--animated
      .progress-bar__value
        transition width linear 0.1s
</style>
