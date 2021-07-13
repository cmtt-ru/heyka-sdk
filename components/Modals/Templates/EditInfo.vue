<template>
  <div class="modal-wrapper">
    <div class="header">
      {{ data.header }}
    </div>

    <div
      v-if="data.avatar!==undefined"
      class="avatar-wrapper"
    >
      <ui-image-web
        ref="avatarInput"
        :image="avatarUrl(data.avatar, 88)"
        class="avatar"
        :size="88"
        @input="setNewAvatar"
      />
      <div class="avatar__text-wrapper">
        <div class="avatar__text">
          {{ $t('modal.common.recommendAvatarSize') }}
        </div>
        <div class="avatar__link-wrapper">
          <div
            class="avatar__link"
            @click="selectAvatar"
          >
            {{ $t('techTexts.upload') }}
          </div>
          <div
            class="avatar__link avatar__link--warning"
            @click="deleteImage"
          >
            {{ $t('techTexts.delete') }}
          </div>
        </div>
      </div>
    </div>

    <ui-form
      @submit="submit"
    >
      <div v-if="name!==undefined">
        <div class="input-label">
          {{ $t('modal.common.name') }}
        </div>
        <ui-input
          v-model="name"
          required
          :minlength="3"
        />
      </div>

      <div class="buttons">
        <ui-button
          :type="1"
          submit
        >
          {{ $t('modal.common.saveChanges') }}
        </ui-button>
      </div>
    </ui-form>
  </div>
</template>

<script>
import UiButton from '@components/UiButton';
import { UiForm, UiInput, UiImageWeb } from '@components/Form';

import { getUserAvatarUrl } from '@libs/image';

export default {
  components: {
    UiButton,
    UiForm,
    UiInput,
    UiImageWeb,
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
      name: undefined,
      avatarFileId: undefined,
    };
  },

  mounted() {
    if (this.data.name) {
      this.name = this.data.name;
    }
  },

  methods: {
    selectAvatar() {
      this.$refs.avatarInput.clickInput();
    },

    /**
     * update avatar with mew image file id
     * @param {string} fileId - new image file id from uploader
     * @returns {void}
     */
    setNewAvatar(fileId) {
      console.log(fileId);
      this.avatarFileId = fileId;
    },

    async deleteImage() {
      this.$refs.avatarInput.clearInput();
      this.avatarFileId = null;
    },

    submit() {
      const result = {};

      if (this.name !== undefined) {
        result.name = this.name;
      }
      if (this.avatarFileId !== undefined) {
        result.avatarFileId = this.avatarFileId;
      }
      this.$emit('confirm', result);
    },

    /**
     * Avatar url
     */
    avatarUrl: getUserAvatarUrl,
  },

};
</script>

<style lang="stylus" scoped>
@import 'default.styl'

.avatar-wrapper
  padding 0
  box-sizing border-box
  display flex
  flex-direction row
  align-items center
  justify-content flex-start

  & .avatar
    margin-right 16px
    flex-shrink 0

    &__text-wrapper
      display flex
      flex-direction column
      align-items flex-start
      justify-content center

    &__text
      font-size 14px
      line-height 20px
      color var(--new-UI-03)
      padding-bottom 8px

    &__link-wrapper
      display flex
      flex-direction row

    &__link
      font-weight 500
      font-size 16px
      line-height 18px
      color var(--new-UI-01)
      cursor pointer

      &--warning
        color var(--new-signal-03)
        margin-left 16px

</style>
