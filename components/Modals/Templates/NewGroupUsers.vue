<template>
  <pseudo-popup
    ref="pseudoPopup"
    class="modal-wrapper"
    close-popover
  >
    <template #custom-header>
      <div
        class="header"
      >
        <svg-icon
          v-if="data.backIcon"
          name="back"
          width="20"
          height="20"
          @click.native="$emit('reject')"
        />
        <div v-textfade>
          {{ data.header }}
        </div>
      </div>
      <div class="user-search__wrapper">
        <ui-input
          v-model="filterKey"
          icon="search"
          :placeholder="$t('techTexts.search')"
          class="user-search"
        />
      </div>
    </template>

    <template #body>
      <div class="select-all__wrapper">
        <div
          v-if="!selectedUsers.length"
          class="select-all"
          @click="selectAllUsers"
        >
          {{ $t('techTexts.selectAll') }}
        </div>
        <div
          v-else
          class="select-all select-all--deselect"
          @click="deselectAllUsers"
        >
          {{ $t('techTexts.deselectAll') }}
        </div>
      </div>

      <placeholder
        v-if="!workspaceUsers.length"
        class="users-placeholder"
        avatar
        right-button
        :height="48"
        :gap="6"
      />

      <list
        ref="userList"
        v-model="filteredUsers"
        class="user-list"
        selectable
        :filter-by="filterKey"
        :items="workspaceUsers"
        filter-key="name"
        @multipick="selectUser"
      >
        <list-item
          v-for="user in filteredUsers"
          :key="user.id"
          :similarity="user.similarity"
          :select-data="user"
          button
          class="user"
        >
          <avatar
            class="user__avatar"
            :image="avatarUrl(user, 32)"
            :user-id="user.id"
            :size="32"
          />

          <div
            v-textfade
            class="user__name"
          >
            {{ user.name }}
          </div>
          <svg-icon
            class="user__check"
            name="check"
            width="20"
            height="20"
          />
        </list-item>
      </list>
    </template>

    <template #footer>
      <ui-button
        :type="1"
        :disabled="!selectedUsers.length"
        size="large"
        wide
        class="footer-button"
        @click="$emit('confirm', selectedUsers)"
      >
        {{ $tc("modal.addGroup.addUsers", selectedUsers.length) }}
      </ui-button>
    </template>
  </pseudo-popup>
</template>

<script>
import UiButton from '@components/UiButton';
import { UiInput } from '@components/Form';
import { List, ListItem } from '@components/List';
import Avatar from '@components/Avatar';
import { mapGetters } from 'vuex';
import PseudoPopup from '@components/PseudoPopup';
import Placeholder from '@components/Placeholder';

import { getUserAvatarUrl } from '@libs/image';

export default {
  components: {
    UiButton,
    UiInput,
    List,
    ListItem,
    Avatar,
    PseudoPopup,
    Placeholder,
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

  data() {
    return {
      workspaceUsers: [],
      filteredUsers: [],
      selectedUsers: [],
      filterKey: '',
    };
  },

  computed: {

    ...mapGetters({
      getWorkspaceById: 'workspaces/getWorkspaceById',
    }),

    /**
     * Workspace id from route
     * @returns {string}
     */
    workspaceId() {
      return this.$route.params.workspaceId;
    },
  },

  mounted() {
    this.loadUsers();
  },

  methods: {
    /**
     * Load users for selected workspace
     * @returns {Promise<void>}
     */
    async loadUsers() {
      const workspaceData = await this.$API.admin.getUsers(this.workspaceId);

      if (workspaceData) {
        this.workspaceUsers = workspaceData.users
          .filter(user => !user.temporaryUser)
          .filter(el => !this.data.joinedUsers.find(user => user.id === el.id));
      }
    },

    selectAllUsers() {
      this.$refs.userList.selectAll();
    },

    deselectAllUsers() {
      this.$refs.userList.deselectAll();
    },

    selectUser(data) {
      this.selectedUsers = data;
    },

    /**
     * Avatar url
     */
    avatarUrl: getUserAvatarUrl,

  },

};
</script>

<style lang="stylus" scoped>
@import 'default.styl'
.modal-wrapper
  padding 0
  border-radius 10px
  height calc(100vh - 24px)

  & .header
    background-color transparent
    width 100%
    padding 24px 70px 24px 30px
    box-sizing border-box
    height 70px
    margin-bottom 0
    display flex
    flex-direction row
    align-items center
    overflow hidden

    @media $mobile
      height 52px
      padding 12px 60px 12px 20px
      margin-bottom 11px

    & .icon
      flex-shrink 0
      color var(--new-UI-01)
      margin-right 16px
      cursor pointer

/deep/ .pseudo-popup__header
  background-color transparent
  flex-direction column

/deep/ .pseudo-popup__body
  padding 0 32px

  @media $mobile
     padding 0 20px

/deep/ .pseudo-popup__footer
  background-color transparent
  flex-direction column
  padding 16px 32px 32px

  @media $mobile
     padding 16px 20px

.user-search__wrapper
  padding 0 32px 17px
  width 100%
  box-sizing border-box

  @media $mobile
     padding 0 20px 12px

/deep/ .input
  padding-left 54px

/deep/ .input__icon
  padding-left 10px
  width 24px
  height 24px

.select-all
  font-weight 500
  font-size 16px
  line-height 18px
  color var(--new-UI-01)
  cursor pointer
  margin 0 0 0 auto

  &--deselect
    color var(--new-signal-03)

  &__wrapper
    margin-bottom 12px
    width 100%
    display flex
    flex-direction row-reverse

.users-placeholder
  padding 0 17px 0 12px

.user
  padding 11px 12px
  display flex
  flex-direction row
  align-items center
  border-radius 6px
  cursor pointer

  &:hover
    background-color var(--new-UI-06)

  &__check
    margin 0 5px
    padding 1px
    box-sizing border-box
    flex-shrink 0
    color transparent
    border 1px solid var(--new-UI-05)
    border-radius 50%

  &.list-item--selected
    background-color initial

    &:hover
      background-color var(--new-UI-06)

    & .user__check
      background-color var(--new-UI-01)
      color var(--new-UI-09)
      padding 2px
      border none

  &__avatar
    margin-right 12px
    flex-shrink 0

  &__name
    flex-grow 1
    font-weight 500
    font-size 18px
    line-height 16px

    @media $mobile
      font-size 16px
</style>
