<template>
  <div
    ref="root"
    class="zoom-pan"
    @wheel="wheelHandler"
  >
    <div
      ref="container"
      class="zoom-pan__container"
    >
      <slot />
    </div>
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
    };
  },

  async mounted() {
    this.resizeObserver = new ResizeObserver(this.updateSizes);
    this.resizeObserver.observe(this.$refs.root);

    this.$refs.root.addEventListener('gotpointercapture', () => {
      console.log('asdasdasdasdasasda');
    });
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

      if (e.ctrlKey) {
        const i = Math.exp(-e.deltaY / WHEEL_K);

        this.containerScale *= i;
        // (elem.offsetWidth / 2 - offsetX);
        console.log(this.rootWidth / 2 - e.offsetX);
        const { width, height } = this.$refs.root.getBoundingClientRect();

        console.log('----CX', i * (width / 2 - e.offsetX));
        console.log('----CY', i * (height / 2 - e.offsetY));

        // eslint-disable-next-line no-magic-numbers
        this.containerX = i * (this.rootWidth / 2 - e.offsetX);
        // eslint-disable-next-line no-magic-numbers
        // this.containerY += i * (height / 2 - e.offsetY);
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

      if (this.containerX <= -maxX) {
        this.containerX = -maxX;
      } else if (this.containerX >= maxX) {
        this.containerX = maxX;
      }

      /**
       * Restrict y axis
       */
      const maxY = (this.rootHeight * this.containerScale - this.rootHeight) / 2;

      if (this.containerY <= -maxY) {
        this.containerY = -maxY;
      } else if (this.containerY >= maxY) {
        this.containerY = maxY;
      }

      this.$refs.container.style.transform = 'translate(' + this.containerX + 'px, ' + this.containerY + 'px) scale(' + this.containerScale + ')';
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
</style>
