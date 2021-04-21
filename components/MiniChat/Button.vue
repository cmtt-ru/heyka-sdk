<template>
  <div class="mini-chat-button">
    <transition name="badge-show">
      <div
        v-if="miniChatBadge"
        :key="miniChatBadgeKey"
        class="mini-chat-button__badge"
      />
    </transition>

    <ui-button
      v-popover.click="{name: 'MiniChat'}"
      popover
      :type="7"
      :height="44"
      icon="chat"
    />
  </div>
</template>

<script>
import UiButton from '@components/UiButton';
import { mapGetters } from 'vuex';

export default {
  components: {
    UiButton,
  },

  data() {
    return {
      miniChatBadge: false,
      miniChatBadgeKey: 0,
    };
  },

  computed: {
    ...mapGetters({
      hasMiniChatNewMessages: 'channels/hasMiniChatNewMessages',
      miniChatLastMessageTimestamp: 'channels/getMiniChatLastMessageTimestamp',
    }),
  },

  watch: {
    hasMiniChatNewMessages(val) {
      this.miniChatBadge = val;
    },

    miniChatLastMessageTimestamp(val) {
      this.miniChatBadgeKey = val;
    },
  },

  async mounted() {
    this.miniChatBadge = this.hasMiniChatNewMessages;
    this.miniChatBadgeKey = this.miniChatLastMessageTimestamp;
  },
};
</script>

<style lang="stylus" scoped>
.mini-chat-button
  position relative

  .ui-button
    border-radius 11px

  &__badge
    position absolute
    width 11px
    height 11px
    top -3px
    right -3px
    border-radius 11px
    background var(--new-signal-03)

.badge-show-enter-active
  transition transform .35s cubic-bezier(0.34, 2, 0.64, 1);

.badge-show-leave-active
  transition transform .25s ease

.badge-show-enter,
.badge-show-leave-to
  transform scale(0)
</style>
