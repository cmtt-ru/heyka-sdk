<template>
  <div class="modal-wrapper">
    <div class="body">
      <input
        ref="inputImage"
        type="file"
        accept=".png, .jpg, .jpeg"
        @input="storeImageFile"
      >
      <img
        v-popover.mouse.right.click="{name: 'ImageMore'}"
        :src="localImage"
        class="img"
      >
      <ui-button
        :type="7"
        class="img__button img__button--close"
        size="small"
        icon="close"
        @click="$emit('close')"
      />
      <ui-button
        v-popover.click="{name: 'ImageMore'}"
        :type="7"
        class="img__button img__button--more"
        size="small"
        icon="more"
      />
    </div>
  </div>
</template>

<script>
import UiButton from '@components/UiButton';

import notify from '@libs/notify';
import broadcastEvents from '@sdk/classes/broadcastEvents';

const MAX_FILE_SIZE = 5242880;
const PRETTY_MAX_FILE_SIZE = '5Mb';

export default {
  components: {
    UiButton,
  },

  props: {
    /**
      * Inner data
    */
    data: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      localImage: null,
    };
  },

  computed: {
  },

  mounted() {
    this.localImage = this.data.src;
    broadcastEvents.on('imagemodal-edit', () => {
      this.$refs.inputImage.click();
    });
    broadcastEvents.on('imagemodal-delete', () => {
      this.$emit('reject');
    });
  },

  beforeDestroy() {
    broadcastEvents.removeAllListeners('imagemodal-edit');
    broadcastEvents.removeAllListeners('imagemodal-delete');
  },

  methods: {
    /**
       * Trigger after file was selected
       * @param {object} event - input event
       * @returns {void}
       */
    async storeImageFile(event) {
      if (event.target.files.length !== 1) {
        return;
      }
      if (event.target.files[0].size > MAX_FILE_SIZE) {
        this.tooBigImageAlert();

        return;
      }
      const formData = new FormData();

      formData.append('image', event.target.files[0]);

      try {
        this.localDisplayImage(event.target.files[0]);
        const result = await this.$API.user.image(formData);

        broadcastEvents.dispatch('imagemodal-uploaded', result.fileId);
      } catch (err) {
        console.log(err);
      }
    },

    /**
       * Show newly selected file locally - even before we uploaded it to servers
       * @param {File} file - image to display
       * @returns {void}
       */
    localDisplayImage(file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        this.localImage = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    /**
       * Show "file too big" notification if... file is too big
       * @returns {void}
       */
    async tooBigImageAlert() {
      notify(`${this.$t('workspace.userSettings.bigImage')} ${PRETTY_MAX_FILE_SIZE}`, {
        lifespan: 5000,
        icon: 'warning',
      });
    },
  },

};
</script>

<style lang="stylus" scoped>
// @import 'default.styl'
.body
  position relative
  display flex
  border-radius 4px
  overflow hidden
  position relative

  &:after
    content ''
    position absolute
    top 0
    left 0
    right 0
    bottom 0
    background transparent
    border 1px solid rgba(255, 255, 255, 0.1)
    pointer-events none
    border-radius 4px

.img
  max-width calc(100vw - 24px)
  max-height calc(100vh - 24px)
  min-height 128px
  min-width 128px
  object-fit contain
  background-color var(--Background-darkgrey)

  &__button
    position absolute
    top 4px
    right 4px
    color var(--Text-primary)
    background rgba(0,0,0,0.2)
    width 24px
    height 24px
    border-radius 50%

    &:hover
      background rgba(0,0,0,0.15)
    &:active
      background rgba(0,0,0,0.3)

    &--more
      top initial
      bottom 4px

input
  pointer-events none
  user-select none
  outline 0
  opacity 0
  width 0
  height 0
</style>
