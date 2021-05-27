<template>
  <div
    class="popover"
    :style="{'min-width': minWidth + 'px'}"
  >
    <div class="popover__header">
      <div class="popover__header__text">
        {{ $t('techTexts.actions') }}
      </div>
      <svg-icon
        class="popover__header__close"
        data-popover-close
        :width="18"
        :height="18"
        name="close"
      />
    </div>
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
    background var(--Background-darkgrey)
    box-shadow var(--new-shadow-03)
    color var(--Font-primary)
    border-radius 8px
    z-index 100
    flex-direction column
    box-sizing border-box

    @media $mobile

      width calc(100% - 32px) !important
      max-width 343px
      inset auto !important
      bottom 16px !important
      left 0 !important
      right 0 !important
      margin 0 auto !important
      transform none !important
      box-shadow 0px 0px 0px 300vh rgba(0, 0, 0, 0.28);
      border-radius 10px

    &__header
      display none
      flex-direction row
      justify-content space-between
      align-items center
      padding 13px 20px
      height 52px
      font-size 16px
      box-sizing border-box
      font-weight bold

      @media $mobile
        display flex

      &__close
        color var(--Icon-secondary)

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

 @media $mobile

  /deep/ .buttons
    padding 0

  /deep/ .ui-button
    margin-bottom 8px
    height 48px
    box-sizing border-box
    font-weight 500
    font-size 16px
    line-height 24px
    padding 0 20px
    position relative
    border-radius 0

    &:not(:last-child):after
      content ''
      position absolute
      bottom -4px
      right 0
      left 55px
      height 1px
      background-color var(--new-stroke-01)

  /deep/ .ui-button__icon
    height 24px
    width 24px
    margin-right 12px

</style>
