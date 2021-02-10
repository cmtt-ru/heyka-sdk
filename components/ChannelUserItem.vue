<template>
  <div
    :key="user.microphone + channelId"
    v-popover.mouse.click="{name: 'UserInChannel', data: {userId: user.id, microphone: user.microphone, channelId}}"
    class="user"
  >
    <avatar
      class="user__avatar"
      :image="userAvatar(user.id, 24)"
      :size="24"
      :user-id="user.id"
      :mic="user.microphone"
      :onair="user.speaking"
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
    </div>

    <ui-button
      v-if="user.screen"
      v-stop-propagation
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

const ICON_MAP = {
  mic: 'mic-off',
  headphones: 'headphones-off',
};

export default {
  components: {
    Avatar,
    UiButton,
    ConnectionIndicator,
  },
  props: {
    /**
     * Object with full user info (id, name, avatar, statuses)
     */
    user: {
      type: Object,
      default: function () {
        return {};
      },
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
    }),

    /**
     * Prepare status icons
     * @returns {array} array of small icons with statuses
     */
    iconArray() {
      const icons = [];

      if (this.user.microphone === false) {
        icons.push(ICON_MAP['mic']);
      }

      if (this.user.speakers === false) {
        icons.push(ICON_MAP['headphones']);
      }

      return icons;
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
        background-color var(--item-bg-hover)

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
            margin-left 6px
            color var(--new-UI-03)

    &__sharing
        flex-shrink 0
        order 2
        color var(--color-2)

    &__aqi
      display block
      width 28px
      height 12px
</style>
