<template>
  <div class="modal-wrapper">
    <div class="header">
      {{ data.header }}
    </div>

    <div
      class="avatar-wrapper"
    >
      <avatar
        v-if="data.avatar!==undefined"
        ref="avatarInput"
        :image="avatarUrl(data.avatar, 88)"
        class="avatar"
        :size="88"
      />
      <div class="avatar__text-wrapper">
        <div class="avatar__text">
          {{ data.body }}
        </div>
      </div>
    </div>

    <div class="buttons">
      <ui-button
        :type="2"
        @click="$emit('reject')"
      >
        {{ $t('techTexts.cancel') }}
      </ui-button>
      <ui-button
        :type="1"
        @click="$emit('confirm')"
      >
        {{ $t('techTexts.accept') }}
      </ui-button>
    </div>
  </div>
</template>

<script>
import UiButton from '@components/UiButton';
import Avatar from '@components/Avatar';

import { getUserAvatarUrl } from '@libs/image';

export default {
  components: {
    UiButton,
    Avatar,
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

  methods: {
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
      font-size 16px
      line-height 20px
      padding-bottom 8px
</style>
