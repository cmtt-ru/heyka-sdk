<template>
  <modal :id="id">
    <template #header>Deleting user</template>
    <template #body>Are you sure you want to delete user {{user.name}}?</template>
    <template #buttons>
            <ui-button
        :type="1"
        wide
        submit
        size="large"
      >
        CANCEL
      </ui-button>
            <ui-button
        :type="1"
        wide
        submit
        size="large"
      >
        DELETE
      </ui-button>
    </template>
  </modal>
</template>

<script>
import Modal from '@components/Modal';
import UiButton from '@components/UiButton';
import { mapGetters } from 'vuex';
//import broadcastActions from '@sdk/classes/broadcastActions';

export default {
  components: {
    Modal,
    UiButton,
  },

  props: {
    id:{
      type: String,
      required: true,
    },

    /**
     * User ID
     */
    userId: {
      type: String,
      default: null,
    },
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
      return this.$t('popover.griduser');
    },

    /**
     * Get current user
     * @returns {object}
     */
    user(){
      return this.getUserById(userId);
    }
  },

  methods: {

    /**
     * Yes click handler
     * @returns {void}
     */
    deleteHandler() {
      //broadcastActions.dispatch('users/muteForAll', this.userId);
    }
  },
};
</script>

<style lang="stylus" scoped>

</style>
