<template>
  <div class="placeholder-wrapper">
    <div
      v-for="index in amount"
      :key="index"
      class="placeholder"
      :class="{'placeholder--animate': !noAnimation}"
      :style="placeholderStyle"
    >
      <div
        v-if="avatar"
        :style="avatarStyle"
        class="placeholder__avatar"
      />

      <div
        class="placeholder__name-wrapper"
      >
        <div
          class="placeholder__name"
          :style="firstNameStyle"
        />
        <div
          v-if="twoLines"
          :style="secondNameStyle"
          class="placeholder__name placeholder__name--secondary"
        />
      </div>

      <div
        v-if="rightButton"
        :style="buttonStyle"
        class="placeholder__right-button"
      />
    </div>
  </div>
</template>

<script>

const paddingFuncConst = 320;
const paddingFuncConst2 = 1.9;

const nameContainerHeight = 0.9;

export default {

  props: {
    /**
     * placeholder height
     */
    height: {
      type: Number,
      default: 36,
    },

    /**
     *  margin between placeholder's
     */
    gap: {
      type: Number,
      default: 0,
    },

    /**
     *  Primary text height (from 0 to 1)
     */
    textSize: {
      type: Number,
      default: 0.45,
    },

    /**
     *  Secondary text height (from 0 to 1)
     */
    secondaryTextSize: {
      type: Number,
      default: 0.35,
    },

    /**
     *  Number of placeholders needed
     */
    amount: {
      type: Number,
      default: 10,
    },

    /**
     * true if avatar placeholder needed
     */
    avatar: {
      type: Boolean,
      default: true,
    },

    /**
     * true if second line placeholder needed
     */
    twoLines: {
      type: Boolean,
      default: false,
    },

    /**
     * true if right button placeholder needed
     */
    rightButton: {
      type: Boolean,
      default: false,
    },

    /**
     * true if no placeholder animation needed
     */
    noAnimation: {
      type: Boolean,
      default: false,
    },
  },

  computed: {

    padding() {
      return Math.round(this.height * this.height / paddingFuncConst);
    },

    innerHeight() {
      return this.height - this.padding * 2;
    },

    placeholderStyle() {
      return {
        height: `${this.height}px`,
        padding: `${this.padding}px 0`,
        'margin-bottom': `${this.gap}px`,
      };
    },

    avatarStyle() {
      return {
        height: `${this.innerHeight}px`,
        width: `${this.innerHeight}px`,
        'margin-right': `${Math.sqrt(this.height) * paddingFuncConst2}px`,
      };
    },
    buttonStyle() {
      return {
        height: `${this.innerHeight / 2}px`,
        width: `${this.innerHeight / 2}px`,
        'margin-left': `${this.padding * 2}px`,
      };
    },
    firstNameStyle() {
      return {
        height: `${this.innerHeight * this.textSize}px`,
      };
    },
    secondNameStyle() {
      return {
        height: `${this.innerHeight * this.secondaryTextSize}px`,
        'margin-top': `${this.innerHeight * (nameContainerHeight - this.textSize - this.secondaryTextSize)}px`,
      };
    },

  },

};
</script>

<style lang="stylus" scoped>
.placeholder
  display flex
  flex-direction row
  justify-content space-between
  align-items center
  box-sizing border-box

  &--animate
    animation loading 2s ease-in-out infinite

  &__avatar
    background var(--Background-placeholder)
    border-radius 50%
    flex-shrink 0

  &__name-wrapper
    display flex
    flex-direction column
    justify-content space-between
    align-items flex-start
    flex-grow 2

  &__name
    max-width 500px
    width 100%
    border-radius 1000px
    background var(--Background-placeholder)

    &--secondary
      max-width 250px
      width 50%
      opacity 0.5

  &__right-button
    width 20px
    height 20px
    border-radius 10px
    background var(--Background-placeholder)
    flex-shrink 0

@keyframes loading {
  0% {
      opacity: 1;
    }
    30% {
      opacity: 1;
    }
  50%{
    opacity: 0.6;
  }
  60% {
      opacity: 1;
    }
    100% {
      opacity: 1;
    }
}
</style>
