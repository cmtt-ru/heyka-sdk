<template>
  <div
    role="dialog"
    :aria-label="label"
    aria-modal="true"
    class="modal"
    :class="{ 'modal--centered': centered }"
  >
    <div
      class="modal__backdrop"
      @click="$emit('close')"
    >
      <slot name="backdrop"/>
    </div>
    <slot/>
  </div>
</template>

<script>
export default {
  props: {
    centered: {
      default: true,
      type: Boolean,
    },
    focusElement: {
      default: null,
      type: Object,
    },
    label: {
      default: '',
      type: String,
    },
  },

  mounted() {
    const close = (e) => {
      const ESC = 27;
      if (e.keyCode !== ESC) return;
      this.$emit('close');
    };
    // Close the modal when the
    // user presses the ESC key.
    document.addEventListener('keyup', close);
    // Activate the modal when the component is mounted.
    this.activate();

  },

  destroyed(){
    document.removeEventListener('keyup', close);
    this.deactivate();
  },

  methods: {
    activate() {
      // Prevent the background to be scrollable.
      this.disableScrolling();
    },

    async deactivate() {
      this.enableScrolling();
    },

    // Disable scrolling on all devices (including iOS).
    disableScrolling() {
      this.scrollPosition = window.pageYOffset;

      const $body = document.querySelector('body');
      $body.style.overflow = 'hidden';
      $body.style.position = 'fixed';
      $body.style.top = `-${this.scrollPosition}px`;
      $body.style.width = '100%';
    },

    enableScrolling() {
      const $body = document.querySelector('body');
      $body.style.removeProperty('overflow');
      $body.style.removeProperty('position');
      $body.style.removeProperty('top');
      $body.style.removeProperty('width');

      window.scrollTo(0, this.scrollPosition);
    },

  },

};
</script>

<style lang="stylus" scoped>
.modal 
  position fixed
  top 0
  right 0
  bottom 0
  left 0


.modal--centered 
  display flex
  justify-content center
  align-items center


.modal__backdrop 
  position absolute
  width 100%
  height 100%
  z-index -1

</style>
