<template>
  <div
    class="image"
  >
    <avatar
      class="image__avatar"
      :image="localImage"
      :size="size"
      no-color
      @load="tempSrc=null"
      @click.native="showImageModal"
    />

    <div
      v-show="!(localImage || tempSrc)"
      class="input-group"
    >
      <label
        class="label"
      >
        <svg-icon
          class="label__icon"
          name="image"
          :height="24"
          :width="24"
        />
        <input
          ref="inputImage"
          type="file"
          accept=".png, .jpg, .jpeg"
          @input="storeImageFile"
        >
      </label>
    </div>

    <img
      v-show="tempSrc"
      class="temp-image"
      alt=""
      :src="tempSrc"
      :width="size"
      :height="size"
    >

    <svg-icon
      v-if="localImage || tempSrc"
      class="upload-label"
      name="image"
      :height="24"
      :width="24"
      @click.native="clickInput"
    />
  </div>
</template>

<script>
import Avatar from '@components/Avatar';
import notify from '@libs/notify';

import broadcastEvents from '@sdk/classes/broadcastEvents';
import Modal from '@sdk/classes/Modal';

const MAX_FILE_SIZE = 5242880;
const PRETTY_MAX_FILE_SIZE = '5Mb';

export default {
  components: {
    Avatar,
  },

  props: {
    /**
       * image url
       */
    image: {
      type: String,
      default: '',
    },

    /**
       * image url
       */
    bigImage: {
      type: String,
      default: '',
    },

    /**
       * image size
       */
    size: {
      type: Number,
      default: 40,
    },

    /**
       * Make whole image inactive
       */
    disabled: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      tempSrc: null,
      localImage: null,
    };
  },

  watch: {
    image(val) {
      this.localImage = val;
    },
  },

  mounted() {
    this.localImage = this.image;
    broadcastEvents.on('imagemodal-uploaded', (fileId) => {
      this.$emit('input', fileId);
    });
  },

  beforeDestroy() {
    broadcastEvents.removeAllListeners('imagemodal-uploaded');
    broadcastEvents.removeAllListeners('imagemodal-realdelete');
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

        this.$emit('input', result.fileId);
      } catch (err) {
        this.tempSrc = null;
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
        this.tempSrc = e.target.result;
        // this.localImage = e.target.result;
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

    clickInput() {
      this.$refs.inputImage.click();
    },

    showImageModal() {
      Modal.show({
        name: 'EditImage',
        data: {
          src: this.bigImage,
        },
        onClose: (status) => {
          if (status === 'reject') {
            this.$emit('delete-image');
          }
        },
      });
    },

    clearInput() {
      this.localImage = null;
    },
  },

};
</script>

<style lang="stylus" scoped>
  .image
    position relative
    flex-shrink 0
    border-radius 50%

    &__avatar
      cursor pointer

    & .input-group
      position absolute
      width 100%
      height 100%
      top 0
      left 0

      & .label
        width 100%
        height 100%
        display flex
        flex-direction column
        justify-content center
        align-items center
        cursor pointer
        background var(--Background-darkgrey)
        color var(--UI-active)
        box-sizing border-box
        font-size 12px
        border-radius 50%
        transition 0.2s background-color ease

        &:hover
          background-color rgba(0, 0, 0, 0.6)

  .temp-image
    position absolute
    top 0
    left 0
    object-fit cover
    background var(--Background-white)
    border-radius 50%
    filter grayscale(50%) blur(2px)

  input
    pointer-events none
    user-select none
    outline 0
    opacity 0
    width 0
    height 0

  .upload-label
    width 24px
    height 24px
    padding 4px
    box-sizing border-box
    border-radius 6px
    background var(--Background-darkgrey)
    color var(--UI-active)
    position absolute
    bottom -2px
    right -2px
    cursor pointer

    &:hover
      background var(--Background-darkgrey-hover)
    &:active
      background var(--Background-darkgrey-active)

</style>
