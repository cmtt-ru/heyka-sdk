<template>
  <div class="auth">
    <div class="auth__cover">
      <img src="./img/auth-cover.jpg">
    </div>

    <div class="auth__body">
      <div class="auth__body__wrapper">
        <div class="auth__header">
          <p
            v-if="inviteCode"
            class="l-mt-12"
            style="position: absolute"
          >
            {{ texts.header.workspace }}
          </p>

          <ui-button
            v-if="$route.meta.depth > 1"
            :type="9"
            size="small"
            @click="backHandler"
          >
            <svg-icon name="arrow-down" />
            {{ texts.header.back }}
          </ui-button>
        </div>

        <div class="auth__form">
          <transition :name="transitionName">
            <router-view @go-back="backHandler" />
          </transition>
        </div>

        <div class="auth__footer">
          <p>
            {{ texts.footer.privacy }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import UiButton from '@components/UiButton';
import { authFileStore } from '@/store/localStore';

export default {
  components: {
    UiButton,
  },

  data() {
    return {
      transitionName: '',
      inviteCode: null,
    };
  },

  computed: {
    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('auth');
    },
  },

  watch: {
    $route(to, from) {
      this.transitionName = to.meta.depth > from.meta.depth ? 'next' : 'prev';
    },
  },

  mounted() {
    if (!IS_ELECTRON) {
      const inviteCode = this.$route.query.invite;

      if (inviteCode) {
        this.inviteCode = inviteCode;

        authFileStore.set('inviteCode', inviteCode);

        window.onbeforeunload = () => {
          authFileStore.set('inviteCode', null);
        };
      }
    }
  },

  methods: {
    /**
     * Back button handler
     * @returns {void}
     */
    backHandler() {
      if (window.history.length > 2) {
        this.$router.go(-1);
      } else {
        this.$router.push({ name: 'auth' });
      }
    },
  },
};
</script>

<style lang="stylus">
  @import '~@styles/global.styl';

  .auth
    display flex
    height 100%
    overflow hidden
    justify-content center
    font-size 12px
    line-height 1.5

    @media $desktop
      border-radius 10px
      box-shadow 0 2px 6px rgba(0, 0, 0, 0.12)
      width 520px

    @media $mobile
      height 520px
      width 100%

    &__cover
      width 220px

      img
        display block
        width 100%

      @media $mobile
        display none

    &__body
      display flex
      width 300px
      justify-content center

      &__wrapper
        position relative
        display flex
        width 268px
        flex-direction column
        overflow hidden

    &__header
      height 80px

      .ui-button
        margin-top 35px
        margin-left -4px

      .icon--arrow-down
        transform rotate(90deg)
        width 20px
        height 20px

    &__footer
      height 65px
      color var(--new-UI-04)

    &__form
      position relative
      flex 1

      h1
        font-size 26px
        font-weight 700
        line-height 1.6

  /* Used in child components */
  .auth-page
    position absolute
    width 100%
    will-change transform

    h1
      font-size 26px
      font-weight 700
      line-height 1.6
      margin-bottom 16px

  .ui-button--9
    font-weight normal
    font-size 12px

  /* Page transitions */
  $animation-duration = 350ms
  .next-leave-to
    animation leaveToLeft $animation-duration both cubic-bezier(0.165, 0.84, 0.44, 1)

  .next-enter-active
    transform translateX(100%)

  .next-enter-to
    animation enterFromRight $animation-duration both cubic-bezier(0.165, 0.84, 0.44, 1)
    transform translateX(100%)

  .prev-leave-to
    animation leaveToRight $animation-duration both cubic-bezier(0.165, 0.84, 0.44, 1)

  .prev-enter-active
    transform translateX(-100%)

  .prev-enter-to
    animation enterFromLeft $animation-duration both cubic-bezier(0.165, 0.84, 0.44, 1)

  @keyframes leaveToLeft {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-100%);
    }
  }

  @keyframes enterFromLeft {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
  }

  @keyframes leaveToRight {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(100%);
    }
  }

  @keyframes enterFromRight {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }

</style>
