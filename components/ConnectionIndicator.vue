<template>
  <div
    v-tooltip="texts.tooltip"
    class="aqi"
    :data-status="status"
  >
    <span />
    <span />
    <span />
    <span />
  </div>
</template>

<script>

export default {
  props: {
    /**
     * Connection status
     */
    status: {
      type: Number,
      required: true,
    },
  },

  computed: {
    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('aqi');
    },
  },
};
</script>

<style lang="stylus" scoped>
.aqi
  display flex
  align-items flex-end
  justify-content center

  span
    display block
    width 2px
    margin-right 1px
    border-radius 1px
    transition background 0.15s ease

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
    background #FFC12F

    &:nth-child(4)
      opacity 0.25

  &[data-status="2"] span
    background #FF9900

    &:nth-child(4)
    &:nth-child(3)
      opacity 0.25

  &[data-status="3"] span
    background #FF6157

    &:nth-child(4)
    &:nth-child(3)
    &:nth-child(2)
      opacity 0.25
</style>
