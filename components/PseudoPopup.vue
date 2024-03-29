<template>
  <div class="pseudo-popup">
    <div
      v-if="$slots.header"
      class="pseudo-popup__header"
      :class="{'pseudo-popup__header--with-shadow': headerShadow}"
      :style="{'background': bgColor}"
    >
      <span>
        <slot name="header" />
      </span>

      <div
        class="pseudo-popup__header__close"
        data-popover-close
        @click="closeHandler"
      >
        <span v-if="cancelText">{{ $t('techTexts.cancel') }}</span>
        <span v-else>{{ $t('techTexts.close') }}</span>
      </div>
    </div>

    <div
      v-if="$slots['custom-header']"
      class="pseudo-popup__header pseudo-popup__header--custom"
      :class="{'pseudo-popup__header--with-shadow': headerShadow}"
      :style="{'background': bgColor}"
    >
      <slot name="custom-header" />
    </div>

    <div
      v-if="$slots.body"
      ref="body"
      class="pseudo-popup__body scroll"
      :style="{'background': bgColor}"
    >
      <slot name="body" />
    </div>

    <div
      v-if="$slots['custom-body']"
      ref="body"
      class="pseudo-popup__body pseudo-popup__body--custom scroll"
      :style="{'background': bgColor}"
    >
      <slot name="custom-body" />
    </div>

    <div
      v-if="$slots.footer"
      class="pseudo-popup__footer"
      :class="{'pseudo-popup__footer--with-shadow': footerShadow}"
      :style="{'background': bgColor}"
    >
      <slot name="footer" />
    </div>

    <div
      v-if="$slots['custom-footer']"
      class="pseudo-popup__footer pseudo-popup__footer--custom"
      :class="{'pseudo-popup__footer--with-shadow': footerShadow}"
      :style="{'background': bgColor}"
    >
      <slot name="custom-footer" />
    </div>
  </div>
</template>

<script>
import { throttle } from 'throttle-debounce';

/**
 * Scroll throttle timeout
 * @type {number}
 */
const THROTTLE_TIMEOUT = 200;

export default {

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

    /**
     * bg color of PseudoPopup
     */
    bgColor: {
      type: String,
      default: null,
    },

    /**
     * true if button in header must be "Cancel" instead of "Close"
     */
    cancelText: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      headerShadow: false,
      footerShadow: false,
      isScrollable: false,
    };
  },

  watch: {
    isScrollable(val) {
      this.$emit('scrollable', val);
    },
  },

  updated() {
    this.scrollHandler();
  },

  mounted() {
    this.$refs.body.addEventListener('scroll', this.scrollHandler);
    window.addEventListener('resize', this.scrollHandler);

    this.$nextTick(() => {
      this.scrollHandler();
    });
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
      if (!this.$refs.body) {
        return;
      }

      if (this.$refs.body.scrollHeight > this.$refs.body.clientHeight) {
        this.isScrollable = true;
        if (this.headerHasShadow) {
          this.headerShadow = this.$refs.body.scrollTop > 0;
        }

        if (this.footerHasShadow) {
          this.footerShadow = this.$refs.body.clientHeight < this.$refs.body.scrollHeight - this.$refs.body.scrollTop;
        }
      } else {
        this.headerShadow = false;
        this.footerShadow = false;
        this.isScrollable = false;
      }
    }),

    /**
     * Close handler
     * @returns {void}
     */
    closeHandler() {
      this.$emit('close');
    },

    /**
     * Scroll body to bottom
     * @returns {void}
     */
    scrollToBottom() {
      this.$refs.body.style.scrollBehavior = 'initial';
      this.$refs.body.scrollTo(0, this.$refs.body.scrollHeight);
      this.$refs.body.style.scrollBehavior = 'smooth';
    },

    /**
     * Smart scroll body to bottom for Mini Chat
     * @param {boolean} n – bottom compensation
     * @returns {void}
     */
    smartScrollToBottom(n) {
      const BOTTOM_DISTANCE = 150;

      if (this.$refs.body.scrollTop > this.$refs.body.scrollHeight - this.$refs.body.clientHeight - (BOTTOM_DISTANCE + n)) {
        this.$refs.body.scrollTo(0, this.$refs.body.scrollHeight);
      }
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
      flex 0 0 44px
      font-weight 500
      background var(--Background-white)
      padding 15px 16px 11px
      box-sizing border-box
      transition box-shadow 0.15s ease

      &__close
        color var(--UI-active)
        margin-left auto
        cursor pointer

      &--custom
        flex 0 0 auto
        padding 0

      &--with-shadow
        box-shadow 0 0 0 1px var(--UI-divider-1)

    &__body
      flex 1 1 auto
      padding 0 16px

      &--custom
        padding 0

    &__footer
      display flex
      flex 0 0 56px
      background var(--Background-white)
      padding 16px
      box-sizing border-box
      transition box-shadow 0.15s ease
      flex-direction row-reverse

      &--custom
        flex 0 0 auto
        padding 0

      &--with-shadow
        box-shadow 0 0 0 1px var(--UI-divider-1)

</style>
