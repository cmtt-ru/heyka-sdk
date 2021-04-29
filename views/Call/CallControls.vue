<template>
  <div
    v-if="me"
    class="call-controls"
    :class="{'call-controls--row': row}"
  >
    <div

      class="call-controls__row"
    >
      <avatar
        class="call-controls__avatar"
        :class="{'call-controls__avatar--speaking': speakingUser.speaking}"
        :user-id="speakingUser.id"
        :size="44"
        :border-radius="11"
      />

      <div
        class="call-controls__col"
      >
        <p class="call-controls__user-name">
          {{ speakingUser.name }}
        </p>

        <div class="call-controls__channel">
          <transition
            :name="transitionName"
            mode="out-in"
          >
            <svg-icon
              :key="channelIcon"
              :name="channelIcon"
              size="large"
            />
          </transition>
          <transition
            :name="transitionName"
            mode="out-in"
          >
            <span :key="channelName">{{ channelName }}</span>
          </transition>
        </div>
      </div>
    </div>

    <div class="call-controls__row call-controls__row--controls">
      <call-buttons :buttons="buttons" />
    </div>
  </div>
</template>

<script>
import CallButtons from './CallButtons';
import Avatar from '@components/Avatar';
import { mapGetters } from 'vuex';

const LAST_USER_INTERVAL = 4000;

let lastUserTimer = null;

export default {
  components: {
    CallButtons,
    Avatar,
  },

  props: {
    /**
     * Arrange buttons in row
     */
    row: {
      type: Boolean,
      default: false,
    },

    /**
     * Buttons list
     * @example ['screen', 'camera', 'speakers', 'microphone', 'grid', 'leave']
     */
    buttons: {
      type: Array,
      default: function () {
        return ['microphone', 'camera', 'screen', 'speakers', 'leave'];
      },
    },
  },

  data() {
    return {
      lastSpeakingUser: null,
      channelIcon: 'channel',
      channelName: '',
      transitionName: 'none',
    };
  },

  computed: {
    ...mapGetters({
      me: 'myInfo',
      getSpeakingUser: 'getSpeakingUser',
      selectedChannel: 'myChannel',
      userById: 'users/getUserById',
      userAvatar: 'users/getUserAvatarUrl',
      miniChatLastMessageTimestamp: 'channels/getMiniChatLastMessageTimestamp',
      miniChatMessages: 'channels/getMiniChatMessages',
    }),

    /**
     * Speaking user
     * @return {string}
     */
    speakingUser() {
      if (this.getSpeakingUser) {
        return {
          ...this.getSpeakingUser,
          ...this.userById(this.getSpeakingUser.userId),
        };
      }

      if (this.me.user) {
        return this.me.user;
      }

      return '';
    },

    /**
     * Selected channel name
     * @return {string}
     */
    selectedChannelName() {
      if (this.selectedChannel) {
        return this.selectedChannel.name;
      }

      return '';
    },

    /**
     * Last user in channel
     * @returns {object|boolean}
     */
    lastUserInChannel() {
      if (this.selectedChannel && this.selectedChannel.users.length > 0) {
        return this.selectedChannel.users[this.selectedChannel.users.length - 1].userId;
      }

      return false;
    },
  },

  watch: {
    lastUserInChannel() {
      if (!this.lastUserInChannel) {
        return;
      }

      if (this.me.user.id !== this.lastUserInChannel) {
        this.channelName = this.userById(this.lastUserInChannel).name;
        this.channelIcon = 'connect';

        clearTimeout(lastUserTimer);

        lastUserTimer = setTimeout(() => {
          this.channelName = this.selectedChannel?.name;
          this.channelIcon = 'channel';
        }, LAST_USER_INTERVAL);
      }
    },

    selectedChannelName() {
      this.channelName = this.selectedChannelName;
    },

    miniChatLastMessageTimestamp(val) {
      if (!this.miniChatMessages.length) {
        return;
      }

      const lastMessage = this.miniChatMessages.slice(-1)[0];

      if (this.me.user.id !== lastMessage.userId) {
        this.channelName = this.userById(lastMessage.userId).name;
        this.channelIcon = 'chat';

        clearTimeout(lastUserTimer);

        lastUserTimer = setTimeout(() => {
          this.channelName = this.selectedChannel?.name;
          this.channelIcon = 'channel';
        }, LAST_USER_INTERVAL);
      }
    },
  },

  mounted() {
    this.channelName = this.selectedChannelName;

    setTimeout(() => {
      this.enableTransitions();
    }, LAST_USER_INTERVAL);
  },

  methods: {
    /**
     * Enable transitions
     * @returns {void}
     */
    enableTransitions() {
      this.transitionName = 'fade';
    },
  },
};
</script>

<style lang="stylus" scoped>
  .call-controls
    display flex
    flex-direction column
    padding 12px

    &__row
      display flex
      margin-bottom 12px

      &--controls
        flex-shrink 0

      &:last-child
        margin-bottom 0

    &__col
      margin-left 12px

    &__avatar
      display block
      box-sizing border-box
      flex-shrink 0
      position relative

      &--speaking:after
        content ''
        position absolute
        top 0
        bottom 0
        left 0
        right 0
        border-radius 11px
        border 2px solid #51C362
        z-index 2

    &__user-name
      margin-top 4px
      font-size 15px
      line-height 18px
      overflow hidden
      text-overflow ellipsis
      white-space nowrap

    &__channel
      display flex
      color rgba(255,255,255,0.6) //! поменять, когда появится цвет в дизайне
      align-items center
      line-height 18px
      margin-left -4px
      margin-top 2px

      svg
        flex-shrink 0
        color var(--new-signal-02)

      span
        min-width 0
        overflow hidden
        text-overflow ellipsis
        white-space nowrap

    &__button
      margin-right 8px
      flex-shrink 0

      &--disconnect
        color var(--color-0)

      &:last-child
        margin-right 0

    &--row
      flex-direction row
      justify-content center

      .call-controls__row
        margin-bottom 0

        &--controls
          margin-left 12px

  .fade-enter-active,
  .fade-leave-active
    transition all 0.25s

  .fade-enter,
  .fade-leave-to
    opacity 0

.call-controls--row .call-controls__col
  display none

@media screen and (min-width: 499px)
  .call-controls__row
    flex-grow 3

    &--controls
      flex-grow 0

  .call-controls--row .call-controls__col
    display initial

</style>
