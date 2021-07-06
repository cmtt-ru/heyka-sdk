<template>
  <div class="modal-wrapper-outer">
    <component
      :is="modal.name"

      :data="modal.data"
      @confirm="$emit('confirm', $event)"
      @reject="$emit('reject')"
      @close="$emit('close')"
    />
    <ui-button
      v-if="!noClose"
      :type="7"
      icon="close"
      class="modal-wrapper-outer__close"
      @click="$emit('close')"
    />
  </div>
</template>

<script>
import UiButton from '@components/UiButton';

const TEMPLATES_NO_CLOSE_BUTTON = [ 'EditImage' ];

export default {
  components: {
    UiButton,
    ConfirmDelete: () => import(/* webpackChunkName: "modals" */ './Templates/ConfirmDelete'),
    NewGroupName: () => import(/* webpackChunkName: "modals" */ './Templates/NewGroupName'),
    NewGroupUsers: () => import(/* webpackChunkName: "modals" */ './Templates/NewGroupUsers'),
    EditInfo: () => import(/* webpackChunkName: "modals" */ './Templates/EditInfo'),
    SignIn: () => import(/* webpackChunkName: "modals" */ './Templates/SignIn'),
    ConfirmJoin: () => import(/* webpackChunkName: "modals" */ './Templates/ConfirmJoin'),
    EditImage: () => import(/* webpackChunkName: "modals" */ './Templates/EditImage'),
  },
  props: {
    /**
      * All modal data
    */
    modal: {
      type: Object,
      required: true,
    },
  },

  computed: {
    noClose() {
      if (TEMPLATES_NO_CLOSE_BUTTON.includes(this.modal.name)) {
        return true;
      }

      return false;
    },
  },

};
</script>

<style lang="stylus" scoped>

.modal-wrapper-outer
  background-color var(--new-bg-04)
  position relative
  border-radius 10px

  &__close
    position absolute
    top 20px
    right 20px
    color var(--new-UI-03)

    @media $mobile
      top 13px
      right 16px

</style>
