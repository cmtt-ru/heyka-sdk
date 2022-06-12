<template>
  <div
    ref="root"
    class="zoom-pan"
    @wheel="wheelHandler"
    @mousedown="mouseDownHandler"
    @mousemove="mouseMoveHandler"
  >
    <div
      ref="container"
      class="zoom-pan__container"
    >
      <slot />
    </div>
    <!--    <div class="dot" />-->
  </div>
</template>

<script>

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const WHEEL_K = 100;
const MAX_DELTA = 1.2;
const MIN_DELTA = 0.8;
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

      isMouseDown: false,
      downX: 0,
      downY: 0,
    };
  },

  async mounted() {
    this.resizeObserver = new ResizeObserver(this.updateSizes);
    this.resizeObserver.observe(this.$refs.root);

    document.addEventListener('mouseup', this.mouseUpHandler);
  },

  beforeDestroy() {
    this.resizeObserver.unobserve(this.$refs.root);
    document.removeEventListener('mouseup', this.mouseUpHandler);
  },

  methods: {
    /**
     * Mouse wheel event handler
     * @param {WheelEvent} e — wheel event
     * @returns {void}
     */
    wheelHandler(e) {
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        let i = Math.exp(-e.deltaY / WHEEL_K);

        i = Math.min(Math.abs(i), MAX_DELTA) * Math.sign(i);
        i = Math.max(Math.abs(i), MIN_DELTA) * Math.sign(i);

        if (this.containerScale * i < MAX_ZOOM && this.containerScale * i > MIN_ZOOM) {
          const mouseX2 = this.mouseX - this.containerX + this.rootWidth * (this.containerScale - 1) / 2;
          const mouseY2 = this.mouseY - this.containerY + this.rootHeight * (this.containerScale - 1) / 2;

          this.containerX = this.rootWidth * (this.containerScale * i - 1) / 2 + this.mouseX - mouseX2 * i;
          this.containerY = this.rootHeight * (this.containerScale * i - 1) / 2 + this.mouseY - mouseY2 * i;
        }

        this.containerScale *= i;
      } else {
        this.containerX += e.deltaX * DIRECTION;
        this.containerY += e.deltaY * DIRECTION;
      }
      this.zoomAndPan();
    },

    /**
     * Restrict axis and translate container
     * @returns {void}
     */
    zoomAndPan() {
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

    mouseDownHandler(e) {
      this.isMouseDown = true;
      this.downX = e.offsetX;
      this.downY = e.offsetY;
    },

    mouseUpHandler(e) {
      this.isMouseDown = false;
    },

    mouseMoveHandler(e) {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;

      if (this.isMouseDown && (e.ctrlKey || e.metaKey)) {
        const dx = this.downX - e.offsetX;
        const dy = this.downY - e.offsetY;

        this.containerX -= dx;
        this.containerY -= dy;

        this.zoomAndPan();
      }
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
      transform-origin center

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
