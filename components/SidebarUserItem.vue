<template>
  <router-link
    :to="'/main-window/workspace/user/'+user.id"
    class="user"
    :class="{'user--offline': isOffline}"
  >
    <avatar
      class="user__avatar"
      :user-id="user.id"
      :status="isStrangeStatus"
      :size="20"
    />

    <div
      :key="user.name"
      v-textfade
      class="user__name"
    >
      {{ user.name }}
    </div>
  </router-link>
</template>

<script>
import Avatar from '@components/Avatar';
import { mapGetters } from 'vuex';

export default {
  components: {
    Avatar,
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
  },

  computed: {
    ...mapGetters({
      userAvatar: 'users/getUserAvatarUrl',
    }),

    /**
     * Return true if this user is currently offline
     * @returns {boolean}
     */
    isOffline() {
      return this.user.onlineStatus === 'offline';
    },

    /**
     * We need to display user status if he is not online or oflline (idle, busy, etc.)
     * @returns {string|null}
     */
    isStrangeStatus() {
      return this.user.onlineStatus !== 'online' && this.user.onlineStatus !== 'offline';
    },

    /**
     * Return true if this user's page is currently opened
     * @returns {boolean}
     */
    isSelected() {
      return this.$route.params.id === this.user.id;
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

.user
  padding 6px
  margin 3px 0
  width 100%
  border-radius 6px
  display flex
  flex-direction row
  justify-content flex-start
  align-items center

  &:hover
    background var(--Background-darkgrey-hover)
    & .user__more
      display inline-flex

  &:active
    background var(--Background-darkgrey-active)

  &__avatar
    flex-shrink 0

  &__name
    padding-left 8px
    flex-grow 1
    line-height 16px

  &__more
    margin-left 4px
    display none
    flex-shrink 0
    color var(--Text-secondary)
</style>
