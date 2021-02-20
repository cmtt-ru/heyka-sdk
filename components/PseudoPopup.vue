<template>
  <div class="pseudo-popup">
    <div
      v-sticky="{ offset: 0, rootSelector: '.layout' }"
      class="pseudo-popup__header"
      :class="{'shadow-disable': !headerHasShadow}"
    >
      <span>
        <slot name="header" />
      </span>

      <ui-button
        class="pseudo-popup__header__close"
        :type="7"
        size="small"
        icon="close"
        @click="closeHandler"
      />
    </div>

    <div
      ref="body"
      class="pseudo-popup__body"
    >
      <slot name="body" />
    </div>

    <div
      v-if="$slots.footer"
      v-sticky.bottom="{ offset: 0, rootSelector: '.layout' }"
      class="pseudo-popup__footer"
      :class="{'shadow-disable': !footerHasShadow}"
    >
      <slot name="footer" />
    </div>
  </div>
</template>

<script>
import UiButton from '@components/UiButton';

export default {
  components: {
    UiButton,
  },

  props: {
    /**
     * true if header has shadow on scroll
     */
    headerHasShadow: {
      type: Boolean,
      default: true,
    },

    /**
     * true if footer has shadow on scroll
     */
    footerHasShadow: {
      type: Boolean,
      default: true,
    },
  },

  methods: {
    /**
     * Close handler
     * @returns {void}
     */
    closeHandler() {
      this.$emit('close');
    },
  },
};
</script>

<style lang="stylus" scoped>
  .pseudo-popup
    display flex
    flex-direction column
    min-height 100%

    &__header
      display flex
      align-items center
      flex 0 0 38px
      font-size 14px
      font-weight 500
      background var(--new-bg-04)
      padding 6px 15px 0 16px
      box-shadow none
      transition box-shadow 0.15s ease
      z-index 10

      &.ui-sticked:not(.shadow-disable)
        box-shadow 0 0 0 1px var(--new-UI-06)

      &__close
        margin-left auto

    &__body
      flex 1 1 auto
      padding 0 16px

    &__footer
      display flex
      flex 0 0 56px
      background var(--new-bg-04)
      padding 12px 16px
      box-sizing border-box
      transition box-shadow 0.15s ease
      flex-direction row-reverse
      box-shadow none
      z-index 10

      &.ui-sticked:not(.shadow-disable)
          box-shadow 0 0 0 1px var(--new-UI-06)

</style>
