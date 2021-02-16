<template>
  <div class="pseudo-popup">
    <div
      class="pseudo-popup__header"
      :class="{'pseudo-popup__header--with-shadow': headerShadow}"
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
      class="pseudo-popup__body scroll"
    >
      <slot name="body" />
    </div>

    <div
      v-if="$slots.footer"
      class="pseudo-popup__footer"
      :class="{'pseudo-popup__footer--with-shadow': footerShadow}"
    >
      <slot name="footer" />
    </div>
  </div>
</template>

<script>
import UiButton from '@components/UiButton';
import { throttle } from 'throttle-debounce';

/**
 * Scroll throttle timeout
 * @type {number}
 */
const THROTTLE_TIMEOUT = 200;

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

  data() {
    return {
      headerShadow: false,
      footerShadow: false,
    };
  },

  mounted() {
    this.$refs.body.addEventListener('scroll', this.scrollHandler);
    window.addEventListener('resize', this.scrollHandler);

    this.scrollHandler();
  },

  beforeDestroy() {
    this.$refs.body.removeEventListener('scroll', this.scrollHandler);
    window.removeEventListener('resize', this.scrollHandler);
  },

  methods: {
    /**
     * Handle scroll event on body slot
     * @returns {void}
     */
    scrollHandler: throttle(THROTTLE_TIMEOUT, function () {
      if (this.$refs.body.scrollHeight > this.$refs.body.clientHeight) {
        this.headerShadow = this.headerHasShadow && this.$refs.body.scrollTop > 0;
        this.footerShadow = this.footerHasShadow && this.$refs.body.clientHeight < this.$refs.body.scrollHeight - this.$refs.body.scrollTop;
      } else {
        this.headerShadow = false;
        this.footerShadow = false;
      }
    }),

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
    height 100%

    &__header
      display flex
      align-items center
      flex 0 0 38px
      font-size 14px
      font-weight 500
      background var(--app-bg)
      padding 6px 15px 0 16px
      transition box-shadow 0.15s ease

      &__close
        margin-left auto

      &--with-shadow
        box-shadow 0 0 0 1px var(--new-UI-06)

    &__body
      flex 1 1 auto
      padding 0 16px

    &__footer
      display flex
      flex 0 0 56px
      background var(--app-bg)
      padding 16px
      box-sizing border-box
      transition box-shadow 0.15s ease
      flex-direction row-reverse

      &--with-shadow
        box-shadow 0 0 0 1px var(--new-UI-06)

</style>
