<template>
  <router-link
    :to="'/main-window/workspace/channel/' + channel.id"
    class="channel"
    :class="{'channel--top': topChannel}"
  >
    <svg-icon
      class="channel__type"
      :name="dynamicIcon.name"
      :color="dynamicIcon.color"
      width="20"
      height="20"
    />

    <div class="channel__content">
      <div class="channel__name-wrapper">
        <div
          v-textfade
          class="channel__name"
        >
          {{ channel.name }}
        </div>
        <ui-button
          v-popover.click="{name: 'Channel', data: {id: channel.id}, permissions: $permissions.editChannel(channel.id)}"
          :type="7"
          class="channel__more"
          size="small"
          height="20"
          icon="more"
          @click.native.prevent
        />
      </div>

      <div
        v-show="users.length"
        class="channel__users"
      >
        <div class="channel__users__avatars">
          <avatar
            v-for="person in users"
            :key="person.id"
            :guest="person.role === 'guest'"
            :user-id="person.id"
            :image="userAvatar(person.id, 12)"
            :size="12"
          />
        </div>
        <div
          v-if="extraUsers"
          class="channel__users__more"
        >
          +{{ extraUsers }}
        </div>
      </div>
    </div>
  </router-link>
</template>

<script>
import Avatar from '@components/Avatar';
import UiButton from '@components/UiButton';
import { mapGetters } from 'vuex';

const ANIM_TIME = 1000; // must be higher than in css in Sidebar.vue (include API time)

const ICON_MAP = {
  public: 'channel',
  publicOnline: 'channelOnAir',
  private: 'lock',
  temp: 'clock',
  default: 'channel',
};
const MAX_USERS = 8;

export default {
  components: {
    Avatar,
    UiButton,
  },
  props: {
    /**
     * Object with full channel info
     */
    channel: {
      type: Object,
      default: function () {
        return {};
      },
    },
    /**
     * Whether channel is "top-selected"
     * (just for smooth connect-to-channel-animations)
     */
    topChannel: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      duringAnimation: false,
      animTimeout: null,
    };
  },

  computed: {
    ...mapGetters({
      myId: 'me/getMyId',
      me: 'myInfo',
      userAvatar: 'users/getUserAvatarUrl',
      animationChannel: 'app/getAnimationChannel',
    }),

    /**
     * Get pseudo-selected channel for faster bubbling animation
     * @returns {object} - channel
     */
    selectedChannel() {
      const selectedChannelId = this.$store.state.app.animationChannel || '';

      return this.$store.getters['channels/getChannelById'](selectedChannelId);
    },

    /**
     * Get users array
     * @returns {array} array of users
     */
    users() {
      const users = this.$store.getters.getUsersByChannel(this.channel.id).map(u => u.user);

      if (this.topChannel) {
        return [this.me.user, ...users.filter((user) => user.id !== this.myId)];
      } else if (!this.topChannel && this.duringAnimation) {
        return users.filter((user) => user.id !== this.myId);
      } else {
        return users;
      }
    },

    /**
     * Determine if people are talking in a channel
     * @returns {boolean}
     */
    isChannelActive() {
      const peopleTalking = this.users.filter((user) => user.microphone).length;

      return !!peopleTalking;
    },

    /**
     * Show icon corresponding to channel status
     * @returns {string} name of correct icon
     */
    dynamicIcon() {
      if (this.channel.isPrivate && !this.channel.isTemporary) {
        return {
          name: ICON_MAP['private'],
          color: 'var(--new-UI-01)',
        };
      } else if (this.channel.isPrivate && this.channel.isTemporary) {
        return {
          name: ICON_MAP['temp'],
          color: 'var(--new-UI-01)',
        };
      } else {
        if (this.topChannel) {
          return {
            name: ICON_MAP['public'],
            color: 'var(--new-signal-02)',
          };
        } else {
          return {
            name: ICON_MAP['public'],
            color: 'var(--new-UI-01)',
          };
        }
      }
    },

    /**
     * Show "+x" after "MAX_USERS" amount of avatars
     * @returns {number} x in "+x"
     */
    extraUsers() {
      if (this.channel.users.length > MAX_USERS) {
        return this.channel.users.length - MAX_USERS;
      }

      return false;
    },

    /**
     * Return true if this channel is currently opened
     * @returns {boolean}
     */
    isSelected() {
      return this.$route.params.id === this.channel.id;
    },
  },

  watch: {
    animationChannel() {
      this.duringAnimation = true;
      clearTimeout(this.animTimeout);
      this.animTimeout = setTimeout(() => {
        this.duringAnimation = false;
      }, ANIM_TIME);
    },
  },

  methods: {
    /**
     * Dummy popover creation
     * @returns {void}
     */
    moreHandler() {
      this._notImplemented();
    },
  },

};
</script>

<style lang="stylus" scoped>
.router-link-active
  background-color var(--new-UI-07)

.channel
  padding 4px 0
  margin 2px 0
  width 100%
  border-radius 6px
  display flex
  flex-direction row
  align-items flex-start
  justify-content flex-start

  &:hover
    background-color var(--new-UI-07)

    & .channel__more
      visibility visible

  &:active
    background-color var(--new-UI-08)

  &--top
    background-color var(--new-UI-09)
    box-shadow var(--new-shadow-02)

  &__type
    margin 0 8px 0 6px
    display flex
    flex-shrink 0

  &__name-wrapper
    display flex
    flex-direction row
    align-items center
    justify-content space-between
    width 100%

  &__name
    width 134px
    height 16px
    box-sizing border-box
    line-height 16px
    margin 2px 0

  &__more
    color var(--new-UI-04)
    margin 0 4px
    flex-shrink 0
    visibility hidden

    &:hover
      background-color var(--new-UI-07)

  &__users
    height 12px
    margin 2px 0
    display flex
    flex-direction row
    align-items center

    &__avatars
      max-width 124px
      overflow hidden
      display flex
      flex-direction row

      & .avatar
        margin-right 4px
        flex-shrink 0

    &__more
      font-size 12px
      margin-left 4px
      color var(--new-UI-03)

</style>
