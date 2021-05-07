<template>
  <div class="auth-page">
    <h1>{{ texts.title }}</h1>

    <ui-form
      @submit="registerHandler()"
    >
      <ui-input
        v-model="newUser.name"
        class="l-mb-12"
        :placeholder="texts.name"
        :minlength="3"
        required
      />

      <ui-input
        v-model="newUser.email"
        class="l-mb-12"
        :placeholder="texts.email"
        email
        required
      />

      <ui-input
        v-model="newUser.password"
        required
        :minlength="8"
        :maxlength="120"
        type="password"
        class="l-mb-24"
        :placeholder="texts.password"
        enter-submit
      />

      <ui-button
        :type="1"
        wide
        submit
        size="large"
      >
        {{ texts.register }}
      </ui-button>
    </ui-form>
  </div>
</template>

<script>
import UiButton from '@components/UiButton';
import { UiForm, UiInput } from '@components/Form';
import { determineLocale } from '@sdk/translations/i18n';
import { authFileStore } from '@/store/localStore';

import { setTokens } from '@api/tokens';
import apiSignup from '@api/auth/signup';
import notify from '@libs/notify';

export default {
  components: {
    UiButton,
    UiForm,
    UiInput,
  },

  data() {
    return {
      newUser: {
        name: '',
        email: '',
        password: '',
        lang: '',
      },
    };
  },

  computed: {
    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('auth.signup');
    },
  },

  async created() {
    const email = await authFileStore.get('loginEmail', '');

    this.$set(this.newUser, 'email', email);
  },

  async mounted() {
    this.newUser.lang = await determineLocale();
  },

  methods: {
    async registerHandler() {
      try {
        const data = { ...this.newUser };

        if (authFileStore.get('inviteCode')) {
          data.inviteCode = authFileStore.get('inviteCode');
        }
        const res = await apiSignup({ user: data });

        setTokens(res.data.credentials);

        console.log(res);

        if (authFileStore.get('inviteCode')) {
          authFileStore.set('inviteCode', null);
          this.$router.push({ name: 'auth-success' });

          return;
        }

        this.$router.push({ name: 'auth-email-signup-success' });
      } catch (err) {
        if (err.response.data.message) {
          notify(err.response.data.message, { icon: 'warning' });
        }
        console.log('ERROR:', err);
      }
    },
  },
};
</script>

<style lang="stylus" scoped>
  .info
    display flex
    flex-direction row
    margin-top 24px

    &__link
      margin-left 8px
      color var(--new-UI-01)
      cursor pointer

</style>
