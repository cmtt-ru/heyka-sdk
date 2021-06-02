<template>
  <div
    :key="mediaState.microphone + channelId"
    v-popover.mouse.right.left.click="{name: 'UserInChannel', data: {userId: user.id, microphone: mediaState.microphone, channelId}}"
    class="user"
  >
    <avatar
      class="user__avatar"
      :size="24"
      :user-id="user.id"
      :onair="mediaState.speaking && mediaState.microphone"
    />

    <div
      :key="user.name"
      v-textfade
      class="user__name"
    >
      {{ user.name }}
    </div>

    <div class="user__statuses">
      <svg-icon
        v-for="icon in iconArray"
        :key="icon"
        class="user__statuses__icon"
        :name="icon"
        size="small"
      />
      <svg-icon
        v-if="getHandUpStatusByUserId(user.id)"
        class="user__statuses__icon user__statuses__icon--blue"
        name="hand-up"
        size="small"
      />
    </div>

    <ui-button
      v-if="mediaState.screen"
      v-stop-propagation
      :disabled="!amIInChannel"
      class="user__sharing"
      :type="7"
      size="small"
      icon="screencast"
      @click="expandHandler"
    />

    <div class="user__aqi">
      <connection-indicator :status="audioQualityStatus(user.id)" />
    </div>
  </div>
</template>

<script>
import Avatar from '@components/Avatar';
import UiButton from '@components/UiButton';
import ConnectionIndicator from '@components/ConnectionIndicator';
import broadcastActions from '@sdk/classes/broadcastActions';
import broadcastEvents from '@sdk/classes/broadcastEvents';
import { mapGetters } from 'vuex';

export default {
  components: {
    Avatar,
    UiButton,
    ConnectionIndicator,
  },
  props: {
    /**
     * User info (id, name, avatar, statuses)
     */
    user: {
      type: Object,
      default: () => {},
    },

    /**
     * User media state
     */
    mediaState: {
      type: Object,
      default: () => {},
    },

    /**
     * Channel id
     */
    channelId: {
      type: String,
      default: null,
    },

  },
  data() {
    return {

    };
  },
  computed: {
    ...mapGetters({
      userAvatar: 'users/getUserAvatarUrl',
      audioQualityStatus: 'channels/getAudioQualityStatusByUserId',
      getHandUpStatusByUserId: 'channels/getHandUpStatusByUserId',
    }),

    /**
     * Prepare status icons
     * @returns {array} array of small icons with statuses
     */
    iconArray() {
      const icons = [];

      if (this.mediaState.microphone === false) {
        icons.push('mic-off');
      }

      if (this.mediaState.speakers === false) {
        icons.push('headphones-off');
      }

      return icons;
    },

    /**
     * Am I in channel
     * @returns {boolean}
     */
    amIInChannel() {
      return this.$store.getters['me/getSelectedChannelId'] === this.channelId;
    },

  },

  methods: {
    expandHandler() {
      broadcastActions.dispatch('openGrid');
      broadcastEvents.dispatch('grid-expand', this.user.id);
    },
  },

};
</script>

<style lang="stylus" scoped>
.user
    display flex
    flex-direction row
    justify-content flex-start
    align-items center
    padding 6px
    width 100%
    border-radius 6px

    &:hover,
    &.context-menu--opened
        background var(--Background-darkgrey)

    &__avatar-wrapper
      position relative

    &__avatar
        flex-shrink 0

    &__name
        padding-left 8px
        flex-shrink 2
        white-space nowrap
        overflow hidden

    &__statuses
        flex-shrink 0
        margin-right auto
        padding-right 4px

        &__icon
            margin-left 8px
            color var(--Text-secondary)

            &--blue
              color var(--UI-active)

    &__sharing
        flex-shrink 0
        order 2
        color var(--UI-active)

    &__aqi
      display block
      width 28px
      height 12px
</style>
