<template>
  <router-link
    :to="'/main-window/workspace/channel/' + channel.id"
    class="channel"
    :class="{'channel--top': topChannel}"
    popover-add-class
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
      </div>

      <div
        v-show="users.length"
        class="channel__users"
      >
        <div class="channel__users__avatars">
          <avatar
            v-for="person in visibleUsers"
            :key="person.id"
            :user-id="person.id"
            :size="14"
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

    <div
      v-popover.click="{name: 'Channel', data: {id: channel.id}, permissions: $permissions.editChannel(channel.id)}"
      class="channel__more"
      @click.prevent.stop
    >
      <svg-icon
        name="more"
        size="medium"
      />
    </div>
  </router-link>
</template>

<script>
import Avatar from '@components/Avatar';
import { mapGetters } from 'vuex';

const ANIM_TIME = 1000; // must be higher than in css in Sidebar.vue (include API time)

const ICON_MAP = {
  public: 'channel',
  private: 'lock',
  temp: 'clock',
  default: 'channel',
};
const MAX_USERS = 5;

export default {
  components: {
    Avatar,
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

    visibleUsers() {
      return this.users.slice(0, MAX_USERS);
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
          color: 'var(--UI-active)',
        };
      } else if (this.channel.isPrivate && this.channel.isTemporary) {
        return {
          name: ICON_MAP['temp'],
          color: 'var(--UI-active)',
        };
      } else {
        if (this.topChannel) {
          return {
            name: ICON_MAP['public'],
            color: 'var(--UI-positive)',
          };
        } else {
          return {
            name: ICON_MAP['public'],
            color: 'var(--UI-active)',
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
  background var(--Background-darkgrey)

.channel
  padding 6px 0
  margin 3px 0
  width 100%
  border-radius 6px
  display flex
  flex-direction row
  align-items flex-start
  justify-content flex-start
  position relative

  &:hover, &.popover--opened
    background var(--Background-darkgrey-hover)

    & .channel__more
      visibility visible

  &:active
    background var(--Background-darkgrey-active)

  &--top
    background var(--Background-darkgrey)
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
    width 130px
    height 16px
    box-sizing border-box
    line-height 16px
    margin 1px 0 2px

  &__more
    position absolute
    top 0
    bottom 0
    right 0
    display inline
    width 32px
    box-sizing border-box
    margin-left -32px
    border-top-right-radius 6px
    border-bottom-right-radius 6px
    display flex
    flex-direction row
    justify-content center
    align-items flex-start
    visibility hidden

    &:hover,
    &.popover--opened
      background var(--UI-divider-2)
      visibility visible

    & svg
      padding-top 8px

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
      color var(--Text-secondary)

</style>
