<template>
  <div
    class="switch"
    :class="{'switch--disabled': disabled}"
    @click="ClickHandler()"
  >
    <div
      v-textfade
      class="switch__text"
    >
      {{ text }}
    </div>
    <div
      class="switch__toggle"
      :class="{'switch__toggle--checked': value}"
    />
  </div>
</template>

<script>

export default {

  props: {
    /**
     * Text before switch
     */
    text: {
      type: String,
      default: null,
    },

    /**
     * switch's initial state
     */
    value: {
      type: Boolean,
      default: false,
    },

    /**
     * Make whole switch inactive
     */
    disabled: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    /**
     * Local copy of toggle's state
     * @returns {string} value
     */
    localValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },
  },

  methods: {
    /**
     * Detect switch click. We change state to opposite and emit 'input' event
     * @returns {void}
     */
    ClickHandler() {
      this.localValue = !this.localValue;
    },
  },

};
</script>

<style lang="stylus" scoped>
.switch
  display flex
  flex-direction row
  justify-content space-between
  align-items center
  width 100%
  height 18px
  border-radius 4px
  cursor pointer
  overflow hidden

  &--disabled
    opacity 0.5
    pointer-events none

  &__toggle
    box-sizing border-box
    position relative
    width 32px
    height 18px
    background-color var(--new-UI-05)
    border-radius 9px
    z-index 1
    flex-shrink 0
    transition all 0.28s cubic-bezier(0.4, 0, 0.2, 1)
    transition-property background-color

    &:after
      content ''
      box-sizing border-box
      position absolute
      top 2px
      right 16px
      width 14px
      height 14px
      background-color var(--new-white)
      border-radius 12px
      z-index 2
      transition all 0.28s cubic-bezier(0.4, 0, 0.2, 1)
      transition-property right

    &--checked
      background-color var(--new-UI-01)

      &:after
        right 2px

  &__text
    margin-right 8px

</style>
