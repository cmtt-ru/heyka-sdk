<template>
  <div class="mini-chat">
    <pseudo-popup>
      <template #header>
        Chat
      </template>

      <template #body>
        <div
          v-for="(item, i) in chatHistory"
          :key="i"
          class="mini-chat__message"
        >
          <template v-if="item.user">
            <avatar
              class="mini-chat__message__avatar"
              :user-id="item.userId"
              :image="userAvatar(item.user, 20)"
              :size="20"
            />

            <p>
              <span class="mini-chat__message__name">{{ item.user.name }}:</span>
              <span
                class="mini-chat__message__text"
                v-html="item.htmlMessage"
              />
            </p>
          </template>
        </div>
      </template>

      <template #footer>
        <ui-button
          class="mini-chat__send"
          :type="8"
          size="large"
          icon="forward"
        />

        <ui-input
          placeholder="Type message here"
        />
      </template>
    </pseudo-popup>
  </div>
<!--  <div class="mini-chat">-->
<!--    <div class="mini-chat__header">-->
<!--      header-->
<!--    </div>-->

<!--    <div class="mini-chat__messages">-->
<!--      chat-->
<!--    </div>-->

<!--    <div class="mini-chat__footer">-->
<!--      footer-->
<!--    </div>-->
<!--  </div>-->
</template>

<script>

import PseudoPopup from '@components/PseudoPopup';
import { UiInput } from '@components/Form';
import UiButton from '@components/UiButton';
import Avatar from '@components/Avatar';
import { getUserAvatarUrl } from '@libs/image';
import { mapGetters } from 'vuex';

export default {
  components: {
    Avatar,
    PseudoPopup,
    UiInput,
    UiButton,
  },

  props: {

  },

  data: () => {
    return {
      chatHistory: [
        {
          userId: '4042dab6-18ca-4965-8190-dd5601b03a1b',
          message: 'Will you two be down in San Fransico any time soon?',
        },
        {
          userId: '4f37cf73-11e3-4a28-9eb0-d21173ea19b5',
          message: 'Excited for this new album!',
        },
        {
          userId: 'bdf89c14-06ea-4a9f-a01d-b48f8e66d041',
          message: 'Yeah, true 🤟🏻',
        },
        {
          userId: '4f37cf73-11e3-4a28-9eb0-d21173ea19b5',
          message: 'Try this https://yandex.ru',
        },
        {
          userId: '4042dab6-18ca-4965-8190-dd5601b03a1b',
          message: 'Will you two be down in San Fransico any time soon?',
        },
        {
          userId: '4f37cf73-11e3-4a28-9eb0-d21173ea19b5',
          message: 'Excited for this new album!',
        },
        {
          userId: 'bdf89c14-06ea-4a9f-a01d-b48f8e66d041',
          message: 'Yeah, true 🤟🏻',
        },
        {
          userId: '4f37cf73-11e3-4a28-9eb0-d21173ea19b5',
          message: 'Try this https://yandex.ru',
        },
        {
          userId: '4042dab6-18ca-4965-8190-dd5601b03a1b',
          message: 'Will you two be down in San Fransico any time soon?',
        },
        {
          userId: '4f37cf73-11e3-4a28-9eb0-d21173ea19b5',
          message: 'Excited for this new album!',
        },
        {
          userId: 'bdf89c14-06ea-4a9f-a01d-b48f8e66d041',
          message: 'Yeah, true 🤟🏻',
        },
        {
          userId: '4f37cf73-11e3-4a28-9eb0-d21173ea19b5',
          message: 'Try this https://yandex.ru',
        },
        {
          userId: '4042dab6-18ca-4965-8190-dd5601b03a1b',
          message: 'Will you two be down in San Fransico any time soon?',
        },
        {
          userId: '4f37cf73-11e3-4a28-9eb0-d21173ea19b5',
          message: 'Excited for this new album!',
        },
        {
          userId: 'bdf89c14-06ea-4a9f-a01d-b48f8e66d041',
          message: 'Yeah, true 🤟🏻',
        },
        {
          userId: '4f37cf73-11e3-4a28-9eb0-d21173ea19b5',
          message: 'Try this https://yandex.ru',
        },
      ],
    };
  },

  computed: {
    ...mapGetters({
      getUserById: 'users/getUserById',
    }),
    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('miniChat');
    },
  },

  mounted() {
    this.fillUsers();
  },

  methods: {
    userAvatar: getUserAvatarUrl,

    fillUsers() {
      this.chatHistory.forEach(item => {
        this.$set(item, 'user', this.getUserById(item.userId));
        this.$set(item, 'htmlMessage', this.linkify(item.message));
      });

      console.log('-----', this.chatHistory);
    },

    linkify(text) {
      const URLMatcher = /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\\/%=~_|$])/igm;

      return text.replace(URLMatcher, match => `<a href="${match}">${match}</a>`);
    },
  },
};
</script>

<style lang="stylus">

  .mini-chat
    position fixed
    top 40px
    left 40px
    width 320px
    height 400px
    background #fff
    border-radius 12px
    color #000
    overflow hidden

    &__send
      color var(--new-UI-01)
      margin-right -14px

    &__message
      display flex
      margin-bottom 12px

      p
        font-size 14px
        line-height 20px
        font-weight 400

        *
          user-select text !important

      &__name
        font-weight 500
        margin-right 4px

      &__text
        a
          display inline
          color var(--new-UI-01)

          &:hover
            opacity 0.75

      &__avatar
        flex-shrink 0
        margin-right 8px

</style>
