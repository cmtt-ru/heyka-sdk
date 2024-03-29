<template>
  <div class="auth-page">
    <h1>{{ texts.title }}</h1>

    <ui-form
      @submit="loginHandler()"
    >
      <div
        v-if="IS_DEV"
        class="dev-server"
      >
        {{ texts.devServer }}
      </div>

      <ui-input
        v-model="login.email"
        class="l-mb-12"
        placeholder="example@mail.com"
        email
        required
      />

      <ui-input
        v-model="login.password"
        class="l-mb-10"
        required
        type="password"
        placeholder="******"
        :minlength="8"
        :maxlength="120"
        enter-submit
      />

      <router-link
        :to="{name:'auth-email-reset', params: {login: login.email}}"
        class="l-mb-24 reset-pass-button"
      >
        {{ texts.reset }}
      </router-link>

      <ui-button
        :type="1"
        :loading="loginInProgress"
        size="large"
        wide
        submit
      >
        {{ texts.login }}
      </ui-button>

      <div class="info">
        <div class="info__text">
          {{ texts.newMember }}
        </div>
        <div
          class="info__link"
          @click="signupHandler"
        >
          {{ texts.signup }}
        </div>
      </div>
    </ui-form>
  </div>
</template>

<script>
import UiButton from '@components/UiButton';
import { UiForm, UiInput } from '@components/Form';
import { authFileStore, heykaStore } from '@/store/localStore';
import { WEB_URL } from '@sdk/Constants';
import { errorMessages } from '@api/errors/types';
import signin from '@api/auth/signin';
import notify from '@libs/notify';
import { GA_EVENTS, trackEvent } from '@libs/analytics';

export default {
  components: {
    UiButton,
    UiForm,
    UiInput,
  },

  data() {
    return {
      login: {
        email: '',
        password: IS_DEV ? 'heyka-password' : '',
      },
      loginInProgress: false,
      IS_DEV,
    };
  },

  computed: {
    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('auth.email');
    },

    /**
     * Get notification texts from I18n-locale file
     * @returns {object}
     */
    notifTexts() {
      return this.$t('notifications.login');
    },
  },

  async created() {
    const email = await heykaStore.get('loginEmail', '');

    this.$set(this.login, 'email', email);
  },

  methods: {
    async loginHandler() {
      this.loginInProgress = true;

      try {
        await signin({ credentials: this.login });

        const inviteCode = authFileStore.get('inviteCode');

        if (inviteCode) {
          trackEvent(GA_EVENTS.inviteToWorkspace);
        }

        trackEvent(GA_EVENTS.login('Email'));

        if (this.notifyClose) {
          this.notifyClose();
          this.notifyClose = null;
        }

        if (IS_ELECTRON) {
          heykaStore.set('loginEmail', this.login.email);
          await this.$store.dispatch('initial');
        } else {
          heykaStore.set('loginEmail', this.login.email);

          window.localStorage.setItem('authSuccess', 'true'); // for modal window in landing
          await this.$router.push({ name: 'auth-success' }).catch(() => {});
        }
      } catch (err) {
        if (
          err.response.data.message === errorMessages.emailOrPasswordAreInvalid ||
          err.response.data.message === errorMessages.invalidRequestPayloadInput
        ) { // ? maybe not needed
          if (this.notifyClose) {
            this.notifyClose();
            this.notifyClose = null;
          }

          this.notifyClose = await notify('notifications.login.wrongPass', { icon: 'warning' });
        }
      } finally {
        this.loginInProgress = false;
      }
    },

    /**
     * Signup handler
     * @returns {void}
     */
    async signupHandler() {
      if (IS_ELECTRON) {
        window.open(`${WEB_URL}/auth/email/signup`);
      } else {
        this.$router.push({ name: 'auth-email-signup' });
      }
    },
  },
};
</script>

<style lang="stylus" scoped>
  .info
    display flex
    flex-direction row
    margin-top 32px
    color var(--Text-secondary)

    &__link
      margin-left 8px
      color var(--UI-active)
      cursor pointer

  .reset-pass-button
    line-height 18px
    height 18px
    color var(--UI-active)
    display inline-block

    &:hover
      color var(--UI-active-hover)
    &:active
      color var(--UI-active-active)

</style>
