<template>
  <div class="auth">
    <div class="auth__cover">
      <img :src="imgSrc">
    </div>

    <div class="auth__body">
      <div class="auth__body__wrapper">
        <div class="auth__header">
          <p
            v-if="inviteCode"
            class="l-mt-12"
            style="position: absolute"
          >
            {{ subheader }}
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
      subheader: null,
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

    imgSrc() {
      if (this.$themes.getCurrentTheme() === 'light') {
        return require('./img/auth-cover.jpg');
      }

      return require('./img/auth-cover-dark.png');
    },

    /**
     * Workspace invite code
     * @returns {string | (string | null)[]}
     */
    inviteCode() {
      return this.$route.query.invite;
    },
  },

  watch: {
    $route(to, from) {
      this.transitionName = to.meta.depth > from.meta.depth ? 'next' : 'prev';
    },
  },

  async mounted() {
    if (this.$route.query.darkTheme) {
      this.$themes.manualSetTheme('dark');
    }

    if (!IS_ELECTRON) {
      if (this.inviteCode) {
        authFileStore.set('inviteCode', this.inviteCode);
        window.onbeforeunload = () => {
          authFileStore.set('inviteCode', null);
        };

        try {
          const workspaceInfo = await this.$API.workspace.checkCode(this.inviteCode);

          this.subheader = `${this.texts.header.workspace} ${workspaceInfo.workspace.name}`;
          if (workspaceInfo.email) {
            authFileStore.set('loginEmail', workspaceInfo.email);
          }
        } catch (err) {

        }
      }
    }
  },
  // beforeDestroy() {
  //   this.$themes.manualSetTheme('light');
  // },

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
//@import '~@styles/global.styl';

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
    width 100%
    height 100vh

  &__cover
    width 220px

    img
      display block
      width 100%
      height 100%
      object-fit cover

  &__body
    display flex
    width 300px
    justify-content center

    &__wrapper
      position relative
      display flex
      width 268px
      padding 0 10px
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

@media screen and (max-width: 519px)
  .auth__cover
    display none

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
