<template>
  <div
    ref="root"
    class="zoom-pan"
    @wheel="wheelHandler"
    @mousemove="mouseMoveHandler"
  >
    <div
      ref="container"
      class="zoom-pan__container"
    >
      <slot />
    </div>
    <div class="dot" />
  </div>
</template>

<script>

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const WHEEL_K = 100;
const DIRECTION = -1;

export default {
  data() {
    return {
      rootWidth: 0,
      rootHeight: 0,

      containerX: 0,
      containerY: 0,
      containerScale: 1,

      mouseX: 0,
      mouseY: 0,
    };
  },

  async mounted() {
    this.resizeObserver = new ResizeObserver(this.updateSizes);
    this.resizeObserver.observe(this.$refs.root);
  },

  beforeDestroy() {
    this.resizeObserver.unobserve(this.$refs.root);
  },

  methods: {
    /**
     * Mouse wheel event handler
     * @param {WheelEvent} e — wheel event
     * @returns {void}
     */
    wheelHandler(e) {
      e.preventDefault();

      // console.log(this.mouseX / this.rootWidth);

      if (e.ctrlKey) {
        const i = Math.exp(-e.deltaY / WHEEL_K);

        this.containerScale *= i;

        // eslint-disable-next-line no-unused-vars
        // const { width, height, x, y } = this.$refs.root.getBoundingClientRect();

        if (this.containerScale < MAX_ZOOM && this.containerScale > MIN_ZOOM) {
          // this.containerX = (this.containerScale - 1) * (this.rootWidth / 2 - this.mouseX);
          // this.containerY = (this.containerScale - 1) * (this.rootHeight / 2 - this.mouseY);

          this.containerX += ((i - 1) * (((this.rootWidth / 2 - this.mouseX) * this.containerScale) - this.containerX));
          this.containerY += ((i - 1) * (((this.rootHeight / 2 - this.mouseY) * this.containerScale) - this.containerY));
        }
      } else {
        this.containerX += e.deltaX * DIRECTION;
        this.containerY += e.deltaY * DIRECTION;
      }

      /**
       * Restrict scale
       */
      if (this.containerScale >= MAX_ZOOM) {
        this.containerScale = MAX_ZOOM;
      } else if (this.containerScale <= MIN_ZOOM) {
        this.containerScale = MIN_ZOOM;
      }

      /**
       * Restrict x axis
       */
      const maxX = (this.rootWidth * this.containerScale - this.rootWidth) / 2;
      // const maxX = (this.containerScale - 1) * e.offsetX;

      if (this.containerX <= -maxX) {
        this.containerX = -maxX;
      } else if (this.containerX >= maxX) {
        this.containerX = maxX;
      }

      /**
       * Restrict y axis
       */
      const maxY = (this.rootHeight * this.containerScale - this.rootHeight) / 2;
      // const maxY = (this.containerScale - 1) * e.offsetY;

      if (this.containerY <= -maxY) {
        this.containerY = -maxY;
      } else if (this.containerY >= maxY) {
        this.containerY = maxY;
      }

      this.$refs.container.style.transform = 'translate(' + this.containerX + 'px, ' + this.containerY + 'px) scale(' + this.containerScale + ')';
    },

    mouseMoveHandler(e) {
      this.mouseX = e.offsetX;
      this.mouseY = e.offsetY;
    },

    /**
     * Update root element's width & height
     * @returns {void}
     */
    updateSizes() {
      const { width, height } = this.$refs.root.getBoundingClientRect();

      this.rootWidth = width;
      this.rootHeight = height;
    },
  },
};
</script>

<style lang="stylus" scoped>
  .zoom-pan
    position relative
    overflow hidden

    &__container
      position absolute
      width 100%
      height 100%

    .dot
      position absolute
      left 50%
      top 50%
      width 4px
      height 4px
      margin -2px 0 0 -2px
      border-radius 100%
      background red
      opacity 0.5
      pointer-events none
</style>
