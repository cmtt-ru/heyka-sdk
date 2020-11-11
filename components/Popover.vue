<template>
  <div
    class="popover"
    :style="[$themes.getColors('content'), {'min-width': minWidth + 'px'}]"
  >
    <slot />
  </div>
</template>

<script>
export default {
  props: {
    minWidth: {
      type: Number,
      default: 130,
    },
  },
};
</script>

<style lang="stylus" scoped>
  .popover
    display flex
    background var(--app-bg)
    box-shadow var(--new-shadow-03)
    border-radius 8px
    z-index 100
    flex-direction column
    box-sizing border-box

    /deep/ a
      .ui-button
        width 100%

    /deep/ .delimiter
      height 1px
      background var(--new-UI-06)
      margin 0 12px 0 38px

    /deep/ .buttons
      padding 4px
      display flex
      flex-direction column
</style>
