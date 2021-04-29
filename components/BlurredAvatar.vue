<template>
  <div class="blurred-avatar">
    <img
      loading="lazy"
      :src="blurredImage"
      @load="loadHandler"
    >
  </div>
</template>

<script>

import { mapGetters } from 'vuex';
import { getUserAvatarUrl } from '@libs/image';
import { idToColor } from '@libs/utils';

export default {
  props: {
    /**
     * Image url
     */
    image: {
      type: [ String ],
      default: null,
    },

    /**
     * ID of avatar's user
     */
    userId: {
      type: [ String ],
      default: null,
    },
  },

  data() {
    return {
      loaded: false,
      blurredImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    };
  },

  computed: {
    ...mapGetters({
      userById: 'users/getUserById',
    }),

    imageUrl() {
      if (this.image) {
        return this.image;
      }

      if (this.userId && this.user) {
        return getUserAvatarUrl(this.user, this.size);
      }

      return null;
    },

    user() {
      if (this.userId && !this.image) {
        return this.userById(this.userId);
      }

      return null;
    },
  },

  async mounted() {
    if (this.imageUrl) {
      this.blurredImage = await this.blurImage(this.imageUrl);
    } else {
      this.blurredImage = this.blurColor(idToColor(this.userId));
      console.log('this.blurredImage', this.blurredImage);
    }
  },

  methods: {
    loadHandler() {
      this.loaded = true;
    },

    async blurImage(src) {
      return new Promise(resolve => {
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        let image = new Image();

        image.crossOrigin = 'anonymous';

        image.onload = () => {
          canvas.width = image.width;
          canvas.height = image.height;

          ctx.filter = 'blur(20px)';
          ctx.drawImage(image, 0, 0, image.width, image.height);

          resolve(canvas.toDataURL());

          canvas = null;
          ctx = null;
          image.onload = null;
          image = null;
        };

        image.src = src;
      });
    },

    blurColor(color) {
      let canvas = document.createElement('canvas');
      let ctx = canvas.getContext('2d');

      canvas.width = 128;
      canvas.height = 128;

      ctx.filter = 'blur(20px)';
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const result = canvas.toDataURL();

      canvas = null;
      ctx = null;

      return result;
    },
  },
};
</script>

<style lang="stylus" scoped>
  .blurred-avatar
    width 100%
    height 100%

    img
      display block
      width 100%
      height 100%
      opacity 0.3
</style>
