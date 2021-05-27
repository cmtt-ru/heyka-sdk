<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 100 100"
  >
    <ellipse
      ry="40"
      rx="40"
      cy="50"
      cx="50"
      stroke-width="8"
    />
  </svg>
</template>

<script>
export default {
  props: {
    size: {
      type: Number,
      default: 32,
    },
  },
};
</script>

<style lang="stylus" scoped>
  ellipse
    fill none
    stroke-linecap round
    stroke-dasharray 10, 1000
    animation dash-animation 2s cubic-bezier(0.8, 0.25, 0.25, 0.9) infinite, rotate-animation 2s linear infinite
    transform-origin center
    stroke var(--UI-active)

  @keyframes rotate-animation
    to
      transform rotate(360deg)

  @keyframes dash-animation
    50%
      stroke-dasharray 200
      stroke-dashoffset 0

    100%
      stroke-dasharray 245
      stroke-dashoffset -260
</style>
