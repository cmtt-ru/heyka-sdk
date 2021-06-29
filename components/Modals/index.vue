<template>
  <transition name="modal-background">
    <div
      v-show="modalVisible"
      role="dialog"
      aria-modal="true"
      class="modal"
    >
      <div
        class="modal__backdrop"
        @click="close"
      />
      <transition-group
        tag="div"
        class="modal-container"
        name="modal"
      >
        <modal-wrapper
          v-for="(modal, index) in modals"
          :key="modal.id"
          class="modal-wrapper"
          :class="{'modal-wrapper--visible': index>=modalsAmount-1}"
          :modal="modal"
          @confirm="$emit('confirm', $event)"
          @reject="$emit('reject')"
          @close="$emit('close')"
        />
      </transition-group>
    </div>
  </transition>
</template>

<script>
import ModalWrapper from './ModalWrapper';

import Modal from '@sdk/classes/Modal';

export default {
  components: {
    ModalWrapper,
  },

  data() {
    return {
      scrollPosition: null,
      modalVisible: false,
    };
  },

  computed: {

    /**
     * Get all modals from store
     * @returns {array}
    */
    modals() {
      return this.$store.state.app.modals;
    },

    /**
     * Get number of modals from store
     * @returns {array}
    */
    modalsAmount() {
      return this.modals.length;
    },

  },

  watch: {
    modalsAmount(val) {
      if (val === 0) {
        this.modalVisible = false;
        this.$nextTick(() => {
          this.deactivate();
        });
      } else {
        this.modalVisible = true;
        this.$nextTick(() => {
          this.activate();
        });
      }
    },

    $route() {
      this.modalsAmount && this.close();
    },
  },

  mounted() {
    Modal.setModalComponent(this);
  },

  beforeDestroy() {
    document.removeEventListener('keyup', this.escHandler);
    this.deactivate();
  },

  methods: {
    escHandler(e) {
      const ESC = 27;

      if (e.keyCode !== ESC) {
        return;
      }
      this.close();
    },

    activate() {
      // Close the modal when the
      // user presses the ESC key.
      document.addEventListener('keyup', this.escHandler);
      this.disableScrolling();
      // Focus the first focusable element in the dialog.
      this.focusFirstDescendant();
    },

    async deactivate() {
      document.removeEventListener('keyup', this.escHandler);
      this.enableScrolling();
    },

    // Disable scrolling on all devices (including iOS).
    disableScrolling() {
      this.scrollPosition = window.pageYOffset;

      const body = document.querySelector('body');

      body.style.overflowY = 'hidden';
      body.style.position = 'fixed';
      body.style.top = `-${this.scrollPosition}px`;
      body.style.width = '100%';
    },

    enableScrolling() {
      const body = document.querySelector('body');

      body.style.removeProperty('overflow-y');
      body.style.removeProperty('position');
      body.style.removeProperty('top');
      body.style.removeProperty('width');

      window.scrollTo({
        top: this.scrollPosition,
        behavior: 'instant',
      });
    },

    focusFirstDescendant() {
      const focusable = this.$el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');

      if (focusable[0] && focusable[0].focus) {
        focusable[0].focus();
      }
    },

    close() {
      this.$emit('close');
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
  display flex
  justify-content center
  align-items center
  z-index 100
  opacity 1

.modal__backdrop
  position absolute
  width 100%
  height 100%
  background-color rgba(0, 0, 0, 0.28)

.modal-container
  z-index 1000
  position relative
  display flex
  width 100vw
  height 100vh
  align-items center
  justify-content center
  pointer-events none

$ANIM = 330ms

.modal-wrapper
  position absolute
  opacity 0
  pointer-events none
  transform scale(1.1)
  transition opacity $ANIM ease, transform $ANIM ease

  @media $mobile
    bottom 16px

  &--visible
    opacity 1
    transform scale(1)
    pointer-events auto

.modal-background-enter
  opacity 0

.modal-background-enter-to
  pointer-events none
  transition opacity $ANIM ease

.modal-background-leave
  opacity 1

.modal-background-leave-to
  opacity 0
  transition opacity $ANIM ease

.modal-enter
  opacity 0
  transform scale(1.1)

.modal-enter-to
  pointer-events none
  opacity 1
  transform scale(1)
  transition opacity $ANIM ease, transform $ANIM ease

.modal-leave
  opacity 1
  transform scale(1)

.modal-leave-to
  opacity 0
  transform scale(1.1)
  transition opacity $ANIM ease, transform $ANIM ease
</style>
