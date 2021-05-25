<template>
  <div class="mini-chat">
    <pseudo-popup
      ref="pseudoPopup"
    >
      <template #header>
        Chat
      </template>

      <template #body>
        <div
          v-if="chatHistory.length === 0"
          class="mini-chat__dummy"
        >
          No messages yet
        </div>

        <div
          v-for="(item, i) in chatHistory"
          :key="i"
          :ref="i === chatHistory.length - 1 ? 'last-message' : ''"
          class="mini-chat__message"
          context-menu
        >
          <template v-if="item.user">
            <avatar
              class="mini-chat__message__avatar"
              :user-id="item.userId"
              :size="20"
            />

            <p>
              <span
                class="mini-chat__message__name"
                :style="{color: item.color}"
              >{{ item.user.name }}<span v-if="item.colon">:</span>
              </span>
              <span
                class="mini-chat__message__text"
                :style="{color: item.color}"
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
          @click="sendHandler"
        />

        <ui-input
          ref="input"
          v-model="message"
          placeholder="Type message here"
          context-menu
          @keydown.native.enter="sendHandler"
        />
      </template>
    </pseudo-popup>
  </div>
</template>

<script>

import PseudoPopup from '@components/PseudoPopup';
import { UiInput } from '@components/Form';
import UiButton from '@components/UiButton';
import Avatar from '@components/Avatar';
import { getUserAvatarUrl } from '@libs/image';
import { mapGetters } from 'vuex';
import broadcastActions from '@sdk/classes/broadcastActions';
import { escapeHtml } from '@libs/texts';
import xss from 'xss';
import linkify from 'linkifyjs/html';

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
      chatHistory: [],
      message: '',
    };
  },

  computed: {
    ...mapGetters({
      getUserById: 'users/getUserById',
      myId: 'me/getMyId',
      getConversationEvents: 'channels/getConversationEvents',
      getMiniChatMessages: 'channels/getMiniChatMessages',
      getHandUpHistory: 'channels/getHandUpHistory',

    }),
    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('miniChat');
    },
  },

  watch: {
    getMiniChatMessages() {
      this.processMessages();
    },
    getHandUpHistory() {
      this.processMessages();
    },
  },

  mounted() {
    this.processMessages();

    this.$nextTick(() => {
      this.$refs.pseudoPopup.scrollToBottom();
      this.$refs.input.focusInput();
    });
  },

  methods: {
    userAvatar: getUserAvatarUrl,

    fillUsers() {
      this.chatHistory.forEach(item => {
        this.$set(item, 'user', this.getUserById(item.userId));
        this.$set(item, 'htmlMessage', linkify(item.message, {
          defaultProtocol: 'https',
          target: '_blank',
        }));
      });
    },

    sendHandler() {
      const sanitizedMessage = escapeHtml(xss(this.message));

      if (sanitizedMessage) {
        broadcastActions.dispatch('app/sendMiniChatMessage', sanitizedMessage);
        this.$refs.pseudoPopup.scrollToBottom();
        this.message = '';
      }
    },

    processMessages() {
      this.markAllMessagesAsRead();
      this.chatHistory = this.getConversationEvents().map(i => {
        if (i.action === 'mini-chat') {
          return {
            userId: i.userId,
            colon: true,
            message: xss(i.data.message),
          };
        } else if (i.action === 'hand-up') {
          return {
            userId: i.userId,
            color: 'var(--new-UI-01)',
            message: this.$t('push.raisedHand'),
          };
        }
      });

      this.fillUsers();

      this.$nextTick(() => {
        const lastMessage = this.$refs['last-message'];

        if (lastMessage) {
          this.$refs.pseudoPopup.smartScrollToBottom(this.$refs['last-message'][0].getBoundingClientRect().height);
        }
      });
    },

    /**
     * Mark all messages as read
     * @returns {void}
     */
    markAllMessagesAsRead() {
      this.$store.dispatch('app/markMiniChatAsRead');
    },

  },
};
</script>

<style lang="stylus">

  .mini-chat
    width 320px
    height 400px

    &__dummy
      display flex
      height 100%
      justify-content center
      align-items center
      opacity 0.5

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
        white-space nowrap

      &__text
        word-break break-word

        a
          display inline
          color var(--new-UI-01)

          &:hover
            opacity 0.75

      &__avatar
        flex-shrink 0
        margin-right 8px

</style>
